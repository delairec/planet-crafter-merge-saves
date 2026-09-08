# Planet Crafter Save Tools

> ❗ I’m not going to actively maintain this project (or only minimally). If you’d like to add improvements or fix bugs, feel free to fork it
> 😃

## Overview

This project provides tools to manipulate **Planet Crafter** save files. Currently, the available tools are:
- **Merge**: combine two save files into one, following specific rules to preserve as much information as possible.
- **Validate**: check if a save file is correctly formatted according to the game's specifications.

In progress:
- **Save Manager**: a UI to visualize save files. In the long term, it could also include editing capabilities, but for now it is only a viewer.

Planned:
- **Fix corrupted saves**: a tool to attempt to recover data from corrupted save files thanks to analysis.

## Project Structure

This is a Bun workspace monorepo, organized around Clean Architecture package prefixes:

| Package                  | Role                                                                                                                    |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------|
| `shared-save-processing` | Save file wire format: types, parsing, serialization and JSON schemas.                                                  |
| `shared-platforms`       | Runtime platform adapters (filesystem/process) for Bun and Node.                                                        |
| `util-types`             | `RuntimePlatform` contract type, consumed (type-only) by `shared-platforms`.                                            |
| `core-mapping`           | Domain/application/infrastructure/presentation layers: merge and validation engines, use cases, controllers, presenters. |
| `cli-merge`              | Thin CLI: parses `--input`/`--output` arguments and delegates to `core-mapping`.                                        |
| `cli-validate`           | Thin CLI: parses `--file` argument and delegates to `core-mapping`.                                                     |
| `ui-save-manager`        | SolidStart UI to visualize save files, consuming `core-mapping` controllers.                                            |

The prefix of a package name sets what it is allowed to depend on. A type-only import counts as a dependency.

| Prefix     | May depend on                  |
|------------|--------------------------------|
| `util-*`   | nothing                        |
| `shared-*` | `util-*`                       |
| `core-*`   | `shared-*`, `util-*`           |
| `cli-*`    | `shared-*`, `util-*`, `core-*` |
| `ui-*`     | `shared-*`, `util-*`, `core-*` |

`bun run check:dependencies` enforces this matrix.

## Merge and Validate tools
Merges two **Planet Crafter** save files into a single one, preserving as much information as possible.

### Prerequisites

