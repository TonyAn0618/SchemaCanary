# Security Policy

SchemaCanary is pre-alpha and has no supported public release yet.

## Reporting a vulnerability

Do not open a public issue for a suspected secret leak, arbitrary code execution, unsafe file
access, supply-chain compromise, cost-amplification flaw, or exposure of private schemas and model
responses.

A private reporting channel must be configured before the repository is publicly launched. Once a
GitHub repository exists, enable GitHub Private Vulnerability Reporting and replace this paragraph
with the exact private-reporting link. Until then, retain the minimal reproduction privately and do
not include real credentials or customer data.

The initial response target for a severe report is 24 hours. This is a maintainer goal, not a
contractual SLA.

## Security defaults

- `inspect` is offline and reads no provider credentials.
- Telemetry is absent and remains opt-in if introduced later.
- Output reports omit schema contents, resolved absolute paths, and the current working directory.
- Existing report files are not overwritten without explicit `--force`.
- Provider integrations must add redaction, timeouts, rate limits, call limits, and cost limits
  before they can be enabled by default.
