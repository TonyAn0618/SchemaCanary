# Security Policy

SchemaCanary is pre-alpha and has no supported public release yet.

## Reporting a vulnerability

Do not open a public issue for a suspected secret leak, arbitrary code execution, unsafe file
access, supply-chain compromise, cost-amplification flaw, or exposure of private schemas and model
responses.

Use [GitHub Private Vulnerability Reporting](https://github.com/TonyAn0618/SchemaCanary/security/advisories/new).
Retain sensitive reproductions privately and do not include real credentials or customer data.

The initial response target for a severe report is 24 hours. This is a maintainer goal, not a
contractual SLA.

## Security defaults

- `inspect` is offline and reads no provider credentials.
- Telemetry is absent and remains opt-in if introduced later.
- Output reports omit schema contents, resolved absolute paths, and the current working directory.
- Existing report files are not overwritten without explicit `--force`.
- Provider integrations must add redaction, timeouts, rate limits, call limits, and cost limits
  before they can be enabled by default.
