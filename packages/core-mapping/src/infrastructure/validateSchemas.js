import Ajv from 'ajv';
import schema0 from 'shared-save-processing/schemas/section0-player-progression.schema.json' with {type: 'json'};
import schema1 from 'shared-save-processing/schemas/section1-terraformation-levels.schema.json' with {type: 'json'};
import schema2 from 'shared-save-processing/schemas/section2-players.schema.json' with {type: 'json'};
import schema3 from 'shared-save-processing/schemas/section3-world-objects.schema.json' with {type: 'json'};
import schema4 from 'shared-save-processing/schemas/section4-inventories.schema.json' with {type: 'json'};
import schema5 from 'shared-save-processing/schemas/section5-statistics.schema.json' with {type: 'json'};
import schema6 from 'shared-save-processing/schemas/section6-messages.schema.json' with {type: 'json'};
import schema7 from 'shared-save-processing/schemas/section7-story-events.schema.json' with {type: 'json'};
import schema8 from 'shared-save-processing/schemas/section8-save-config.schema.json' with {type: 'json'};
import schema9 from 'shared-save-processing/schemas/section9-world-events.schema.json' with {type: 'json'};
import {WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';

const SCHEMAS_BY_SECTION = {0: schema0, 1: schema1, 2: schema2, 3: schema3, 4: schema4, 5: schema5, 6: schema6, 7: schema7, 8: schema8, 9: schema9};

/**
 * The sections reaching validation as a list of entries: every section holding a schema but the
 * world objects one, which arrives as a generator factory so that it is never held whole.
 */
const LISTED_SECTION_INDEXES = Object.keys(SCHEMAS_BY_SECTION)
  .map(Number)
  .filter(sectionIndex => sectionIndex !== WORLD_OBJECTS_SECTION_INDEX);

let schemaValidators;

function getSchemaValidators() {
  if (!schemaValidators) {
    const ajv = new Ajv();
    schemaValidators = Object.fromEntries(
      Object.entries(SCHEMAS_BY_SECTION).map(([sectionIndex, schema]) => [sectionIndex, ajv.compile(schema)])
    );
  }
  return schemaValidators;
}

/**
 * Validates the parsed save sections holding a list of entries against their JSON schemas. The
 * world objects section is not one of them: it arrives as a generator factory, and its entries are
 * validated one by one through `validateSectionEntry` while the walker of the section goes past
 * them.
 * @param {import('shared-save-processing/gameDefinitions').ParsedSections | unknown[][]} parsedSections
 * @returns {import('../application/ports/ValidationIssue.ts').ValidationIssue[]}
 * @throws {Error} when a section that should hold a list of entries does not. The reader of the
 * format guarantees it does, so this is a broken invariant of ours and never a malformed save: fix
 * what handed the section over rather than reading it as a section without a single entry, which
 * is how the world objects section went unvalidated for as long as it did.
 */
export function validateSchemas(parsedSections) {
  const issues = [];

  for (const sectionIndex of LISTED_SECTION_INDEXES) {
    const entries = parsedSections[sectionIndex];

    if (!Array.isArray(entries)) {
      throw new Error(`Unexpected save data: section ${sectionIndex} should hold a list of entries, received ${String(entries)}.`);
    }

    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      issues.push(...validateSectionEntry(sectionIndex, entries[entryIndex], entryIndex));
    }
  }

  return issues;
}

/**
 * Validates a single entry against the schema of its section, so that a section walked one entry at
 * a time is validated without ever being materialized.
 * @param {number} sectionIndex - index of a section holding a schema
 * @param {unknown} entry
 * @param {number} entryIndex - position of the entry among the readable entries of its section
 * @returns {import('../application/ports/ValidationIssue.ts').ValidationIssue[]}
 */
export function validateSectionEntry(sectionIndex, entry, entryIndex) {
  const validate = getSchemaValidators()[sectionIndex];

  if (validate(entry)) {
    return [];
  }

  return (validate.errors ?? []).map(schemaError => ({
    code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION,
    detail: `${schemaError.instancePath} ${schemaError.message}`.trim(),
    section: sectionIndex,
    entryIndex
  }));
}
