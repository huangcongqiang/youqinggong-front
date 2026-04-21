import assert from 'assert';
import {
  buildCenterReturnQuery,
  buildChildObjectPageContext,
  labelForObjectPageSource,
  readObjectPageContext,
  resolveImmediateOriginContext
} from './objectPageContext.js';
import { setUiLocale } from './uiLocale.js';

setUiLocale('zh');

const context = readObjectPageContext(
  {
    source: 'records',
    approvalId: 'approval-001',
    taskId: 'task-001',
    recordId: 'record-001',
    room: 'room-001',
    group: 'reviews',
    itemId: 'review-001',
    tab: 'completed'
  },
  {}
);

assert.strictEqual(context.source, 'records');
assert.strictEqual(context.approvalId, 'approval-001');
assert.strictEqual(context.taskId, 'task-001');
assert.strictEqual(context.recordId, 'record-001');
assert.strictEqual(context.group, 'reviews');

const origin = resolveImmediateOriginContext({
  entrySource: context.source,
  query: context,
  allowedSources: ['records', 'messages']
});

assert.strictEqual(origin.source, 'records');
assert.strictEqual(origin.approvalId, 'approval-001');
assert.strictEqual(origin.recordId, 'record-001');

const child = buildChildObjectPageContext({
  current: context,
  origin,
  overrides: {
    source: 'record-detail'
  }
});

assert.strictEqual(child.source, 'record-detail');
assert.strictEqual(child.originSource, 'records');
assert.strictEqual(child.originApprovalId, 'approval-001');
assert.strictEqual(child.originRecordId, 'record-001');
assert.strictEqual(child.tab, 'completed');

const centerQuery = buildCenterReturnQuery({
  current: child,
  origin
});

assert.deepStrictEqual(centerQuery, {
  group: 'reviews',
  itemId: 'review-001',
  approvalId: 'approval-001',
  taskId: 'task-001',
  recordId: 'record-001',
  room: 'room-001'
});

assert.strictEqual(labelForObjectPageSource('approvals', 'fallback'), '返回审批中心');
assert.strictEqual(labelForObjectPageSource('unknown', 'fallback'), 'fallback');

console.log('objectPageContext PC passed');
