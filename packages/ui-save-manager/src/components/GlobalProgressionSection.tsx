import {Accessor, createEffect, createSignal} from "solid-js";
import {LoadGlobalProgressionSectionController} from "../../../util-mapping/controllers/LoadGlobalProgressionSectionController";
import FieldsGroup from "./structure/FieldsGroup";
import {GlobalProgressionViewModel} from "../../../util-mapping/presentation/viewModels/GlobalProgressionViewModel";
import {ParsedSections} from "../../../util-types/gameDefinitions";

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
    <>
      <h3>Global progression</h3>
      <div class="fields-group-container fields-group-single">
        <FieldsGroup columns={statisticsColumns}/>
      </div>
    </>
  )
    ;
}
