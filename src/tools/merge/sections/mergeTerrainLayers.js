/** @import { TerrainLayer } from '../../../types/js/types.js' */

/**
 * @param {TerrainLayer[]} terrainLayersA
 * @param {TerrainLayer[]} terrainLayersB
 * @returns {string}
 * @see GR-TERRAIN-1, GR-TERRAIN-2 in docs/game-rules.md
 */
export function mergeTerrainLayers(terrainLayersA, terrainLayersB) {
  const validatedTerrainLayersA = terrainLayersA ?? [];
  const validatedTerrainLayersB = terrainLayersB ?? [];

  const terrainLayersFromBNotInA = validatedTerrainLayersB.filter(layerB =>
    !validatedTerrainLayersA.some(layerA => layerA.layerId === layerB.layerId && layerA.planet === layerB.planet)
  );

  return [...validatedTerrainLayersA, ...terrainLayersFromBNotInA]
    .map(layer => JSON.stringify(layer))
    .join('|\n');
}

