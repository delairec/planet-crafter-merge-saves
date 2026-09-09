import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const BYTE_ORDER_MARK = /^\uFEFF/;

export async function readTextFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');

  return content.replace(BYTE_ORDER_MARK, '');
}

export async function writeTextFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, content, 'utf8');
}

export function isEntryPoint(importMeta) {
  if (!importMeta || !importMeta.url) return false;
  const scriptPath = process.argv[1];
  const importPath = new URL(importMeta.url).pathname;

  return scriptPath.endsWith(importPath);
}
