import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Sparkles, ArrowRight, Wand2, Calendar, DollarSign, Briefcase, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import {
  confirmTaskAnalysis,
  decomposeTaskBrief,
  getAiPublishPresets,
  publishTask
} from '../services/api';
import { asArray, isMutationFailed, mutationMessage, stringOf } from '../services/workflowFormatters';

type AiModule = {
  name: string;
  duration: string;
  output: string;
};

type AiSuggestion = {
  skills: string[];
  modules: AiModule[];
  recommendations: string[];
  recommendedBudget: string;
  recommendedCycle: string;
  risk: string;
  provider: string;
};

function normalizeAiSuggestion(payload: any, fallbackBudget: string): AiSuggestion {
  const schedule = payload?.schedule || payload?.analysisSummary || {};
  return {
    skills: asArray<string>(payload?.tags || payload?.skillTags || payload?.skills).map(String).filter(Boolean),
    modules: asArray<any>(payload?.modules || payload?.moduleBreakdown).map((item, index) => ({
      name: stringOf(item?.name, item?.title, `执行模块 ${index + 1}`),
      duration: stringOf(item?.duration, item?.period, ''),
      output: stringOf(item?.output, item?.deliverable, item?.description, '阶段性交付结果')
    })),
    recommendations: asArray<string>(payload?.recommendations || payload?.riskSummary).map(String).filter(Boolean),
    recommendedBudget: stringOf(payload?.recommendedBudget, fallbackBudget, '预算待确认'),
    recommendedCycle: stringOf(schedule?.total, payload?.recommendedCycle, '周期待确认'),
    risk: stringOf(schedule?.risk, schedule?.assumption, '建议先确认范围、验收口径和关键交付件。'),
    provider: stringOf(payload?.provider, payload?.analysisProvider, 'AI')
  };
}

