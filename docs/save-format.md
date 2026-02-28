# Planet Crafter — Save file format

> ❗Docs written by AI from save file analysis (proofread, but still can include mistakes)

---
**JSON Schemas** : each section has a validation schema in [`docs/schemas/`](./schemas/).
The root schema [`save-file.schema.json`](./schemas/save-file.schema.json) validates a fully parsed save (array of 12 sections).

## General structure

A save file is a raw text string split into **12 sections** (indexes 0 to 11) separated by `@`. Each section is a list of JSON objects
separated by `|\n`.
The file ends with `@`.

```
<section 0>@<section 1>@...@<section 11>@
```

```
entry1|
entry2|
entry3
```

---

## Entity Relationship Diagram

(Mermaid format)

```mermaid
erDiagram
    PLAYER {
        int64   id             PK "Steam ID"
        string  name
        int     inventoryId    FK
        int     equipmentId    FK
        string  playerPosition "x,y,z"
        string  playerRotation "x,y,z,w (quaternion)"
        float   playerGaugeOxygen
        float   playerGaugeThirst
        float   playerGaugeHealth
        float   playerGaugeToxic
        bool    host
        string  planetId       FK
    }

    INVENTORY {
        int     id             PK
        string  woIds          FK "comma-separated WorldObject ids"
        int     size
        string  demandGrps     "optional — demand groups (trade)"
        string  supplyGrps     "optional — supply groups (trade)"
        int     priority       "optional — trade priority"
    }

    WORLD_OBJECT {
        int     id             PK
        string  gId            "Game ID — object type (e.g. EscapePodToxicity)"
        string  pos            "optional — x,y,z"
        string  rot            "optional — quaternion"
        int     planet         FK "numeric planet id"
        string  count          "optional — quantity (e.g. ores)"
        float   grwth          "optional — growth (plants)"
        float   pnls           "optional — power output (solar panels)"
        string  color          "optional — RGBA color"
        int     trtInd         "optional — terraformation index"
        int     liId           "optional — linked list id"
        string  text           "optional — displayed text"
        string  liGrps         "optional — list groups"
        int     linkedWo       "optional — linked WorldObject id"
        string  siIds          "optional — sub-inventory ids"
        float   trtVal         "optional — terraformation value"
        float   hunger         "optional — hunger (animals)"
        string  set            "optional — configuration set"
    }

    TERRAIN_LAYER {
        string  layerId        PK "e.g. PC-Toxicity-Layer2"
        int     planet         FK "numeric planet id"
        string  colorBase      "R-G-B-A"
        string  colorCustom    "R-G-B-A"
        int     colorBaseLerp  "0-255"
        int     colorCustomLerp "0-255"
    }

    PLAYER ||--o{ INVENTORY : "inventoryId → id"
    PLAYER ||--o{ INVENTORY : "equipmentId → id"
    INVENTORY ||--o{ WORLD_OBJECT : "woIds → id"
    WORLD_OBJECT ||--o| WORLD_OBJECT : "linkedWo → id"
```

---

## Sections details

### #0 — Player Progression (tokens & unlocked groups)

**Cardinality:** 1 unique entry.

| Property                 | Type     | Description                                      |
|--------------------------|----------|--------------------------------------------------|
| `terraTokens`            | `number` | Current terraformation tokens                    |
| `allTimeTerraTokens`     | `number` | Total tokens earned since the beginning          |
| `unlockedGroups`         | `string` | Comma separated list of unlocked research groups |
| `openedInstanceSeed`     | `number` | Open dungeon instance seed (0 = none)            |
| `openedInstanceTimeLeft` | `number` | Remaining instance time (seconds)                |

---

### #1 — Terraformation Levels

**Cardinality:** 1 unique entry. Domain key: `planetId`.

| Property                | Type     | Description                                    |
|-------------------------|----------|------------------------------------------------|
| `planetId`              | `string` | Planet textual id (e.g. `"Toxicity"`)          |
| `unitOxygenLevel`       | `float`  | Oxygen level                                   |
| `unitHeatLevel`         | `float`  | Heat level                                     |
| `unitPressureLevel`     | `float`  | Pressure level                                 |
| `unitPlantsLevel`       | `float`  | Plants level                                   |
| `unitInsectsLevel`      | `float`  | Insects level                                  |
| `unitAnimalsLevel`      | `float`  | Animals level                                  |
| `unitPurificationLevel` | `float`  | Purification level (-1 if not Toxicity planet) |

---

### #2 — Players

**Cardinality:** N entries (one by player). Domain key: `id` + `name` (unique).

