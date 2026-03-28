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
  const [title, setTitle] = createSignal<string | null>(null);

  createEffect(() => {
    const {energyLevels} = LoadEnergyLevelsSectionController.loadEnergyLevelsSection(sections());
    setEnergyLevelsColumns(energyLevels.columns);
    setTitle(title);
  });

  return (
    <div>
      <h3>Power (WORK IN PROGRESS)</h3>
      <div class="fields-group-container">
        <FieldsGroup columns={energyLevelsColumns}/>
      </div>
    </div>
  )
    ;
}
