# Energy Levels — Business Rules

> This document establishes the rules used to compute the available energy level (in kW) for a save file:
> total production, total consumption, and the balance.
> It complements [`docs/game-rules.md`](./game-rules.md) and [`docs/save-format.md`](./save-format.md).
>
> Sources: in-game data cross-checked with the community wiki
> ([Machine Optimizers](https://planet-crafter.fandom.com/wiki/Machine_Optimizers),
> [Fuse](https://planet-crafter.fandom.com/wiki/Fuse)).

---

## 1. Base energy values

Base production and consumption values (kW) per `WorldObject.gId`, **before any Optimizer/Fuse bonus**, are
defined in
[`packages/util-mapping/domain/energyLevelsByWorldObjectName.ts`](../packages/util-mapping/domain/energyLevelsByWorldObjectName.ts):

- `energyProductionLevelsByWorldObjectName` — energy producers (`EnergyGenerator1..6`, `WindTurbine1`).
- `energyConsumptionLevelsByWorldObjectName` — energy consumers (drills, heaters, extractors, spreaders, etc.).

**Rule EN-BASE-1:** The base energy balance of a save is
`sum(production of every positioned world object) - sum(consumption of every positioned world object)`,
using the tables above, **before** any Optimizer bonus is applied (see section 3). Only **positioned**
world objects (`pos` and `planet` both defined — see `GR-WO-1`) are counted: world objects without a
`pos` are not actually placed/active in the world (e.g. spare/unbuilt items) and do not contribute to
production or consumption. This was validated against a real save where the in-game HUD production
matched only after excluding un-positioned generators.

---

## 2. World object mapping (`worldObjectLabels.ts`)

| `gId`             | Label                    | Role                     |
|--------------------|--------------------------|--------------------------|
| `EnergyGenerator1`  | Wind turbine (T1)        | Energy producer          |
| `EnergyGenerator2`  | Solar panel T1           | Energy producer          |
| `EnergyGenerator3`  | Solar panel T2           | Energy producer          |
| `EnergyGenerator4`  | Nuclear Reactor T1       | Energy producer          |
| `EnergyGenerator5`  | Nuclear Reactor T2       | Energy producer          |
| `EnergyGenerator6`  | Nuclear Fusion generator | Energy producer          |
| `WindTurbine1`      | Wind turbine T2          | Energy producer          |
| `Optimizer1`        | Machine optimizer T1     | Fuse holder / booster    |
| `Optimizer2`        | Machine Optimizer T2     | Fuse holder / booster    |
| `FuseEnergy1`       | Energy Fuse              | Bonus item (goes inside an Optimizer) |

All values in `energyProductionLevelsByWorldObjectName` are, per the wiki, boostable by the Energy Fuse
(wind turbines, solar panels, nuclear reactors, nuclear fusion generator).

---

## 3. Optimizers & Fuses

### 3.1 What an Optimizer is

An **Optimizer** (`Optimizer1` = T1, `Optimizer2` = T2) is a machine world object that holds **Fuses** in its
linked inventory (`WorldObject.liId` → `Inventory.id` → `Inventory.woIds`). A Fuse only has an effect once
placed inside an Optimizer.

**Rule EN-OPT-1 (capacity):**

| Optimizer | Fuse slots | Max machines affected | Radius (perimeter) |
|-----------|-----------:|-----------------------:|--------------------:|
| `Optimizer1` (T1) | 1 | 5 | 120 m |
| `Optimizer2` (T2) | 3 | 8 | 250 m |

**Rule EN-OPT-2 (targeting):** An Optimizer boosts the **closest** machines of the type matching its fuse(s),
within its radius, up to its max-machines capacity. If more eligible machines exist in range than the capacity
allows, only the N closest (N = 5 or 8) receive the bonus; the rest are unaffected by that Optimizer.

**Rule EN-OPT-3 (multiple optimizers):** Multiple Optimizers (even holding the same fuse type) do not compete
for the same machines — each Optimizer independently selects its closest eligible machines, and their bonuses
stack on any machine boosted by more than one Optimizer.

### 3.2 The Energy Fuse (`FuseEnergy1`)

**Rule EN-FUSE-1 (identification):** In the world objects list, an Optimizer (`Optimizer1`/`Optimizer2`) is
relevant to energy computation only if its linked inventory contains at least one `FuseEnergy1` world object.

**Rule EN-FUSE-2 (bonus value):** Each `FuseEnergy1` gives a **power multiplier of 150%** to an affected
producer, i.e. one fuse raises the producer's output from 100% to 150% of its base value. This **replaces**
the producer's base 100% value rather than adding to it (see EN-FUSE-3 for multiple fuses).

**Rule EN-FUSE-3 (stacking — confirmed against real save data):** Multiple Energy Fuses affecting the same
machine (whether from one T2 Optimizer holding several `FuseEnergy1`, or from several Optimizers overlapping
on the same machine) stack **additively by their raw percentage value** (150% each), matching the pattern
documented on the [Fuse wiki page](https://planet-crafter.fandom.com/wiki/Fuse) for other multiplier fuses
(e.g. two Heat Fuses → 1000%, not 2500%: each Heat Fuse is 500%, and 2 × 500% = 1000%). A producer reached by
zero fuses keeps its base 100%:

```
totalFuses = sum of fuseCount over every Optimizer reaching this producer (EN-OPT-3)
multiplier = totalFuses === 0 ? 1 : totalFuses × 1.5
finalOutput = baseOutput × multiplier
```

This was verified against a real save file: 8 T2 Nuclear Reactors (base 331.5 kW each) reached by a
combination of a T1 Optimizer (1 fuse) and a T2 Optimizer (3 fuses) produced exactly 12762.75 kW in-game,
which matches this formula (4 reactors reached by both = 4 fuses × 331.5 × 1.5 = 1989 kW each; 3 reactors
reached by the T2 Optimizer only = 3 fuses × 331.5 × 1.5 = 1492.75... kW each — see the implementation for
the exact grouping). The Nuclear Fusion generator (base 1485 kW, reached by the same 4 fuses) produced
exactly 8910 kW = 1485 × 6.

**Rule EN-FUSE-4 (eligible producers):** Only energy-producing machines are boosted by the Energy Fuse: wind
turbines, solar panels (T1/T2), nuclear reactors (T1/T2) and the nuclear fusion generator — i.e. every `gId`
listed in `energyProductionLevelsByWorldObjectName`. Energy consumers (drills, heaters, extractors, …) are
never affected by the Energy Fuse.

---

## 4. Computation algorithm (implemented)

Implemented in
[`SaveSectionsReaderService.computeEnergyProductionLevel`](../packages/util-mapping/infrastructure/SaveSectionsReaderService.ts)
(and its private helper `computeEnergyFuseCountsByProducerId`).

To compute the true available energy level of a save, accounting for Optimizers:

1. Collect all world objects with a `pos` and `planet` (positioned objects only — see `GR-WO-1` and
   `EN-BASE-1`); un-positioned objects are excluded entirely from production and consumption.
2. Identify all `Optimizer1`/`Optimizer2` objects; for each, resolve its linked inventory via `liId` and list
   its contained fuses via `woIds`.
3. Keep only Optimizers whose inventory contains at least one `FuseEnergy1`; count how many `FuseEnergy1` each
   one holds (`fuseCount`).
4. For each qualifying Optimizer, find energy-producing machines (`gId` in
   `energyProductionLevelsByWorldObjectName`) on the **same `planet`**, within its radius (120 m for T1, 250 m
   for T2) of its `pos`, sorted by distance; keep at most its machine capacity (5 for T1, 8 for T2).
5. For each affected producer, accumulate `fuseCount` (summed across every Optimizer that reaches it — Rule
   EN-OPT-3) into a per-producer `totalFuses` count.
6. `multiplier = totalFuses === 0 ? 1 : totalFuses × 1.5`; `boostedProduction = baseProduction × multiplier`
   (Rule EN-FUSE-3).
7. Total energy level = `sum(boostedProduction for all positioned producers) - sum(baseConsumption for all
   positioned consumers)`.

**Validated against real save data** (see Rule EN-FUSE-3 above): this algorithm reproduces the exact in-game
HUD production value (24075.45 kW) for a real save containing 2 active Optimizers with Energy Fuses.

**Open points:**
- Distance metric implemented: straight-line 3D distance using `pos` (`"x,y,z"`), restricted to producers on
  the same `planet` as the Optimizer. Height (`y`) is included; this matched real save data as well as a
  horizontal-only (`x,z`) distance would have, so it hasn't been possible to distinguish the two — both gave
  the same targeting result in the validated save.
- A `FuseEnergy1` with `liId` unset / not inside an Optimizer inventory has no effect (ignored), as implemented.
