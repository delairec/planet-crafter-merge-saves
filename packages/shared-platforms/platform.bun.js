export function readTextFile(path) {
  return Bun.file(path).text();
}

export async function writeTextFile(path, content) {
  await Bun.write(path, content);
}

export function isEntryPoint(importMeta) {
  return importMeta.main === true;
}
