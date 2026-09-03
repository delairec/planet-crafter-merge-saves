export interface Inventory {
  id: number;
  woIds: string;
  size: number;
  demandGrps?: string;
  supplyGrps?: string;
  priority?: number;
}
