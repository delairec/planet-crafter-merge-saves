import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const BYTE_ORDER_MARK = /^\uFEFF/;

/**
 * Strips a leading UTF-8 byte order mark, so that callers receive the file content the way
 * `Bun.file().text()` already returns it — keeping it would make the first parsed entry fail.
 *
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function readTextFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');

  return content.replace(BYTE_ORDER_MARK, '');
}

/**
 * Creates the destination folder when it is missing, so that callers may write to a path whose
 * parent folders do not exist yet — the behaviour `Bun.write` already has.
 *
 * @param {string} filePath
 * @param {string} content
 * @returns {Promise<void>}
 */
export async function writeTextFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, content, 'utf8');
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
