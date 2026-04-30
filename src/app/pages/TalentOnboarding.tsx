import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Star, CheckCircle, ArrowRight, UploadCloud, Briefcase, Award, AlertCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { getTagCatalog, submitTalentOnboarding, uploadStandaloneAttachmentAsset } from '../services/api';
import { isMutationFailed, mutationMessage, stringOf } from '../services/workflowFormatters';
import { mergeTags, normalizeCatalog, toggleTag, type TagCatalog } from '../services/tagCatalog';

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
                active ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'
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

export function TalentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    displayName: '',
    headline: '',
    introduction: '',
    dayRate: '',
    skills: [] as string[],
    businessTags: [] as string[],
    deliverableTags: [] as string[],
    customTagInput: '',
    customTags: [] as string[],
    portfolioUrls: [] as string[],
    portfolioInput: ''
  });
  const [tagCatalog, setTagCatalog] = useState<TagCatalog>(() => normalizeCatalog({}));
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    { id: 1, title: '基本资料', icon: User },
    { id: 2, title: '技能标签', icon: Star },
    { id: 3, title: '作品与认证', icon: Briefcase },
    { id: 4, title: '信息核对', icon: CheckCircle }
  ];

  useEffect(() => {
    let alive = true;
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

  const updateField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const addCustomTag = () => {
    const tag = form.customTagInput.trim();
    if (!tag || form.customTags.includes(tag)) return;
    setForm((prev) => ({ ...prev, customTagInput: '', customTags: [...prev.customTags, tag].slice(0, 6) }));
  };

  const addPortfolioUrl = () => {
    const value = form.portfolioInput.trim();
    if (!value || form.portfolioUrls.includes(value)) return;
    setForm((prev) => ({ ...prev, portfolioInput: '', portfolioUrls: [...prev.portfolioUrls, value] }));
  };

  const portfolioUrlsForSubmit = () => {
    const pendingInput = form.portfolioInput.trim();
    return Array.from(new Set([...form.portfolioUrls, pendingInput].map((item) => item.trim()).filter(Boolean)));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    const uploadedFiles = [];
    for (const file of files) {
      const uploaded = await uploadStandaloneAttachmentAsset(file, { scene: 'TALENT_ONBOARDING', source: 'TALENT_ONBOARDING' });
      if ((uploaded as any).requestError) {
        setIsSubmitting(false);
        setError((uploaded as any).requestError);
        return;
      }
      uploadedFiles.push(uploaded);
    }

    const materialFiles = uploadedFiles.map((item: any) => ({
      name: stringOf(item.name),
      type: stringOf(item.type || item.mimeType),
      size: Number(item.size || 0),
      url: stringOf(item.url || item.downloadUrl),
      uploadId: stringOf(item.uploadId),
      objectKey: stringOf(item.objectKey)
    }));
    const result = await submitTalentOnboarding({
      displayName: form.displayName,
      headline: form.headline,
      skills: form.skills,
      customSkills: [],
      businessTags: form.businessTags,
      deliverableTags: form.deliverableTags,
      customTags: form.customTags,
      materials: materialFiles.map((item) => item.url).filter(Boolean),
      materialFiles,
      portfolioUrls: portfolioUrlsForSubmit(),
      introduction: form.introduction,
      dayRate: form.dayRate
    });
    setIsSubmitting(false);

    if (isMutationFailed(result)) {
      setError(mutationMessage(result, '人才入驻提交失败，请稍后再试。'));
      return;
    }
    navigate('/talent');
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && (!form.displayName.trim() || !form.headline.trim())) {
      setError('请填写展示名称和职业头衔。');
      return;
    }
    if (step === 2 && form.skills.length < 2) {
      setError('请至少选择 2 个核心技能标签。');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    handleSubmit();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
            <User className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">高端人才入驻</h1>
          <p className="mt-2 text-slate-500">资料会提交到 Spring 后端人才入驻接口，附件走真实上传。</p>
        </div>

        <div className="mb-12 overflow-x-auto pb-4">
          <div className="relative flex min-w-[520px] items-center justify-between">
            <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
            <div className="absolute left-0 top-1/2 -z-10 h-0.5 -translate-y-1/2 bg-emerald-600 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            {steps.map((item) => (
              <div key={item.id} className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-4 font-semibold transition-colors ${step >= item.id ? 'border-emerald-100 bg-emerald-600 text-white' : 'border-slate-100 bg-white text-slate-400'}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className={`mt-2 text-xs font-medium ${step >= item.id ? 'text-emerald-900' : 'text-slate-400'}`}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <AlertCircle className="mr-2 inline h-4 w-4" />
            {error}
          </div>
        )}

        <Card className="border-0 shadow-xl shadow-slate-200/50">
          <CardContent className="p-8 md:p-12">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="mb-6 text-xl font-bold text-slate-900">基本资料</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">展示名称</label>
                      <input value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="对外展示名称" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">职业头衔</label>
                      <input value={form.headline} onChange={(event) => updateField('headline', event.target.value)} className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="例如：资深全栈工程师" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">期望日薪</label>
                      <input value={form.dayRate} onChange={(event) => updateField('dayRate', event.target.value)} type="number" className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="例如：800" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">个人简介</label>
                    <textarea value={form.introduction} onChange={(event) => updateField('introduction', event.target.value)} className="h-32 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="简要介绍您的从业背景与核心竞争力..." />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">技能与经验标签</h2>
                    <p className="mt-2 text-sm text-slate-500">核心技能是接任务的硬条件，业务场景和交付物用于证明做过类似项目。</p>
                  </div>
                  <TagChoiceGroup
                    title="核心技能"
                    note="必填 2-6 个，会作为企业推荐的主匹配条件。"
                    options={tagCatalog.skills}
                    selected={form.skills}
                    onToggle={(tag) => updateField('skills', toggleTag(form.skills, tag, 6))}
                    max={6}
                  />
                  <TagChoiceGroup
                    title="业务场景经验"
                    note="可选，做过类似行业或业务时选择。"
                    options={tagCatalog.businessTags}
                    selected={form.businessTags}
                    onToggle={(tag) => updateField('businessTags', toggleTag(form.businessTags, tag))}
                  />
                  <TagChoiceGroup
                    title="交付物经验"
                    note="可选，标记你交付过的成果类型。"
                    options={tagCatalog.deliverableTags}
                    selected={form.deliverableTags}
                    onToggle={(tag) => updateField('deliverableTags', toggleTag(form.deliverableTags, tag))}
                  />
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-800">自定义补充标签</h3>
                    <p className="mt-1 text-xs text-slate-500">没有合适固定标签时补充，平台会保存为候选标签。</p>
                    <div className="mt-3 flex gap-2">
                      <input value={form.customTagInput} onChange={(event) => updateField('customTagInput', event.target.value)} onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addCustomTag())} className="flex-1 rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="例如：AIGC 海报、私域转化" />
                      <Button type="button" variant="outline" onClick={addCustomTag} className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">添加</Button>
                    </div>
                    {tagCatalog.customTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tagCatalog.customTags.slice(0, 8).map((tag) => (
                          <button key={tag} type="button" onClick={() => updateField('customTags', toggleTag(form.customTags, tag, 6))} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex min-h-[56px] flex-wrap content-start items-start gap-2 rounded-xl bg-slate-50 p-3">
                      {mergeTags(form.skills, form.businessTags, form.deliverableTags, form.customTags).map((tag) => (
                        <button key={tag} type="button" onClick={() => {
                          updateField('skills', form.skills.filter((item) => item !== tag));
                          updateField('businessTags', form.businessTags.filter((item) => item !== tag));
                          updateField('deliverableTags', form.deliverableTags.filter((item) => item !== tag));
                          updateField('customTags', form.customTags.filter((item) => item !== tag));
                        }} className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-red-50 hover:text-red-600">
                          {tag} <X className="h-3 w-3" />
                        </button>
                      ))}
                      {mergeTags(form.skills, form.businessTags, form.deliverableTags, form.customTags).length === 0 && <p className="mt-1.5 w-full text-sm text-slate-400">选择固定标签或补充自定义标签...</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="mb-6 text-xl font-bold text-slate-900">作品与认证</h2>
                  <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-10 text-center transition-colors hover:bg-slate-50">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <UploadCloud className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">上传作品集、简历、身份证明或证书</p>
                    <p className="mt-2 text-xs text-slate-500">提交时会上传到后端</p>
                    <input type="file" multiple className="hidden" onChange={(event) => setFiles(Array.from(event.target.files || []))} />
                  </label>
                  {files.length > 0 && <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">已选择 {files.length} 份文件：{files.map((file) => file.name).join('、')}</div>}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">作品/代码托管链接 <span className="font-normal text-slate-400">选填</span></label>
                    <div className="flex gap-2">
                      <input value={form.portfolioInput} onChange={(event) => updateField('portfolioInput', event.target.value)} className="flex-1 rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="https://" />
                      <Button type="button" variant="outline" onClick={addPortfolioUrl}>添加</Button>
                    </div>
                    {form.portfolioUrls.length > 0 && <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{form.portfolioUrls.join('、')}</div>}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Award className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">信息核对与提交</h2>
                    <p className="mt-2 text-sm text-slate-500">请核对以下真实填写的信息，确认后提交入驻。</p>
                  </div>
                  <div className="space-y-4 rounded-xl bg-slate-50 p-6 text-sm">
                    <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-slate-500">展示名称</span><span className="font-medium text-slate-900">{form.displayName || '未填写'}</span></div>
                    <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-slate-500">职业头衔</span><span className="font-medium text-slate-900">{form.headline || '未填写'}</span></div>
                    <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-slate-500">核心技能</span><span className="font-medium text-slate-900">{form.skills.join('、') || '未填写'}</span></div>
                    <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-slate-500">场景经验</span><span className="font-medium text-slate-900">{form.businessTags.join('、') || '未填写'}</span></div>
                    <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-slate-500">交付物经验</span><span className="font-medium text-slate-900">{form.deliverableTags.join('、') || '未填写'}</span></div>
                    <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-slate-500">自定义标签</span><span className="font-medium text-slate-900">{form.customTags.join('、') || '未填写'}</span></div>
                    <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-slate-500">作品链接</span><span className="font-medium text-slate-900">{portfolioUrlsForSubmit().join('、') || '未填写'}</span></div>
                    <div className="flex justify-between pb-1"><span className="text-slate-500">上传材料</span><span className="font-medium text-emerald-700">{files.length ? `${files.length} 份文件` : '未上传'}</span></div>
                  </div>
                </div>
              )}

              <div className="mt-10 flex justify-between border-t border-slate-100 pt-6">
                <Button variant="outline" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || isSubmitting} className={step === 1 ? 'opacity-0' : ''}>返回上一步</Button>
                <Button onClick={handleNext} disabled={isSubmitting} className="border-transparent bg-emerald-700 px-8 hover:bg-emerald-800">
                  {isSubmitting ? '提交审核中...' : step === 4 ? '确认并提交申请' : '下一步'}
                  {!isSubmitting && step !== 4 && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
