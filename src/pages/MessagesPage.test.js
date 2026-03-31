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
    source.includes('return baseIsSelfMessage(message, currentActor.value);'),
  'MessagesPage should expose isSelfMessage(message) for template rendering.'
);
