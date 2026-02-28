# Planet Crafter Merge Saves

Merges two **Planet Crafter** save files into a single one, preserving as much information as possible.

## Table of Contents

1. [Prerequisites](#prerequisites)
1. [Installation](#installation)
1. [Scripts](#scripts)
1. [Preparing data](#preparing-data)
1. [Planet Crafter Save Format](#planet-crafter-save-format)
1. [Merge Logic](#merge-logic)



## Prerequisites
Using [Bun](https://bun.sh) `v1.3.10` by default.
Compatible with [Node.js](https://nodejs.org/) ≥ 18.

## Installation

```
bun install
```

## Scripts

```
bun merge
```
Generates the merged saves in output directory, by processing all subfolders from input folder.

```
bun validate -- <file>
```
Validates a json save file against the json schemas stored in this project. This is useful mostly for debugging.

```
bun test
```
```
bun test:watch
```
Execute all the unit tests of the project. Use `watch` to enable automatic run on save.

## Preparing data

### 1. Create the `input` folder

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


### 2. Run the merge

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

## Planet Crafter Save Format

The game uses a **non-standard JSON format**: multiple JSON blocks concatenated and separated by special delimiters.

> ❗More information about save format available in the docs folder.

### Separators (as used in the merge result)

| Context                               | Character(s)             |
|---------------------------------------|--------------------------|
| **Section** separator                 | `@\n`                    |
| **Record** separator within a section | `\|\n` |

Note: the file is ending by `@`.

### Sections (in order)

| # | Content                                              | Format                 |
|-|------------------------------------------------------|------------------------|
| 0 | Global metadata (`terraTokens`, `unlockedGroups`…)   | Single JSON object     |
| 1 | Terraformation levels per planet (`unitOxygenLevel`…) | `\|`-separated records |
| 2 | Players (position, gauges…)                          | `\|`-separated records |
| 3 | World objects (buildings, resources…)                | `\|`-separated records |
| 4 | Inventories (id, `woIds`, size…)                     | `\|`-separated records |
| 5 | Statistics (`craftedObjects`…)                       | Single JSON object     |
| 6 | Mailbox (messages)                                   | `\|`-separated records |
| 7 | Triggered story events                               | `\|`-separated records |
| 8 | Save configuration (`saveDisplayName`, `worldSeed`…) | `\|`-separated records |
| 9 | Terrain colour layers                                | `\|`-separated records |
| 10 | World events (asteroid / instance spawns)           |`\|`-separated records  |

### Planet Identification

Each **world object** contains a `planet` field (numeric integer). The mapping from number to planet name uses the terrain layer `layerId` values (format `PC-{PlanetId}-{LayerName}`).


## Merge Logic

The original saves remain untouched, and the result is generated in a separate folder.

### Save A and Save B

The saves have one "host planet" (= where the player started the game).
Prime hosted save is prioritized as Save A, otherwise it follows alphabetical order.
This order is important because in case of conflicting data, save A data will be kept and save B data will be lost.

### Global Metadata

| Field                         | Strategy                                |
|-------------------------------|--|
| `terraTokens`                 | **Sum** of both saves                   |
| `allTimeTerraTokens`          | **Sum** of both saves                   |
| `unlockedGroups`              | **Union** (no duplicates) of both lists |
| `openedInstanceSeed/TimeLeft` | Value from save A                       |

### Players

- **Union** by `id` — every unique player from both saves is kept.
- On duplicate `id`, the version from **save A** takes precedence (this includes inventory and equipment).

This means that the duplicated player's inventory and equipment from save B is lost.

### Planets present in BOTH saves

> ❗ Not implemented, not tested.

| Chosen strategy | World objects | Terraformation levels | Planet config            |
|-|-|-|--------------------------|
| `merge` | Combined from both | **Maximum** of each value | Save A (source of truth) |
| `keepA` | Save A only | Save A | Save A                   |
| `keepB` | Save B only | Save B | Save B                   |


### Messages & Story Events

- **Union** by `stringId`, no duplicates.
- For messages: if `isRead: true` in either save → `isRead: true` in the result.

### Statistics

| Field | Strategy              |
|-|-----------------------|
| `craftedObjects` | **Sum** of both saves |

### Inventories

When a player is removed from the list (deduplication), the corresponding inventory and all the associated world objects are remove as well. Otherwise, all inventories and objects are kept.

### Duplicated IDs

When merging 2 saves, it is a common case to have the same ID used in both saves for different objects. Since we want to keep a maximum of information from both saves (and especially objects), we need a strategy to resolve id conflicts.
Currently, the strategy retained is the following:
- generate a new unique id for save B item
- update all associated references from save B data
