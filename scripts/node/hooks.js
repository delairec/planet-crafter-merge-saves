import {access, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {transform} from 'esbuild';

const SOURCE_EXTENSIONS = ['', '.ts', '.js'];

/**
 * @param {string} url
 * @returns {Promise<boolean>}
 */
async function fileExists(url) {
  try {
    await access(fileURLToPath(url));
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {string} specifier
 * @param {{parentURL?: string}} context
 * @param {(specifier: string, context: object) => Promise<object>} nextResolve
 * @returns {Promise<object>}
 */
export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith('.') || !context.parentURL) {
    return nextResolve(specifier, context);
  }

  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = new URL(specifier + extension, context.parentURL).href;

    if (await fileExists(candidate)) {
      return nextResolve(candidate, context);
    }
  }

  return nextResolve(specifier, context);
}

/**
 * @param {string} url
 * @param {object} context
 * @param {(url: string, context: object) => Promise<object>} nextLoad
 * @returns {Promise<object>}
 */
export async function load(url, context, nextLoad) {
  if (!url.endsWith('.ts')) {
    return nextLoad(url, context);
  }

  const typeScriptSource = await readFile(fileURLToPath(url), 'utf8');
  const {code} = await transform(typeScriptSource, {loader: 'ts', format: 'esm', sourcefile: fileURLToPath(url)});

  return {format: 'module', shortCircuit: true, source: code};
}
