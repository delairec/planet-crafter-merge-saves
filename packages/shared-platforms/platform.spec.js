import {describe, expect, it} from 'bun:test';
import {createPlatform} from './platform.js';

describe('createPlatform', () => {

  describe('When called with "node"', () => {
    it('should expose the full runtime platform contract', () => {
      // Act
      const platform = createPlatform('node');

      // Assert
      expect(Object.keys(platform).sort()).toEqual([
        'exitProcess',
        'getBasename',
        'getCliArguments',
        'isEntryPoint',
        'joinPath',
        'readDirectory',
        'readTextFile',
        'writeTextFile'
      ]);
    });
  });

  describe('When called with "bun"', () => {
    it('should expose the full runtime platform contract', () => {
      // Act
      const platform = createPlatform('bun');

      // Assert
      expect(Object.keys(platform).sort()).toEqual([
        'exitProcess',
        'getBasename',
        'getCliArguments',
        'isEntryPoint',
        'joinPath',
        'readDirectory',
        'readTextFile',
        'writeTextFile'
      ]);
    });
  });

  describe('When called with an unsupported platform name', () => {
    it('should throw an error listing the supported platforms', () => {
      // Act
      const execute = () => createPlatform(/** @type {'bun'|'node'} */ ('deno'));

      // Assert
      expect(execute).toThrow('Unsupported platform: deno. Supported platforms: bun, node.');
    });
  });
});
