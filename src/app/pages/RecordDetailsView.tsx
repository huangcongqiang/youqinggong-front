import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { AttachmentButton } from "../components/AttachmentButton";
import { ArrowLeft, Bot, CheckCircle, Clock, Download, FileText, Loader2, MessageSquare, Paperclip, Wallet } from "lucide-react";
import { getOrderRecordDetail } from "../services/api";
import {
  asArray,
  attachmentsFromProgress,
  collectAttachments,
  moneyLabel,
  normalizeFinanceSections,
  normalizeTimeline,
  statusTone,
  stringOf
} from "../services/workflowFormatters";

type Audience = "enterprise" | "talent";

function badgeClass(value: unknown) {
  const tone = statusTone(value);
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "danger") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function RecordDetailsView({ audience }: { audience: Audience }) {
  const { recordId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const taskId = stringOf(searchParams.get("taskId"), recordId);
  const [payload, setPayload] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!taskId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    async function loadDetail() {
      setIsLoading(true);
      setError("");
      const data = await getOrderRecordDetail(audience, taskId);
      if (cancelled) return;
      setPayload(data);
      if (data.requestError) {
        setError(data.requestError);
      }
      setIsLoading(false);
    }
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [audience, taskId]);

  const record = payload?.record || {};
  const summary = payload?.summary || {};
  const title = stringOf(summary?.title, record?.title, "合作记录详情");
  const stage = stringOf(summary?.stage, record?.stage, record?.statusGroup, "待同步");
  const partnerRole = stringOf(record?.counterpartRole, audience === "talent" ? "企业" : "人才");
  const partnerName = stringOf(record?.counterpartName, "合作方");
  const amount = moneyLabel(summary?.amountValue || record?.amountValue || record?.amount, "待确认");
  const roomKey = stringOf(record?.roomKey, searchParams.get("roomKey"));
  const timeline = normalizeTimeline(record?.timeline);
  const progressItems = asArray(record?.progressFeed || record?.sections?.progressFeed);
  const aiReviewItems = asArray(record?.aiReviewHistory || record?.sections?.aiReviewHistory);
  const financeSections = normalizeFinanceSections(record);
  const tags = asArray(record?.tags || record?.sections?.taskTags).map((tag) => String(tag));

  const attachments = useMemo(
    () =>
      collectAttachments(
        record?.assetLibrary,
        record?.sections?.assetLibrary,
        attachmentsFromProgress(record?.progressFeed || record?.sections?.progressFeed)
      ),
    [record]
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <Link to={`/${audience}/records`} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回记录列表
      </Link>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        <div>
          <Badge variant="outline" className={badgeClass(stage)}>
            {stage}
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">{title}</h1>
          <p className="text-sm text-slate-500 mt-2">
            记录编号：{taskId || "待同步"} · {partnerRole}：{partnerName}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={`/${audience}/workspace?taskId=${encodeURIComponent(taskId)}&roomKey=${encodeURIComponent(roomKey)}`}>
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white">工作区</Button>
          </Link>
          <Link to={`/${audience}/chat?taskId=${encodeURIComponent(taskId)}&roomKey=${encodeURIComponent(roomKey)}`}>
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
              <MessageSquare className="w-4 h-4 mr-2" /> 消息
            </Button>
          </Link>
          <Link to={`/${audience}/records/${encodeURIComponent(taskId)}/settlement?taskId=${encodeURIComponent(taskId)}`}>
            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white">
              <Wallet className="w-4 h-4 mr-2" /> 结算详情
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          <Loader2 className="w-5 h-5 mx-auto mb-3 animate-spin" /> 正在读取真实记录...
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
              <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-6 border-b border-slate-100">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">合作金额</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">时间范围</p>
                    <p className="text-lg font-semibold text-slate-800 mt-1">
                      {stringOf(record?.startAt, "待定")} - {stringOf(record?.endAt, "待定")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{record?.rating?.label || "评分"}</p>
                    <p className="text-lg font-semibold text-slate-800 mt-1">{stringOf(record?.rating?.value, record?.myGrade, "待评分")}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-slate-600 leading-relaxed">{stringOf(record?.detail, record?.summary, "当前记录还没有同步详细说明。")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" /> 合作时间线
                </h3>
                {timeline.length ? (
                  <div className="space-y-6">
                    {timeline.map((item, idx) => (
                      <div key={item.key} className="flex gap-4 relative">
                        {idx !== timeline.length - 1 && <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-100" />}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            statusTone(item.status) === "success" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {statusTone(item.status) === "success" ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400 mb-1">{item.time || item.status}</p>
                          <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                          <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                    当前接口还没有返回时间线。
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-5">进展与验收记录</h3>
                {progressItems.length ? (
                  <div className="space-y-4">
                    {progressItems.map((item: any, index) => (
                      <div key={stringOf(item?.key, item?.time, index)} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <Badge variant="outline" className={badgeClass(item?.status)}>
                            {stringOf(item?.stage, item?.status, "进展")}
                          </Badge>
                          <span className="text-xs text-slate-400">{stringOf(item?.time, item?.updatedAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{stringOf(item?.summary, item?.description, item?.content, "已提交进展。")}</p>
                        {item?.aiReviewSummary && (
                          <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{item.aiReviewSummary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                    暂未同步进展记录。
                  </div>
                )}
              </CardContent>
            </Card>

            {aiReviewItems.length > 0 && (
              <Card className="bg-gradient-to-br from-emerald-50 to-lime-50 border-emerald-100">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <Bot className="w-4 h-4" /> AI 合作摘要
                  </h3>
                  <div className="space-y-3">
                    {aiReviewItems.slice(0, 3).map((item: any, index) => (
                      <p key={stringOf(item?.time, index)} className="text-sm text-emerald-900/80 leading-relaxed">
                        {stringOf(item?.summary, item?.note, item?.title)}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">{partnerRole}</h3>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-bold text-slate-900">{partnerName}</p>
                  <p className="text-xs text-slate-500 mt-1">来自真实订单记录</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" /> 附件归档
                </h3>
                {attachments.length ? (
                  <div className="space-y-3">
                    {attachments.map((file) => (
                      <AttachmentButton key={file.key} file={file} compact />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">暂无归档附件。</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">财务跟进</h3>
                <div className="space-y-3">
                  {financeSections.map((section) => (
                    <div key={section.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="outline" className={badgeClass(section.status)}>
                          {section.label}
                        </Badge>
                        <span className="text-sm font-semibold text-slate-800">{section.status}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500 leading-relaxed">{section.note || "等待流程推进。"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
