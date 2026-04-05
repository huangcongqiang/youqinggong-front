import fs from 'node:fs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readSource(fileName) {
  return fs.readFileSync(new URL(`./${fileName}`, import.meta.url), 'utf8');
}

const publishSource = readSource('PublishTaskPage.vue');
assert(
  publishSource.includes('请先填写任务标题和需求内容。'),
  'PublishTaskPage should surface a validation error when title or brief is missing.'
);
assert(
  publishSource.includes('analysis.requestError') || publishSource.includes('currentAnalysisError'),
  'PublishTaskPage should expose AI analysis request errors to the UI.'
);

const messagesSource = readSource('MessagesPage.vue');
assert(
  messagesSource.includes('const roomsRequestError = ref('),
  'MessagesPage should track task room list request errors explicitly.'
);
assert(
  messagesSource.includes("messageEntrySource.value === 'task-market'"),
  'MessagesPage should recognize task-market as a valid entry source for back routing.'
);

const acceptanceSource = readSource('AcceptancePage.vue');
assert(
  acceptanceSource.includes('acceptanceResult.requestError || acceptanceResult.nextStep')
    || acceptanceSource.includes('resultMessage(acceptanceResult)'),
  'AcceptancePage should render requestError when acceptance submission fails.'
);
assert(
  acceptanceSource.includes('const financeSubmittingActionCode = ref('),
  'AcceptancePage should track finance action submission state to prevent duplicate clicks.'
);

const talentDetailSource = readSource('TalentDetailPage.vue');
assert(
  talentDetailSource.includes('page.requestError'),
  'TalentDetailPage should render requestError instead of silently showing an empty fallback profile.'
);
