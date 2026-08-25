# Roadmap

This roadmap describes outcomes, not promised dates. Evidence from real users can change the
order. The living source of truth is `AI_OPEN_SOURCE_PROJECT_PLAYBOOK.md`.

## Now — validate and build v0.1

- Validate the problem with at least ten target developers and five sanitized real failures.
- Finish the offline schema preflight and versioned report contract.
- Add native OpenAI, Anthropic, and Gemini adapters without silent schema rewriting.
- Classify failures consistently and enforce call, time, and cost budgets.
- Minimize deterministic provider request rejections while preserving the failure signature.

## Next — prove repeat use

- Repeated trials and statistical handling of intermittent schema violations.
- GitHub Action, baseline comparison, and CI exit behavior.
- Public compatibility fixtures with complete environment metadata.
- Sanitized reproduction bundles and upstream issue templates.

## Later — build an ecosystem

- Additional cloud and gateway endpoints.
- A documented provider-adapter extension contract.
- Hosted public drift pages that do not ingest private user inputs.
- Additional language bindings after the core report contract is stable.

## Explicitly not now

- A general-purpose agent framework, prompt platform, or tracing service.
- A hosted account system or team workspace.
- Automatic schema rewriting presented as provider compatibility.
- Semantic or factual correctness evaluation.