| Property            | Type     | Description                                            |
|---------------------|----------|--------------------------------------------------------|
| `id`                | `int64`  | Steam ID of the player (primary key)                   |
| `name`              | `string` | Steam Name of the player (deduplication key)           |
| `inventoryId`       | `int`    | → `Inventory.id` (section 4) — inventory of the player |
| `equipmentId`       | `int`    | → `Inventory.id` (section 4) — equipment of the player |
| `playerPosition`    | `string` | 3D Position `"x,y,z"`                                  |
| `playerRotation`    | `string` | Quaternion rotation `"x,y,z,w"`                        |
| `playerGaugeOxygen` | `float`  | Oxygen level (gauge)                                   |
| `playerGaugeThirst` | `float`  | Thirst level                                           |
| `playerGaugeHealth` | `float`  | Health level                                           |
| `playerGaugeToxic`  | `float`  | Toximeter (lower = better)                             |
| `host`              | `bool`   | `true` if the player is the host                       |
| `planetId`          | `string` | Player's current planet                                |

---

### #3 — World Objects

**Cardinality:** N entries (buildings, resources, plants…). Domain key: `id`.

All properties except `id` and `gId` are optional depending on object type.

| Property   | Type     | Description                                                                                 |
|------------|----------|---------------------------------------------------------------------------------------------|
| `id`       | `int`    | Unique object ID                                                                            |
| `gId`      | `string` | Game ID — object type (e.g. `"WindTurbineT1"`)                                              |
| `pos`      | `string` | 3D position `"x,y,z"`                                                                       |
| `rot`      | `string` | Quaternion rotation `"x,y,z,w"`                                                             |
| `planet`   | `int`    | Planet numeric ID (e.g. `110910045` for Toxicity)                                           |
| `count`    | `string` | Amount or cumulative state (e.g. ores in a vein `"0,125"`)                                  |
| `grwth`    | `float`  | Growth progression (plants)                                                                 |
| `pnls`     | `float`  | Produced power (solar panels, generators)                                                   |
| `color`    | `string` | RGBA color of object                                                                        |
| `trtInd`   | `int`    | Associated terraformation stage index                                                       |
| `liId`     | `int`    | Associated container id (required for specific machines)                                    |
| `text`     | `string` | Displayed text (signs, pannels)                                                             |
| `liGrps`   | `string` | Comma separated list of associated object types (item generation, blueprint)                |
| `linkedWo` | `int`    | → `WorldObject.id` — associated world object (e.g. toxic water generator ↔ associated lake) |
| `siIds`    | `string` | Comma separated list of generated items (e.g. beans generated by a farm)                    |
| `trtVal`   | `float`  | Terraformation contribution value                                                           |
| `hunger`   | `float`  | Animal hunger                                                                               |
| `set`      | `string` | Unkown usage (always set to "1" when present)                                               |

---

### #4 — Inventaires & equipments

**Cardinality:** N entries. Domain key: `id`.

Inventory may be referenced by `Player.inventoryId`, by `Player.equipmentId`, or by a `WorldObject` (buildings, machines…).

| Property     | Type     | Description                                                     |
|--------------|----------|-----------------------------------------------------------------|
| `id`         | `int`    | Unique id of the inventory                                      |
| `woIds`      | `string` | Comma separated list of `WorldObject` contained (`""` if empty) |
| `size`       | `int`    | Maximum capacity of the inventory                               |
| `demandGrps` | `string` | (optional) Demand groups for auto-trade (drones)                |
| `supplyGrps` | `string` | (optional) Supply groups for auto-trade (drones)                |
| `priority`   | `int`    | (optional) Logistics priority (drones)                          |

---

### #5 — Statistiques

**Cardinality:** 1 unique entry.

| Property            | Type  | Description                       |
|---------------------|-------|-----------------------------------|
| `craftedObjects`    | `int` | Total objects crafted since start |
| `totalSaveFileLoad` | `int` | Number of save file loads         |
| `totalSaveFileTime` | `int` | Total recorded playtime (seconds) |

---

### #6 — Mailbox

**Cardinality:** N entries. Domain key: `stringId`.

| Property   | Type     | Description                                  |
|------------|----------|----------------------------------------------|
| `stringId` | `string` | Unique id of the message (deduplication key) |
| `isRead`   | `bool`   | `true` if message has been read              |

---

### #7 — Triggered Story Events

**Cardinality:** N entries. Domain key: `stringId`.

| Property   | Type     | Description                            |
|------------|----------|----------------------------------------|
| `stringId` | `string` | Unique id of the triggered story event |

---

