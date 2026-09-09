import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {verifySectionCount} from 'shared-save-processing/verifySectionCount.js';
import {PLAYERS_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {validateSchemas} from './validateSchemas.js';
import {validateFloatSerialization} from '../domain/rules/validateFloatSerialization.ts';
import {validateUniqueHost} from '../domain/rules/validateUniqueHost.ts';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';

/**
 * Validates a merged Planet Crafter save string: JSON schema compliance for each section, plus
 * domain-specific rules. Legacy saves (still containing the Terrain Layers section, removed by a
 * later game update) are transparently adapted to the current format and reported through
 * `warnings` instead of an error.
 *
 * Reading the save is delegated to `parseSaveSections`, the single reader of the format: a
 * validator tolerating the format differently from the reader used by loading and merging is what
 * once let a lost section pass for a valid save.
 *
 * @param {string} mergedSave
 * @returns {{isValid: boolean, errors: import('../application/ports/ValidationIssue').ValidationIssue[], warnings: import('shared-save-processing/normalizeRawSections.js').SaveWarningCode[]}}
 */
export function validateSaveContent(mergedSave) {
  const sectionCountErrors = verifySectionCount(mergedSave.split('@'));
  if (sectionCountErrors.length > 0) {
    return {
      isValid: false,
      errors: [{code: VALIDATION_ISSUE_CODES.INVALID_STRUCTURE, detail: sectionCountErrors[0].detail}],
      warnings: []
    };
  }

  const {sections, errors: parseErrors, warnings} = parseSaveSections(mergedSave);
  readWorldObjectsSection(sections[WORLD_OBJECTS_SECTION_INDEX]);

  const errors = parseErrors.map(toInvalidJsonIssue);

  errors.push(...validateSchemas(sections));
  errors.push(...validateFloatSerialization(mergedSave));
  errors.push(...validateUniqueHost(sections[PLAYERS_SECTION_INDEX]));

  return {isValid: errors.length === 0, errors, warnings};
}

/**
 * The world objects section is a generator, so the lines it cannot read are only reported once it
 * has been walked. No schema covers that section and no rule reads its entries, so validation
 * walks it and keeps nothing: every unreadable line is reported while a single entry at a time is
 * held in memory.
 * @param {() => Generator<unknown>} createWorldObjects
 */
function readWorldObjectsSection(createWorldObjects) {
  const worldObjects = createWorldObjects();

  while (!worldObjects.next().done) {
    // walking the section is what reports its unreadable lines; its entries are of no use here
  }
}

/**
 * The section count is verified before parsing, so every error the reader reports from here on
 * concerns a line it could not read.
 * @param {import('shared-save-processing/gameDefinitions').SaveParseError} parseError
 * @returns {import('../application/ports/ValidationIssue').ValidationIssue}
 */
function toInvalidJsonIssue({detail, section, entryIndex}) {
  return {code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail, section, entryIndex};
}
