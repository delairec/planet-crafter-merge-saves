import {Accessor} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import {GlobalProgressionViewModel} from "core-mapping/presentation/viewModels/GlobalProgressionViewModel";
import {globalProgressionSectionTitle} from "~/messages/globalProgressionSectionMessages";

interface GlobalProgressionProps {
  viewModel: Accessor<GlobalProgressionViewModel | null>;
}

export default function GlobalProgressionSection({viewModel}: GlobalProgressionProps) {
  return (
    <div>
      <h3>{globalProgressionSectionTitle}</h3>
      <div class="fields-group-container">
        <FieldsGroup columns={() => viewModel()?.statistics.columns ?? []}/>
      </div>
    </div>
  );
}
