import {Accessor, createEffect, createSignal} from "solid-js";
import {LoadGlobalProgressionSectionController} from "../../../util-mapping/controllers/LoadGlobalProgressionSectionController";
import Table from "../components/structure/Table";
import {GlobalProgressionViewModel} from "../../../util-mapping/presentation/viewModels/GlobalProgressionViewModel";

interface GlobalProgressionProps {
  sections: Accessor<ParsedSections>;
}

export default function GlobalProgressionSection({sections}: GlobalProgressionProps) {
  const [headers, setHeaders] = createSignal<GlobalProgressionViewModel['headers']>([]);
  const [rows, setRows] = createSignal<GlobalProgressionViewModel['rows']>([]);

  createEffect(() => {
    const vm = LoadGlobalProgressionSectionController.loadGlobalProgressionSection(sections());
    setHeaders(vm.headers);
    setRows(vm.rows);
  });

  return (<>
    <h3>Global progression</h3>
    <Table headers={headers} rows={rows} />
  </>);
}
