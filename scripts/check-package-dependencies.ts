import {Glob} from 'bun';

const MANIFEST_FILES_PATTERN = 'packages/*/package.json';
const SOURCE_FILES_PATTERN = 'packages/*/**/*.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;

const FROM_SPECIFIER_PATTERN = /\bfrom\s+['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_SPECIFIER_PATTERN = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
const RELATIVE_OR_ALIASED_SPECIFIER = /^[./~]/;

/**
 * The dependency matrix of the repository, by package name prefix.
 */
const DEPENDENCY_MATRIX: DependencyMatrix = {
  'core-': ['shared-', 'util-'],
  'util-': [],
  'cli-': ['shared-', 'util-', 'core-'],
  'ui-': ['shared-', 'util-', 'core-'],
  'shared-': ['util-']
};

export interface WorkspacePackage {
  name: string;
  manifestPath: string;
  declaredDependencies: string[];
}

export interface PackageImport {
  packageName: string;
  filePath: string;
  line: number;
  specifier: string;
}

export type DependencyMatrix = Record<string, string[]>;

export interface DependencyViolation {
  location: string;
  message: string;
}

export interface ImportedPackage {
  line: number;
  specifier: string;
}

/**
 * @param {string} line a single line of a source file
 * @param {number} lineNumber the 1-based line number of that line
 * @returns every package specifier imported on that line
 */
function findImportedPackagesOnLine(line: string, lineNumber: number): ImportedPackage[] {
  const specifiers = [
    ...Array.from(line.matchAll(FROM_SPECIFIER_PATTERN), match => match[1]),
    ...Array.from(line.matchAll(DYNAMIC_IMPORT_SPECIFIER_PATTERN), match => match[1])
  ];
  return specifiers
    .filter(specifier => !RELATIVE_OR_ALIASED_SPECIFIER.test(specifier))
    .map(specifier => ({line: lineNumber, specifier}));
}

/**
 * @param {string} source the whole content of a source file
 * @returns every package specifier the file imports, relative and aliased ones left out
 */
export function findImportedPackages(source: string): ImportedPackage[] {
  return source.split('\n').flatMap((line, lineIndex) => findImportedPackagesOnLine(line, lineIndex + 1));
}

/**
 * @param {string} packageName the name of a workspace package
 * @param {DependencyMatrix} matrix the prefixes each package prefix is allowed to depend on
 * @returns the matrix entry whose prefix starts the package name, or undefined when none does
 */
function findMatrixEntry(packageName: string, matrix: DependencyMatrix): [string, string[]] | undefined {
  return Object.entries(matrix).find(([prefix]) => packageName.startsWith(prefix));
}

/**
 * @param {string[]} allowedPrefixes the prefixes a package prefix may depend on
 */
function describeAllowedPrefixes(allowedPrefixes: string[]): string {
  return allowedPrefixes.length === 0
    ? 'may not depend on any workspace package'
    : `may only depend on ${allowedPrefixes.join(', ')}`;
}

/**
 * @param {string} specifier an import specifier
 * @returns the workspace package name the specifier points into
 */
function extractPackageName(specifier: string): string {
  const slashIndex = specifier.indexOf('/');
  return slashIndex === -1 ? specifier : specifier.slice(0, slashIndex);
}

/**
 * @param {WorkspacePackage} consumer the package whose manifest is being checked
 * @param {Map<string, WorkspacePackage>} workspacePackagesByName every workspace package indexed by name
 * @param {DependencyMatrix} matrix the prefixes each package prefix is allowed to depend on
 * @param {PackageImport[]} imports every workspace package specifier imported by a source file
 */
function collectManifestViolations(consumer: WorkspacePackage, workspacePackagesByName: Map<string, WorkspacePackage>, matrix: DependencyMatrix, imports: PackageImport[]): DependencyViolation[] {
  const consumerEntry = findMatrixEntry(consumer.name, matrix);
  if (!consumerEntry) {
    return [{location: consumer.manifestPath, message: `package name ${consumer.name} carries no prefix of the dependency matrix`}];
  }

  const [consumerPrefix, allowedPrefixes] = consumerEntry;
  const violations: DependencyViolation[] = [];
  for (const dependencyName of consumer.declaredDependencies) {
    if (dependencyName === consumer.name || !workspacePackagesByName.has(dependencyName)) {
      continue;
    }

    const dependencyEntry = findMatrixEntry(dependencyName, matrix);
    if (!dependencyEntry || !allowedPrefixes.includes(dependencyEntry[0])) {
      violations.push({
        location: consumer.manifestPath,
        message: `dependency on ${dependencyName}: a ${consumerPrefix} package ${describeAllowedPrefixes(allowedPrefixes)}`
      });
      continue;
    }

    const isImported = imports.some(candidate => candidate.packageName === consumer.name && extractPackageName(candidate.specifier) === dependencyName);
    if (!isImported) {
      violations.push({location: consumer.manifestPath, message: `dependency on ${dependencyName}: never imported`});
    }
  }
  return violations;
}

/**
 * A package whose own prefix is outside the matrix is reported once on its manifest; its imports
 * are left alone, no rule applying to them.
 * @param {PackageImport} sourceImport a workspace package specifier imported by a source file
 * @param {Map<string, WorkspacePackage>} workspacePackagesByName every workspace package indexed by name
 * @param {DependencyMatrix} matrix the prefixes each package prefix is allowed to depend on
 */
function collectImportViolation(sourceImport: PackageImport, workspacePackagesByName: Map<string, WorkspacePackage>, matrix: DependencyMatrix): DependencyViolation | undefined {
  const importedPackageName = extractPackageName(sourceImport.specifier);
  if (importedPackageName === sourceImport.packageName || !workspacePackagesByName.has(importedPackageName)) {
    return undefined;
  }

  const consumer = workspacePackagesByName.get(sourceImport.packageName);
  const consumerEntry = findMatrixEntry(sourceImport.packageName, matrix);
  if (!consumer || !consumerEntry) {
    return undefined;
  }

  const [consumerPrefix, allowedPrefixes] = consumerEntry;
  const location = `${sourceImport.filePath}:${sourceImport.line}`;

  const dependencyEntry = findMatrixEntry(importedPackageName, matrix);
  if (!dependencyEntry || !allowedPrefixes.includes(dependencyEntry[0])) {
    return {location, message: `import of '${sourceImport.specifier}': a ${consumerPrefix} package ${describeAllowedPrefixes(allowedPrefixes)}`};
  }

  if (!consumer.declaredDependencies.includes(importedPackageName)) {
    return {location, message: `import of '${sourceImport.specifier}': ${importedPackageName} is missing from the dependencies of ${consumer.manifestPath}`};
  }

  return undefined;
}

/**
 * @param {WorkspacePackage[]} packages every workspace package with its declared dependencies
 * @param {PackageImport[]} imports every workspace package specifier imported by a source file
 * @param {DependencyMatrix} matrix the prefixes each package prefix is allowed to depend on
 */
export function findViolations(packages: WorkspacePackage[], imports: PackageImport[], matrix: DependencyMatrix): DependencyViolation[] {
  const workspacePackagesByName = new Map(packages.map(workspacePackage => [workspacePackage.name, workspacePackage]));

  const manifestViolations = packages.flatMap(consumer => collectManifestViolations(consumer, workspacePackagesByName, matrix, imports));
  const importViolations = imports
    .map(sourceImport => collectImportViolation(sourceImport, workspacePackagesByName, matrix))
    .filter((violation): violation is DependencyViolation => violation !== undefined);

  return [...manifestViolations, ...importViolations];
}

interface PackageManifest {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * @param {string} filePath a path relative to the repository root
 * @returns the `packages/<directory>` part of that path
 */
function extractPackageDirectory(filePath: string): string {
  return filePath.split('/').slice(0, 2).join('/');
}

async function readWorkspacePackages(): Promise<WorkspacePackage[]> {
  const packages: WorkspacePackage[] = [];
  for await (const manifestPath of new Glob(MANIFEST_FILES_PATTERN).scan({cwd: process.cwd()})) {
    const manifest: PackageManifest = await Bun.file(manifestPath).json();
    packages.push({
      name: manifest.name,
      manifestPath,
      declaredDependencies: Object.keys({...manifest.dependencies, ...manifest.devDependencies, ...manifest.peerDependencies})
    });
  }
  return packages.sort((first, second) => first.manifestPath.localeCompare(second.manifestPath));
}

/**
 * @param {WorkspacePackage[]} packages every workspace package with its declared dependencies
 */
async function readPackageImports(packages: WorkspacePackage[]): Promise<PackageImport[]> {
  const packageNameByDirectory = new Map(packages.map(workspacePackage => [extractPackageDirectory(workspacePackage.manifestPath), workspacePackage.name]));
  const imports: PackageImport[] = [];
  for await (const filePath of new Glob(SOURCE_FILES_PATTERN).scan({cwd: process.cwd()})) {
    const packageName = packageNameByDirectory.get(extractPackageDirectory(filePath));
    if (!packageName || GENERATED_DIRECTORY.test(filePath)) {
      continue;
    }
    const source = await Bun.file(filePath).text();
    findImportedPackages(source).forEach(({line, specifier}) => imports.push({packageName, filePath, line, specifier}));
  }
  return imports.sort((first, second) => first.filePath.localeCompare(second.filePath) || first.line - second.line);
}

async function checkPackageDependencies(): Promise<number> {
  const packages = await readWorkspacePackages();
  const imports = await readPackageImports(packages);
  const violations = findViolations(packages, imports, DEPENDENCY_MATRIX);
  if (violations.length === 0) {
    console.log('check:dependencies: no dependency matrix violation found.');
    return 0;
  }
  violations.forEach(({location, message}) => console.log(`${location}: ${message}`));
  console.log(`check:dependencies: ${violations.length} dependency matrix violation(s); see the dependency matrix in README.md.`);
  return 1;
}

if (import.meta.main) {
  process.exit(await checkPackageDependencies());
}
