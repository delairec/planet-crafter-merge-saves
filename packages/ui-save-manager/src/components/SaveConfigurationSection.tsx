import {Accessor, createEffect, createSignal} from "solid-js";
import {LoadSaveConfigurationSectionController} from "core-mapping/controllers/LoadSaveConfigurationSectionController";
import FieldsGroup from "./structure/FieldsGroup";
import {SaveConfigurationViewModel} from "core-mapping/presentation/viewModels/SaveConfigurationViewModel";
import {ParsedSections} from "shared-save-processing/gameDefinitions";
import {saveConfigurationSectionTitleLabel} from "~/messages/saveConfigurationSectionMessages";

interface SaveConfigurationProps {
  sections: Accessor<ParsedSections>;
}

export default function SaveConfigurationSection({sections}: SaveConfigurationProps) {
  const [modifiersColumns, setModifiersColumns] = createSignal<SaveConfigurationViewModel['modifiers']['columns']>([]);
  const [title, setTitle] = createSignal<string>('');
  const [mode, setMode] = createSignal<string>('');

  createEffect(() => {
    LoadSaveConfigurationSectionController.loadSaveConfigurationSection(sections())
      .then(({title, modifiers, mode}) => {
        setModifiersColumns(modifiers.columns);
        setTitle(title);
        setMode(mode);
      });
  });

  return (
    <div>
      <h3>{saveConfigurationSectionTitleLabel} {title()} ({mode()})</h3>
      <div class="fields-group-container">
        <FieldsGroup columns={modifiersColumns}/>
      </div>
    </div>
  )
    ;
}
