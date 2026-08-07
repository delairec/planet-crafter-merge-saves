export function buildMergedFileName(fileNameA, fileNameB) {
  const nameA = stripJsonExtension(fileNameA);
  const nameB = stripJsonExtension(fileNameB);
  return `${nameA}-${nameB}-merged.json`;
}

function stripJsonExtension(fileName) {
  return fileName.endsWith('.json') ? fileName.slice(0, -'.json'.length) : fileName;
}
