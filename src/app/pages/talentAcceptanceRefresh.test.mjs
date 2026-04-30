import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(currentDir, 'TalentAcceptance.tsx'), 'utf8');

assert.match(
  source,
  /getTaskClosureData\(selectedTaskId\),\s*getOrderRecordDetail\("talent", selectedTaskId\),\s*getOrderRecords\("talent", "all"\)/s,
  'Talent acceptance should refresh closure, record detail, and the left-side records list after submitting a review.'
);

assert.match(
  source,
  /setRecords\(asArray\(nextRecords\.items\)\)/,
  'Talent acceptance should replace stale task cards with the refreshed records list after settlement is generated.'
);

assert.match(
  source,
  /const summary = mergeSummary\(workspace\?\.summary, recordDetail\?\.summary, closure\?\.summary\)/,
  'Talent acceptance should merge summaries so fallback closure data does not hide richer record fields.'
);

assert.match(
  source,
  /targetBusinessUserId = resolveBusinessUserId\(latestClosure\?\.summary, workspace\?\.summary, recordDetail\?\.summary, record, selectedRecord\)/,
  'Talent acceptance should refetch closure data before rejecting a review with a missing enterprise user id.'
);

assert.match(
  source,
  /const reviewSubmitted = Boolean\(talentReview\) \|\| \/评分已归档\|已结算\/\.test\(stage\)/,
  'Talent acceptance should detect completed review states before rendering submit controls.'
);

assert.match(
  source,
  /disabled=\{reviewSubmitted \|\| isSubmitting \|\| isLoadingDetail \|\| !reviewContent\.trim\(\)\}/,
  'Talent acceptance should keep the submit button disabled while loading and after a review is archived.'
);

assert.match(
  source,
  /\{reviewSubmitted \? "评价已提交" : "提交评价"\}/,
  'Talent acceptance should label completed review controls as already submitted.'
);

console.log('TalentAcceptance review refresh contract passed.');
