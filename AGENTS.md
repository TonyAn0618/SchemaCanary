# Project instructions for Codex and other coding agents

This repository uses `AI_OPEN_SOURCE_PROJECT_PLAYBOOK.md` as its living project playbook.

Before making plans or changes:

1. Read `AI_OPEN_SOURCE_PROJECT_PLAYBOOK.md` completely.
2. Inspect the repository, tests, current Git state, and relevant issues; do not assume the playbook is perfectly current.
3. Review its “当前控制台”, “决策记录”, “风险登记表”, and latest “会话交接日志”.
4. State the intended outcome and Definition of Done for the current task.
5. Keep work aligned with the current milestone and explicit non-goals. Put unrelated ideas in an issue or Later; do not silently expand scope.

While working:

- Preserve user changes and secrets.
- Never log or commit API keys, private schemas, prompts, or raw responses.
- For changes involving provider calls, check privacy, redaction, cost budgets, rate limits, and cancellation.
- Record durable product or architecture decisions in the playbook; create an ADR for major decisions.
- Add or update tests and user documentation when behavior changes.
- Do not mark a checklist item complete without verifiable evidence.

Before finishing a substantive task:

1. Run tests proportional to the risk and report the exact commands and results.
2. Update the playbook’s last-reviewed date, current status, next three actions, relevant checklists, risks, and decisions.
3. Add a concise session handoff entry with changes, evidence, remaining work, and blockers.
4. If documentation and code disagree, correct the documentation or explicitly record the discrepancy.
5. Keep the final handoff self-contained and link to the files changed.

The code and automated tests remain the source of truth for implemented behavior. The playbook is the source of truth for project direction, maturity gates, major decisions, risks, and next actions.
