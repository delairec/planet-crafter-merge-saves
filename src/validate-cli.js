import {readFile} from 'node:fs/promises';
import {validateMergedSave} from './validate.js';

const [,, filePath] = process.argv;

if (!filePath) {
  console.error('Usage: node src/validate-cli.js <path-to-save-file>');
  process.exit(1);
}

async function main() {
  const save = await readFile(filePath, 'utf-8');
  const {isValid, errors} = validateMergedSave(save);

  if (isValid) {
    console.log(`✓ ${filePath} is valid`);
  } else {
    console.error(`✖ ${filePath} has ${errors.length} error(s):\n`);
    for (const error of errors) {
      const location = [
        error.section !== undefined ? `section ${error.section}` : null,
        error.entryIndex !== undefined ? `entry ${error.entryIndex}` : null,
      ].filter(Boolean).join(', ');
      console.error(`  [${location || error.rule || 'structure'}] ${error.message}`);
    }
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

