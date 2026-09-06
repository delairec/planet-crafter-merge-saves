import type {WorldObjectName} from "../worldObjectNames.ts";

// Rule EN-OPT-1: Optimizer capacity (max boosted machines) and radius (in meters).
export const OPTIMIZER_CONFIG_BY_NAME: Partial<Record<WorldObjectName, { radius: number; maxMachines: number }>> = {
  Optimizer1: {radius: 120, maxMachines: 5},
  Optimizer2: {radius: 250, maxMachines: 8}
};

export const ENERGY_FUSE_NAME: WorldObjectName = 'FuseEnergy1' as WorldObjectName;

// Rule EN-FUSE-2/3 (per Fuse wiki page): each Energy Fuse replaces the producer's 100% base value
// with a 150% multiplier; multiple fuses (from one or more Optimizers) stack additively by raw
// percentage — e.g. 2 fuses => 300%, not 200%. A producer reached by zero fuses stays at 100%.
export const ENERGY_FUSE_MULTIPLIER_PER_FUSE = 1.5;
