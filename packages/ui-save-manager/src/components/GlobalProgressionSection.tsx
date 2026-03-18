import {Accessor, createEffect, createSignal} from "solid-js";
import {LoadGlobalProgressionSectionController} from "../../../util-mapping/controllers/LoadGlobalProgressionSectionController";
import FieldsGroup from "./structure/FieldsGroup";
import {GlobalProgressionViewModel} from "../../../util-mapping/presentation/viewModels/GlobalProgressionViewModel";

interface GlobalProgressionProps {
  sections: Accessor<ParsedSections>;
}

export default function GlobalProgressionSection({sections}: GlobalProgressionProps) {
  const [tokenColumns, setTokenColumns] = createSignal<GlobalProgressionViewModel['tokens']['columns']>([]);
  const [title, setTitle] = createSignal<string|null>(null);

  createEffect(() => {
    const {tokens} = LoadGlobalProgressionSectionController.loadGlobalProgressionSection(sections());
    setTokenColumns(tokens.columns);
    setTitle(title);
  });

  return (<>
    <h3>Global progression</h3>
    <FieldsGroup columns={tokenColumns} />
  </>);
}
