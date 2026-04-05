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

function normalizeFinanceActionCode(value) {
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

function financeActionLabel(code) {
  return (
    {
      CLAIM_REQUEST: '发起请款',
      CLAIM_APPROVE: '审批请款',
      CLAIM_REJECT: '驳回请款',
      INVOICE_SUBMIT: '提交开票',
      RECONCILIATION_CONFIRM: '确认对账',
      RECONCILIATION_DISPUTE: '发起争议',
      SETTLEMENT_EXECUTE: '执行结算',
      SETTLEMENT_FAIL: '结算失败'
    }[normalizeFinanceActionCode(code)] || String(code || '').trim()
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
    badge,
    title,
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
  return record?.stage || record?.statusGroup || record?.status || '待同步';
}

function resolvePartnerName(record) {
  return record?.counterpartName || record?.partnerName || '';
}

function resolveKeyResults(record) {
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

  appendSummaryResult(items, '请款进度', claimSummary);
  appendSummaryResult(items, '开票进度', invoiceSummary);
  appendSummaryResult(items, '对账进度', reconciliationSummary);
  appendSummaryResult(items, '结算进度', settlementSummary);

  if (disputeSummary?.status && disputeSummary.status !== '未发起') {
    items.push({
      label: '争议处理',
      text: disputeSummary.nextStep || disputeSummary.note || `当前争议状态：${disputeSummary.status}`
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
      summary: String(claimSummary?.summary || claimSummary?.note || '任务闭环后可发起请款。').trim(),
      note: String(claimSummary?.nextStep || claimSummary?.decisionNote || claimSummary?.note || '').trim(),
      status: String(claimSummary?.status || '待同步').trim(),
      meta: [
        claimSummary?.amount ? `金额 ${claimSummary.amount}` : '',
        claimSummary?.requestedAt ? `提交 ${claimSummary.requestedAt}` : '',
        claimSummary?.payoutRatio ? `比例 ${claimSummary.payoutRatio}` : ''
      ],
      actionCodes: ['CLAIM_REQUEST', 'CLAIM_APPROVE', 'CLAIM_REJECT'],
      availableActionCodes
    }),
    makeFinanceSection({
      key: 'invoice',
      badge: '开票',
      title: '开票申请',
      summary: String(invoiceSummary?.summary || invoiceSummary?.note || '请款批准后可提交开票。').trim(),
      note: String(invoiceSummary?.nextStep || invoiceSummary?.decisionNote || invoiceSummary?.note || '').trim(),
      status: String(invoiceSummary?.status || '待同步').trim(),
      meta: [
        invoiceSummary?.amount ? `金额 ${invoiceSummary.amount}` : '',
        invoiceSummary?.submittedAt ? `提交 ${invoiceSummary.submittedAt}` : '',
        invoiceSummary?.invoiceType ? `类型 ${invoiceSummary.invoiceType}` : ''
      ],
      actionCodes: ['INVOICE_SUBMIT'],
      availableActionCodes
    }),
    makeFinanceSection({
      key: 'reconciliation',
      badge: '对账',
      title: '对账确认',
      summary: String(reconciliationSummary?.summary || reconciliationSummary?.note || '提交开票后可进入对账。').trim(),
      note: String(reconciliationSummary?.nextStep || reconciliationSummary?.decisionNote || reconciliationSummary?.note || '').trim(),
      status: String(reconciliationSummary?.status || '待同步').trim(),
      meta: [
        reconciliationSummary?.amount ? `金额 ${reconciliationSummary.amount}` : '',
        reconciliationSummary?.submittedAt ? `提交 ${reconciliationSummary.submittedAt}` : '',
        reconciliationSummary?.updatedAt ? `更新 ${reconciliationSummary.updatedAt}` : ''
      ],
      actionCodes: ['RECONCILIATION_CONFIRM', 'RECONCILIATION_DISPUTE'],
      availableActionCodes
    }),
    makeFinanceSection({
      key: 'settlement',
      badge: '结算',
      title: '结算执行',
      summary: String(settlementSummary?.summary || settlementSummary?.note || '对账完成后可进入结算。').trim(),
      note: String(settlementSummary?.nextStep || settlementSummary?.decisionNote || settlementSummary?.note || '').trim(),
      status: String(settlementSummary?.status || '待同步').trim(),
      meta: [
        settlementSummary?.amount ? `金额 ${settlementSummary.amount}` : '',
        settlementSummary?.payoutRatio ? `比例 ${settlementSummary.payoutRatio}` : '',
        settlementSummary?.settledAt ? `结算 ${settlementSummary.settledAt}` : ''
      ],
      actionCodes: ['SETTLEMENT_EXECUTE', 'SETTLEMENT_FAIL'],
      availableActionCodes
    }),
    makeFinanceSection({
      key: 'dispute',
      badge: '争议',
      title: '争议与风控',
      summary: disputeSummary?.status && disputeSummary.status !== '未发起'
        ? `当前争议状态：${disputeSummary.status}`
        : '如对账有异议，平台会生成争议与风控工单。',
      note: String(disputeSummary?.nextStep || disputeSummary?.note || '').trim(),
      status: String(disputeSummary?.status || '未发起').trim(),
      meta: [
        disputeSummary?.amount ? `金额 ${disputeSummary.amount}` : '',
        disputeSummary?.submittedAt ? `发起 ${disputeSummary.submittedAt}` : '',
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
  if (!status || status === '未发起') {
    return;
  }
  items.push({
    label,
    text: [status, amount, nextStep].filter(Boolean).join(' · ')
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
    summary: String(item?.summary || item?.note || item?.content || item?.description || '已提交进展更新').trim(),
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
    amountNote: safeRecord.amountNote || '本单合作金额',
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
    keyResults: resolveKeyResults(safeRecord),
    confirmationHistory: listOf(safeRecord.sections?.confirmationHistory)
  };
}
