import {Accessor, For} from "solid-js";

interface Column {
  header: string,
  values: string[]
}

interface FieldsGroupProps {
  columns: Accessor<Column[]>,
}

export default function FieldsGroup({columns}: FieldsGroupProps) {

  return (
    <div class="fields-group readonly mb-2">
      <For each={columns()}>
        {(column) => (
          <div class="field">
            <div class="label">{column.header}</div>
            <For each={column.values}>
              {(value) => (
                <div class="value">{value}</div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
