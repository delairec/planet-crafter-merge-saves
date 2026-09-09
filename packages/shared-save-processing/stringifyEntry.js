/** @import { TerraformationLevel, Player, WorldObject } from './gameDefinitions' */

import {isRawIntegerField} from './int64Identifiers.js';

const FLOAT_FIELDS = Object.freeze(new Set([
  'unitOxygenLevel', 'unitHeatLevel', 'unitPressureLevel', 'unitPlantsLevel',
  'unitInsectsLevel', 'unitAnimalsLevel', 'unitPurificationLevel',
  'playerGaugeOxygen', 'playerGaugeThirst', 'playerGaugeHealth', 'playerGaugeToxic',
  'hunger',
]));

/**
 * Like JSON.stringify but preserves the `.0` suffix of the known float fields (Unity
 * serialization) and writes an int64 identifier as the bare decimal text it holds.
 * Entries are flat wire records, serialized field by field so that a field value is never
 * reinterpreted from the text of another field.
 * @param {TerraformationLevel | Player | WorldObject | Record<string, unknown>} entry
 * @returns {string}
 * @throws {Error} when a field holds a nested value. Only the first level is serialized here, so a
 * nested value means the wire format is no longer flat: extend this module to apply the float
 * notation below the first level instead of relaxing the check.
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
  if (typeof value === 'object' && value !== null) {
    throw new Error(`Unexpected save data: field "${key}" holds a nested value, while save entries are expected to be flat.`);
  }

  if (FLOAT_FIELDS.has(key) && typeof value === 'number' && Number.isInteger(value)) {
    return `${value}.0`;
  }

  if (isRawIntegerField(key, value)) {
    return `${value}`;
  }

  return JSON.stringify(value);
}
