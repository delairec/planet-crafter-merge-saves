import Ajv from 'ajv';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join, dirname} from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMAS_DIR = join(__dirname, '..', 'docs', 'schemas');

const SECTION_SCHEMA_FILES = {
  0: 'section0-player-progression.schema.json',
  1: 'section1-terraformation-levels.schema.json',
  2: 'section2-players.schema.json',
  4: 'section4-inventories.schema.json',
  5: 'section5-statistics.schema.json',
  6: 'section6-messages.schema.json',
  7: 'section7-story-events.schema.json',
  8: 'section8-save-config.schema.json',
  9: 'section9-terrain-layers.schema.json',
  10: 'section10-world-events.schema.json',
};

const FLOAT_FIELDS = new Set([
  'unitOxygenLevel', 'unitHeatLevel', 'unitPressureLevel', 'unitPlantsLevel',
  'unitInsectsLevel', 'unitAnimalsLevel', 'unitPurificationLevel',
  'playerGaugeOxygen', 'playerGaugeThirst', 'playerGaugeHealth', 'playerGaugeToxic',
  'hunger',
]);

const SECTION_COUNT = 11;
const EXPECTED_SPLIT_PARTS = SECTION_COUNT + 1; // trailing @ produces one empty part

function loadSchemaValidators() {
  const ajv = new Ajv();
  const validators = {};
  for (const [sectionIndex, filename] of Object.entries(SECTION_SCHEMA_FILES)) {
    const schema = JSON.parse(readFileSync(join(SCHEMAS_DIR, filename), 'utf8'));
    validators[Number(sectionIndex)] = ajv.compile(schema);
  }
  return validators;
}

const schemaValidators = loadSchemaValidators();

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
        for (const ajvError of validate.errors) {
          errors.push({
            section: index,
            entryIndex,
            message: `${ajvError.instancePath} ${ajvError.message}`.trim(),
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
      message: `Field "${match[1]}" has integer value serialized without .0 suffix (got: ${match[2] ?? ''}${match[3]})`,
    });
  }
}

function validateUniqueHost(players, errors) {
  if (!players || players.length === 0) return;
  const hosts = players.filter(player => player.host === true);
  if (hosts.length !== 1) {
    errors.push({
      rule: 'unique-host',
      message: `Expected exactly one host player, found ${hosts.length}`,
    });
  }
}


