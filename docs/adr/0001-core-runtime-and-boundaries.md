# ADR 0001: Core runtime and first vertical slice

- Status: accepted
- Date: 2026-08-25

## Context

SchemaCanary needs a low-friction cross-platform CLI, future GitHub Action integration, explicit
provider HTTP boundaries, and a reusable machine report. The first implementation must test the
input and reporting chain without requiring credentials or incurring provider cost.

## Decision

- Use TypeScript and native ESM on supported Node.js LTS releases, initially Node 22.12 and newer.
- Use one package until independently versioned packages are justified.
- Use Node's built-in argument parser and filesystem/crypto APIs to minimize runtime dependencies.
- Use Ajv for JSON Schema 2020-12 meta-schema validation.
- Implement `inspect` before provider adapters. It performs strict local parsing, canonical
  identity, meta-validation, and versioned reporting with no network access.
- Keep inspection data, validation, and rendering separate. Terminal, JSON, and Markdown reports
  render the same typed model.
- Preserve exact provider request behavior later through native HTTP adapters; do not put provider
  SDK types in the core domain model.

## Consequences

- Users get a safe, testable command before live integrations exist.
- Node 20 is not supported because it reached end of life in 2026.
- Only JSON Schema 2020-12 is accepted by the first inspection implementation. Additional dialects
  require explicit tests and a report-compatible design.
- The project must maintain its own strict JSON duplicate-key and canonicalization behavior, with
  conformance tests, rather than relying on `JSON.parse` alone.
- Provider calls, reduction, cost estimation, and statistical failure oracles remain intentionally
  out of scope for this ADR.
