import {Accessor, createEffect, createSignal} from 'solid-js';
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {LoadSaveConfigurationSectionController} from "core-mapping/controllers/LoadSaveConfigurationSectionController";
import {LoadGlobalProgressionSectionController} from "core-mapping/controllers/LoadGlobalProgressionSectionController";
import {LoadEnergyLevelsSectionController} from "core-mapping/controllers/LoadEnergyLevelsSectionController";
import {LoadTerraformationLevelsSectionController} from "core-mapping/controllers/LoadTerraformationLevelsSectionController";
import {LoadPlayersSectionController} from "core-mapping/controllers/LoadPlayersSectionController";
import {SaveConfigurationViewModel} from "core-mapping/presentation/viewModels/SaveConfigurationViewModel";
import {GlobalProgressionViewModel} from "core-mapping/presentation/viewModels/GlobalProgressionViewModel";
import {EnergyLevelsViewModel} from "core-mapping/presentation/viewModels/EnergyLevelsViewModel";
import {TerraformationLevelsViewModel} from "core-mapping/presentation/viewModels/TerraformationLevelsViewModel";
import {PlayersViewModel} from "core-mapping/presentation/viewModels/PlayersViewModel";

export interface SectionViewModels {
  saveConfiguration: Accessor<SaveConfigurationViewModel | null>;
  globalProgression: Accessor<GlobalProgressionViewModel | null>;
  energyLevels: Accessor<EnergyLevelsViewModel | null>;
  terraformationLevels: Accessor<TerraformationLevelsViewModel | null>;
  players: Accessor<PlayersViewModel | null>;
}

/**
 * Loads the view model for each save section whenever the parsed sections change, so the section
 * components only ever receive a ready-made view model — never the wire format (`ParsedSections`).
 */
export function useSectionViewModels(sections: Accessor<ParsedSections | null>): SectionViewModels {
  const [saveConfiguration, setSaveConfiguration] = createSignal<SaveConfigurationViewModel | null>(null);
  const [globalProgression, setGlobalProgression] = createSignal<GlobalProgressionViewModel | null>(null);
  const [energyLevels, setEnergyLevels] = createSignal<EnergyLevelsViewModel | null>(null);
  const [terraformationLevels, setTerraformationLevels] = createSignal<TerraformationLevelsViewModel | null>(null);
  const [players, setPlayers] = createSignal<PlayersViewModel | null>(null);

  createEffect(() => {
    const currentSections = sections();

    if (!currentSections) {
      setSaveConfiguration(null);
      setGlobalProgression(null);
      setEnergyLevels(null);
      setTerraformationLevels(null);
      setPlayers(null);
      return;
    }

    LoadSaveConfigurationSectionController.loadSaveConfigurationSection(currentSections).then(setSaveConfiguration);
    LoadGlobalProgressionSectionController.loadGlobalProgressionSection(currentSections).then(setGlobalProgression);
    LoadEnergyLevelsSectionController.loadEnergyLevelsSection(currentSections).then(setEnergyLevels);
    LoadTerraformationLevelsSectionController.loadTerraformationLevelsSection(currentSections).then(setTerraformationLevels);
    LoadPlayersSectionController.loadPlayersSection(currentSections).then(setPlayers);
  });

  return {saveConfiguration, globalProgression, energyLevels, terraformationLevels, players};
}
