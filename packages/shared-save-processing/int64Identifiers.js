/**
 * Fields the save format writes as an int64 decimal: a player's Steam identifier, the only value
 * of the format sitting beyond the integers a double represents exactly. `JSON.parse` rounds such
 * a literal and `JSON.stringify` then writes the shortest decimal reading back to the same double,
 * so the identifier is read as its source text and written back as that text, unquoted. The tool
 * only compares and copies it, two operations a string performs exactly.
 *
 * The criterion is the type of the value, never the section it belongs to: `WorldObject.id` and
 * `Inventory.id` share the field name, are numbers, and stay numbers.
 * @see GR-ID-7 in docs/game-rules.md
 */
export const RAW_INTEGER_FIELDS = Object.freeze(new Set(['id']));

const DECIMAL_INTEGER = /^-?\d+$/;

/**
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean} whether the field is written back as the bare decimal text it holds
 */
export function isRawIntegerField(key, value) {
  return RAW_INTEGER_FIELDS.has(key) && typeof value === 'string' && DECIMAL_INTEGER.test(value);
}

/**
 * `JSON.parse` reviver handing back the source text of an int64 identifier in place of the number
 * the parser rounded it to.
 * @param {string} key
 * @param {unknown} value
 * @param {{source?: string}} context - source text access of `JSON.parse` (ES2025); `source` is
 * absent for a value the document holds as an object or an array, which an identifier never is.
 * @returns {unknown}
 */
export function keepInt64IdentifierText(key, value, context) {
  return RAW_INTEGER_FIELDS.has(key) ? context.source ?? value : value;
}
