import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, User, FileText, CheckCircle, ArrowRight, UploadCloud, Building, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { submitBusinessOnboarding, uploadStandaloneAttachmentAsset } from '../services/api';
import { isMutationFailed, mutationMessage, stringOf } from '../services/workflowFormatters';

export function EnterpriseOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    organizationName: '',
    projectFocus: '',
    contactName: '',
    contactRole: '',
    contactMobile: '',
    collaborationPreferences: [] as string[],
    virtualCompany: false,
    deferMaterials: false
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    { id: 1, title: '企业资料', icon: Building2 },
    { id: 2, title: '联系人', icon: User },
    { id: 3, title: '资质上传', icon: FileText },
    { id: 4, title: '信息核对', icon: CheckCircle }
  ];

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePreference = (value: string) => {
    setForm((prev) => ({
      ...prev,
      collaborationPreferences: prev.collaborationPreferences.includes(value)
        ? prev.collaborationPreferences.filter((item) => item !== value)
        : [...prev.collaborationPreferences, value]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    const uploadedFiles = [];
    for (const file of files) {
      const uploaded = await uploadStandaloneAttachmentAsset(file, { scene: 'BUSINESS_ONBOARDING', source: 'BUSINESS_ONBOARDING' });
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
    const result = await submitBusinessOnboarding({
      ...form,
      materials: materialFiles.map((item) => item.url).filter(Boolean),
      materialFiles
    });
    setIsSubmitting(false);

    if (isMutationFailed(result)) {
      setError(mutationMessage(result, '企业入驻提交失败，请稍后再试。'));
      return;
    }
    navigate('/enterprise');
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !form.organizationName.trim()) {
      setError('请先填写企业名称。');
      return;
    }
    if (step === 2 && (!form.contactName.trim() || !form.contactMobile.trim())) {
      setError('请填写联系人姓名和联系电话。');
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
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg">
            <Building className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">企业入驻申请</h1>
          <p className="mt-2 text-slate-500">资料会提交到 Spring 后端入驻接口，附件走真实上传。</p>
        </div>

        <div className="mb-12">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
            <div className="absolute left-0 top-1/2 -z-10 h-0.5 -translate-y-1/2 bg-emerald-700 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            {steps.map((item) => (
              <div key={item.id} className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-4 font-semibold transition-colors ${step >= item.id ? 'border-emerald-100 bg-emerald-700 text-white' : 'border-slate-100 bg-white text-slate-400'}`}>
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
                  <h2 className="mb-6 text-xl font-bold text-slate-900">基本信息</h2>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">企业名称</label>
                    <input value={form.organizationName} onChange={(event) => updateField('organizationName', event.target.value)} className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="请输入营业执照上的完整名称" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">近期合作重点</label>
                    <textarea value={form.projectFocus} onChange={(event) => updateField('projectFocus', event.target.value)} className="h-28 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="例如：希望找到 UI 设计、前端开发或 AI 工作流人才..." />
                  </div>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <input type="checkbox" checked={form.virtualCompany} onChange={(event) => updateField('virtualCompany', event.target.checked)} />
                    个人品牌或虚拟企业入驻
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="mb-6 text-xl font-bold text-slate-900">入驻联系人</h2>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">联系人姓名</label>
                    <input value={form.contactName} onChange={(event) => updateField('contactName', event.target.value)} className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="您的真实姓名" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">职务</label>
                    <input value={form.contactRole} onChange={(event) => updateField('contactRole', event.target.value)} className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="例如：项目负责人、创始人" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">联系电话</label>
                    <input value={form.contactMobile} onChange={(event) => updateField('contactMobile', event.target.value)} className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="用于审核联系" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['远程协作', '快速交付', '长期合作', '需要发票'].map((item) => (
                      <button key={item} type="button" onClick={() => togglePreference(item)} className={`rounded-full border px-4 py-2 text-sm ${form.collaborationPreferences.includes(item) ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="mb-6 text-xl font-bold text-slate-900">资质上传</h2>
                  <p className="mb-4 text-sm text-slate-500">可上传营业执照、品牌证明、项目需求说明等材料。</p>
                  <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-10 text-center transition-colors hover:bg-slate-50">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                      <UploadCloud className="h-8 w-8 text-emerald-700" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">点击选择文件</p>
                    <p className="mt-2 text-xs text-slate-500">支持图片、PDF、Word，提交时上传到后端</p>
                    <input type="file" multiple className="hidden" onChange={(event) => setFiles(Array.from(event.target.files || []))} />
                  </label>
                  {files.length > 0 && <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">已选择 {files.length} 份文件：{files.map((file) => file.name).join('、')}</div>}
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    <input type="checkbox" checked={form.deferMaterials} onChange={(event) => updateField('deferMaterials', event.target.checked)} />
                    暂时没有材料，先提交资料后补
                  </label>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">信息已准备就绪</h2>
                    <p className="mt-2 text-sm text-slate-500">请核对以下真实填写的信息，确认后提交审核。</p>
                  </div>
                  <div className="space-y-4 rounded-xl bg-slate-50 p-6 text-sm">
                    <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-slate-500">企业名称</span><span className="font-medium text-slate-900">{form.organizationName || '未填写'}</span></div>
                    <div className="flex justify-between border-b border-slate-200 pb-3"><span className="text-slate-500">联系人</span><span className="font-medium text-slate-900">{form.contactName || '未填写'}</span></div>
                    <div className="flex justify-between pb-1"><span className="text-slate-500">上传材料</span><span className="font-medium text-emerald-700">{files.length ? `${files.length} 份文件` : form.deferMaterials ? '后补材料' : '未上传'}</span></div>
                  </div>
                </div>
              )}

              <div className="mt-10 flex justify-between border-t border-slate-100 pt-6">
                <Button variant="outline" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1 || isSubmitting} className={step === 1 ? 'opacity-0' : ''}>返回上一步</Button>
                <Button onClick={handleNext} disabled={isSubmitting} className="bg-emerald-700 px-8 hover:bg-emerald-800">
                  {isSubmitting ? '提交中...' : step === 4 ? '确认提交' : '下一步'}
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
