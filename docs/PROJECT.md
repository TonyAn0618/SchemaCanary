# Project state

Last updated: 2026-08-26

This is the project control file for maintainers and coding agents. It contains only current scope,
decisions, risks, and the latest handoff. Git and pull requests preserve history.

## Product

SchemaCanary aims to turn an LLM structured-output failure into a reproducible, shareable minimal
JSON Schema case. The intended loop is:

1. run the same schema against explicit provider/model/API coordinates;
2. distinguish request acceptance, valid JSON, schema enforcement, and service failures;
3. reduce a failure while preserving its failure signature;
4. rerun saved cases to detect provider behavior changes.

The target users are developers already using structured outputs, tool calling, agents, MCP tools,
or schema-based data extraction.

## Current state

The project is pre-alpha and has no published package or provider integration.

Implemented:

- offline `schemacanary inspect` for one local file;
- strict UTF-8 and JSON parsing, including duplicate-key and nesting checks;
- JSON Schema 2020-12 meta-schema validation;
- stable canonical SHA-256 identity;
- terminal, JSON, and Markdown reports with a versioned machine schema;
- safe report writes that do not overwrite inputs or existing files by default;
- Linux, macOS, and Windows CI on supported Node versions.

Not implemented:

- live OpenAI, Anthropic, or Gemini requests;
- repeated trials, failure signatures, or provider comparison;
- automatic schema reduction or drift history;
- redaction and cost controls required for live requests;
- npm publishing or evidence from external users.

## Current milestone

Validate that real users repeatedly encounter this problem, then implement one provider path
without weakening privacy, reproducibility, or cost boundaries.

Next three actions:

1. Interview 10 target developers and collect 5 sanitized real failures.
2. Observe 3 new users following the README and record every onboarding failure.
3. Define the first native provider contract, failure taxonomy, cancellation behavior, and hard
   request/time/cost limits before making a live call.

The milestone is complete when at least three external users can produce a useful report without
maintainer guidance and one real provider failure can be reproduced and classified reliably.

## v0.1 boundary

Required:

- a CLI, not a public JavaScript library API;
- native OpenAI, Anthropic, and Gemini request paths that do not silently rewrite schemas;
- independent validation of returned JSON;
- deterministic request-rejection reduction with the same-failure check;
- explicit call, time, and cost budgets with cancellation;
- sanitized reproduction bundles and versioned reports.

Not in v0.1:

- a hosted service, account system, dashboard, or database;
- a general eval, prompt, tracing, or agent framework;
- automatic provider-specific schema repair;
- semantic or factual accuracy scoring;
- every gateway, cloud endpoint, schema draft, or programming language.

## Engineering boundaries

- TypeScript, native ESM, Node.js 22.12+, and one package until evidence justifies more.
- Keep dependencies few; use native Node APIs where they are clearer and safer.
- Canonicalization identifies input but never replaces the schema sent to a provider.
- Default to local execution and no telemetry. Never log credentials or private schema contents.
- Live provider work must include redaction, rate limits, timeouts, cancellation, and hard budgets.
- The versioned report schema and CLI exit codes are compatibility surfaces.
- Code and automated tests are the source of truth for implemented behavior.

Detailed implemented behavior lives in [`CLI_SPEC.md`](CLI_SPEC.md). Major technical decisions live
in [`adr/`](adr/).

## Decisions

| Decision | Rationale |
|---|---|
| Focus on real execution, minimal reproduction, and drift | Static provider-rule lookup alone is not a strong product. |
| Ship a CLI before exposing a library API | No validated user currently needs a JavaScript API; premature exports create support obligations. |
| Use TypeScript and Node.js | It provides low-friction `npx` distribution and GitHub Actions integration. |
| Start with native OpenAI, Anthropic, and Gemini paths | It limits scope and makes the actual transmitted request observable. |
| Keep inspection local and telemetry off | Schemas, descriptions, examples, prompts, and responses may be sensitive. |
| Build `inspect` before live provider calls | It validates parsing, identity, reporting, packaging, and safety without credentials or cost. |
| Require pull requests and cross-platform CI for `main` | The repository should remain auditable and reproducible as a single-maintainer project. |

## Current risks

- No external user evidence yet; the dedicated-tool hypothesis may be wrong.
- Provider behavior changes, so every compatibility claim needs model/API coordinates and a date.
- A reducer can preserve the wrong failure unless the failure signature is stable and rechecked.
- Repeated provider calls can amplify cost and rate-limit failures.
- Reports or fixtures can leak credentials and business information without default redaction.
- The custom strict JSON and canonicalization code needs continued conformance testing.

## Latest handoff

- Goal: remove repository and documentation noise without weakening product behavior or safety.
- Changed: replaced the 1,009-line generic playbook with this current-state file; removed naming,
  competitor, product-brief, standalone roadmap, support, and premature governance documents;
  moved essential community policies under `.github/`; removed unused fixtures, fields, and the
  unvalidated JavaScript library entry point; suppressed unsupported major Node type updates.
- Verification: local `pnpm check` passed (5 test files, 28 tests); package dry-run contains 22
  compiled files and no stale library entry; all local links in 11 Markdown files resolve.
- Remaining: external user validation, first provider design, social preview, and npm publishing.

## Maintenance rule

Update this file only when current scope, next actions, a durable decision, a material risk, or the
latest handoff changes. Do not add generic open-source advice, search snapshots, naming checks,
full session history, or duplicate README content.
