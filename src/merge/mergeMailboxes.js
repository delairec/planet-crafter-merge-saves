/** @import { MailboxMessage } from '../types.js' */

/**
 * @param {MailboxMessage[]} mailboxA
 * @param {MailboxMessage[]} mailboxB
 * @returns {string}
 * @see GR-MSG-1, GR-MSG-2, GR-MSG-3 in docs/business-rules.md
 */
export function mergeMailboxes(mailboxA, mailboxB) {
  const validatedMailboxA = mailboxA ?? [];
  const validatedMailboxB = mailboxB ?? [];

  const messagesFromBNotInA = validatedMailboxB.filter(messageB =>
    !validatedMailboxA.some(messageA => messageA.stringId === messageB.stringId)
  );

  const deduplicatedMessages = validatedMailboxA.map(messageA => {
    const messageB = validatedMailboxB.find(m => m.stringId === messageA.stringId);
    if (messageB) return {...messageA, isRead: messageA.isRead || messageB.isRead};
    return messageA;
  });

  return [...deduplicatedMessages, ...messagesFromBNotInA]
    .map(message => JSON.stringify(message))
    .join('|\n');
}

