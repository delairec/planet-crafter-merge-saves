import {TableViewModel} from "./TableViewModel";

export interface PlayersViewModel {
  players: PlayerViewModel[];
}

interface PlayerViewModel extends TableViewModel{
  name: string;
}