Using [Bun](https://bun.sh) `v1.3.14` by default.

### Installation

```
bun install
```

The install hook `scripts/sync-private-context.sh` clones the private agent context repository when the account has
access to it. Contributors without access get a skip message and an otherwise normal install.

### Scripts

#### With Bun

```
bun merge
```

Generates the merged saves in output directory, by processing all subfolders from input folder.

```
bun merge -- --input=<directory> --output=<directory>
```

Overrides the default `input` and `output` directories.

```
bun validate -- --file=<filepath>
```

Validates a json save file against the json schemas stored in this project. This is useful mostly for debugging.

```
bun test
```

```
bun test:watch
```

Execute all the unit tests of the project. Use `watch` to enable automatic run on save.

Mocks and spies are restored between tests by a global `afterEach`, so no test has to clean up after itself. It comes
from `testSetup.ts`, preloaded through the `bunfig.toml` sitting next to it: one at the repository root, one in each
package. Bun resolves `bunfig.toml` from the working directory only, without looking at parent directories, so the
preload silently does not apply when tests are run from any other directory — a deeper folder inside a package, or an
IDE run configuration whose working directory is the folder of the test file.

```
bun test testIsolation.spec.ts
```

Checks that the preload actually applies. Run it with the working directory you want to check (the repository root, a
package folder, an IDE run configuration): it fails when mocks are not restored between tests in that context.

In an IDE, a generated run configuration usually takes the folder of the test file as its working directory, which is
deeper than any `bunfig.toml`. In IntelliJ, set the environment variable below on the Bun *configuration template*
(Run > Edit Configurations > Edit configuration templates…), so that every run configuration created afterwards loads
the setup whatever its working directory:

```
BUN_OPTIONS=--preload=<absolute path>/testSetup.ts
```

`BUN_OPTIONS` prepends CLI arguments to every Bun invocation, and a CLI flag wins over `bunfig.toml`. It applies to run
configurations created after the change only, so delete the temporary ones already generated. It lives in
`.idea/workspace.xml`, which is git-ignored: it is a per-developer setting, not shared and not used by the CI, where
`bunfig.toml` remains the source of truth.

```
bun run lint:types
```

Checks typings in all the project files (using `tsc --noEmit` under the hood). Every package owns a `tsconfig.json`
extending the root one and its own `lint:types` script, which the root script chains over the workspace: each package
is therefore checked as a separate program, with the libraries it is entitled to. Only `ui-*` declares the DOM
libraries, so a browser global referenced from a `core-*` or a `cli-*` package fails the check instead of resolving
silently, and the `.tsx` files of the UI are covered. `ui-save-manager` runs two programs, its own and the one of
`e2e/`, the Playwright types belonging to the scenarios alone.

```
bun run audit
```

Audits production and development dependencies. The two Picomatch advisories are explicitly allowlisted because
`micromatch` still requires the affected 2.x dependency transitively; they should be removed as soon as that upstream
constraint is updated.

```
bun run audit:quality
```

Runs `check:assertions`, `check:fixtures` and `check:dependencies`, then the
[Fallow](https://github.com/fallow-rs/fallow) audit and health reports (dead files, unused exports, unresolved
imports) against `master`, as the CI does.

```
bun run check:assertions
```

Fails on any spec asserting a fabricated boolean (`expect(list.some(...)).toBeTruthy()`, `expect(a > b).toBe(true)`):
a matcher applies to the value itself so that a failure shows the actual data. Boolean matchers stay legitimate on
business booleans such as `expect(player.host).toBe(true)`. Every `*.spec.{js,ts,tsx}` file of the repository is
scanned, outside dependencies and build outputs, and only the outermost asserted expression is read: a comparison
written inside a callback (`expect(list.find(item => item.id === 1)).toBeTruthy()`) builds the asserted value, it is
not the assertion. The check reads one line at a time, so an assertion spread over several lines escapes it.

```
bun run check:fixtures
```

Fails on any spec making a fixture compile instead of typing it: `as unknown`, `as never`, an `any` annotation —
including the JSDoc forms `/** @type {any} */` and `@param {any}`, which a search for `: any` does not see — and
`@ts-ignore`. A test fixture is built by its builder (`packages/shared-save-processing/testing/createSaveRecords.js`
for the save records) so that a record gaining a field breaks the build rather than a test. An input that is illegal
on purpose is declared with `@ts-expect-error`, which fails the day the error disappears, and the check requires that
directive to carry the justification saying which invalidity is under test. String literals are masked before the
line is read, so a forbidden form quoted in a message is not reported; like `check:assertions`, the check reads one
line at a time, so a declaration spread over several lines escapes it.

```
bun run check:dependencies
```

Fails on any breach of the dependency matrix above. It reads the manifest of every workspace package and the package
specifiers imported by its `.js`, `.ts` and `.tsx` sources, then reports a dependency declared on a forbidden prefix,
an import of a forbidden prefix, an import of a workspace package the manifest does not declare, and a declared
workspace dependency that is never imported. A dependency on a library outside the workspace is left to the Fallow
audit. Type-only imports count, JSDoc `@import` directives included, so the check sees what `tsc` erases.

#### Save Manager UI

```
bun run dev:ui
```

Starts the Save Manager UI in development mode.

```
bun run build:ui
```

Builds the UI for production. `bun run preview:ui` builds then serves the result, and `bun run clean:ui` removes the
build output.

```
bun run test:ui:install
```

Downloads the three browser engines the scenario suite drives (Chromium, Firefox and WebKit). Run it once, and again
after a Playwright upgrade. On a machine missing the system libraries the engines need, install them too with
`bunx playwright install --with-deps chromium firefox webkit`, which asks for administrator rights.

```
bun run test:ui
```

Runs the UI scenarios of `packages/ui-save-manager/e2e/` against the production build, on the three engines. Nothing
has to be started beforehand: the suite builds the application, serves it, waits for the port and stops it afterwards.
The save files the scenarios load are generated fixtures versioned next to them, so the suite never depends on the
content of `input/`.

These scenarios are not part of `bun test`, which only collects unit tests: the `*.e2e.ts` suffix keeps the two
runners apart. In the CI they run in their own workflow, on the pull requests targeting `master` and on manual
dispatch — not on the pull requests targeting an integration branch.

#### With Node.js

If you prefer to run the scripts using Node.js instead of Bun, use the following commands:

```
npm run node:merge
```

Node.js counterpart of `bun merge`.

```
npm run node:validate -- --file=<filepath>
```

Node.js counterpart of `bun validate`.

`npm install` works without Bun: the workspace declares nothing npm cannot read. Run it once, then the two
commands only need Node. A `package-lock.json` is yours to keep: the repository ignores it and maintains `bun.lock`
only, and the CI runs under Bun.

Both commands run the same sources as the Bun commands, straight from `packages/`, with no build step: `--import
./scripts/node/register.js` installs two [module customization hooks](https://nodejs.org/api/module.html#customization-hooks)
that resolve the extensionless relative imports and hand every `.ts` module to esbuild, which removes the
TypeScript syntax Node cannot strip on its own (type-only imports, constructor parameter properties).

Both are covered by execution tests: `packages/cli-validate/cli/validate-cli.node.spec.js` and
`packages/cli-merge/cli/merge-cli.node.spec.js` spawn them as real Node processes on save files generated into a
temporary directory, and assert their output, their exit code and the content of the merged save. They run with
`bun test`, so a command that no longer starts under Node — or that loses the content of a save while still
reporting success — fails the suite instead of reaching a release. Running them needs the Node version
`engines.node` declares.


### Preparing data

#### 1. Create the `input` folder

Create one sub-folder per desired merge.

> ❗ Each sub-folder must contain **exactly 2 `.json` files**. A sub-folder holding any other number of `.json`
> files is skipped, with a warning on stderr naming it and the number of save files it holds.

**The sub-folder name becomes the `saveDisplayName`** of the resulting save.
This is the name you'll see when you'll be selecting your save in the game.

Example:

```
input/
└── Toxiprime/          ← desired name for the merged save
    ├── Standard-1.json ← save A
    └── Standard-3.json ← save B
```

#### 2. Run the merge

```bash
bun run merge
```

The CLI automatically processes every sub-folder found in `input/` and produces a new json file.

Example:

```
output/
└── Toxiprime/
    ├── Standard-1-Standard-3-merged.json   ← merged save, ready to be loaded in Planet Crafter
```

Copy the output file to the Planet Crafter saves folder (on Windows, it is usually located at
`%APPDATA%\..\LocalLow\MijuGames\Planet Crafter\`).

### Planet Crafter Save Format

The game uses a **non-standard JSON format**: multiple JSON blocks concatenated and separated by special delimiters.

> ❗More information about save format available in the docs folder.

#### Separators (as used in the merge result)

| Context                               | Character(s) |
|---------------------------------------|--------------|
| **Section** separator                 | `@\n`        |
| **Record** separator within a section | `\|\n`       |

Note: the file is ending by `@`.

#### Sections (in order)

A save splits into **11 sections indexed 0 to 10**. Sections 0 to 9 carry the data; section 10 is the reserved empty
part produced by the terminating `@`.

| #  | Content                                               | Format                 |
|----|-------------------------------------------------------|------------------------|
| 0  | Global metadata (`terraTokens`, `unlockedGroups`…)    | Single JSON object     |
| 1  | Terraformation levels per planet (`unitOxygenLevel`…) | `\|`-separated records |
| 2  | Players (position, gauges…)                           | `\|`-separated records |
| 3  | World objects (buildings, resources…)                 | `\|`-separated records |
| 4  | Inventories (id, `woIds`, size…)                      | `\|`-separated records |
| 5  | Statistics (`craftedObjects`…)                        | Single JSON object     |
| 6  | Mailbox (messages)                                    | `\|`-separated records |
| 7  | Triggered story events                                | `\|`-separated records |
| 8  | Save configuration (`saveDisplayName`, `worldSeed`…)  | `\|`-separated records |
| 9  | World events (asteroid / instance spawns)             | `\|`-separated records |
| 10 | Reserved — always empty                               | Empty                  |

#### Planet Identification

Each **world object** contains a `planet` field (numeric integer). The mapping from number to planet name uses the
numeric planet id (e.g. `110910045` for Toxicity).

### Merge Logic

> 📖 **[`docs/game-rules.md`](./docs/game-rules.md) is the single source of truth for every merge decision.**
> Each rule is numbered (`GR-*`), states the section it governs and names the module that implements it. This README
> deliberately does not restate the rules: a second copy would drift from the implementation.

The original saves are never modified; the merged result is written to a separate output folder.

| Topic                              | Rules                                                                                             |
|------------------------------------|---------------------------------------------------------------------------------------------------|
| Which save is A, which is B        | [Save order](./docs/game-rules.md#2-save-order) — `GR-ORDER-*`                                     |
| Global metadata                    | [Section 0](./docs/game-rules.md#3-section-0--global-metadata) — `GR-META-*`                       |
| Terraformation levels              | [Section 1](./docs/game-rules.md#4-section-1--terraformation-levels) — `GR-TERRA-*`                |
| Players                            | [Section 2](./docs/game-rules.md#5-section-2--players) — `GR-PLAYER-*`                             |
| World objects                      | [Section 3](./docs/game-rules.md#6-section-3--world-objects) — `GR-WO-*`                           |
| Inventories & equipment            | [Section 4](./docs/game-rules.md#7-section-4--inventories--equipment) — `GR-INV-*`                 |
| Statistics                         | [Section 5](./docs/game-rules.md#8-section-5--statistics) — `GR-STAT-*`                            |
| Messages / mailbox                 | [Section 6](./docs/game-rules.md#9-section-6--messages--mailbox) — `GR-MSG-*`                      |
| Story events                       | [Section 7](./docs/game-rules.md#10-section-7--story-events) — `GR-STORY-*`                        |
| Save configuration                 | [Section 8](./docs/game-rules.md#11-section-8--save-configuration) — `GR-CFG-*`                    |
| World events                       | [Section 9](./docs/game-rules.md#12-section-9--world-events) — `GR-EVT-*`                          |
| Duplicated ids across saves        | [Id conflict resolution](./docs/game-rules.md#13-id-conflict-resolution) — `GR-ID-*`               |
