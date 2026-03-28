export interface TableViewModel {
  columns: ColumnViewModel[];
}

interface ColumnViewModel {
  header: string;
  values: string[];
}
