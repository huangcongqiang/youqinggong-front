import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, Filter, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  getRecruitingWorkspaceData,
  recordRecruitingInterviewOutcome,
  sendRecruitingInterviewInvite
} from '../services/api';
import { isKnownInterviewTimeInPast, PAST_INTERVIEW_TIME_MESSAGE } from '../utils/interviewTime';
import { resolveRecruitingSuccessRoute } from './enterpriseRecruitingRoute';

interface RecruitingApplicant {
  id: string;
  taskId: string;
  talentUserId: string;
  slug: string;
  name: string;
  role: string;
  avatar?: string;
  status: string;
  statusLabel: string;
  applyAt: string;
  rate: string;
  summary: string;
  tags: string[];
  signals: string[];
  roomKey: string;
  interview?: {
    time?: string;
    meetingCode?: string;
    note?: string;
    state?: string;
  };
  autoClosedReason?: string;
}

const tabDefs = [
  { id: 'pending', label: '待处理' },
  { id: 'interviewing', label: '面试/沟通中' },
  { id: 'hired', label: '已确认合作' },
  { id: 'rejected', label: '已关闭' },
  { id: 'all', label: '全部申请' }
];

const inviteListButtonClass =
  'border-indigo-100 bg-indigo-50 text-indigo-700 shadow-none hover:border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800';
const inviteSubmitButtonClass = 'bg-slate-900 text-white shadow-sm hover:bg-slate-800';
const confirmCooperationButtonClass =
  'border-emerald-100 bg-emerald-50 text-emerald-700 shadow-none hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800';
const workspaceButtonClass =
  'border-slate-200 bg-slate-50 text-slate-700 shadow-none hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900';

function stringOf(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const next = String(value).trim();
    if (next) return next;
  }
  return '';
}

function normalizeApplicant(raw: any, index = 0): RecruitingApplicant {
  const status = stringOf(raw?.status, raw?.stage, 'APPLIED').toUpperCase();
  return {
    id: stringOf(raw?.id, raw?.applicationId, `application-${index + 1}`),
    taskId: stringOf(raw?.taskId),
    talentUserId: stringOf(raw?.talentUserId, raw?.platformUserId, raw?.userId),
    slug: stringOf(raw?.slug, raw?.talentSlug, raw?.talentUserId),
    name: stringOf(raw?.name, raw?.talentName, '申请人'),
    role: stringOf(raw?.role, raw?.headline, '职位待补充'),
    avatar: stringOf(raw?.avatar, raw?.avatarUrl),
    status,
    statusLabel: stringOf(raw?.statusLabel, status),
    applyAt: stringOf(raw?.applyAt, raw?.submittedAt, raw?.createdAt, '时间待同步'),
    rate: stringOf(raw?.rate, raw?.quote, raw?.proposedRate, raw?.budget, '待确认'),
    summary: stringOf(raw?.summary, raw?.intro, raw?.coverLetter, '先查看这位申请人的标签、作品和申请状态，再决定是否约面试。'),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(String) : [],
    signals: Array.isArray(raw?.signals) ? raw.signals.map(String) : [],
    roomKey: stringOf(raw?.roomKey, raw?.room),
    interview: raw?.interview || null,
    autoClosedReason: stringOf(raw?.autoClosedReason)
  };
}

function normalizeStatusGroup(status: string) {
  const normalized = status.toUpperCase();
  if (['CONFIRMED', 'AUTO_CONFIRMED', 'SELECTED'].includes(normalized)) return 'hired';
  if (['AUTO_CLOSED', 'CLOSED', 'REJECTED', 'INTERVIEW_REJECTED', 'INTERVIEW_FAILED'].includes(normalized)) return 'rejected';
  if (['INTERVIEW_PENDING', 'INTERVIEW_ACCEPTED'].includes(normalized)) return 'interviewing';
  return 'pending';
}

