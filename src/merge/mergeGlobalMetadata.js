/** @import { GlobalMetadata } from '../types.js' */

const DEFAULT_METADATA = {
  terraTokens: 0,
  allTimeTerraTokens: 0,
  unlockedGroups: '',
  openedInstanceSeed: 0,
  openedInstanceTimeLeft: 0,
};

/**
 * @param {GlobalMetadata[]} globalMetadataA
 * @param {GlobalMetadata[]} globalMetadataB
 * @returns {string}
 * @see GR-META-1, GR-META-2, GR-META-3, GR-META-4 in docs/game-rules.md
 */
export function mergeGlobalMetadata([metadataA], [metadataB]) {
  console.log('META = ', metadataA, metadataB);
  if(!metadataA && !metadataB) {
    return 'ERROR_INVALID_INPUT_FORMAT';
  }

  const validatedMetadataA = metadataA ?? DEFAULT_METADATA;
  const validatedMetadataB = metadataB ?? DEFAULT_METADATA;

  const terraTokens = validatedMetadataA.terraTokens + validatedMetadataB.terraTokens;
  const allTimeTerraTokens = validatedMetadataA.allTimeTerraTokens + validatedMetadataB.allTimeTerraTokens;

  const deduplicatedUnlockedGroups = new Set([
    ...validatedMetadataA.unlockedGroups.split(','),
    ...validatedMetadataB.unlockedGroups.split(','),
  ]);
  const unlockedGroups = Array.from(deduplicatedUnlockedGroups).filter(Boolean).join(',');

  const openedInstanceSeed = Math.max(validatedMetadataA.openedInstanceSeed, validatedMetadataB.openedInstanceSeed);
  const openedInstanceTimeLeft = Math.max(validatedMetadataA.openedInstanceTimeLeft, validatedMetadataB.openedInstanceTimeLeft);

  return `{"terraTokens":${terraTokens},"allTimeTerraTokens":${allTimeTerraTokens},"unlockedGroups":"${unlockedGroups}","openedInstanceSeed":${openedInstanceSeed},"openedInstanceTimeLeft":${openedInstanceTimeLeft}}`;
}

