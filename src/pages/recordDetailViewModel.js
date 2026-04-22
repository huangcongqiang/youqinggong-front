import { formatDateLabel, formatDateRangeLabel, formatGrade, formatMoney } from '../services/recordFormatters.js';
import { financeActionLabel, normalizeFinanceActionCode } from './settlementHelpers.js';
import { translateText } from '../utils/uiLocale.js';

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function translateRecordDetailStatus(value, fallback = '待处理') {
  const raw = String(value || '').trim();
  if (!raw) {
    return translateText(fallback);
  }

  return translateText(
    {
      未发起: '未开始',
      待验收: '待验收',
      待审批: '待审批',
      待请款: '待请款',
      待开票: '待开票',
      待对账: '待对账',
      待结算: '待结算',
      待处理: '待处理',
      待开始: '未开始',
      执行中: '进行中',
      进行中: '进行中',
      已完成: '已完成',
      完成: '已完成',
      已结算: '已结算',
      已通过: '已通过',
      已驳回: '已驳回',
      已付款: '已付款',
      已发起: '已发起',
      争议处理中: '争议处理中'
    }[raw] || raw
  );
}

function latestOf(value, strategy = 'last') {
  const items = listOf(value);
  if (!items.length) {
    return null;
  }
  return strategy === 'first' ? items[0] : items[items.length - 1];
}

function resolveStamp(value) {
  const text = String(value || '').trim();
  if (!text) {
    return null;
  }

  const stamp = Date.parse(text);
  return Number.isNaN(stamp) ? null : stamp;
}

function sortLatestFirst(items, getStamp) {
  return listOf(items)
    .map((item, index) => ({
      item,
      index,
      stamp: getStamp(item)
    }))
    .sort((a, b) => {
      if (a.stamp == null && b.stamp == null) {
        return a.index - b.index;
      }

      if (a.stamp == null) {
        return 1;
      }

      if (b.stamp == null) {
        return -1;
      }

      if (a.stamp !== b.stamp) {
        return b.stamp - a.stamp;
      }

      return a.index - b.index;
    })
    .map(({ item }) => item);
}

function resolveProgressStamp(item) {
  return resolveStamp(
    item?.updatedAt ||
      item?.updated_at ||
      item?.createdAt ||
      item?.created_at ||
      item?.submittedAt ||
      item?.time
  );
}

function resolveAssetStamp(asset) {
  return resolveStamp(
    asset?.updatedAt ||
      asset?.updated_at ||
      asset?.createdAt ||
      asset?.created_at ||
      asset?.submittedAt ||
      asset?.time
  );
}

function collectFinanceActionCodes(source) {
  const list = Array.isArray(source) ? source : [];
  return Array.from(
    new Set(
      list
        .flatMap((item) => {
          if (typeof item === 'string') {
            return [normalizeFinanceActionCode(item)];
          }

          if (item && typeof item === 'object') {
            return [
              normalizeFinanceActionCode(
                item.code || item.action || item.value || item.name || item.type || item.key || item.label
              )
            ];
          }

          return [];
        })
        .filter(Boolean)
    )
  );
}

function makeFinanceSection({
  key,
  badge,
  title,
  summary,
  note,
  status,
  meta,
  actionCodes,
  availableActionCodes
}) {
  const wantedCodes = listOf(actionCodes).map((item) => normalizeFinanceActionCode(item)).filter(Boolean);
  const actions = listOf(availableActionCodes)
    .filter((code) => wantedCodes.includes(code))
    .map((code) => ({
      code,
      label: financeActionLabel(code)
    }));

  return {
    key,
    badge: translateText(badge),
    title: translateText(title),
    summary,
    note,
    status,
    meta: listOf(meta).filter(Boolean),
    actions
  };
}

function resolveOverviewText(record, fallbackLead = '') {
  return record?.task?.brief || record?.summary || record?.detail || fallbackLead;
}

