import {Accessor, createEffect, createSignal, For, Show} from "solid-js";
import {LoadPlayersSectionController} from "core-mapping/controllers/LoadPlayersSectionController";
import FieldsGroup from "~/components/structure/FieldsGroup";
import {PlayersViewModel} from "core-mapping/presentation/viewModels/PlayersViewModel";
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {playersSectionTitle} from "~/messages/playersSectionMessages";

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
    <h3>{playersSectionTitle}</h3>
    <Show when={sections}>
      <div class="grid-container">
        <For each={players()}>
          {(player) => (
            <div class="grid-item">
              <h4>{player.name}</h4>
              <div class="fields-group-container">
                <FieldsGroup columns={() => player.columns}/>
              </div>
            </div>
          )}
        </For>
      </div>
    </Show>
  </>);
}
