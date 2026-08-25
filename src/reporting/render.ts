import type { Diagnostic, InspectReport } from "../core/types.js";

export type ReportFormat = "terminal" | "json" | "markdown";

function dialectLabel(report: InspectReport): string {
  if (report.dialect.resolution === "unavailable") {
    return "Unavailable (JSON could not be parsed)";
  }
  if (report.dialect.resolution === "unsupported") {
    return `${report.dialect.declared ?? "unknown"} (unsupported)`;
  }
  const suffix = report.dialect.resolution === "defaulted" ? " (defaulted)" : "";
  return `JSON Schema 2020-12${suffix}`;
}

function diagnosticLocation(diagnostic: Diagnostic): string {
  if (diagnostic.line !== undefined && diagnostic.column !== undefined) {
    return `${diagnostic.line}:${diagnostic.column}`;
  }
  return diagnostic.jsonPointer ?? "—";
}

export function renderTerminal(report: InspectReport): string {
  const lines = [
    `[${report.outcome === "valid" ? "VALID" : "INVALID"}] ${report.input.path}`,
    `Outcome: ${report.outcome}`,
    `Dialect: ${dialectLabel(report)}`,
    `Hash: ${report.canonical?.digest ?? "not available"}`,
    `Validation: JSON ${report.validation.json}; JSON Schema ${report.validation.jsonSchema} (${report.validation.scope})`,
    `Report format: ${report.formatVersion}`,
  ];

  if (report.diagnostics.length > 0) {
    lines.push("Diagnostics:");
    for (const diagnostic of report.diagnostics) {
      lines.push(
        `- ${diagnostic.code} at ${diagnosticLocation(diagnostic)}: ${diagnostic.message}`,
      );
    }
  }
  return `${lines.join("\n")}\n`;
}

function escapeMarkdown(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

function inlineCode(value: string): string {
  return value.includes("`") ? `\`\`${value}\`\`` : `\`${value}\``;
}

export function renderMarkdown(report: InspectReport): string {
  const lines = [
    "# SchemaCanary inspection report",
    "",
    `- **Input:** ${inlineCode(report.input.path)}`,
    `- **Outcome:** ${inlineCode(report.outcome)}`,
    `- **Dialect:** ${dialectLabel(report)}`,
    `- **Canonical hash:** ${inlineCode(report.canonical?.digest ?? "not available")}`,
    `- **Generated:** ${inlineCode(report.generatedAt)}`,
    `- **Report format:** ${inlineCode(report.formatVersion)}`,
    `- **Validation scope:** ${inlineCode(report.validation.scope)}`,
    "",
    "> A valid result means JSON Schema meta-schema validity only. It does not prove that an LLM",
    "> provider accepts the schema or that generated content is semantically correct.",
  ];

  if (report.diagnostics.length > 0) {
    lines.push("", "## Diagnostics", "", "| Code | Location | Message |", "|---|---|---|");
    for (const diagnostic of report.diagnostics) {
      lines.push(
        `| ${escapeMarkdown(diagnostic.code)} | ${escapeMarkdown(diagnosticLocation(diagnostic))} | ${escapeMarkdown(diagnostic.message)} |`,
      );
    }
  }
  return `${lines.join("\n")}\n`;
}

export function renderReport(report: InspectReport, format: ReportFormat): string {
  switch (format) {
    case "json":
      return `${JSON.stringify(report, null, 2)}\n`;
    case "markdown":
      return renderMarkdown(report);
    case "terminal":
      return renderTerminal(report);
  }
}
