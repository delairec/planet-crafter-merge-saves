import {describe, expect, it} from 'bun:test';
import {isEntryPoint} from './platform.node.js';

describe('Node platform', () => {

  describe('isEntryPoint', () => {
    describe('When the running script path matches the module URL', () => {
      it('should return true', () => {
        // Arrange
        const scriptPath = process.argv[1];
        const importMeta = {url: `file://${scriptPath}`};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('When the running script path does not match the module URL', () => {
      it('should return false', () => {
        // Arrange
        const importMeta = {url: 'file:///some/other/module.js'};

        // Act
        const result = isEntryPoint(importMeta);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('When importMeta has no url', () => {
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
