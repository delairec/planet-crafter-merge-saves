import {Accessor, createEffect, createSignal} from "solid-js";
import {LoadGlobalProgressionSectionController} from "core-mapping/controllers/LoadGlobalProgressionSectionController";
import FieldsGroup from "./structure/FieldsGroup";
import {GlobalProgressionViewModel} from "core-mapping/presentation/viewModels/GlobalProgressionViewModel";
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {globalProgressionSectionTitle} from "~/messages/globalProgressionSectionMessages";

interface GlobalProgressionProps {
  sections: Accessor<ParsedSections>;
}

export default function GlobalProgressionSection({sections}: GlobalProgressionProps) {
  const [statisticsColumns, setStatisticsColumns] = createSignal<GlobalProgressionViewModel['statistics']['columns']>([]);

  createEffect(() => {
    const {statistics} = LoadGlobalProgressionSectionController.loadGlobalProgressionSection(sections());
    setStatisticsColumns(statistics.columns);
  });

  return (
    <div>
      <h3>{globalProgressionSectionTitle}</h3>
      <div class="fields-group-container">
        <FieldsGroup columns={statisticsColumns}/>
      </div>
    </div>
  )
    ;
}
