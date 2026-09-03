import {ParsedSections} from 'shared-save-processing/gameDefinitions';

/**
 * @see GR-ORDER-1 in docs/business-rules.md
 */
export function determineSaveOrder(parsedSaveA: ParsedSections, parsedSaveB: ParsedSections): [ParsedSections, ParsedSections] {
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
