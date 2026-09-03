import {describe, expect, it, mock} from 'bun:test';
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {FakeSaveParserService} from "../testing/FakeSaveParserService";
import {LoadEnergyLevelsSection} from "./LoadEnergyLevelsSection";

describe('LoadEnergyLevelsSection', () => {
  it('should present computed energy levels from parsed save', () => {
    // Arrange
    const saveParser: SaveSectionsReaderPort = new FakeSaveParserService();
    const presenter = {displayEnergyLevels: mock()};
    const useCase = new LoadEnergyLevelsSection(saveParser, presenter);

    // Act
    useCase.execute();

    // Assert
    expect(presenter.displayEnergyLevels).toHaveBeenCalledTimes(1);
    expect(presenter.displayEnergyLevels).toHaveBeenCalledWith({
      planets: [{
        planetId: 'Planet 1',
        production: 22_220.5,
        consumption: 11_110.5,
        available: 11_110,
        productionBreakdown: [{
          label: 'Nuclear Fusion generator',
          quantity: 1,
          unitLevel: 22_220.5,
          totalLevel: 22_220.5
        }],
        consumptionBreakdown: [{
          label: 'Nuclear Reactor T1',
          quantity: 1,
          unitLevel: 11_110.5,
          totalLevel: 11_110.5
        }],
        optimizers: []
      }]
    });
  });
});
