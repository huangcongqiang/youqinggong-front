import fs from 'node:fs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const source = fs.readFileSync(new URL('./MessagesPage.vue', import.meta.url), 'utf8');

assert(
  source.includes('isSelfMessage as baseIsSelfMessage'),
  'MessagesPage should import baseIsSelfMessage from messageDetailHelpers.'
);

assert(
  source.includes('function isSelfMessage(message) {') &&
    source.includes('baseIsSelfMessage({ ...message, author }, currentActor.value)') &&
    source.includes('currentUserIds.value.includes(authorUserId)') &&
    source.includes('currentUserNames.value.includes(author)') &&
    source.includes('isCurrentAudienceRole(role)'),
  'MessagesPage should identify self messages by role, current user id, and current user display name.'
);
