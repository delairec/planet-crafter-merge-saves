import fs from 'node:fs/promises';
import {join, basename} from 'node:path';
import process from 'node:process';

/**
 * @param {string} path
 * @returns {Promise<string>}
 */
export function readTextFile(path) {
  return fs.readFile(path, 'utf8');
}

/**
 * @param {string} path
 * @param {string} content
 * @returns {Promise<void>}
 */
export async function writeTextFile(path, content) {
  await fs.writeFile(path, content, 'utf8');
}

/**
 * @param {string} path
 * @returns {Promise<string[]>}
 */
export function readDirectory(path) {
  return fs.readdir(path);
}

/**
 * @param {...string} segments
 * @returns {string}
 */
export function joinPath(...segments) {
  return join(...segments);
}

/**
 * @param {string} path
 * @param {string} [extension]
 * @returns {string}
 */
export function getBasename(path, extension) {
  return basename(path, extension);
}

/**
 * @param {number} code
 * @returns {never}
 */
export function exitProcess(code) {
  return process.exit(code);
}

/**
 * @returns {string[]}
 */
export function getCliArguments() {
  return process.argv;
}

/**
 * @param {object} importMeta
 * @returns {boolean}
 */
export function isEntryPoint(importMeta) {
  if (!importMeta || !importMeta.url) return false;
  const scriptPath = process.argv[1];
  const importPath = new URL(importMeta.url).pathname;

  return scriptPath.endsWith(importPath);
}
