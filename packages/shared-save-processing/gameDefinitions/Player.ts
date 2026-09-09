export interface Player {
  /** Steam64 identifier, carried as its exact decimal text — see `int64Identifiers.js`. */
  id: string;
  name: string;
  inventoryId: number;
  equipmentId: number;
  playerPosition: string;
  playerRotation: string;
  playerGaugeOxygen: number;
  playerGaugeThirst: number;
  playerGaugeHealth: number;
  playerGaugeToxic: number;
  host: boolean;
  planetId: string;
  cameraView: number;
  totalCraftedObjects: number;
  totalTerraTokenEarned: number;
}
