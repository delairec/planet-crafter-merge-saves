import {describe, expect, it} from 'bun:test';
import {parseMergeCliArguments} from './parseMergeCliArguments.js';

describe('Merge CLI argument parsing', () => {
  describe('When no arguments are provided', () => {
    it('should default the input directory to "input"', () => {
      // Arrange
      const argv = [];

      // Act
      const {inputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(inputDir).toBe('input');
    });

    it('should default the output directory to "output"', () => {
      // Arrange
      const argv = [];

      // Act
      const {outputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(outputDir).toBe('output');
    });
  });

  describe('When an --input= argument is provided', () => {
    it('should use the provided input directory', () => {
      // Arrange
      const argv = ['--input=my-saves'];

      // Act
      const {inputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(inputDir).toBe('my-saves');
    });
  });

  describe('When an --output= argument is provided', () => {
    it('should use the provided output directory', () => {
      // Arrange
      const argv = ['--output=merged-saves'];

      // Act
      const {outputDir} = parseMergeCliArguments(argv);

      // Assert
      expect(outputDir).toBe('merged-saves');
    });
  });
});
