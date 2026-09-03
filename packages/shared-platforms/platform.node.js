import fs from 'node:fs/promises';
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
 * @param {{main?: boolean, url?: string}} importMeta
 * @returns {boolean}
 */
export function isEntryPoint(importMeta) {
  if (!importMeta || !importMeta.url) return false;
  const scriptPath = process.argv[1];
  const importPath = new URL(importMeta.url).pathname;

  return scriptPath.endsWith(importPath);
}
