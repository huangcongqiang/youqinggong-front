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
  getTagCatalog,
  publishTask
} from '../services/api';
import { asArray, isMutationFailed, mutationMessage, stringOf } from '../services/workflowFormatters';
import { classifyTags, mergeTags, normalizeCatalog, normalizeTags, toggleTag, type TagCatalog } from '../services/tagCatalog';

type AiModule = {
  name: string;
  duration: string;
  output: string;
};

type AiSuggestion = {
  skills: string[];
  businessTags: string[];
  deliverableTags: string[];
  customTags: string[];
  modules: AiModule[];
  recommendations: string[];
  recommendedBudget: string;
  recommendedCycle: string;
  risk: string;
  provider: string;
};

type MilestoneBudget = {
  name: string;
  ratio: string;
};

function createMilestoneBudgetPlan(modules: AiModule[]): MilestoneBudget[] {
  const source = modules.length ? modules : [{ name: '整体验收交付', duration: '', output: '阶段性交付结果' }];
  const baseRatio = Math.floor((100 / source.length) * 100) / 100;
  let used = 0;
  return source.map((module, index) => {
    const ratio = index === source.length - 1 ? Number((100 - used).toFixed(2)) : baseRatio;
    used += ratio;
    return {
      name: module.name || `执行模块 ${index + 1}`,
      ratio: String(ratio)
    };
  });
}

