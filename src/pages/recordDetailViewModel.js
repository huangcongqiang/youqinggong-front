import { formatDateLabel, formatDateRangeLabel, formatGrade, formatMoney } from '../services/recordFormatters.js';

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function stageLabelOf(record) {
  return record?.stage || record?.statusGroup || record?.status || '待同步';
}

function periodLabelOf(record) {
  return formatDateRangeLabel(record?.startAt || record?.startDate, record?.endAt || record?.endDate);
}

function traceSummary(item, fallback = '') {
  return item?.summary || item?.note || item?.title || item?.content || fallback;
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
  const audience = options.audience === 'talent' ? 'talent' : 'enterprise';
  const safeRecord = record && typeof record === 'object' ? record : null;
  const partnerLabel = audience === 'talent' ? '合作企业' : '合作人才';
  const gradeLabel = audience === 'talent' ? '企业评级' : '我的评级';

  if (!safeRecord) {
    return {
      anchor: {
        recordId: '',
        taskId: '',
        roomKey: ''
      },
      heroLead: '当前记录不存在或已被移除。',
      stageLabel: '待同步',
      periodLabel: '待同步',
      conclusionHeadline: '当前结论待同步',
      conclusionSummary: '这条记录会继续沉淀当前合作的结论、评分和关键留痕。',
      conclusionTags: [],
      currentStatusCards: [],
      statusNotes: [],
      detailAccordionItems: [],
      assetFiles: []
    };
  }

  const deliverables = listOf(safeRecord.sections?.deliverables);
  const noteItems = listOf(safeRecord.notes);
  const recordTags = listOf(safeRecord.sections?.taskTags || safeRecord.tags);
  const progressFeed = listOf(safeRecord.progressFeed);
  const aiReviewHistory = listOf(safeRecord.aiReviewHistory);
  const reviews = listOf(safeRecord.reviews);
  const confirmationHistory = listOf(safeRecord.sections?.confirmationHistory);
  const timeline = listOf(safeRecord.timeline);
  const disputeSummary = safeRecord.disputeSummary || safeRecord.sections?.disputeSummary || {};
  const latestProgress = progressFeed.length ? progressFeed[progressFeed.length - 1] : null;
  const latestAiReview = aiReviewHistory.length ? aiReviewHistory[aiReviewHistory.length - 1] : null;
  const latestReview = reviews.length ? reviews[0] : null;
  const stageLabel = stageLabelOf(safeRecord);
  const periodLabel = periodLabelOf(safeRecord);
  const amountValue = safeRecord.amountValue || formatMoney(safeRecord.amount);
  const gradeValue = safeRecord.rating?.value || formatGrade(safeRecord.myGrade);
  const partnerValue = safeRecord.counterpartName || safeRecord.partnerName || '待同步';

  let conclusionHeadline = `当前已进入${stageLabel}`;
  if (/完成|验收|结算/.test(stageLabel)) {
    conclusionHeadline = '这单合作已经形成结果';
  } else if (/协作|执行|进行/.test(stageLabel)) {
    conclusionHeadline = '这单合作正在持续推进';
  } else if (/待|确认|审核/.test(stageLabel)) {
    conclusionHeadline = '这单合作正在等待下一步确认';
  }

  const conclusionSummary =
    noteItems[0] ||
    latestProgress?.summary ||
    safeRecord.stageNote ||
    '这条记录会继续沉淀当前合作的金额、评分、确认变更和验收结果。';

  const statusNotes = [
    latestProgress ? `进展：${traceSummary(latestProgress, '已提交最新进展')}` : '',
    latestAiReview ? `AI 审核：${traceSummary(latestAiReview, '已生成审核建议')}` : '',
    latestReview ? `评分反馈：${traceSummary(latestReview, '已生成最新评分')}` : '',
    disputeSummary?.status && disputeSummary.status !== '未发起'
      ? `争议状态：${disputeSummary.status}${disputeSummary.nextStep ? ` · ${disputeSummary.nextStep}` : ''}`
      : ''
  ].filter(Boolean);

  const overviewItems = [
    `合作方：${partnerValue}`,
    `开始时间：${formatDateLabel(safeRecord.startAt || safeRecord.startDate)}`,
    `结束时间：${formatDateLabel(safeRecord.endAt || safeRecord.endDate)}`,
    `状态：${stageLabel}`,
    `${gradeLabel}：${gradeValue}`
  ];
  const latestTraceList = [
    latestProgress ? `进展：${traceSummary(latestProgress, '已提交最新进展')}` : '',
    latestAiReview ? `AI 审核：${traceSummary(latestAiReview, '已生成审核建议')}` : '',
    latestReview ? `评分反馈：${traceSummary(latestReview, '已生成最新评分')}` : ''
  ].filter(Boolean);

  return {
    anchor: resolveAnchor(safeRecord),
    heroLead:
      audience === 'talent'
        ? '先看这单合作的结论，再决定回聊天、执行协作还是验收页继续处理。'
        : '先看这单合作的结论，再决定回聊天、协作空间还是验收页继续处理。',
    stageLabel,
    periodLabel,
    conclusionHeadline,
    conclusionSummary,
    conclusionTags: [
      `金额 ${amountValue}`,
      `周期 ${periodLabel}`,
      `${gradeLabel} ${gradeValue}`,
      `${partnerLabel} ${partnerValue}`
    ].filter(Boolean).slice(0, 4),
    currentStatusCards: [
      {
        label: '金额与评级',
        value: `${amountValue} · ${gradeValue}`,
        note: `${gradeLabel} · ${safeRecord.amountNote || '本单合作金额'}`
      },
      {
        label: '周期与合作方',
        value: periodLabel,
        note: `${partnerLabel}：${partnerValue}`
      },
      {
        label: '当前阶段',
        value: stageLabel,
        note: safeRecord.stageNote || '后续节点会继续沉淀在这条记录里。'
      }
    ],
    statusNotes,
    detailAccordionItems: [
      {
        key: 'overview',
        badge: '补充信息',
        title: '合作概览',
        summary: safeRecord.task?.brief || safeRecord.detail || '这条记录会继续沉淀当前合作的背景和说明。',
        list: [...overviewItems, ...recordTags.map((tag) => `标签：${tag}`)]
      },
      {
        key: 'deliverables',
        badge: '交付范围',
        title: '交付与标签',
        summary: deliverables.length ? `共 ${deliverables.length} 项交付` : '当前还没有拆分出的交付项',
        list: deliverables.length ? [...deliverables] : ['当前没有单独拆出的交付件，任务说明会继续在聊天和协作里补齐。']
      },
      {
        key: 'latest',
        badge: '最新留痕',
        title: '进展与审核',
        summary: latestTraceList.length ? latestTraceList[0] : '当前还没有新的进展、审核或评分记录。',
        list: latestTraceList
      },
      {
        key: 'confirmations',
        badge: '确认历史',
        title: '任务确认变更',
        summary: confirmationHistory.length ? `共 ${confirmationHistory.length} 条确认变更` : '当前还没有确认变更记录',
        list: confirmationHistory.length
          ? confirmationHistory.map(
              (item) => `${item.time || '待同步'} · ${item.action || '任务确认'}${item.note ? `：${item.note}` : ''}`
            )
          : ['当前还没有额外的确认变更记录。']
      },
      {
        key: 'timeline',
        badge: '过程节点',
        title: '记录链路',
        summary: timeline.length ? `共 ${timeline.length} 个节点` : '当前还没有完整节点记录',
        list: timeline.length
          ? timeline.map((step) => `${step.time || '待同步'} · ${step.title || '节点'}${step.note ? `：${step.note}` : ''}`)
          : ['当前还没有完整的过程节点记录。']
      },
      {
        key: 'dispute',
        badge: '争议状态',
        title: '争议与风控',
        summary: disputeSummary?.status && disputeSummary.status !== '未发起'
          ? `当前争议状态：${disputeSummary.status}`
          : '当前没有争议或风控升级',
        list: disputeSummary?.status && disputeSummary.status !== '未发起'
          ? [
              `状态：${disputeSummary.status}`,
              disputeSummary.submittedAt ? `发起时间：${disputeSummary.submittedAt}` : '',
              disputeSummary.amount ? `争议金额：${disputeSummary.amount}` : '',
              disputeSummary.riskTicketId ? `风险工单：${disputeSummary.riskTicketId}` : '',
              disputeSummary.nextStep ? `下一步：${disputeSummary.nextStep}` : '',
              disputeSummary.note ? `说明：${disputeSummary.note}` : ''
            ].filter(Boolean)
          : ['当前没有争议，若对账或结算出现异议，平台会自动生成争议与风控工单。']
      }
    ],
    assetFiles: listOf(safeRecord.assetLibrary).map(normalizeAssetFile)
  };
}
