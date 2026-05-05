import React, { useMemo, useState } from "react";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import {
  rejectInvoiceRequest,
  requestEnterpriseInvoice,
  requestTaskClaim,
  respondInvoice,
  respondTaskReconciliation,
  respondTaskSettlement,
  reviewInvoice,
  reviewTaskClaim
} from "../services/api";
import {
  isMutationFailed,
  mutationMessage,
  type NormalizedFinanceAction,
  type NormalizedFinanceSection
} from "../services/workflowFormatters";

type Audience = "enterprise" | "talent";

interface FinanceActionPanelProps {
  audience: Audience;
  taskId: string;
  section: NormalizedFinanceSection;
  sections: NormalizedFinanceSection[];
  onCompleted: () => void;
}

function buttonClass(action: NormalizedFinanceAction) {
  if (action.tone === "primary") {
    return "bg-slate-900 text-white hover:bg-slate-800";
  }
  if (/REJECT|FAIL|DISPUTE/i.test(action.action || action.key)) {
    return "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100";
  }
  return "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
}

function notePlaceholder(action: NormalizedFinanceAction) {
  if (action.key === "request_invoice") return "说明本次开票请求的抬头、金额或资料要求。";
  if (action.key === "respond_invoice") return "补充发票提交方式、票面信息或附件说明。";
  if (action.key === "approve_invoice") return "补充确认发票通过的说明。";
  if (action.key === "reject_invoice" || action.key === "reject_invoice_request") return "说明驳回或拒绝开票请求的原因。";
  if (/DISPUTE/i.test(action.action || action.key)) return "说明发起争议的原因和需平台核对的点。";
  if (/REJECT|FAIL/i.test(action.action || action.key)) return "说明驳回或标记失败的原因。";
  if (/APPROVE|CONFIRM|EXECUTE/i.test(action.action || action.key)) return "补充本次确认或执行说明。";
  return "补充本次财务处理说明。";
}

function invoiceIdFor(section: NormalizedFinanceSection, sections: NormalizedFinanceSection[]) {
  return section.invoiceId || sections.find((item) => item.key === "invoiceSummary")?.invoiceId || "";
}

function actionValue(action: NormalizedFinanceAction) {
  if (action.action) return action.action;
  if (action.key === "create_claim") return "CREATE";
  if (action.key === "request_invoice") return "REQUEST";
  if (action.key === "respond_invoice") return "RESPOND";
  if (action.key === "approve_invoice") return "APPROVE";
  if (action.key === "reject_invoice" || action.key === "reject_invoice_request") return "REJECT";
  if (action.key === "approve_claim") return "APPROVE";
  if (action.key === "reject_claim") return "REJECT";
  if (action.key === "confirm_reconciliation") return "CONFIRM";
  if (action.key === "dispute_reconciliation") return "DISPUTE";
  if (action.key === "execute_settlement" || action.key === "retry_settlement") return "EXECUTE";
  if (action.key === "fail_settlement") return "FAIL";
  return action.key.toUpperCase();
}

export function FinanceActionPanel({ audience, taskId, section, sections, onCompleted }: FinanceActionPanelProps) {
  const [activeKey, setActiveKey] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeAction = useMemo(
    () => section.availableActions.find((action) => action.key === activeKey) || null,
    [activeKey, section.availableActions]
  );

  if (!section.availableActions.length || !taskId) {
    return null;
  }

  async function submitAction() {
    if (!activeAction || isSubmitting) return;
    setIsSubmitting(true);
    setMessage("");
    const action = actionValue(activeAction);
    const payload = { action, note };
    let result: any = null;
    try {
      if (activeAction.key === "create_claim") {
        result = await requestTaskClaim(taskId, { note });
      } else if (activeAction.key === "request_invoice") {
        result = await requestEnterpriseInvoice(taskId);
      } else if (activeAction.key === "respond_invoice") {
        const invoiceId = invoiceIdFor(section, sections);
        if (!invoiceId) {
          setMessage("发票编号尚未同步，暂不能响应开票请求。");
          return;
        }
        result = await respondInvoice(invoiceId, { mode: "SELF_PROVIDED", remark: note, note });
      } else if (activeAction.key === "reject_invoice_request") {
        const invoiceId = invoiceIdFor(section, sections);
        if (!invoiceId) {
          setMessage("发票编号尚未同步，暂不能拒绝开票请求。");
          return;
        }
        result = await rejectInvoiceRequest(invoiceId, { reason: note });
      } else if (activeAction.key === "approve_invoice" || activeAction.key === "reject_invoice") {
        const invoiceId = invoiceIdFor(section, sections);
        if (!invoiceId) {
          setMessage("发票编号尚未同步，暂不能审核发票。");
          return;
        }
        result = await reviewInvoice(invoiceId, { approved: activeAction.key === "approve_invoice", action, note, reason: note });
      } else if (activeAction.key.includes("claim")) {
        if (!section.claimId) {
          setMessage("请款单编号尚未同步，暂不能处理请款。");
          return;
        }
        result = await reviewTaskClaim(section.claimId, payload);
      } else if (activeAction.key.includes("reconciliation")) {
        if (!section.reconciliationId) {
          setMessage("对账单编号尚未同步，暂不能处理对账。");
          return;
        }
        result = await respondTaskReconciliation(section.reconciliationId, payload);
      } else if (activeAction.key.includes("settlement")) {
        if (!section.settlementId) {
          setMessage("结算单编号尚未同步，暂不能处理结算。");
          return;
        }
        result = await respondTaskSettlement(section.settlementId, payload);
      }
      if (isMutationFailed(result)) {
        setMessage(mutationMessage(result, "当前财务动作未完成。"));
        return;
      }
      setMessage(mutationMessage(result, `${activeAction.label}已提交。`));
      setActiveKey("");
      setNote("");
      onCompleted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "当前财务动作未完成。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500 mb-2">{audience === "enterprise" ? "企业可操作" : "人才可操作"}</p>
      <div className="flex flex-wrap gap-2">
        {section.availableActions.map((action) => (
          <Button
            key={action.key}
            type="button"
            variant={action.tone === "primary" ? "default" : "outline"}
            size="sm"
            className={`rounded-lg ${buttonClass(action)}`}
            onClick={() => {
              setActiveKey(activeKey === action.key ? "" : action.key);
              setMessage("");
            }}
          >
            {action.label}
          </Button>
        ))}
      </div>
      {activeAction && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={notePlaceholder(activeAction)}
            className="min-h-20 rounded-lg bg-white text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={() => setActiveKey("")}>
              取消
            </Button>
            <Button type="button" size="sm" className="rounded-lg bg-slate-900 text-white hover:bg-slate-800" disabled={isSubmitting} onClick={submitAction}>
              {isSubmitting ? "提交中..." : `确认${activeAction.label}`}
            </Button>
          </div>
        </div>
      )}
      {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
    </div>
  );
}
