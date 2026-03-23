import {describe, expect, it} from 'bun:test';
import {GlobalProgressionPresenter} from './GlobalProgressionPresenter';
import {GlobalProgressionViewModel} from './viewModels/GlobalProgressionViewModel';

describe('GlobalProgressionPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new GlobalProgressionPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<GlobalProgressionViewModel>({
      statistics: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: []
          },
          {
            header: 'Total crafted objects',
            values: []
          },
        ]
      },
    });
  });

  it('should present all GlobalProgression', () => {
    // Arrange
    const presenter = new GlobalProgressionPresenter();
    const globalProgression = {
      allTimeTerraTokens: 200_345
    };
    const statistics = {totalCraftedObjects:10};

    // Act
    presenter.present(globalProgression, statistics);

    // Assert
    expect(presenter.viewModel).toEqual<GlobalProgressionViewModel>({
      statistics: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: ['200,345 =tt=']
          },
          {
            header: 'Total crafted objects',
            values: ['10']
          }
        ]
      },
    });
  });
});

