# SchemaCanary

[![CI](https://github.com/TonyAn0618/SchemaCanary/actions/workflows/ci.yml/badge.svg)](https://github.com/TonyAn0618/SchemaCanary/actions/workflows/ci.yml)

[中文说明](README.zh-CN.md)

Find, minimize, and track JSON Schema compatibility failures across LLM providers.

SchemaCanary is for developers using structured outputs, tool calling, agents, or schema-based data
extraction. Its goal is to test the exact same contract across providers and turn a large failure
into a small, reproducible case.

> **Pre-alpha:** provider execution and automatic reduction are not implemented yet. The current
> command is an offline JSON Schema inspection tool. The npm package is not published.

## What works today

`inspect` checks one local JSON Schema without making a network request. It provides:

- strict UTF-8 and JSON parsing, including duplicate-key detection;
- JSON Schema 2020-12 meta-schema validation;
- a stable canonical SHA-256 identity;
- terminal, JSON, or Markdown reports;
- safe output-file handling and a versioned machine-report schema.

## Run from source

Requirements: Node.js 22.12 or newer and pnpm 11.

```bash
pnpm install
pnpm build
node dist/cli.js inspect examples/order.schema.json
```

JSON output:

```bash
node dist/cli.js inspect examples/order.schema.json --format json
```

Write a Markdown report without replacing an existing file:

```bash
node dist/cli.js inspect examples/order.schema.json \
  --format markdown \
  --output report.md
```

A valid inspection means the document satisfies the JSON Schema 2020-12 meta-schema. It does not
mean that an LLM provider accepts the schema or that model output is semantically correct. See the
[CLI contract](docs/CLI_SPEC.md) for options, outcomes, and exit codes.

## Direction

The intended product loop is:

1. **Discover** failures through explicit provider/model/API requests.
2. **Minimize** a schema while preserving the same failure signature.
3. **Track** saved cases as provider behavior changes.

The next milestone is one native provider path with reproducible failure classification,
cancellation, and hard request/time/cost limits. Current scope and decisions are kept in
[`docs/PROJECT.md`](docs/PROJECT.md).

## Contributing and security

Run `pnpm check` before submitting a pull request. Read the
[contribution guide](.github/CONTRIBUTING.md) for scope and safety requirements.

- Questions and ideas: [Discussions](https://github.com/TonyAn0618/SchemaCanary/discussions)
- Reproducible defects and compatibility cases: [Issues](https://github.com/TonyAn0618/SchemaCanary/issues)
- Vulnerabilities: [private security reporting](https://github.com/TonyAn0618/SchemaCanary/security/advisories/new)

SchemaCanary is licensed under [Apache-2.0](LICENSE).
