# Copilot Instructions

## Project

Merges two **Planet Crafter** save files. Format: plain-text, 11 sections separated by `@`, each containing JSON objects separated by `|\n`.

## Stack

- **Runtime**: Bun (ESM, `"type": "module"`)
- **Tests**: `bun test` / `bun:test` (`describe`, `it`, `expect`)
- **Type checking**: `tsconfig.json` `checkJs: true` — types only (`bun run lint:types`)
- **Types**: `@typedef` in `src/types.js` — import via `/** @import { Foo } from '../types.js' */`

## Terminal

- Conventional commits: `<type>(<scope>): <message>` — no body.
- `<scope>` = section name when applicable (e.g. `players`, `inventories`).
- No `cd` unless an error occurred. No `wsl` ever.

## Planning

- Always start with a short written plan (1–3 bullets): goal, steps (tests → implementation → refactor), and verification criteria. Write the plan before creating tests or code; stop and share it for non-trivial changes.

## TDD — strict red → green → refactor

1. Write failing tests first. Never implement logic without a test.
2. After writing tests, **stop and ask** for a test run before implementing.
3. After going green, **stop and ask** before refactoring.
4. Never skip a phase or merge two phases in one step.

## Testing

- AAA (Arrange / Act / Assert); one Act per `it`.
- Business-readable names; no technical jargon in names.
- Nested `describe` for context; outer = subject, inner = scenario.
- Tests are the only documentation — no inline comments.
- Hard-coded expected values; no assertion loops unless >5 entries.
- No module mocking — use dependency injection.
- No shared state between tests; `beforeEach` only for setup, never for cross-test data.
- Never assert on implementation details (internal function calls, private state).

## Code

- **Architecture**: SOLID; single responsibility per module; respect abstraction levels.
- **Exports**: named exports only — no default exports.
- **Merge functions**: `merge*(sectionA, sectionB[, extras])` → `string`. Follow the `mergeTerraformationLevels` pattern exactly.
- **Utilities / test helpers**: `src/utils/` and `src/utils/testing/` respectively.
- **Constants**: `UPPER_SNAKE_CASE` for every literal reused or domain-meaningful. Zero magic numbers or strings.
- **Naming**: full, unambiguous names — no abbreviations, no diminutives.
- **Comments**: none — code must be self-explanatory. `@see GR-*` JSDoc tags are allowed on exports.
- **Types**: every exported function annotated with `@param` / `@returns`. Never use `any`; prefer precise types, `unknown`, or `@ts-expect-error` for intentionally invalid test values.
- **Null-safety**: no silent coercion (`??` is fine; never `|| default` for booleans/numbers).
- **Immutability**: never mutate input parameters; always return new values.
- **Pure functions**: no side effects outside the designated I/O layer (`merge-cli.js`, `validate-cli.js`).
- **Early returns**: guard clauses over nested `if`/`else` chains.
- **No redundancy**: no duplicated logic — extract shared behaviour into named helpers.
- **Error handling**: throw a typed `Error` with a descriptive message; never swallow errors silently.

## Domain

Canonical rules: **`docs/game-rules.md`** — always consult it. Table below is orientation only.

| § | Merge key | Strategy |
|---|-----------|----------|
| 0 Global metadata | — | Sum tokens; union groups; save A wins instance fields |
| 1 Terraformation levels | `planetId` | `Math.max` all numeric; `-1` sentinel for purification |
| 2 Players | `name` | Save A wins; exactly one `host: true` (save A's host) |
| 3 World objects | `planet:pos` | Save A wins; remove B-player orphans first |
| 4 Inventories | `id` (remapped) | Keep all except ejected-player inventories from B |
| 5 Statistics | — | Sum all fields |
| 6 Messages | `stringId` | Union; `isRead` = boolean OR |
| 7 Story events | `stringId` | Union; no field merge |
| 8 Save configuration | — | Save A wins; `saveDisplayName` from `merge()` arg |
| 9 Terrain layers | `layerId`+`planet` | Save A wins |
| 10 World events | `planet`+`seed`+`pos` | Save A wins |

**GR-ORDER-1**: if exactly one save has `planetId === 'Prime'` in its config, promote it to save A before any merge.

**Id conflicts**: `resolveIdConflicts.js` runs last — remaps duplicate ids, updates `inventoryId`, `equipmentId`, `liId`, `woIds`.
