import {describe, expect, it} from 'bun:test';
import {validateFloatSerialization} from './validateFloatSerialization.ts';
import {VALIDATION_ISSUE_CODES} from '../../application/ports/ValidationIssue.ts';

describe('validateFloatSerialization', () => {

  describe('When a tracked field is serialized with a decimal point', () => {
    it('should return no issue', () => {
      // Arrange
      const save = '"playerGaugeOxygen":280.0';

      // Act
      const issues = validateFloatSerialization(save);

      // Assert
      expect(issues).toEqual([]);
    });
  });

  describe('When a tracked field is serialized as an integer', () => {
    it('should return a float-serialization issue', () => {
      // Arrange
      const save = '"playerGaugeOxygen":280';

      // Act
      const issues = validateFloatSerialization(save);

      // Assert
      expect(issues).toEqual([{
        code: VALIDATION_ISSUE_CODES.FLOAT_SERIALIZATION,
        detail: 'Field "playerGaugeOxygen" has integer value serialized without .0 suffix (got: 280)'
      }]);
    });
  });

  describe('When an untracked field is serialized as an integer', () => {
    it('should return no issue', () => {
      // Arrange
      const save = '"someOtherField":280';

      // Act
      const issues = validateFloatSerialization(save);

      // Assert
      expect(issues).toEqual([]);
    });
  });
});
