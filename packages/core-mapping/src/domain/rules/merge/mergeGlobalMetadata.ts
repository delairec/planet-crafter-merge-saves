import {GlobalMetadata} from 'shared-save-processing/gameDefinitions';

const DEFAULT_METADATA: GlobalMetadata = {
    terraTokens: 0,
    allTimeTerraTokens: 0,
    unlockedGroups: '',
    openedInstanceSeed: 0,
    openedInstanceTimeLeft: 0,
};

/**
 * @see GR-META-1, GR-META-2, GR-META-3, GR-META-4 in docs/game-rules.md
 */
export function mergeGlobalMetadata([metadataA]: GlobalMetadata[], [metadataB]: GlobalMetadata[]): string {
    const validatedMetadataA = metadataA ?? DEFAULT_METADATA;
    const validatedMetadataB = metadataB ?? DEFAULT_METADATA;

    const terraTokens = validatedMetadataA.terraTokens + validatedMetadataB.terraTokens;
    const allTimeTerraTokens = validatedMetadataA.allTimeTerraTokens + validatedMetadataB.allTimeTerraTokens;

    const deduplicatedUnlockedGroups = new Set([
        ...validatedMetadataA.unlockedGroups.split(','),
        ...validatedMetadataB.unlockedGroups.split(','),
    ]);
    const unlockedGroups = Array.from(deduplicatedUnlockedGroups).filter(Boolean).join(',');

    const openedInstanceSeed = (metadataA ?? metadataB).openedInstanceSeed;
    const openedInstanceTimeLeft = (metadataA ?? metadataB).openedInstanceTimeLeft;

    return `{"terraTokens":${terraTokens},"allTimeTerraTokens":${allTimeTerraTokens},"unlockedGroups":${JSON.stringify(unlockedGroups)},"openedInstanceSeed":${openedInstanceSeed},"openedInstanceTimeLeft":${openedInstanceTimeLeft}}`;
}
