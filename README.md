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

Checks typings in all the project files (using `tsc --noEmit` under the hood).

```
bun run audit
```

Audits production and development dependencies. The two Picomatch advisories are explicitly allowlisted because
`micromatch` still requires the affected 2.x dependency transitively; they should be removed as soon as that upstream
constraint is updated.

```
bun run audit:quality
```

Runs the [Fallow](https://github.com/fallow-rs/fallow) audit and health reports (dead files, unused exports,
unresolved imports) against `master`, as the CI does.

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

#### With Node.js

If you prefer to run the scripts using Node.js instead of Bun, use the following commands:

```
npm run node:merge
```

Equivalent to `bun merge`.

```
npm run node:validate -- --file=<filepath>
```

Equivalent to `bun validate`.


### Preparing data

#### 1. Create the `input` folder

Create one sub-folder per desired merge.

> ❗ Each sub-folder must contain **exactly 2 `.json` files**.

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

#### Planet Identification

Each **world object** contains a `planet` field (numeric integer). The mapping from number to planet name uses the
numeric planet id (e.g. `110910045` for Toxicity).

### Merge Logic

> 📖 The authoritative specification for every merge decision is in **[`docs/game-rules.md`](./docs/game-rules.md)**.
> The tables below are a human-readable summary; the business rules document is the source of truth.

The original saves remain untouched, and the result is generated in a separate folder.

#### Save A and Save B

The saves have one "host planet" (= where the player started the game).
Prime hosted save is prioritized as Save A, otherwise it follows alphabetical order.
This order is important because in case of conflicting data, save A data will be kept and save B data will be lost.

#### Global Metadata

| Field                         | Strategy                                |
|-------------------------------|-----------------------------------------|
| `terraTokens`                 | **Sum** of both saves                   |
| `allTimeTerraTokens`          | **Sum** of both saves                   |
| `unlockedGroups`              | **Union** (no duplicates) of both lists |
| `openedInstanceSeed/TimeLeft` | Value from save A                       |

#### Players

- **Union** by `id` — every unique player from both saves is kept.
- On duplicate `id`, the version from **save A** takes precedence (this includes inventory and equipment).

This means that the duplicated player's inventory and equipment from save B is lost.

#### Planets present in BOTH saves

> ❗ Not implemented, not tested.

| Chosen strategy | World objects      | Terraformation levels     | Planet config            |
|-----------------|--------------------|---------------------------|--------------------------|
| `merge`         | Combined from both | **Maximum** of each value | Save A (source of truth) |
| `keepA`         | Save A only        | Save A                    | Save A                   |
| `keepB`         | Save B only        | Save B                    | Save B                   |

#### Messages & Story Events

- **Union** by `stringId`, no duplicates.
- For messages: if `isRead: true` in either save → `isRead: true` in the result.

#### Statistics

| Field            | Strategy              |
|------------------|-----------------------|
| `craftedObjects` | **Sum** of both saves |

#### Inventories

When a player is removed from the list (deduplication), the corresponding inventory and all the associated world objects are remove as well.
Otherwise, all inventories and objects are kept.

#### Duplicated IDs

When merging 2 saves, it is a common case to have the same ID used in both saves for different objects. Since we want to keep a maximum of
information from both saves (and especially objects), we need a strategy to resolve id conflicts.
Currently, the strategy retained is the following:

- generate a new unique id for save B item
- update all associated references from save B data
