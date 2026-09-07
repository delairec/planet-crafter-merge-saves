import {normalizeRawSections} from 'shared-save-processing/normalizeRawSections.js';
import {verifySectionCount} from 'shared-save-processing/verifySectionCount.js';
import {validateSchemas} from './validateSchemas.js';
import {validateFloatSerialization} from '../domain/rules/validateFloatSerialization.ts';
import {validateUniqueHost} from '../domain/rules/validateUniqueHost.ts';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';

// Real sections in the current save format (Terrain Layers was removed from the save format by a game update).
const SECTION_COUNT = 10;

/**
 * Validates a merged Planet Crafter save string: JSON schema compliance for each section, plus
 * domain-specific rules. Legacy saves (still containing the Terrain Layers section, removed by a
 * later game update) are transparently adapted to the current format and reported through
 * `warnings` instead of an error.
 *
 * @param {string} mergedSave
 * @returns {{isValid: boolean, errors: import('../application/ports/ValidationIssue').ValidationIssue[], warnings: import('shared-save-processing/normalizeRawSections.js').SaveWarningCode[]}}
 */
export function validateSaveContent(mergedSave) {
  const rawSections = mergedSave.split('@');
  const sectionCountErrors = verifySectionCount(rawSections);
  if (sectionCountErrors.length > 0) {
    return {
      isValid: false,
      errors: [{code: VALIDATION_ISSUE_CODES.INVALID_STRUCTURE, detail: sectionCountErrors[0].replace(/^INVALID: /, '')}],
      warnings: []
    };
  }

  const {sections: normalizedRawSections, warnings} = normalizeRawSections(rawSections);
  const errors = [];
  const parsedSections = parseSections(normalizedRawSections.slice(0, SECTION_COUNT), errors);

  errors.push(...validateSchemas(parsedSections));
  errors.push(...validateFloatSerialization(mergedSave));
  errors.push(...validateUniqueHost(parsedSections[2]));

  return {isValid: errors.length === 0, errors, warnings};
}

function parseSections(sections, errors) {
  return sections.map((section, sectionIndex) => {
    const trimmed = section.trim();
    if (!trimmed) {
      return [];
    }
    return trimmed.split('|\n').reduce((entries, line, entryIndex) => {
      try {
        const parsed = JSON.parse(line);
        if (parsed !== null && parsed !== undefined) {
          entries.push(parsed);
        }
      } catch {
        errors.push({code: VALIDATION_ISSUE_CODES.INVALID_JSON, detail: `Invalid JSON: ${line.slice(0, 60)}`, section: sectionIndex, entryIndex});
      }
      return entries;
    }, []);
  });
}
