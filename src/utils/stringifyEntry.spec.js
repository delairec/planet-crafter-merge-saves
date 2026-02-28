import {describe, it} from 'node:test';
import {equal} from 'node:assert/strict';
import {stringifyEntry} from './stringifyEntry.js';

describe('stringifyEntry', () => {
  describe('When a float field has an integer value', () => {
    it('should serialize playerGaugeOxygen with .0 suffix', () => {
      equal(stringifyEntry({playerGaugeOxygen: 280}), '{"playerGaugeOxygen":280.0}');
    });

    it('should serialize playerGaugeToxic with .0 suffix', () => {
      equal(stringifyEntry({playerGaugeToxic: 0}), '{"playerGaugeToxic":0.0}');
    });

    it('should serialize playerGaugeThirst with .0 suffix', () => {
      equal(stringifyEntry({playerGaugeThirst: 100}), '{"playerGaugeThirst":100.0}');
    });

    it('should serialize playerGaugeHealth with .0 suffix', () => {
      equal(stringifyEntry({playerGaugeHealth: 72}), '{"playerGaugeHealth":72.0}');
    });

    it('should serialize unitOxygenLevel with .0 suffix', () => {
      equal(stringifyEntry({unitOxygenLevel: 2477136019456}), '{"unitOxygenLevel":2477136019456.0}');
    });

    it('should serialize unitHeatLevel with .0 suffix', () => {
      equal(stringifyEntry({unitHeatLevel: 2219597103104}), '{"unitHeatLevel":2219597103104.0}');
    });

    it('should serialize unitPurificationLevel with .0 suffix', () => {
      equal(stringifyEntry({unitPurificationLevel: 0}), '{"unitPurificationLevel":0.0}');
    });

    it('should serialize hunger with .0 suffix', () => {
      equal(stringifyEntry({hunger: -100}), '{"hunger":-100.0}');
    });
  });

  describe('When a float field already has a decimal value', () => {
    it('should serialize it as-is', () => {
      equal(stringifyEntry({playerGaugeThirst: 96.3858642578125}), '{"playerGaugeThirst":96.3858642578125}');
    });
  });

  describe('When a field is not a float field', () => {
    it('should serialize integer values without .0 suffix', () => {
      equal(stringifyEntry({id: 42}), '{"id":42}');
    });

    it('should serialize string values normally', () => {
      equal(stringifyEntry({name: 'Rrose'}), '{"name":"Rrose"}');
    });
  });

  describe('When entry has mixed fields', () => {
    it('should apply .0 only to known float fields', () => {
      equal(
        stringifyEntry({id: 1, playerGaugeOxygen: 370, playerGaugeThirst: 99.9, host: true}),
        '{"id":1,"playerGaugeOxygen":370.0,"playerGaugeThirst":99.9,"host":true}'
      );
    });
  });
});

