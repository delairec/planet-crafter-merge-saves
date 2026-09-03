export interface WorldEvent {
  planet: number;
  seed: number;
  pos: string;
  owner?: number;
  index?: number;
  rot?: string;
  wrecksWOGenerated?: boolean;
  woIdsGenerated?: string;
  woIdsDropped?: string;
  version?: number;
}
