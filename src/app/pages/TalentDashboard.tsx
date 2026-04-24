import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../store';
import { Briefcase, Clock, ChevronRight, DollarSign, Star, TrendingUp, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { respondRecruitingInterviewInvite } from '../services/api';

function stringOf(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const next = String(value).trim();
    if (next) return next;
  }
  return '';
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function TalentDashboard() {
  const navigate = useNavigate();
  const { currentUser, applications, tasks, dashboardData, dataError, isLoadingData, refreshDashboardData } = useStore();
  const [inviteError, setInviteError] = useState('');
  const [acceptingInviteId, setAcceptingInviteId] = useState('');
  const walletSummary = dashboardData?.walletSummary || dashboardData?.overview?.walletSummary || {};
  const overview = dashboardData?.overview || {};
  const hero = dashboardData?.hero || {};
  const notificationItems = asArray<any>(dashboardData?.notificationItems);
  const dashboardActiveTasks = asArray<any>(dashboardData?.activeTasks);
  const marketplaceTasks = asArray<any>(dashboardData?.marketplace);
  const currentRating = stringOf(overview.rating, currentUser?.rating, hero.score) || '暂无';
  const currentRatingNote = stringOf(overview.ratingNote, hero.score ? '已根据最新合作评分更新。' : '', '评分会在验收后沉淀到这里');

  const activeApplications = notificationItems.length
    ? notificationItems.map((item, index) => {
        const highlights = asArray<any>(item?.highlights);
        const budget = highlights.find((entry) => /预算/.test(stringOf(entry?.label)))?.value;
        const period = highlights.find((entry) => /工期/.test(stringOf(entry?.label)))?.value;
        const taskId = stringOf(item?.taskId, item?.recordId, `task-${index + 1}`);
        const roomKey = stringOf(item?.roomKey, item?.room);
        return {
          id: stringOf(item?.id, `talent-notification-${taskId}`),
          taskId,
          title: stringOf(item?.title, `合作任务 ${index + 1}`),
          summary: stringOf(item?.summary, item?.note, '继续查看当前合作进度。'),
          status: stringOf(item?.status, '待处理'),
          updatedAt: stringOf(item?.updatedAt, item?.time, '待同步'),
          budget: stringOf(budget, '待确认'),
          period: stringOf(period, '待确认'),
          roomKey
        };
      })
    : applications
        .filter((item) => !item.talentId || item.talentId === currentUser?.id)
        .map((item) => {
          const task = tasks.find((taskItem) => taskItem.id === item.taskId);
          return {
            id: item.id,
            taskId: item.taskId,
            title: stringOf(task?.title, '未知任务'),
            summary: item.status === 'INTERVIEW' ? '企业已发起面试邀约，请确认您的时间。' : '继续查看任务进度与下一步安排。',
            status: item.status,
            updatedAt: item.interviewTime || '待同步',
            budget: stringOf(item.quote, task?.budget, '待确认'),
            period: stringOf(item.availableTime, task?.cycle, '待确认'),
            roomKey: stringOf(task?.roomKey)
          };
        });

  const recommendedTasks = marketplaceTasks.length
    ? marketplaceTasks.slice(0, 3).map((item, index) => ({
        id: stringOf(item?.taskId, item?.id, `marketplace-${index + 1}`),
        title: stringOf(item?.title, `推荐任务 ${index + 1}`),
        budget: stringOf(item?.budget, '待确认'),
        statusLabel: stringOf(item?.match, '可查看'),
        skills: asArray<any>(item?.tags).map((tag) => String(tag)),
        nextRoute: stringOf(item?.taskId) ? `/talent/tasks/${encodeURIComponent(String(item.taskId))}` : '/talent/tasks'
      }))
    : tasks.filter(task => task.status !== 'CLOSED').slice(0, 3);

  const activeCollaborationsCount = dashboardActiveTasks.length || activeApplications.length;
  const pendingInterviewInvites = notificationItems
    .filter((item) => {
      const id = stringOf(item?.id);
      const status = stringOf(item?.status, item?.statusLabel, item?.applicationStatus);
      const type = stringOf(item?.type, item?.category);
      const content = [
        id,
        status,
        type,
        stringOf(item?.title),
        stringOf(item?.summary),
        stringOf(item?.note)
      ].join(' ');
      return (
        /talent-interview-/.test(id) &&
        !/accepted|rejected|failed/i.test(id) &&
        (/待确认面试|INTERVIEW_PENDING/i.test(status) || /面试邀约|interview/i.test(content))
      );
    })
    .map((item, index) => {
      const highlights = asArray<any>(item?.highlights);
      const company = highlights.find((entry) => /企业|公司/.test(stringOf(entry?.label)))?.value;
      const interviewTime = highlights.find((entry) => /面试时间|时间/.test(stringOf(entry?.label)))?.value;
      const meetingCode = highlights.find((entry) => /会议|腾讯/.test(stringOf(entry?.label)))?.value;
      const taskId = stringOf(item?.taskId, item?.recordId);
      return {
        id: stringOf(item?.id, `interview-invite-${index + 1}`),
        taskId,
        company: stringOf(company, item?.company, item?.enterpriseName, '企业方'),
        title: stringOf(item?.title, '新的在线面试邀约'),
        summary: stringOf(item?.note, item?.summary, '企业向你发送了在线面试邀约，请确认时间后进入沟通。'),
        interviewTime: stringOf(interviewTime, item?.interviewAt, '待补充'),
        meetingCode: stringOf(meetingCode, item?.meetingCode),
        updatedAt: stringOf(item?.updatedAt, item?.time, '刚刚'),
        roomKey: stringOf(item?.roomKey, item?.room)
      };
    });
  const latestInterviewInvite = pendingInterviewInvites[0] || null;

  const handleAcceptInvite = async () => {
    if (!latestInterviewInvite || !latestInterviewInvite.taskId || !currentUser?.id) {
      setInviteError('缺少面试邀约信息，暂时无法进入沟通。');
      return;
    }

    setInviteError('');
    setAcceptingInviteId(latestInterviewInvite.id);
    const response = await respondRecruitingInterviewInvite({
      taskId: latestInterviewInvite.taskId,
      talentUserId: currentUser.id,
      decision: 'ACCEPT'
    }) as {
      roomKey?: string;
      nextRoute?: string;
      taskId?: string;
      status?: string;
      requestError?: string;
      nextStep?: string;
      message?: string;
    };
    setAcceptingInviteId('');

    if (response.requestError || response.status === 'FAILED') {
      setInviteError(response.requestError || response.nextStep || response.message || '当前暂时无法接受面试邀约。');
      return;
    }

    await refreshDashboardData();
    const taskId = stringOf(response.taskId, latestInterviewInvite.taskId);
    const roomKey = stringOf(response.roomKey, latestInterviewInvite.roomKey);
    const nextRoute = stringOf(response.nextRoute);
    if (nextRoute) {
      navigate(nextRoute);
      return;
    }
    navigate(`/talent/chat?taskId=${encodeURIComponent(taskId)}${roomKey ? `&room=${encodeURIComponent(roomKey)}&roomKey=${encodeURIComponent(roomKey)}` : ''}`);
  };
  
  const containerVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };
  
  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={containerVars}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-semibold text-slate-800 tracking-tight mb-2">
            早安，{currentUser?.name} 👋
          </h1>
          <p className="text-slate-500">
            今天有 {recommendedTasks.length} 个真实任务可查看。继续保持好状态！
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/talent/onboarding">
            <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-full px-5 shadow-sm font-semibold flex items-center">
              <span className="mr-2">🌟</span>
              完善人才资料
            </Button>
          </Link>
          <Link to="/talent/tasks">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-sm font-semibold flex items-center">
              <Zap className="w-4 h-4 mr-2" /> 探索新任务
            </Button>
          </Link>
        </div>
      </motion.div>

      {dataError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {dataError}
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
          正在同步人才工作台真实数据...
        </div>
      )}

      {/* Stats Cards */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVars}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVars}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">累计收入</p>
                  <h3 className="text-2xl font-bold text-slate-800">{walletSummary.totalEarned || '￥0'}</h3>
                </div>
              </div>
              <div className="flex items-center text-sm text-indigo-600 font-medium">
                <TrendingUp className="w-4 h-4 mr-1" /> 可提现 {walletSummary.availableToWithdraw || '￥0'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">进行中的协作</p>
                  <h3 className="text-2xl font-bold text-slate-800">{activeCollaborationsCount} 个</h3>
                </div>
              </div>
              <Link to="/talent/workspace" className="flex items-center text-sm text-emerald-600 font-medium hover:underline">
                进入工作区 <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">当前评分</p>
                  <h3 className="text-2xl font-bold text-slate-800">{currentRating}</h3>
                </div>
              </div>
              <div className="flex items-center text-sm text-amber-600 font-medium">
                {currentRatingNote}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Active Contracts & Applications */}
        <div className="lg:col-span-2 space-y-8">
          {latestInterviewInvite && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                  最新邀约与面试
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={acceptingInviteId === latestInterviewInvite.id}
                  onClick={handleAcceptInvite}
                  className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  去沟通 <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <Card className="relative overflow-hidden border-indigo-100 bg-gradient-to-r from-indigo-50 to-white shadow-sm">
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-indigo-500" />
                <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <Badge className="border-none bg-red-50 text-red-600 hover:bg-red-100">
                        紧急待办
                      </Badge>
                      <span className="text-xs font-medium text-slate-500">{latestInterviewInvite.updatedAt}</span>
                    </div>
                    <h3 className="mb-1 text-base font-bold text-slate-800">
                      {latestInterviewInvite.company} 发送了在线面试邀约
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                      诚邀您参与【{latestInterviewInvite.title}】的面谈。{latestInterviewInvite.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center rounded-lg bg-indigo-100/50 px-3 py-1.5 font-medium text-indigo-700">
                        <Clock className="mr-1.5 h-4 w-4 text-indigo-500" />
                        建议面试时间：{latestInterviewInvite.interviewTime}
                      </div>
                      {latestInterviewInvite.meetingCode && (
                        <div className="rounded-lg bg-white/80 px-3 py-1.5 font-medium text-slate-600">
                          会议信息：{latestInterviewInvite.meetingCode}
                        </div>
                      )}
                    </div>
                    {inviteError && (
                      <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        {inviteError}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-2 sm:ml-4 sm:min-w-32">
                    <Button
                      disabled={acceptingInviteId === latestInterviewInvite.id}
                      onClick={handleAcceptInvite}
                      className="w-full rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700"
                    >
                      {acceptingInviteId === latestInterviewInvite.id ? '处理中...' : '接受并沟通'}
                    </Button>
                    <Link to="/talent/notifications">
                      <Button variant="ghost" className="w-full rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                        稍后再看
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial="hidden" animate="visible" variants={containerVars}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">最新进度</h2>
              <Button variant="ghost" size="sm" className="text-slate-500">全部</Button>
            </div>
            
            <div className="space-y-4">
              {activeApplications.map((app, idx) => {
                const targetRoute = app.roomKey
                  ? `/talent/chat?taskId=${encodeURIComponent(app.taskId)}&roomKey=${encodeURIComponent(app.roomKey)}`
                  : `/talent/workspace?taskId=${encodeURIComponent(app.taskId)}`;
                return (
                  <motion.div key={app.id} variants={itemVars}>
                    <Card className="border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
                      <CardContent className="p-5 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none">
                              {app.status}
                            </Badge>
                            <span className="text-xs text-slate-400 font-medium">更新于 {app.updatedAt}</span>
                          </div>
                          <h3 className="text-base font-semibold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                            {app.title}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-1 mb-4">
                            {app.summary}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                              <Clock className="w-4 h-4 mr-1.5 text-slate-400" /> 
                              工期：{app.period}
                            </div>
                            <span className="font-semibold text-indigo-600">{app.budget}</span>
                          </div>
                        </div>
                        <div className="ml-4 h-full flex flex-col justify-center">
                          <Link to={targetRoute}>
                            <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
                              {app.roomKey ? '继续沟通' : '进入协作'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}

              {activeApplications.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  <p className="text-slate-500 text-sm">暂无进行中的进度，快去申请任务吧</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Recommended */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">为您推荐</h2>
          </div>
          
          <div className="space-y-4">
            {recommendedTasks.map((task) => (
              <Card key={task.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-slate-500 border-slate-200">
                      {task.statusLabel || '可查看'}
                    </Badge>
                    <span className="text-lg font-bold text-slate-800">{task.budget}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 leading-snug">
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(task.skills || []).slice(0, 3).map((skill) => (
                      <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{skill}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {recommendedTasks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
                暂时没有推荐任务，进入任务广场可以手动刷新真实任务市场。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