function resolveStageLabel(record) {
  return translateRecordDetailStatus(record?.stage || record?.statusGroup || record?.status, '待处理');
}

function resolvePartnerName(record) {
  return record?.counterpartName || record?.partnerName || '';
}

function normalizeRecordNote(note, options = {}) {
  const text = String(note || '').trim();
  if (!text) {
    return '';
  }

  if (!text.startsWith('合作方：')) {
    return text;
  }

  const counterpart = text.slice('合作方：'.length).trim();
  if (!counterpart) {
    return text;
  }

  const audience = String(options.audience || '').trim();
  const statusKey = String(options.statusKey || '').trim().toUpperCase();
  const hasCollaboration = Boolean(options.hasCollaboration);
  const isApplicationStage = !hasCollaboration && (statusKey === 'MATCHING' || statusKey === 'AI_ANALYZING');

  if (isApplicationStage) {
    if (audience === 'talent') {
      return `发布方：${counterpart}`;
    }

    if (audience === 'enterprise') {
      return `申请人才：${counterpart}`;
    }

    return `申请对象：${counterpart}`;
  }

  if (audience === 'talent') {
    return `企业方：${counterpart}`;
  }

  if (audience === 'enterprise') {
    return `人才方：${counterpart}`;
  }

  return text;
}

function resolveRecordNoteCard(normalizedNote) {
  const text = String(normalizedNote || '').trim();
  if (!text) {
    return null;
  }

  const separatorIndexes = ['：', ':']
    .map((separator) => text.indexOf(separator))
    .filter((index) => index > 0);
  const separatorIndex = separatorIndexes.length ? Math.min(...separatorIndexes) : -1;
  if (separatorIndex === -1) {
    return { label: translateText('Record note'), text };
  }

  const label = text.slice(0, separatorIndex).trim();
  const value = text.slice(separatorIndex + 1).trim();
  if (!label || !value || label.length > 12) {
    return { label: translateText('Record note'), text };
  }

  return {
    label: translateText(label),
    text: value
  };
}

function resolveKeyResults(record, options = {}) {
  const items = [];
  const progressFeed = listOf(record?.progressFeed).length ? listOf(record?.progressFeed) : listOf(record?.sections?.progressFeed);
  const latestProgress = latestOf(sortLatestFirst(progressFeed, resolveProgressStamp), 'first');
  const aiReviewFeed = listOf(record?.aiReviewHistory).length ? listOf(record?.aiReviewHistory) : listOf(record?.sections?.aiReviewHistory);
  const latestAiReview = latestOf(sortLatestFirst(aiReviewFeed, resolveAssetStamp), 'first');
  const latestReview = latestOf(record?.reviews, 'first');
  const claimSummary = record?.claimSummary || record?.sections?.claimSummary || {};
  const invoiceSummary = record?.invoiceSummary || record?.sections?.invoiceSummary || {};
  const reconciliationSummary = record?.reconciliationSummary || record?.sections?.reconciliationSummary || {};
  const settlementSummary = record?.settlementSummary || record?.sections?.settlementSummary || {};
  const disputeSummary = record?.disputeSummary || record?.sections?.disputeSummary || {};

  listOf(record?.notes).forEach((note) => {
    const normalizedNote = normalizeRecordNote(note, {
      audience: options.audience,
      statusKey: record?.statusKey || record?.statusGroup || record?.status,
      hasCollaboration: Boolean(record?.roomKey || record?.task?.roomKey)
    });
    if (!normalizedNote) {
      return;
    }
    const noteCard = resolveRecordNoteCard(normalizedNote);
    if (noteCard) {
      items.push(noteCard);
    }
  });

  if (latestProgress) {
    items.push({
      label: translateText('最新进展'),
      text: latestProgress.summary || latestProgress.stage || '已有最新工作更新。'
    });
  }

  if (latestAiReview) {
    items.push({
      label: translateText('助手摘要'),
      text: latestAiReview.summary || latestAiReview.note || latestAiReview.title || '最新助手摘要已生成。'
    });
  }

  if (latestReview) {
    items.push({
      label: translateText('验收反馈'),
      text: latestReview.content || latestReview.note || '最新评级已经记录。'
    });
  }

  appendSummaryResult(items, '请款', claimSummary);
  appendSummaryResult(items, '发票', invoiceSummary);
  appendSummaryResult(items, '对账', reconciliationSummary);
  appendSummaryResult(items, '结算', settlementSummary);

  if (disputeSummary?.status && disputeSummary.status !== '未发起') {
    items.push({
      label: translateText('争议处理'),
      text:
        disputeSummary.nextStep ||
        disputeSummary.note ||
        `当前争议状态：${translateRecordDetailStatus(disputeSummary.status, '待处理')}`
    });
  }

  return items;
}

