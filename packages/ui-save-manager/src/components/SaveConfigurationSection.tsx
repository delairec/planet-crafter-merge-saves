import {Accessor, createEffect, createSignal} from "solid-js";
import {LoadSaveConfigurationSectionController} from "../../../util-mapping/controllers/LoadSaveConfigurationSectionController";
import FieldsGroup from "./structure/FieldsGroup";
import {SaveConfigurationViewModel} from "../../../util-mapping/presentation/viewModels/SaveConfigurationViewModel";
import {ParsedSections} from "../../../util-types/gameDefinitions";

interface SaveConfigurationProps {
  sections: Accessor<ParsedSections>;
}

export default function SaveConfigurationSection({sections}: SaveConfigurationProps) {
  const [modifiersColumns, setModifiersColumns] = createSignal<SaveConfigurationViewModel['modifiers']['columns']>([]);
  const [title, setTitle] = createSignal<string>('');
  const [mode, setMode] = createSignal<string>('');

  createEffect(() => {
    const {title, modifiers, mode} = LoadSaveConfigurationSectionController.loadSaveConfigurationSection(sections());
    setModifiersColumns(modifiers.columns);
    setTitle(title);
    setMode(mode);
  });

  return (
    <>
      <h3>Save Configuration: {title()} ({mode()})</h3>
      <div class="fields-group-container">
        <FieldsGroup columns={modifiersColumns}/>
      </div>
    </>
  )
    ;
}
