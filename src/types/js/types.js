/** @typedef {Object} RuntimePlatform
 * @property {(path: string) => Promise<string>} readTextFile
 * @property {(path: string, content: string) => Promise<void>} writeTextFile
 * @property {(path: string) => Promise<string[]>} readDirectory
 * @property {(...segments: string[]) => string} joinPath
 * @property {(path: string, extension?: string) => string} getBasename
 * @property {(code: number) => never} exitProcess
 * @property {() => string[]} getCliArguments
 * @property {(importMeta: { main?: boolean }) => boolean} isEntryPoint
 */

// GAME SPECIFIC TYPES -->

/** @typedef {Object} GlobalMetadata
 * @property {number} terraTokens - Summed across saves. @see GR-META-1
 * @property {number} allTimeTerraTokens - Summed across saves. @see GR-META-2
 * @property {string} unlockedGroups - Comma-separated; union of both saves. @see GR-META-3
 * @property {number} openedInstanceSeed - Taken from save A. @see GR-META-4
 * @property {number} openedInstanceTimeLeft - Taken from save A. @see GR-META-4
 */

/** Merge key: `planetId`. All numeric fields use Math.max; `unitPurificationLevel` uses -1 as sentinel.
 * @see GR-TERRA-1, GR-TERRA-2, GR-TERRA-3 in docs/game-rules.md
 * @typedef {Object} TerraformationLevel
 * @property {string} planetId
 * @property {number} unitOxygenLevel
 * @property {number} unitHeatLevel
 * @property {number} unitPressureLevel
 * @property {number} unitPlantsLevel
 * @property {number} unitInsectsLevel
 * @property {number} unitAnimalsLevel
 * @property {number} unitPurificationLevel - Sentinel: -1 means "not yet unlocked". Keep -1 only when both saves have -1. @see GR-TERRA-3
 */

/** Merge key: `name`. Save A wins on conflict; no field-level merge.
 * Exactly one player in the merged output may have `host === true` (save A's host). @see GR-PLAYER-1, GR-PLAYER-2
 * @typedef {Object} Player
 * @property {number} id
 * @property {string} name - Deduplication key. @see GR-PLAYER-1
 * @property {number} inventoryId - → Inventory.id. Remapped by resolveIdConflicts when duplicated. @see GR-ID-3
 * @property {number} equipmentId - → Inventory.id. Remapped by resolveIdConflicts when duplicated. @see GR-ID-3
 * @property {string} playerPosition
 * @property {string} playerRotation
 * @property {number} playerGaugeOxygen
 * @property {number} playerGaugeThirst
 * @property {number} playerGaugeHealth
 * @property {number} playerGaugeToxic
 * @property {boolean} host - Invariant: exactly one `true` per merged save (save A's host). @see GR-PLAYER-2
 * @property {string} planetId
 */

/** Merge key: `planet:pos` composite key. Objects without `pos` are always kept.
 * `id` and `gId` are always present; all other fields are optional.
 * @see GR-WO-1, GR-WO-2, GR-WO-3 in docs/game-rules.md
 * @typedef {Object} WorldObject
 * @property {number} id - Remapped by resolveIdConflicts when duplicated. @see GR-ID-2
 * @property {string} gId
 * @property {string} [pos] - Part of deduplication key. Absent → always kept. @see GR-WO-1
 * @property {string} [rot]
 * @property {number} [planet] - Part of deduplication key (`planet:pos`). @see GR-WO-2
 * @property {number} [liId] - → Inventory.id. Updated by resolveIdConflicts. @see GR-ID-3
 * @property {string} [woIds] - CSV of → WorldObject.id. Updated by resolveIdConflicts. @see GR-ID-3
 * @property {number} [hunger]
 * @property {number} [grwth]
 * @property {string} [count]
 * @property {string} [text]
 * @property {number} [linkedWo] - → WorldObject.id. Updated by resolveIdConflicts. @see GR-ID-3
 * @property {string} [siIds] - CSV of → Inventory.id (sub-inventories). Updated by resolveIdConflicts. @see GR-ID-3
 */

