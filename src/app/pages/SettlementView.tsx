import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ArrowRight, CheckCircle2, Clock, FileCheck, Loader2, Wallet } from "lucide-react";
import { getOrderRecordDetail, getOrderRecords } from "../services/api";
import { asArray, moneyLabel, normalizeFinanceSections, statusTone, stringOf } from "../services/workflowFormatters";

type Audience = "enterprise" | "talent";

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
    title: stringOf(item?.title, item?.taskTitle, `合作 ${index + 1}`),
    stage: stringOf(item?.stage, item?.statusGroup, "待同步"),
    amount: moneyLabel(item?.amountValue || item?.amount || item?.budget, "待确认"),
    updatedAt: stringOf(item?.updatedAt),
    counterpartName: stringOf(item?.counterpartName, "合作方"),
    roomKey: stringOf(item?.roomKey)
  };
}

export function SettlementView({ audience }: { audience: Audience }) {
  const { recordId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const taskId = stringOf(searchParams.get("taskId"), recordId);
  const isEnterprise = audience === "enterprise";
  const [recordsPayload, setRecordsPayload] = useState<any>(null);
  const [detailPayload, setDetailPayload] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setIsLoading(true);
      setError("");
      const listPromise = getOrderRecords(audience, "all");
      const detailPromise = taskId ? getOrderRecordDetail(audience, taskId) : Promise.resolve(null);
      const [list, detail] = await Promise.all([listPromise, detailPromise]);
      if (cancelled) return;
      setRecordsPayload(list);
      setDetailPayload(detail);
      const requestError = stringOf(list?.requestError, detail?.requestError);
      if (requestError) {
        setError(requestError);
      }
      setIsLoading(false);
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, [audience, taskId]);

  const records = useMemo(() => asArray(recordsPayload?.items).map(normalizeRecord), [recordsPayload]);
  const detailRecord = detailPayload?.record || null;
  const financeSections = detailRecord ? normalizeFinanceSections(detailRecord) : [];
  const pendingSections = financeSections.filter((section) => !/已完成|已结算|未发起|未开始/.test(section.status));
  const summary = recordsPayload?.summary || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">
            {isEnterprise ? "付款与对账" : "收入与请款"}
          </Badge>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">
            {isEnterprise ? "结算中心" : "我的结算"}
          </h1>
          <p className="text-slate-500">
            {isEnterprise ? "从真实订单记录读取请款、发票、对账与结算状态。" : "查看合作收入、企业付款与平台结算进度。"}
          </p>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: isEnterprise ? "合作任务" : "接单记录", value: summary?.total ?? records.length, note: "来自订单接口", icon: FileCheck },
          { label: "进行中", value: summary?.ongoing ?? 0, note: "仍有流程推进", icon: Clock },
          { label: "已完成", value: summary?.completed ?? 0, note: "可归档回看", icon: CheckCircle2 }
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-6">
              <stat.icon className="w-5 h-5 text-emerald-600 mb-4" />
              <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</h3>
              <div className="mt-4 inline-flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                {stat.note}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
          <Loader2 className="w-5 h-5 mx-auto mb-3 animate-spin" /> 正在读取结算数据...
        </div>
      ) : detailRecord ? (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <Badge variant="outline" className={badgeClass(detailRecord.stage || detailRecord.statusGroup)}>
                    {stringOf(detailRecord.stage, detailRecord.statusGroup, "待同步")}
                  </Badge>
                  <h2 className="text-2xl font-bold text-slate-900 mt-4">{stringOf(detailRecord.title, detailPayload?.summary?.title)}</h2>
                  <p className="text-sm text-slate-500 mt-2">合作方：{stringOf(detailRecord.counterpartName, "待同步")}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-right">
                  <p className="text-sm text-slate-500">合同金额</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{moneyLabel(detailRecord.amountValue || detailRecord.amount)}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {financeSections.map((section) => (
                  <div key={section.key} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline" className={badgeClass(section.status)}>
                        {section.label}
                      </Badge>
                      <span className="text-sm font-semibold text-slate-800">{section.status}</span>
                    </div>
                    {section.amount && <p className="mt-4 text-xl font-bold text-slate-900">{section.amount}</p>}
                    <p className="mt-3 text-sm text-slate-500 leading-relaxed">{section.note || "等待流程推进后同步。"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white h-fit">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">当前需要关注</h3>
              {pendingSections.length ? (
                <div className="space-y-3">
                  {pendingSections.map((section) => (
                    <div key={section.key} className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
                      {section.label}：{section.note || section.status}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">当前没有明确待处理的财务动作。</p>
              )}
              <Link to={`/${audience}/records/${encodeURIComponent(taskId)}?taskId=${encodeURIComponent(taskId)}`}>
                <Button variant="outline" className="w-full mt-5 rounded-xl border-slate-200 bg-white">
                  返回记录详情
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
          <div className="border-b border-slate-100 p-6 bg-slate-50/50">
            <h3 className="font-bold text-slate-900">全部结算线索</h3>
          </div>
          <CardContent className="p-0">
            {records.length ? (
              <div className="divide-y divide-slate-100">
                {records.map((record) => (
                  <div key={record.taskId} className="p-6 flex flex-col md:flex-row gap-5 md:items-center justify-between hover:bg-slate-50/70 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={badgeClass(record.stage)}>
                          {record.stage}
                        </Badge>
                        <span className="text-xs text-slate-400">{record.updatedAt}</span>
                      </div>
                      <h4 className="font-bold text-slate-900">{record.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">合作方：{record.counterpartName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{record.amount}</p>
                      </div>
                      <Link to={`/${audience}/records/${encodeURIComponent(record.taskId)}/settlement?taskId=${encodeURIComponent(record.taskId)}`}>
                        <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white">
                          查看 <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">当前没有可展示的结算记录。</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
