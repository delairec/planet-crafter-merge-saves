import {ParsedSections, SAVE_CONFIGURATION_SECTION_INDEX} from 'shared-save-processing/gameDefinitions';

const PRIME_PLANET_ID = 'Prime';

/**
 * @see GR-ORDER-1 in docs/game-rules.md
 */
export function determineSaveOrder(parsedSaveA: ParsedSections, parsedSaveB: ParsedSections): [ParsedSections, ParsedSections] {
  if (!isPrimePlanetSave(parsedSaveA) && isPrimePlanetSave(parsedSaveB)) {
    return [parsedSaveB, parsedSaveA];
  }

  return [parsedSaveA, parsedSaveB];
}

function isPrimePlanetSave(parsedSave: ParsedSections): boolean {
  return parsedSave[SAVE_CONFIGURATION_SECTION_INDEX]?.[0]?.planetId === PRIME_PLANET_ID;
}
