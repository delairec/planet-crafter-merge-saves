# Planet Crafter Merge Saves — Business Rules

> This is the **authoritative reference** for every merge decision made by this tool.
> All merge functions, tests, and AI instructions must stay consistent with this document.
> The save-file data model is documented separately in [`docs/save-format.md`](./save-format.md).

---

## Table of Contents

1. [General principles](#1-general-principles)
2. [Save order](#2-save-order)
3. [Section 0 — Global metadata](#3-section-0--global-metadata)
4. [Section 1 — Terraformation levels](#4-section-1--terraformation-levels)
5. [Section 2 — Players](#5-section-2--players)
6. [Section 3 — World objects](#6-section-3--world-objects)
7. [Section 4 — Inventories & equipment](#7-section-4--inventories--equipment)
8. [Section 5 — Statistics](#8-section-5--statistics)
9. [Section 6 — Messages / mailbox](#9-section-6--messages--mailbox)
10. [Section 7 — Story events](#10-section-7--story-events)
11. [Section 8 — Save configuration](#11-section-8--save-configuration)
12. [Section 9 — World events](#12-section-9--world-events)
13. [Id conflict resolution](#13-id-conflict-resolution)

---

## 1. General principles

- The two input save files are never modified; the merged result is always written to a separate output file.
- When two entries conflict, **save A always wins** unless a section rule says otherwise.
- All merge decisions are deterministic and stateless — the same two inputs always produce the same output.
- Section rules are applied independently; one section's strategy does not affect another's.
- The current save format (11 sections) is the only format used internally. Legacy saves (12 sections, still
  containing the Terrain Layers section removed by a game update) are only supported at the user-input boundary
  (loading a save file): they are automatically adapted to the current format, and a warning is reported to the
  user — including when such a save is merged, since the merged file is written in the current format —
  see [`docs/save-format.md`](./save-format.md#appendix--legacy-format-before-the-terrain-layers-section-was-removed).

---

## 2. Save order

**Rule GR-ORDER-1:** Before any section is merged, the two saves are assigned to roles **A** and **B**.

- If exactly one save has `SaveConfiguration.planetId === 'Prime'`, that save is promoted to save A.
- Otherwise the two files keep the order supplied by the caller (alphabetical in the CLI).

**Rationale:** Prime is the original/primary planet. Treating it as save A ensures its state is preserved on conflict.

**Implementation:** `packages/core-mapping/src/domain/rules/merge/determineSaveOrder.ts`

---

## 3. Section 0 — Global metadata

**Rule GR-META-1:** `terraTokens` = sum of both saves.

**Rule GR-META-2:** `allTimeTerraTokens` = sum of both saves.

**Rule GR-META-3:** `unlockedGroups` = union (deduplication by string value, no ordering guarantee).

**Rule GR-META-4:** `openedInstanceSeed` and `openedInstanceTimeLeft` = value from save A.

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergeGlobalMetadata.ts`

---

## 4. Section 1 — Terraformation levels

**Merge key:** `planetId`

**Rule GR-TERRA-1:** For each `planetId` present in either save, exactly one entry appears in the output.

**Rule GR-TERRA-2:** When the same `planetId` exists in both saves, every numeric field uses `Math.max(valueA, valueB)`.

**Rule GR-TERRA-3:** `unitPurificationLevel` uses `-1` as a sentinel meaning "not yet unlocked".
- If both saves have `-1`, the output is `-1`.
- If only one save has `-1`, the output is the non-negative value from the other save.
- If neither save has `-1`, `Math.max` applies as normal (covered by GR-TERRA-2).

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergeTerraformationLevels.ts`

---

## 5. Section 2 — Players

**Merge key:** `name`

**Rule GR-PLAYER-1:** Players are deduplicated by `name`. When the same name appears in both saves, the **entire** player object from save A is kept; no field-level merge is performed. The save-B version is discarded (including its inventory and equipment).

**Rule GR-PLAYER-2:** Exactly one player in the output may have `host === true`: the player who was host in save A. All other `host` fields are set to `false`.

**Rule GR-PLAYER-3:** Players from save B whose `name` does not exist in save A are appended to the merged list.

**Rule GR-PLAYER-4:** Players from older saves may be missing `cameraView`, `totalCraftedObjects` or `totalTerraTokenEarned` (fields added by a later game update). Any missing field defaults to `0` in the merged output.

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergePlayers.ts`

---

## 6. Section 3 — World objects

**Merge key:** `planet` + `pos` (string composite key `"<planet>:<pos>"`)

**Rule GR-WO-1:** World objects without a `pos` field are always kept (they have no positional identity; deduplication does not apply).

**Rule GR-WO-2:** When two objects share the same `planet:pos` key, save A's object is kept and save B's is discarded.

**Rule GR-WO-3 (orphan removal):** Before merging, world objects that belong to the inventories of **ejected players** from save B (players whose `name` already exists in save A) are removed. See GR-PLAYER-1.

**Rule GR-WO-4:** After the main merge, remaining id conflicts across the combined list are resolved by the id conflict resolution step (section 14).

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergeWorldObjects.ts`, `packages/core-mapping/src/domain/rules/merge/collectEjectedPlayerInventoryIds.ts`

---

## 7. Section 4 — Inventories & equipment

**Merge key:** `id` (logical uniqueness is not assumed across saves; identical ids are remapped by the id conflict resolution step)

**Rule GR-INV-1:** All inventories from save A are kept.

**Rule GR-INV-2:** All inventories from save B are kept, **except** inventories whose `id` matches the `inventoryId` or `equipmentId` of an ejected player (see GR-PLAYER-1 and GR-WO-3).

**Rule GR-INV-3:** Duplicate `id` values across saves are not treated as the same logical object; they are remapped by the id conflict resolution step (section 14).

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergeInventories.ts`

---

## 8. Section 5 — Statistics

**Rule GR-STAT-1:** Every numeric field is summed: `craftedObjects`, `totalSaveFileLoad`, `totalSaveFileTime`.

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergeStatistics.ts`

---

## 9. Section 6 — Messages / mailbox

**Merge key:** `stringId`

**Rule GR-MSG-1:** Messages are deduplicated by `stringId`. When the same `stringId` appears in both saves, the merged entry is produced by keeping all fields from save A and applying the following field rules.

**Rule GR-MSG-2:** `isRead` is `true` if either save has `isRead === true` (boolean OR).

**Rule GR-MSG-3:** Messages from save B whose `stringId` is not in save A are appended to the output.

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergeMailboxes.ts`

---

## 10. Section 7 — Story events

**Merge key:** `stringId`

**Rule GR-STORY-1:** Story events are deduplicated by `stringId`. The union of both saves is kept; no field-level merge is needed (the only field is the key itself).

**Rule GR-STORY-2:** Save A's ordering is preserved; save B entries not present in save A are appended.

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergeStoryEvents.ts`

---

## 11. Section 8 — Save configuration

**Rule GR-CFG-1:** Save A's configuration object is used as-is.

**Rule GR-CFG-2:** `saveDisplayName` is always overridden with the value passed to `merge()` (derived from the input folder name in the CLI).

**Rule GR-CFG-3:** Save B's configuration object is entirely discarded.

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergeSaveConfigurations.ts`

---

## 12. Section 9 — World events

**Merge key:** `planet` + `seed` + `pos`

**Rule GR-EVT-1:** When the same `planet` + `seed` + `pos` triplet exists in both saves, save A's entry is kept and save B's is discarded.

**Rule GR-EVT-2:** World events from save B whose triplet is not present in save A are appended.

**Implementation:** `packages/core-mapping/src/domain/rules/merge/mergeWorldEvents.ts`

---

## 13. Id conflict resolution

**Rule GR-ID-1:** After all sections are merged, every `id` in the combined inventory + world object list must be unique.

**Rule GR-ID-2:** When a duplicate `id` is found (same numeric value used for two different logical objects — one from each save), the **later-encountered** entry receives a new id generated from a monotonically increasing sequence seeded above the current maximum id.

**Rule GR-ID-3:** All back-references are updated to match remapped ids:
- `Player.inventoryId` and `Player.equipmentId` → remapped inventory ids.
- `WorldObject.liId` → remapped inventory ids.
- `WorldObject.siIds` (CSV) → remapped inventory ids.
- `WorldObject.linkedWo` → remapped world object ids.
- `WorldObject.woIds` (CSV) → remapped world object ids.
- `Inventory.woIds` (CSV) → remapped world object ids.

Only save B entries carry rewritten references. A save A entry keeps the ids it always used: they
are authoritative, so they still designate the same entry after the merge.

**Rule GR-ID-4:** Id conflict resolution runs on the merged sections, as structured entries, and returns merged sections. It is the last step before the sections are serialized and written.

**Rule GR-ID-5:** Reference rewriting is **save-origin-aware**. When an inventory id was duplicated across both saves (save A's inventory keeps the original id; save B's gets a new id), a world object from save A keeps its `liId`/`siIds` pointing to the original id, while a world object from save B points to the remapped (new) id. The origin is carried by the merged sections themselves: the three sections holding identifiers (players, inventories, world objects) keep their entries grouped as `fromSaveA` / `fromSaveB`, so it never has to be reconstructed.

**Implementation:** `packages/core-mapping/src/domain/rules/merge/resolveIdConflicts.ts`, `packages/core-mapping/src/domain/rules/merge/createIdSequence.ts`, `packages/core-mapping/src/domain/rules/merge/resolvePlayerIdConflicts.ts`, `packages/core-mapping/src/domain/rules/merge/resolveInventoryIdConflicts.ts`, `packages/core-mapping/src/domain/rules/merge/resolveWorldObjectIdConflicts.ts`, `packages/core-mapping/src/domain/rules/merge/rewriteReferences.ts`

