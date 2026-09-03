import {createFakeSaveContent, createGlobalMetadata} from 'shared-save-processing/testing/createFakeSaveContent.js';

export const FAKE_SAVE_STRING_A = createFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 10, allTimeTerraTokens: 10})});
export const FAKE_SAVE_STRING_B = createFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 20, allTimeTerraTokens: 20})});
