import {Accessor, createEffect, createSignal, For} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import {EnergyLevelsViewModel} from "core-mapping/presentation/viewModels/EnergyLevelsViewModel";
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {LoadEnergyLevelsSectionController} from "core-mapping/controllers/LoadEnergyLevelsSectionController";
import {
  energyLevelsSectionBoostedMachinesLabel,
  energyLevelsSectionConsumptionTitle,
  energyLevelsSectionContributionLabel,
  energyLevelsSectionEnergyFusesLabel,
  energyLevelsSectionOptimizersTitle,
  energyLevelsSectionProductionTitle,
  energyLevelsSectionQuantityLabel,
  energyLevelsSectionTitle,
  energyLevelsSectionTotalLabel,
  energyLevelsSectionUnitLabel,
  energyLevelsSectionWorkInProgressLabel
} from "~/messages/energyLevelsSectionMessages";

interface EnergyLevelsProps {
  sections: Accessor<ParsedSections>;
}

export default function EnergyLevelsSection({sections}: EnergyLevelsProps) {
  const [planets, setPlanets] = createSignal<EnergyLevelsViewModel['planets']>([]);

  createEffect(() => {
    const {planets} = LoadEnergyLevelsSectionController.loadEnergyLevelsSection(sections());
    setPlanets(planets);
  });

  return (
    <div>
      <h3>{energyLevelsSectionTitle}</h3>
      <For each={planets()}>
        {(planet) => (
          <div>
            <h4>{planet.planetId}</h4>
            <div class="fields-group-container">
              <FieldsGroup columns={() => planet.energyLevels.columns}/>
            </div>

            <h5>{energyLevelsSectionOptimizersTitle}</h5>
            <div class="grid-container">
              <For each={planet.optimizers}>
                {(optimizer) => (
                  <div class="grid-item">
                    <h5>{optimizer.label}</h5>
                    <FieldsGroup columns={() => [
                      {header: energyLevelsSectionEnergyFusesLabel, values: [optimizer.fuseCount]},
                      {header: energyLevelsSectionBoostedMachinesLabel, values: [optimizer.boostedMachines]},
                      {header: energyLevelsSectionContributionLabel, values: [optimizer.contribution]}
                    ]}/>
                  </div>
                )}
              </For>
            </div>

            <h5>{energyLevelsSectionProductionTitle}</h5>
            <div class="grid-container">
              <For each={planet.productionBreakdown}>
                {(row) => (
                  <div class="grid-item">
                    <h5>{row.label}</h5>
                    <FieldsGroup columns={() => [
                      {header: energyLevelsSectionQuantityLabel, values: [row.quantity]},
                      {header: energyLevelsSectionUnitLabel, values: [row.unitLevel]},
                      {header: energyLevelsSectionTotalLabel, values: [row.totalLevel]}
                    ]}/>
                  </div>
                )}
              </For>
            </div>

            <h5>{energyLevelsSectionConsumptionTitle} {energyLevelsSectionWorkInProgressLabel}</h5>
            <div class="grid-container">
              <For each={planet.consumptionBreakdown}>
                {(row) => (
                  <div class="grid-item">
                    <h5>{row.label}</h5>
                    <FieldsGroup columns={() => [
                      {header: energyLevelsSectionQuantityLabel, values: [row.quantity]},
                      {header: energyLevelsSectionUnitLabel, values: [row.unitLevel]},
                      {header: energyLevelsSectionTotalLabel, values: [row.totalLevel]}
                    ]}/>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
