export interface TableViewModel<T> {
  headers: Extract<keyof T, string>[];
  rows: Row[]
}

interface Row {
  cells: Cell[]
}

interface Cell {
  value: string;
}

