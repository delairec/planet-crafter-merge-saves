import {Accessor, createEffect, createSignal, Show} from "solid-js";
import {LoadTerraformationLevelsSectionController} from "../../../util-mapping/controllers/LoadTerraformationLevelsSectionController";
import {ParsedSave} from "../../../util-types/gameDefinitions";
import Table from "../components/structure/Table";
import {TerraformationLevelsViewModel} from "../../../util-mapping/presentation/viewModels/TerraformationLevelsViewModel";

interface TerraformationLevelsProps {
  sections: Accessor<ParsedSave>;
}

export default function TerraformationLevelsSection({sections}: TerraformationLevelsProps) {
  const [headers, setHeaders] = createSignal<TerraformationLevelsViewModel['headers']>([]);
  const [rows, setRows] = createSignal<TerraformationLevelsViewModel['rows']>([]);

  createEffect(() => {
    const vm = LoadTerraformationLevelsSectionController.loadTerraformationLevelsSection(sections());
    setHeaders(vm.headers);
    setRows(vm.rows);
  });

  return (<>
    <h3>Terraformation Levels</h3>
    <Show when={sections}>
      <Table headers={headers} rows={rows}/>
    </Show>
  </>);
}

