import assert from 'assert';
import { buildRecordDetailViewModel } from './recordDetailViewModel.js';
import { setUiLocale } from '../utils/uiLocale.js';

setUiLocale('zh');

const sampleRecord = {
  id: 'record-001',
  taskId: 'task-001',
  roomKey: 'room-001',
  amount: 24000,
  startDate: '2026-03-10',
  endDate: '2026-03-19',
  myGrade: 'S',
  stage: '进行中',
  counterpartName: '林昭',
  notes: ['合作方：林昭', '当前已经进入二次提审。'],
  progressFeed: [{ stage: '交互收尾', summary: '最新进展已提交。' }],
  aiReviewHistory: [{ summary: 'AI 认为当前交付质量稳定。' }],
  reviews: [{ content: '企业已给出正向评价。' }],
  disputeSummary: {
    status: '处理中',
    nextStep: '等待平台继续核对对账差异。'
  },
  sections: {
    taskTags: ['H5', '交付闭环'],
    deliverables: ['首页首版', '报名表单'],
    confirmationHistory: [{ time: '03.18', action: '修改确认', note: '补充表单校验' }]
  },
  timeline: [{ time: '03.10', title: '发起协作', note: '进入执行流程' }],
  assetLibrary: [{ name: '首页草图.png', downloadUrl: 'https://example.com/a.png' }]
};

const detail = buildRecordDetailViewModel(sampleRecord, {
  fallbackLead: '记录详情回退文案',
  audience: 'talent'
});

assert.strictEqual(detail.anchor.recordId, 'record-001');
assert.strictEqual(detail.anchor.taskId, 'task-001');
assert.strictEqual(detail.anchor.roomKey, 'room-001');
assert.strictEqual(detail.amountValue, '¥24,000');
assert.strictEqual(detail.dateRangeLabel, '03.10 - 03.19');
assert.strictEqual(detail.ratingValue, 'S 级');
assert.strictEqual(detail.stageLabel, '进行中');
assert.strictEqual(detail.partnerName, '林昭');
assert.strictEqual(detail.keyResults[0].label, '企业方');
assert.strictEqual(detail.keyResults[0].text, '林昭');
assert.strictEqual(detail.keyResults.length, 6);
assert.strictEqual(detail.keyResults[5].label, '争议处理');

const applicationStageDetail = buildRecordDetailViewModel({
  ...sampleRecord,
  roomKey: '',
  statusKey: 'MATCHING',
  stage: '匹配人才'
}, {
  fallbackLead: '记录详情回退文案',
  audience: 'talent'
});

assert.strictEqual(applicationStageDetail.keyResults[0].label, '发布方');
assert.strictEqual(applicationStageDetail.keyResults[0].text, '林昭');
assert.strictEqual(detail.assetFiles[0].downloadHref, 'https://example.com/a.png');

const emptyDetail = buildRecordDetailViewModel(null, {
  fallbackLead: '记录详情回退文案'
});

assert.strictEqual(emptyDetail.anchor.recordId, '');
assert.strictEqual(emptyDetail.overviewText, '记录详情回退文案');
assert.strictEqual(emptyDetail.dateRangeLabel, '待同步');

console.log('recordDetailViewModel PC passed');
