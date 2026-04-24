import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, FileText, Calendar, Filter, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { getBusinessData } from '../services/api';
import { asArray, moneyLabel, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

function normalizeExpense(item: any, index = 0) {
  return {
    id: stringOf(item?.taskId, item?.id, `finance-${index + 1}`),
    title: stringOf(item?.title, `财务记录 ${index + 1}`),
    amount: moneyLabel(item?.amount || item?.amountValue, '金额待确认'),
    status: stringOf(item?.status, item?.statusLabel, '待同步'),
    statusCode: stringOf(item?.statusCode),
    updatedAt: stringOf(item?.updatedAt, '待同步'),
    note: stringOf(item?.note, '财务状态会跟随请款、开票、对账和结算变化。'),
    counterpartName: stringOf(item?.counterpartName, '合作人才')
  };
}

export function EnterpriseBilling() {
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getBusinessData().then((data: any) => {
      if (!alive) {
        return;
      }
      const financeSummary = data?.financeSummary || {};
      setSummary(financeSummary);
      setExpenses(asArray<any>(financeSummary?.recentExpenses).map(normalizeExpense));
      setError(data?.requestError || '');
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">账单与发票</h1>
          <p className="mt-1 text-sm text-slate-500">读取真实支出中心数据，展示请款、开票、对账和结算进度。</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-slate-200 text-slate-600">
            <Filter className="h-4 w-4" /> 历史对账单
          </Button>
          <Link to="/enterprise/records">
            <Button className="gap-2 bg-emerald-700 hover:bg-emerald-800">进入记录处理</Button>
          </Link>
        </div>
      </div>

      <ErrorState text={error} />

      {loading ? (
        <LoadingState text="正在读取真实账单数据..." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="relative overflow-hidden border-emerald-700 shadow-sm shadow-emerald-700/10 lg:col-span-2">
              <div className="absolute right-0 top-0 p-6 opacity-10">
                <CreditCard className="h-48 w-48 -translate-y-10 translate-x-10 transform text-emerald-700" />
              </div>
              <CardContent className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-700" />
                    <h2 className="text-lg font-bold text-slate-900">{stringOf(summary?.title, '支出中心')}</h2>
                  </div>
                  <p className="mb-6 text-sm text-slate-500">全部金额来自后端财务汇总，跟随请款、开票、对账和结算实时变化。</p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-bold tracking-tight text-emerald-700">{moneyLabel(summary?.pendingPayable, '￥0')}</span>
                    <span className="mb-1.5 text-sm text-slate-400">待支付/待处理</span>
                  </div>
                </div>

                <div className="w-full max-w-[280px] rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="text-slate-600">已结算支出</span>
                    <span className="font-bold text-slate-900">{moneyLabel(summary?.totalSpent, '￥0')}</span>
                  </div>
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="text-slate-600">争议金额</span>
                    <span className="font-bold text-slate-900">{moneyLabel(summary?.disputedAmount, '￥0')}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-emerald-600" style={{ width: expenses.length ? '68%' : '0%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="flex h-full flex-col justify-center p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">发票与对账</h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-500">发票、对账、结算的实际动作都在合作记录/结算页中完成。</p>
                <Link to="/enterprise/records" className="flex w-full items-center justify-center gap-1 py-2 text-sm font-medium text-emerald-700 hover:text-emerald-800">
                  查看财务记录 <ArrowUpRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 p-6">
              <Calendar className="h-5 w-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-slate-900">近期财务动作</h2>
            </div>

            {expenses.length === 0 ? (
              <div className="p-6">
                <EmptyState title="暂无账单动作" text="当前账号还没有真实请款、发票、对账或结算记录。" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {expenses.map((bill) => (
                  <div key={bill.id} className="flex flex-col justify-between gap-4 p-6 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">{bill.title}</h3>
                          <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{bill.status}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span>{bill.id}</span>
                          <span>·</span>
                          <span>{bill.counterpartName}</span>
                          <span>·</span>
                          <span>{bill.updatedAt}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{bill.note}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-6 sm:w-48 sm:justify-end">
                      <div className="text-xl font-bold text-slate-900">{bill.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