export function EnterpriseRecruiting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [workspace, setWorkspace] = useState<Record<string, any> | null>(null);
  const [inviteApplicant, setInviteApplicant] = useState<RecruitingApplicant | null>(null);
  const [inviteDraft, setInviteDraft] = useState({ interviewAt: '', meetingCode: '', note: '' });

  const taskId = searchParams.get('taskId') || '';

  async function loadRecruitingData() {
    setIsLoading(true);
    setError('');
    const payload = await getRecruitingWorkspaceData(taskId);
    if (payload.requestError) {
      setError(payload.requestError);
    }
    setWorkspace(payload);
    setIsLoading(false);
  }

  useEffect(() => {
    loadRecruitingData();
  }, [taskId]);

  const applicants = useMemo(() => {
    const items = Array.isArray(workspace?.applications) ? workspace?.applications : [];
    return items.map(normalizeApplicant);
  }, [workspace]);

  const tabs = useMemo(() => {
    return tabDefs.map((tab) => {
      const count = tab.id === 'all'
        ? applicants.length
        : applicants.filter((item) => normalizeStatusGroup(item.status) === tab.id).length;
      return { ...tab, count };
    });
  }, [applicants]);

  const filteredApplicants = applicants.filter((applicant) => {
    const tabMatched = activeTab === 'all' || normalizeStatusGroup(applicant.status) === activeTab;
    const query = searchQuery.trim().toLowerCase();
    const queryMatched = !query ||
      applicant.name.toLowerCase().includes(query) ||
      applicant.role.toLowerCase().includes(query) ||
      applicant.summary.toLowerCase().includes(query) ||
      applicant.tags.some((tag) => tag.toLowerCase().includes(query));
    return tabMatched && queryMatched;
  });

  async function runMutation(actionId: string, action: () => Promise<any>) {
    setIsMutating(actionId);
    setError('');
    setMessage('');
    const response = await action();
    if (response?.requestError || response?.status === 'FAILED') {
      setError(response.requestError || response.nextStep || '操作失败，请稍后再试。');
      setIsMutating('');
      return false;
    }
    setMessage(response?.nextStep || response?.message || '操作已提交。');
    setIsMutating('');
    const successRoute = resolveRecruitingSuccessRoute(actionId, response);
    if (successRoute) {
      navigate(successRoute);
      return true;
    }
    await loadRecruitingData();
    return true;
  }

  const handleInvite = (applicant: RecruitingApplicant) => {
    setError('');
    setMessage('');
    setInviteApplicant(applicant);
    setInviteDraft({ interviewAt: '', meetingCode: '', note: '' });
  };

  const closeInviteDialog = () => {
    if (isMutating.startsWith('invite-')) {
      return;
    }
    setInviteApplicant(null);
    setInviteDraft({ interviewAt: '', meetingCode: '', note: '' });
  };

  const submitInvite = async () => {
    if (!inviteApplicant?.talentUserId || !(inviteApplicant.taskId || taskId)) {
      setError('缺少申请人或任务信息，暂时不能发送邀约。');
      return;
    }
    if (!inviteDraft.interviewAt.trim()) {
      setError('先填写面试时间。');
      return;
    }
    if (isKnownInterviewTimeInPast(inviteDraft.interviewAt)) {
      setError(PAST_INTERVIEW_TIME_MESSAGE);
      return;
    }
    if (!inviteDraft.meetingCode.trim()) {
      setError('先填写腾讯会议号。');
      return;
    }

    const ok = await runMutation(`invite-${inviteApplicant.id}`, () => sendRecruitingInterviewInvite({
      taskId: inviteApplicant.taskId || taskId,
      talentUserId: inviteApplicant.talentUserId,
      interviewAt: inviteDraft.interviewAt.trim(),
      meetingCode: inviteDraft.meetingCode.trim(),
      note: inviteDraft.note.trim()
    }));

    if (ok) {
      setInviteApplicant(null);
      setInviteDraft({ interviewAt: '', meetingCode: '', note: '' });
    }
  };

  const handleReject = (applicant: RecruitingApplicant) => {
    runMutation(`reject-${applicant.id}`, () => recordRecruitingInterviewOutcome({
      taskId: applicant.taskId || taskId,
      talentUserId: applicant.talentUserId,
      outcome: 'REJECT_APPLICATION'
    }));
  };

  const handleConfirm = (applicant: RecruitingApplicant) => {
    runMutation(`confirm-${applicant.id}`, () => recordRecruitingInterviewOutcome({
      taskId: applicant.taskId || taskId,
      talentUserId: applicant.talentUserId,
      outcome: 'PASS_CONFIRM'
    }));
  };

  const title = workspace?.task?.title || '招聘申请处理';
  const subtitle = workspace?.summary?.description || workspace?.task?.summary || `共 ${applicants.length} 份真实申请`;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="gap-2"><Filter className="w-4 h-4"/> 筛选</Button>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索候选人..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {isLoading && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
          正在同步真实招聘申请...
        </div>
      )}

      <div className="flex space-x-6 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredApplicants.map(applicant => {
          const group = normalizeStatusGroup(applicant.status);
          const mutating = isMutating.endsWith(applicant.id);
          return (
            <Card key={applicant.id} className="hover:border-indigo-100 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {applicant.avatar ? (
                      <ImageWithFallback src={applicant.avatar} alt={applicant.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-base font-bold text-indigo-700">
                        {applicant.name.slice(0, 1) || '人'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/enterprise/talents/${applicant.slug || applicant.talentUserId}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                          {applicant.name}
                        </Link>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded font-medium">{applicant.statusLabel}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{applicant.role} · 报价 {applicant.rate}</p>
                      <p className="text-sm text-slate-600 line-clamp-2 max-w-2xl bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {applicant.autoClosedReason || applicant.summary}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[...applicant.tags, ...applicant.signals].slice(0, 6).map((item) => (
                          <span key={item} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {applicant.applyAt}
                    </span>

                    {group === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={mutating || !applicant.talentUserId}
                          onClick={() => handleReject(applicant)}
                          className="text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                        >
                          <XCircle className="w-4 h-4 mr-1"/> 拒绝
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={mutating || !applicant.talentUserId}
                          onClick={() => handleInvite(applicant)}
                          className={inviteListButtonClass}
                        >
                          <MessageSquare className="w-4 h-4 mr-1"/> 邀约面试
                        </Button>
                      </div>
                    )}

                    {group === 'interviewing' && (
                      <div className="flex items-center gap-2">
                        {applicant.status === 'INTERVIEW_ACCEPTED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={mutating || !applicant.talentUserId}
                            onClick={() => handleConfirm(applicant)}
                            className={confirmCooperationButtonClass}
                          >
                            <CheckCircle className="w-4 h-4 mr-1"/> 确认合作
                          </Button>
                        )}
                      </div>
                    )}

                    {group === 'hired' && (
                      <Link to={`/enterprise/workspace?taskId=${encodeURIComponent(applicant.taskId || taskId)}`}>
                        <Button variant="outline" size="sm" className={workspaceButtonClass}>
                          <CheckCircle className="w-4 h-4 mr-1"/> 进入工作区
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredApplicants.length === 0 && (
          <div className="text-center py-12 text-slate-500 rounded-2xl border border-dashed border-slate-200 bg-white">
            暂无相关状态的真实申请记录
          </div>
        )}
      </div>

      {inviteApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm" role="presentation" onClick={closeInviteDialog}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-invite-title"
            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">面试邀约</p>
                <h2 id="interview-invite-title" className="mt-2 text-xl font-bold text-slate-900">发送新的面试邀约</h2>
                <p className="mt-1 text-sm text-slate-500">当前候选人：{inviteApplicant.name}</p>
              </div>
              <Button variant="outline" size="sm" disabled={isMutating.startsWith('invite-')} onClick={closeInviteDialog}>取消</Button>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                面试时间
                <input
                  value={inviteDraft.interviewAt}
                  onChange={(event) => setInviteDraft((prev) => ({ ...prev, interviewAt: event.target.value }))}
                  placeholder="例如：明天 14:00 或 2026-04-27 14:00"
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                腾讯会议号
                <input
                  value={inviteDraft.meetingCode}
                  onChange={(event) => setInviteDraft((prev) => ({ ...prev, meetingCode: event.target.value }))}
                  placeholder="例如：123 456 789"
                  className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                备注
                <textarea
                  value={inviteDraft.note}
                  onChange={(event) => setInviteDraft((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="补充面试安排、准备事项或沟通要点。"
                  className="min-h-24 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" disabled={isMutating.startsWith('invite-')} onClick={closeInviteDialog}>取消</Button>
              <Button
                disabled={isMutating === `invite-${inviteApplicant.id}`}
                onClick={submitInvite}
                className={inviteSubmitButtonClass}
              >
                {isMutating === `invite-${inviteApplicant.id}` ? '发送中...' : '发送邀约'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
