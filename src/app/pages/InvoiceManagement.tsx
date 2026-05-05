import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { FileText, Loader2, RefreshCw, Save } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Textarea } from "../components/ui/Textarea";
import {
  getInvoiceHistory,
  getInvoiceReviewingCount,
  getInvoiceTemplate,
  getPendingInvoices,
  rejectInvoiceRequest,
  respondInvoice,
  reviewInvoice,
  saveInvoiceTemplate
} from "../services/api";
import { asArray, isMutationFailed, moneyLabel, mutationMessage, statusTone, stringOf } from "../services/workflowFormatters";

type Audience = "enterprise" | "talent";

interface InvoiceRow {
  invoiceId: string;
  taskId: string;
  taskTitle: string;
  invoiceNo: string;
  status: string;
  statusCode: string;
  amount: string;
  updatedAt: string;
  note: string;
  invoiceType: string;
}

const emptyTemplate = {
  title: "",
  taxNumber: "",
  companyAddress: "",
  bankName: "",
  bankAccount: ""
};

function normalizeInvoice(item: any, index = 0): InvoiceRow {
  return {
    invoiceId: stringOf(item?.invoiceId, item?.id, `invoice-${index + 1}`),
    taskId: stringOf(item?.taskId),
    taskTitle: stringOf(item?.taskTitle, item?.title, "合作任务"),
    invoiceNo: stringOf(item?.invoiceNo, item?.invoice_number, "待生成"),
    status: stringOf(item?.status, "未同步"),
    statusCode: stringOf(item?.statusCode, item?.status_code),
    amount: moneyLabel(item?.amount || item?.amountValue, "金额待确认"),
    updatedAt: stringOf(item?.updatedAt, item?.submittedAt, "待同步"),
    note: stringOf(item?.nextStep, item?.note),
    invoiceType: stringOf(item?.invoiceType, item?.type)
  };
}

function badgeClass(value: unknown) {
  const tone = statusTone(value);
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "danger") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function statusKey(row: InvoiceRow) {
  return stringOf(row.statusCode, row.status).toUpperCase();
}

function settlementPath(audience: Audience, row: InvoiceRow) {
  if (!row.taskId) return `/${audience}/records`;
  const taskId = encodeURIComponent(row.taskId);
  return `/${audience}/records/${taskId}/settlement?taskId=${taskId}`;
}

