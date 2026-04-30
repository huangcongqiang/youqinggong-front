import React from 'react';
import { Link } from 'react-router';
import { ArrowLeft, BriefcaseBusiness, Calendar, Edit3, FileText, Wallet } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useStore } from '../store';

function taskActionPath(task: any) {
  const taskId = encodeURIComponent(task.id || '');
  return task.status === 'OPEN' ? `/enterprise/recruiting?taskId=${taskId}` : `/enterprise/workspace?taskId=${taskId}`;
}

function taskActionLabel(task: any) {
  return task.status === 'OPEN' ? '处理申请' : '进入工作区';
}

function statusClassName(task: any) {
  return task.status === 'OPEN'
    ? 'border-sky-200 bg-sky-50 text-sky-700'
    : 'border-violet-200 bg-violet-50 text-violet-700';
}

export function EnterpriseTasks() {
  const { tasks, dataError, isLoadingData } = useStore();
  const openTasks = tasks.filter((task) => task.status === 'OPEN');
  const activeTasks = tasks.filter((task) => task.status === 'IN_PROGRESS');
  const visibleTasks = [...openTasks, ...activeTasks];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to="/enterprise" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="mr-1 h-4 w-4" />
            返回工作台
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">全部进行中的合作与任务</h1>
          <p className="mt-2 text-sm text-slate-500">
            这里只展示招募中、协商中、执行中和待验收任务；已完成项目请到交易记录查看归档。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/enterprise/publish">
            <Button className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
              <FileText className="mr-2 h-4 w-4" />
              发布任务
            </Button>
          </Link>
          <Link to="/enterprise/records">
            <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
              查看已完成记录
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
          正在同步企业任务...
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">全部未完成任务</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{visibleTasks.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">招募中</p>
          <p className="mt-2 text-3xl font-bold text-sky-700">{openTasks.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">协作中</p>
          <p className="mt-2 text-3xl font-bold text-violet-700">{activeTasks.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {visibleTasks.map((task) => (
          <div key={task.id} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-base font-bold text-slate-900">{task.title}</h2>
                  <Badge variant="outline" className={`rounded-md border px-3 py-1 ${statusClassName(task)}`}>
                    {task.statusLabel || (task.status === 'OPEN' ? '招募中' : '执行中')}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{task.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="inline-flex items-center">
                    <Wallet className="mr-1 h-4 w-4" />
                    {task.budget}
                  </span>
                  <span className="inline-flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {task.cycle}
                  </span>
                  <span className="inline-flex items-center">
                    <BriefcaseBusiness className="mr-1 h-4 w-4" />
                    {task.applicantsCount} 人已申请
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {task.status === 'OPEN' && (
                  <Link to={`/enterprise/recruiting?taskId=${encodeURIComponent(task.id)}`}>
                    <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                      <Edit3 className="mr-2 h-4 w-4" />
                      修改与处理
                    </Button>
                  </Link>
                )}
                <Link to={taskActionPath(task)}>
                  <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                    {taskActionLabel(task)}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {visibleTasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
            当前没有招募中或协作中的任务。
          </div>
        )}
      </div>
    </div>
  );
}
