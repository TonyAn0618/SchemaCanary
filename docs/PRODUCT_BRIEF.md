# Product brief: SchemaCanary v0.1

**Status:** draft for validation
**Last reviewed:** 2026-08-25

## Problem

Developers use JSON Schema to constrain LLM structured outputs and tool calls, but support varies by
provider, model snapshot, API surface, gateway, and SDK. When a generated schema is rejected or
occasionally violated, official documentation rarely identifies the smallest triggering construct.
Teams resort to deleting fields manually, switching models, or maintaining undocumented adapters.

## Target users

The first users are developers and maintainers who already ship structured outputs, tool calling,
agents, MCP tools, or LLM-based data extraction. The project is not initially aimed at nontechnical
AI consumers or teams that never use schema-constrained output.

## Job to be done

When a real schema fails on one provider or after a model change, help the developer turn that
failure into a trustworthy, shareable, minimal reproduction in under ten minutes.

## Product promise

Given one schema, prompt, and set of explicit targets, SchemaCanary will preserve the original
contract, run observable experiments, classify each result, and minimize reproducible failures
without silently rewriting the schema.

## Core loop

1. **Discover:** execute the exact contract and classify acceptance, JSON validity, schema validity,
   refusal, truncation, service errors, and inconclusive results.
2. **Minimize:** perform structure-aware reduction while preserving the same failure signature.
3. **Track:** retain sanitized fixtures and rerun them against fixed model/API coordinates.

## v0.1 scope

- Offline `inspect` preflight: strict JSON parsing, JSON Schema 2020-12 meta-validation, canonical
  identity, and versioned reports.
- Native OpenAI, Anthropic, and Gemini HTTP adapters.
- Repeated execution with explicit model snapshots and API surfaces.
- A stable failure taxonomy and independent validation of returned JSON.
- Terminal, JSON, and Markdown reports.
- Deterministic request-rejection reduction.
- Sanitized reproduction bundles.
- Hard call, time, and cost budgets with cancellation.

## Non-goals

- Provider-specific automatic schema repair.
- Semantic or factual correctness evaluation.
- A general eval, observability, prompt-management, or agent framework.
- Hosted accounts, team workspaces, or ingestion of private user data.
- Every cloud gateway, model, language binding, or schema draft in the first release.

## Success evidence

Before calling v0.1 useful, require:

- at least ten target-user conversations and five sanitized real failures;
- at least three independent users willing to try the prototype;
- one real schema of at least 50 lines reduced to a much smaller same-signature failure;
- first useful report in ten minutes or less in an observed onboarding test;
- at least two generated reproductions used in an upstream issue, fix, or migration decision.

Star count is a secondary reach signal, not product validation.

## Highest-risk assumptions

- The problem occurs often enough for developers to install a dedicated tool.
- Provider errors can be classified into stable enough signatures for useful reduction.
- Real schemas can be sanitized without removing the triggering behavior.
- Repeated live experiments can stay within acceptable time and API cost.
- A focused CLI plus public fixtures is sufficiently distinct from existing linters and eval tools.

## Current validation experiment

Interview target users about their most recent failure, collect sanitized artifacts, and manually
reproduce the issue before expanding beyond the offline inspection path.
