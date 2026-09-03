import fs from 'node:fs/promises';
import {basename, join} from 'node:path';
import process from 'node:process';

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
