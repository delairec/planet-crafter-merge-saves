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
  planetary delivery depot, the extraction platform and, since the 2026-09-09 cross-check, the T2
  incubator and the intense area lamp.

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
*game*: proving it would need an inventory of the game's power-drawing machines *and of their cost*, which no
public source provides. `worldObjectNames.ts` now inventories the `gId`s themselves (see section 6), but it says
which world objects exist, not which of them draw power. Reference saves cannot serve either — they are private
and unavailable in CI. A test whose input set is `Object.keys(...)` of the table under test therefore cannot fail
on the very defect the rule describes, and must not be titled as if it could.

**What the versioned guard covers.** `worldObjectNames.ts` declares every known `gId` in exactly one of three
groups — producing energy, consuming energy, or without a known energy level (section 6) — and
`computeEnergyConsumptionLevel.spec.ts` / `computeEnergyProductionLevel.spec.ts` assert the two directions of that
partition: every name of the producing and consuming groups yields a strictly positive level, and no name of the
third group yields any. Consequences: removing a table entry turns the suite red (including the entry of a machine
that has no sibling tier, `Beacon` or `ComAntenna`, which the earlier by-family guard let through), pricing a name
without moving it into its group turns it red, and a `gId` added on the next regeneration of the list cannot reach
the type without an energy decision being made about it.

It does **not** prove EN-BASE-2: putting a machine in the third group asserts only that *this repository has not
established* a level for it, never that the game charges nothing for it. The machines whose cost the sources leave
undecided are listed below, and they sit in that third group.

**Identifying a `gId` before pricing it.** `gId`s do not reliably match wiki page titles: `OreBreaker*` is the
Ore Crusher and not the Ore Extractor, `InterplanetaryExchangePlatform1` is the Interplanetary Exchange Shuttle,
and `LarvaeBase1..3` are larva *items* rather than machines. Every `gId` added to the table is therefore first
resolved to a display name through the label file described in section 6, before its value is read off the
corresponding wiki page.

