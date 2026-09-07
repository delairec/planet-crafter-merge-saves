# Energy Levels — Business Rules

> This document establishes the rules used to compute the available energy level (in kW) for a save file:
> total production, total consumption, and the balance — computed independently **per planet** (Rule
> EN-PLANET-1), since each planet has its own power grid in-game.
> It complements [`docs/game-rules.md`](./game-rules.md) and [`docs/save-format.md`](./save-format.md).
>
> Sources: in-game data cross-checked with the community wiki
> ([Machine Optimizers](https://planet-crafter.fandom.com/wiki/Machine_Optimizers),
> [Fuse](https://planet-crafter.fandom.com/wiki/Fuse)).

---

## 1. Base energy values

Base production and consumption values (kW) per `WorldObject.gId`, **before any Optimizer/Fuse bonus**, are
defined in
[
`packages/util-mapping/domain/energyLevelsByWorldObjectName.ts`](../packages/core-mapping/src/domain/energyLevelsByWorldObjectName.ts):

- `energyProductionLevelsByWorldObjectName` — energy producers (`EnergyGenerator1..6`, `WindTurbine1`).
- `energyConsumptionLevelsByWorldObjectName` — energy consumers: drills, heaters, extractors, spreaders,
  atmosphere purifiers, detoxification machines, toxic/atmospheric/lake water collectors, vegetubes, algae
  generators, food growers, the DNA manipulator, the biolab, the incubator, the auto-crafter, craft stations
  (T2, Advanced, Quartz, Refinement), the vehicle station, beehives, the butterfly dome, biodomes, the launch
  platform, display screens, lamps and the beacon; plus, since the 2026-09-07 cross-check, outdoor farms, fish
  farms, aquariums, butterfly farms, the amphibian farm, the animal shelter, the animal feeder, the ecosystem,
  the silk generator, the water life collector, the genetic synthesizer and extractor, ore crushers, the
  harvesting robot, the drone station, the portal generator, the interplanetary exchange shuttle, the
  planetary delivery depot and the extraction platform.

**Rule EN-BASE-2 (exhaustiveness):** every positioned `WorldObject` whose `gId` corresponds to a machine that
has a power cost in-game must have an entry in `energyConsumptionLevelsByWorldObjectName`, otherwise the
computed total consumption falls short of the in-game HUD value. A prior version of this table only covered a
subset of consumers (drills, heaters, extractors, spreaders, recycling machines, the communication antenna and
the teleporter), which under-reported total consumption by several thousand kW on real saves containing water
collectors, atmosphere purifiers, detoxification machines, craft stations, biodomes, etc. All added values were
cross-checked against the wiki (see the [Craft Stations](https://planet-crafter.fandom.com/wiki/Craft_Stations),
[Atmosphere Purifiers](https://planet-crafter.fandom.com/wiki/Atmosphere_Purifiers),
[Detoxification Machines](https://planet-crafter.fandom.com/wiki/Detoxification_Machines),
[Toxic Water Collectors](https://planet-crafter.fandom.com/wiki/Toxic_Water_Collectors),
[Biodomes](https://planet-crafter.fandom.com/wiki/Biodomes),
[Base Building](https://planet-crafter.fandom.com/wiki/Base_Building) and
[Display Screens](https://planet-crafter.fandom.com/wiki/Display_Screens) wiki pages).

**EN-BASE-2 is not verifiable by a unit test, and no test claims it.** The rule is a statement about the
*game*, and this repository holds no inventory of the game's power-drawing machines that is independent of the
table the rule constrains. `worldObjectNames.ts` is not such an inventory: it mixes machines with resources,
seeds, furniture and posters, it has no effect at runtime (it only derives the `WorldObjectName` type, and every
construction site casts through `as WorldObjectName`), and it is itself incomplete. Reference saves cannot serve
either — they are private and unavailable in CI. A test whose input set is `Object.keys(...)` of the table under
test therefore cannot fail on the very defect the rule describes, and must not be titled as if it could.

**What the versioned guard does cover.** `computeEnergyConsumptionLevel.spec.ts` asserts that every name in
`WORLD_OBJECT_NAMES` belonging to a machine family that already draws power has an energy level. Its input set
comes from `worldObjectNames.ts`, not from the table, so deleting a table entry turns it red instead of silently
dropping a case. It catches the regression that actually occurs — a new tier of a known machine (a `Drill5`, an
`OreBreaker4`) reaching the type without a value. It does **not** catch a wholly new machine family, nor the
removal of a family's only entry (`Beacon`, `ComAntenna`), and it recognizes a family by stripping trailing tier
digits off the name, which is a naming convention rather than a declaration.

**Identifying a `gId` before pricing it.** `gId`s do not reliably match wiki page titles: `OreBreaker*` is the
Ore Crusher and not the Ore Extractor, `InterplanetaryExchangePlatform1` is the Interplanetary Exchange Shuttle,
and `LarvaeBase1..3` are larva *items* rather than machines. Every `gId` added to the table is therefore first
resolved against the game's own English localization label file (`GROUP_NAME_<gId>=<display name>`) before its
value is read off the corresponding wiki page.

**Last wiki cross-check: 2026-09-07**, against game version 2.102. It covered every `gId` observed placed in the
reference saves. Machines whose wiki page documents the object but prints no energy value — among them the
Megadome, the trade space rocket, the light box, the hologram projector, the server, the planet viewer, the
cooking station and the display boxes — are deliberately absent from the table rather than priced at zero: an
absent infobox field is an undocumented value, not a stated absence of cost. Resources, seeds, growables,
furniture, structural parts, posters, effigies and rockets are excluded as non-machines. Two exclusions rest on
an explicit statement rather than on silence: drones draw no power of their own ("Each additional Drone does not
draw any energy", [Drone Station](https://planet-crafter.fandom.com/wiki/Drone_Station)), and the wreck
[fusion reactor](https://planet-crafter.fandom.com/wiki/Fusion_reactor) is inert scenery that "ha[s] run out of
power since [it] crashed" — not the player-built nuclear fusion generator, which the same page disambiguates.

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
| `Optimizer1`        | Machine optimizer T1     | Fuse holder / booster **and** energy consumer (50 kW) |
| `Optimizer2`        | Machine Optimizer T2     | Fuse holder / booster **and** energy consumer (150 kW) |
| `FuseEnergy1`       | Energy Fuse              | Bonus item (goes inside an Optimizer) |

All values in `energyProductionLevelsByWorldObjectName` are, per the wiki, boostable by the Energy Fuse
(wind turbines, solar panels, nuclear reactors, nuclear fusion generator).

**Note:** Optimizers themselves draw power (50 kW for T1, 150 kW for T2, per the
[Machine Optimizers wiki page](https://planet-crafter.fandom.com/wiki/Machine_Optimizers)) — they are listed
in `energyConsumptionLevelsByWorldObjectName` in addition to their role as fuse holders/boosters.

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
[
`SaveSectionsReaderService.computeEnergyProductionLevel`](../packages/core-mapping/src/infrastructure/SaveSectionsReaderService.ts)
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

**Rule EN-PLANET-1 (per-planet scoping, resolved):** each planet has its own independent power grid in-game.
Steps 1–7 above are therefore applied **once per distinct `WorldObject.planet`** rather than once globally:
positioned world objects are grouped by `planet` first, and production, consumption, available, breakdowns
and Optimizers are all computed from each planet's own subset only (`SaveSectionsReaderService.getEnergyLevels`
returns `EnergyLevelsValueObject.planets`, one entry per planet). Optimizer targeting was already restricted to
producers on the same `planet` (Rule EN-OPT-2), so no cross-planet leakage was possible there; this rule only
formalizes that production/consumption/breakdowns are scoped the same way.

**Rule EN-PLANET-2 (planet label resolution):** each planet is labelled using the fixed numeric-id → name
lookup table documented in [`docs/save-format.md`](./save-format.md#3--world-objects) ("Planet numeric IDs"),
looked up by `SaveSectionsReaderService.resolvePlanetLabel`. For planet ids not in that table (e.g. future
planets, modded content), a fallback heuristic applies: some world object `gId`s embed the planet name in
plain text (e.g. `Seed7Humble` on planet `Humble`) — if exactly one of the save's known planet names (from
`TerraformationLevels`) is found as a substring of a `gId` among that planet's world objects, that name is
used as the label; otherwise the label falls back to `` `Planet ${planetId}` ``.

**Open points:**
- Distance metric implemented: straight-line 3D distance using `pos` (`"x,y,z"`), restricted to producers on
  the same `planet` as the Optimizer. Height (`y`) is included; this matched real save data as well as a
  horizontal-only (`x,z`) distance would have, so it hasn't been possible to distinguish the two — both gave
  the same targeting result in the validated save.
- A `FuseEnergy1` with `liId` unset / not inside an Optimizer inventory has no effect (ignored), as implemented.
- The planet label fallback heuristic (Rule EN-PLANET-2) only applies to planet ids missing from the static
  lookup table (e.g. planets added by a future game update, or modded content); if that ever fails too, the
  label falls back to a plain numeric id.

---

## 5. Optimizers section (UI)

The UI's Power section displays one card per planet (`EnergyLevelsViewModel.planets`, one
`PlanetEnergyLevelsViewModel` per distinct `WorldObject.planet` — see Rule EN-PLANET-1), each labelled with its
resolved planet name (Rule EN-PLANET-2). Within each planet's card, one sub-card per qualifying Optimizer
(`PlanetEnergyLevelsValueObject.optimizers`, built by `SaveSectionsReaderService.computeOptimizers` scoped to
that planet's world objects) shows:

- the label (`Machine optimizer T1` / `Machine Optimizer T2`);
- its Energy Fuse count (`fuseCount`);
- which machines it boosts and how many of each (`boostedMachines`, grouped by `gId` among the producers it
  reaches — same selection as `computeEnergyFuseCountsByProducerId`, see section 4);
- its **own contribution to production, computed in isolation** (`contribution`): for each producer it
  boosts, `baseLevel × fuseCount × 1.5`, summed across all boosted producers. When a producer is reached by
  several Optimizers (Rule EN-OPT-3), each Optimizer's card reports its own share rather than the producer's
  final combined output, so contributions across cards do not necessarily sum to `production - baseProduction`.
