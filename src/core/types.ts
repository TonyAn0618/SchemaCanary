export type JsonPrimitive = null | boolean | number | string;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type DocumentType = "object" | "array" | "string" | "number" | "boolean" | "null";

export type InspectOutcome = "valid" | "invalid_json" | "invalid_schema" | "unsupported_dialect";

export type DiagnosticCode =
  | "JSON_SYNTAX_ERROR"
  | "JSON_DUPLICATE_KEY"
  | "JSON_INVALID_UNICODE"
  | "JSON_NON_FINITE_NUMBER"
  | "JSON_NESTING_TOO_DEEP"
  | "SCHEMA_INVALID_ROOT"
  | "SCHEMA_META_VALIDATION_ERROR"
  | "SCHEMA_UNSUPPORTED_DIALECT";

export interface Diagnostic {
  code: DiagnosticCode;
  severity: "error";
  message: string;
  jsonPointer?: string;
  keyword?: string;
  line?: number;
  column?: number;
}

export interface InspectReport {
  format: "schemacanary.inspect-report";
  formatVersion: "1.0.0";
  tool: {
    name: "schemacanary";
    version: string;
  };
  command: "inspect";
  generatedAt: string;
  outcome: InspectOutcome;
  input: {
    kind: "file";
    path: string;
    sizeBytes: number;
    documentType?: DocumentType;
  };
  dialect: {
    declared: string | null;
    effective: string | null;
    resolution: "declared" | "defaulted" | "unsupported" | "unavailable";
  };
  canonical: {
    algorithm: "rfc8785-sha256-v1";
    digest: string;
    sizeBytes: number;
  } | null;
  validation: {
    json: "valid" | "invalid";
    jsonSchema: "valid" | "invalid" | "unsupported_dialect" | "not_checked";
    scope: "meta-schema-only";
  };
  diagnostics: Diagnostic[];
}
