import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bot, Send, BrainCircuit, PenTool, Sparkles, MessageSquare, ClipboardList, PenLine, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { getTalentData } from '../services/api';
import { asArray, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

export function TalentAssistant() {
  const [payload, setPayload] = useState<any>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getTalentData().then((data: any) => {
      if (!alive) return;
      setPayload(data);
      setError(data?.requestError || '');
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const quickActions = [
    { icon: PenTool, label: '写申请理由', to: '/talent/tasks' },
    { icon: MessageSquare, label: '查看邀约消息', to: '/talent/chat' },
    { icon: ClipboardList, label: '处理验收说明', to: '/talent/acceptance' },
    { icon: PenLine, label: '更新个人资料', to: '/talent/onboarding' }
  ];
  const attentionItems = asArray<any>(payload?.attentionItems || payload?.notificationItems);
  const activeTasks = asArray<any>(payload?.activeTasks);

  const handleSend = () => {
    if (!input.trim()) return;
    setNotice('已基于后端接单上下文定位相关入口；如果需要生成式问答，可以继续补一个助手问答 API。');
    setInput('');
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-6xl gap-6 p-4">
      <div className="hidden w-64 shrink-0 flex-col gap-4 md:flex">
        <Card className="border-0 bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
          <CardContent className="p-6">
            <Bot className="mb-4 h-10 w-10" />
            <h2 className="mb-2 text-xl font-bold">接单助理</h2>
            <p className="text-sm leading-relaxed text-emerald-100">展示真实任务、邀约、验收与钱包上下文，不再模拟 AI 回复。</p>
          </CardContent>
        </Card>

        <Card className="flex-1 border-slate-200 bg-slate-50">
          <CardContent className="p-4">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">快捷入口</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.to} className="flex w-full items-center gap-3 rounded-lg bg-slate-100/50 px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-white hover:text-emerald-700 hover:shadow">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-1 flex-col border-0 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between rounded-t-xl border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <BrainCircuit className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">人才接单助手</h1>
              <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> 已连接真实接单上下文
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1 border-slate-200 text-slate-500"><Sparkles className="h-4 w-4" /> 上下文</Button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <ErrorState text={error} />
          {notice && <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">{notice}</div>}
          {loading ? (
            <LoadingState text="正在读取人才工作台上下文..." />
          ) : (
            <div className="space-y-5">
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">当前建议</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">{stringOf(payload?.attentionHeadline, '当前没有高优先级事项')}</h2>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {attentionItems.slice(0, 4).map((item, index) => (
                  <Card key={`${stringOf(item?.title)}-${index}`} className="border-slate-200 bg-white">
                    <CardContent className="p-5">
                      <p className="text-xs text-slate-400">{stringOf(item?.status, item?.groupLabel, '事项')}</p>
                      <h3 className="mt-2 font-bold text-slate-900">{stringOf(item?.title, `待办 ${index + 1}`)}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-500">{stringOf(item?.summary, item?.note)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">当前任务</h3>
                    <Link to="/talent/tasks" className="flex items-center text-sm font-medium text-emerald-700">任务广场 <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </div>
                  {activeTasks.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {activeTasks.map((item, index) => (
                        <div key={`${stringOf(item?.title)}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                          <p className="font-semibold text-slate-900">{stringOf(item?.title, `任务 ${index + 1}`)}</p>
                          <p className="mt-1 text-sm text-slate-500">{stringOf(item?.status)} · {stringOf(item?.note, item?.summary)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="暂无进行中任务" text="申请任务或确认合作后，助理会在这里读取真实任务状态。" />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="rounded-b-xl border-t border-slate-100 bg-white p-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSend()}
              placeholder="输入要梳理的接单问题，助手会基于当前后端上下文提示入口..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-4 pr-14 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`absolute right-3 rounded-lg p-2 transition-colors ${input.trim() ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'cursor-not-allowed bg-slate-200 text-slate-400'}`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
