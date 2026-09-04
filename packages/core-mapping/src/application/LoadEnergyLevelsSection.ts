import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {EnergyLevelsPresenterPort} from "./ports/EnergyLevelsPresenterPort";
import {EnergyLevelsValueObject} from "../domain/valueObjects/EnergyLevelsValueObject";
import {PlanetEnergyLevelsValueObject} from "../domain/valueObjects/PlanetEnergyLevelsValueObject";
import {computePlanetEnergyLevels} from "../domain/rules/computePlanetEnergyLevels";

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
