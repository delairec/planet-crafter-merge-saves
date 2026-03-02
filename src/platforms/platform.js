import {extractPlatformParameter} from './extractPlatformParameter.js';

import * as nodePlatform from './platform.node.js';
import * as bunPlatform from './platform.bun.js';

/** @type {"bun"|"node"} */
const PLATFORM = extractPlatformParameter(process.argv);

/** @type {Record<string, RuntimePlatform>} */
const PLATFORM_MODULES = {
  node: nodePlatform,
  bun: bunPlatform
};

/** @type {RuntimePlatform} */
export const {
  readTextFile,
  writeTextFile,
  readDirectory,
  joinPath,
  getBasename,
  exitProcess,
  getCliArguments,
  isEntryPoint
} = PLATFORM_MODULES[PLATFORM];

