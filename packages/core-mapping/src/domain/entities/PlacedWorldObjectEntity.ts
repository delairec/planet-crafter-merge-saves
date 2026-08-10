import {WorldObjectName} from "../worldObjectLabels";

// Represents a world object placed in the game world (has a position and belongs to a planet),
// as opposed to `WorldObjectEntity`, which only carries identity/name and is used for
// inventory/equipment labeling where placement is irrelevant.
export interface PlacedWorldObjectEntity {
  id: string;
  name: WorldObjectName;
  position: [number, number, number];
  planetId: number;
  inventoryId?: number;
}
