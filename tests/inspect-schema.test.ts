import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Ajv2020 } from "ajv/dist/2020.js";
import { afterEach, describe, expect, test } from "vitest";

import { inspectSchemaFile, JSON_SCHEMA_2020_12 } from "../src/core/inspect-schema.js";

const FIXED_DATE = new Date("2026-08-25T12:00:00.000Z");
const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "schemacanary-test-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

async function inspectText(source: string) {
  const cwd = await temporaryDirectory();
  await writeFile(join(cwd, "schema.json"), source, "utf8");
  return inspectSchemaFile("schema.json", {
    cwd,
    now: () => FIXED_DATE,
    toolVersion: "0.0.0-test",
  });
}

describe("inspectSchemaFile", () => {
  test("defaults an undeclared schema to JSON Schema 2020-12", async () => {
    const report = await inspectText('{"type":"object","properties":{"name":{"type":"string"}}}');

    expect(report.outcome).toBe("valid");
    expect(report.dialect).toEqual({
      declared: null,
      effective: JSON_SCHEMA_2020_12,
      resolution: "defaulted",
    });
    expect(report.canonical?.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(report.generatedAt).toBe(FIXED_DATE.toISOString());
  });

  test("accepts a boolean schema", async () => {
    const report = await inspectText("true");

    expect(report.outcome).toBe("valid");
    expect(report.input.documentType).toBe("boolean");
  });

  test("accepts an optional UTF-8 BOM", async () => {
    const report = await inspectText('\uFEFF{"type":"object"}');

    expect(report.outcome).toBe("valid");
  });

  test("reports meta-schema violations", async () => {
    const report = await inspectText('{"type":"object","required":"name"}');

    expect(report.outcome).toBe("invalid_schema");
    expect(report.validation.jsonSchema).toBe("invalid");
    expect(report.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_META_VALIDATION_ERROR",
        jsonPointer: "/required",
      }),
    );
  });

  test("reports malformed JSON without creating a canonical identity", async () => {
    const report = await inspectText('{"type":"object",}');

    expect(report.outcome).toBe("invalid_json");
    expect(report.canonical).toBeNull();
    expect(report.diagnostics[0]).toEqual(
      expect.objectContaining({
        code: "JSON_SYNTAX_ERROR",
        line: 1,
      }),
    );
  });

  test("reports an unsupported declared dialect without silently converting it", async () => {
    const report = await inspectText(
      '{"$schema":"http://json-schema.org/draft-07/schema#","type":"object"}',
    );

    expect(report.outcome).toBe("unsupported_dialect");
    expect(report.dialect.effective).toBeNull();
    expect(report.validation.jsonSchema).toBe("unsupported_dialect");
  });

  test("does not expose an absolute path outside the working directory", async () => {
    const inputDirectory = await temporaryDirectory();
    const cwd = await temporaryDirectory();
    const inputPath = join(inputDirectory, "private.schema.json");
    await writeFile(inputPath, '{"type":"object"}', "utf8");

    const report = await inspectSchemaFile(inputPath, {
      cwd,
      now: () => FIXED_DATE,
      toolVersion: "0.0.0-test",
    });

    expect(report.input.path).toBe("private.schema.json");
    expect(JSON.stringify(report)).not.toContain(inputDirectory);
  });

  test("every outcome conforms to the published report schema", async () => {
    const reportSchema = JSON.parse(
      await readFile(new URL("../schemas/inspect-report.v1.schema.json", import.meta.url), "utf8"),
    );
    const ajv = new Ajv2020({ strict: true });
    const validate = ajv.compile(reportSchema);
    const reports = await Promise.all([
      inspectText('{"type":"object"}'),
      inspectText('{"type":"object",}'),
      inspectText('{"required":"name"}'),
      inspectText('{"$schema":"http://json-schema.org/draft-07/schema#"}'),
    ]);

    for (const report of reports) {
      expect(validate(report), JSON.stringify(validate.errors)).toBe(true);
    }
  });
});
