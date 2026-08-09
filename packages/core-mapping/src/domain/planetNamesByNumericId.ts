// Maps a WorldObject's numeric `planet` ID to its textual planet name (`TerraformationLevel.planetId`).
// This mapping is a fixed, stable lookup — see docs/save-format.md ("Planet numeric IDs") — since no known
// hash function reproduces these IDs from the planet name.
export const planetNamesByNumericId: Partial<Record<number, string>> = {
  [-1140328421]: 'Prime',
  [110910045]: 'Toxicity',
  [-1016990411]: 'Selenea',
  [-486276833]: 'Humble',
  [-1291310150]: 'Aqualis'
};
