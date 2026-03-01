# Copilot Instructions

## Project

Merges two **Planet Crafter** save files into one. The save format is a plain-text string split into 11 sections separated by `@`. Each
section contains JSON objects separated by `|\n`.

## Stack

- **Runtime**: Bun (ESM, `"type": "module"`)
- **Tests**: `bun test` with `bun:test` (`describe`, `it`, `expect`) — no external test framework
- **Type checking**: `tsconfig.json` with `checkJs: true` — no compilation, types only (`bun run lint:types`)
- **Types**: all domain types are defined as `@typedef` in `src/types.js` — import with `/** @import { Foo } from '../types.js' */`

## Terminal usage

- Follow conventional commit format: `<type>(<scope>): <message>` (no description block).
- `<scope>` is the section being merged if applicable (e.g. `players`, `inventories`).
- No `cd` command unless an error occurred.
- No `wsl` command at all — assume all commands are run in the correct environment.

## TDD Workflow

Follow strict **red → green → refactor** cycles: write failing tests first, then implement the minimal code to pass. Never implement logic
without a corresponding test. Don't execute tests yourself — ask me to run them and provide feedback.

## Testing conventions

- AAA pattern (Arrange, Act, Assert); one Act per test.
- Business-readable test names; no technical details in names.
- Nested `describe` blocks for context grouping; test names focused on behavior.
- Tests are living documentation — no additional comments needed.
- Prefer hard-coded values in assertions; avoid loops unless data exceeds ~5 entries.
- Avoid mocking modules directly. Prefer dependency injection for testability.
- Avoid test dependencies; each test should be independent and self-contained. Use `beforeEach` for shared setup if necessary, but avoid
  shared state between tests.

## Code Conventions

- SOLID principles; respect abstraction levels.
- **Named exports** only (no default exports).
- Each `merge*` function receives two parsed section arrays and returns a serialized string. Follow the `mergeTerraformationLevels` pattern.
- Helper/test utilities live in `src/testing/`.
- No magic numbers or strings — use `UPPER_SNAKE_CASE` named constants.
- No explanatory comments; write self-explanatory code.
- Avoid diminutive or truncated variable/function names.
- All new modules must import their types from `src/types.js` via `/** @import { ... } from '../types.js' */` and annotate every exported
  function with `@param` / `@returns`.
- Avoid `any` type whenever possible; prefer precise types, `unknown`, or `@ts-expect-error` for intentionally invalid test values.

## Domain guidelines

The canonical merge rules are in **[`docs/game-rules.md`](../docs/game-rules.md)** — consult that file for every section strategy,
merge key, and invariant. The summary below is for quick orientation only; the canonical document is authoritative.

| Section                   | Merge key             | Conflict strategy                                             |
|---------------------------|-----------------------|---------------------------------------------------------------|
| 0 — Global metadata       | —                     | Sum tokens; union groups; save A wins instance fields         |
| 1 — Terraformation levels | `planetId`            | `Math.max` all numeric fields; `-1` sentinel for purification |
| 2 — Players               | `name`                | Save A wins; exactly one `host: true` (save A's host)         |
| 3 — World objects         | `planet:pos`          | Save A wins; orphans from ejected B-players removed first     |
| 4 — Inventories           | `id` (remapped)       | All kept except ejected-player inventories from save B        |
| 5 — Statistics            | —                     | All fields summed                                             |
| 6 — Messages              | `stringId`            | Union; `isRead` = boolean OR                                  |
| 7 — Story events          | `stringId`            | Union; no field merge                                         |
| 8 — Save configuration    | —                     | Save A wins; `saveDisplayName` overridden by `merge()` arg    |
| 9 — Terrain layers        | `layerId`+`planet`    | Save A wins                                                   |
| 10 — World events         | `planet`+`seed`+`pos` | Save A wins                                                   |

**Save order (GR-ORDER-1):** if one save has `planetId === 'Prime'` in its configuration and the other does not, the Prime save is promoted
to save A before any merge function runs.

**Id conflict resolution:** `src/utils/resolveIdConflicts.js` runs last — remaps duplicate ids and updates all back-references
(`inventoryId`, `equipmentId`, `liId`, `woIds`).

