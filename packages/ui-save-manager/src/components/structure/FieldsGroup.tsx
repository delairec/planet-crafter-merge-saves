import {Accessor, For} from "solid-js";

interface Column {
  header: string,
  values: string[]
}

interface TableProps {
  columns: Accessor<Column[]>,
}

export default function FieldsGroup({columns}: TableProps) {

  return (
    <For each={columns()}>
      {(column) => (
        <div class="field readonly">
          <div class="label">{column.header}</div>
          <For each={column.values}>
            {(value) => (
              <div class="value">{value}</div>
            )}
          </For>
        </div>
      )}
    </For>
  );
}
