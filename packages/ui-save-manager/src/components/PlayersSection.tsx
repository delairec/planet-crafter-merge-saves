import {For, Show} from "solid-js";
import {LoadPlayersSectionController} from "../../../util-mapping/controllers/LoadPlayersSectionController";
import {ParsedSave} from "../../../util-types/gameDefinitions";

interface PlayersProps {
  sections: ParsedSave;
}

export default function PlayersSection({sections}: PlayersProps) {

  const vm = LoadPlayersSectionController.loadPlayersSection(sections);

  return <Show when={sections}>
    <table>
      <thead>
      <tr>
        <th>Players</th>
      </tr>
      </thead>
      <tbody>
      <For each={vm.players || []}>
        {(player) => (
          <tr>
            <td>{player.name}</td>
          </tr>
        )}</For>
      </tbody>
    </table>
  </Show>;
}
