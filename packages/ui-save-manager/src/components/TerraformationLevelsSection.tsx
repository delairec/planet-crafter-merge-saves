import {Accessor, createEffect, createSignal, For, Show} from "solid-js";
import {LoadTerraformationLevelsSectionController} from "../../../util-mapping/controllers/LoadTerraformationLevelsSectionController";
import FieldsGroup from "./structure/FieldsGroup";
import {TerraformationLevelsViewModel} from "../../../util-mapping/presentation/viewModels/TerraformationLevelsViewModel";
import {ParsedSections} from "../../../util-types/js/types";

interface TerraformationLevelsProps {
  sections: Accessor<ParsedSections>;
}

export default function TerraformationLevelsSection({sections}: TerraformationLevelsProps) {
  const [planets, setPlanets] = createSignal<TerraformationLevelsViewModel['planets']>([]);

  createEffect(() => {
    const {planets} = LoadTerraformationLevelsSectionController.loadTerraformationLevelsSection(sections());
    setPlanets(planets);
  });

  return (<>
    <h3>Terraformation Levels</h3>
    <Show when={sections}>
      <div class="grid-container">
        <For each={planets()}>
          {(planet) => (
            <div class="grid-item">
              <h4>{planet.name}</h4>
              <div class="fields-group-container">
                <FieldsGroup columns={() => planet.environmentalLevels.columns}/>
                <FieldsGroup columns={() => planet.organicLevels.columns}/>
              </div>
            </div>
          )}
        </For>
      </div>
    </Show>
  </>);
}

