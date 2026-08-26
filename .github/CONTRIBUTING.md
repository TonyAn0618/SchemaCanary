# Contributing

SchemaCanary is pre-alpha. Bug fixes, tests, documentation improvements, and sanitized
compatibility cases are welcome. Discuss new commands, report fields, provider adapters, or reducer
behavior before starting a large pull request.

## Setup

Use Node.js 22.12 or newer and pnpm 11:

```bash
pnpm install
pnpm check
```

Keep each pull request focused. Explain the user problem, behavior change, verification, and any
CLI, report, privacy, cost, or compatibility impact. Bug fixes should include a regression test.

The project maintainer decides changes using reproducible evidence, user value, security,
maintenance cost, and the current scope. Public interfaces and major architecture changes require
an issue or ADR first.

Never commit API keys, private prompts, proprietary schemas, raw model responses, or sensitive
paths. Contributions are licensed under Apache-2.0.
