import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Star, CheckCircle, ArrowRight, UploadCloud, Briefcase, Award, AlertCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { submitTalentOnboarding, uploadStandaloneAttachmentAsset } from '../services/api';
import { isMutationFailed, mutationMessage, stringOf } from '../services/workflowFormatters';

export function TalentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    displayName: '',
    headline: '',
    introduction: '',
    dayRate: '',
    skillInput: '',
    skills: [] as string[],
    portfolioUrls: [] as string[],
    portfolioInput: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    { id: 1, title: '基本资料', icon: User },
    { id: 2, title: '技能标签', icon: Star },
    { id: 3, title: '作品与认证', icon: Briefcase },
    { id: 4, title: '信息核对', icon: CheckCircle }
  ];

  const updateField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const addSkill = () => {
    const skill = form.skillInput.trim();
    if (!skill || form.skills.includes(skill)) return;
    setForm((prev) => ({ ...prev, skillInput: '', skills: [...prev.skills, skill] }));
  };

  const addPortfolioUrl = () => {
    const value = form.portfolioInput.trim();
    if (!value || form.portfolioUrls.includes(value)) return;
    setForm((prev) => ({ ...prev, portfolioInput: '', portfolioUrls: [...prev.portfolioUrls, value] }));
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
      materials: materialFiles.map((item) => item.url).filter(Boolean),
      materialFiles,
      portfolioUrls: form.portfolioUrls,
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
    if (step === 2 && form.skills.length === 0) {
      setError('请至少添加一个技能标签。');
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
                  <h2 className="mb-6 text-xl font-bold text-slate-900">技能与技术栈</h2>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">添加技能</label>
                    <div className="flex gap-2">
                      <input value={form.skillInput} onChange={(event) => updateField('skillInput', event.target.value)} onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addSkill())} className="flex-1 rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="例如：React, Node.js, 产品架构" />
                      <Button type="button" variant="outline" onClick={addSkill} className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">添加</Button>
                    </div>
                  </div>
                  <div className="flex min-h-[120px] flex-wrap content-start items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 p-6">
                    {form.skills.map((skill) => (
                      <button key={skill} type="button" onClick={() => updateField('skills', form.skills.filter((item) => item !== skill))} className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-red-50 hover:text-red-600">
                        {skill} <X className="h-3 w-3" />
                      </button>
                    ))}
                    {form.skills.length === 0 && <p className="mt-1.5 w-full text-sm text-slate-400">继续添加技能标签...</p>}
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
                    <label className="mb-1 block text-sm font-medium text-slate-700">作品/代码托管链接</label>
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
