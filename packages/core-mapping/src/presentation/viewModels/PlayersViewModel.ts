import type {TableViewModel} from "./TableViewModel.ts";

export interface PlayersViewModel {
  players: PlayerViewModel[];
}

interface PlayerViewModel extends TableViewModel{
  name: string;
}