**Last wiki cross-check: 2026-09-09**, against game version 2.102. It covered every `gId` observed placed in the
reference saves. Machines whose wiki page documents the object but prints no energy value — among them the
Megadome, the trade space rocket, the light box, the hologram projector, the server, the planet viewer, the
cooking station and the display boxes — are deliberately absent from the table rather than priced at zero: an
absent infobox field is an undocumented value, not a stated absence of cost. Resources, seeds, growables,
furniture, structural parts, posters, effigies and rockets are excluded as non-machines. Two exclusions rest on
an explicit statement rather than on silence: drones draw no power of their own ("Each additional Drone does not
draw any energy", [Drone Station](https://planet-crafter.fandom.com/wiki/Drone_Station)), and the wreck
[fusion reactor](https://planet-crafter.fandom.com/wiki/Fusion_reactor) is inert scenery that "ha[s] run out of
power since [it] crashed" — not the player-built nuclear fusion generator, which the same page disambiguates.

**Source registry.** The values the 2026-09-07/09 cross-check added to
`energyConsumptionLevelsByWorldObjectName`, with the machine each `gId` names and the page the value was read
from (game v2.102). Earlier values are sourced by the wiki pages listed in EN-BASE-2 above.

| `gId` | In-game machine | kW | Source |
|---|---|---:|---|
| `FishFarm1`, `FishFarm2` | Fish farm, T2 fish farm | 155.5, 185 | [Fish Farms and Aquariums](https://planet-crafter.fandom.com/wiki/Fish_Farms_and_Aquariums) |
| `Aquarium1`, `Aquarium2` | T1 / T2 aquarium | 75, 225 | same page |
| `ButterflyFarm1..3` | Butterfly farm, T2, T3 | 30, 45, 196 | [Butterfly Farms](https://planet-crafter.fandom.com/wiki/Butterfly_Farms) |
| `Farm1`, `Farm2` | Outdoor farm, T2 outdoor farm | 45.5, 165 | [Outdoor Farm](https://planet-crafter.fandom.com/wiki/Outdoor_Farm) |
| `AmphibiansFarm1` | Amphibian farm | 155 | [Amphibian Farm](https://planet-crafter.fandom.com/wiki/Amphibian_Farm) |
| `AnimalShelter1` | Animal shelter | 270 | [Animal Shelter](https://planet-crafter.fandom.com/wiki/Animal_Shelter) |
| `AnimalFeeder1` | Animal feeder | 95 | [Animal Feeder](https://planet-crafter.fandom.com/wiki/Animal_Feeder) |
| `Ecosystem1` | Ecosystem | 325 | [Ecosystem](https://planet-crafter.fandom.com/wiki/Ecosystem) |
| `SilkGenerator` | Silk generator | 38 | [Silk Generator](https://planet-crafter.fandom.com/wiki/Silk_Generator) |
| `WaterLifeCollector1` | Water life collector | 105.5 | [Water Life Collector](https://planet-crafter.fandom.com/wiki/Water_Life_Collector) |
| `GeneticSynthetizer1` | Genetic synthesizer | 292 | [Genetic Synthesizer](https://planet-crafter.fandom.com/wiki/Genetic_Synthesizer) |
| `GeneticExtractor1` | Genetic extractor | 317.5 | [Genetic Extractor](https://planet-crafter.fandom.com/wiki/Genetic_Extractor) |
| `OreBreaker1..3` | T1/T2/T3 ore crusher — not the ore extractor | 2.6, 21, 125 | [Ore Crushers](https://planet-crafter.fandom.com/wiki/Ore_Crushers) |
| `HarvestingRobot1` | Harvesting robot | 120 | [Harvesting Robot](https://planet-crafter.fandom.com/wiki/Harvesting_Robot) |
| `DroneStation1` | Drone station | 850 | [Drone Station](https://planet-crafter.fandom.com/wiki/Drone_Station) |
| `PortalGenerator1` | Portal generator | 1890 | [Portal Generator](https://planet-crafter.fandom.com/wiki/Portal_Generator) |
| `InterplanetaryExchangePlatform1` | Interplanetary exchange shuttle | 375 | [Interplanetary Logistics](https://planet-crafter.fandom.com/wiki/Interplanetary_Logistics) |
| `PlanetaryDeliveryDepot1` | Planetary delivery depot | 450 | same page |
| `DeparturePlatform`, `DeparturePlatformHumble` | Extraction platform, and the same machine on the second planet | 265, 265 | [Extraction Platform](https://planet-crafter.fandom.com/wiki/Extraction_Platform) |
| `Incubator2` | T2 incubator | 715 | [Incubator](https://planet-crafter.fandom.com/wiki/Incubator) (`energy=-715.00 kW/s`) |
| `InsideLamp2` | Intense area lamp | 25 | [Base Building](https://planet-crafter.fandom.com/wiki/Base_Building) (`energy = -25 kW/s`) |

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

---

## 6. World object names and labels

`packages/core-mapping/src/domain/worldObjectNames.ts` lists the `gId`s the game is known to use, and derives the
`WorldObjectName` type from them. Until 2026-09-09 the list had been collected by hand from sources that were not
recorded, and it was wrong in both directions: it carried 104 names nothing corroborated and lacked 56 that two
independent sources attest, among them `Incubator2` and `InsideLamp2`, two real consumers that could not be priced
because the type refused them.

**Attestation rule.** A name is kept only if at least one of these two sources carries it:

- the 639 `GROUP_NAME_<gId>=<display name>` keys of the English label file of the community mod [(UI) English Plus Translation](https://github.com/akarnokd/ThePlanetCrafterMods/blob/3f10f457eb9dab78537a3b9dc9f1692679782391/UITranslationEnglishPlus/labels-engplus.txt).
  That mod overrides the game's vanilla English labels, so its *wording* is community-made, but its *keys* are the
  game's own group identifiers — a translation file that used any other key would not resolve in-game. It targets
  game version 2.102 (`LibCommon/GameVersionCheck.cs`, `TargetVersion = "2.102"`), and it is the source that
  distinguishes `OreBreaker*` (ore crusher) from `OreExtractor*`, `InterplanetaryExchangePlatform1` (exchange
  shuttle) and `LarvaeBase1..3` (larva items, not machines).
- the `gId`s read in the six private reference saves — 14 further names, all unlabelled scenery, blueprints and
  escape pods (`RockExplodable`, `Elevator`, `GenerationGroupVein`, `Blueprint*`, `EscapePod*`, …).

The 104 names attested by neither were dropped, including the six `*T*` spellings
(`AirPurificationMachine1T1`..`4T4`, `AlgaeGenerator1T1`, `2T2`): the label file has an entry for every plain
tier and none for any `*T*` form, and none of them appears in a reference save. Dropping a name has no runtime
effect — every construction site casts through `as WorldObjectName` — so the risk of dropping a real one is a
name to re-add, not a defect.

**Energy partition.** The list is declared as three groups whose concatenation is `WORLD_OBJECT_NAMES`: producing
energy, consuming energy, and without a known energy level. Totality is by construction rather than asserted, and
the guard described in section 1 turns any drift between a group and a table red.

**Labels.** `packages/core-mapping/src/presentation/worldObjectLabels.ts` maps every `WorldObjectName` to a
display label. Its three sub-tables are typed `satisfies Partial<Record<WorldObjectName, string>>` and their union
is typed `Record<WorldObjectName, string>`, so a label for an unknown name and a name without a label are both
type errors: the two files can no longer drift apart. The 25 labels added on 2026-09-09 come from the label file
above.

**Open point — label wording.** 178 of the 614 labels this repository shares with the label file differ in more
than word order or case, and the repository's wording is often the more useful of the two: it disambiguates names
the game repeats (`GoldenEffigie1..9` are all "Golden effigy" in the game, `WreckEntryLocked1..5` all "Access
Console") and carries bonus percentages the label file does not print. The labels were therefore left as they are.
Two of the differences are identity discrepancies rather than wording, and are worth settling before the labels are
trusted: `GeneticManipulator1` ("DNA Manipulator" here, "Tree seed sequencer" in the label file, no wiki page under
either name) and `DebrisContainer1` ("Debris" here, "Container from space" in the label file). The first also
carries an energy value (117.5 kW) whose source predates this cross-check.
