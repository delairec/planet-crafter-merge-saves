import {For} from "solid-js";
import FieldsGroup, {Column} from "./FieldsGroup";

interface FieldsGroupGridProps<T> {
  title: string;
  items: T[];
  itemLabel: (item: T) => string;
  columns: (item: T) => Column[];
}

export default function FieldsGroupGrid<T>({title, items, itemLabel, columns}: FieldsGroupGridProps<T>) {
  return (
    <>
      <h5>{title}</h5>
      <div class="grid-container">
        <For each={items}>
          {(item) => (
            <div class="grid-item">
              <h5>{itemLabel(item)}</h5>
              <FieldsGroup columns={() => columns(item)}/>
            </div>
          )}
        </For>
      </div>
    </>
  );
}
