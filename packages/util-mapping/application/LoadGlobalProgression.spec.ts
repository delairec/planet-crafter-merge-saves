import {describe, expect, it, mock} from 'bun:test';
import {FakeSaveParserService} from "../../util-testing/fakes/FakeSaveParserService";
import {SaveParserPort} from "./ports/SaveParserPort";
import {LoadGlobalProgressionSection} from "./LoadGlobalProgressionSection";
import {GlobalProgressionValueObject} from "../domain/valueObjects/GlobalProgressionValueObject";

interface GlobalProgressionPresenterPort{
  present(globalProgression:GlobalProgressionValueObject): void;
}

describe('LoadGlobalProgressionSection', () => {
  it('should present all players from the parsed save', () => {
    // Arrange
    const saveParser: SaveParserPort = new FakeSaveParserService();
    const presenter: GlobalProgressionPresenterPort = {present: mock()};
    const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

    // Act
    useCase.execute();

    // Assert
    expect(presenter.present).toHaveBeenCalledTimes(1);
    expect(presenter.present).toHaveBeenCalledWith({allTimeTerraTokens: 1_234_567});
  });
});