export function TaskPublish() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [cycle, setCycle] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getAiPublishPresets().then((data: any) => {
      if (!alive || data?.requestError) {
        return;
      }
      setPresets(asArray(data?.presets || data?.templates || data?.suggestions));
    });
    return () => {
      alive = false;
    };
  }, []);

  const selectedPreset = presets.find((item) => stringOf(item?.id, item?.presetId) === selectedPresetId);

  const handleAiBreakdown = async () => {
    if (!title.trim() || !description.trim()) {
      setError('请先补充任务名称和任务简介。');
      return;
    }
    setIsAiLoading(true);
    setError('');

    const response = await decomposeTaskBrief({
      title: title.trim(),
      brief: description.trim(),
      source: 'TEXT',
      presetId: stringOf(selectedPreset?.id, selectedPreset?.presetId),
      presetTitle: stringOf(selectedPreset?.title, selectedPreset?.name),
      presetTags: asArray<string>(selectedPreset?.tags)
    });

    setIsAiLoading(false);
    if (isMutationFailed(response)) {
      setError(mutationMessage(response, 'AI 拆解暂时不可用，请稍后再试。'));
      return;
    }

    const suggestion = normalizeAiSuggestion(response, budget);
    setAiSuggestion(suggestion);
    setStep(2);
  };

  const applyAiSuggestions = () => {
    if (!aiSuggestion) {
      return;
    }
    setSkills(aiSuggestion.skills);
    setBudget(aiSuggestion.recommendedBudget);
    setCycle(aiSuggestion.recommendedCycle);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('请先补充任务名称和任务简介。');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const response = await publishTask({
      title: title.trim(),
      brief: description.trim(),
      source: 'TEXT',
      budget: budget || aiSuggestion?.recommendedBudget || '',
      skills,
      customSkills: []
    });

    if (isMutationFailed(response)) {
      setIsSubmitting(false);
      setError(mutationMessage(response, '任务发布失败，请稍后再试。'));
      return;
    }

    const taskId = stringOf((response as any).taskId, (response as any).id);
    if (taskId) {
      const confirmResponse = await confirmTaskAnalysis(taskId, { source: 'react-demo' });
      if (isMutationFailed(confirmResponse)) {
        setIsSubmitting(false);
        setError(mutationMessage(confirmResponse, '任务已发布，但 AI 分析确认失败，请稍后在任务中继续确认。'));
        return;
      }
      navigate(`/enterprise/recruiting?taskId=${encodeURIComponent(taskId)}`);
      return;
    }

    setIsSubmitting(false);
    navigate('/enterprise/recruiting');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">发布新任务</h1>
        <p className="mt-2 text-slate-500">需求先被 AI 拆成可执行模块，再进入真实人才匹配。</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      <div className="relative">
        <div className="absolute left-0 right-0 top-6 z-0 h-1 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-emerald-600"
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="relative z-10 mb-12 flex justify-between px-12">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-4 text-lg font-bold ${
                step >= s ? 'border-white bg-emerald-700 text-white shadow-lg' : 'border-slate-100 bg-white text-slate-400'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-none shadow-xl shadow-slate-200/40">
                <CardContent className="space-y-6 p-8">
                  {presets.length > 0 && (
                    <div>
                      <label className="mb-3 block text-sm font-semibold text-slate-700">选择一个任务入口</label>
                      <div className="flex flex-wrap gap-2">
                        {presets.map((preset) => {
                          const presetId = stringOf(preset?.id, preset?.presetId, preset?.title, preset?.name);
                          const active = selectedPresetId === presetId;
                          return (
                            <button
                              key={presetId}
                              type="button"
                              onClick={() => setSelectedPresetId(active ? '' : presetId)}
                              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                                active ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {stringOf(preset?.title, preset?.name, '任务模板')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">任务名称</label>
                    <Input
                      placeholder="例如：SaaS 平台 B 端全链路 UI/UX 设计"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="py-6 text-lg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">任务简介与期望</label>
                    <textarea
                      className="min-h-[200px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="简单描述您需要完成什么工作、交付边界、验收口径和已有素材。"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">{description.length} 字</span>
                      <span className="text-slate-400">数据会提交到 Spring 后端 AI 拆解接口</span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="预算，例如 ￥15000" />
                    <Input value={cycle} onChange={(event) => setCycle(event.target.value)} placeholder="期望周期，可让 AI 自动估算" />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      size="lg"
                      onClick={handleAiBreakdown}
                      disabled={!title || !description || isAiLoading}
                      className="gap-2 rounded-xl border-none bg-gradient-to-r from-emerald-700 to-lime-600 shadow-lg shadow-emerald-700/25 hover:from-emerald-800 hover:to-lime-700"
                    >
                      {isAiLoading ? <Wand2 className="h-5 w-5 animate-pulse" /> : <Sparkles className="h-5 w-5" />}
                      {isAiLoading ? 'AI 正在拆解任务...' : '使用 AI 智能拆解并继续'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && aiSuggestion && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="relative overflow-hidden border-2 border-emerald-100 shadow-xl shadow-emerald-100/50">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/10 to-lime-500/10 blur-3xl" />
                <CardContent className="relative z-10 p-8">
                  <div className="mb-8 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                      <Sparkles className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-emerald-950">AI 任务拆解建议</h2>
                      <p className="text-sm text-emerald-700/80">来自 {aiSuggestion.provider}，你确认后会把任务发布到后端并进入匹配。</p>
                    </div>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-3 flex items-center text-sm font-semibold text-slate-700">
                          <Briefcase className="mr-2 h-4 w-4" />建议标签
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(aiSuggestion.skills.length ? aiSuggestion.skills : ['协作执行', '交付验收']).map((skill) => (
                            <Badge key={skill} variant="secondary" className="border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                          <h3 className="mb-1 flex items-center text-xs font-semibold text-slate-500">
                            <DollarSign className="mr-1 h-3 w-3" />预算
                          </h3>
                          <p className="text-lg font-bold text-slate-900">{aiSuggestion.recommendedBudget}</p>
                        </div>
                        <div className="flex-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                          <h3 className="mb-1 flex items-center text-xs font-semibold text-slate-500">
                            <Calendar className="mr-1 h-3 w-3" />周期
                          </h3>
                          <p className="text-lg font-bold text-slate-900">{aiSuggestion.recommendedCycle}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                        {aiSuggestion.risk}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                      <h3 className="mb-4 text-sm font-semibold text-slate-700">执行模块</h3>
                      <ul className="space-y-3">
                        {aiSuggestion.modules.map((module, index) => (
                          <li key={`${module.name}-${index}`} className="flex items-start">
                            <span className="mr-3 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-500">
                              {index + 1}
                            </span>
                            <span className="text-sm leading-relaxed text-slate-700">
                              <b>{module.name}</b>
                              {module.duration ? ` · ${module.duration}` : ''}
                              <span className="block text-slate-500">{module.output}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {aiSuggestion.recommendations.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
                      {aiSuggestion.recommendations.slice(0, 2).join(' / ')}
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                    <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-500">返回修改</Button>
                    <Button size="lg" onClick={applyAiSuggestions} className="gap-2 rounded-xl bg-emerald-700 shadow-md hover:bg-emerald-800">
                      应用建议并继续 <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-none shadow-xl shadow-slate-200/40">
                <CardContent className="space-y-6 p-8">
                  <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                    <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
                    <p className="mb-4 line-clamp-3 text-sm text-slate-500">{description}</p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {skills.map((skill) => <Badge key={skill} variant="outline" className="bg-white">{skill}</Badge>)}
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-slate-600">
                      <span className="flex items-center"><DollarSign className="mr-1 h-4 w-4 text-slate-400" /> {budget || '预算待确认'}</span>
                      <span className="flex items-center"><Calendar className="mr-1 h-4 w-4 text-slate-400" /> {cycle || '周期待确认'}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-800">
                    确认发布后，系统会创建真实任务、确认 AI 拆解结果，并进入人才匹配/招募处理。
                  </div>

                  <div className="flex items-center justify-between pt-8">
                    <Button variant="ghost" onClick={() => setStep(2)} className="text-slate-500">上一步</Button>
                    <div className="space-x-3">
                      <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50" onClick={() => navigate('/enterprise')}>
                        暂不发布
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-xl border-none bg-emerald-700 shadow-lg shadow-emerald-700/25 hover:bg-emerald-800"
                      >
                        {isSubmitting ? '正在发布...' : '确认发布任务'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
