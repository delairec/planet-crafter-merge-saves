import {Accessor, createEffect, createSignal, For} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import {EnergyLevelsViewModel} from "../../../util-mapping/presentation/viewModels/EnergyLevelsViewModel";
import {ParsedSections} from "../../../util-types/gameDefinitions";
import {LoadEnergyLevelsSectionController} from "../../../util-mapping/controllers/LoadEnergyLevelsSectionController";

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
      <h3>Power</h3>
      <For each={planets()}>
        {(planet) => (
          <div>
            <h4>{planet.planetId}</h4>
            <div class="fields-group-container">
              <FieldsGroup columns={() => planet.energyLevels.columns}/>
            </div>

            <h5>Optimizers</h5>
            <div class="grid-container">
              <For each={planet.optimizers}>
                {(optimizer) => (
                  <div class="grid-item">
                    <h5>{optimizer.label}</h5>
                    <FieldsGroup columns={() => [
                      {header: 'Energy Fuses', values: [optimizer.fuseCount]},
                      {header: 'Boosted machines', values: [optimizer.boostedMachines]},
                      {header: 'Contribution', values: [optimizer.contribution]}
                    ]}/>
                  </div>
                )}
              </For>
            </div>

            <h5>Production</h5>
            <div class="grid-container">
              <For each={planet.productionBreakdown}>
                {(row) => (
                  <div class="grid-item">
                    <h5>{row.label}</h5>
                    <FieldsGroup columns={() => [
                      {header: 'Quantity', values: [row.quantity]},
                      {header: 'Unit', values: [row.unitLevel]},
                      {header: 'Total', values: [row.totalLevel]}
                    ]}/>
                  </div>
                )}
              </For>
            </div>

            <h5>Consumption 🚧 Work In Progress</h5>
            <div class="grid-container">
              <For each={planet.consumptionBreakdown}>
                {(row) => (
                  <div class="grid-item">
                    <h5>{row.label}</h5>
                    <FieldsGroup columns={() => [
                      {header: 'Quantity', values: [row.quantity]},
                      {header: 'Unit', values: [row.unitLevel]},
                      {header: 'Total', values: [row.totalLevel]}
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
