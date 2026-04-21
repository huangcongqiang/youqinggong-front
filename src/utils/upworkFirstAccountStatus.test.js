import assert from 'node:assert';
import { buildUpworkFirstAccountStatus } from './upworkFirstAccountStatus.js';

const restrictedEnterprise = buildUpworkFirstAccountStatus({
  email: 'owner@example.com',
  mobile: '13800000001',
  approvalStatus: 'WAITING_MATERIALS',
  tradingRestrictionMessage: '企业基础信息已提交，请先补交企业材料。'
}, 'enterprise');

assert.equal(restrictedEnterprise.items.length, 3);
assert.equal(restrictedEnterprise.items.find((item) => item.key === 'billing')?.state, 'blocked');
assert.equal(restrictedEnterprise.hasBlockingItems, true);
assert.equal(restrictedEnterprise.items.find((item) => item.key === 'billing')?.label, '账单状态');
assert.equal(restrictedEnterprise.items.find((item) => item.key === 'billing')?.actionLabel, '继续完善设置');
assert.equal(restrictedEnterprise.summaryTitle, '当前账号还有待完善项。');

const talent = buildUpworkFirstAccountStatus({
  email: '',
  mobile: '13800000002',
  approvalStatus: 'APPROVED',
  tradingRestrictionMessage: ''
}, 'talent');

assert.equal(talent.items.length, 2);
assert.equal(talent.items.find((item) => item.key === 'email')?.state, 'action-required');
assert.equal(talent.items.find((item) => item.key === 'phone')?.state, 'clear');
assert.equal(talent.items.find((item) => item.key === 'email')?.actionLabel, '继续完善设置');
assert.equal(talent.items.find((item) => item.key === 'phone')?.value, '手机号已填写');
assert.equal(talent.items.find((item) => item.key === 'email')?.note, '当前账号还没有填写邮箱。');

const clearEnterprise = buildUpworkFirstAccountStatus({
  email: 'contact@example.com',
  mobile: '13800000003',
  approvalStatus: 'APPROVED',
  tradingRestrictionMessage: ''
}, 'enterprise');

assert.equal(clearEnterprise.items.find((item) => item.key === 'billing')?.state, 'gap');
assert.equal(clearEnterprise.summaryTone, 'note');
assert.equal(clearEnterprise.items.find((item) => item.key === 'billing')?.actionLabel, '查看账单状态');
assert.equal(clearEnterprise.items.find((item) => item.key === 'billing')?.disabled, false);
assert.equal(clearEnterprise.summaryTitle, '基础信息已就绪，还有一项待确认。');

console.log('upworkFirstAccountStatus tests passed');
