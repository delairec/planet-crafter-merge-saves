import {GLOBAL_METADATA_SECTION_INDEX} from "../../util-types/sectionIndexes.js";
import {DEFAULT_GLOBAL_METADATA} from "./createFakeSaveString.js";

/**
 * Creates a fake parsed save object with the given overrides.
 * @param {Partial<ParsedSave>} overrides
 * @returns {ParsedSave}
 */
export function createFakeParsedSave(overrides = {}) {

    const {sections, errors, warnings} = {
        ...overrides
    };

    return {
        warnings: warnings ?? [],
        errors: errors ?? [],
        sections: createFakeParsedSections(sections)
    }
}

function createFakeParsedSections(overrides = []) {

    if (!overrides[GLOBAL_METADATA_SECTION_INDEX]) {
        overrides[GLOBAL_METADATA_SECTION_INDEX] = [DEFAULT_GLOBAL_METADATA];
    }

    return overrides.map(override => {
        if (typeof override === 'function') {
            return override;
        }

        return override ?? [];
    })
}