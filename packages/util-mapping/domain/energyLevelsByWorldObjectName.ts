import {WorldObjectName} from './worldObjectLabels';

export const energyProductionLevelsByWorldObjectName: Partial<Record<WorldObjectName, number>> = {
  EnergyGenerator1: 1.2,
  WindTurbine1: 290,
  EnergyGenerator2: 6.5,
  EnergyGenerator3: 19.5,
  EnergyGenerator4: 86.5,
  EnergyGenerator5: 331.5,
  EnergyGenerator6: 1485.5
};

export const energyConsumptionLevelsByWorldObjectName: Partial<Record<WorldObjectName, number>> = {
  Drill0: 0.5,
  Drill1: 5,
  Drill2: 8.5,
  Drill3: 45.5,
  Drill4: 375.5,
  Heater1: 1,
  Heater2: 3.5,
  Heater3: 17.5,
  Heater4: 51.5,
  Heater5: 360.5,
  OreExtractor1: 34,
  OreExtractor2: 164,
  OreExtractor3: 289,
  GasExtractor1: 58,
  GasExtractor2: 218,
  GrassSpreader1: 13.8,
  SeedSpreader1: 28.8,
  SeedSpreader2: 38.8,
  TreeSpreader0: 31,
  TreeSpreader1: 71,
  TreeSpreader2: 153,
  ComAntenna: 15,
  Teleporter1: 276,
  RecyclingMachine: 12.5,
  RecyclingMachine2: 283,
  Destructor1: 18
};
