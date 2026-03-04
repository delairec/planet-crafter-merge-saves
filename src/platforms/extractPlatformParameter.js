export const SUPPORTED_PLATFORMS = /** @type {readonly ['bun', 'node']} */ (['bun', 'node']);

/**
 * @param argv
 * @returns {'bun'|'node'}
 * @throws {Error} If the platform parameter is invalid
 */
export function extractPlatformParameter(argv) {
  const platformArg = argv.find(arg => arg.startsWith('--platform='));

  if(!platformArg) {
    return SUPPORTED_PLATFORMS[0];
  }

  const platform = platformArg.split('=')[1];

  if (SUPPORTED_PLATFORMS.includes(platform)) {
    return platform;
  }

  throw new Error(`Invalid platform: ${platform}. Supported platforms: ${SUPPORTED_PLATFORMS.join(', ')}.`);
}
