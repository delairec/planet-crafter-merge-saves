import Ajv from 'ajv';
import schema0 from '../../docs/schemas/section0-player-progression.schema.json' with {type: 'json'};
import schema1 from '../../docs/schemas/section1-terraformation-levels.schema.json' with {type: 'json'};
import schema2 from '../../docs/schemas/section2-players.schema.json' with {type: 'json'};
import schema4 from '../../docs/schemas/section4-inventories.schema.json' with {type: 'json'};
import schema5 from '../../docs/schemas/section5-statistics.schema.json' with {type: 'json'};
import schema6 from '../../docs/schemas/section6-messages.schema.json' with {type: 'json'};
import schema7 from '../../docs/schemas/section7-story-events.schema.json' with {type: 'json'};
import schema8 from '../../docs/schemas/section8-save-config.schema.json' with {type: 'json'};
import schema9 from '../../docs/schemas/section9-terrain-layers.schema.json' with {type: 'json'};
import schema10 from '../../docs/schemas/section10-world-events.schema.json' with {type: 'json'};

const FLOAT_FIELDS = new Set([
  'unitOxygenLevel', 'unitHeatLevel', 'unitPressureLevel', 'unitPlantsLevel',
  'unitInsectsLevel', 'unitAnimalsLevel', 'unitPurificationLevel',
  'playerGaugeOxygen', 'playerGaugeThirst', 'playerGaugeHealth', 'playerGaugeToxic',
  'hunger'
]);

const SECTION_COUNT = 11;
const EXPECTED_SPLIT_PARTS = SECTION_COUNT + 1; // trailing @ produces one empty part

const ajv = new Ajv();
const schemaValidators = {
  0: ajv.compile(schema0),
  1: ajv.compile(schema1),
  2: ajv.compile(schema2),
  4: ajv.compile(schema4),
  5: ajv.compile(schema5),
  6: ajv.compile(schema6),
  7: ajv.compile(schema7),
  8: ajv.compile(schema8),
  9: ajv.compile(schema9),
  10: ajv.compile(schema10)
};

/**
 * Validates a merged Planet Crafter save string.
 * Checks JSON schema compliance for each section and domain-specific rules.
 *
 * @param {string} mergedSave
 * @returns {{ isValid: boolean, errors: Array<{section?: number, entryIndex?: number, rule?: string, message: string}> }}
 */
export function validateMergedSave(mergedSave) {
  const errors = [];

  const sections = mergedSave.split('@');
  if (sections.length !== EXPECTED_SPLIT_PARTS) {
    errors.push({message: `Expected ${SECTION_COUNT} sections separated by '@', got ${sections.length - 1}`});
    return {isValid: errors.length === 0, errors};
  }

  const parsedSections = parseSections(sections.slice(0, SECTION_COUNT), errors);

  validateSchemas(parsedSections, errors);
  validateFloatSerialization(mergedSave, errors);
  validateUniqueHost(parsedSections[2], errors);

  return {isValid: errors.length === 0, errors};
}

function parseSections(sections, errors) {
  return sections.map((section, sectionIndex) => {
    const trimmed = section.trim();
    if (!trimmed) return [];
    return trimmed.split('|\n').reduce((entries, line, entryIndex) => {
      try {
        const parsed = JSON.parse(line);
        if (parsed !== null && parsed !== undefined) entries.push(parsed);
      } catch {
        errors.push({section: sectionIndex, entryIndex, message: `Invalid JSON: ${line.slice(0, 60)}`});
      }
      return entries;
    }, []);
  });
}

function validateSchemas(parsedSections, errors) {
  for (const [sectionIndex, validate] of Object.entries(schemaValidators)) {
    const index = Number(sectionIndex);
    const entries = parsedSections[index] ?? [];
    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      const valid = validate(entries[entryIndex]);
      if (!valid) {
        for (const ajvError of validate.errors ?? []) {
          errors.push({
            section: index,
            entryIndex,
            message: `${ajvError.instancePath} ${ajvError.message}`.trim()
          });
        }
      }
    }
  }
}

function validateFloatSerialization(mergedSave, errors) {
  // Match "fieldName":integerValue — where value has no decimal point
  const floatFieldsPattern = Array.from(FLOAT_FIELDS).join('|');
  const regex = new RegExp(`"(${floatFieldsPattern})":(-)?(\\d+)(?![.\\d])`, 'g');

  let match;
  while ((match = regex.exec(mergedSave)) !== null) {
    errors.push({
      rule: 'float-serialization',
      message: `Field "${match[1]}" has integer value serialized without .0 suffix (got: ${match[2] ?? ''}${match[3]})`
    });
  }
}

function validateUniqueHost(players, errors) {
  if (!players || players.length === 0) return;
  const hosts = players.filter(player => player.host === true);
  if (hosts.length !== 1) {
    errors.push({
      rule: 'unique-host',
      message: `Expected exactly one host player, found ${hosts.length}`
    });
  }
}


