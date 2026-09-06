import {Resource} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import {SaveConfigurationViewModel} from "core-mapping/presentation/viewModels/SaveConfigurationViewModel";
import {saveConfigurationSectionTitleLabel} from "~/messages/saveConfigurationSectionMessages";

interface SaveConfigurationProps {
  viewModel: Resource<SaveConfigurationViewModel>;
}

export default function SaveConfigurationSection({viewModel}: SaveConfigurationProps) {
  return (
    <div>
      <h3>{saveConfigurationSectionTitleLabel} {viewModel()?.title} ({viewModel()?.mode})</h3>
      <div class="fields-group-container">
        <FieldsGroup columns={() => viewModel()?.modifiers.columns ?? []}/>
      </div>
    </div>
  );
}
