import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Building2, Clock, DollarSign, MapPin, CheckCircle, Shield, AlertCircle, ArrowLeft, Send, ListChecks } from 'lucide-react';
import { getTaskMarketplaceData } from '../services/api';
import { asArray, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

function normalizeTask(raw: any, taskId = '') {
  const action = raw?.action || {};
  const id = stringOf(raw?.id, raw?.taskId, taskId);
  const actionStatus = stringOf(action?.status, raw?.applicationStatus).toUpperCase();
  let actionType = stringOf(action?.type, action?.status, raw?.actionType);
  let actionLabel = stringOf(action?.label, '立即申请');
  let actionDisabled = Boolean(action?.disabled);
  let actionRoute = `/talent/tasks/${encodeURIComponent(id)}/apply`;
  let matchNote = stringOf(raw?.matchNote, action?.note);

  if (actionStatus === 'INTERVIEW_PENDING' || actionType.toLowerCase() === 'interview_decision') {
    actionType = 'interview_decision';
    actionLabel = '回应面试邀约';
    actionDisabled = false;
    actionRoute = `/talent/tasks?taskId=${encodeURIComponent(id)}`;
    matchNote = stringOf(action?.note, '企业已发起面试邀约，请先同意或拒绝后再推进后续协作。');
  }

  return {
    id,
    title: stringOf(raw?.title, '任务详情'),
    budget: stringOf(raw?.budget, raw?.budgetLabel, '预算待确认'),
    cycle: stringOf(raw?.period, raw?.cycle, raw?.duration, '周期待确认'),
    status: stringOf(raw?.status, raw?.statusLabel, raw?.statusCode, '可申请'),
    statusCode: stringOf(raw?.statusCode),
    tags: asArray<string>(raw?.tags || raw?.skills).map(String),
    description: stringOf(raw?.summary, raw?.description, raw?.brief, '企业暂未补充更详细的任务说明。'),
    company: stringOf(raw?.company, raw?.enterprise?.name, '企业方'),
    businessUserId: stringOf(raw?.businessUserId),
    match: stringOf(raw?.match, raw?.matchScore),
    matchNote,
    actionLabel,
    actionDisabled,
    actionType,
    actionRoute,
    deliverables: asArray<any>(raw?.deliverables).map((item) => stringOf(item?.name, item?.title, item)).filter(Boolean)
  };
}

export function TaskDetails() {
  const { taskId } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getTaskMarketplaceData().then((data: any) => {
      if (!alive) {
        return;
      }
      const items = asArray<any>(data?.items || data?.tasks);
      const matched = items.find((item) => stringOf(item?.id, item?.taskId) === stringOf(taskId));
      setTask(matched ? normalizeTask(matched, taskId) : null);
      setError(data?.requestError || '');
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [taskId]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-8"><LoadingState text="正在读取真实任务详情..." /></div>;
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link to="/talent/tasks" className="mb-6 inline-flex items-center text-slate-500 transition-colors hover:text-emerald-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回任务广场
        </Link>
        <ErrorState text={error} />
        <EmptyState title="任务不存在或暂不可见" text="当前账号没有从真实任务市场读取到这条任务。" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link to="/talent/tasks" className="mb-6 inline-flex items-center text-slate-500 transition-colors hover:text-emerald-700">
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回任务广场
      </Link>

      <ErrorState text={error} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h1 className="mb-4 text-2xl font-bold text-slate-900">{task.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center"><DollarSign className="mr-1 h-4 w-4 text-slate-400" />预算: {task.budget}</span>
                    <span className="flex items-center"><Clock className="mr-1 h-4 w-4 text-slate-400" />周期: {task.cycle}</span>
                    {task.match && <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">适配 {task.match}</span>}
                  </div>
                </div>
                <span className="whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  {task.status}
                </span>
              </div>

              <div className="mb-8 flex flex-wrap gap-2">
                {task.tags.map((tag: string) => (
                  <span key={tag} className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="mb-4 text-lg font-bold text-slate-900">任务介绍</h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{task.description}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <h3 className="mb-4 flex items-center text-lg font-bold text-slate-900">
                <ListChecks className="mr-2 h-5 w-5 text-emerald-700" />
                交付拆解
              </h3>
              {task.deliverables.length ? (
                <ul className="space-y-3">
                  {task.deliverables.map((item: string, index: number) => (
                    <li key={`${item}-${index}`} className="flex items-start rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                      <span className="mr-3 font-bold text-emerald-600">0{index + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="暂无交付拆解" text="这条任务还没有返回里程碑或交付件，申请前建议在消息中确认范围。" />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24 border-none shadow-sm">
            <CardContent className="p-6">
              {task.actionDisabled ? (
                <Button disabled className="mb-4 h-12 w-full rounded-xl text-lg">
                  {task.actionLabel}
                </Button>
              ) : (
                <Link to={task.actionRoute}>
                  <Button className="mb-4 h-12 w-full rounded-xl bg-emerald-700 text-lg shadow-md shadow-emerald-500/20 hover:bg-emerald-800">
                    <Send className="mr-2 h-4 w-4" />
                    {task.actionLabel}
                  </Button>
                </Link>
              )}
              <p className="flex items-center justify-center text-center text-xs text-slate-500">
                <Shield className="mr-1 h-3.5 w-3.5" />
                平台担保交易，合作进展和附件都会留存在任务记录中。
              </p>

              <hr className="my-6 border-slate-100" />

              <h4 className="mb-4 flex items-center text-sm font-bold text-slate-900">
                <Building2 className="mr-2 h-4 w-4 text-slate-400" />
                企业信息
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center font-medium text-slate-900">
                    {task.company}
                    <CheckCircle className="ml-1 h-4 w-4 text-blue-500" />
                  </div>
                  <div className="mt-1 flex items-center text-sm text-slate-500">
                    <MapPin className="mr-1 h-3.5 w-3.5" /> 认证企业
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  <AlertCircle className="mr-2 inline h-4 w-4" />
                  {task.matchNote || '请在申请前确认任务范围、时间投入和验收口径。'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
