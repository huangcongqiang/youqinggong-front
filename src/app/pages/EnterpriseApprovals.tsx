import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileCheck, XCircle, CheckCircle, Search, UserCheck, AlertCircle } from 'lucide-react';
import { getEnterpriseApprovalsData, submitEnterpriseApprovalAction } from '../services/api';
import { asArray, isMutationFailed, mutationMessage, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

function normalizeApproval(item: any) {
  const groupKey = stringOf(item?.groupKey, item?.source);
  return {
    id: stringOf(item?.approvalId, item?.id),
    type: groupKey,
    typeLabel: stringOf(item?.groupLabel, groupKey === 'matching' ? '招聘录用' : '任务审批'),
    title: stringOf(item?.title, '审批事项'),
    project: stringOf(item?.taskTitle, item?.title),
    submitter: stringOf(item?.talentName, item?.pendingAudience, '系统'),
    time: stringOf(item?.updatedAt, '待同步'),
    status: stringOf(item?.approvalStatus, item?.status, 'PENDING'),
    summary: stringOf(item?.decisionSummary, item?.summary, item?.note, '待处理审批事项。'),
    taskId: stringOf(item?.taskId),
    roomKey: stringOf(item?.roomKey, item?.room),
    related: asArray<any>(item?.related || item?.highlights),
    actions: asArray<any>(item?.decisionActions)
  };
}

export function EnterpriseApprovals() {
  const [activeTab, setActiveTab] = useState('pending');
  const [query, setQuery] = useState('');
  const [approvals, setApprovals] = useState<any[]>([]);
  const [headline, setHeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actingId, setActingId] = useState('');

  async function loadApprovals() {
    setLoading(true);
    const data = await getEnterpriseApprovalsData();
    setApprovals(asArray<any>((data as any).approvalItems).map(normalizeApproval));
    setHeadline(stringOf((data as any).approvalHeadline));
    setError((data as any).requestError || '');
    setLoading(false);
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  const filteredApprovals = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return approvals.filter((item) => {
      const pending = /PENDING|待|处理/i.test(item.status);
      const tabMatched = activeTab === 'all' || (activeTab === 'pending' ? pending : !pending);
      const text = [item.title, item.summary, item.project, item.submitter, item.taskId].join(' ').toLowerCase();
      return tabMatched && (!keyword || text.includes(keyword));
    });
  }, [activeTab, approvals, query]);

  const pendingCount = approvals.filter((item) => /PENDING|待|处理/i.test(item.status)).length;

  async function handleAction(item: any, action: string) {
    setActingId(`${item.id}-${action}`);
    setActionMessage('');
    setError('');
    const result = await submitEnterpriseApprovalAction(item.id, {
      action,
      note: action === 'APPROVE' ? '企业端审批通过' : '企业端驳回'
    });
    setActingId('');
    if (isMutationFailed(result)) {
      setError(mutationMessage(result, '审批处理失败。'));
      return;
    }
    setActionMessage(mutationMessage(result, '审批已处理。'));
    await loadApprovals();
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">审批中心</h1>
          <p className="mt-1 text-sm text-slate-500">{headline || '处理候选人录用、任务确认、取消申请等真实审批事项。'}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索项目、任务或提交人..."
              className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      <ErrorState text={error} />
      {actionMessage && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{actionMessage}</div>}

      <div className="mb-6 flex space-x-6 border-b border-slate-200">
        {[
          { id: 'pending', label: `待处理 (${pendingCount})` },
          { id: 'resolved', label: '已处理' },
          { id: 'all', label: '全部审批' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'border-emerald-700 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState text="正在同步真实审批事项..." />
      ) : filteredApprovals.length === 0 ? (
        <EmptyState title="暂无相关审批" text={approvals.length ? '当前筛选下没有审批事项。' : '审批中心接口暂时没有返回待处理事项。'} />
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((item) => {
            const canDirectApprove = item.actions.some((action: any) => /APPROVE/i.test(stringOf(action?.action, action?.key)));
            const canDirectReject = item.actions.some((action: any) => /REJECT/i.test(stringOf(action?.action, action?.key)));
            const iconClass = item.type === 'matching' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600';
            return (
              <Card key={item.id} className="transition-colors hover:border-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
                        {item.type === 'matching' ? <UserCheck className="h-6 w-6" /> : <FileCheck className="h-6 w-6" />}
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {item.typeLabel}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                        </div>
                        <p className="mb-2 text-sm font-medium text-slate-600">任务：{item.taskId || item.project}</p>
                        <p className="max-w-3xl text-sm leading-relaxed text-slate-500">{item.summary}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>{item.submitter}</span>
                          <span>·</span>
                          <span>更新于 {item.time}</span>
                          {item.related.slice(0, 2).map((rel: any) => (
                            <span key={`${stringOf(rel?.label)}-${stringOf(rel?.value)}`} className="rounded-full bg-slate-50 px-2 py-1">
                              {stringOf(rel?.label)} {stringOf(rel?.value)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-[180px] flex-col items-end gap-3">
                      {canDirectApprove || canDirectReject ? (
                        <div className="mt-2 flex items-center gap-2">
                          {canDirectReject && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(item, 'REJECT')}
                              disabled={actingId === `${item.id}-REJECT`}
                              className="border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <XCircle className="mr-1 h-4 w-4" /> 驳回
                            </Button>
                          )}
                          {canDirectApprove && (
                            <Button
                              size="sm"
                              onClick={() => handleAction(item, 'APPROVE')}
                              disabled={actingId === `${item.id}-APPROVE`}
                              className="bg-emerald-700 hover:bg-emerald-800"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" /> 同意
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                          <AlertCircle className="mr-1 h-4 w-4" /> 去任务内处理
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
