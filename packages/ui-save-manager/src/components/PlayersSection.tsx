import {For, Resource, Show} from "solid-js";
import FieldsGroup from "~/components/structure/FieldsGroup";
import {PlayersViewModel} from "core-mapping/presentation/viewModels/PlayersViewModel";
import {playersSectionTitle} from "~/messages/playersSectionMessages";

interface PlayersProps {
  viewModel: Resource<PlayersViewModel>;
}

export default function PlayersSection({viewModel}: PlayersProps) {
  return (<>
    <h3>{playersSectionTitle}</h3>
    <Show when={viewModel()}>
      <div class="grid-container">
        <For each={viewModel()!.players}>
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