function parseBudgetNumber(raw: string) {
  const match = String(raw || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function ratioNumber(raw: string) {
  const value = Number.parseFloat(String(raw || '').replace('%', ''));
  return Number.isFinite(value) ? value : 0;
}

function ratioTotal(items: MilestoneBudget[]) {
  return Number(items.reduce((total, item) => total + ratioNumber(item.ratio), 0).toFixed(2));
}

function formatMilestoneAmount(totalBudget: number, ratio: string) {
  if (!totalBudget) return '金额待确认';
  const amount = (totalBudget * ratioNumber(ratio)) / 100;
  return `￥${Number(amount.toFixed(2)).toLocaleString('zh-CN')}`;
}

function normalizeAiSuggestion(payload: any, fallbackBudget: string): AiSuggestion {
  const schedule = payload?.schedule || payload?.analysisSummary || {};
  const classified = classifyTags(payload?.tags || payload?.skillTags || []);
  return {
    skills: normalizeTags(payload?.skills, classified.skills),
    businessTags: normalizeTags(payload?.businessTags, classified.businessTags),
    deliverableTags: normalizeTags(payload?.deliverableTags, classified.deliverableTags),
    customTags: mergeTags(classified.customTags, payload?.customTags),
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

function TagChoiceGroup({
  title,
  note,
  options,
  selected,
  onToggle,
  max
}: {
  title: string;
  note: string;
  options: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  max?: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>
        {max && <span className="shrink-0 text-xs font-medium text-slate-400">{selected.length}/{max}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const active = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TaskPublish() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [cycle, setCycle] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [businessTags, setBusinessTags] = useState<string[]>([]);
  const [deliverableTags, setDeliverableTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [tagCatalog, setTagCatalog] = useState<TagCatalog>(() => normalizeCatalog({}));
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [milestoneBudgets, setMilestoneBudgets] = useState<MilestoneBudget[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getAiPublishPresets().then((data: any) => {
      if (!alive || data?.requestError) {
        return;
      }
      setPresets(asArray(data?.presets || data?.templates || data?.suggestions));
    });
    getTagCatalog().then((data: any) => {
      if (!alive || data?.requestError) {
        return;
      }
      setTagCatalog(normalizeCatalog(data));
    });
    return () => {
      alive = false;
    };
  }, []);

  const selectedPreset = presets.find((item) => stringOf(item?.id, item?.presetId) === selectedPresetId);

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (!tag || customTags.includes(tag)) {
      return;
    }
    setCustomTags((items) => [...items, tag].slice(0, 6));
    setCustomTagInput('');
  };

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
      presetTags: mergeTags(asArray<string>(selectedPreset?.tags), skills),
      businessTags,
      deliverableTags,
      customTags
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
    setSkills((items) => mergeTags(items, aiSuggestion.skills).slice(0, 6));
    setBusinessTags((items) => mergeTags(items, aiSuggestion.businessTags));
    setDeliverableTags((items) => mergeTags(items, aiSuggestion.deliverableTags));
    setCustomTags((items) => mergeTags(items, aiSuggestion.customTags).slice(0, 6));
    setBudget(aiSuggestion.recommendedBudget);
    setCycle(aiSuggestion.recommendedCycle);
    setMilestoneBudgets(createMilestoneBudgetPlan(aiSuggestion.modules));
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('请先补充任务名称和任务简介。');
      return;
    }
    if (skills.length === 0) {
      setError('请至少选择 1 个必需技能，系统会优先按技能做推荐。');
      return;
    }
    const normalizedMilestoneBudgets = milestoneBudgets.length
      ? milestoneBudgets
      : createMilestoneBudgetPlan(aiSuggestion?.modules || []);
    const totalRatio = ratioTotal(normalizedMilestoneBudgets);
    if (Math.abs(totalRatio - 100) > 0.01) {
      setError('里程碑金额配比合计必须等于 100%。');
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
      customSkills: [],
      businessTags,
      deliverableTags,
      customTags,
      milestoneBudgets: normalizedMilestoneBudgets.map((item) => ({
        name: item.name,
        ratio: ratioNumber(item.ratio)
      }))
    });

    if (isMutationFailed(response)) {
      setIsSubmitting(false);
      setError(mutationMessage(response, '任务发布失败，请稍后再试。'));
      return;
    }

    const taskId = stringOf((response as any).taskId, (response as any).id);
    if (taskId) {
      const confirmResponse = await confirmTaskAnalysis(taskId, { source: 'frontend' });
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

  const budgetNumber = parseBudgetNumber(budget || aiSuggestion?.recommendedBudget || '');
  const milestoneRatioTotal = ratioTotal(milestoneBudgets);

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
            className="h-full rounded-full bg-indigo-600"
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
                step >= s ? 'border-white bg-indigo-600 text-white shadow-lg' : 'border-slate-100 bg-white text-slate-400'
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
                                active ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
                      className="min-h-[200px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                  <div className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">推荐匹配标签</h2>
                      <p className="mt-1 text-sm text-slate-500">必需技能会作为推荐主条件，业务场景和交付物用于判断经验。</p>
                    </div>
                    <TagChoiceGroup
                      title="必需技能"
                      note="至少选择 1 个，推荐优先按这里匹配人才。"
                      options={tagCatalog.skills}
                      selected={skills}
                      onToggle={(tag) => setSkills((items) => toggleTag(items, tag, 6))}
                      max={6}
                    />
                    <TagChoiceGroup
                      title="业务场景经验"
                      note="可选，命中类似场景的人才会加分。"
                      options={tagCatalog.businessTags}
                      selected={businessTags}
                      onToggle={(tag) => setBusinessTags((items) => toggleTag(items, tag))}
                    />
                    <TagChoiceGroup
                      title="交付物经验"
                      note="可选，标记这次真正要交付的成果。"
                      options={tagCatalog.deliverableTags}
                      selected={deliverableTags}
                      onToggle={(tag) => setDeliverableTags((items) => toggleTag(items, tag))}
                    />
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <h3 className="text-sm font-semibold text-slate-800">自定义标签</h3>
                      <p className="mt-1 text-xs text-slate-500">补充新需求，系统会保存为候选标签供后续复用。</p>
                      <div className="mt-3 flex gap-2">
                        <Input
                          value={customTagInput}
                          onChange={(event) => setCustomTagInput(event.target.value)}
                          onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addCustomTag())}
                          placeholder="例如：私域转化、AIGC 海报"
                          className="bg-white"
                        />
                        <Button type="button" variant="outline" onClick={addCustomTag} className="shrink-0">添加</Button>
                      </div>
                      {tagCatalog.customTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tagCatalog.customTags.slice(0, 8).map((tag) => (
                            <button key={tag} type="button" onClick={() => setCustomTags((items) => toggleTag(items, tag, 6))} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                      {customTags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {customTags.map((tag) => (
                            <button key={tag} type="button" onClick={() => setCustomTags((items) => items.filter((item) => item !== tag))} className="rounded-lg bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-800 hover:bg-rose-50 hover:text-rose-700">
                              {tag} 移除
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      size="lg"
                      onClick={handleAiBreakdown}
                      disabled={!title || !description || isAiLoading}
                      className="gap-2 rounded-xl border-none bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700"
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
              <Card className="relative overflow-hidden border-2 border-indigo-100 shadow-xl shadow-indigo-100/50">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-3xl" />
                <CardContent className="relative z-10 p-8">
                  <div className="mb-8 flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                      <Sparkles className="h-6 w-6 text-indigo-700" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">AI 任务拆解建议</h2>
                      <p className="text-sm text-indigo-700/80">来自 {aiSuggestion.provider}，你确认后会把任务发布到后端并进入匹配。</p>
                    </div>
                  </div>

                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-3 flex items-center text-sm font-semibold text-slate-700">
                          <Briefcase className="mr-2 h-4 w-4" />建议匹配标签
                        </h3>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {(aiSuggestion.skills.length ? aiSuggestion.skills : ['前端开发']).map((skill) => (
                              <Badge key={skill} variant="secondary" className="border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700">
                                技能 · {skill}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {aiSuggestion.businessTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="border-sky-100 bg-sky-50 px-3 py-1.5 text-sm text-sky-700">
                                场景 · {tag}
                              </Badge>
                            ))}
                            {aiSuggestion.deliverableTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="border-violet-100 bg-violet-50 px-3 py-1.5 text-sm text-violet-700">
                                交付 · {tag}
                              </Badge>
                            ))}
                            {aiSuggestion.customTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
                                自定义 · {tag}
                              </Badge>
                            ))}
                          </div>
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
                    <Button size="lg" onClick={applyAiSuggestions} className="gap-2 rounded-xl bg-indigo-600 shadow-md hover:bg-indigo-700">
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
                      {skills.map((skill) => <Badge key={skill} variant="outline" className="bg-white">技能 · {skill}</Badge>)}
                      {businessTags.map((tag) => <Badge key={tag} variant="outline" className="bg-sky-50 text-sky-700">场景 · {tag}</Badge>)}
                      {deliverableTags.map((tag) => <Badge key={tag} variant="outline" className="bg-violet-50 text-violet-700">交付 · {tag}</Badge>)}
                      {customTags.map((tag) => <Badge key={tag} variant="outline" className="bg-slate-100 text-slate-700">自定义 · {tag}</Badge>)}
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-slate-600">
                      <span className="flex items-center"><DollarSign className="mr-1 h-4 w-4 text-slate-400" /> {budget || '预算待确认'}</span>
                      <span className="flex items-center"><Calendar className="mr-1 h-4 w-4 text-slate-400" /> {cycle || '周期待确认'}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">里程碑金额配比</h3>
                        <p className="mt-1 text-sm text-slate-500">每个阶段会在合同工作区展示对应金额，人才提交进度时也能看到当前阶段价值。</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${Math.abs(milestoneRatioTotal - 100) <= 0.01 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        合计 {milestoneRatioTotal}%
                      </span>
                    </div>
                    <div className="space-y-3">
                      {milestoneBudgets.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 md:grid-cols-[1fr_120px_140px] md:items-center">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{index + 1}. {item.name}</p>
                            <p className="mt-1 text-xs text-slate-500">阶段金额：{formatMilestoneAmount(budgetNumber, item.ratio)}</p>
                          </div>
                          <label className="text-xs font-semibold text-slate-500">
                            配比
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={item.ratio}
                              onChange={(event) => setMilestoneBudgets((items) => items.map((next, nextIndex) => nextIndex === index ? { ...next, ratio: event.target.value } : next))}
                              className="mt-1 h-10 bg-white text-right"
                            />
                          </label>
                          <div className="text-right text-sm font-bold text-slate-900">{formatMilestoneAmount(budgetNumber, item.ratio)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm text-indigo-800">
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
                        className="rounded-xl border-none bg-indigo-600 shadow-lg shadow-indigo-500/25 hover:bg-indigo-700"
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
