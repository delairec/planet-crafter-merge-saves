/** @import { ParsedSave } from '../types.js' */

/**
 * @param {ParsedSave} parsedSaveA
 * @param {ParsedSave} parsedSaveB
 * @returns {[ParsedSave, ParsedSave]}
 * @see GR-ORDER-1 in docs/business-rules.md
 */
export function determineSaveOrder(parsedSaveA, parsedSaveB) {
  const [, , , , , , , , saveConfigurationsA] = parsedSaveA;
  const [, , , , , , , , saveConfigurationsB] = parsedSaveB;

  const configA = saveConfigurationsA?.[0];
  const configB = saveConfigurationsB?.[0];

  const save2IsPrime = configB?.planetId === 'Prime';
  const save1IsPrime = configA?.planetId === 'Prime';

  if (save2IsPrime && !save1IsPrime) {
    return [parsedSaveB, parsedSaveA];
  }

  return [parsedSaveA, parsedSaveB];
}

