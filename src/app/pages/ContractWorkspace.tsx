import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AttachmentButton } from '../components/AttachmentButton';
import { useStore } from '../store';
import {
  FileText, CheckCircle2, MessageSquare, Download, Upload,
  Clock, AlertCircle, ChevronRight, FileArchive, Zap, Flag, Calendar, Wallet, XCircle
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import {
  getWorkspaceData,
  submitEarlyCompletionAction,
  submitTaskCancellationAction,
  submitTaskProgress,
  uploadTaskAttachmentAsset
} from '../services/api';

interface WorkspaceNode {
  id: string;
  milestoneId: string;
  title: string;
  summary: string;
  status: string;
  progress: string;
  plannedDate: string;
  stageType: string;
  amount: string;
  amountValue: string;
  payoutRatio: string;
  updatedAt: string;
  aiReviewSummary: string;
  attachments: WorkspaceAttachment[];
  isCurrent: boolean;
  isCompleted: boolean;
}

interface WorkspaceAttachment {
  key: string;
  label: string;
  href: string;
  note?: string;
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function stringOf(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const next = String(value).trim();
    if (next) return next;
  }
  return '';
}

function isActiveStatus(value: unknown) {
  return /进行中|执行中|协作中|推进中|当前|active|in progress/i.test(String(value || ''));
}

function isCompletedStatus(value: unknown) {
  const text = String(value || '');
  if (/未完成|待完成/.test(text)) return false;
  return /已完成|完成$|完成[，。,.]|已交付|已验收|completed|done/i.test(text);
}

function numericAmount(value: unknown) {
  const amount = Number.parseFloat(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(value: number) {
  return value > 0 ? `￥${Number(value.toFixed(2)).toLocaleString('zh-CN')}` : '￥0';
}

function isMutationBlocked(response: any) {
  return Boolean(response?.requestError || response?.actionBlocked || response?.status === 'BLOCKED' || response?.status === 'FAILED');
}

function attachmentLabel(attachment: any) {
  if (typeof attachment === 'string') return attachment;
  return stringOf(attachment?.label, attachment?.name, attachment?.filename, attachment?.fileName, attachment?.title, '文件');
}

function attachmentHref(attachment: any) {
  if (typeof attachment === 'string') return attachment;
  return stringOf(attachment?.downloadHref, attachment?.downloadUrl, attachment?.previewUrl, attachment?.url, attachment?.href, attachment?.path);
}

function normalizeAttachment(item: any, index = 0): WorkspaceAttachment {
  return {
    key: stringOf(item?.key, item?.id, item?.uploadId, attachmentLabel(item), `file-${index}`),
    label: attachmentLabel(item),
    href: attachmentHref(item),
    note: stringOf(item?.note, item?.group, item?.category, item?.source)
  };
}

function normalizeNodes(list: any[]): WorkspaceNode[] {
  return asArray(list).map((item: any, index) => {
    const status = stringOf(item?.status, item?.state, item?.phase, '等待同步');
    const id = stringOf(item?.nodeId, item?.id, item?.milestoneId, item?.key, `node-${index + 1}`);
    return {
      id,
      milestoneId: stringOf(item?.milestoneId, id),
      title: stringOf(item?.title, item?.name, item?.label, `里程碑 ${index + 1}`),
      summary: stringOf(item?.updateSummary, item?.summary, item?.description, item?.note, item?.progressText, '还没有同步说明。'),
      status,
      progress: stringOf(item?.progress, item?.completion, item?.completionPercent, status),
      plannedDate: stringOf(item?.plannedDate, item?.dueDate, item?.deadline, item?.updatedAt),
      stageType: stringOf(item?.stageType, item?.type, item?.kind, '里程碑'),
      amount: stringOf(item?.amount, item?.milestoneAmount),
      amountValue: stringOf(item?.amountValue, item?.milestoneAmountValue),
      payoutRatio: stringOf(item?.payoutRatio, item?.ratio),
      updatedAt: stringOf(item?.updatedAt, item?.time, item?.submittedAt),
      aiReviewSummary: stringOf(item?.aiReview?.summary, item?.aiReviewSummary, item?.reviewSummary),
      attachments: asArray(item?.attachmentFiles || item?.talentSubmission?.attachmentFiles || item?.attachments || item?.files).map(normalizeAttachment),
      isCurrent: Boolean(item?.isCurrent || item?.current || isActiveStatus(status)),
      isCompleted: Boolean(item?.isCompleted || item?.done || isCompletedStatus(status))
    };
  });
}

function nodeTone(node: WorkspaceNode) {
  if (node.isCompleted) return 'completed';
  if (node.isCurrent || isActiveStatus(node.status)) return 'current';
  return 'pending';
}

function statusLabel(node: WorkspaceNode, isEnterprise: boolean) {
  const tone = nodeTone(node);
  if (tone === 'completed') return '已完成';
  if (tone === 'current') return isEnterprise ? '进行中' : '可提交进展';
  return '待开始';
}

function buildQuery(query: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function ContractWorkspace() {
  const { currentUser } = useStore();
  const [searchParams] = useSearchParams();
  const [workspace, setWorkspace] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressText, setProgressText] = useState('');
  const [supportNeeded, setSupportNeeded] = useState('');
  const [progressCompletion, setProgressCompletion] = useState('50');
  const [progressFiles, setProgressFiles] = useState<File[]>([]);
  const [progressMessage, setProgressMessage] = useState('');
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);
  const [selectedProgressNodeId, setSelectedProgressNodeId] = useState('');
  const [earlyCompletionNote, setEarlyCompletionNote] = useState('当前关键交付物已经覆盖主要范围，请进入提前完成确认。');
  const [earlyCompletionGrade, setEarlyCompletionGrade] = useState('A');
  const [cancellationReason, setCancellationReason] = useState('本次协作需要中止，请对方确认取消并保留历史记录。');
  const [lifecycleMessage, setLifecycleMessage] = useState('');
  const [isSubmittingLifecycle, setIsSubmittingLifecycle] = useState('');

  const isEnterprise = currentUser?.role !== 'TALENT';
  const requestedTaskId = searchParams.get('taskId') || '';

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      if (!requestedTaskId) {
        setWorkspace(null);
        setError('');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      const payload = await getWorkspaceData(requestedTaskId);
      if (cancelled) return;
      if (payload.requestError) {
        setError(payload.requestError);
      }
      setWorkspace(payload);
      setIsLoading(false);
    }

    loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, [requestedTaskId]);

  const summary = workspace?.summary || {};
  const taskDetail = workspace?.taskDetail || {};
  const taskConfirmation = workspace?.taskConfirmation || {};
  const focus = workspace?.focus || {};
  const taskId = stringOf(summary.taskId, taskDetail.taskId, requestedTaskId);
  const roomKey = stringOf(summary.roomKey, workspace?.taskRoom?.roomKey, workspace?.roomKey);
  const milestones = useMemo(
    () => normalizeNodes(workspace?.collaborationNodes || workspace?.milestones || []),
    [workspace]
  );
  const assetItems = useMemo(
    () => asArray(workspace?.assetLibrary).map(normalizeAttachment),
    [workspace]
  );
  const completedCount = milestones.filter((node) => node.isCompleted).length;
  const progressPercent = milestones.length ? Math.round((completedCount / milestones.length) * 100) : 0;
  const currentNode = milestones.find((node) => node.isCurrent) || milestones.find((node) => !node.isCompleted) || milestones[0];
  const completedAmount = milestones
    .filter((node) => node.isCompleted)
    .reduce((total, node) => total + numericAmount(node.amountValue || node.amount), 0);
  const progressTargetNode = milestones.find((node) => node.id === selectedProgressNodeId) || currentNode;
  const title = stringOf(summary.taskName, taskDetail.title, currentNode?.title, taskId ? `合同 ${taskId}` : '合同工作区');
  const lead = stringOf(focus.summary, summary.nextStep, taskDetail.summary, '在同一个工作区里查看里程碑、交付物、消息和验收状态。');
  const partnerName = isEnterprise
    ? stringOf(summary.counterpartName, summary.talentName, summary.talent, taskDetail.talentName, '合作方待同步')
    : stringOf(summary.counterpartName, summary.enterpriseName, summary.business, taskDetail.businessName, '合作方待同步');
  const amount = stringOf(summary.budget, summary.amount, taskDetail.budget, taskDetail.budgetRange, '待确认');
  const remainingTime = stringOf(summary.remainingTime, summary.remainingDays, taskDetail.period, taskDetail.timeline, '待同步');
  const baseQuery = buildQuery({ taskId, room: roomKey, roomKey });
  const taskConfirmationStatus = stringOf(taskConfirmation.status);
  const taskConfirmationPendingAudience = stringOf(taskConfirmation.pendingAudience).toLowerCase();
  const isTaskConfirmationPending = Boolean(
    taskConfirmationPendingAudience && taskConfirmationPendingAudience !== 'none'
  ) || ['待人才确认', '待企业修改'].includes(taskConfirmationStatus);
  const workspaceStatusLabel = isTaskConfirmationPending
    ? stringOf(taskConfirmationStatus, '待确认')
    : stringOf(summary.status, currentNode?.status, '等待同步');
  const chatHref = `${isEnterprise ? '/enterprise/chat' : '/talent/chat'}${baseQuery}`;
  const acceptanceHref = `${isEnterprise ? '/enterprise/acceptance' : '/talent/acceptance'}${baseQuery}`;
  const primaryActionHref = isTaskConfirmationPending ? chatHref : acceptanceHref;
  const primaryActionLabel = isTaskConfirmationPending
    ? (isEnterprise ? '查看确认单' : '确认任务单')
    : (isEnterprise ? '去验收' : '查看验收状态');
  const canSubmitProgress = !isTaskConfirmationPending && !isEnterprise && Boolean(taskId && progressTargetNode && !progressTargetNode.isCompleted && nodeTone(progressTargetNode) === 'current');
  const currentAudience = isEnterprise ? 'enterprise' : 'talent';
  const earlyCompletion = workspace?.earlyCompletion || taskDetail.earlyCompletion || {};
  const cancellationRequest = workspace?.cancellationRequest || taskDetail.cancellationRequest || {};
  const earlyStatus = stringOf(earlyCompletion.status, '未发起');
  const cancellationStatus = stringOf(cancellationRequest.status, '未发起');
  const cancellationInitiator = stringOf(cancellationRequest.initiatorAudience).toLowerCase();
  const canRequestEarlyCompletion = isEnterprise
    && Boolean(taskId)
    && !isTaskConfirmationPending
    && !/待人才同意提前完成|待企业评级|已完成评级/i.test(earlyStatus)
    && !/待对方确认取消|已取消/i.test(cancellationStatus);
  const canTalentResolveEarlyCompletion = !isEnterprise && earlyStatus === '待人才同意提前完成';
  const canGradeEarlyCompletion = isEnterprise && earlyStatus === '待企业评级';
  const canRequestCancellation = Boolean(taskId)
    && !/待对方确认取消|已取消/i.test(cancellationStatus)
    && earlyStatus !== '已完成评级';
  const canResolveCancellation = Boolean(taskId)
    && cancellationStatus === '待对方确认取消'
    && Boolean(cancellationInitiator)
    && cancellationInitiator !== currentAudience;

  if (!requestedTaskId) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <Card className="border border-dashed border-slate-200 bg-white shadow-sm">
          <CardContent className="p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FileText className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">请选择一个合作任务</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              合同工作区现在作为单个任务的二级页面使用。请先从任务列表、交易记录或收入记录进入对应任务，再查看里程碑、金额、交付物和验收状态。
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={isEnterprise ? '/enterprise/records' : '/talent/records'}>
                <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                  {isEnterprise ? '去交易记录选择任务' : '去收入记录选择任务'}
                </Button>
              </Link>
              <Link to={isEnterprise ? '/enterprise' : '/talent/tasks'}>
                <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                  {isEnterprise ? '返回企业工作台' : '查看任务广场'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmitProgress = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmitProgress) {
      setError('当前节点暂不能提交进展。');
      return;
    }
    if (!progressText.trim()) {
      setError('请先填写本次进展内容。');
      return;
    }

    setIsSubmittingProgress(true);
    setError('');
    setProgressMessage('');

    const uploadedFiles = [];
    for (const file of progressFiles) {
      const uploaded = await uploadTaskAttachmentAsset(taskId, file, {
        scene: 'TASK_PROGRESS',
        source: 'PROGRESS_UPDATE'
      });
      if ((uploaded as any).requestError) {
        setError((uploaded as any).requestError);
        setIsSubmittingProgress(false);
        return;
      }
      uploadedFiles.push(uploaded);
    }

    const milestoneNumber = Number.parseInt(String(progressTargetNode?.milestoneId || ''), 10);
    const response = await submitTaskProgress(taskId, {
      stage: progressTargetNode?.title || progressTargetNode?.stageType || '协作进展同步',
      milestoneId: Number.isFinite(milestoneNumber) ? milestoneNumber : null,
      progressText: progressText.trim(),
      supportNeeded: supportNeeded.trim(),
      completionPercent: Number.parseInt(progressCompletion, 10),
      attachmentFiles: uploadedFiles
    }) as any;

    setIsSubmittingProgress(false);
    if (response.requestError || response.status === 'BLOCKED') {
      setError(response.requestError || response.nextStep || '进展提交失败，请稍后再试。');
      return;
    }

    setProgressMessage(response.nextStep || '进展已提交并同步到工作区。');
    setProgressText('');
    setSupportNeeded('');
    setProgressFiles([]);
    setSelectedProgressNodeId('');
    const latest = await getWorkspaceData(taskId);
    setWorkspace(latest);
  };

  async function refreshWorkspace() {
    if (!taskId) return;
    const latest = await getWorkspaceData(taskId);
    setWorkspace(latest);
  }

  async function handleEarlyCompletion(action: 'request' | 'approve' | 'reject' | 'grade') {
    if (!taskId) return;
    setError('');
    setLifecycleMessage('');
    setIsSubmittingLifecycle(`early-${action}`);
    const response = await submitEarlyCompletionAction(taskId, {
      action,
      note: earlyCompletionNote.trim(),
      grade: earlyCompletionGrade
    }) as any;
    setIsSubmittingLifecycle('');
    if (isMutationBlocked(response)) {
      setError(response.requestError || response.actionMessage || response.nextStep || '提前完成处理失败，请稍后再试。');
      return;
    }
    setLifecycleMessage(response.nextStep || '提前完成流程已同步。');
    await refreshWorkspace();
  }

  async function handleCancellation(action: 'request' | 'approve' | 'reject') {
    if (!taskId) return;
    setError('');
    setLifecycleMessage('');
    setIsSubmittingLifecycle(`cancel-${action}`);
    const response = await submitTaskCancellationAction(taskId, {
      action,
      reason: cancellationReason.trim()
    }) as any;
    setIsSubmittingLifecycle('');
    if (isMutationBlocked(response)) {
      setError(response.requestError || response.actionMessage || response.nextStep || '取消协作处理失败，请稍后再试。');
      return;
    }
    setLifecycleMessage(response.nextStep || '取消协作流程已同步。');
    await refreshWorkspace();
  }

  function selectProgressNode(node: WorkspaceNode) {
    setSelectedProgressNodeId(node.id);
    window.setTimeout(() => {
      document.getElementById('talent-progress-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">合同工作区</h1>
            <Badge variant="success" className="px-2 py-0.5 rounded-md font-semibold tracking-wide">
              {workspaceStatusLabel}
            </Badge>
          </div>
          <p className="text-slate-500 font-medium">{title} <span className="mx-2 text-slate-300">|</span> 合作方：{partnerName}</p>
        </div>
        <div className="flex space-x-3">
          <Link to={chatHref}>
            <Button variant="outline" className="rounded-xl border-slate-200 gap-2 shadow-sm font-semibold text-slate-700 bg-white hover:bg-slate-50">
              <MessageSquare className="w-4 h-4" /> 合同消息
            </Button>
          </Link>
          <Link to={primaryActionHref}>
            <Button variant="primary" className="rounded-xl shadow-md gap-2 font-semibold bg-indigo-600 hover:bg-indigo-700 border-none">
              {primaryActionLabel}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
          正在同步真实工作区数据...
        </div>
      )}

      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8 text-sm">
              <div>
                <p className="text-slate-500 font-medium mb-1">合同金额</p>
                <p className="font-bold text-slate-900 text-lg">{amount}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">总进度</p>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="font-bold text-indigo-700">{progressPercent}%</span>
                </div>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">当前节点金额</p>
                <p className="font-bold text-slate-900 text-lg">{currentNode?.amount || '待确认'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">已完成累计</p>
                <p className="font-bold text-emerald-700 text-lg">{formatAmount(completedAmount)}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium mb-1">剩余时间</p>
                <p className="font-bold text-amber-600 text-lg flex items-center"><Clock className="w-4 h-4 mr-1" /> {remainingTime}</p>
              </div>
            </div>

            <Link to={`${isEnterprise ? '/enterprise/records' : '/talent/records'}/${encodeURIComponent(taskId)}${baseQuery}`}>
              <div className="flex items-center text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors">
                <FileArchive className="w-4 h-4 mr-2" /> 查看合作记录
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <Flag className="w-5 h-5 mr-2 text-indigo-500" />
            里程碑与交付物
          </h2>
          <div className="space-y-4 relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-200 z-0"></div>

            {milestones.map((node, idx) => {
              const tone = isTaskConfirmationPending && !node.isCompleted ? 'pending' : nodeTone(node);
              const nodeStatusText = isTaskConfirmationPending && !node.isCompleted ? '待确认' : statusLabel(node, isEnterprise);
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative z-10 flex gap-4"
                >
                  <div className={`mt-5 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm ${
                    tone === 'completed' ? 'bg-emerald-500 text-white' :
                    tone === 'current' ? 'bg-amber-500 text-white animate-pulse' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {tone === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                     tone === 'current' ? <AlertCircle className="w-6 h-6" /> :
                     <span className="font-bold text-sm">{idx + 1}</span>}
                  </div>

                  <Card className={`flex-1 border transition-all duration-300 ${
                    tone === 'current' ? 'border-amber-300 shadow-md ring-2 ring-amber-50' :
                    'border-slate-200/60 shadow-sm hover:shadow-md bg-white'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-base font-bold ${tone === 'current' ? 'text-amber-900' : 'text-slate-900'}`}>
                          {node.title}
                        </h3>
                        <Badge variant={tone === 'completed' ? 'success' : tone === 'current' ? 'warning' : 'outline'} className="rounded-md">
                          {nodeStatusText}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-500 mb-4 font-medium flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" /> {node.plannedDate ? `计划日期: ${node.plannedDate}` : node.stageType}
                        {(node.amount || node.payoutRatio) && (
                          <span className="ml-3 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {node.amount || '金额待确认'}{node.payoutRatio ? ` · ${node.payoutRatio}` : ''}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {node.summary}
                      </p>

                      <div className="space-y-4 mt-6 pt-5 border-t border-slate-100">
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">交付物 ({node.attachments.length})</h4>
                          {node.attachments.length ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {node.attachments.map(file => (
                                <AttachmentButton key={file.key} file={{ ...file, name: file.label }} compact />
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                              当前里程碑还没有同步交付文件。
                            </div>
                          )}
                        </div>

                        {node.aiReviewSummary && (
                          <div className="flex items-start space-x-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-4 rounded-xl border border-indigo-100/50 mt-4">
                            <Zap className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                            <div className="text-sm">
                              <span className="font-semibold text-indigo-900 mr-1">AI 总结进展:</span>
                              <span className="text-indigo-800/80 leading-relaxed">{node.aiReviewSummary}</span>
                            </div>
                          </div>
                        )}

                        {!isEnterprise && !isTaskConfirmationPending && tone === 'current' && (
                          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-indigo-900">在这个里程碑提交交付物</p>
                              <p className="mt-1 text-xs text-indigo-700">提交后会挂到「{node.title}」，企业验收页和记录页会同步读取。</p>
                            </div>
                            <Button type="button" onClick={() => selectProgressNode(node)} className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                              <Upload className="mr-2 h-4 w-4" /> 提交交付物
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {milestones.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
                这份合同还没有同步里程碑。确认合作后，后端应返回 `/workspace` 的 `collaborationNodes` 或 `milestones`。
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <FileArchive className="w-5 h-5 mr-2 text-slate-400" />
            快速操作
          </h2>
          <Card className="bg-white shadow-sm border border-slate-200/60">
            <CardContent className="p-0">
              <Link to={chatHref} className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group">
                <div className="flex items-center text-slate-700 font-medium">
                  <MessageSquare className="w-4 h-4 mr-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  进入合同消息
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
              </Link>
              <Link to={`${isEnterprise ? '/enterprise/records' : '/talent/records'}/${encodeURIComponent(taskId)}${baseQuery}`} className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group">
                <div className="flex items-center text-slate-700 font-medium">
                  <Wallet className="w-4 h-4 mr-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  查看记录与结算
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
              </Link>
              <Link to={isTaskConfirmationPending ? chatHref : acceptanceHref} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group">
                <div className="flex items-center text-slate-700 font-medium">
                  <AlertCircle className="w-4 h-4 mr-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  {isTaskConfirmationPending ? '查看任务确认单' : '查看验收状态'}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
	              </Link>
	            </CardContent>
	          </Card>

          <Card className="bg-white shadow-sm border border-slate-200/60">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-2 text-base">协作决策</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                提前完成和取消协作会写入同一条任务生命周期，并同步到通知、审批、记录和结算读模型。
              </p>

              {lifecycleMessage && (
                <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                  {lifecycleMessage}
                </div>
              )}

              <div className="space-y-5">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-indigo-950">提前完成</p>
                    <Badge variant="outline" className="rounded-md bg-white">{earlyStatus}</Badge>
                  </div>
                  <textarea
                    value={earlyCompletionNote}
                    disabled={Boolean(isSubmittingLifecycle)}
                    onChange={(event) => setEarlyCompletionNote(event.target.value)}
                    className="min-h-20 w-full resize-none rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                    placeholder="补充提前完成、同意、驳回或评级说明..."
                  />
                  {earlyCompletion.aiReviewSummary && (
                    <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs leading-5 text-indigo-800">{stringOf(earlyCompletion.aiReviewSummary)}</p>
                  )}
                  {canGradeEarlyCompletion && (
                    <select
                      value={earlyCompletionGrade}
                      disabled={Boolean(isSubmittingLifecycle)}
                      onChange={(event) => setEarlyCompletionGrade(event.target.value)}
                      className="mt-3 h-10 w-full rounded-xl border border-indigo-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="S">S 级 · 100% 结算</option>
                      <option value="A">A 级 · 80% 结算</option>
                      <option value="B">B 级 · 30% 结算</option>
                    </select>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canRequestEarlyCompletion && (
                      <Button
                        type="button"
                        disabled={Boolean(isSubmittingLifecycle)}
                        onClick={() => handleEarlyCompletion('request')}
                        className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <Zap className="mr-2 h-4 w-4" /> 申请提前完成
                      </Button>
                    )}
                    {canTalentResolveEarlyCompletion && (
                      <>
                        <Button
                          type="button"
                          disabled={Boolean(isSubmittingLifecycle)}
                          onClick={() => handleEarlyCompletion('approve')}
                          className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> 同意提前完成
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={Boolean(isSubmittingLifecycle)}
                          onClick={() => handleEarlyCompletion('reject')}
                          className="rounded-xl border-slate-200 bg-white text-slate-700 disabled:opacity-50"
                        >
                          <XCircle className="mr-2 h-4 w-4" /> 继续执行
                        </Button>
                      </>
                    )}
                    {canGradeEarlyCompletion && (
                      <Button
                        type="button"
                        disabled={Boolean(isSubmittingLifecycle)}
                        onClick={() => handleEarlyCompletion('grade')}
                        className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> 提交最终评级
                      </Button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-rose-950">取消协作</p>
                    <Badge variant="outline" className="rounded-md bg-white">{cancellationStatus}</Badge>
                  </div>
                  <textarea
                    value={cancellationReason}
                    disabled={Boolean(isSubmittingLifecycle)}
                    onChange={(event) => setCancellationReason(event.target.value)}
                    className="min-h-20 w-full resize-none rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100 disabled:opacity-60"
                    placeholder="说明取消、同意或拒绝取消的原因..."
                  />
                  {cancellationRequest.reason && (
                    <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs leading-5 text-rose-800">对方说明：{stringOf(cancellationRequest.reason)}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canRequestCancellation && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={Boolean(isSubmittingLifecycle)}
                        onClick={() => handleCancellation('request')}
                        className="rounded-xl border-rose-200 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" /> 发起取消申请
                      </Button>
                    )}
                    {canResolveCancellation && (
                      <>
                        <Button
                          type="button"
                          disabled={Boolean(isSubmittingLifecycle)}
                          onClick={() => handleCancellation('approve')}
                          className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          同意取消
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={Boolean(isSubmittingLifecycle)}
                          onClick={() => handleCancellation('reject')}
                          className="rounded-xl border-slate-200 bg-white text-slate-700 disabled:opacity-50"
                        >
                          拒绝取消
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

	          <Card className="bg-white shadow-sm border border-slate-200/60 mt-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-4 text-base">当前节点</h3>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-5">
                <p className="font-bold text-slate-900">{currentNode?.title || '等待同步'}</p>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{currentNode?.summary || lead}</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">合同编号</span>
                  <span className="font-semibold text-slate-700">{taskId || '待同步'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">附件数量</span>
                  <span className="font-semibold text-slate-700">{assetItems.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="talent-progress-form" className="bg-white shadow-sm border border-slate-200/60">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-2 text-base">提交里程碑交付物</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {isEnterprise
                  ? '企业端在这里查看人才提交后的进展与附件；提交操作由人才端完成。'
                  : canSubmitProgress
                    ? `当前提交到「${progressTargetNode?.title || '当前节点'}」，进展会同步到企业端工作区、验收和记录。`
                    : '待开始或已完成节点不能继续提交进展。'}
              </p>

              {progressMessage && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {progressMessage}
                </div>
              )}

              {!isEnterprise && (
                <form onSubmit={handleSubmitProgress} className="space-y-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">目标里程碑：</span>
                    {progressTargetNode?.title || '等待同步'}
                  </div>
                  <textarea
                    value={progressText}
                    disabled={!canSubmitProgress || isSubmittingProgress}
                    onChange={(event) => setProgressText(event.target.value)}
                    className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                    placeholder="这次完成了什么、有哪些文件、还需要企业确认什么..."
                  />
                  <textarea
                    value={supportNeeded}
                    disabled={!canSubmitProgress || isSubmittingProgress}
                    onChange={(event) => setSupportNeeded(event.target.value)}
                    className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                    placeholder="需要协助的事项，可选"
                  />
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">当前完成度</label>
                    <select
                      value={progressCompletion}
                      disabled={!canSubmitProgress || isSubmittingProgress}
                      onChange={(event) => setProgressCompletion(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                    >
                      <option value="25">25% · 刚开始推进</option>
                      <option value="50">50% · 已有阶段产出</option>
                      <option value="75">75% · 接近完成</option>
                      <option value="100">100% · 完成并进入下一节点</option>
                    </select>
                  </div>
                  <label className={`flex cursor-pointer items-center justify-center rounded-xl border border-dashed px-4 py-3 text-sm font-semibold transition ${
                    canSubmitProgress ? 'border-slate-300 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50' : 'border-slate-200 text-slate-300'
                  }`}>
                    <Upload className="w-4 h-4 mr-2" /> 添加进展附件
                    <input
                      type="file"
                      multiple
                      disabled={!canSubmitProgress || isSubmittingProgress}
                      className="hidden"
                      onChange={(event) => setProgressFiles(Array.from(event.target.files || []))}
                    />
                  </label>
                  {progressFiles.length > 0 && (
                    <div className="space-y-2">
                      {progressFiles.map((file) => (
                        <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <span className="truncate">{file.name}</span>
                          <button type="button" className="text-slate-400 hover:text-rose-500" onClick={() => setProgressFiles((items) => items.filter((item) => item !== file))}>
                            移除
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={!canSubmitProgress || isSubmittingProgress}
                    className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmittingProgress ? '提交中...' : '提交进展'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
