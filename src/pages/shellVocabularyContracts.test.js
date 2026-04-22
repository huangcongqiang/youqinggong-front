import fs from 'node:fs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readSource(fileName) {
  return fs.readFileSync(new URL(`./${fileName}`, import.meta.url), 'utf8');
}

const workspaceSource = readSource('WorkspacePage.vue');
assert(
  !workspaceSource.includes('Review & payouts') && !workspaceSource.includes('Review and payouts'),
  'WorkspacePage should no longer expose Review & payouts vocabulary.'
);

const notificationSource = readSource('NotificationCenterPage.vue');
assert(
  !notificationSource.includes('Review & payouts') && !notificationSource.includes('Pending review'),
  'NotificationCenterPage should no longer expose Review & payouts vocabulary.'
);

const messageDetailHelpersSource = readSource('messageDetailHelpers.js');
assert(
  !messageDetailHelpersSource.includes('Pending review')
    && !messageDetailHelpersSource.includes("return 'System';")
    && !messageDetailHelpersSource.includes("return 'Me';")
    && !messageDetailHelpersSource.includes("return 'Available';")
    && !messageDetailHelpersSource.includes("return 'Image';"),
  'messageDetailHelpers should keep confirmation history and message detail helper copy localized.'
);

const acceptanceSource = readSource('AcceptancePage.vue');
assert(
  !acceptanceSource.includes('Payout result')
    && !acceptanceSource.includes('Payout can be executed after reconciliation is complete.')
    && !acceptanceSource.includes('Confirm review')
    && !acceptanceSource.includes('Review target:')
    && !acceptanceSource.includes('Review complete')
    && !acceptanceSource.includes('Review is complete.')
    && !acceptanceSource.includes('This review page is missing the contract context')
    && !acceptanceSource.includes('A claim can be requested once review is complete.')
    && !acceptanceSource.includes('not in review.')
    && !acceptanceSource.includes('Settlement opens after review is complete')
    && !acceptanceSource.includes('Continue after review')
    && !acceptanceSource.includes('Choose the final contract rating')
    && !acceptanceSource.includes('The acceptance result has been updated.')
    && !acceptanceSource.includes('The rating result has been updated.')
    && !acceptanceSource.includes('The feedback result has been updated.')
    && !acceptanceSource.includes('Current account unavailable')
    && !acceptanceSource.includes('Pending acceptance')
    && !acceptanceSource.includes('The rating is locked at S tier. Settlement can continue once reconciliation is complete.')
    && !acceptanceSource.includes('Full outcome')
    && !acceptanceSource.includes('Settlement pending')
    && !acceptanceSource.includes('Case study ready')
    && !acceptanceSource.includes('Top delivery result')
    && !acceptanceSource.includes('Request claim')
    && !acceptanceSource.includes('Approve claim')
    && !acceptanceSource.includes('Reject claim')
    && !acceptanceSource.includes('Submit invoice')
    && !acceptanceSource.includes('Confirm reconciliation')
    && !acceptanceSource.includes('Open dispute')
    && !acceptanceSource.includes('Execute settlement')
    && !acceptanceSource.includes('Mark failed')
    && !acceptanceSource.includes('This action')
    && !acceptanceSource.includes('Not started')
    && !acceptanceSource.includes('The latest live sync was interrupted. The page will retry automatically or fall back to polling.')
    && !acceptanceSource.includes('S tier'),
  'AcceptancePage should use settlement vocabulary instead of payout vocabulary.'
);

const settlementSource = readSource('SettlementPage.vue');
assert(
  !settlementSource.includes("buildClosureSummaryCard(\n    'Payout'")
    && !settlementSource.includes('Payout can be executed after reconciliation is complete.')
    && !settlementSource.includes('Continue finance steps once review is complete.')
    && !settlementSource.includes("tabs.push({ label: 'Review', to: acceptanceRoute.value })"),
  'SettlementPage should use settlement vocabulary for the execution stage.'
);

const businessSource = readSource('BusinessPage.vue');
assert(
  !businessSource.includes('Spending & payouts') && !businessSource.includes('Open proposal'),
  'BusinessPage should no longer expose proposal or payout ownership copy.'
);

