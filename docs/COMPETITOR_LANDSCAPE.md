# Competitive landscape

**Status:** initial research snapshot
**Checked:** 2026-08-25

Star counts below are point-in-time signals, not measures of product quality or adoption. Counts were
read from each repository's GitHub REST API `stargazers_count`; activity dates use `pushed_at` so
ordinary issue and star activity do not look like code changes.

## Direct and near-direct projects

| Project | Stars | Last code push | What it does | Important difference |
|---|---:|---|---|---|
| [schemafit](https://github.com/OrionArchitekton/schemafit) | 1 | 2026-06-30 | Versioned compatibility rules for five providers, offline lint, repair, SARIF, GitHub Action, optional live verification, and rule-pack drift warnings | The closest direct competitor, but centered on static rules and single live probes; no repeated failure-rate experiment, structure-aware minimal reproduction, or longitudinal provider/model behavior history |
| [llm-structured-output-benchmark](https://github.com/bendechrai/llm-structured-output-benchmark) | 0 | 2025-11-29 | Repeated strict/non-strict structured-output scenarios across ten models, with success, retry, latency, token, and cost metrics | Uses a fixed application schema; it does not accept arbitrary production schemas, isolate provider schema acceptance, minimize a failure, or retain drift history |
| [openai-compatible-tester-cli](https://github.com/ibidathoillah/openai-compatible-tester-cli) | 1 | 2026-06-01 | Tests OpenAI-compatible endpoint behavior, including whether declared strict schema behavior is actually enforced | Covers general OpenAI-compatible APIs rather than native cross-provider schema experiments, reduction, and history |

## Important adjacent projects

| Project | Stars | Last code push | Relationship to SchemaCanary |
|---|---:|---|---|
| [Promptfoo](https://github.com/promptfoo/promptfoo) | 24,566 | 2026-08-25 | A large, active multi-provider eval and red-team platform. Users can assemble JSON Schema assertions manually, but it does not provide provider-dialect discovery, schema-aware reduction, or automatic schema drift explanations. It is both a substitute for some workflows and a valuable future integration target. |
| [JSONSchemaBench](https://github.com/guidance-ai/jsonschemabench) | 100 | 2026-02-12 | Evaluates constrained-decoding engines against roughly 9,558 real schemas. It is an aggregate research benchmark rather than a production-schema diagnosis tool, and could become a valuable fixture source. |
| [StructuredRAG](https://github.com/weaviate/structured-rag) | 119 | 2026-04-27 | Benchmarks structured responses and task accuracy on fixed RAG tasks across several providers and local runtimes; it does not diagnose or reduce a user's rejected schema. |
| [LLM Structured Output Benchmarks](https://github.com/stephenleo/llm-structured-output-benchmarks) | 190 | 2024-09-23 | Compares structured-output libraries and task results, not provider JSON Schema subsets or model drift. |
| [SOB](https://github.com/InterfazeAI/sob) | 25 | 2026-07-02 | Measures structural and semantic output quality across modalities; it is not a provider schema-acceptance debugger or reducer. |
| [Apple SO-Bench](https://github.com/apple/ml-sobench) | 9 | 2026-03-16 | A multimodal structured-output research benchmark, not an API-provider compatibility and minimal-reproduction tool. |

## Current conclusion

This search did not find a mature project that combines all of the following in one workflow:

1. accept a developer's real JSON Schema;
2. exercise native provider and model/API coordinates repeatedly;
3. distinguish request acceptance, valid JSON, and actual schema enforcement;
4. preserve a stable failure signature while reducing the schema structurally;
5. generate a sanitized, shareable minimal reproduction; and
6. compare the same evidence across dated model snapshots.

That gap is credible, but SchemaCanary must not present ordinary provider linting or a static model
leaderboard as its innovation. The defensible loop is **empirical execution → stable failure
classification → automatic minimal reproduction → longitudinal drift evidence**.

Suggested positioning:

> Unlike schema linters and model benchmarks, SchemaCanary turns your production schema into a
> repeatable cross-provider experiment—and reduces every incompatibility to a minimal repro.

## Research still required

- Install the most direct competitors and run the same sanitized schema through each one.
- Recheck stars, releases, supported providers, and product scope before any public comparison.
- Review non-open-source compatibility matrices and hosted tools separately; Star counts do not
  describe those alternatives.
- Keep public comparisons factual and dated, and avoid claims that no competitor exists.
