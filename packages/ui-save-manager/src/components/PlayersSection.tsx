import {Accessor, createEffect, createSignal, For, Show} from "solid-js";
import {LoadPlayersSectionController} from "../../../util-mapping/controllers/LoadPlayersSectionController";
import Table from "~/components/structure/Table";
import {PlayersViewModel} from "../../../util-mapping/presentation/viewModels/PlayersViewModel";

interface PlayersProps {
  sections: Accessor<ParsedSections>;
}

export default function PlayersSection({sections}: PlayersProps) {
  const [players, setPlayers] = createSignal<PlayersViewModel['players']>([]);

  createEffect(() => {
    const vm = LoadPlayersSectionController.loadPlayersSection(sections());
    setPlayers(vm.players);
  });

  return (<>
    <h3>Players</h3>
    <Show when={sections}>
      <For each={players()}>
        {(player)=> (
          <>
            <h4>{player.name}</h4>
            <Table columns={() => player.columns}/>
          </>
        )}
      </For>
    </Show>
  </>);
}
