# CLI and report contract

**Status:** pre-alpha draft
**Last reviewed:** 2026-08-25

## Implemented command: `inspect`

```text
schemacanary inspect <schema-file> [options]
```

Options:

- `-f, --format <terminal|json|markdown>`: output format; default `terminal`.
- `-o, --output <file>`: write the report to a file instead of stdout.
- `--force`: explicitly permit replacing an existing output file.
- `-h, --help`: show command help.
- `-V, --version`: show the CLI version.

Constraints:

- exactly one local file, at most 1 MiB;
- strict UTF-8 with an optional BOM;
- strict JSON with no comments, trailing commas, non-finite numbers, invalid Unicode, or duplicate
  object keys;
- JSON Schema 2020-12 only; a missing `$schema` defaults to 2020-12 and any other declared dialect
  is reported as unsupported;
- no network request, remote reference resolution, provider rule, or schema repair;
- stdout contains only the selected report body;
- report data omits schema contents, cwd, and resolved absolute paths.

## Canonical identity

The algorithm identifier is `rfc8785-sha256-v1`. Objects are serialized using the JSON
Canonicalization Scheme rules and hashed as UTF-8 with SHA-256. Object key order and insignificant
whitespace do not affect the digest; array order does. Canonicalization identifies input and never
replaces the original schema sent to a future provider.

## Report format

The current machine format is `schemacanary.inspect-report` version `1.0.0`. Its JSON Schema is
published in `schemas/inspect-report.v1.schema.json`.

Key outcomes:

- `valid`
- `invalid_json`
- `invalid_schema`
- `unsupported_dialect`

Validation scope is explicitly `meta-schema-only`. A valid report does not claim provider support,
successful constrained decoding, or semantic correctness.

## Process exit codes

| Code | Meaning |
|---:|---|
| 0 | Inspection completed and the schema is valid. |
| 1 | Inspection completed and found invalid JSON, invalid Schema, or an unsupported dialect. |
| 2 | CLI usage, input-file, size-limit, or output-write error. |
| 70 | Unexpected internal error. |

Detailed diagnostics use stable string codes rather than additional process exit codes.

## Planned command: `run`

```text
schemacanary run <schema-file> --prompt <file> --target <provider:model>...
```

The future command will reuse `inspect`, then perform explicit live requests. Its provider,
failure, budget, and reproduction contracts require separate ADRs before implementation.