/** Merge key: `id` (remapped by resolveIdConflicts when duplicated across saves).
 * Identical ids from different saves are NOT the same logical object. @see GR-INV-3
 * @typedef {Object} Inventory
 * @property {number} id - Remapped by resolveIdConflicts when duplicated. @see GR-ID-2
 * @property {string} woIds - CSV of → WorldObject.id ('' if empty). Updated by resolveIdConflicts. @see GR-ID-3
 * @property {number} size
 * @property {string} [demandGrps]
 * @property {string} [supplyGrps]
 * @property {number} [priority]
 */

/** All fields are summed across both saves. @see GR-STAT-1 in docs/game-rules.md
 * @typedef {Object} Statistics
 * @property {number} craftedObjects
 * @property {number} totalSaveFileLoad
 * @property {number} totalSaveFileTime
 */

/** Merge key: `stringId`. Boolean fields prioritize `true` (boolean OR). @see GR-MSG-1, GR-MSG-2
 * @typedef {Object} MailboxMessage
 * @property {string} stringId - Deduplication key. @see GR-MSG-1
 * @property {boolean} isRead - `true` if either save has `true`. @see GR-MSG-2
 */

/** Merge key: `stringId`. Deduplicated; no field merge needed. @see GR-STORY-1
 * @typedef {Object} StoryEvent
 * @property {string} stringId - Deduplication key. @see GR-STORY-1
 */

/** Save A's object is kept; `saveDisplayName` is overridden by the `merge()` parameter. @see GR-CFG-1, GR-CFG-2
 * `planetId === 'Prime'` triggers save-order promotion to save A. @see GR-ORDER-1
 * @typedef {Object} SaveConfiguration
 * @property {string} saveDisplayName - Always overridden by the `saveDisplayName` argument to `merge()`. @see GR-CFG-2
 * @property {string} planetId - 'Prime' triggers save-order reordering. @see GR-ORDER-1
 * @property {string} version
 * @property {string} mode
 * @property {number} worldSeed
 * @property {boolean} modded
 * @property {number} modifierTerraformationPace
 * @property {number} modifierPowerConsumption
 * @property {number} modifierGaugeDrain
 * @property {number} modifierMeteoOccurence
 * @property {number} modifierMultiplayerTerraformationFactor
 */

/** Merge key: `layerId` + `planet`. Save A wins on conflict. @see GR-TERRAIN-1, GR-TERRAIN-2
 * @typedef {Object} TerrainLayer
 * @property {string} layerId - Part of composite deduplication key. @see GR-TERRAIN-1
 * @property {number} planet - Part of composite deduplication key. @see GR-TERRAIN-1
 * @property {string} colorBase
 */

/** Merge key: `planet` + `seed` + `pos`. Save A wins on conflict. @see GR-EVT-1, GR-EVT-2
 * @typedef {Object} WorldEvent
 * @property {number} planet - Part of composite deduplication key. @see GR-EVT-1
 * @property {number} seed - Part of composite deduplication key. @see GR-EVT-1
 * @property {string} pos - Part of composite deduplication key. @see GR-EVT-1
 * @property {number} [owner]
 * @property {number} [index]
 * @property {string} [rot]
 * @property {boolean} [wrecksWOGenerated]
 * @property {string} [woIdsGenerated]
 * @property {string} [woIdsDropped]
 * @property {number} [version]
 */

/** 11-tuple returned by parseSaveSections(). Section 3 (WorldObjects) is a Generator.
 * @typedef {[
 *   GlobalMetadata[],
 *   TerraformationLevel[],
 *   Player[],
 *   Generator<WorldObject>,
 *   Inventory[],
 *   Statistics[],
 *   MailboxMessage[],
 *   StoryEvent[],
 *   SaveConfiguration[],
 *   TerrainLayer[],
 *   WorldEvent[],
 *   never[]
 * ]} ParsedSave
 */

export {};
