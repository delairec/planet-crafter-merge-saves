import {readdir} from 'node:fs/promises';
import {join, basename} from 'node:path';
import process from 'node:process';

/**
 * @param {string} path
 * @returns {Promise<string>}
 */
export function readTextFile(path) {
  return Bun.file(path).text();
}

/**
 * @param {string} path
 * @param {string} content
 * @returns {Promise<void>}
 */
export async function writeTextFile(path, content) {
  await Bun.write(path, content);
}

/**
 * @param {string} path
 * @returns {Promise<string[]>}
 */
export function readDirectory(path) {
  return readdir(path);
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
  return importMeta.main === true;
}
