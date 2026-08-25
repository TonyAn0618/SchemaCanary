import { describe, expect, test } from "vitest";

import type { InspectReport } from "../src/core/types.js";
import { renderMarkdown, renderReport, renderTerminal } from "../src/reporting/render.js";

const report: InspectReport = {
  format: "schemacanary.inspect-report",
  formatVersion: "1.0.0",
  tool: { name: "schemacanary", version: "0.0.0-test" },
  command: "inspect",
  generatedAt: "2026-08-25T12:00:00.000Z",
  outcome: "invalid_schema",
  input: { kind: "file", path: "schema|sample.json", sizeBytes: 42, documentType: "object" },
  dialect: {
    declared: null,
    effective: "https://json-schema.org/draft/2020-12/schema",
    resolution: "defaulted",
  },
  canonical: {
    algorithm: "rfc8785-sha256-v1",
    digest: `sha256:${"a".repeat(64)}`,
    sizeBytes: 31,
  },
  validation: { json: "valid", jsonSchema: "invalid", scope: "meta-schema-only" },
  diagnostics: [
    {
      code: "SCHEMA_META_VALIDATION_ERROR",
      severity: "error",
      message: "required | must be an array",
      jsonPointer: "/required",
      keyword: "type",
    },
  ],
};

describe("report renderers", () => {
  test("JSON output contains only parseable report data", () => {
    expect(JSON.parse(renderReport(report, "json"))).toEqual(report);
  });

  test("terminal output communicates validation scope", () => {
    const output = renderTerminal(report);

    expect(output).toContain("[INVALID] schema|sample.json");
    expect(output).toContain("meta-schema-only");
    expect(output).not.toContain("\u001b[");
  });

  test("Markdown escapes table separators", () => {
    const output = renderMarkdown(report);

    expect(output).toContain("required \\| must be an array");
    expect(output).toContain("schema|sample.json");
  });
});
