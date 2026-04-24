import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, TrendingUp, Clock, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { getBusinessData } from '../services/api';
import { asArray, moneyLabel, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

function normalizeRow(item: any, index = 0) {
  return {
    id: stringOf(item?.taskId, item?.id, `finance-${index + 1}`),
    project: stringOf(item?.title, `财务记录 ${index + 1}`),
    date: stringOf(item?.updatedAt, '待同步'),
    amount: moneyLabel(item?.amount || item?.amountValue, '金额待确认'),
    status: stringOf(item?.status, '待同步'),
    type: stringOf(item?.statusCode, '财务动作')
  };
}

export function EnterpriseReports() {
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const data = await getBusinessData();
    const finance = (data as any).financeSummary || {};
    setSummary(finance);
    setHistory(asArray<any>(finance?.recentExpenses).map(normalizeRow));
    setError((data as any).requestError || '');
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const summaryCards = [
    { title: '已结算支出', value: moneyLabel(summary?.totalSpent, '￥0'), change: '真实汇总', icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { title: '待处理款项', value: moneyLabel(summary?.pendingPayable, '￥0'), change: `${history.length} 条`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: '争议/冻结', value: moneyLabel(summary?.disputedAmount, '￥0'), change: '后端统计', icon: AlertTriangle, color: 'text-slate-600', bg: 'bg-slate-50' }
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">交易报表</h1>
          <p className="mt-1 text-sm text-slate-500">全局财务概览，读取真实资金流向与结算状态。</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={load} className="gap-2 border-slate-200 text-slate-600">
            <RefreshCw className="h-4 w-4" /> 刷新
          </Button>
          <Button className="gap-2 bg-emerald-700 hover:bg-emerald-800">
            <Download className="h-4 w-4" /> 导出报表
          </Button>
        </div>
      </div>

      <ErrorState text={error} />

      {loading ? (
        <LoadingState text="正在读取真实交易报表..." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {summaryCards.map((card) => (
              <Card key={card.title} className="relative overflow-hidden border-slate-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-500">{card.change}</span>
                  </div>
                  <h3 className="mb-1 text-sm font-medium text-slate-500">{card.title}</h3>
                  <div className="text-3xl font-bold text-slate-900">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FileText className="h-5 w-5 text-emerald-700" />
                最近交易记录
              </h2>
            </div>

            {history.length === 0 ? (
              <div className="p-6">
                <EmptyState title="暂无交易记录" text="当前账号还没有真实财务流水。" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-sm text-slate-500">
                      <th className="p-4 font-medium">流水/任务号</th>
                      <th className="p-4 font-medium">项目/事由</th>
                      <th className="p-4 font-medium">时间</th>
                      <th className="p-4 font-medium">类型</th>
                      <th className="p-4 text-right font-medium">金额</th>
                      <th className="p-4 text-center font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="p-4 text-sm font-medium text-slate-600">{row.id}</td>
                        <td className="p-4 text-sm text-slate-900">{row.project}</td>
                        <td className="p-4 text-sm text-slate-500">{row.date}</td>
                        <td className="p-4 text-sm text-slate-600">{row.type}</td>
                        <td className="p-4 text-right text-sm font-bold text-slate-900">{row.amount}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
