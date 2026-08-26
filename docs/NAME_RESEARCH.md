# Name research: SchemaCanary

**Checked:** 2026-08-25
**Decision:** keep `SchemaCanary` for the MVP; always use the full name and the `schemacanary` CLI.

The public repository was created at <https://github.com/TonyAn0618/SchemaCanary> on 2026-08-25.
This reserves the repository name only under that account; npm names and trademark rights remain
separate.

## Availability snapshot

At the time of review:

- GitHub repository-name search for `schemacanary` returned no exact repository.
- GitHub user/organization lookups for `schemacanary` returned no existing account.
- npm registry lookups for `schemacanary`, `schema-canary`, and `@schemacanary/cli` returned 404.

Evidence:

- <https://api.github.com/search/repositories?q=schemacanary%20in:name>
- <https://api.github.com/search/users?q=schemacanary%20in:login>
- <https://api.github.com/users/schemacanary>
- <https://api.github.com/orgs/schemacanary>
- <https://registry.npmjs.org/schemacanary>
- <https://registry.npmjs.org/schema-canary>
- <https://registry.npmjs.org/%40schemacanary%2Fcli>

This is a time-specific search, not a reservation. Availability must be rechecked immediately
before creating the GitHub organization and publishing the package.

## Confusion risk

The exact compound name was relatively clear, but “Canary” is crowded in AI testing and
observability. The project must not shorten its display name or executable to `Canary`/`canary`.
It is not affiliated with Canary AI, runcanary.ai, heycanary.ai, or other Canary-branded products.

`Schema canary` is also used descriptively by other projects, so the name may have limited
trademark distinctiveness. If the project becomes a company or paid product, perform a formal
jurisdiction-specific trademark review; this document is not legal advice.

## Packaging plan

- display name: `SchemaCanary`;
- initial package and binary: `schemacanary`, preserving `npx schemacanary`;
- if multiple packages become necessary: evaluate `@schemacanary/cli`, `@schemacanary/core`, and
  `@schemacanary/action` rather than creating a monorepo prematurely.
