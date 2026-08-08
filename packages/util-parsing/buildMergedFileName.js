export function buildMergedFileName(fileNameA, fileNameB) {
  const nameA = sanitizeFileName(stripJsonExtension(fileNameA));
  const nameB = sanitizeFileName(stripJsonExtension(fileNameB));
  return `${nameA}-${nameB}-merged.json`;
}

function stripJsonExtension(fileName) {
  return fileName.replace(/\.json$/i, '');
}

function sanitizeFileName(fileName) {
  const sanitized = fileName
      .normalize('NFKC')
      .replace(/[\u0000-\u001f\u007f/\\]+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/^\.+/, '')
      .slice(0, 100);

  return sanitized || 'save';
}
