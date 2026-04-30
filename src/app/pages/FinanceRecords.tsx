import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useStore } from "../store";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock, Download, FileSearch, Loader2, MessageSquare, Wallet } from "lucide-react";
import { getOrderRecords } from "../services/api";
import { asArray, moneyLabel, statusTone, stringOf } from "../services/workflowFormatters";

type TabKey = "all" | "ongoing" | "completed";

function badgeClass(value: unknown) {
  const tone = statusTone(value);
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "danger") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function normalizeRecord(item: any, index = 0) {
  const taskId = stringOf(item?.taskId, item?.id, item?.recordId, `task-${index + 1}`);
  return {
    taskId,
    title: stringOf(item?.title, item?.taskTitle, item?.name, `合作记录 ${index + 1}`),
    counterpartName: stringOf(item?.counterpartName, item?.partnerName, item?.talentName, item?.companyName, "合作方"),
    counterpartRole: stringOf(item?.counterpartRole, "合作方"),
    stage: stringOf(item?.stage, item?.statusGroup, item?.status, "待同步"),
    stageNote: stringOf(item?.stageNote, item?.summary, item?.detail, "合作记录会持续沉淀过程、附件和财务进度。"),
    statusKey: stringOf(item?.statusKey, "ongoing") as TabKey,
    amountValue: moneyLabel(item?.amountValue || item?.amount || item?.budget, "待确认"),
    amountLabel: stringOf(item?.amountLabel, "金额"),
    updatedAt: stringOf(item?.updatedAt, item?.time),
    startAt: stringOf(item?.startAt),
    endAt: stringOf(item?.endAt),
    rating: item?.rating || {},
    tags: asArray(item?.tags).map((tag) => String(tag)),
    roomKey: stringOf(item?.roomKey, item?.room)
  };
}

function tabLabel(tab: TabKey) {
  if (tab === "ongoing") return "进行中";
  if (tab === "completed") return "已完成";
  return "全部";
}