function resolveFinanceSections(record, availableActionCodes) {
  const claimSummary = record?.claimSummary || record?.sections?.claimSummary || {};
  const invoiceSummary = record?.invoiceSummary || record?.sections?.invoiceSummary || {};
  const reconciliationSummary = record?.reconciliationSummary || record?.sections?.reconciliationSummary || {};
  const settlementSummary = record?.settlementSummary || record?.sections?.settlementSummary || {};
  const disputeSummary = record?.disputeSummary || record?.sections?.disputeSummary || {};

  return [
    makeFinanceSection({
      key: 'claim',
      badge: '请款',
      title: '请款申请',
      summary: String(claimSummary?.summary || claimSummary?.note || '验收完成后即可提交请款。').trim(),
      note: String(claimSummary?.nextStep || claimSummary?.decisionNote || claimSummary?.note || '').trim(),
      status: translateRecordDetailStatus(claimSummary?.status || '待处理', '待处理'),
      meta: [
        claimSummary?.amount ? `金额 ${claimSummary.amount}` : '',
        claimSummary?.requestedAt ? `提交于 ${claimSummary.requestedAt}` : '',
        claimSummary?.payoutRatio ? `比例 ${claimSummary.payoutRatio}` : ''
      ],
      actionCodes: ['CLAIM_REQUEST', 'CLAIM_APPROVE', 'CLAIM_REJECT'],
      availableActionCodes
    }),
    makeFinanceSection({
      key: 'invoice',
      badge: '发票',
      title: '发票申请',
      summary: String(invoiceSummary?.summary || invoiceSummary?.note || '请款通过后即可提交发票。').trim(),
      note: String(invoiceSummary?.nextStep || invoiceSummary?.decisionNote || invoiceSummary?.note || '').trim(),
      status: translateRecordDetailStatus(invoiceSummary?.status || '待处理', '待处理'),
      meta: [
        invoiceSummary?.amount ? `金额 ${invoiceSummary.amount}` : '',
        invoiceSummary?.submittedAt ? `提交于 ${invoiceSummary.submittedAt}` : '',
        invoiceSummary?.invoiceType ? `类型 ${invoiceSummary.invoiceType}` : ''
      ],
      actionCodes: ['INVOICE_SUBMIT'],
      availableActionCodes
    }),
    makeFinanceSection({
      key: 'reconciliation',
      badge: '对账',
      title: '对账',
      summary: String(reconciliationSummary?.summary || reconciliationSummary?.note || '发票提交后即可进入对账。').trim(),
      note: String(reconciliationSummary?.nextStep || reconciliationSummary?.decisionNote || reconciliationSummary?.note || '').trim(),
      status: translateRecordDetailStatus(reconciliationSummary?.status || '待处理', '待处理'),
      meta: [
        reconciliationSummary?.amount ? `金额 ${reconciliationSummary.amount}` : '',
        reconciliationSummary?.submittedAt ? `提交于 ${reconciliationSummary.submittedAt}` : '',
        reconciliationSummary?.updatedAt ? `更新于 ${reconciliationSummary.updatedAt}` : ''
      ],
      actionCodes: ['RECONCILIATION_CONFIRM', 'RECONCILIATION_DISPUTE'],
      availableActionCodes
    }),
    makeFinanceSection({
      key: 'settlement',
      badge: '结算',
      title: '执行结算',
      summary: String(settlementSummary?.summary || settlementSummary?.note || '对账完成后即可进入结算。').trim(),
      note: String(settlementSummary?.nextStep || settlementSummary?.decisionNote || settlementSummary?.note || '').trim(),
      status: translateRecordDetailStatus(settlementSummary?.status || '待处理', '待处理'),
      meta: [
        settlementSummary?.amount ? `金额 ${settlementSummary.amount}` : '',
        settlementSummary?.payoutRatio ? `比例 ${settlementSummary.payoutRatio}` : '',
        settlementSummary?.settledAt ? `结算于 ${settlementSummary.settledAt}` : ''
      ],
      actionCodes: ['SETTLEMENT_EXECUTE', 'SETTLEMENT_FAIL'],
      availableActionCodes
    }),
    makeFinanceSection({
      key: 'dispute',
      badge: '争议',
      title: '争议与风险',
      summary: disputeSummary?.status && disputeSummary.status !== '未发起'
        ? `当前争议状态：${translateRecordDetailStatus(disputeSummary.status, '待处理')}`
        : '如果对账存在争议，平台会继续发起争议和风险工单。',
      note: String(disputeSummary?.nextStep || disputeSummary?.note || '').trim(),
      status: translateRecordDetailStatus(disputeSummary?.status || '未发起', '未开始'),
      meta: [
        disputeSummary?.amount ? `金额 ${disputeSummary.amount}` : '',
        disputeSummary?.submittedAt ? `发起于 ${disputeSummary.submittedAt}` : '',
        disputeSummary?.riskTicketId ? `工单 ${disputeSummary.riskTicketId}` : ''
      ],
      actionCodes: ['RECONCILIATION_DISPUTE', 'SETTLEMENT_FAIL'],
      availableActionCodes
    })
  ];
}