### #8 — Save configuration

**Cardinality:** 1 unique entry.

| Property                                  | Type     | Description                                           |
|-------------------------------------------|----------|-------------------------------------------------------|
| `saveDisplayName`                         | `string` | Name displayed in slot list                           |
| `planetId`                                | `string` | Host planet for the save (where the game started)     |
| `unlockedSpaceTrading`                    | `bool`   | Cheat - if enabled, unlocks space trading from start  |
| `unlockedOreExtrators`                    | `bool`   | Cheat - if enabled, unlocks ore extractors from start |
| `unlockedTeleporters`                     | `bool`   | Cheat - if enabled, unlocks teleporters from start    |
| `unlockedDrones`                          | `bool`   | Cheat - if enabled, unlocks drones from start         |
| `unlockedAutocrafter`                     | `bool`   | Cheat - if enabled, unlocks autocrafters from start   |
| `unlockedEverything`                      | `bool`   | Cheat - if enabled, unlocks everything from start     |
| `freeCraft`                               | `bool`   | Cheat - if enabled, crafts don't require resources    |
| `preInterplanetarySave`                   | `bool`   | Save created before interplanetary system             |
| `randomizeMineables`                      | `bool`   | Randomized mineable resources                         |
| `modifierTerraformationPace`              | `float`  | Terraformation speed multiplier                       |
| `modifierPowerConsumption`                | `float`  | Power consumption speed multiplier                    |
| `modifierGaugeDrain`                      | `float`  | Gauge drain speed multiplier                          |
| `modifierMeteoOccurence`                  | `float`  | Weather events frequency multiplier                   |
| `modifierMultiplayerTerraformationFactor` | `float`  | Multiplayer terrformation speed factor                |
| `modded`                                  | `bool`   | If true, this game was altered by mods                |
| `version`                                 | `string` | Game version                                          |
| `mode`                                    | `string` | Game mode (e.g. `"Standard"`)                         |
| `dyingConsequencesLabel`                  | `string` | Death consequences (e.g. `"DropSomeItems"`)           |
| `startLocationLabel`                      | `string` | Game start location label (e.g. `"Standard"`)         |
| `worldSeed`                               | `int`    | World seed                                            |
| `hasPlayedIntro`                          | `bool`   | Intro has been played                                 |
| `gameStartLocation`                       | `string` | Game start location                                   |

---

### #9 — Terrain Layers

**Cardinality:** N entries. Domain key: `layerId` + `planet`.

Visual appearance of terrain layers (colors, biomes).

| Property          | Type     | Description                                   |
|-------------------|----------|-----------------------------------------------|
| `layerId`         | `string` | Id of the layer (e.g. `"PC-Toxicity-Layer2"`) |
| `planet`          | `int`    | Planet numeric ID                             |
| `colorBase`       | `string` | Base color as `"R-G-B-A"`                     |
| `colorCustom`     | `string` | Custom color as `"R-G-B-A"`                   |
| `colorBaseLerp`   | `int`    | Base color intensity (≥ 0)                    |
| `colorCustomLerp` | `int`    | Custom color intensity (≥ 0)                  |

---

### #10 — World Events

**Cardinality:** N entries (can be empty). Domain key: `planet` + `seed` + `pos`.

| Property            | Type     | Description                                         |
|---------------------|----------|-----------------------------------------------------|
| `planet`            | `int`    | Planet numeric ID                                   |
| `seed`              | `int`    | Event seed                                          |
| `pos`               | `string` | 3D position `"x,y,z"`                               |
| `owner`             | `int`    | Event owner (0 = world)                             |
| `index`             | `int`    | Event index                                         |
| `rot`               | `string` | 3D rotation `"x,y,z,w"`                             |
| `wrecksWOGenerated` | `bool`   | True if wrecks already generated                    |
| `woIdsGenerated`    | `string` | Comma separated list of generated world objects ids |
| `woIdsDropped`      | `string` | Comma separated list of dropped world objects ids   |
| `version`           | `int`    | Event version                                       |

---

### #11 — (Unknown)

**Cardinality:** 0 entries in analyzed save files. 

The last occurence of `@` in the save file suggests a 12th section but was never observed in analyzed save files.

---

## Cross-Section Relationship Map (Summary)

```
Section 2 (Player)
  └─ inventoryId ──────────────────────┐
  └─ equipmentId ──────────────────────┤
                                        ▼
                               Section 4 (Inventory)
                                  └─ woIds ──────────┐
                                                      ▼
                                           Section 3 (WorldObject)
                                              └─ linkedWo ──► Section 3 (WorldObject)
```

