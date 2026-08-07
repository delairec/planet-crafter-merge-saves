import {describe, it, expect} from 'bun:test';
import {SaveFilesMergerService} from './SaveFilesMergerService';
import {createFakeSaveContent} from '../../util-testing/fixtures/createFakeSaveContent.js';

describe('SaveFilesMergerService', () => {

  describe('When merging two valid saves', () => {
    it('should return the merged file name combining both save file names', () => {
      // Arrange
      const service = new SaveFilesMergerService();
      const contentA = createFakeSaveContent();
      const contentB = createFakeSaveContent();

      // Act
      const result = service.merge('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      expect(result.fileName).toBe('Standard-1-Standard-2-merged.json');
    });

    it('should return the merged save content with terra tokens summed from both saves', () => {
      // Arrange
      const service = new SaveFilesMergerService();
      const contentA = createFakeSaveContent();
      const contentB = createFakeSaveContent();

      // Act
      const result = service.merge('Standard-1.json', contentA, 'Standard-2.json', contentB);

      // Assert
      const globalMetadataSection = JSON.parse(result.content.split('@')[0].trim());
      expect(globalMetadataSection.allTimeTerraTokens).toBe(400_690);
    });
  });
});
