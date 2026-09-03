import {describe, it, expect} from 'bun:test';
import {mergeMailboxes} from './mergeMailboxes';

describe('Merge mailboxes', () => {
  const uniqueMailboxFromSaveA = {stringId: 'Message_YouAreAConvict', isRead: true};
  const uniqueMailboxFromSaveB = {stringId: 'Message_toxicity_InfosGoo', isRead: false};
  const unreadSharedMailbox = {stringId: 'Message_Shared', isRead: false};
  const readSharedMailbox = {...unreadSharedMailbox, isRead: true};

  describe('When mailboxes are unique', () => {
    it('should combine mailboxes from both saves', () => {
      // Arrange
      const mailboxesFromSaveA = [uniqueMailboxFromSaveA];
      const mailboxesFromSaveB = [uniqueMailboxFromSaveB];

      // Act
      const result = mergeMailboxes(mailboxesFromSaveA, mailboxesFromSaveB);

      // Assert
      expect(result).toBe(`${JSON.stringify(uniqueMailboxFromSaveA)}|\n${JSON.stringify(uniqueMailboxFromSaveB)}`);
    });
  });

  describe('When a mailbox appears in both saves', () => {
    it('should deduplicate identical mailboxes', () => {
      // Arrange
      const mailboxesFromSaveA = [readSharedMailbox];
      const mailboxesFromSaveB = [{...readSharedMailbox}];

      // Act
      const result = mergeMailboxes(mailboxesFromSaveA, mailboxesFromSaveB);

      // Assert
      expect(result).toBe(JSON.stringify(readSharedMailbox));
    });

    it('should mark a mailbox as read when save A has it read', () => {
      // Arrange
      const mailboxesFromSaveA = [readSharedMailbox];
      const mailboxesFromSaveB = [unreadSharedMailbox];

      // Act
      const result = mergeMailboxes(mailboxesFromSaveA, mailboxesFromSaveB);

      // Assert
      expect(result).toBe(JSON.stringify(readSharedMailbox));
    });

    it('should mark a mailbox as read when save B has it read', () => {
      // Arrange
      const mailboxesFromSaveA = [unreadSharedMailbox];
      const mailboxesFromSaveB = [readSharedMailbox];

      // Act
      const result = mergeMailboxes(mailboxesFromSaveA, mailboxesFromSaveB);

      // Assert
      expect(result).toBe(JSON.stringify(readSharedMailbox));
    });

    it('should keep a mailbox as unread when both saves have it unread', () => {
      // Arrange
      const mailboxesFromSaveA = [unreadSharedMailbox];
      const mailboxesFromSaveB = [{...unreadSharedMailbox}];

      // Act
      const result = mergeMailboxes(mailboxesFromSaveA, mailboxesFromSaveB);

      // Assert
      expect(result).toBe(JSON.stringify(unreadSharedMailbox));
    });
  });

  describe('When both saves have no mailboxes', () => {
    it('should return an empty mailbox section', () => {
      // Arrange
      const mailboxesFromSaveA = [];
      const mailboxesFromSaveB = [];

      // Act
      const result = mergeMailboxes(mailboxesFromSaveA, mailboxesFromSaveB);

      // Assert
      expect(result).toBe('');
    });
  });
});

