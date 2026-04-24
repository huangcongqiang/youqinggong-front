import React from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";

export function LoadingState({ text = "正在同步真实数据..." }: { text?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
      <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-emerald-600" />
      {text}
    </div>
  );
}

export function ErrorState({ text }: { text?: string }) {
  if (!text) {
    return null;
  }
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      <AlertCircle className="mr-2 inline h-4 w-4" />
      {text}
    </div>
  );
}

export function EmptyState({ title = "暂无数据", text = "当前接口还没有返回可展示的数据。" }: { title?: string; text?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
      <Inbox className="mx-auto mb-4 h-8 w-8 text-slate-300" />
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-2 text-sm">{text}</p>
    </div>
  );
}
