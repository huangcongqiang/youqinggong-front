import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const currentDir = dirname(fileURLToPath(import.meta.url));
const apiSource = readFileSync(resolve(currentDir, 'api.ts'), 'utf8');

assert(
  apiSource.includes('fetchWithTimeout') && apiSource.includes('AbortController') && apiSource.includes('VITE_API_TIMEOUT_MS'),
  'api.ts should wrap fetch with an AbortController timeout so stalled production APIs do not hang login or mobile rendering.'
);

[
  'generateAiBioTemplates',
  'getAiTaskMonitor',
  'getAlipayConfigStatus',
  'getAlipayMembershipInfo',
  'createAlipayMembershipPurchase',
  'createAlipayRecharge',
  'createAlipayTaskPublishPayment',
  'getAlipayOrder',
  'getMembershipPrices',
  'getInvoiceProviderStatus',
  'getInvoiceDetail',
  'getInvoiceHistory',
  'getInvoiceReviewingCount',
  'getInvoiceTemplate',
  'getPendingInvoices',
  'parseResumeText',
  'parseResumeFile',
  'rejectInvoiceRequest',
  'requestEnterpriseInvoice',
  'respondInvoice',
  'reviewInvoice',
  'saveInvoiceTemplate',
  'sendAiProgressReminder',
  'getTalentWithdrawalData'
].forEach((name) => {
  assert(
    new RegExp(`export function ${name}\\b`).test(apiSource),
    `${name} should be exported from api.ts`
  );
});

[
  '/ai/parse-resume',
  '/ai/parse-resume-file',
  '/ai/generate-bio',
  '/ai/task-monitor/',
  '/ai/send-reminder/',
  '/invoice-template',
  '/tasks/',
  '/invoices/pending',
  '/invoices/history',
  '/invoices/reviewing-count',
  '/talent/withdrawals',
  '/alipay/config/status',
  '/alipay/membership/info',
  '/alipay/membership/purchase',
  '/alipay/recharge/create',
  '/alipay/task-publish/create',
  '/alipay/orders/',
  '/membership/prices',
  '/invoices/provider/status'
].forEach((route) => {
  assert(apiSource.includes(route), `${route} should be wired in api.ts`);
});
