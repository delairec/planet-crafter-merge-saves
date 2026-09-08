import {describe, expect, it} from 'bun:test';
import {formatSaveWarning} from './formatSaveWarning';
import {SAVE_WARNING_CODES, SaveWarningCode} from 'shared-save-processing/normalizeRawSections.js';
import {SaveValidationMessageViewModel} from './viewModels/SaveFileValidationViewModel';
import {unknownSaveWarningMessage} from './messages/saveWarningMessages.js';

describe('formatSaveWarning', () => {

  describe('When the save format is the legacy one', () => {
    it('should describe the adaptation to the current format, without a location', () => {
      // Act
      const warning = formatSaveWarning('legacy-save-format');

      // Assert
      expect<SaveValidationMessageViewModel>(warning).toEqual({
        message: 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.',
        location: null
      });
    });
  });

  describe('When the warning code is unknown', () => {
    it('should return a generic sentence rather than the code', () => {
      // Act
      const warning = formatSaveWarning('unheard-of-warning' as SaveWarningCode);

      // Assert
      expect<SaveValidationMessageViewModel>(warning).toEqual({
        message: 'This save had to be adapted to the current save format.',
        location: null
      });
    });
  });

  describe('When every known warning code is formatted', () => {
    it('should leave none of them on the generic sentence', () => {
      // Act
      const codesWithoutOwnMessage = Object.values(SAVE_WARNING_CODES)
        .filter(code => formatSaveWarning(code).message === unknownSaveWarningMessage);

      // Assert
      expect<SaveWarningCode[]>(codesWithoutOwnMessage).toEqual([]);
    });
  });
});
