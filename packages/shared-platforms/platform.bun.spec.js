import {describe, expect, it} from 'bun:test';
import {isEntryPoint} from './platform.bun.js';

describe('Bun platform', () => {

  describe('isEntryPoint', () => {
    describe('When importMeta.main is true', () => {
      it('should return true', () => {
        // Arrange
        const importMeta = {main: true};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('When importMeta.main is false', () => {
      it('should return false', () => {
        // Arrange
        const importMeta = {main: false};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('When importMeta.main is absent', () => {
      it('should return false', () => {
        // Arrange
        const importMeta = {};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(false);
      });
    });
  });
});
