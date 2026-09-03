import Ajv from 'ajv';
import schema0 from 'shared-save-processing/schemas/section0-player-progression.schema.json' with {type: 'json'};
import schema1 from 'shared-save-processing/schemas/section1-terraformation-levels.schema.json' with {type: 'json'};
import schema2 from 'shared-save-processing/schemas/section2-players.schema.json' with {type: 'json'};
import schema4 from 'shared-save-processing/schemas/section4-inventories.schema.json' with {type: 'json'};
import schema5 from 'shared-save-processing/schemas/section5-statistics.schema.json' with {type: 'json'};
import schema6 from 'shared-save-processing/schemas/section6-messages.schema.json' with {type: 'json'};
import schema7 from 'shared-save-processing/schemas/section7-story-events.schema.json' with {type: 'json'};
import schema8 from 'shared-save-processing/schemas/section8-save-config.schema.json' with {type: 'json'};
import schema9 from 'shared-save-processing/schemas/section9-world-events.schema.json' with {type: 'json'};
import {VALIDATION_ISSUE_CODES} from '../application/ports/ValidationIssue.ts';

const SCHEMAS_BY_SECTION = {0: schema0, 1: schema1, 2: schema2, 4: schema4, 5: schema5, 6: schema6, 7: schema7, 8: schema8, 9: schema9};

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
 * Validates parsed save sections against their JSON schemas.
 * @param {unknown[][]} parsedSections
 * @returns {import('../application/ports/ValidationIssue.ts').ValidationIssue[]}
 */
export function validateSchemas(parsedSections) {
  const validators = getSchemaValidators();
  const issues = [];

  for (const [sectionIndex, validate] of Object.entries(validators)) {
    const index = Number(sectionIndex);
    const entries = parsedSections[index] ?? [];
    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      const valid = validate(entries[entryIndex]);
      if (!valid) {
        for (const schemaError of validate.errors ?? []) {
          issues.push({
            code: VALIDATION_ISSUE_CODES.SCHEMA_VIOLATION,
            detail: `${schemaError.instancePath} ${schemaError.message}`.trim(),
            section: index,
            entryIndex
          });
        }
      }
    }
  }

  return issues;
}
