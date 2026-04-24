import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore, Task } from '../store';
import { Button } from '../components/ui/Button';
import { 
  Search, MapPin, Clock, Briefcase, 
  CircleDollarSign, Users, Sparkles, Filter, X, Zap, CheckCircle2
} from 'lucide-react';
import { cn } from '../utils/cn';
import { requestTaskCollaboration, respondRecruitingInterviewInvite } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router';

const categories = ["全部", "设计", "开发", "产品", "运营", "市场", "其他"];

export function TaskSquare() {
  const { currentUser, tasks, dataError, isLoadingData, refreshTasks } = useStore();
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTaskId = searchParams.get('taskId') || '';

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  useEffect(() => {
    if (!selectedTaskId || !tasks.length) {
      return;
    }
    const matched = tasks.find((task) => task.id === selectedTaskId);
    if (matched && matched.id !== selectedTask?.id) {
      setApplyError('');
      setApplyMessage('');
      setApplySuccess(false);
      setSelectedTask(matched);
    }
  }, [selectedTask?.id, selectedTaskId, tasks]);

  useEffect(() => {
    if (!selectedTask) {
      return;
    }
    const latest = tasks.find((task) => task.id === selectedTask.id);
    if (latest && latest !== selectedTask) {
      setSelectedTask(latest);
    }
  }, [selectedTask, tasks]);

  const displayTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      const textMatched = !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery) ||
        task.skills.some((skill) => skill.toLowerCase().includes(normalizedQuery));
      const categoryMatched = activeCategory === '全部' || task.skills.some((skill) => skill.includes(activeCategory));
      return task.status !== 'CLOSED' && textMatched && categoryMatched;
    });
  }, [activeCategory, searchQuery, tasks]);

  const recommendedCount = tasks.filter((task) => task.status !== 'CLOSED').length;

  const clearSelectionQuery = () => {
    if (!searchParams.has('taskId')) {
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.delete('taskId');
    setSearchParams(next, { replace: true });
  };

  const closeSelectedTask = () => {
    if (isApplying) {
      return;
    }
    setSelectedTask(null);
    setApplySuccess(false);
    setApplyError('');
    setApplyMessage('');
    clearSelectionQuery();
  };

  const openTask = (task: Task) => {
    setApplySuccess(false);
    setApplyError('');
    setApplyMessage('');
    setSelectedTask(task);
  };

  const interviewDecisionPending = Boolean(
    selectedTask && (
      selectedTask.actionType === 'interview_decision' ||
      String(selectedTask.raw?.applicationStatus || selectedTask.raw?.action?.status || '').toUpperCase() === 'INTERVIEW_PENDING'
    )
  );
  const interviewAt = String(selectedTask?.raw?.action?.interviewAt || '').trim();
  const meetingCode = String(selectedTask?.raw?.action?.meetingCode || '').trim();

  const handleApply = async () => {
    if (!selectedTask) {
      return;
    }

    if (selectedTask.actionDisabled) {
      setApplyError(selectedTask.actionNote || '这个任务当前还不能提交申请。');
      return;
    }

    if (selectedTask.actionType === 'enter_room' || selectedTask.roomKey) {
      const roomKey = selectedTask.roomKey;
      navigate(`/talent/chat?taskId=${encodeURIComponent(selectedTask.id)}${roomKey ? `&room=${encodeURIComponent(roomKey)}&roomKey=${encodeURIComponent(roomKey)}` : ''}`);
      return;
    }

    setIsApplying(true);
    setApplyError('');
    setApplyMessage('');

    const response = await requestTaskCollaboration(selectedTask.id, {
      source: 'react-demo',
      note: '人才端任务广场发起合作申请'
    }) as {
      requestError?: string;
      nextRoute?: string;
      roomKey?: string;
      message?: string;
      nextStep?: string;
      applicationStatus?: string;
    };

    setIsApplying(false);

    if (response.requestError || response.applicationStatus === 'FAILED') {
      setApplyError(response.requestError || response.nextStep || response.message || '申请提交失败，请稍后再试。');
      return;
    }

    setApplySuccess(true);
    setApplyMessage(response.nextStep || response.message || '申请已提交，企业端可以继续处理。');

    if (response.nextRoute) {
      navigate(response.nextRoute as string);
      return;
    }

    if (response.roomKey) {
      navigate(`/talent/chat?taskId=${encodeURIComponent(selectedTask.id)}&room=${encodeURIComponent(response.roomKey as string)}&roomKey=${encodeURIComponent(response.roomKey as string)}`);
      return;
    }

    setApplySuccess(false);
    setSelectedTask(null);
    refreshTasks();
  };

  const handleInterviewDecision = async (decision: 'ACCEPT' | 'REJECT') => {
    if (!selectedTask || !currentUser?.id) {
      return;
    }

    setIsApplying(true);
    setApplyError('');
    setApplyMessage('');

    const response = await respondRecruitingInterviewInvite({
      taskId: selectedTask.id,
      talentUserId: currentUser.id,
      decision
    }) as {
      assignmentStatus?: string;
      nextStep?: string;
      message?: string;
      requestError?: string;
      status?: string;
    };

    setIsApplying(false);

    if (response.requestError || response.status === 'FAILED') {
      setApplyError(response.requestError || response.nextStep || response.message || '当前暂时无法回应面试邀约。');
      return;
    }

    setApplyMessage(response.nextStep || response.message || '面试邀约状态已更新。');
    await refreshTasks();
  };

  return (
    <div className="w-full h-full flex flex-col space-y-8 pb-12">
      
      {/* Hero Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-3xl bg-indigo-600 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-indigo-50 text-sm font-medium mb-6 border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>已接入真实任务市场，当前可查看 {recommendedCount} 个机会</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            发现理想的高薪项目
          </h1>
          
          <div className="w-full max-w-2xl relative flex items-center shadow-2xl rounded-2xl group">
            <Search className="absolute left-6 text-slate-400 group-focus-within:text-indigo-600 transition-colors w-6 h-6 z-20 pointer-events-none" />
            <input 
              type="text" 
              placeholder="搜索任务名称、技能要求或关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 pl-16 pr-32 rounded-2xl border-none text-lg text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-inner outline-none"
            />
            <Button className="absolute right-2 h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md">
              搜索
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filter and Categories */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === cat 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              {cat}
            </motion.button>
          ))}
        </div>
        
        <Button variant="outline" className="rounded-full bg-white text-slate-600 border-slate-200 hover:bg-slate-50">
          <Filter className="w-4 h-4 mr-2" /> 更多筛选
        </Button>
      </div>

      {/* Task Grid */}
      {dataError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {dataError}
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500">
          正在同步真实任务数据...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {displayTasks.map((task, idx) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => openTask(task)}
              className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
            >
              {/* Highlight bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium">
                  <Zap className="w-3 h-3 fill-indigo-600" />
                  <span>{task.statusLabel || '可查看'}</span>
                </div>
                <div className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {task.budget}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">
                {task.title}
              </h3>

              {task.company && (
                <p className="text-sm text-slate-500 mb-3">{task.company}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-6">
                {task.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{task.cycle}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{task.applicantsCount ? `${task.applicantsCount} 人投递` : task.actionLabel || '查看详情'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {displayTasks.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
            <Search className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg">{tasks.length ? '未找到匹配的任务，换个关键词试试？' : '真实任务列表暂时为空'}</p>
          </div>
        )}
      </div>

      {/* Task Detail Modal / Slide Over */}
      <AnimatePresence>
        {selectedTask && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSelectedTask}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[600px] max-h-[90vh] bg-white md:rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col rounded-t-3xl mt-20 md:mt-0"
            >
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={closeSelectedTask}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Header */}
              <div className="bg-gradient-to-br from-indigo-50 to-white p-6 md:p-8 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4 pr-8">
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedTask.title}</h2>
                </div>
                <div className="text-3xl font-bold text-indigo-600 mb-6">{selectedTask.budget}</div>
                
                <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                  <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>周期: {selectedTask.cycle}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>{selectedTask.applicantsCount ? `已有 ${selectedTask.applicantsCount} 人投递` : selectedTask.statusLabel}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <span>远程协作</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 text-slate-600 space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                    <div className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                    技能要求
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.skills.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium text-sm rounded-lg border border-indigo-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                    <div className="w-1 h-4 bg-indigo-500 rounded-full mr-2" />
                    需求详情
                  </h3>
                  <div className="prose prose-sm prose-slate max-w-none whitespace-pre-line leading-relaxed">
                    {selectedTask.description}
                  </div>
                </div>

                {Boolean(selectedTask.deliverables?.length) && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                      <div className="w-1 h-4 bg-emerald-500 rounded-full mr-2" />
                      预计交付物
                    </h3>
                    <div className="grid gap-2">
                      {selectedTask.deliverables?.map((item) => (
                        <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedTask.actionNote || applyError || applyMessage) && (
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    applyError ? "bg-red-50 text-red-700 border border-red-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  )}>
                    {applyError || applyMessage || selectedTask.actionNote}
                  </div>
                )}

                {interviewDecisionPending && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-4 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">企业已向你发起面试邀约</div>
                    <div className="mt-2 space-y-1 text-slate-600">
                      {interviewAt && <p>面试时间：{interviewAt}</p>}
                      {meetingCode && <p>会议信息：{meetingCode}</p>}
                      <p>你确认后，企业端才能继续给出面试结果或进入后续沟通。</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer / CTA */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  企业资金已由平台托管担保
                </p>
                
                <AnimatePresence mode="wait">
                  {interviewDecisionPending ? (
                    <motion.div
                      key="interview-actions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        disabled={isApplying}
                        onClick={() => handleInterviewDecision('REJECT')}
                        className="rounded-xl border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-100"
                      >
                        {isApplying ? '提交中...' : '拒绝面试'}
                      </Button>
                      <Button
                        size="lg"
                        disabled={isApplying}
                        onClick={() => handleInterviewDecision('ACCEPT')}
                        className="rounded-xl bg-indigo-600 px-8 shadow-lg shadow-indigo-200 hover:bg-indigo-700"
                      >
                        {isApplying ? '提交中...' : '同意面试'}
                      </Button>
                    </motion.div>
                  ) : applySuccess ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center space-x-2 text-emerald-600 font-bold px-6 py-3 bg-emerald-50 rounded-xl"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>投递成功，即将返回</span>
                    </motion.div>
                  ) : (
                    <motion.div key="button" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Button 
                        size="lg"
                        disabled={isApplying || Boolean(selectedTask.actionDisabled)}
                        onClick={handleApply}
                        className={cn(
                          "rounded-xl px-10 shadow-lg",
                          selectedTask.actionDisabled
                            ? "bg-slate-300 text-slate-600 shadow-none"
                            : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                        )}
                      >
                        {isApplying ? (
                          <div className="flex items-center space-x-2">
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            <span>投递中...</span>
                          </div>
                        ) : (
                          selectedTask.actionLabel || (currentUser?.role === 'TALENT' ? "一键极速投递" : "请切换人才账号")
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
}
