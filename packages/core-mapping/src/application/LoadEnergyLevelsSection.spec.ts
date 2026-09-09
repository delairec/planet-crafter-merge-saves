import {describe, expect, it, mock} from 'bun:test';
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {FakeSaveParserService} from "../testing/FakeSaveParserService";
import {LoadEnergyLevelsSection} from "./LoadEnergyLevelsSection";

describe('LoadEnergyLevelsSection', () => {
  it('should present computed energy levels from parsed save', async () => {
    // Arrange
    const saveParser: SaveSectionsReaderPort = new FakeSaveParserService();
    const presenter = {displayEnergyLevels: mock()};
    const useCase = new LoadEnergyLevelsSection(saveParser, presenter);

    // Act
    await useCase.execute();

    // Assert
    expect(presenter.displayEnergyLevels).toHaveBeenCalledTimes(1);
    expect(presenter.displayEnergyLevels).toHaveBeenCalledWith({
      planets: [{
        planetId: 1,
        planetName: undefined,
        production: 1_485,
        consumption: 375.5,
        available: 1_109.5,
        productionBreakdown: [{
          name: 'EnergyGenerator6',
          quantity: 1,
          unitLevel: 1_485,
          totalLevel: 1_485,
          productionRatio: 1
        }],
        consumptionBreakdown: [{
          name: 'Drill4',
          quantity: 1,
          unitLevel: 375.5,
          totalLevel: 375.5
        }],
        optimizers: []
      }]
    });
  });
});
