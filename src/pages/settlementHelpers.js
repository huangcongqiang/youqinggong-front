import { buildChildObjectPageContext, normalizeContextValue, readObjectPageContext } from '../utils/objectPageContext.js';
import { roleRouteMap } from '../utils/roleRoutes.js';

export function normalizeFinanceActionCode(value) {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) {
    return '';
  }

  const aliases = {
    REQUEST_CLAIM: 'CLAIM_REQUEST',
    CLAIM_REQUEST: 'CLAIM_REQUEST',
    CLAIM: 'CLAIM_REQUEST',
    APPROVE_CLAIM: 'CLAIM_APPROVE',
    CLAIM_APPROVE: 'CLAIM_APPROVE',
    REJECT_CLAIM: 'CLAIM_REJECT',
    CLAIM_REJECT: 'CLAIM_REJECT',
    SUBMIT_INVOICE: 'INVOICE_SUBMIT',
    INVOICE_SUBMIT: 'INVOICE_SUBMIT',
    CONFIRM_RECONCILIATION: 'RECONCILIATION_CONFIRM',
    RECONCILIATION_CONFIRM: 'RECONCILIATION_CONFIRM',
    DISPUTE_RECONCILIATION: 'RECONCILIATION_DISPUTE',
    RECONCILIATION_DISPUTE: 'RECONCILIATION_DISPUTE',
    EXECUTE_SETTLEMENT: 'SETTLEMENT_EXECUTE',
    SETTLEMENT_EXECUTE: 'SETTLEMENT_EXECUTE',
    FAIL_SETTLEMENT: 'SETTLEMENT_FAIL',
    SETTLEMENT_FAIL: 'SETTLEMENT_FAIL'
  };

  return aliases[raw] || raw;
}

export function financeActionLabel(code) {
  return (
    {
      CLAIM_REQUEST: '提交请款',
      CLAIM_APPROVE: '审批请款',
      CLAIM_REJECT: '退回请款',
      INVOICE_SUBMIT: '提交发票',
      RECONCILIATION_CONFIRM: '确认对账',
      RECONCILIATION_DISPUTE: '发起争议',
      SETTLEMENT_EXECUTE: '执行结算',
      SETTLEMENT_FAIL: '标记结算失败'
    }[normalizeFinanceActionCode(code)] || String(code || '').trim()
  );
}

export function buildSettlementPath(audience = 'enterprise', recordId = '') {
  const safeAudience = audience === 'talent' ? 'talent' : 'enterprise';
  const safeRecordId = normalizeContextValue(recordId);
  if (!safeRecordId) {
    return '';
  }

  const basePath = safeAudience === 'talent'
    ? roleRouteMap.talent.recordDetail(encodeURIComponent(safeRecordId))
    : roleRouteMap.enterprise.recordDetail(encodeURIComponent(safeRecordId));

  return `${basePath}/settlement`;
}

export function buildSettlementRoute({
  audience = 'enterprise',
  recordId = '',
  taskId = '',
  room = '',
  current = {},
  origin,
  source = 'settlement',
  financeAction = ''
} = {}) {
  const path = buildSettlementPath(audience, recordId);
  if (!path) {
    return null;
  }

  const currentContext = readObjectPageContext(current, current);
  const query = buildChildObjectPageContext({
    current: currentContext,
    origin,
    overrides: {
      ...currentContext,
      source: normalizeContextValue(source) || 'settlement',
      recordId: normalizeContextValue(recordId),
      taskId: normalizeContextValue(taskId),
      room: normalizeContextValue(room)
    }
  });
  const safeFinanceAction = normalizeFinanceActionCode(financeAction);
  if (safeFinanceAction) {
    query.financeAction = safeFinanceAction;
  }

  return { path, query };
}
