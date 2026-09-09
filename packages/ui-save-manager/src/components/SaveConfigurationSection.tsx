import {Resource} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import SectionState from "./structure/SectionState";
import {SaveConfigurationViewModel} from "core-mapping/presentation/viewModels/SaveConfigurationViewModel";
import {saveConfigurationSectionTitleLabel} from "~/messages/saveConfigurationSectionMessages";

interface SaveConfigurationProps {
  viewModel: Resource<SaveConfigurationViewModel>;
}

export default function SaveConfigurationSection({viewModel}: SaveConfigurationProps) {
  return (
    <SectionState title={saveConfigurationSectionTitleLabel} resource={viewModel}>
      {(saveConfiguration) => (
        <div>
          <h3>{saveConfigurationSectionTitleLabel} {saveConfiguration().title} ({saveConfiguration().mode})</h3>
          <div class="fields-group-container">
            <FieldsGroup columns={() => saveConfiguration().modifiers.columns}/>
          </div>
        </div>
      )}
    </SectionState>
  );
}
