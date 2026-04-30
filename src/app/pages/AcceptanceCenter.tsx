import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Link, useSearchParams } from "react-router";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { AttachmentButton } from "../components/AttachmentButton";
import { useStore } from "../store";
import { CheckCircle2, AlertCircle, FileText, Medal, Download, Loader2, MessageSquare, Star, ThumbsUp } from "lucide-react";
import {
  getOrderRecordDetail,
  getOrderRecords,
  getTaskClosureData,
  getWorkspaceData,
  submitEarlyCompletionAction,
  submitAcceptance,
  submitReview
} from "../services/api";
import {
  asArray,
  attachmentsFromProgress,
  collectAttachments,
  gradeToRating,
  isAcceptanceReady,
  isCompletedStatus,
  isMutationFailed,
  moneyLabel,
  mutationMessage,
  statusTone,
  stringOf
} from "../services/workflowFormatters";

type TaskCard = {
  taskId: string;
  title: string;
  counterpartName: string;
  stage: string;
  statusGroup: string;
  updatedAt: string;
  amountValue: string;
  roomKey: string;
};

function normalizeTaskCard(item: any, index = 0): TaskCard {
  const taskId = stringOf(item?.taskId, item?.id, item?.recordId, `task-${index + 1}`);
  return {
    taskId,
    title: stringOf(item?.title, item?.taskTitle, item?.name, `任务 ${index + 1}`),
    counterpartName: stringOf(item?.counterpartName, item?.talentName, item?.partnerName, "合作人才"),
    stage: stringOf(item?.stage, item?.statusLabel, item?.status, "待同步"),
    statusGroup: stringOf(item?.statusGroup, item?.statusKey, item?.status, "进行中"),
    updatedAt: stringOf(item?.updatedAt, item?.time),
    amountValue: moneyLabel(item?.amountValue || item?.amount || item?.budget, "待确认"),
    roomKey: stringOf(item?.roomKey, item?.room)
  };
}

function badgeClass(value: unknown) {
  const tone = statusTone(value);
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "danger") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

const ratingLevels = [
  { grade: "S", label: "远超预期", desc: "质量极高，主动思考", color: "border-amber-200 bg-amber-50 text-amber-700", icon: Medal },
  { grade: "A", label: "符合预期", desc: "按时交付，质量达标", color: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: ThumbsUp },
  { grade: "B", label: "基本合格", desc: "有少量瑕疵，可归档", color: "border-slate-200 bg-slate-50 text-slate-700", icon: CheckCircle2 },
  { grade: "C", label: "需要复盘", desc: "未达要求，需记录风险", color: "border-red-200 bg-red-50 text-red-700", icon: AlertCircle }
];

