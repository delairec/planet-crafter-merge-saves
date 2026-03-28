/** @import { ParsedSave } from '../../util-types/js/types.js' */

/**
 * @param {ParsedSections} parsedSaveA
 * @param {ParsedSections} parsedSaveB
 * @returns {[ParsedSections, ParsedSections]}
 * @see GR-ORDER-1 in docs/business-rules.md
 */
export function determineSaveOrder(parsedSaveA, parsedSaveB) {
  const [, , , , , , , , saveConfigurationsA] = parsedSaveA;
  const [, , , , , , , , saveConfigurationsB] = parsedSaveB;

  const configA = saveConfigurationsA?.[0];
  const configB = saveConfigurationsB?.[0];

  const save1IsPrime = configA?.planetId === 'Prime';
  const save2IsPrime = configB?.planetId === 'Prime';

  if (!save1IsPrime && save2IsPrime) {
    return [parsedSaveB, parsedSaveA];
  }

  return [parsedSaveA, parsedSaveB];
}