function appendSummaryResult(items, label, summary) {
  const status = String(summary?.status || '').trim();
  const amount = String(summary?.amount || '').trim();
  const nextStep = String(summary?.nextStep || summary?.note || '').trim();
  if (!status || status === '未发起' || status === '未开始') {
    return;
  }
  items.push({
    label: translateText(label),
    text: [translateRecordDetailStatus(status, '待处理'), amount, nextStep].filter(Boolean).join(' · ')
  });
}

function normalizeAssetFile(asset) {
  if (typeof asset === 'string') {
    const value = asset.trim();
    return {
      name: value,
      type: '',
      downloadHref: value
    };
  }

  return {
    ...asset,
    name: String(
      asset?.name ||
        asset?.fileName ||
        asset?.filename ||
        asset?.label ||
        asset?.title ||
        asset?.downloadHref ||
        asset?.downloadUrl ||
        asset?.previewUrl ||
        asset?.url ||
        asset?.path ||
        ''
    ).trim(),
    type: String(asset?.type || asset?.fileType || asset?.mimeType || '').trim(),
    downloadHref: String(
      asset?.downloadUrl ||
        asset?.previewUrl ||
        asset?.url ||
        asset?.href ||
        asset?.fileUrl ||
        asset?.path ||
        ''
    ).trim()
  };
}

