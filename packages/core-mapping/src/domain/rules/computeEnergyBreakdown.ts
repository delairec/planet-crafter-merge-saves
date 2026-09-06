import type {WorldObjectName} from "../worldObjectNames.ts";
import type {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity.ts";
import {type EnergyBreakdownEntryValueObject, createEnergyBreakdownEntryValueObject} from "../valueObjects/EnergyBreakdownEntryValueObject.ts";

/**
 * Groups positioned world objects matching the given base energy levels table by name, so the
 * UI can display, for each machine type, how many are placed and how much it contributes to the
 * total (see the Power section's Production/Consumption breakdowns).
 */
export function computeEnergyBreakdown(
  positionedWorldObjects: readonly PlacedWorldObjectEntity[],
  levelsByWorldObjectName: Partial<Record<WorldObjectName, number>>
): EnergyBreakdownEntryValueObject[] {
  const quantityByName = new Map<WorldObjectName, number>();

  for (const worldObject of positionedWorldObjects) {
    if (levelsByWorldObjectName[worldObject.name] === undefined) {
      continue;
    }
    quantityByName.set(worldObject.name, (quantityByName.get(worldObject.name) ?? 0) + 1);
  }

  return [...quantityByName.entries()]
    .map(([name, quantity]): EnergyBreakdownEntryValueObject => {
      const unitLevel = levelsByWorldObjectName[name]!;
      return createEnergyBreakdownEntryValueObject({
        name,
        quantity,
        unitLevel,
        totalLevel: unitLevel * quantity
      });
    })
    .sort((a, b) => b.totalLevel - a.totalLevel);
}
