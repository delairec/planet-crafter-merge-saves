import {Accessor, createEffect, createSignal, For} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import {EnergyLevelsViewModel} from "../../../util-mapping/presentation/viewModels/EnergyLevelsViewModel";
import {ParsedSections} from "../../../util-types/gameDefinitions";
import {LoadEnergyLevelsSectionController} from "../../../util-mapping/controllers/LoadEnergyLevelsSectionController";

interface EnergyLevelsProps {
  sections: Accessor<ParsedSections>;
}

export default function EnergyLevelsSection({sections}: EnergyLevelsProps) {
  const [energyLevelsColumns, setEnergyLevelsColumns] = createSignal<EnergyLevelsViewModel['energyLevels']['columns']>([]);
  const [productionBreakdown, setProductionBreakdown] = createSignal<EnergyLevelsViewModel['productionBreakdown']>([]);
  const [consumptionBreakdown, setConsumptionBreakdown] = createSignal<EnergyLevelsViewModel['consumptionBreakdown']>([]);
  const [optimizers, setOptimizers] = createSignal<EnergyLevelsViewModel['optimizers']>([]);

  createEffect(() => {
    const {energyLevels, productionBreakdown, consumptionBreakdown, optimizers} = LoadEnergyLevelsSectionController.loadEnergyLevelsSection(sections());
    setEnergyLevelsColumns(energyLevels.columns);
    setProductionBreakdown(productionBreakdown);
    setConsumptionBreakdown(consumptionBreakdown);
    setOptimizers(optimizers);
  });

  return (
    <div>
      <h3>Power</h3>
      <div class="fields-group-container">
        <FieldsGroup columns={energyLevelsColumns}/>
      </div>

        <h4>Optimizers</h4>
        <div class="grid-container">
            <For each={optimizers()}>
                {(optimizer) => (
                    <div class="grid-item">
                        <h4>{optimizer.label}</h4>
                        <FieldsGroup columns={() => [
                            {header: 'Energy Fuses', values: [optimizer.fuseCount]},
                            {header: 'Boosted machines', values: [optimizer.boostedMachines]},
                            {header: 'Contribution', values: [optimizer.contribution]}
                        ]}/>
                    </div>
                )}
            </For>
        </div>

      <h4>Production</h4>
      <div class="grid-container">
        <For each={productionBreakdown()}>
          {(row) => (
            <div class="grid-item">
              <h4>{row.label}</h4>
              <FieldsGroup columns={() => [
                {header: 'Quantity', values: [row.quantity]},
                {header: 'Unit', values: [row.unitLevel]},
                {header: 'Total', values: [row.totalLevel]}
              ]}/>
            </div>
          )}
        </For>
      </div>

      <h4>Consumption</h4>
      <div class="grid-container">
        <For each={consumptionBreakdown()}>
          {(row) => (
            <div class="grid-item">
              <h4>{row.label}</h4>
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
  );
}