function normalizeProgressItem(item, index = 0) {
  const attachments = sortLatestFirst(listOf(item?.attachments).length ? listOf(item?.attachments) : listOf(item?.attachmentFiles), resolveAssetStamp).map(normalizeAssetFile);
  const progressText = String(item?.progress || item?.percent || item?.completion || item?.status || '').trim();
  return {
    key: String(item?.id || item?.progressId || item?.time || `progress-${index}`),
    time: String(item?.time || '').trim(),
    summary: String(item?.summary || item?.note || item?.content || item?.description || '已有工作更新。').trim(),
    description: String(item?.description || item?.detail || item?.content || '').trim(),
    progress: progressText,
    stage: String(item?.stage || '').trim(),
    completion: String(item?.completion || '').trim(),
    status: String(item?.status || '').trim(),
    aiReviewSummary: String(
      item?.aiReviewSummary ||
        item?.aiReview?.summary ||
        item?.aiReview?.note ||
        item?.aiReview?.result ||
        item?.reviewSummary ||
        ''
    ).trim(),
    attachments
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
      stageLabel: '待处理',
      partnerName: '',
      amountValue: formatMoney(0),
      amountNote: '合同金额',
      startDateLabel: formatDateLabel(''),
      endDateLabel: formatDateLabel(''),
      dateRangeLabel: formatDateRangeLabel('', ''),
      ratingValue: formatGrade(''),
      summaryTags: [],
      timelineItems: [],
      deliverables: [],
      assetFiles: [],
      progressItems: [],
      financeSections: [],
      availableActionCodes: [],
      keyResults: [],
      confirmationHistory: []
    };
  }

  const progressFeed = listOf(safeRecord.progressFeed).length ? listOf(safeRecord.progressFeed) : listOf(safeRecord.sections?.progressFeed);
  const assetLibrary = listOf(safeRecord.assetLibrary).length ? listOf(safeRecord.assetLibrary) : listOf(safeRecord.sections?.assetLibrary);
  const availableActionCodes = collectFinanceActionCodes([
    ...listOf(options.availableActions),
    ...listOf(safeRecord.summary?.availableActions),
    ...listOf(safeRecord.sections?.availableActions),
    ...listOf(safeRecord.claimSummary?.availableActions || safeRecord.sections?.claimSummary?.availableActions),
    ...listOf(safeRecord.invoiceSummary?.availableActions || safeRecord.sections?.invoiceSummary?.availableActions),
    ...listOf(safeRecord.reconciliationSummary?.availableActions || safeRecord.sections?.reconciliationSummary?.availableActions),
    ...listOf(safeRecord.settlementSummary?.availableActions || safeRecord.sections?.settlementSummary?.availableActions),
    ...listOf(safeRecord.disputeSummary?.availableActions || safeRecord.sections?.disputeSummary?.availableActions)
  ]);
  const startAt = safeRecord.startAt || safeRecord.startDate;
  const endAt = safeRecord.endAt || safeRecord.endDate;

  return {
    anchor: resolveAnchor(safeRecord),
    overviewText: resolveOverviewText(safeRecord, fallbackLead),
    stageLabel: resolveStageLabel(safeRecord),
    partnerName: resolvePartnerName(safeRecord),
    amountValue: safeRecord.amountValue || formatMoney(safeRecord.amount),
    amountNote: safeRecord.amountNote || '合同金额',
    startDateLabel: formatDateLabel(startAt),
    endDateLabel: formatDateLabel(endAt),
    dateRangeLabel: formatDateRangeLabel(startAt, endAt),
    ratingValue: safeRecord.rating?.value || formatGrade(safeRecord.myGrade),
    summaryTags: listOf(safeRecord.sections?.taskTags || safeRecord.tags),
    timelineItems: listOf(safeRecord.timeline),
    deliverables: listOf(safeRecord.sections?.deliverables),
    assetFiles: sortLatestFirst(assetLibrary, resolveAssetStamp).map(normalizeAssetFile),
    progressItems: sortLatestFirst(progressFeed, resolveProgressStamp).map(normalizeProgressItem),
    financeSections: resolveFinanceSections(safeRecord, availableActionCodes),
    availableActionCodes,
    keyResults: resolveKeyResults(safeRecord, options),
    confirmationHistory: listOf(safeRecord.sections?.confirmationHistory).length
      ? listOf(safeRecord.sections?.confirmationHistory)
      : listOf(safeRecord.reviews)
  };
}