const talentSource = readSource('TalentPage.vue');
assert(
  !talentSource.includes('Proposal context') && !talentSource.includes('Use Assistant on next proposal'),
  'TalentPage should no longer expose proposal-specific dashboard copy.'
);
assert(
  talentSource.includes("surface: 'application'") && !talentSource.includes("surface: 'proposal'"),
  'TalentPage should emit application context for assistant deep links.'
);
assert(
  talentSource.includes('const attentionPrimaryRoute = computed(() => attentionCards.value[0]?.route || roleRouteMap.talent.messages)')
    && talentSource.includes('const inboxPrimaryRoute = computed(() => proposalItems.value[0]?.route || invitationItems.value[0]?.route || offerItems.value[0]?.route || roleRouteMap.talent.messages)'),
  'TalentPage should keep action-needed and inbox CTA routes owner-first, while only falling back to messages when no concrete object exists.'
);

const recordSource = readSource('RecordPage.vue');
assert(
  !recordSource.includes('Contract history / payouts'),
  'RecordPage should no longer merge history and payouts in one ownership label.'
);

const authSource = readSource('AuthPage.vue');
assert(
  !authSource.includes('Ready before proposals'),
  'AuthPage should no longer use proposal-era onboarding copy.'
);

const desktopShellSource = readSource('../components/DesktopWorkbenchShell.vue');
assert(
  desktopShellSource.includes('workspace-topbar__brand-rail')
    && desktopShellSource.includes('workspace-topbar__utility')
    && desktopShellSource.includes('grid-template-columns: auto minmax(0, 1fr) minmax(320px, 420px) auto;')
    && desktopShellSource.includes('white-space: nowrap;')
    && desktopShellSource.includes('overflow-x: auto;')
    && !desktopShellSource.includes('workspace-topbar__left')
    && !desktopShellSource.includes('workspace-topbar__right'),
  'DesktopWorkbenchShell should use a three-rail single-line workspace header instead of the old left/right compressed layout.'
);
assert(
  desktopShellSource.includes('<section v-if="!hidePageHero" class="workspace-hero">')
    && desktopShellSource.includes("route.path.startsWith('/enterprise/workspace')")
    && desktopShellSource.includes("route.path.startsWith('/talent/workspace')"),
  'DesktopWorkbenchShell should hide the entry hero inside single-contract workspace pages.'
);

const registerSource = readSource('RegisterPage.vue');
assert(
  !registerSource.includes('Proposal entry') && !registerSource.includes('submit proposals'),
  'RegisterPage should no longer expose proposal-era signup copy.'
);

const assistantSource = readSource('AssistantPage.vue');
assert(
  assistantSource.includes("roleRouteMap.talent.taskApply(attachedTaskId.value) : roleRouteMap.talent.market, 'application'")
    && assistantSource.includes("roleRouteMap.talent.taskDetail(attachedTaskId.value) : roleRouteMap.talent.market, 'opportunity'")
    && !assistantSource.includes("return 'proposal';"),
  'AssistantPage should emit application vocabulary and task-aware talent deep links.'
);

const taskApplySource = readSource('TaskApplyPage.vue');
assert(
  taskApplySource.includes("source: 'application'")
    && taskApplySource.includes("surface: 'application'")
    && !taskApplySource.includes("source: 'proposal'")
    && !taskApplySource.includes("surface: 'proposal'"),
  'TaskApplyPage should emit application context when linking into messages.'
);
assert(
  !taskApplySource.includes('Application unavailable')
    && !taskApplySource.includes('Back to job')
    && !taskApplySource.includes('Back to results')
    && !taskApplySource.includes('Finish your application')
    && !taskApplySource.includes('Cover letter')
    && !taskApplySource.includes('Rate or bid')
    && !taskApplySource.includes('Availability')
    && !taskApplySource.includes('Start date')
    && !taskApplySource.includes('Work samples')
    && !taskApplySource.includes('Additional notes')
    && !taskApplySource.includes('Trust signals'),
  'TaskApplyPage should keep the application flow fully localized instead of exposing English application shell copy.'
);
