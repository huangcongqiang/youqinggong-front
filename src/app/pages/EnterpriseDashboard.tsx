import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store';
import { Link } from 'react-router';
import { 
  ArrowRight, FileText, CheckCircle, Wallet, AlertCircle, 
  ChevronRight, Calendar, Users, Sparkles, TrendingUp, Edit3, Loader2, X
} from 'lucide-react';
import { updateTaskContent } from '../services/api';

export function EnterpriseDashboard() {
  const { currentUser, tasks, dashboardData, dataError, isLoadingData, refreshDashboardData } = useStore();
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', brief: '', budget: '', period: '' });
  const [editError, setEditError] = useState('');
  const [editNotice, setEditNotice] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const financeSummary = dashboardData?.financeSummary || {};
  const attentionItems = Array.isArray(dashboardData?.attentionItems) ? dashboardData.attentionItems : [];
  const activeTasks = tasks.filter(task => task.status === 'IN_PROGRESS');
  const openTasks = tasks.filter(task => task.status === 'OPEN');
  const completedTasks = tasks.filter(task => task.status === 'CLOSED');
  const visibleTasks = [...openTasks, ...activeTasks];
  const dashboardTasks = visibleTasks.slice(0, 10);
  const hiddenTaskCount = Math.max(visibleTasks.length - dashboardTasks.length, 0);
  const urgentTask = activeTasks[0] || openTasks[0];

  const metrics = [
    { label: "待处理申请", value: tasks.reduce((total, task) => total + task.applicantsCount, 0), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "招募中任务", value: openTasks.length, icon: Calendar, color: "text-sky-600", bg: "bg-sky-50" },
    { label: "执行中合作", value: activeTasks.length, icon: CheckCircle, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "已完成记录", value: completedTasks.length, icon: Wallet, color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
  ];

  function openEditTask(task: any) {
    setEditingTask(task);
    setEditForm({
      title: task.title || '',
      brief: task.description || '',
      budget: task.budget || '',
      period: task.cycle || ''
    });
    setEditError('');
    setEditNotice('');
  }

  async function handleSaveTaskContent(event: React.FormEvent) {
    event.preventDefault();
    if (!editingTask) return;
    setIsSavingEdit(true);
    setEditError('');
    setEditNotice('');
    const result = await updateTaskContent(editingTask.id, editForm) as any;
    setIsSavingEdit(false);
    if (result.requestError || result.actionBlocked || result.status === 'FAILED') {
      setEditError(result.requestError || result.actionMessage || result.nextStep || '当前暂时无法修改任务内容。');
      return;
    }
    setEditNotice(result.nextStep || '任务内容已更新。');
    setEditingTask(null);
    await refreshDashboardData();
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Greeting */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-slate-900 tracking-tight">晚上好，{currentUser?.name}</h1>
          <p className="text-slate-500 mt-1">这里是您的企业雇佣全景看板。</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/enterprise/onboarding">
            <Button variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm font-semibold">
              <span className="mr-2">🌟</span>
              完善企业资料
            </Button>
          </Link>
          <Link to="/enterprise/publish">
            <Button className="rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 group">
              <Sparkles className="w-4 h-4 mr-2 text-indigo-200" />
              发新任务
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {dataError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {dataError}
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
          正在同步企业工作台真实数据...
        </div>
      )}

      {editNotice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {editNotice}
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">修改任务内容</h2>
                <p className="mt-1 text-sm text-slate-500">仅支持任务进入正式协作前修改；执行中的合同内容请在协作空间补充确认。</p>
              </div>
              <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => setEditingTask(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTaskContent} className="space-y-4 px-6 py-5">
              {editError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{editError}</div>}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">任务标题</label>
                <input
                  value={editForm.title}
                  onChange={(event) => setEditForm((value) => ({ ...value, title: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">任务说明</label>
                <textarea
                  value={editForm.brief}
                  onChange={(event) => setEditForm((value) => ({ ...value, brief: event.target.value }))}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">预算</label>
                  <input
                    value={editForm.budget}
                    onChange={(event) => setEditForm((value) => ({ ...value, budget: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">周期</label>
                  <input
                    value={editForm.period}
                    onChange={(event) => setEditForm((value) => ({ ...value, period: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="rounded-xl border-slate-200 bg-white" onClick={() => setEditingTask(null)}>
                  取消
                </Button>
                <Button type="submit" disabled={isSavingEdit || !editForm.title.trim() || !editForm.brief.trim()} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                  {isSavingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  保存修改
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Urgent Action Banner */}
      {urgentTask && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/10 flex items-center justify-between relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80')] bg-cover opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{urgentTask.title}</h3>
              <p className="text-indigo-100 text-sm mt-1">
                {urgentTask.status === 'OPEN' ? '任务正在招募中，可以继续处理申请。' : '合作正在执行中，可以进入工作区查看进度。'}
              </p>
            </div>
          </div>
          <Link to={urgentTask.status === 'OPEN' ? `/enterprise/recruiting?taskId=${encodeURIComponent(urgentTask.id)}` : `/enterprise/workspace?taskId=${encodeURIComponent(urgentTask.id)}`}>
            <Button variant="secondary" className="relative z-10 bg-white text-indigo-900 hover:bg-slate-50 rounded-xl px-6 border-none shadow-sm font-semibold">
              {urgentTask.status === 'OPEN' ? '处理申请' : '进入工作区'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-all duration-300 border-none bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${metric.bg} flex items-center justify-center`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
              </div>
              <p className="text-sm font-medium text-slate-600">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">进行中的合作与任务</h2>
              <p className="mt-1 text-xs text-slate-500">
                工作台最多展示 10 个，更多任务进入全量页查看。
              </p>
            </div>
            {visibleTasks.length > 0 && (
              <Link to="/enterprise/tasks">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
                  查看更多
                  {hiddenTaskCount > 0 && <span className="ml-1">({hiddenTaskCount})</span>}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          <div className="space-y-4">
            {dashboardTasks.map(task => (
              <motion.div 
                key={task.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                    <div className="flex items-center mt-2 space-x-3 text-sm text-slate-500">
                      <span className="flex items-center"><Wallet className="w-4 h-4 mr-1" /> {task.budget}</span>
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {task.cycle}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-md border px-3 py-1 ${
                      task.status === 'OPEN'
                        ? 'border-sky-200 bg-sky-50 text-sky-700'
                        : 'border-violet-200 bg-violet-50 text-violet-700'
                    }`}
                  >
                    {task.statusLabel || (task.status === 'OPEN' ? '招募中' : '执行中')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 z-${10-i}`}>
                        {i}
                      </div>
                    ))}
                    <span className="text-xs text-slate-500 pl-4">{task.applicantsCount} 人已申请</span>
                  </div>
                  {task.status === 'OPEN' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditTask(task)}
                      className="rounded-lg h-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Edit3 className="w-4 h-4 mr-1" /> 修改
                    </Button>
                  )}
                  <Link to={task.status === 'OPEN' ? `/enterprise/recruiting?taskId=${encodeURIComponent(task.id)}` : `/enterprise/workspace?taskId=${encodeURIComponent(task.id)}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                    >
                      {task.status === 'OPEN' ? '处理申请' : '进入工作区'}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}

            {visibleTasks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
                当前没有进行中的合作或招募任务。可以先发布任务，或前往记录页查看已完成项目。
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">今日 AI 建议</h2>
          <Card className="bg-gradient-to-b from-indigo-50/50 to-white border-indigo-100/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-indigo-100/50">
              <CardTitle className="flex items-center text-indigo-900 text-base">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                招聘提效建议
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="text-sm space-y-3">
                <p className="text-slate-700 leading-relaxed">
                  {attentionItems[0]?.description || attentionItems[0]?.note || attentionItems[0]?.title || (urgentTask ? `${urgentTask.title} 当前处于「${urgentTask.statusLabel}」状态，建议优先处理下一步动作。` : '暂无新的 AI 建议。')}
                </p>
                {urgentTask && (
                  <Link to={urgentTask.status === 'OPEN' ? `/enterprise/recruiting?taskId=${encodeURIComponent(urgentTask.id)}` : `/enterprise/workspace?taskId=${encodeURIComponent(urgentTask.id)}`}>
                    <Button variant="outline" className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800">
                      查看当前任务
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-slate-400" />
                近期财务状态
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 text-sm mt-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">本月已支付</span>
                  <span className="font-semibold text-slate-900">{financeSummary.totalSpent || financeSummary.monthlySpent || '暂无'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">待结算冻结</span>
                  <span className="font-semibold text-amber-600">{financeSummary.pendingSettlement || financeSummary.frozenAmount || '暂无'}</span>
                </div>
                <Link to="/enterprise/billing">
                  <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900 mt-2">查看账单流水</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 mt-6">
            <CardHeader className="pb-3 border-b border-slate-100/50">
              <CardTitle className="text-base text-slate-800 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-slate-400" />
                快捷入口
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex gap-3 flex-wrap">
              <Link to="/enterprise/approvals" className="flex-1">
                <Button variant="outline" className="w-full bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700">
                  进入审批中心
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
