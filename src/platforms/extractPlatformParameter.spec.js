import {describe, expect, it} from 'bun:test';
import {extractPlatformParameter, SUPPORTED_PLATFORMS} from './extractPlatformParameter.js';

describe('Extract platform parameter', () => {

  describe('When --platform is absent', () => {
    it('should use fallback value', () => {
      // Arrange
      const argv = ['script.js'];

      // Act
      const platform = extractPlatformParameter(argv);

      // Assert
      expect(platform).toBe('bun');
    });
  });

  describe('When --platform is present', () => {
    it.each([SUPPORTED_PLATFORMS])('should return $platform as the platform name', (/** @type {'bun'|'node'} */ expectedPlatform) => {
      // Arrange
      const argv = [expectedPlatform, 'script.js', `--platform=${expectedPlatform}`];

      // Act
      const platform = extractPlatformParameter(argv);

      // Assert
      expect(platform).toBe(expectedPlatform);
    });
  });

  describe('When --platform is invalid', () => {
    it('should throw an error', () => {
      // Arrange
      const argv = ['script.js', '--platform=invalidPlatform'];

      //Act
      const execute = () => extractPlatformParameter(argv);

      // Assert
      expect(execute).toThrow('Invalid platform: invalidPlatform. Supported platforms: bun, node.');
    });
  });
});
