import type {TableViewModel} from "./TableViewModel.ts";

export interface SaveConfigurationViewModel {
  mode: string;
  title: string;
  modifiers: TableViewModel
}
