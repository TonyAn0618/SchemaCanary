# Security Policy

SchemaCanary is pre-alpha and has no supported public release yet.

## Reporting a vulnerability

Do not open a public issue for secret exposure, unsafe file access, supply-chain compromise,
cost-amplification flaws, or disclosure of private schemas and model responses. Use
[GitHub Private Vulnerability Reporting](https://github.com/TonyAn0618/SchemaCanary/security/advisories/new)
and remove real credentials and customer data from reproductions.

## Current defaults

- `inspect` is offline and reads no provider credentials.
- There is no telemetry or hosted service.
- Reports omit schema contents, resolved absolute paths, and the current working directory.
- Existing report files are not overwritten without explicit `--force`.
- Provider integrations must add redaction, timeouts, rate limits, cancellation, and call/cost
  limits before they can be enabled by default.
