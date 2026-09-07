import {afterEach, describe, expect, it} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {load, resolve} from './hooks.js';

describe('Node source hooks', () => {
  /** @type {string[]} */
  const temporaryDirectories = [];

  afterEach(async () => {
    await Promise.all(temporaryDirectories.splice(0).map(directory => fs.rm(directory, {recursive: true, force: true})));
  });

  async function createModuleFolder() {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'node-hooks-'));
    temporaryDirectories.push(directory);
    return directory;
  }

  /**
   * @returns {{nextResolve: (specifier: string, context: object) => Promise<object>, resolvedSpecifiers: string[]}}
   */
  function createResolveRecorder() {
    /** @type {string[]} */
    const resolvedSpecifiers = [];
    return {
      nextResolve: async (specifier) => {
        resolvedSpecifiers.push(specifier);
        return {url: specifier};
      },
      resolvedSpecifiers
    };
  }

  describe('When a relative specifier omits the extension of a TypeScript module', () => {
    it('should resolve it to the .ts file next to the importing module', async () => {
      // Arrange
      const directory = await createModuleFolder();
      await fs.writeFile(path.join(directory, 'MergeSaveFiles.ts'), 'export {};', 'utf8');
      const parentURL = pathToFileURL(path.join(directory, 'controller.ts')).href;
      const {nextResolve, resolvedSpecifiers} = createResolveRecorder();

      // Act
      await resolve('./MergeSaveFiles', {parentURL}, nextResolve);

      // Assert
      expect(resolvedSpecifiers).toEqual([pathToFileURL(path.join(directory, 'MergeSaveFiles.ts')).href]);
    });
  });

  describe('When a relative specifier omits the extension of a JavaScript module', () => {
    it('should resolve it to the .js file next to the importing module', async () => {
      // Arrange
      const directory = await createModuleFolder();
      await fs.writeFile(path.join(directory, 'parseSaveSections.js'), 'export {};', 'utf8');
      const parentURL = pathToFileURL(path.join(directory, 'serializeSave.js')).href;
      const {nextResolve, resolvedSpecifiers} = createResolveRecorder();

      // Act
      await resolve('./parseSaveSections', {parentURL}, nextResolve);

      // Assert
      expect(resolvedSpecifiers).toEqual([pathToFileURL(path.join(directory, 'parseSaveSections.js')).href]);
    });
  });

  describe('When a relative specifier already names an existing file', () => {
    it('should resolve that file, even when a .ts sibling shares its name', async () => {
      // Arrange
      const directory = await createModuleFolder();
      await fs.writeFile(path.join(directory, 'platform.js'), 'export {};', 'utf8');
      await fs.writeFile(path.join(directory, 'platform.js.ts'), 'export {};', 'utf8');
      const parentURL = pathToFileURL(path.join(directory, 'merge-cli.js')).href;
      const {nextResolve, resolvedSpecifiers} = createResolveRecorder();

      // Act
      await resolve('./platform.js', {parentURL}, nextResolve);

      // Assert
      expect(resolvedSpecifiers).toEqual([pathToFileURL(path.join(directory, 'platform.js')).href]);
    });
  });

  describe('When no file matches a relative specifier', () => {
    it('should hand the specifier unchanged to the default resolver', async () => {
      // Arrange
      const directory = await createModuleFolder();
      const parentURL = pathToFileURL(path.join(directory, 'merge-cli.js')).href;
      const {nextResolve, resolvedSpecifiers} = createResolveRecorder();

      // Act
      await resolve('./missingModule', {parentURL}, nextResolve);

      // Assert
      expect(resolvedSpecifiers).toEqual(['./missingModule']);
    });
  });

  describe('When the specifier is a package name', () => {
    it('should hand it unchanged to the default resolver', async () => {
      // Arrange
      const parentURL = pathToFileURL('/repository/packages/cli-merge/cli/merge-cli.js').href;
      const {nextResolve, resolvedSpecifiers} = createResolveRecorder();

      // Act
      await resolve('core-mapping/controllers/MergeSaveFilesController', {parentURL}, nextResolve);

      // Assert
      expect(resolvedSpecifiers).toEqual(['core-mapping/controllers/MergeSaveFilesController']);
    });
  });

  describe('When the module is a TypeScript file', () => {
    it('should return its JavaScript with the type annotations removed', async () => {
      // Arrange
      const directory = await createModuleFolder();
      const modulePath = path.join(directory, 'computeTerraformationSummary.ts');
      await fs.writeFile(modulePath, 'const total: number = 42;\n', 'utf8');
      const nextLoad = async () => { throw new Error('the default loader must not be called'); };

      // Act
      const result = await load(pathToFileURL(modulePath).href, {}, nextLoad);

      // Assert
      expect(result).toEqual({format: 'module', shortCircuit: true, source: 'const total = 42;\n'});
    });

    it('should drop an import that only brings a type', async () => {
      // Arrange
      const directory = await createModuleFolder();
      const modulePath = path.join(directory, 'summarize.ts');
      await fs.writeFile(
        modulePath,
        "import {Summary} from './Summary';\nconst summarize = (summary: Summary): number => summary.total;\n",
        'utf8'
      );
      const nextLoad = async () => { throw new Error('the default loader must not be called'); };

      // Act
      const result = await load(pathToFileURL(modulePath).href, {}, nextLoad);

      // Assert
      expect(result).toEqual({
        format: 'module',
        shortCircuit: true,
        source: 'const summarize = (summary) => summary.total;\n'
      });
    });

    it('should turn a constructor parameter property into an assignment', async () => {
      // Arrange
      const directory = await createModuleFolder();
      const modulePath = path.join(directory, 'MergeSaveFiles.ts');
      await fs.writeFile(modulePath, 'class MergeSaveFiles {\n  constructor(private readonly merger: object) {}\n}\n', 'utf8');
      const nextLoad = async () => { throw new Error('the default loader must not be called'); };

      // Act
      const result = await load(pathToFileURL(modulePath).href, {}, nextLoad);

      // Assert
      expect(result).toEqual({
        format: 'module',
        shortCircuit: true,
        source: 'class MergeSaveFiles {\n  constructor(merger) {\n    this.merger = merger;\n  }\n  merger;\n}\n'
      });
    });
  });

  describe('When the module is not a TypeScript file', () => {
    it('should hand it unchanged to the default loader', async () => {
      // Arrange
      const url = pathToFileURL('/repository/packages/cli-merge/cli/merge-cli.js').href;
      /** @type {string[]} */
      const loadedUrls = [];
      const nextLoad = async (loadedUrl) => {
        loadedUrls.push(loadedUrl);
        return {format: 'module', source: ''};
      };

      // Act
      await load(url, {}, nextLoad);

      // Assert
      expect(loadedUrls).toEqual([url]);
    });
  });
});
