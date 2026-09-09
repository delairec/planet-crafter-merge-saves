export interface Player {
  id: number;
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
