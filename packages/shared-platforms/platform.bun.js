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
 * @param {{main?: boolean, url?: string}} importMeta
 * @returns {boolean}
 */
export function isEntryPoint(importMeta) {
  return importMeta.main === true;
}
