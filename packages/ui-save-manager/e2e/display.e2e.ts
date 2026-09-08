import {expect, test} from '@playwright/test';

const validSaveFixturePath = new URL('./fixtures/valid-save.json', import.meta.url).pathname;

test.describe('Save display', () => {
  test.describe('When a valid save file is visualized', () => {
    test('should display the save configuration of that file', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await page.getByLabel('Save file:').setInputFiles(validSaveFixturePath);
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
    });
  });
});
