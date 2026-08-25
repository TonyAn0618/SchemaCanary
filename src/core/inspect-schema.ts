import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js";

import { canonicalizeAndHash } from "./canonical.js";
import { readSchemaInput } from "./input.js";
import { parseStrictJson, StrictJsonError } from "./strict-json.js";
import type { Diagnostic, DocumentType, InspectReport, JsonValue } from "./types.js";

export const JSON_SCHEMA_2020_12 = "https://json-schema.org/draft/2020-12/schema";
export const INSPECT_REPORT_FORMAT_VERSION = "1.0.0";

export interface InspectOptions {
  cwd: string;
  now?: () => Date;
  toolVersion?: string;
}

function documentType(value: JsonValue): DocumentType {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  switch (typeof value) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    default:
      return "object";
  }
}

function normalizeDeclaredDialect(value: string): string {
  return value.endsWith("#") ? value.slice(0, -1) : value;
}

function diagnosticFromAjv(error: ErrorObject): Diagnostic {
  const diagnostic: Diagnostic = {
    code: "SCHEMA_META_VALIDATION_ERROR",
    severity: "error",
    message: error.message ?? "Schema does not satisfy the JSON Schema 2020-12 meta-schema.",
  };
  if (error.instancePath !== "") {
    diagnostic.jsonPointer = error.instancePath;
  }
  if (error.keyword !== "") {
    diagnostic.keyword = error.keyword;
  }
  return diagnostic;
}

function sortDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.sort((left, right) => {
    const leftKey = `${left.jsonPointer ?? ""}\u0000${left.code}\u0000${left.message}`;
    const rightKey = `${right.jsonPointer ?? ""}\u0000${right.code}\u0000${right.message}`;
    return leftKey.localeCompare(rightKey);
  });
}

function baseReport(
  displayPath: string,
  sizeBytes: number,
  now: () => Date,
  toolVersion: string,
): Omit<InspectReport, "outcome" | "dialect" | "canonical" | "validation" | "diagnostics"> {
  return {
    format: "schemacanary.inspect-report",
    formatVersion: INSPECT_REPORT_FORMAT_VERSION,
    tool: {
      name: "schemacanary",
      version: toolVersion,
    },
    command: "inspect",
    generatedAt: now().toISOString(),
    input: {
      kind: "file",
      path: displayPath,
      sizeBytes,
    },
  };
}

export async function inspectSchemaFile(
  inputPath: string,
  options: InspectOptions,
): Promise<InspectReport> {
  const now = options.now ?? (() => new Date());
  const toolVersion = options.toolVersion ?? "0.0.0";
  const input = await readSchemaInput(inputPath, options.cwd);
  const base = baseReport(input.displayPath, input.sizeBytes, now, toolVersion);

  let schema: JsonValue;
  try {
    schema = parseStrictJson(input.text);
  } catch (error) {
    if (!(error instanceof StrictJsonError)) {
      throw error;
    }
    return {
      ...base,
      outcome: "invalid_json",
      dialect: {
        declared: null,
        effective: null,
        resolution: "unavailable",
      },
      canonical: null,
      validation: {
        json: "invalid",
        jsonSchema: "not_checked",
        scope: "meta-schema-only",
      },
      diagnostics: [
        {
          code: error.code,
          severity: "error",
          message: error.message,
          line: error.line,
          column: error.column,
        },
      ],
    };
  }

  base.input.documentType = documentType(schema);
  const canonical = canonicalizeAndHash(schema);
  const canonicalReport: NonNullable<InspectReport["canonical"]> = {
    algorithm: "rfc8785-sha256-v1",
    digest: canonical.digest,
    sizeBytes: canonical.sizeBytes,
  };

  if (schema === null || (typeof schema !== "object" && typeof schema !== "boolean")) {
    return {
      ...base,
      outcome: "invalid_schema",
      dialect: {
        declared: null,
        effective: JSON_SCHEMA_2020_12,
        resolution: "defaulted",
      },
      canonical: canonicalReport,
      validation: {
        json: "valid",
        jsonSchema: "invalid",
        scope: "meta-schema-only",
      },
      diagnostics: [
        {
          code: "SCHEMA_INVALID_ROOT",
          severity: "error",
          message: "A JSON Schema document must be an object or a boolean.",
        },
      ],
    };
  }

  let declared: string | null = null;
  if (!Array.isArray(schema) && typeof schema === "object" && "$schema" in schema) {
    const dialectValue = schema["$schema"];
    if (typeof dialectValue === "string") {
      declared = dialectValue;
    }
  }

  if (declared !== null && normalizeDeclaredDialect(declared) !== JSON_SCHEMA_2020_12) {
    return {
      ...base,
      outcome: "unsupported_dialect",
      dialect: {
        declared,
        effective: null,
        resolution: "unsupported",
      },
      canonical: canonicalReport,
      validation: {
        json: "valid",
        jsonSchema: "unsupported_dialect",
        scope: "meta-schema-only",
      },
      diagnostics: [
        {
          code: "SCHEMA_UNSUPPORTED_DIALECT",
          severity: "error",
          message: `Declared dialect is not supported by this release: ${declared}`,
          jsonPointer: "/$schema",
          keyword: "$schema",
        },
      ],
    };
  }

  const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false });
  const valid = ajv.validateSchema(schema);
  const diagnostics = valid ? [] : sortDiagnostics((ajv.errors ?? []).map(diagnosticFromAjv));

  return {
    ...base,
    outcome: valid ? "valid" : "invalid_schema",
    dialect: {
      declared,
      effective: JSON_SCHEMA_2020_12,
      resolution: declared === null ? "defaulted" : "declared",
    },
    canonical: canonicalReport,
    validation: {
      json: "valid",
      jsonSchema: valid ? "valid" : "invalid",
      scope: "meta-schema-only",
    },
    diagnostics,
  };
}
