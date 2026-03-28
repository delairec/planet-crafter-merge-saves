import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../../util-testing/fakes/FakeSaveParserService";
import {SaveParserPort} from "./ports/SaveParserPort";
import {LoadGlobalProgressionSection} from "./LoadGlobalProgressionSection";
import {GlobalProgressionPresenterPort} from "./ports/GlobalProgressionPresenterPort";

describe('LoadGlobalProgressionSection', () => {
  it('should present global progression and statistics from the parsed save', () => {
    // Arrange
    const saveParser: SaveParserPort = new FakeSaveParserService();
    const presenter: GlobalProgressionPresenterPort = {present: mock()};
    const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

    // Act
    useCase.execute();

    // Assert
    expect(presenter.present).toHaveBeenCalledTimes(1);
    expect(presenter.present).toHaveBeenCalledWith({allTimeTerraTokens: 1_234_567}, {totalCraftedObjects: 10});
  });
});
