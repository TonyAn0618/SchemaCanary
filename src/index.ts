export {
  INSPECT_REPORT_FORMAT_VERSION,
  JSON_SCHEMA_2020_12,
  inspectSchemaFile,
  type InspectOptions,
} from "./core/inspect-schema.js";
export { canonicalizeAndHash, type CanonicalIdentity } from "./core/canonical.js";
export { parseStrictJson, StrictJsonError } from "./core/strict-json.js";
export type {
  Diagnostic,
  DiagnosticCode,
  DocumentType,
  InspectOutcome,
  InspectReport,
  JsonPrimitive,
  JsonValue,
} from "./core/types.js";
export {
  renderMarkdown,
  renderReport,
  renderTerminal,
  type ReportFormat,
} from "./reporting/render.js";
