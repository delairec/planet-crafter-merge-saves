import {describe, it, expect} from 'bun:test';
import {mergeMailboxes} from './mergeMailboxes';

describe('Merge mailboxes', () => {
  const uniqueMailboxFromSaveA = {stringId: 'Message_YouAreAConvict', isRead: true};
  const uniqueMailboxFromSaveB = {stringId: 'Message_toxicity_InfosGoo', isRead: false};
  const unreadSharedMailbox = {stringId: 'Message_Shared', isRead: false};
  const readSharedMailbox = {...unreadSharedMailbox, isRead: true};

  describe('When mailboxes are unique', () => {
    it('should combine mailboxes from both saves', () => {
      // Act
      const result = mergeMailboxes([uniqueMailboxFromSaveA], [uniqueMailboxFromSaveB]);

      // Assert
      expect(result).toEqual([
        {stringId: 'Message_YouAreAConvict', isRead: true},
        {stringId: 'Message_toxicity_InfosGoo', isRead: false}
      ]);
    });
  });

  describe('When a mailbox appears in both saves', () => {
    it('should deduplicate identical mailboxes', () => {
      // Act
      const result = mergeMailboxes([readSharedMailbox], [{...readSharedMailbox}]);

      // Assert
      expect(result).toEqual([{stringId: 'Message_Shared', isRead: true}]);
    });
  });

  describe('When only save A has that mailbox read', () => {
    it('should mark the mailbox as read', () => {
      // Act
      const result = mergeMailboxes([readSharedMailbox], [unreadSharedMailbox]);

      // Assert
      expect(result).toEqual([{stringId: 'Message_Shared', isRead: true}]);
    });
  });

  describe('When only save B has that mailbox read', () => {
    it('should mark the mailbox as read', () => {
      // Act
      const result = mergeMailboxes([unreadSharedMailbox], [readSharedMailbox]);

      // Assert
      expect(result).toEqual([{stringId: 'Message_Shared', isRead: true}]);
    });
  });

  describe('When both saves have that mailbox unread', () => {
    it('should keep the mailbox as unread', () => {
      // Act
      const result = mergeMailboxes([unreadSharedMailbox], [{...unreadSharedMailbox}]);

      // Assert
      expect(result).toEqual([{stringId: 'Message_Shared', isRead: false}]);
    });
  });

  describe('When both saves have no mailboxes', () => {
    it('should return no mailbox', () => {
      // Arrange
      const noMailboxesFromSaveA: never[] = [];
      const noMailboxesFromSaveB: never[] = [];

      // Act
      const result = mergeMailboxes(noMailboxesFromSaveA, noMailboxesFromSaveB);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
