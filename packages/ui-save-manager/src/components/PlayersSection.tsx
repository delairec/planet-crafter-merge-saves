import {Accessor, createEffect, createSignal, Show} from "solid-js";
import {LoadPlayersSectionController} from "../../../util-mapping/controllers/LoadPlayersSectionController";
import Table from "~/components/structure/Table";
import {PlayersViewModel} from "../../../util-mapping/presentation/viewModels/PlayersViewModel";

interface PlayersProps {
  sections: Accessor<ParsedSections>;
}

export default function PlayersSection({sections}: PlayersProps) {
  const [headers, setHeaders] = createSignal<PlayersViewModel['headers']>([]);
  const [rows, setRows] = createSignal<PlayersViewModel['rows']>([]);

  createEffect(() => {
    const vm = LoadPlayersSectionController.loadPlayersSection(sections());
    setHeaders(vm.headers);
    setRows(vm.rows);
  });

  return (<>
    <h3>Players</h3>
    <Show when={sections}>
      <Table headers={headers} rows={rows}/>
    </Show>
  </>);
}
