import {For, Resource, Show} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import {TerraformationLevelsViewModel} from "core-mapping/presentation/viewModels/TerraformationLevelsViewModel";
import {
  terraformationLevelsSectionBiomassLabel,
  terraformationLevelsSectionIndexLabel,
  terraformationLevelsSectionTitle
} from "~/messages/terraformationLevelsSectionMessages";

interface TerraformationLevelsProps {
  viewModel: Resource<TerraformationLevelsViewModel>;
}

export default function TerraformationLevelsSection({viewModel}: TerraformationLevelsProps) {
  return (<>
    <h3>{terraformationLevelsSectionTitle}</h3>
    <Show when={viewModel()}>
      <div class="grid-container">
        <For each={viewModel()!.planets}>
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