export function FinanceRecords() {
  const { currentUser } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEnterprise = currentUser?.role !== "TALENT";
  const audience = isEnterprise ? "enterprise" : "talent";
  const initialTab = (searchParams.get("tab") as TabKey) || "all";
  const [activeTab, setActiveTab] = useState<TabKey>(["all", "ongoing", "completed"].includes(initialTab) ? initialTab : "all");
  const [payload, setPayload] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadRecords() {
      setIsLoading(true);
      setError("");
      const data = await getOrderRecords(audience, activeTab);
      if (cancelled) return;
      setPayload(data);
      if (data.requestError) {
        setError(data.requestError);
      }
      setIsLoading(false);
    }
    loadRecords();
    return () => {
      cancelled = true;
    };
  }, [audience, activeTab]);

  const records = useMemo(() => asArray(payload?.items).map(normalizeRecord), [payload]);
  const summary = payload?.summary || {};
  const tabs = asArray(payload?.tabs).length
    ? asArray(payload.tabs).map((tab: any) => ({
        key: stringOf(tab?.key, "all") as TabKey,
        label: stringOf(tab?.label, tabLabel(tab?.key)),
        count: Number(tab?.count || 0)
      }))
    : ([
        { key: "all", label: "全部", count: Number(summary?.total || records.length) },
        { key: "ongoing", label: "进行中", count: Number(summary?.ongoing || 0) },
        { key: "completed", label: "已完成", count: Number(summary?.completed || 0) }
      ] as const);
  const accent = isEnterprise
    ? {
        badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
        activeTab: "bg-indigo-600 text-white shadow-sm",
        tag: "border-indigo-100 bg-indigo-50 text-indigo-700",
        settlementLink: "text-indigo-700 hover:bg-indigo-50",
        loader: "text-indigo-600"
      }
    : {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        activeTab: "bg-emerald-600 text-white shadow-sm",
        tag: "border-emerald-100 bg-emerald-50 text-emerald-700",
        settlementLink: "text-emerald-700 hover:bg-emerald-50",
        loader: "text-emerald-600"
      };

  function changeTab(nextTab: TabKey) {
    setActiveTab(nextTab);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", nextTab);
    setSearchParams(nextParams);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className={`mb-4 ${accent.badge}`}>
            记录与筛选
          </Badge>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">
            {isEnterprise ? "按申请、面试和合作状态浏览记录" : "按接单、交付和结算状态浏览记录"}
          </h1>
          <p className="text-slate-500">
            {stringOf(summary?.description, isEnterprise ? "这里汇总企业发起过的任务合作。" : "这里汇总人才参与过的任务合作。")}
          </p>
        </div>
        <Button variant="outline" className="rounded-xl border-slate-200 bg-white self-start md:self-auto">
          <Download className="w-4 h-4 mr-2" /> 导出记录
        </Button>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "全部记录", value: summary?.total ?? records.length, note: "已创建的合作链路", icon: FileSearch },
          { label: "进行中", value: summary?.ongoing ?? 0, note: "需要继续推进", icon: Clock },
          { label: "已完成", value: summary?.completed ?? 0, note: "可回看归档", icon: CheckCircle2 }
        ].map((stat, idx) => (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} key={stat.label}>
            <Card className="border-slate-200 shadow-sm overflow-hidden relative bg-white">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <stat.icon className="w-24 h-24" />
              </div>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</h3>
                <div className="mt-4 inline-flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  {stat.note}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="border-b border-slate-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => changeTab(tab.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.key ? accent.activeTab : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label} {tab.count}
              </button>
            ))}
          </div>
          <div className="text-sm text-slate-500">
            {isLoading ? "正在同步..." : `当前筛选：${tabLabel(activeTab)}，${records.length} 条结果`}
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-slate-500">
              <Loader2 className={`w-5 h-5 mx-auto mb-3 animate-spin ${accent.loader}`} /> 正在读取真实记录...
            </div>
          ) : records.length ? (
            <div className="divide-y divide-slate-100">
              {records.map((record, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={record.taskId}
                  className="p-6 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className={badgeClass(record.stage)}>
                          {record.stage}
                        </Badge>
                        <span className="text-xs text-slate-400">更新于 {record.updatedAt || "待同步"}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 truncate">{record.title}</h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{record.stageNote}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                          {record.counterpartRole}：{record.counterpartName}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                          {record.amountLabel}：{record.amountValue}
                        </span>
                        {record.rating?.value && (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                            {record.rating.label || "评分"}：{record.rating.value}
                          </span>
                        )}
                        {record.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className={`rounded-full border px-3 py-1 ${accent.tag}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap xl:flex-nowrap items-center gap-3 shrink-0">
                      <Link to={`/${audience}/workspace?taskId=${encodeURIComponent(record.taskId)}&roomKey=${encodeURIComponent(record.roomKey)}`}>
                        <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                          <BriefcaseBusiness className="w-4 h-4 mr-2" /> 工作区
                        </Button>
                      </Link>
                      <Link to={`/${audience}/chat?taskId=${encodeURIComponent(record.taskId)}&roomKey=${encodeURIComponent(record.roomKey)}`}>
                        <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                          <MessageSquare className="w-4 h-4 mr-2" /> 查看消息
                        </Button>
                      </Link>
                      <Link to={`/${audience}/records/${encodeURIComponent(record.taskId)}?taskId=${encodeURIComponent(record.taskId)}&roomKey=${encodeURIComponent(record.roomKey)}`}>
                        <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white">
                          打开记录 <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      <Link to={`/${audience}/records/${encodeURIComponent(record.taskId)}/settlement?taskId=${encodeURIComponent(record.taskId)}`}>
                        <Button variant="ghost" className={`rounded-xl ${accent.settlementLink}`}>
                          <Wallet className="w-4 h-4 mr-2" /> 结算
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center text-slate-500">
              当前筛选下暂无记录。
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
