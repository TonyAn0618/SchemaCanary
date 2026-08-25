import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { OperationError } from "../core/errors.js";
import { inspectSchemaFile } from "../core/inspect-schema.js";
import { renderReport, type ReportFormat } from "../reporting/render.js";
import { writeReportFile } from "../reporting/write-report.js";
import { TOOL_VERSION } from "../version.js";

const HELP = `SchemaCanary ${TOOL_VERSION}

Usage:
  schemacanary inspect <schema-file> [options]

Commands:
  inspect    Validate and identify a local JSON Schema without network access.

Options:
  -f, --format <terminal|json|markdown>  Report format (default: terminal)
  -o, --output <file>                    Write to a file instead of stdout
      --force                            Replace an existing output file
  -h, --help                             Show help
  -V, --version                          Show version
`;

const INSPECT_OPTIONS = {
  format: { type: "string", short: "f", default: "terminal" },
  output: { type: "string", short: "o" },
  force: { type: "boolean", default: false },
  help: { type: "boolean", short: "h", default: false },
  version: { type: "boolean", short: "V", default: false },
} as const;

export interface CliRuntime {
  cwd: string;
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
  now: () => Date;
  toolVersion: string;
  debug: boolean;
}

function defaultRuntime(): CliRuntime {
  return {
    cwd: process.cwd(),
    stdout: process.stdout,
    stderr: process.stderr,
    now: () => new Date(),
    toolVersion: TOOL_VERSION,
    debug: process.env["SCHEMACANARY_DEBUG"] === "1",
  };
}

function usageError(message: string): OperationError {
  return new OperationError("CLI_USAGE_ERROR", message);
}

function isReportFormat(value: string): value is ReportFormat {
  return value === "terminal" || value === "json" || value === "markdown";
}

function parseInspectArgs(args: string[]) {
  try {
    return parseArgs({
      args,
      allowPositionals: true,
      strict: true,
      options: INSPECT_OPTIONS,
    });
  } catch (error) {
    throw usageError((error as Error).message);
  }
}

async function runInspect(args: string[], runtime: CliRuntime): Promise<number> {
  const parsed = parseInspectArgs(args);
  const help = parsed.values["help"];
  const version = parsed.values["version"];
  const output = parsed.values["output"];
  const force = parsed.values["force"];
  const formatValue = parsed.values["format"];

  if (help) {
    runtime.stdout.write(HELP);
    return 0;
  }
  if (version) {
    runtime.stdout.write(`${runtime.toolVersion}\n`);
    return 0;
  }
  if (parsed.positionals.length !== 1) {
    throw usageError("The inspect command requires exactly one schema file.");
  }

  const inputPath = parsed.positionals[0] as string;
  if (!isReportFormat(formatValue)) {
    throw usageError(`Unsupported report format: ${formatValue}`);
  }
  if (force && output === undefined) {
    throw usageError("--force can only be used together with --output.");
  }
  if (output !== undefined && resolve(runtime.cwd, inputPath) === resolve(runtime.cwd, output)) {
    throw new OperationError(
      "OUTPUT_INPUT_CONFLICT",
      "The output path cannot be the same as the input schema, even with --force.",
    );
  }

  const report = await inspectSchemaFile(inputPath, {
    cwd: runtime.cwd,
    now: runtime.now,
    toolVersion: runtime.toolVersion,
  });
  const rendered = renderReport(report, formatValue);

  if (output === undefined) {
    runtime.stdout.write(rendered);
  } else {
    await writeReportFile(output, rendered, {
      cwd: runtime.cwd,
      force,
      protectedInputPath: resolve(runtime.cwd, inputPath),
    });
  }
  return report.outcome === "valid" ? 0 : 1;
}

export async function runCli(
  args: string[],
  suppliedRuntime: Partial<CliRuntime> = {},
): Promise<number> {
  const runtime = { ...defaultRuntime(), ...suppliedRuntime };

  try {
    const command = args[0];
    if (command === "--help" || command === "-h") {
      runtime.stdout.write(HELP);
      return 0;
    }
    if (command === "--version" || command === "-V") {
      runtime.stdout.write(`${runtime.toolVersion}\n`);
      return 0;
    }
    if (command === undefined) {
      throw usageError("A command is required.");
    }
    if (command !== "inspect") {
      throw usageError(`Unknown command: ${command}`);
    }
    return await runInspect(args.slice(1), runtime);
  } catch (error) {
    if (error instanceof OperationError) {
      runtime.stderr.write(`SchemaCanary ${error.code}: ${error.message}\n`);
      return 2;
    }
    runtime.stderr.write("SchemaCanary INTERNAL_ERROR: An unexpected internal error occurred.\n");
    if (runtime.debug) {
      runtime.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    }
    return 70;
  }
}