export function AcceptanceCenter() {
  const { currentUser } = useStore();
  const [searchParams] = useSearchParams();
  const queryTaskId = searchParams.get("taskId") || "";
  const [selectedTaskId, setSelectedTaskId] = useState(queryTaskId);
  const [taskCards, setTaskCards] = useState<TaskCard[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [closure, setClosure] = useState<any>(null);
  const [recordDetail, setRecordDetail] = useState<any>(null);
  const [rating, setRating] = useState<string | null>("S");
  const [acceptanceNote, setAcceptanceNote] = useState("交付内容已确认通过，进入评级和结算流程。");
  const [reviewContent, setReviewContent] = useState("交付说明清楚，反馈节奏及时，整体协作过程顺畅。");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
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

    async function loadList() {
      setIsLoadingList(true);
      const payload = await getOrderRecords("enterprise", "all");
      if (cancelled) return;
      const cards = asArray(payload.items).map(normalizeTaskCard);
      setTaskCards(cards);
      if (payload.requestError) {
        setError(payload.requestError);
      }
      setIsLoadingList(false);
    }

    loadList();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedTaskId) {
      setWorkspace(null);
      setClosure(null);
      setRecordDetail(null);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      setIsLoadingDetail(true);
      setError("");
      setNotice("");
      const [workspacePayload, closurePayload, recordPayload] = await Promise.all([
        getWorkspaceData(selectedTaskId),
        getTaskClosureData(selectedTaskId),
        getOrderRecordDetail("enterprise", selectedTaskId)
      ]);
      if (cancelled) return;
      setWorkspace(workspacePayload);
      setClosure(closurePayload);
      setRecordDetail(recordPayload);
      const requestError = stringOf(workspacePayload.requestError, closurePayload.requestError, recordPayload.requestError);
      if (requestError) {
        setError(requestError);
      }
      setIsLoadingDetail(false);
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedTaskId]);

  const selectedCard = taskCards.find((card) => card.taskId === selectedTaskId);
  const summary = closure?.summary || workspace?.summary || recordDetail?.summary || {};
  const record = recordDetail?.record || {};
  const acceptance = closure?.acceptance || record?.acceptance || {};
  const taskTitle = stringOf(summary?.title, workspace?.summary?.taskName, record?.title, selectedCard?.title, "验收任务");
  const taskStatus = stringOf(summary?.status, acceptance?.status, selectedCard?.stage, record?.stage, "待同步");
  const roomKey = stringOf(selectedCard?.roomKey, workspace?.summary?.roomKey, record?.roomKey);
  const canAccept = isAcceptanceReady(taskStatus, workspace?.summary?.status, record?.stage) && !isCompletedStatus(taskStatus, acceptance?.status);
  const canGrade = taskStatus === "待企业评级";
  const revieweeUserId = stringOf(summary?.talentUserId, workspace?.summary?.talentUserId, record?.talentUserId);

  const attachments = useMemo(() => {
    const nodes = asArray(workspace?.collaborationNodes || workspace?.milestones);
    const nodeFiles = nodes.flatMap((node: any) =>
      asArray(node?.attachmentFiles || node?.talentSubmission?.attachmentFiles || node?.attachments || node?.files)
    );
    return collectAttachments(
      workspace?.assetLibrary,
      record?.assetLibrary,
      record?.sections?.assetLibrary,
      nodeFiles,
      attachmentsFromProgress(record?.progressFeed || record?.sections?.progressFeed),
      attachmentsFromProgress(workspace?.progressFeed)
    );
  }, [workspace, record]);

  const reviewHistory = asArray(closure?.reviewHistory || record?.reviews || record?.sections?.reviews);
  const timeline = asArray(closure?.timeline || record?.timeline);
  const latestProgress = asArray(record?.progressFeed || workspace?.progressFeed).at(-1) as any;
  const settlementStatus = stringOf(closure?.settlementSummary?.status, record?.settlementSummary?.status, "未发起");

  async function handleSubmit() {
    if (!selectedTaskId || !rating || (!canAccept && !canGrade)) return;
    setIsSubmitting(true);
    setError("");
    setNotice("");

    if (canAccept) {
      const acceptanceResult = await submitAcceptance(selectedTaskId, {
        accepterUserId: currentUser?.id,
        acceptanceNote: acceptanceNote.trim()
      });
      if (isMutationFailed(acceptanceResult)) {
        setError(mutationMessage(acceptanceResult, "当前暂时无法提交验收。"));
        setIsSubmitting(false);
        return;
      }
    }

    const gradingResult = await submitEarlyCompletionAction(selectedTaskId, {
      action: "grade",
      grade: rating,
      note: reviewContent.trim() || acceptanceNote.trim()
    });
    if (isMutationFailed(gradingResult)) {
      setNotice(`验收已提交，但评级暂未完成：${mutationMessage(gradingResult, "请稍后重试评级。")}`);
      const [nextWorkspace, nextClosure, nextRecord] = await Promise.all([
        getWorkspaceData(selectedTaskId),
        getTaskClosureData(selectedTaskId),
        getOrderRecordDetail("enterprise", selectedTaskId)
      ]);
      setWorkspace(nextWorkspace);
      setClosure(nextClosure);
      setRecordDetail(nextRecord);
      setIsSubmitting(false);
      return;
    }

    if (revieweeUserId) {
      const reviewResult = await submitReview(selectedTaskId, {
        revieweeUserId: Number(revieweeUserId),
        rating: gradeToRating(rating),
        reviewContent: reviewContent.trim() || acceptanceNote.trim()
      });
      if (isMutationFailed(reviewResult)) {
        setNotice(`最终评级已完成，但互评暂未写入：${mutationMessage(reviewResult, "请稍后重试互评。")}`);
      } else {
        setNotice(mutationMessage(reviewResult, "验收和评级已写入合作记录。"));
      }
    } else {
      setNotice("验收已提交，但当前接口没有返回人才用户 ID，评级暂未提交。");
    }

    const [nextWorkspace, nextClosure, nextRecord] = await Promise.all([
      getWorkspaceData(selectedTaskId),
      getTaskClosureData(selectedTaskId),
      getOrderRecordDetail("enterprise", selectedTaskId)
    ]);
    setWorkspace(nextWorkspace);
    setClosure(nextClosure);
    setRecordDetail(nextRecord);
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">验收与评级中心</h1>
          <p className="text-slate-500">先选择合作任务，再查看交付附件、验收意见、评级与结算流程。</p>
        </div>
        {selectedTaskId && (
          <Link to={`/enterprise/chat?taskId=${encodeURIComponent(selectedTaskId)}&roomKey=${encodeURIComponent(roomKey)}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">合作任务</h2>
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-500">
              {isLoadingList ? "同步中" : `${taskCards.length} 个`}
            </Badge>
          </div>
          {isLoadingList && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
              正在同步订单记录...
            </div>
          )}
          {taskCards.map((task) => (
            <motion.div whileHover={{ y: -2 }} key={task.taskId}>
              <Card
                className={`cursor-pointer transition-all ${
                  selectedTaskId === task.taskId ? "border-indigo-500 shadow-md ring-1 ring-indigo-500" : "border-slate-200 hover:border-indigo-300"
                }`}
                onClick={() => setSelectedTaskId(task.taskId)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={badgeClass(task.stage)}>
                      {task.stage}
                    </Badge>
                    <span className="text-xs text-slate-400">{task.updatedAt}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-3">{task.title}</h3>
                  <div className="text-sm text-slate-500">人才：{task.counterpartName}</div>
                  <div className="mt-3 text-xs font-medium text-slate-500">{task.amountValue}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {!isLoadingList && taskCards.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
              当前企业账号还没有可验收的合作任务。
            </div>
          )}
        </div>

        <div>
          {selectedTaskId ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                      <div>
                        <Badge variant="outline" className={badgeClass(taskStatus)}>
                          {taskStatus}
                        </Badge>
                        <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">{taskTitle}</h2>
                        <p className="text-slate-600 leading-relaxed">
                          {stringOf(latestProgress?.summary, summary?.nextStep, record?.stageNote, "交付物、进展和验收状态会在这里合并展示。")}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm min-w-[180px]">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">结算状态</p>
                        <p className="text-lg font-bold text-slate-900 mt-2">{settlementStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {isLoadingDetail && (
                      <div className="flex items-center text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 正在读取验收详情...
                      </div>
                    )}

                    <section>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-slate-500" /> 交付附件 ({attachments.length})
                      </h4>
                      {attachments.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {attachments.map((file) => (
                            <AttachmentButton key={file.key} file={file} />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-sm text-slate-500">
                          当前接口还没有返回交付附件。可先回到工作区确认人才是否已提交进展和文件。
                        </div>
                      )}
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">验收意见</h3>
                      <textarea
                        value={acceptanceNote}
                        onChange={(event) => setAcceptanceNote(event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                        rows={4}
                        placeholder="写下本次验收结论..."
                      />
                    </section>

                    <section>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">选择评级</h3>
                      <p className="text-sm text-slate-500 mb-4">评级会写入合作记录和人才信用画像，后续推荐会参考这次结果。</p>
                      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {ratingLevels.map((level) => (
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={level.grade}>
                            <button
                              type="button"
                              onClick={() => setRating(level.grade)}
                              className={`w-full rounded-2xl border-2 p-4 flex flex-col items-center text-center transition-all ${
                                rating === level.grade
                                  ? `shadow-md ring-4 ring-indigo-100 ${level.color}`
                                  : "border-slate-100 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <level.icon className={`w-8 h-8 mb-2 ${rating === level.grade ? "" : "text-slate-400"}`} />
                              <span className="font-bold text-lg mb-1">{level.grade} 级</span>
                              <span className="text-xs font-medium opacity-80">{level.label}</span>
                              <span className="mt-2 text-[11px] text-slate-400">{level.desc}</span>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                      <textarea
                        value={reviewContent}
                        onChange={(event) => setReviewContent(event.target.value)}
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                        rows={3}
                        placeholder="补充评价内容..."
                      />
                    </section>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-amber-500" /> 已有评价
                        </h4>
                        {reviewHistory.length ? (
                          <div className="space-y-3">
                            {reviewHistory.slice(0, 3).map((item: any, index) => (
                              <p key={stringOf(item?.time, index)} className="text-sm text-slate-600">
                                {stringOf(item?.role, item?.reviewer, "评价")}：{stringOf(item?.content, item?.note, item?.rating, "已记录")}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">当前还没有双方互评记录。</p>
                        )}
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <h4 className="font-bold text-slate-900 mb-3">流程节点</h4>
                        <div className="space-y-2">
                          {timeline.slice(0, 4).map((item: any, index) => (
                            <div key={stringOf(item?.title, index)} className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-slate-600 truncate">{stringOf(item?.title, `节点 ${index + 1}`)}</span>
                              <span className="text-slate-400 shrink-0">{stringOf(item?.status, item?.time)}</span>
                            </div>
                          ))}
                          {!timeline.length && <p className="text-sm text-slate-500">关闭流程还没有返回时间线。</p>}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row sm:justify-between gap-4 border-t border-slate-100">
                      <Link to={`/enterprise/workspace?taskId=${encodeURIComponent(selectedTaskId)}&roomKey=${encodeURIComponent(roomKey)}`}>
                        <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                          返回工作区
                        </Button>
                      </Link>
                      <Button
                        disabled={!rating || (!canAccept && !canGrade) || isSubmitting}
                        onClick={handleSubmit}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px]"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        {canAccept || canGrade ? "确认验收并评级" : "当前不可验收"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 min-h-[400px]">
              <CheckCircle2 className="w-12 h-12 mb-4 text-slate-300" />
              <p>选择一个合作任务后查看验收详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
