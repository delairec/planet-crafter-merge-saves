import type {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort.ts";
import type {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort.ts";
import type {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject.ts";
import type {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject.ts";
import {computePlanetEnergyLevels} from "../domain/rules/computePlanetEnergyLevels.ts";

export class LoadEnergyLevelsSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: EnergyLevelsPresenterPort
  ) {
  }

  async execute(): Promise<void> {
    const {allWorldObjects, inventories, planets} = this.saveParser.getEnergyLevelsRawData();

    const energyLevels: EnergyLevelsValueObject = {
      planets: planets.map((planet): PlanetEnergyLevelsValueObject => ({
        planetId: planet.planetId,
        planetName: planet.planetName,
        ...computePlanetEnergyLevels(allWorldObjects, planet.placedWorldObjects, inventories)
      }))
    };

    this.presenter.displayEnergyLevels(energyLevels);
  }
}
