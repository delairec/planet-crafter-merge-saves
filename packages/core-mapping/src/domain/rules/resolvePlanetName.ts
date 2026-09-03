import {planetNamesByNumericId} from "../planetNamesByNumericId";

/**
 * Resolves a planet's textual name (`TerraformationLevel.planetId`) from a `WorldObject`'s
 * numeric `planet` id. The primary source is the fixed lookup table `planetNamesByNumericId`
 * (see docs/save-format.md, "Planet numeric IDs"). For planet ids not in that table (e.g. future
 * planets, modded content), falls back to a heuristic: some world object `gId`s embed the planet
 * name in plain text (e.g. `Seed7Humble` on planet `Humble`) — if exactly one known planet name
 * (from this save's TerraformationLevels) is found as a substring of a `gId` on this planet, use
 * it; otherwise the planet name cannot be resolved.
 */
export function resolvePlanetName(
  planetId: number,
  worldObjectGIdsOnPlanet: string[],
  knownPlanetNames: string[]
): string | undefined {
  const knownPlanetName = planetNamesByNumericId[planetId];
  if (knownPlanetName !== undefined) {
    return knownPlanetName;
  }

  const matchingPlanetNames = new Set(
    worldObjectGIdsOnPlanet
      .flatMap((gId) => knownPlanetNames.filter((planetName) => gId.includes(planetName)))
  );

  return matchingPlanetNames.size === 1 ? [...matchingPlanetNames][0] : undefined;
}
