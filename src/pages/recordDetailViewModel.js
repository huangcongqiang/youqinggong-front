import { formatDateLabel, formatDateRangeLabel, formatGrade, formatMoney } from '../services/recordFormatters.js';

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function latestOf(value, strategy = 'last') {
  const items = listOf(value);
  if (!items.length) {
    return null;
  }
  return strategy === 'first' ? items[0] : items[items.length - 1];
}

function resolveOverviewText(record, fallbackLead = '') {
  return record?.task?.brief || record?.summary || record?.detail || fallbackLead;
}

function resolveStageLabel(record) {
  return record?.stage || record?.statusGroup || record?.status || '待同步';
}

function resolvePartnerName(record) {
  return record?.counterpartName || record?.partnerName || '';
}

function resolveKeyResults(record) {
  const items = [];
  const latestProgress = latestOf(record?.progressFeed);
  const latestAiReview = latestOf(record?.aiReviewHistory);
  const latestReview = latestOf(record?.reviews, 'first');
  const disputeSummary = record?.disputeSummary || record?.sections?.disputeSummary || {};

  listOf(record?.notes).forEach((note) => {
    items.push({ label: '记录备注', text: note });
  });

  if (latestProgress) {
    items.push({
      label: '最新进展',
      text: latestProgress.summary || latestProgress.stage || '已提交最新进展'
    });
  }

  if (latestAiReview) {
    items.push({
      label: 'AI 审核',
      text: latestAiReview.summary || latestAiReview.note || latestAiReview.title || '已生成审核建议'
    });
  }

  if (latestReview) {
    items.push({
      label: '评分反馈',
      text: latestReview.content || latestReview.note || '已生成最新评分'
    });
  }

  if (disputeSummary?.status && disputeSummary.status !== '未发起') {
    items.push({
      label: '争议处理',
      text: disputeSummary.nextStep || disputeSummary.note || `当前争议状态：${disputeSummary.status}`
    });
  }

  return items;
}

function normalizeAssetFile(asset) {
  return {
    ...asset,
    downloadHref: String(asset?.downloadUrl || asset?.previewUrl || '').trim()
  };
}

function resolveAnchor(record) {
  return {
    recordId: String(record?.id || record?.recordId || '').trim(),
    taskId: String(record?.taskId || record?.task?.id || '').trim(),
    roomKey: String(record?.roomKey || record?.task?.roomKey || '').trim()
  };
}

export function buildRecordDetailViewModel(record, options = {}) {
  const safeRecord = record && typeof record === 'object' ? record : null;
  const fallbackLead = String(options.fallbackLead || '').trim();

  if (!safeRecord) {
    return {
      anchor: {
        recordId: '',
        taskId: '',
        roomKey: ''
      },
      overviewText: fallbackLead,
      stageLabel: '待同步',
      partnerName: '',
      amountValue: formatMoney(0),
      amountNote: '本单合作金额',
      startDateLabel: formatDateLabel(''),
      endDateLabel: formatDateLabel(''),
      dateRangeLabel: formatDateRangeLabel('', ''),
      ratingValue: formatGrade(''),
      summaryTags: [],
      timelineItems: [],
      deliverables: [],
      assetFiles: [],
      keyResults: [],
      confirmationHistory: []
    };
  }

  const startAt = safeRecord.startAt || safeRecord.startDate;
  const endAt = safeRecord.endAt || safeRecord.endDate;

  return {
    anchor: resolveAnchor(safeRecord),
    overviewText: resolveOverviewText(safeRecord, fallbackLead),
    stageLabel: resolveStageLabel(safeRecord),
    partnerName: resolvePartnerName(safeRecord),
    amountValue: safeRecord.amountValue || formatMoney(safeRecord.amount),
    amountNote: safeRecord.amountNote || '本单合作金额',
    startDateLabel: formatDateLabel(startAt),
    endDateLabel: formatDateLabel(endAt),
    dateRangeLabel: formatDateRangeLabel(startAt, endAt),
    ratingValue: safeRecord.rating?.value || formatGrade(safeRecord.myGrade),
    summaryTags: listOf(safeRecord.sections?.taskTags || safeRecord.tags),
    timelineItems: listOf(safeRecord.timeline),
    deliverables: listOf(safeRecord.sections?.deliverables),
    assetFiles: listOf(safeRecord.assetLibrary).map(normalizeAssetFile),
    keyResults: resolveKeyResults(safeRecord),
    confirmationHistory: listOf(safeRecord.sections?.confirmationHistory)
  };
}
