import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(resolve(currentDir, file), 'utf8');

const formatterSource = read('../services/workflowFormatters.ts');
const actionPanelSource = read('../components/FinanceActionPanel.tsx');
const recordDetailsSource = read('RecordDetailsView.tsx');
const settlementSource = read('SettlementView.tsx');

assert(
  formatterSource.includes('availableActions: NormalizedFinanceAction[]')
    && formatterSource.includes('claimId: stringOf(summary?.claimId)')
    && formatterSource.includes('reconciliationId: stringOf(summary?.reconciliationId)')
    && formatterSource.includes('settlementId: stringOf(summary?.settlementId)'),
  'Finance section normalization should preserve action metadata and finance record ids.'
);

assert(
  actionPanelSource.includes('requestTaskClaim')
    && actionPanelSource.includes('reviewTaskClaim')
    && actionPanelSource.includes('requestEnterpriseInvoice')
    && actionPanelSource.includes('respondInvoice')
    && actionPanelSource.includes('reviewInvoice')
    && actionPanelSource.includes('rejectInvoiceRequest')
    && actionPanelSource.includes('respondTaskReconciliation')
    && actionPanelSource.includes('respondTaskSettlement'),
  'FinanceActionPanel should wire every backend finance action endpoint.'
);

assert(
  actionPanelSource.includes('request_invoice')
    && actionPanelSource.includes('respond_invoice')
    && actionPanelSource.includes('approve_invoice')
    && actionPanelSource.includes('reject_invoice')
    && actionPanelSource.includes('dispute_reconciliation')
    && actionPanelSource.includes('fail_settlement')
    && actionPanelSource.includes('retry_settlement'),
  'FinanceActionPanel should support invoice request/review plus dispute, failure, and retry settlement actions.'
);

assert(
  recordDetailsSource.includes('<FinanceActionPanel')
    && settlementSource.includes('<FinanceActionPanel')
    && recordDetailsSource.includes('setRefreshKey((value) => value + 1)')
    && settlementSource.includes('setRefreshKey((value) => value + 1)'),
  'Record and settlement pages should render finance action buttons and refresh after completion.'
);

console.log('Finance action surface contract passed.');
