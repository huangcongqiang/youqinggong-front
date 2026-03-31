import assert from 'assert';
import {
  buildCenterReturnQuery,
  buildChildObjectPageContext,
  labelForObjectPageSource,
  readObjectPageContext,
  resolveImmediateOriginContext
} from './objectPageContext.js';

const context = readObjectPageContext(
  {
    source: 'workspace',
    approvalId: 'approval-009',
    taskId: 'task-009',
    recordId: 'record-009',
    room: 'room-009',
    tab: 'ongoing'
  },
  {}
);

assert.strictEqual(context.source, 'workspace');
assert.strictEqual(context.approvalId, 'approval-009');
assert.strictEqual(context.taskId, 'task-009');

const origin = resolveImmediateOriginContext({
  entrySource: context.source,
  query: context,
  allowedSources: ['workspace', 'messages']
});

assert.strictEqual(origin.source, 'workspace');
assert.strictEqual(origin.approvalId, 'approval-009');
assert.strictEqual(origin.taskId, 'task-009');

const child = buildChildObjectPageContext({
  current: context,
  origin,
  overrides: {
    source: 'acceptance'
  }
});

assert.strictEqual(child.source, 'acceptance');
assert.strictEqual(child.originSource, 'workspace');
assert.strictEqual(child.originApprovalId, 'approval-009');
assert.strictEqual(child.originTaskId, 'task-009');

const centerQuery = buildCenterReturnQuery({
  current: child,
  origin
});

assert.deepStrictEqual(centerQuery, {
  approvalId: 'approval-009',
  taskId: 'task-009',
  recordId: 'record-009',
  room: 'room-009'
});

assert.strictEqual(labelForObjectPageSource('messages', 'fallback'), '返回聊天');
assert.strictEqual(labelForObjectPageSource('unknown', 'fallback'), 'fallback');

console.log('objectPageContext H5 passed');
