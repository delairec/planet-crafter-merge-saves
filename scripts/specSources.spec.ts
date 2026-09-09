import {describe, expect, it} from 'bun:test';
import {isOwnSpecFile} from './specSources.ts';

describe('isOwnSpecFile', () => {

  describe('When a spec lives outside the packages directory', () => {
    it('should be checked, wherever it is written in the repository', () => {
      // Act
      const checkedPaths = ['testIsolation.spec.ts', 'scripts/node/hooks.spec.js', 'packages/cli-merge/cli/merge-cli.spec.js']
        .filter(isOwnSpecFile);

      // Assert
      expect(checkedPaths).toEqual(['testIsolation.spec.ts', 'scripts/node/hooks.spec.js', 'packages/cli-merge/cli/merge-cli.spec.js']);
    });
  });

  describe('When a spec comes from a dependency or a build output', () => {
    it('should be left out, that spec not being ours', () => {
      // Act
      const checkedPaths = ['node_modules/some-lib/index.spec.js', 'packages/ui-save-manager/dist/bundle.spec.js']
        .filter(isOwnSpecFile);

      // Assert
      expect(checkedPaths).toEqual([]);
    });
  });
});
