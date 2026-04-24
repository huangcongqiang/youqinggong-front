import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ArrowLeft, UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { getTaskMarketplaceData, requestTaskCollaboration, uploadTaskAttachmentAsset } from '../services/api';
import { asArray, isMutationFailed, mutationMessage, stringOf } from '../services/workflowFormatters';

function findTask(data: any, taskId = '') {
  return asArray<any>(data?.items || data?.tasks).find((item) => stringOf(item?.id, item?.taskId) === taskId);
}

export function TaskApply() {
  const { taskId = '' } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [quote, setQuote] = useState('');
  const [availableTime, setAvailableTime] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let alive = true;
    getTaskMarketplaceData().then((data: any) => {
      if (!alive) {
        return;
      }
      setTask(findTask(data, taskId) || null);
      setError(data?.requestError || '');
    });
    return () => {
      alive = false;
    };
  }, [taskId]);

  const screeningQuestions = asArray<string>(task?.screeningQuestions || task?.questions);
  const action = task?.action || {};
  const actionStatus = stringOf(action?.status, task?.applicationStatus).toUpperCase();
  const isInterviewPending = actionStatus === 'INTERVIEW_PENDING' || stringOf(action?.type, task?.actionType).toLowerCase() === 'interview_decision';
  const taskBudget = stringOf(task?.budget, '预算待确认');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskId) {
      setError('缺少任务 ID，暂时无法提交申请。');
      return;
    }
    if (isInterviewPending) {
      navigate(`/talent/tasks?taskId=${encodeURIComponent(taskId)}`);
      return;
    }
    if (action?.disabled) {
      setError(stringOf(action?.note, '这条任务当前暂不可申请。'));
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    const uploadedFiles = [];
    for (const file of files) {
      const uploaded = await uploadTaskAttachmentAsset(taskId, file, {
        scene: 'APPLICATION_MATERIAL',
        source: 'APPLICATION'
      });
      if ((uploaded as any).requestError) {
        setIsSubmitting(false);
        setError((uploaded as any).requestError);
        return;
      }
      uploadedFiles.push(uploaded);
    }

    const response = await requestTaskCollaboration(taskId, {
      source: 'react-demo',
      note: coverLetter,
      quote,
      availableTime,
      answers,
      attachmentFiles: uploadedFiles
    }) as any;

    setIsSubmitting(false);
    if (isMutationFailed(response)) {
      setError(mutationMessage(response, '申请提交失败，请稍后再试。'));
      return;
    }

    setMessage(stringOf(response?.nextStep, '申请已提交，等待企业确认。'));
    if (response?.nextRoute) {
      navigate(response.nextRoute);
      return;
    }
    navigate(`/talent/records/${encodeURIComponent(taskId)}?taskId=${encodeURIComponent(taskId)}&source=apply`);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link to={`/talent/tasks/${taskId}`} className="mb-6 inline-flex items-center text-slate-500 transition-colors hover:text-emerald-700">
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回任务详情
      </Link>

      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">提交合作申请</h1>
        <p className="text-sm text-slate-500">这里会直接写入 Spring 后端申请流程；附件会先走真实上传接口。</p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}
      {message && (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardContent className="space-y-8 p-8">
            {task && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">申请任务</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">{stringOf(task?.title, taskId)}</h2>
                <p className="mt-2 text-sm text-slate-500">{stringOf(task?.company)} · {taskBudget}</p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900">
                申请说明 <span className="text-red-500">*</span>
              </label>
              <p className="mb-3 text-xs text-slate-500">介绍你为什么适合这个任务，以及可以如何推进第一步。</p>
              <textarea
                required
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                className="h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="说明你的相关经验、可交付方式和第一周计划..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-900">
                  您的报价 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">￥</span>
                  <input
                    type="number"
                    required
                    value={quote}
                    onChange={(event) => setQuote(event.target.value)}
                    placeholder="请输入预计总报价"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">企业预算: {taskBudget}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-900">
                  可用时间 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={availableTime}
                  onChange={(event) => setAvailableTime(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">请选择每周可用时间</option>
                  <option value="10">每周 10 小时以内</option>
                  <option value="20">每周 10-20 小时</option>
                  <option value="40">每周 40 小时</option>
                </select>
              </div>
            </div>

            {screeningQuestions.length > 0 && (
              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-lg font-bold text-slate-900">企业筛选问题</h3>
                <div className="space-y-6">
                  {screeningQuestions.map((question, index) => (
                    <div key={`${question}-${index}`}>
                      <label className="mb-3 block text-sm font-medium text-slate-800">
                        <span className="mr-2 font-bold text-emerald-600">Q{index + 1}.</span>
                        {question}
                      </label>
                      <textarea
                        required
                        value={answers[String(index)] || ''}
                        onChange={(event) => setAnswers((prev) => ({ ...prev, [String(index)]: event.target.value }))}
                        className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="请输入您的回答..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-6">
              <label className="mb-2 block text-sm font-bold text-slate-900">附加作品/简历 (选填)</label>
              <label className="mt-2 flex cursor-pointer justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 pb-6 pt-5 transition-colors hover:border-emerald-400 hover:bg-emerald-50/50">
                <div className="space-y-2 text-center">
                  <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
                  <div className="flex justify-center text-sm text-slate-600">
                    <span className="rounded-md bg-transparent font-medium text-emerald-700">上传文件</span>
                    <p className="pl-1">支持图片、PDF、Word 或压缩包</p>
                  </div>
                  <p className="text-xs text-slate-400">提交时会走真实附件上传接口</p>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => setFiles(Array.from(event.target.files || []))}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file) => (
                    <motion.div
                      key={`${file.name}-${file.size}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-2 text-slate-700">
                        <FileText className="h-4 w-4 text-slate-400" />
                        {file.name}
                      </span>
                      <button type="button" onClick={() => setFiles((prev) => prev.filter((item) => item !== file))} className="text-slate-400 hover:text-rose-500">
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate(-1)} className="rounded-xl">取消</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px] rounded-xl bg-emerald-700 shadow-md shadow-emerald-500/20 hover:bg-emerald-800">
            {isSubmitting ? '提交中...' : isInterviewPending ? '去处理面试邀约' : '确认提交'}
          </Button>
        </div>
      </form>
    </div>
  );
}
