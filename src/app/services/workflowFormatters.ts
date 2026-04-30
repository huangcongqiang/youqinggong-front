export interface NormalizedAttachment {
  key: string;
  name: string;
  href: string;
  type: string;
  note: string;
}

export interface NormalizedTimelineItem {
  key: string;
  title: string;
  desc: string;
  time: string;
  status: string;
}

export interface NormalizedFinanceSection {
  key: string;
  label: string;
  status: string;
  amount: string;
  note: string;
  claimId: string;
  invoiceId: string;
  reconciliationId: string;
  settlementId: string;
  disputeId: string;
  availableActions: NormalizedFinanceAction[];
}

export interface NormalizedFinanceAction {
  key: string;
  label: string;
  action: string;
  tone: string;
}

export function asArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
}

export function stringOf(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    const next = String(value).trim();
    if (next) {
      return next;
    }
  }
  return "";
}

export function numberOf(...values: unknown[]) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

export function isMutationFailed(result: any) {
  return Boolean(
    result?.requestError ||
      result?.actionBlocked ||
      result?.success === false ||
      String(result?.status || "").toUpperCase() === "FAILED"
  );
}

export function mutationMessage(result: any, fallback = "") {
  return stringOf(result?.requestError, result?.actionMessage, result?.nextStep, result?.message, fallback);
}

export function moneyLabel(value: unknown, fallback = "待确认") {
  const direct = stringOf(value);
  if (!direct) {
    return fallback;
  }
  if (/^[¥￥]/.test(direct)) {
    return direct;
  }
  if (/^\d+(\.\d+)?$/.test(direct)) {
    return `¥${Number(direct).toLocaleString("zh-CN")}`;
  }
  return direct;
}

export function statusTone(value: unknown) {
  const text = stringOf(value);
  if (/已完成|已结算|已归档|已批准|已开票|已完成对账|COMPLETED|SETTLED|DONE|ACCEPTED|APPROVED|ISSUED|RECONCILED/i.test(text)) {
    return "success";
  }
  if (/待验收|待支付|待处理|待企业|PENDING|WAITING/i.test(text)) {
    return "warning";
  }
  if (/拒绝|失败|异常|取消|争议|异议|FAILED|REJECT|FROZEN|DISPUT/i.test(text)) {
    return "danger";
  }
  return "neutral";
}

export function isAcceptanceReady(...values: unknown[]) {
  return values.some((value) => /待验收|PENDING_ACCEPTANCE/i.test(stringOf(value)));
}

export function isCompletedStatus(...values: unknown[]) {
  return values.some((value) => /已完成|已验收|已结算|COMPLETED|ACCEPTED|DONE/i.test(stringOf(value)));
}

export function attachmentName(attachment: any) {
  if (typeof attachment === "string") {
    return attachment;
  }
  return stringOf(
    attachment?.name,
    attachment?.fileName,
    attachment?.filename,
    attachment?.label,
    attachment?.title,
    attachment?.downloadUrl,
    attachment?.previewUrl,
    attachment?.url,
    "附件"
  );
}

export function attachmentHref(attachment: any) {
  if (typeof attachment === "string") {
    return attachment;
  }
  return stringOf(
    attachment?.downloadHref,
    attachment?.downloadUrl,
    attachment?.previewUrl,
    attachment?.url,
    attachment?.href,
    attachment?.fileUrl,
    attachment?.path
  );
}

export function normalizeAttachment(attachment: any, index = 0): NormalizedAttachment {
  const name = attachmentName(attachment);
  return {
    key: stringOf(attachment?.key, attachment?.id, attachment?.uploadId, attachment?.objectKey, name, `attachment-${index}`),
    name,
    href: attachmentHref(attachment),
    type: stringOf(attachment?.type, attachment?.fileType, attachment?.mimeType),
    note: stringOf(attachment?.source, attachment?.sourceType, attachment?.category, attachment?.updatedAt)
  };
}

export function collectAttachments(...sources: unknown[]) {
  const seen = new Set<string>();
  const files = sources.flatMap((source) => asArray(source).map(normalizeAttachment));
  return files.filter((file) => {
    const key = stringOf(file.href, file.name, file.key);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function attachmentsFromProgress(progressFeed: unknown) {
  return asArray(progressFeed).flatMap((item: any) => asArray(item?.attachments || item?.attachmentFiles || item?.files));
}

export function normalizeTimeline(items: unknown): NormalizedTimelineItem[] {
  return asArray(items).map((item: any, index) => ({
    key: stringOf(item?.key, item?.id, item?.title, `timeline-${index}`),
    title: stringOf(item?.title, item?.label, item?.event, `节点 ${index + 1}`),
    desc: stringOf(item?.desc, item?.description, item?.note, item?.summary, "已写入合作记录。"),
    time: stringOf(item?.time, item?.date, item?.createdAt, item?.updatedAt),
    status: stringOf(item?.status, item?.state, "已记录")
  }));
}

export function normalizeFinanceSections(record: any): NormalizedFinanceSection[] {
  return [
    ["claimSummary", "请款"],
    ["invoiceSummary", "发票"],
    ["reconciliationSummary", "对账"],
    ["settlementSummary", "结算"],
    ["disputeSummary", "争议"]
  ].map(([key, label]) => {
    const summary = record?.[key] || record?.sections?.[key] || {};
    return {
      key,
      label,
      status: stringOf(summary?.status, "未发起"),
      amount: moneyLabel(summary?.amount || summary?.amountValue, ""),
      note: stringOf(summary?.nextStep, summary?.decisionNote, summary?.note, summary?.summary),
      claimId: stringOf(summary?.claimId),
      invoiceId: stringOf(summary?.invoiceId),
      reconciliationId: stringOf(summary?.reconciliationId),
      settlementId: stringOf(summary?.settlementId),
      disputeId: stringOf(summary?.disputeId),
      availableActions: asArray(summary?.availableActions).map((action: any, actionIndex) => ({
        key: stringOf(action?.key, `finance-action-${actionIndex}`),
        label: stringOf(action?.label, "处理"),
        action: stringOf(action?.action),
        tone: stringOf(action?.tone)
      }))
    };
  });
}

export function gradeToRating(grade: string) {
  const normalized = stringOf(grade).toUpperCase();
  if (normalized === "S") return 5;
  if (normalized === "A") return 4;
  if (normalized === "B") return 3;
  return 2;
}

export function ratingToGrade(rating: unknown) {
  const value = numberOf(rating);
  if (value >= 5) return "S";
  if (value >= 4) return "A";
  if (value >= 3) return "B";
  if (value > 0) return "C";
  return "待评分";
}
