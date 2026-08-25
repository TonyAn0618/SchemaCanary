# SchemaCanary

> Find, minimize, and track JSON Schema compatibility failures across LLM providers.

SchemaCanary is an early-stage open-source CLI for developers who rely on structured outputs,
tool calling, agents, or data extraction. Its goal is to run the same contract against multiple
LLM providers, explain how it failed, reduce a large failing schema to a minimal reproduction,
and track behavior as models change.

**Status: pre-alpha.** The current vertical slice is deliberately offline: it inspects a local
JSON Schema, validates its declared dialect, and produces a stable identity hash and versioned
report. It does not call an LLM provider yet.

## Why this exists

Different providers, model snapshots, API surfaces, and SDKs accept different JSON Schema
subsets. Documentation helps, but it cannot replace a reproducible test of the exact schema a
project sends. Debugging is especially painful when a large generated schema fails and the
smallest triggering construct is unknown.

SchemaCanary is being designed around three verbs:

- **Discover** real request rejection, invalid JSON, schema violations, and flaky behavior.
- **Minimize** a failure while preserving the same failure signature.
- **Track** known cases across provider and model changes.

## Current command

Prerequisites: Node.js 22.12 or newer and pnpm 11.

```bash
pnpm install
pnpm build
node dist/cli.js inspect examples/order.schema.json
```

Machine-readable output:

```bash
node dist/cli.js inspect examples/order.schema.json --format json
```

Markdown report without overwriting an existing file:

```bash
node dist/cli.js inspect examples/order.schema.json \
  --format markdown \
  --output report.md
```

The inspection is local and performs no network request. It currently checks strict UTF-8 and
JSON parsing, duplicate object keys, JSON Schema 2020-12 meta-schema validity, and a canonical
SHA-256 identity. It does **not** claim that any LLM provider will accept the schema.

## Planned `run` workflow

```bash
npx schemacanary run order.schema.json \
  --prompt prompt.txt \
  --target openai:model-snapshot \
  --target anthropic:model-snapshot \
  --target google:model-snapshot \
  --repeat 5 \
  --budget-usd 2 \
  --max-calls 100 \
  --timeout 30s
```

This command is a product contract, not an implemented feature yet. See
[`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) and [`docs/CLI_SPEC.md`](docs/CLI_SPEC.md).

## Trust boundaries

- No telemetry and no hosted service.
- No provider credentials are read by `inspect`.
- Reports omit schema contents, the current working directory, and resolved absolute paths.
- An output file is never overwritten unless `--force` is explicit.
- A valid inspection result means meta-schema validity only, not provider compatibility or
  semantic correctness.

## Development

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm pack --dry-run
```

The project uses the Apache-2.0 license. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a
large pull request. Project direction, quality gates, risks, and maintenance rules live in
[`AI_OPEN_SOURCE_PROJECT_PLAYBOOK.md`](AI_OPEN_SOURCE_PROJECT_PLAYBOOK.md).

## Project name

`SchemaCanary` is always written in full. It is not affiliated with products named Canary.
Name availability was checked on 2026-08-25 but is not legally reserved until the relevant
accounts and packages are created. See [`docs/NAME_RESEARCH.md`](docs/NAME_RESEARCH.md).
