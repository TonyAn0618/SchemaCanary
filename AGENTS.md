# Instructions for coding agents

Before changing the project:

1. Read `docs/PROJECT.md` and inspect the relevant code, tests, Git state, and open issues.
2. State the intended outcome and Definition of Done.
3. Keep work inside the current milestone and explicit non-goals.

While working:

- Preserve user changes and secrets. Never commit credentials, private schemas, prompts, or raw
  provider responses.
- Provider work must address privacy, redaction, budgets, rate limits, timeouts, and cancellation.
- Add tests and user documentation when behavior changes; record major decisions in an ADR.

Before finishing, run checks proportional to the risk and update `docs/PROJECT.md` only when its
current state, next actions, decisions, risks, or latest handoff changed. Code and automated tests
remain the source of truth for implemented behavior.
