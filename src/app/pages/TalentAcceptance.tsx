import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { AttachmentButton } from "../components/AttachmentButton";
import { useStore } from "../store";
import { ArrowLeft, CheckCircle2, FileCheck, Loader2, MessageSquare, Paperclip, Star, Wallet } from "lucide-react";
import { getOrderRecordDetail, getOrderRecords, getTaskClosureData, getWorkspaceData, submitReview } from "../services/api";
import {
  asArray,
  attachmentsFromProgress,
  collectAttachments,
  isMutationFailed,
  moneyLabel,
  mutationMessage,
  normalizeFinanceSections,
  ratingToGrade,
  statusTone,
  stringOf
} from "../services/workflowFormatters";

function badgeClass(value: unknown) {
  const tone = statusTone(value);
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "danger") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function TalentAcceptance() {
  const { currentUser } = useStore();
  const [searchParams] = useSearchParams();
  const queryTaskId = searchParams.get("taskId") || "";
  const [selectedTaskId, setSelectedTaskId] = useState(queryTaskId);
  const [records, setRecords] = useState<any[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [closure, setClosure] = useState<any>(null);
  const [recordDetail, setRecordDetail] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("需求说明清楚，验收反馈及时，合作过程顺畅。");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (queryTaskId) {
      setSelectedTaskId(queryTaskId);
    }
  }, [queryTaskId]);

  useEffect(() => {
    let cancelled = false;
    async function loadRecords() {
      const payload = await getOrderRecords("talent", "all");
      if (cancelled) return;
      const items = asArray(payload.items);
      setRecords(items);
      if (payload.requestError) {
        setError(payload.requestError);
      }
      if (!selectedTaskId && items.length) {
        setSelectedTaskId(stringOf(items[0]?.taskId, items[0]?.id));
      }
    }
    loadRecords();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedTaskId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    async function loadDetail() {
      setIsLoading(true);
      setError("");
      setNotice("");
      const [workspacePayload, closurePayload, recordPayload] = await Promise.all([
        getWorkspaceData(selectedTaskId),
        getTaskClosureData(selectedTaskId),
        getOrderRecordDetail("talent", selectedTaskId)
      ]);
      if (cancelled) return;
      setWorkspace(workspacePayload);
      setClosure(closurePayload);
      setRecordDetail(recordPayload);
      const requestError = stringOf(workspacePayload.requestError, closurePayload.requestError, recordPayload.requestError);
      if (requestError) {
        setError(requestError);
      }
      setIsLoading(false);
    }
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedTaskId]);

  const record = recordDetail?.record || {};
  const summary = closure?.summary || recordDetail?.summary || workspace?.summary || {};
  const selectedRecord = records.find((item) => stringOf(item?.taskId) === selectedTaskId) || records[0] || {};
  const title = stringOf(summary?.title, record?.title, selectedRecord?.title, "交付与验收");
  const stage = stringOf(summary?.status, record?.stage, selectedRecord?.stage, "待同步");
  const company = stringOf(summary?.business, record?.counterpartName, selectedRecord?.counterpartName, "合作企业");
  const amount = moneyLabel(summary?.amountValue || record?.amountValue || selectedRecord?.amountValue || record?.amount, "待确认");
  const acceptance = closure?.acceptance || record?.acceptance || {};
  const reviewHistory = asArray(closure?.reviewHistory || record?.reviews || record?.sections?.reviews);
  const financeSections = normalizeFinanceSections({ ...record, ...closure });
  const businessUserId = stringOf(summary?.businessUserId, workspace?.summary?.businessUserId, record?.businessUserId);
  const roomKey = stringOf(record?.roomKey, selectedRecord?.roomKey, workspace?.summary?.roomKey);

  const attachments = useMemo(
    () =>
      collectAttachments(
        record?.assetLibrary,
        record?.sections?.assetLibrary,
        workspace?.assetLibrary,
        attachmentsFromProgress(record?.progressFeed || record?.sections?.progressFeed),
        attachmentsFromProgress(workspace?.progressFeed)
      ),
    [record, workspace]
  );

  const enterpriseReview = reviewHistory.find((item: any) => /企业|business|BUSINESS/i.test(stringOf(item?.role, item?.reviewer))) || reviewHistory[0];

  async function handleSubmitReview() {
    if (!selectedTaskId || !businessUserId) {
      setError("当前接口没有返回企业用户 ID，暂时无法提交评价。");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setNotice("");
    const result = await submitReview(selectedTaskId, {
      revieweeUserId: Number(businessUserId),
      rating,
      reviewContent: reviewContent.trim()
    });
    if (isMutationFailed(result)) {
      setError(mutationMessage(result, "当前暂时无法提交评价。"));
    } else {
      setNotice(mutationMessage(result, "评价已写入合作记录。"));
      const nextClosure = await getTaskClosureData(selectedTaskId);
      const nextRecord = await getOrderRecordDetail("talent", selectedTaskId);
      setClosure(nextClosure);
      setRecordDetail(nextRecord);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <Link to={`/talent/workspace${selectedTaskId ? `?taskId=${encodeURIComponent(selectedTaskId)}&roomKey=${encodeURIComponent(roomKey)}` : ""}`} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回协作空间
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">交付与验收</h1>
          <p className="text-slate-500 mt-1">查看企业验收意见、评级反馈、附件归档与结算进度。</p>
        </div>
        {selectedTaskId && (
          <Link to={`/talent/chat?taskId=${encodeURIComponent(selectedTaskId)}&roomKey=${encodeURIComponent(roomKey)}`}>
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
              <MessageSquare className="w-4 h-4 mr-2" /> 查看会话
            </Button>
          </Link>
        )}
      </div>

      {(error || notice) && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm ${
            error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error || notice}
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 mr-2 inline animate-spin" /> 正在同步验收数据...
        </div>
      )}

      {!selectedTaskId && !isLoading ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
          当前还没有可展示的交付验收记录。
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-emerald-100 shadow-sm overflow-hidden bg-white">
                <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 border-b border-emerald-100 p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <Badge variant="outline" className={badgeClass(stage)}>
                        {stage}
                      </Badge>
                      <h3 className="text-2xl font-bold text-slate-900 mt-4">{title}</h3>
                      <p className="text-sm text-slate-500 mt-2">企业：{company}</p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm text-right">
                      <p className="text-sm text-slate-500 mb-1">本次金额</p>
                      <p className="text-2xl font-bold text-emerald-700">{amount}</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 企业验收意见
                    </h4>
                    <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
                      {stringOf(acceptance?.note, summary?.acceptanceNote, "企业暂未写入验收意见。")}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /> 企业评级
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-black text-slate-900">
                        {stringOf(summary?.deliveryGrade, enterpriseReview?.grade, ratingToGrade(enterpriseReview?.rating))}
                      </div>
                      <span className="text-sm text-slate-500">
                        {stringOf(enterpriseReview?.content, enterpriseReview?.note, "评级会在企业提交后同步。")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-slate-500" /> 附件归档
                    </h4>
                    {attachments.length ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {attachments.map((file) => (
                          <AttachmentButton key={file.key} file={file} compact />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                        暂未同步附件。
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    {financeSections.map((section) => (
                      <div key={section.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <Badge variant="outline" className={badgeClass(section.status)}>
                            {section.label}
                          </Badge>
                          <span className="text-sm font-bold text-slate-800">{section.status}</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-500 leading-relaxed">{section.note || "等待流程推进后同步。"}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                    <Link to={`/talent/records/${encodeURIComponent(selectedTaskId || "")}/settlement?taskId=${encodeURIComponent(selectedTaskId || "")}`}>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        <Wallet className="w-4 h-4 mr-2" /> 查看结算进度
                      </Button>
                    </Link>
                    <Link to={`/talent/records/${encodeURIComponent(selectedTaskId || "")}?taskId=${encodeURIComponent(selectedTaskId || "")}`}>
                      <Button variant="outline" className="border-slate-200 rounded-xl">
                        <FileCheck className="w-4 h-4 mr-2" /> 查看合作记录
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="border-slate-200 shadow-sm h-fit">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-slate-400" />
                给企业反馈
              </h3>
              <p className="text-sm text-slate-500 mb-4">评价企业需求清晰度、反馈效率和验收配合度，会沉淀到企业合作信用。</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">配合度评分</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} className="p-0.5">
                        <Star className={`w-6 h-6 transition-colors ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">想对企业说</label>
                  <textarea
                    value={reviewContent}
                    onChange={(event) => setReviewContent(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    rows={5}
                    placeholder="例如：需求很明确，对接顺畅..."
                  />
                </div>
                <Button onClick={handleSubmitReview} disabled={isSubmitting || !reviewContent.trim()} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  提交评价
                </Button>
                <p className="text-xs text-slate-400">当前账号：{currentUser?.name || "未同步"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
