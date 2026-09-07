/** @import { TerraformationLevel, Player, WorldObject } from './gameDefinitions' */

const FLOAT_FIELDS = Object.freeze(new Set([
  'unitOxygenLevel', 'unitHeatLevel', 'unitPressureLevel', 'unitPlantsLevel',
  'unitInsectsLevel', 'unitAnimalsLevel', 'unitPurificationLevel',
  'playerGaugeOxygen', 'playerGaugeThirst', 'playerGaugeHealth', 'playerGaugeToxic',
  'hunger',
]));

/**
 * Like JSON.stringify but preserves `.0` suffix for known float fields (Unity serialization).
 * Entries are flat wire records, serialized field by field so that a field value is never
 * reinterpreted from the text of another field.
 * @param {TerraformationLevel | Player | WorldObject | Record<string, unknown>} entry
 * @returns {string}
 */
export function stringifyEntry(entry) {
  const fields = Object.entries(entry)
    .map(([key, value]) => stringifyField(key, value))
    .filter(field => field !== null);

  return `{${fields.join(',')}}`;
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {string | null} the serialized field, or null when JSON.stringify would omit it
 */
function stringifyField(key, value) {
  const serializedValue = stringifyValue(key, value);
  if (serializedValue === undefined) {
    return null;
  }

  return `${JSON.stringify(key)}:${serializedValue}`;
}

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {string | undefined}
 */
function stringifyValue(key, value) {
  if (FLOAT_FIELDS.has(key) && typeof value === 'number' && Number.isInteger(value)) {
    return `${value}.0`;
  }

  return JSON.stringify(value);
}
