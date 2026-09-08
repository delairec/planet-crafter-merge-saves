import {expect, test} from '@playwright/test';

const validSaveFixturePath = new URL('./fixtures/valid-save.json', import.meta.url).pathname;

test.describe('Save display', () => {
  test.describe('When a valid save file is visualized', () => {
    test('should display the save configuration of that file', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      // The file field of the display flow carries no label: 'Choose File' is the accessible name
      // Playwright computes for an unlabelled file input, on the three engines alike.
      await page.getByRole('button', {name: 'Choose File'}).setInputFiles(validSaveFixturePath);
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
    });
  });
});
