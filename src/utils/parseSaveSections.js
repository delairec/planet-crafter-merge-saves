/**
 * Parses Planet Crafter save data into 11 structured sections.
 * @param {string} save
 * @returns {Array} [
 *   GlobalMetadata[],
 *   TerraformationLevels[],
 *   Players[],
 *   WorldObjectsGenerator <Generator>,
 *   Inventories[],
 *   Statistics[],
 *   Mailbox[],
 *   StoryEvents[],
 *   SaveConfigurations[],
 *   TerrainLayers[],
 *   WorldEvents[]
 * ]
 */
export function parseSaveSections(save) {
  const sections = save.split('@');

  return sections.map((section, index) => {
    if (isWorldObjectsSection(index)) {
      return createSectionEntriesGenerator(section);
    }

    try {
      if (section.includes('|')) {
        return section.split('|\n').map(line => JSON.parse(line)).filter(Boolean);
      }

      return [JSON.parse(section)];
    } catch (error) {
      return [];
    }
  });
}

function isWorldObjectsSection(index) {
  return index === 3;
}

function* createSectionEntriesGenerator(section) {
  if (!section.trim()) {
    return;
  }

  for (const line of section.split('|\n')) {
    try {
      yield JSON.parse(line);
    } catch {
      console.log('Failed to parse world object line:', line);
    }
  }
}
