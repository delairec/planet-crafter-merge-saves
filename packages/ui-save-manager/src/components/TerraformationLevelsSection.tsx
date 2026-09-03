import {Accessor, createEffect, createSignal, For, Show} from "solid-js";
import {
  LoadTerraformationLevelsSectionController
} from "core-mapping/controllers/LoadTerraformationLevelsSectionController";
import FieldsGroup from "./structure/FieldsGroup";
import {TerraformationLevelsViewModel} from "core-mapping/presentation/viewModels/TerraformationLevelsViewModel";
import {ParsedSections} from "util-types/gameDefinitions";
import {
  terraformationLevelsSectionBiomassLabel,
  terraformationLevelsSectionIndexLabel,
  terraformationLevelsSectionTitle
} from "util-messages/terraformationLevelsSectionMessages";

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
    <h3>{terraformationLevelsSectionTitle}</h3>
    <Show when={sections}>
      <div class="grid-container">
        <For each={planets()}>
          {(planet) => (
            <div class="grid-item">
              <h4>{planet.name}</h4>
              <div class="fields-group-container">
                <div>
                  <div class="fields-group-main-value">
                    <span>{terraformationLevelsSectionIndexLabel} </span>
                    {planet.terraformationIndex}</div>
                  <FieldsGroup columns={() => planet.environmentalLevels.columns}/>
                </div>
               <div>
                 <div class="fields-group-main-value">
                    <span>{terraformationLevelsSectionBiomassLabel}</span>{planet.biomass}
                 </div>
                 <FieldsGroup columns={() => planet.organicLevels.columns}/>
               </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </Show>
  </>);
}

