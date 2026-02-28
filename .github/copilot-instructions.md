# Copilot Instructions

## Project
Merges two **Planet Crafter** save files into one. The save format is a plain-text string split into 11 sections separated by `@`. Each section contains JSON objects separated by `|\n`.

## Stack
- **Runtime**: Node.js (ESM, `"type": "module"`)
- **Tests**: `node:test` + `node:assert/strict` — no external test framework

## TDD Workflow
Follow strict **red → green → refactor** cycles:
- Red phase: write failing tests first
- Green phase: implement the minimal code to pass the tests
- Never implement logic without a corresponding test
- Don't execute tests by yourself, ask me to do so and I'll provide feedback.

## Terminal usage
- When you commit, avoid description bloc. A simple and short commit message is better.
- Follow conventional commit format: `<type>(<scope>): <message>`, where:
    - `<type>` is one of `feat`, `fix`, `refactor`, `test`, `chore`, etc.
    - `<scope>` is the section being merged if any (e.g. `players`, `inventories`)
    - `<message>` is a brief summary of the change
- You don't need `cd` command unless an error occurred in the terminal.

## Code Conventions
- Use **named exports** (no default exports)
- Each `merge*` function receives the two parsed sections as arrays and returns a serialized string
- Follow the same pattern as `mergeTerraformationLevels` for new merge functions
- Helper/test utilities live in `src/testing/`
- Avoid diminutive and truncated names for variables and functions.

## Domain guidelines
- Players are unique by their name (primary key) and by their id.
- The project includes an implemented id-conflict resolution step (`src/utils/resolveIdConflicts.js`) which detects duplicate ids across merged data and remaps later occurrences to new unique ids while updating references where possible.
- If more than one player share the same name, take the player from save A.
- When duplicate numeric gauges/levels exist for the same domain object, take `Math.max` (except where domain rules say otherwise).
- Player gauge toxic value is merged by taking `Math.min`.
- Player inventories: prefer the inventory object coming from save A for a given player when both saves reference the same player name.
- Player equipment list: prefer save A's equipment list for a player when merging by name.
- Only one player can be the host: take save A host status. All other players will have host status set to false.
- When merging inventories and equipment, keep all inventories from both saves. Inventories are referenced by players and by world objects (buildings, machines…).
- Inventories and equipment are considered unique by their `id`. The resolver will detect duplicate ids and generate new ids for later occurrences; mappings are recorded to update references in players and world objects where applicable.
- Note: identical ids across saves do not necessarily mean the entries are the same logical object. The resolver treats each entry as a separate object and will remap ids to ensure uniqueness.
- Statistics: they should be summed.
- Messages are unique by `stringId`. Deduplicate, and prioritize `true` values (e.g. `isRead`) over `false`.
- Terrain layers are unique by their `layerId` and `planet`. When merging, prefer the layer from save A; matching `layerId` + `planet` from save B will be discarded.
- World events are unique by their `planet`, `seed` and `pos`. If duplicated, prioritize save A.
- World objects are deduplicated by position (`planet:pos`) and their ids are normalized by the id-conflict resolver; orphaned references from ejected players are removed before merging world objects.
- Issues with duplicated ids are detected and resolved during the `resolveIdConflicts` step which runs after the main merge; the resolver behavior should be consulted when implementing new merge logic.
- Save configurations: Save display name should be a parameter of the main merge function.
- World events are unique by their `planet`, `seed` and `pos`. If duplicated, prioritize save A.
- Issues with duplicated ids will be handled by `resolveIdConflicts` after all data is merged.

## Examples:
- Players with inventories and equipment ids:

```json
{"id":12345678910111213,"name":"Nikowa","inventoryId":44,"equipmentId":45,"playerPosition":"1751.865,472.58,-1106.104","playerRotation":"0,0.5740051,0,-0.8188518","playerGaugeOxygen":280.0,"playerGaugeThirst":96.3858642578125,"playerGaugeHealth":72.67363739013672,"playerGaugeToxic":0.0,"host":false,"planetId":"Toxicity"}| 
{"id":13121110987654321,"name":"Chilney","inventoryId":3,"equipmentId":4,"playerPosition":"1397.571,465.3293,-397.9421","playerRotation":"0,0.5459602,0,0.8378111","playerGaugeOxygen":370.0,"playerGaugeThirst":99.90899658203125,"playerGaugeHealth":91.76728820800781,"playerGaugeToxic":0.0,"host":true,"planetId":"Toxicity"}
```
- Corresponding inventory or equipment:

```json
{"id":44,"woIds":"206524427,209785873,205093544,207814413,207642135,207043789,203412908,207023582,205081482,201957366,203930732,201357259,208050298,201049268,201852847,205880748,205927490,202986832,209148190","size":20}
```
