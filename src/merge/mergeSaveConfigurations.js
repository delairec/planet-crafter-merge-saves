/** @import { SaveConfiguration } from '../types.js' */

/**
 * @param {SaveConfiguration[]} saveConfigurationsA
 * @param {SaveConfiguration[]} saveConfigurationsB
 * @param {string} saveDisplayName
 * @returns {string}
 * @see GR-CFG-1, GR-CFG-2, GR-CFG-3 in docs/business-rules.md
 */
export function mergeSaveConfigurations([saveConfigurationA], [saveConfigurationB], saveDisplayName) {
  const saveConfiguration = saveConfigurationA ?? saveConfigurationB;
  if (!saveConfiguration) return '';
  return JSON.stringify({...saveConfiguration, saveDisplayName});
}

