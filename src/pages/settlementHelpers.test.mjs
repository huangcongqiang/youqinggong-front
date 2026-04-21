import assert from 'assert';
import { buildSettlementPath, buildSettlementRoute, normalizeFinanceActionCode } from './settlementHelpers.js';

assert.equal(buildSettlementPath('enterprise', 'record-42'), '/enterprise/records/record-42/settlement');
assert.equal(buildSettlementPath('talent', 'record-42'), '/talent/records/record-42/settlement');
assert.equal(normalizeFinanceActionCode('submit_invoice'), 'INVOICE_SUBMIT');

const route = buildSettlementRoute({
  audience: 'enterprise',
  recordId: 'record-42',
  taskId: 'task-9',
  room: 'room-1',
  current: {
    source: 'record-detail',
    recordId: 'record-42',
    taskId: 'task-9',
    room: 'room-1',
    originSource: 'records',
    originRecordId: 'record-42'
  },
  source: 'record-detail',
  financeAction: 'submit_invoice'
});

assert.equal(route.path, '/enterprise/records/record-42/settlement');
assert.equal(route.query.recordId, 'record-42');
assert.equal(route.query.taskId, 'task-9');
assert.equal(route.query.room, 'room-1');
assert.equal(route.query.source, 'record-detail');
assert.equal(route.query.originSource, 'records');
assert.equal(route.query.financeAction, 'INVOICE_SUBMIT');

const settlementRoute = buildSettlementRoute({
  audience: 'talent',
  recordId: 'record-99',
  taskId: 'task-77',
  current: {
    source: 'acceptance',
    recordId: 'record-99',
    taskId: 'task-77'
  },
  financeAction: 'execute_settlement'
});

assert.equal(settlementRoute.path, '/talent/records/record-99/settlement');
assert.equal(settlementRoute.query.financeAction, 'SETTLEMENT_EXECUTE');
