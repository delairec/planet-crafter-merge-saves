import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../testing/FakeSaveParserService.ts";
import type {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort.ts";
import {LoadGlobalProgressionSection} from "./LoadGlobalProgressionSection.ts";
import type {GlobalProgressionPresenterPort} from "./ports/GlobalProgressionPresenterPort.ts";

describe('LoadGlobalProgressionSection', () => {
  it('should present global progression and statistics from the parsed save', async () => {
    // Arrange
    const saveParser: SaveSectionsReaderPort = new FakeSaveParserService();
    const presenter: GlobalProgressionPresenterPort = {displayGlobalProgression: mock()};
    const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

    // Act
    await useCase.execute();

    // Assert
    expect(presenter.displayGlobalProgression).toHaveBeenCalledTimes(1);
    expect(presenter.displayGlobalProgression).toHaveBeenCalledWith({allTimeTerraTokens: 1_234_567}, {totalCraftedObjects: 10});
  });
});
