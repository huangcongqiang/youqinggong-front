import React, { useMemo, useState } from "react";
import { Download, ExternalLink, FileText, Image as ImageIcon, X } from "lucide-react";
import { Button } from "./ui/Button";
import { attachmentHref, attachmentName, normalizeAttachment, NormalizedAttachment } from "../services/workflowFormatters";

function isImageFile(file: NormalizedAttachment) {
  const type = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  return type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/.test(name);
}

function normalizeFile(file: any): NormalizedAttachment {
  if (file && typeof file === "object" && "name" in file && "href" in file) {
    return file as NormalizedAttachment;
  }
  return {
    ...normalizeAttachment(file),
    name: attachmentName(file),
    href: attachmentHref(file)
  };
}

export function AttachmentButton({
  file,
  className = "",
  compact = false
}: {
  file: any;
  className?: string;
  compact?: boolean;
}) {
  const normalized = useMemo(() => normalizeFile(file), [file]);
  const [open, setOpen] = useState(false);
  const canPreviewImage = isImageFile(normalized) && Boolean(normalized.href);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 ${compact ? "px-3 py-2" : "px-4 py-3"} ${className}`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            {canPreviewImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-800">{normalized.name || "附件"}</span>
            {normalized.note && <span className="block truncate text-xs text-slate-400">{normalized.note}</span>}
          </span>
        </span>
        <ExternalLink className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900">{normalized.name || "附件"}</p>
                <p className="text-xs text-slate-500">{canPreviewImage ? "图片预览" : "当前附件不支持在线预览，请下载后查看。"}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto bg-slate-50 p-6">
              {canPreviewImage ? (
                <img src={normalized.href} alt={normalized.name} className="mx-auto max-h-[60vh] rounded-2xl object-contain shadow-sm" />
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                  <p className="font-semibold text-slate-900">非图片附件</p>
                  <p className="mt-2 text-sm text-slate-500">支持通过下载查看 PDF、Word、压缩包、代码文件等内容。</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-slate-200 bg-white">
                关闭
              </Button>
              <a href={normalized.href || undefined} target="_blank" rel="noreferrer" download>
                <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" disabled={!normalized.href}>
                  <Download className="mr-2 h-4 w-4" /> 下载附件
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
