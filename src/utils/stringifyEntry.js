const FLOAT_FIELDS = new Set([
  'unitOxygenLevel', 'unitHeatLevel', 'unitPressureLevel', 'unitPlantsLevel',
  'unitInsectsLevel', 'unitAnimalsLevel', 'unitPurificationLevel',
  'playerGaugeOxygen', 'playerGaugeThirst', 'playerGaugeHealth', 'playerGaugeToxic',
  'hunger',
]);

/**
 * Like JSON.stringify but preserves .0 suffix for known float fields.
 * @param {object} entry
 * @returns {string}
 */
export function stringifyEntry(entry) {
  return JSON.stringify(entry, (key, value) => {
    if (FLOAT_FIELDS.has(key) && typeof value === 'number' && Number.isInteger(value)) {
      return `FLOAT:${value}`;
    }
    return value;
  }).replace(/"FLOAT:(-?\d+)"/g, '$1.0');
}

