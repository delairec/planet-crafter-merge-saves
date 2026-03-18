import {describe, expect, it} from 'bun:test';
import {GlobalProgressionPresenter} from './GlobalProgressionPresenter';
import {GlobalProgressionViewModel} from './viewModels/GlobalProgressionViewModel';

describe('GlobalProgressionPresenter', () => {
  it('should initialize with default view model', () => {
    // Act
    const presenter = new GlobalProgressionPresenter();

    // Assert
    expect(presenter.viewModel).toEqual<GlobalProgressionViewModel>({
      tokens: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: []
          }
        ]
      },
    });
  });

  it('should present all GlobalProgression', () => {
    // Arrange
    const presenter = new GlobalProgressionPresenter();

    // Act
    presenter.present({
      allTimeTerraTokens: 200_345
    });

    // Assert
    expect(presenter.viewModel).toEqual<GlobalProgressionViewModel>({
      tokens: {
        columns: [
          {
            header: 'All time Terra Tokens',
            values: ['200,345 =tt=']
          }
        ]
      },
    });
  });
});

