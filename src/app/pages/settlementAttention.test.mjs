import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const settlementSource = readFileSync(resolve(currentDir, 'SettlementView.tsx'), 'utf8');
const formatterSource = readFileSync(resolve(currentDir, '../services/workflowFormatters.ts'), 'utf8');

assert.match(
  settlementSource,
  /function isClosedFinanceStatus\(value: unknown\)/,
  'SettlementView should use a named helper for closed finance statuses.'
);

assert.match(
  settlementSource,
  /已批准\|已开票\|已完成对账/,
  'Settlement attention should treat approved claim, issued invoice, and reconciled states as closed.'
);

assert.match(
  settlementSource,
  /const isSettledFinance = financeSections\.some\(\(section\) => section\.key === "settlementSummary"/,
  'Settlement attention should detect final settlement completion.'
);

assert.match(
  settlementSource,
  /const pendingSections = isSettledFinance \? \[\] : financeSections\.filter\(\(section\) => !isClosedFinanceStatus\(section\.status\)\)/,
  'Settled finance records should not show stale intermediate next-step attention items.'
);

assert.match(
  settlementSource,
  /amountLabel: stringOf\(item\?\.amountLabel, "金额"\)/,
  'Settlement list records should preserve the backend amount label.'
);

assert.match(
  settlementSource,
  /record\.amountLabel/,
  'Settlement list should show whether the row amount is budget, contract, or payable amount.'
);

assert.match(
  formatterSource,
  /已批准\|已开票\|已完成对账\|COMPLETED\|SETTLED/,
  'Finance status badges should style completed intermediate states as success.'
);

assert.match(
  formatterSource,
  /争议\|异议\|FAILED/,
  'Finance status badges should style disputed reconciliation and dispute states as danger.'
);

console.log('Settlement attention contract passed.');
