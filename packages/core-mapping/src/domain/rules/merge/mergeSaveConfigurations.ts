import {SaveConfiguration} from 'shared-save-processing/gameDefinitions';

/**
 * @see GR-CFG-1, GR-CFG-2, GR-CFG-3 in docs/game-rules.md
 */
export function mergeSaveConfigurations([saveConfigurationA]: SaveConfiguration[], [saveConfigurationB]: SaveConfiguration[], saveDisplayName: string): SaveConfiguration | undefined {
  const saveConfiguration = saveConfigurationA ?? saveConfigurationB;
  if (!saveConfiguration) {
    return undefined;
  }

  return {...saveConfiguration, saveDisplayName};
}
