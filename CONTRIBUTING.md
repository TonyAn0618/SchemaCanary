# Contributing

SchemaCanary is pre-alpha. Small bug fixes, tests, documentation improvements, and sanitized
compatibility cases are welcome. Please discuss new commands, public report fields, provider
adapters, or reducer behavior before investing in a large pull request.

## Local setup

Requirements:

- Node.js 22.12 or newer;
- pnpm 11.

```bash
pnpm install
pnpm check
```

Useful commands:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Pull requests

Keep each PR focused. Explain the user problem, the behavior change, tests performed, compatibility
impact, and documentation changes. Bug fixes should include a regression test. Public CLI flags,
exit codes, report fields, and failure classifications are interfaces and require explicit review.

Never commit API keys, private prompts, proprietary schemas, raw model responses, or reports that
contain sensitive paths or data. Fork PRs must remain verifiable without maintainer credentials.

By submitting a contribution, you agree that it is licensed under Apache-2.0.
