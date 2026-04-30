import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CalendarClock, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { getBusinessData, sendRecruitingInterviewInvite } from '../services/api';
import { asArray, stringOf } from '../services/workflowFormatters';
import { isKnownInterviewTimeInPast, PAST_INTERVIEW_TIME_MESSAGE } from '../utils/interviewTime';

export type TalentInviteProfile = {
  talentUserId?: string | number;
  platformUserId?: string | number;
  userId?: string | number;
  slug?: string;
  name?: string;
  role?: string;
};

type InviteTask = {
  taskId: string;
  title: string;
  status: string;
  statusCode: string;
  budget: string;
  updatedAt: string;
};

type TalentInviteDialogProps = {
  open: boolean;
  talent: TalentInviteProfile | null;
  onClose: () => void;
};

const closedTaskStatuses = new Set(['CLOSED', 'SETTLED', 'COMPLETED', 'CANCELLED', 'AUTO_CLOSED', 'REJECTED']);

function normalizeInviteTask(item: any): InviteTask {
  return {
    taskId: stringOf(item?.taskId, item?.id),
    title: stringOf(item?.title, '未命名任务'),
    status: stringOf(item?.statusLabel, item?.status, '状态待同步'),
    statusCode: stringOf(item?.statusCode, item?.state, item?.status),
    budget: stringOf(item?.budget, '预算待确认'),
    updatedAt: stringOf(item?.updatedAt, item?.createdAt, '')
  };
}

function isInviteEligibleTask(task: InviteTask) {
  if (!task.taskId) {
    return false;
  }
  const statusCode = task.statusCode.toUpperCase();
  return !closedTaskStatuses.has(statusCode);
}

function resolveTalentUserId(talent: TalentInviteProfile | null) {
  const directId = stringOf(talent?.talentUserId, talent?.platformUserId, talent?.userId);
  if (directId) {
    return directId;
  }
  const slug = stringOf(talent?.slug);
  const slugId = slug.match(/^user-(\d+)$/i);
  return slugId ? slugId[1] : '';
}

export function TalentInviteDialog({ open, talent, onClose }: TalentInviteDialogProps) {
  const [tasks, setTasks] = useState<InviteTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [draft, setDraft] = useState({ interviewAt: '', meetingCode: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const talentUserId = resolveTalentUserId(talent);
  const selectedTask = useMemo(
    () => tasks.find((task) => task.taskId === selectedTaskId) || null,
    [selectedTaskId, tasks]
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    let alive = true;
    setLoading(true);
    setError('');
    setMessage('');
    setDraft({ interviewAt: '', meetingCode: '', note: '' });
    getBusinessData().then((data: any) => {
      if (!alive) {
        return;
      }
      const nextTasks = asArray<any>(data?.tasks)
        .map(normalizeInviteTask)
        .filter(isInviteEligibleTask);
      setTasks(nextTasks);
      setSelectedTaskId((current) => nextTasks.some((task) => task.taskId === current) ? current : nextTasks[0]?.taskId || '');
      setError(data?.requestError || (nextTasks.length ? '' : '当前没有可用于邀约的人才招募任务。'));
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  async function submitInvite(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!talentUserId) {
      setError('缺少人才账号信息，暂时不能发送邀约。');
      return;
    }
    if (!selectedTaskId) {
      setError('先选择一个任务。');
      return;
    }
    if (!draft.interviewAt.trim()) {
      setError('先填写面试时间。');
      return;
    }
    if (isKnownInterviewTimeInPast(draft.interviewAt)) {
      setError(PAST_INTERVIEW_TIME_MESSAGE);
      return;
    }
    if (!draft.meetingCode.trim()) {
      setError('先填写腾讯会议号。');
      return;
    }

    setSubmitting(true);
    const response = await sendRecruitingInterviewInvite({
      taskId: selectedTaskId,
      talentUserId,
      interviewAt: draft.interviewAt.trim(),
      meetingCode: draft.meetingCode.trim(),
      note: draft.note.trim()
    });
    setSubmitting(false);
    if (response?.requestError || response?.status === 'FAILED') {
      setError(response.requestError || response.nextStep || '当前暂时无法发送面试邀约。');
      return;
    }
    setMessage(response?.nextStep || '面试邀约已发送，等待人才确认。');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="talent-invite-title"
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-indigo-600">选择任务邀约</p>
            <h2 id="talent-invite-title" className="mt-1 text-xl font-bold text-slate-900">
              邀约 {stringOf(talent?.name, '这位人才')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{stringOf(talent?.role, '先选择任务，再发送面试安排。')}</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="关闭邀约弹窗"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submitInvite} className="space-y-5 px-6 py-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">选择任务</span>
            <select
              value={selectedTaskId}
              onChange={(event) => setSelectedTaskId(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
              disabled={loading || submitting || tasks.length === 0}
            >
              {tasks.map((task) => (
                <option key={task.taskId} value={task.taskId}>{task.title}</option>
              ))}
            </select>
          </label>

          {selectedTask && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="font-medium text-slate-900">{selectedTask.title}</div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                <span>{selectedTask.status}</span>
                <span>{selectedTask.budget}</span>
                {selectedTask.updatedAt && <span>更新 {selectedTask.updatedAt}</span>}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">面试时间</span>
              <Input
                value={draft.interviewAt}
                onChange={(event) => setDraft((current) => ({ ...current, interviewAt: event.target.value }))}
                placeholder="明天 14:00 或 2026-04-27 14:00"
                className="mt-2 h-11 rounded-lg border-slate-200 bg-white"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">腾讯会议号</span>
              <Input
                value={draft.meetingCode}
                onChange={(event) => setDraft((current) => ({ ...current, meetingCode: event.target.value }))}
                placeholder="例如 778899"
                className="mt-2 h-11 rounded-lg border-slate-200 bg-white"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">补充说明</span>
            <textarea
              value={draft.note}
              onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
              placeholder="可写面试准备事项、作品要求或沟通重点。"
              className="mt-2 h-24 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
            />
          </label>

          {loading && <p className="text-sm text-slate-500">正在读取企业任务...</p>}
          {error && <p className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          {message && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <p>{message}</p>
              <Link to={`/enterprise/recruiting?taskId=${encodeURIComponent(selectedTaskId)}`} className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline">
                <CalendarClock className="h-4 w-4" /> 查看招聘处理页
              </Link>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" className="rounded-lg border-slate-200" onClick={onClose} disabled={submitting}>
              取消
            </Button>
            <Button type="submit" className="rounded-lg bg-slate-900 text-white hover:bg-slate-800" disabled={submitting || loading || tasks.length === 0}>
              {submitting ? '发送中...' : '发送面试邀约'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
