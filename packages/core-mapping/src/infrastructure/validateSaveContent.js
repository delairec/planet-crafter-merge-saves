import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {verifySectionCount} from 'shared-save-processing/verifySectionCount.js';
import {PLAYERS_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {validateSchemas, validateSectionEntry} from './validateSchemas.js';
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
  const worldObjectIssues = validateWorldObjectsSection(sections[WORLD_OBJECTS_SECTION_INDEX]);

  const errors = parseErrors.map(toInvalidJsonIssue);

  errors.push(...validateSchemas(sections));
  errors.push(...worldObjectIssues);
  errors.push(...validateFloatSerialization(mergedSave));
  errors.push(...validateUniqueHost(sections[PLAYERS_SECTION_INDEX]));

  return {isValid: errors.length === 0, errors, warnings};
}

/**
 * The world objects section is a generator, so both the lines it cannot read and the entries
 * breaking its schema are only discovered once it has been walked. Each entry is checked as it
 * goes past and none is kept: a single entry at a time is held in memory, whatever the size of the
 * section — 28425 objects on the largest of the reference saves in `input/`.
 * @param {() => Generator<unknown>} createWorldObjects
 * @returns {import('../application/ports/ValidationIssue').ValidationIssue[]}
 */
function validateWorldObjectsSection(createWorldObjects) {
  const issues = [];
  let entryIndex = 0;

  for (const worldObject of createWorldObjects()) {
    issues.push(...validateSectionEntry(WORLD_OBJECTS_SECTION_INDEX, worldObject, entryIndex));
    entryIndex++;
  }

  return issues;
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
