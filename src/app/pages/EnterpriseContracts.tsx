import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, Filter, FileSignature, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { getOrderRecords } from '../services/api';
import { asArray, moneyLabel, statusTone, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

function normalizeContract(item: any, index = 0) {
  const taskId = stringOf(item?.taskId, item?.id, item?.recordId, `task-${index + 1}`);
  const stage = stringOf(item?.stage, item?.status, item?.statusLabel, '待同步');
  return {
    id: stringOf(item?.contractId, item?.contractNo, `CON-${taskId}`),
    taskId,
    project: stringOf(item?.title, item?.taskTitle, item?.name, `合作任务 ${index + 1}`),
    talent: stringOf(item?.counterpartName, item?.talentName, '合作人才'),
    role: stringOf(item?.counterpartRole, '人才'),
    amount: moneyLabel(item?.amountValue || item?.amount || item?.budget, '金额待确认'),
    status: stringOf(item?.statusKey, /完成|结算|归档/i.test(stage) ? 'completed' : 'active'),
    statusLabel: stage,
    updatedAt: stringOf(item?.updatedAt, item?.time, '待同步'),
    type: stringOf(item?.contractType, '任务合作'),
    roomKey: stringOf(item?.roomKey, item?.room)
  };
}

function getStatusBadge(status: string, label: string) {
  const tone = statusTone(label || status);
  if (tone === 'success') {
    return <span className="flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700"><CheckCircle className="h-3.5 w-3.5" /> 已归档</span>;
  }
  if (tone === 'warning') {
    return <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"><Clock className="h-3.5 w-3.5" /> 待确认</span>;
  }
  return <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"><FileSignature className="h-3.5 w-3.5" /> 履约中</span>;
}

export function EnterpriseContracts() {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getOrderRecords('enterprise', 'all').then((data: any) => {
      if (!alive) {
        return;
      }
      setContracts(asArray<any>(data?.items).map(normalizeContract));
      setError(data?.requestError || '');
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const filteredContracts = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return contracts.filter((contract) => {
      const tabMatched = activeTab === 'all' || contract.status === activeTab || (activeTab === 'completed' && /完成|归档|结算/i.test(contract.statusLabel));
      const text = [contract.id, contract.project, contract.talent, contract.role, contract.taskId].join(' ').toLowerCase();
      return tabMatched && (!keyword || text.includes(keyword));
    });
  }, [activeTab, contracts, query]);

  const counts = {
    all: contracts.length,
    active: contracts.filter((item) => item.status !== 'completed' && !/完成|归档|结算/i.test(item.statusLabel)).length,
    completed: contracts.filter((item) => item.status === 'completed' || /完成|归档|结算/i.test(item.statusLabel)).length
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">合同台账</h1>
          <p className="mt-1 text-sm text-slate-500">从合作记录读取任务、人才、金额和履约状态，形成可检索的合同台账。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索合同编号或项目名..."
              className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <Button variant="outline" className="gap-2 border-slate-200 text-slate-600">
            <Filter className="h-4 w-4" /> 筛选
          </Button>
        </div>
      </div>

      <ErrorState text={error} />

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6">
          <div className="flex space-x-6">
            {[
              { id: 'all', label: `全部合同 ${counts.all}` },
              { id: 'active', label: `履约中 ${counts.active}` },
              { id: 'completed', label: `已归档 ${counts.completed}` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'border-indigo-700 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6"><LoadingState text="正在读取真实合同台账..." /></div>
        ) : filteredContracts.length === 0 ? (
          <div className="p-6"><EmptyState title="暂无合同记录" text={contracts.length ? '当前筛选下没有合同。' : '后端合作记录暂时为空。'} /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="group p-6 transition-colors hover:bg-slate-50">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <FileSignature className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <h3 className="font-bold text-slate-900">{contract.project}</h3>
                        {getStatusBadge(contract.status, contract.statusLabel)}
                      </div>
                      <div className="mb-2 text-sm text-slate-500">编号：{contract.id} · {contract.type}</div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                          {contract.talent} <span className="font-normal text-slate-400">({contract.role})</span>
                        </span>
                        <span className="text-slate-400">最后更新: {contract.updatedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 md:w-48 md:flex-col md:items-end">
                    <div className="text-lg font-bold text-slate-900">{contract.amount}</div>
                    <Link
                      to={`/enterprise/workspace?taskId=${encodeURIComponent(contract.taskId)}&roomKey=${encodeURIComponent(contract.roomKey)}`}
                      className="flex items-center gap-1 text-sm font-medium text-indigo-700 transition-opacity hover:text-indigo-800 md:opacity-0 group-hover:opacity-100"
                    >
                      进入协作空间 <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
