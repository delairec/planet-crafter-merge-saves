import {Resource} from "solid-js";
import FieldsGroup from "./structure/FieldsGroup";
import SectionState from "./structure/SectionState";
import {GlobalProgressionViewModel} from "core-mapping/presentation/viewModels/GlobalProgressionViewModel";
import {globalProgressionSectionTitle} from "~/messages/globalProgressionSectionMessages";

interface GlobalProgressionProps {
  viewModel: Resource<GlobalProgressionViewModel>;
}

export default function GlobalProgressionSection({viewModel}: GlobalProgressionProps) {
  return (
    <SectionState title={globalProgressionSectionTitle} resource={viewModel}>
      {(globalProgression) => (
        <div>
          <h3>{globalProgressionSectionTitle}</h3>
          <div class="fields-group-container">
            <FieldsGroup columns={() => globalProgression().statistics.columns}/>
          </div>
        </div>
      )}
    </SectionState>
  );
}
