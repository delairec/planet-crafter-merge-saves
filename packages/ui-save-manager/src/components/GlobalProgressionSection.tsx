import {Accessor, createEffect, createSignal} from "solid-js";
import {
  LoadGlobalProgressionSectionController
} from "../../../core-mapping/src/controllers/LoadGlobalProgressionSectionController";
import FieldsGroup from "./structure/FieldsGroup";
import {GlobalProgressionViewModel} from "../../../core-mapping/src/presentation/viewModels/GlobalProgressionViewModel";
import {ParsedSections} from "../../../util-types/gameDefinitions";
import {globalProgressionSectionTitle} from "../../../util-messages/globalProgressionSectionMessages";

interface GlobalProgressionProps {
  sections: Accessor<ParsedSections>;
}

export default function GlobalProgressionSection({sections}: GlobalProgressionProps) {
  const [statisticsColumns, setStatisticsColumns] = createSignal<GlobalProgressionViewModel['statistics']['columns']>([]);
  const [title, setTitle] = createSignal<string | null>(null);

  createEffect(() => {
    const {statistics} = LoadGlobalProgressionSectionController.loadGlobalProgressionSection(sections());
    setStatisticsColumns(statistics.columns);
    setTitle(title);
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
