/** @import { RuntimePlatform } from 'util-types/gameDefinitions' */
import {SUPPORTED_PLATFORMS} from './extractPlatformParameter.js';
import * as platformCommon from './platform.common.js';
import * as nodePlatform from './platform.node.js';
import * as bunPlatform from './platform.bun.js';

const PLATFORM_MODULES = {
  node: nodePlatform,
  bun: bunPlatform
};

/**
 * @param {'bun'|'node'} platformName
 * @returns {RuntimePlatform}
 */
export function createPlatform(platformName) {
  const specificModule = PLATFORM_MODULES[platformName];

  if (!specificModule) {
    throw new Error(`Unsupported platform: ${platformName}. Supported platforms: ${SUPPORTED_PLATFORMS.join(', ')}.`);
  }

  return {...platformCommon, ...specificModule};
}
