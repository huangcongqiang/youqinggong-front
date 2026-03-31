import assert from 'assert';
import { buildRecordDetailViewModel } from './recordDetailViewModel.js';

const sampleRecord = {
  id: 'record-101',
  taskId: 'task-101',
  roomKey: 'room-101',
  amount: 15200,
  startDate: '2026-03-14',
  endDate: '2026-03-28',
  myGrade: 'A',
  stage: '已完成',
  partnerName: '星河智能',
  notes: ['企业已经完成终版确认。'],
  progressFeed: [{ summary: '最后一轮进展已同步。' }],
  aiReviewHistory: [{ note: 'AI 审核建议已通过。' }],
  reviews: [{ content: '企业给出 A 级反馈。' }],
  disputeSummary: {
    status: '处理中',
    nextStep: '等待平台继续核对对账差异。'
  },
  sections: {
    taskTags: ['活动页', '品牌交付'],
    deliverables: ['主 KV', '报名弹窗'],
    confirmationHistory: [{ time: '03.26', action: '任务确认', note: '进入验收' }]
  },
  timeline: [{ time: '03.14', title: '接单', note: '开始执行' }],
  assetLibrary: [{ name: '终稿.pdf', previewUrl: 'https://example.com/final.pdf' }]
};

const detail = buildRecordDetailViewModel(sampleRecord, {
  audience: 'talent'
});

assert.strictEqual(detail.anchor.recordId, 'record-101');
assert.strictEqual(detail.anchor.taskId, 'task-101');
assert.strictEqual(detail.anchor.roomKey, 'room-101');
assert.strictEqual(detail.periodLabel, '03.14 - 03.28');
assert.strictEqual(detail.currentStatusCards[0].value, '¥15,200 · A 级');
assert.strictEqual(detail.conclusionTags[2], '企业评级 A 级');
assert.strictEqual(detail.assetFiles[0].downloadHref, 'https://example.com/final.pdf');
assert.strictEqual(detail.statusNotes[3], '争议状态：处理中 · 等待平台继续核对对账差异。');
assert.strictEqual(detail.detailAccordionItems.length, 6);

const emptyDetail = buildRecordDetailViewModel(null, {
  audience: 'enterprise'
});

assert.strictEqual(emptyDetail.anchor.taskId, '');
assert.strictEqual(emptyDetail.conclusionHeadline, '当前结论待同步');
assert.strictEqual(emptyDetail.assetFiles.length, 0);

console.log('recordDetailViewModel H5 passed');