function InvoiceList({
  audience,
  rows,
  notes,
  actingId,
  setNotes,
  onAction
}: {
  audience: Audience;
  rows: InvoiceRow[];
  notes: Record<string, string>;
  actingId: string;
  setNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAction: (row: InvoiceRow, action: "respond" | "rejectRequest" | "approve" | "reject") => void;
}) {
  if (!rows.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">暂无发票记录。</div>;
  }
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const key = statusKey(row);
        const canTalentRespond = audience === "talent" && (key.includes("REQUESTED") || key.includes("REJECTED") || row.status.includes("待人才") || row.status.includes("驳回"));
        const canTalentReject = audience === "talent" && (key.includes("REQUESTED") || row.status.includes("待人才"));
        const canEnterpriseReview = audience === "enterprise" && (key.includes("REVIEWING") || row.status.includes("待企业审核"));
        return (
          <Card key={row.invoiceId} className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={badgeClass(row.status)}>
                      {row.status}
                    </Badge>
                    <span className="text-xs text-slate-400">{row.invoiceNo}</span>
                  </div>
                  <h3 className="truncate text-base font-bold text-slate-900">{row.taskTitle}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>{row.taskId || "任务待同步"}</span>
                    <span>{row.amount}</span>
                    <span>{row.updatedAt}</span>
                  </div>
                  {row.note && <p className="mt-2 text-sm leading-relaxed text-slate-500">{row.note}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Link to={settlementPath(audience, row)}>
                    <Button variant="outline" size="sm" className="rounded-lg border-slate-200 bg-white">
                      查看结算详情
                    </Button>
                  </Link>
                </div>
              </div>
              {(canTalentRespond || canTalentReject || canEnterpriseReview) && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <Textarea
                    value={notes[row.invoiceId] || ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [row.invoiceId]: event.target.value }))}
                    placeholder={audience === "enterprise" ? "填写发票审核说明。" : "填写发票提交方式、票面信息或拒绝原因。"}
                    className="min-h-20 rounded-lg bg-white text-sm"
                  />
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {canTalentRespond && (
                      <Button size="sm" disabled={actingId === `${row.invoiceId}:respond`} onClick={() => onAction(row, "respond")}>
                        {actingId === `${row.invoiceId}:respond` ? "提交中..." : "提交发票"}
                      </Button>
                    )}
                    {canTalentReject && (
                      <Button variant="outline" size="sm" disabled={actingId === `${row.invoiceId}:rejectRequest`} onClick={() => onAction(row, "rejectRequest")}>
                        拒绝请求
                      </Button>
                    )}
                    {canEnterpriseReview && (
                      <>
                        <Button size="sm" disabled={actingId === `${row.invoiceId}:approve`} onClick={() => onAction(row, "approve")}>
                          确认通过
                        </Button>
                        <Button variant="outline" size="sm" disabled={actingId === `${row.invoiceId}:reject`} onClick={() => onAction(row, "reject")}>
                          驳回
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function InvoiceManagement({ audience }: { audience: Audience }) {
  const isEnterprise = audience === "enterprise";
  const [template, setTemplate] = useState(emptyTemplate);
  const [history, setHistory] = useState<InvoiceRow[]>([]);
  const [pending, setPending] = useState<InvoiceRow[]>([]);
  const [reviewingCount, setReviewingCount] = useState(0);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadInvoices() {
    setLoading(true);
    setError("");
    const [historyPayload, pendingPayload, templatePayload, reviewingPayload] = await Promise.all([
      getInvoiceHistory(),
      isEnterprise ? Promise.resolve(null) : getPendingInvoices(),
      isEnterprise ? getInvoiceTemplate() : Promise.resolve(null),
      isEnterprise ? getInvoiceReviewingCount() : Promise.resolve(null)
    ]);
    setHistory(asArray<any>(historyPayload?.list || historyPayload?.items).map(normalizeInvoice));
    setPending(asArray<any>(pendingPayload?.list || pendingPayload?.items).map(normalizeInvoice));
    if (templatePayload) {
      setTemplate({
        title: stringOf(templatePayload?.title, templatePayload?.template?.title),
        taxNumber: stringOf(templatePayload?.taxNumber, templatePayload?.tax_number, templatePayload?.template?.taxNumber, templatePayload?.template?.tax_number),
        companyAddress: stringOf(templatePayload?.companyAddress, templatePayload?.company_address, templatePayload?.template?.companyAddress, templatePayload?.template?.company_address),
        bankName: stringOf(templatePayload?.bankName, templatePayload?.bank_name, templatePayload?.template?.bankName, templatePayload?.template?.bank_name),
        bankAccount: stringOf(templatePayload?.bankAccount, templatePayload?.bank_account, templatePayload?.template?.bankAccount, templatePayload?.template?.bank_account)
      });
    }
    setReviewingCount(Number(reviewingPayload?.count || 0));
    setError(stringOf(historyPayload?.requestError, pendingPayload?.requestError, templatePayload?.requestError, reviewingPayload?.requestError));
    setLoading(false);
  }

  useEffect(() => {
    loadInvoices();
  }, [audience]);

  const displayedRows = useMemo(() => (isEnterprise ? history : pending.length ? pending : history), [history, isEnterprise, pending]);
  const headline = isEnterprise ? "企业发起开票申请，人才提交后在这里审核确认。" : "处理企业发来的开票请求，支持自行提供发票说明或拒绝请求。";

  async function saveTemplate() {
    setActingId("template");
    setMessage("");
    const result = await saveInvoiceTemplate(template);
    setActingId("");
    if (isMutationFailed(result)) {
      setError(mutationMessage(result, "发票抬头保存失败。"));
      return;
    }
    setMessage(mutationMessage(result, "发票抬头已保存。"));
  }

  async function handleInvoiceAction(row: InvoiceRow, action: "respond" | "rejectRequest" | "approve" | "reject") {
    const key = `${row.invoiceId}:${action}`;
    setActingId(key);
    setMessage("");
    setError("");
    const note = notes[row.invoiceId] || "";
    const result =
      action === "respond"
        ? await respondInvoice(row.invoiceId, { mode: "SELF_PROVIDED", remark: note, note })
        : action === "rejectRequest"
          ? await rejectInvoiceRequest(row.invoiceId, { reason: note })
          : await reviewInvoice(row.invoiceId, { approved: action === "approve", action: action === "approve" ? "APPROVE" : "REJECT", note, reason: note });
    setActingId("");
    if (isMutationFailed(result)) {
      setError(mutationMessage(result, "发票动作处理失败。"));
      return;
    }
    setMessage(mutationMessage(result, "发票动作已处理。"));
    setNotes((current) => ({ ...current, [row.invoiceId]: "" }));
    await loadInvoices();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="outline" className={isEnterprise ? "mb-4 border-indigo-200 bg-indigo-50 text-indigo-700" : "mb-4 border-emerald-200 bg-emerald-50 text-emerald-700"}>
            发票管理
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{isEnterprise ? "发票申请与审核" : "待处理发票"}</h1>
          <p className="mt-2 text-sm text-slate-500">{headline}</p>
        </div>
        <Button variant="outline" className="self-start rounded-xl border-slate-200 bg-white" onClick={loadInvoices}>
          <RefreshCw className="mr-2 h-4 w-4" /> 刷新
        </Button>
      </div>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      {isEnterprise && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">发票抬头信息</h2>
                <p className="mt-1 text-sm text-slate-500">企业发起开票请求时会带入这些资料。</p>
              </div>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                待审核 {reviewingCount}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["title", "开票抬头"],
                ["taxNumber", "税号"],
                ["companyAddress", "企业地址"],
                ["bankName", "开户银行"],
                ["bankAccount", "银行账号"]
              ].map(([key, label]) => (
                <label key={key} className="text-sm font-medium text-slate-600">
                  {label}
                  <input
                    value={template[key as keyof typeof template]}
                    onChange={(event) => setTemplate((current) => ({ ...current, [key]: event.target.value }))}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={saveTemplate} disabled={actingId === "template"} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                <Save className="mr-2 h-4 w-4" /> {actingId === "template" ? "保存中..." : "保存抬头"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 p-5">
          <FileText className={isEnterprise ? "h-5 w-5 text-indigo-700" : "h-5 w-5 text-emerald-700"} />
          <h2 className="text-lg font-bold text-slate-900">{isEnterprise ? "发票历史与待审核" : "待响应与历史发票"}</h2>
        </div>
        <CardContent className="p-5">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" /> 正在同步发票数据...
            </div>
          ) : (
            <InvoiceList audience={audience} rows={displayedRows} notes={notes} actingId={actingId} setNotes={setNotes} onAction={handleInvoiceAction} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
