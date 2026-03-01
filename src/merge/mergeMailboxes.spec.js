import {describe, it, expect} from 'bun:test';
import {merge} from './merge.js';
import {createFakeSaveString} from '../utils/testing/fixtures/createFakeSaveString.js';

describe('Merge saves — #6 Mailboxes', () => {
  const saveDisplayName = 'SAVE_NAME';

  const mailboxA = {stringId: 'Message_YouAreAConvict', isRead: true};
  const mailboxB = {stringId: 'Message_toxicity_InfosGoo', isRead: false};
  const mailboxShared = {stringId: 'Message_Shared', isRead: false};

  describe('When mailboxes are unique', () => {
    it('should concat mailboxes from both saves', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({mailboxes: [mailboxA]});
      const fakeSaveB = createFakeSaveString({mailboxes: [mailboxB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({mailboxes: [mailboxA, mailboxB]}));
    });
  });

  describe('When a mailbox appears in both saves', () => {
    it('should deduplicate mailboxes and mark as read when either save has it read', () => {
      // Arrange
      const mailboxInSaveA = {...mailboxShared, isRead: false};
      const mailboxInSaveB = {...mailboxShared, isRead: true};
      const fakeSaveA = createFakeSaveString({mailboxes: [mailboxInSaveA]});
      const fakeSaveB = createFakeSaveString({mailboxes: [mailboxInSaveB]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({mailboxes: [{...mailboxShared, isRead: true}]}));
    });

    it('should keep a mailbox as unread when both saves have it unread', () => {
      // Arrange
      const fakeSaveA = createFakeSaveString({mailboxes: [{...mailboxShared, isRead: false}]});
      const fakeSaveB = createFakeSaveString({mailboxes: [{...mailboxShared, isRead: false}]});
      const {mergeSaves} = merge(fakeSaveA, fakeSaveB, saveDisplayName);

      // Act
      const result = mergeSaves();

      // Assert
      expect(result).toBe(createFakeSaveString({mailboxes: [{...mailboxShared, isRead: false}]}));
    });
  });
});

