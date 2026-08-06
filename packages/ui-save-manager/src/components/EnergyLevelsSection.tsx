import {Accessor, createEffect, createSignal} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import {EnergyLevelsViewModel} from "../../../util-mapping/presentation/viewModels/EnergyLevelsViewModel";
import {ParsedSections} from "../../../util-types/gameDefinitions";
import {LoadEnergyLevelsSectionController} from "../../../util-mapping/controllers/LoadEnergyLevelsSectionController";

interface EnergyLevelsProps {
  sections: Accessor<ParsedSections>;
}

export default function EnergyLevelsSection({sections}: EnergyLevelsProps) {
  const [energyLevelsColumns, setEnergyLevelsColumns] = createSignal<EnergyLevelsViewModel['energyLevels']['columns']>([]);
  const [balanceInsight, setBalanceInsight] = createSignal<string>('');

  createEffect(() => {
    const {energyLevels, balanceInsight} = LoadEnergyLevelsSectionController.loadEnergyLevelsSection(sections());
    setEnergyLevelsColumns(energyLevels.columns);
    setBalanceInsight(balanceInsight);
  });

  return (
    <div>
      <h3>Power</h3>
      <p class="fields-group-main-value">{balanceInsight()}</p>
      <div class="fields-group-container">
        <FieldsGroup columns={energyLevelsColumns}/>
      </div>
    </div>
  )
    ;
}
