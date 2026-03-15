import {Accessor, For} from "solid-js";
import {TableViewModel} from "../../../../util-mapping/presentation/viewModels/TableViewModel";

interface TableProps<T> {
  headers: Accessor<TableViewModel<T>['headers']>;
  rows: Accessor<TableViewModel<T>['rows']>;
}

export default function Table<T extends Record<string, any>>({headers, rows}: TableProps<T>) {

  return (
    <div class="table-container">
      <table>
        <thead>
        <tr>
          <For each={headers()}>
            {(header) => (
              <th>{header}</th>
            )}
          </For>
        </tr>
        </thead>
        <tbody>
        <For each={rows()}>
          {(row) => (
            <tr>
              <For each={row.cells}>
                {(cell, index) => (
                  <td data-label={headers()[index()]}>{cell.value}</td>
                )}
              </For>
            </tr>
          )}</For>
        </tbody>
      </table>
    </div>
  );
}
