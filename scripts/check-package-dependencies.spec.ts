import {describe, expect, it} from 'bun:test';
import {findImportedPackages, findViolations} from './check-package-dependencies.ts';
import type {DependencyMatrix, PackageImport, WorkspacePackage} from './check-package-dependencies.ts';

const matrix: DependencyMatrix = {
  'core-': ['shared-', 'util-'],
  'util-': [],
  'cli-': ['shared-', 'util-', 'core-'],
  'ui-': ['shared-', 'util-', 'core-'],
  'shared-': ['util-']
};

const noImports: PackageImport[] = [];
const noDependencies: string[] = [];

describe('findViolations', () => {

  describe('When a package declares a dependency on a forbidden prefix', () => {
    it('should report the manifest of the consumer', () => {
      // Arrange
      const packages: WorkspacePackage[] = [
        {name: 'core-mapping', manifestPath: 'packages/core-mapping/package.json', declaredDependencies: ['cli-merge']},
        {name: 'cli-merge', manifestPath: 'packages/cli-merge/package.json', declaredDependencies: noDependencies}
      ];

      // Act
      const violations = findViolations(packages, noImports, matrix);

      // Assert
      expect(violations).toEqual([{
        location: 'packages/core-mapping/package.json',
        message: 'dependency on cli-merge: a core- package may only depend on shared-, util-'
      }]);
    });
  });

  describe('When a package allowed no dependency declares one', () => {
    it('should report that it may depend on no workspace package', () => {
      // Arrange
      const packages: WorkspacePackage[] = [
        {name: 'util-types', manifestPath: 'packages/util-types/package.json', declaredDependencies: ['shared-platforms']},
        {name: 'shared-platforms', manifestPath: 'packages/shared-platforms/package.json', declaredDependencies: noDependencies}
      ];

      // Act
      const violations = findViolations(packages, noImports, matrix);

      // Assert
      expect(violations).toEqual([{
        location: 'packages/util-types/package.json',
        message: 'dependency on shared-platforms: a util- package may not depend on any workspace package'
      }]);
    });
  });

  describe('When a source imports a package of a forbidden prefix', () => {
    it('should report the file and the line of the import', () => {
      // Arrange
      const packages: WorkspacePackage[] = [
        {name: 'core-mapping', manifestPath: 'packages/core-mapping/package.json', declaredDependencies: ['cli-merge']},
        {name: 'cli-merge', manifestPath: 'packages/cli-merge/package.json', declaredDependencies: noDependencies}
      ];
      const imports: PackageImport[] = [{
        packageName: 'core-mapping',
        filePath: 'packages/core-mapping/src/controllers/MergeSaveFilesController.ts',
        line: 12,
        specifier: 'cli-merge/cli/merge-cli.js'
      }];

      // Act
      const violations = findViolations(packages, imports, matrix);

      // Assert
      expect(violations).toEqual([
        {
          location: 'packages/core-mapping/package.json',
          message: 'dependency on cli-merge: a core- package may only depend on shared-, util-'
        },
        {
          location: 'packages/core-mapping/src/controllers/MergeSaveFilesController.ts:12',
          message: 'import of \'cli-merge/cli/merge-cli.js\': a core- package may only depend on shared-, util-'
        }
      ]);
    });
  });

  describe('When a source imports a workspace package its manifest does not declare', () => {
    it('should report the undeclared dependency', () => {
      // Arrange
      const packages: WorkspacePackage[] = [
        {name: 'shared-platforms', manifestPath: 'packages/shared-platforms/package.json', declaredDependencies: noDependencies},
        {name: 'util-types', manifestPath: 'packages/util-types/package.json', declaredDependencies: noDependencies}
      ];
      const imports: PackageImport[] = [{
        packageName: 'shared-platforms',
        filePath: 'packages/shared-platforms/platform.js',
        line: 3,
        specifier: 'util-types/gameDefinitions'
      }];

      // Act
      const violations = findViolations(packages, imports, matrix);

      // Assert
      expect(violations).toEqual([{
        location: 'packages/shared-platforms/platform.js:3',
        message: 'import of \'util-types/gameDefinitions\': util-types is missing from the dependencies of packages/shared-platforms/package.json'
      }]);
    });
  });

  describe('When a package declares a workspace dependency it never imports', () => {
    it('should report the unused declaration', () => {
      // Arrange
      const packages: WorkspacePackage[] = [
        {name: 'ui-save-manager', manifestPath: 'packages/ui-save-manager/package.json', declaredDependencies: ['core-mapping', 'shared-save-processing']},
        {name: 'core-mapping', manifestPath: 'packages/core-mapping/package.json', declaredDependencies: noDependencies},
        {name: 'shared-save-processing', manifestPath: 'packages/shared-save-processing/package.json', declaredDependencies: noDependencies}
      ];
      const imports: PackageImport[] = [{
        packageName: 'ui-save-manager',
        filePath: 'packages/ui-save-manager/src/components/MergeSection.tsx',
        line: 2,
        specifier: 'core-mapping/controllers/MergeSaveFilesController'
      }];

      // Act
      const violations = findViolations(packages, imports, matrix);

      // Assert
      expect(violations).toEqual([{
        location: 'packages/ui-save-manager/package.json',
        message: 'dependency on shared-save-processing: never imported'
      }]);
    });
  });

  describe('When the name of a package carries no prefix of the matrix', () => {
    it('should report the manifest as outside the dependency matrix', () => {
      // Arrange
      const packages: WorkspacePackage[] = [
        {name: 'save-tools', manifestPath: 'packages/save-tools/package.json', declaredDependencies: ['util-types']},
        {name: 'util-types', manifestPath: 'packages/util-types/package.json', declaredDependencies: noDependencies}
      ];

      // Act
      const violations = findViolations(packages, noImports, matrix);

      // Assert
      expect(violations).toEqual([{
        location: 'packages/save-tools/package.json',
        message: 'package name save-tools carries no prefix of the dependency matrix'
      }]);
    });
  });

  describe('When a source imports its own package by name', () => {
    it('should report nothing', () => {
      // Arrange
      const packages: WorkspacePackage[] = [
        {name: 'shared-save-processing', manifestPath: 'packages/shared-save-processing/package.json', declaredDependencies: noDependencies}
      ];
      const imports: PackageImport[] = [{
        packageName: 'shared-save-processing',
        filePath: 'packages/shared-save-processing/parseSaveSections.js',
        line: 1,
        specifier: 'shared-save-processing/sectionIndexes.js'
      }];

      // Act
      const violations = findViolations(packages, imports, matrix);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a package declares and imports a dependency the matrix allows', () => {
    it('should report nothing', () => {
      // Arrange
      const packages: WorkspacePackage[] = [
        {name: 'cli-merge', manifestPath: 'packages/cli-merge/package.json', declaredDependencies: ['core-mapping']},
        {name: 'core-mapping', manifestPath: 'packages/core-mapping/package.json', declaredDependencies: noDependencies}
      ];
      const imports: PackageImport[] = [{
        packageName: 'cli-merge',
        filePath: 'packages/cli-merge/cli/merge-cli.js',
        line: 4,
        specifier: 'core-mapping/controllers/MergeSaveFilesController'
      }];

      // Act
      const violations = findViolations(packages, imports, matrix);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a package depends on a library outside the workspace', () => {
    it('should report nothing, that dependency being outside the matrix', () => {
      // Arrange
      const packages: WorkspacePackage[] = [
        {name: 'core-mapping', manifestPath: 'packages/core-mapping/package.json', declaredDependencies: ['ajv', 'typescript']}
      ];
      const imports: PackageImport[] = [{
        packageName: 'core-mapping',
        filePath: 'packages/core-mapping/src/infrastructure/SaveFileSchemaValidator.ts',
        line: 1,
        specifier: 'ajv'
      }];

      // Act
      const violations = findViolations(packages, imports, matrix);

      // Assert
      expect(violations).toEqual([]);
    });
  });
});

describe('findImportedPackages', () => {

  describe('When a file imports a package with a static import', () => {
    it('should report the specifier and its line', () => {
      // Arrange
      const source = [
        'import {parseSaveSections} from \'shared-save-processing/parseSaveSections.js\';',
        '',
        'export const sections = parseSaveSections(content);'
      ].join('\n');

      // Act
      const importedPackages = findImportedPackages(source);

      // Assert
      expect(importedPackages).toEqual([{line: 1, specifier: 'shared-save-processing/parseSaveSections.js'}]);
    });
  });

  describe('When a file imports a package for its types only', () => {
    it('should report the specifier, a type-only import being a dependency too', () => {
      // Arrange
      const source = 'import type {RuntimePlatform} from \'util-types/gameDefinitions\';';

      // Act
      const importedPackages = findImportedPackages(source);

      // Assert
      expect(importedPackages).toEqual([{line: 1, specifier: 'util-types/gameDefinitions'}]);
    });
  });

  describe('When a file re-exports from a package', () => {
    it('should report the specifier', () => {
      // Arrange
      const source = 'export {MergeResultViewModel} from \'core-mapping/presentation/viewModels/MergeResultViewModel\';';

      // Act
      const importedPackages = findImportedPackages(source);

      // Assert
      expect(importedPackages).toEqual([{line: 1, specifier: 'core-mapping/presentation/viewModels/MergeResultViewModel'}]);
    });
  });

  describe('When a file imports a package dynamically', () => {
    it('should report the specifier', () => {
      // Arrange
      const source = 'const {platform} = await import(\'shared-platforms/platform.js\');';

      // Act
      const importedPackages = findImportedPackages(source);

      // Assert
      expect(importedPackages).toEqual([{line: 1, specifier: 'shared-platforms/platform.js'}]);
    });
  });

  describe('When a JavaScript file imports a type through a JSDoc directive', () => {
    it('should report the specifier', () => {
      // Arrange
      const source = '/** @import {ParsedSections} from \'shared-save-processing/gameDefinitions\' */';

      // Act
      const importedPackages = findImportedPackages(source);

      // Assert
      expect(importedPackages).toEqual([{line: 1, specifier: 'shared-save-processing/gameDefinitions'}]);
    });
  });

  describe('When a file imports a sibling module', () => {
    it('should report nothing, a relative or aliased path naming no package', () => {
      // Arrange
      const source = [
        'import {yieldToPaint} from \'./yieldToPaint\';',
        'import {Emoji} from \'../components/Emoji\';',
        'import {app} from \'~/app\';'
      ].join('\n');

      // Act
      const importedPackages = findImportedPackages(source);

      // Assert
      expect(importedPackages).toEqual([]);
    });
  });

  describe('When a file imports several packages', () => {
    it('should report each specifier on its own line', () => {
      // Arrange
      const source = [
        'import Ajv from \'ajv\';',
        'import {createSignal} from \'solid-js\';',
        'import {readFile} from \'node:fs/promises\';'
      ].join('\n');

      // Act
      const importedPackages = findImportedPackages(source);

      // Assert
      expect(importedPackages).toEqual([
        {line: 1, specifier: 'ajv'},
        {line: 2, specifier: 'solid-js'},
        {line: 3, specifier: 'node:fs/promises'}
      ]);
    });
  });
});
