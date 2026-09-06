import {describe, expect, it} from 'bun:test';
import {formatSaveWarning} from './formatSaveWarning.ts';
import {SAVE_WARNING_CODES, type SaveWarningCode} from 'shared-save-processing/normalizeRawSections.js';
import {unknownSaveWarningMessage} from './messages/saveWarningMessages.js';

describe('formatSaveWarning', () => {

  describe('When the save format is the legacy one', () => {
    it('should describe the adaptation to the current format', () => {
      // Act
      const message = formatSaveWarning('legacy-save-format');

      // Assert
      expect(message).toBe('This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.');
    });
  });

  describe('When the warning code is unknown', () => {
    it('should return a generic sentence rather than the code', () => {
      // Act
      const message = formatSaveWarning('unheard-of-warning' as SaveWarningCode);

      // Assert
      expect(message).toBe('This save had to be adapted to the current save format.');
    });
  });

  describe('When every known warning code is formatted', () => {
    it('should leave none of them on the generic sentence', () => {
      // Act
      const codesWithoutOwnMessage = Object.values(SAVE_WARNING_CODES)
        .filter(code => formatSaveWarning(code) === unknownSaveWarningMessage);

      // Assert
      expect(codesWithoutOwnMessage).toEqual([]);
    });
  });
});
