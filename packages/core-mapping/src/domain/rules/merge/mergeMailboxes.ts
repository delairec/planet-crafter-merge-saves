import {MailboxMessage} from 'shared-save-processing/gameDefinitions';

/**
 * @see GR-MSG-1, GR-MSG-2, GR-MSG-3 in docs/game-rules.md
 */
export function mergeMailboxes(mailboxA: MailboxMessage[], mailboxB: MailboxMessage[]): MailboxMessage[] {
  const messagesFromBNotInA = mailboxB.filter(messageB =>
    !mailboxA.some(messageA => messageA.stringId === messageB.stringId)
  );

  const deduplicatedMessages = mailboxA.map(messageA => {
    const messageB = mailboxB.find(message => message.stringId === messageA.stringId);
    if (messageB) {
      return {...messageA, isRead: messageA.isRead || messageB.isRead};
    }

    return messageA;
  });

  return [...deduplicatedMessages, ...messagesFromBNotInA];
}
