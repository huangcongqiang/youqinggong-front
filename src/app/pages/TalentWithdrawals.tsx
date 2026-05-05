import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Banknote, CheckCircle2, Clock, CreditCard, Loader2, Wallet } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Textarea } from "../components/ui/Textarea";
import { createTalentWithdrawal, getTalentWithdrawalData } from "../services/api";
import { asArray, isMutationFailed, moneyLabel, mutationMessage, statusTone, stringOf } from "../services/workflowFormatters";

const payoutChannels = [
  { value: "ALIPAY", label: "支付宝" },
  { value: "BANK_TRANSFER", label: "银行卡" }
];

function badgeClass(value: unknown) {
  const tone = statusTone(value);
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "danger") return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function amountValue(value: unknown) {
  const parsed = Number(stringOf(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function TalentWithdrawals() {
  const [payload, setPayload] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    amount: "",
    payoutChannel: "ALIPAY",
    accountName: "",
    accountNo: "",
    bankName: "",
    note: "申请将当前结算收入提取到指定账户。"
  });

  async function loadData() {
    setIsLoading(true);
    const nextPayload = await getTalentWithdrawalData();
    setPayload(nextPayload);
    setError(stringOf(nextPayload.requestError));
    const available = stringOf(nextPayload.walletSummary?.availableToWithdrawValue);
    setForm((current) => ({
      ...current,
      amount: current.amount || (Number(available) > 0 ? available : "")
    }));
    setIsLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const wallet = payload?.walletSummary || {};
  const withdrawals = useMemo(() => asArray<any>(payload?.withdrawals), [payload]);
  const availableAmount = amountValue(wallet.availableToWithdrawValue || wallet.availableToWithdraw);
  const canSubmit = availableAmount > 0 && !isSubmitting;

  async function submitWithdrawal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setError("当前没有可提现余额，可等待企业确认结算后再申请。");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setMessage("");
    const result = await createTalentWithdrawal(form);
    if (isMutationFailed(result)) {
      setError(mutationMessage(result, "当前暂时无法提交提现申请。"));
      setIsSubmitting(false);
      return;
    }
    setMessage(mutationMessage(result, "提现申请已提交，等待平台审核。"));
    setForm((current) => ({ ...current, amount: "" }));
    await loadData();
    setIsSubmitting(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="outline" className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700">
            钱包提现
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">提现中心</h1>
          <p className="mt-2 text-slate-500">查看可提现余额，提交收款账户，等待平台审核后打款。</p>
        </div>
        <Link to="/talent/settlement">
          <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
            我的结算 <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {(error || message) && (
        <div className={`rounded-2xl border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "累计收入", value: wallet.totalEarned, icon: Wallet },
              { label: "可提现", value: wallet.availableToWithdraw, icon: Banknote },
              { label: "已提现", value: wallet.withdrawnAmount, icon: CheckCircle2 }
            ].map((item) => (
              <Card key={item.label} className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <item.icon className="mb-4 h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{moneyLabel(item.value, "￥0")}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="font-bold text-slate-900">提现记录</h2>
              <p className="mt-1 text-sm text-slate-500">审核、打款和驳回都会沉淀在这里。</p>
            </div>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-emerald-600" /> 正在读取提现记录...
                </div>
              ) : withdrawals.length ? (
                <div className="divide-y divide-slate-100">
                  {withdrawals.map((item, index) => (
                    <motion.div key={stringOf(item.withdrawalId, item.withdrawalNo, index)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <Badge variant="outline" className={badgeClass(item.status || item.statusCode)}>
                            {stringOf(item.status, "待审核")}
                          </Badge>
                          <h3 className="mt-3 font-semibold text-slate-900">{moneyLabel(item.amount || item.amountValue, "￥0")}</h3>
                          <p className="mt-1 text-sm text-slate-500">{stringOf(item.payoutChannelLabel, item.payoutChannel)} · {stringOf(item.accountName, "收款人")}</p>
                        </div>
                        <div className="text-sm text-slate-400">{stringOf(item.createdAt, item.requestedAt)}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-sm text-slate-500">
                  <Clock className="mx-auto mb-3 h-5 w-5 text-slate-400" /> 还没有提现申请。
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="font-bold text-slate-900">发起提现</h2>
            <p className="mt-1 text-sm text-slate-500">{stringOf(wallet.withdrawHint, payload?.requestIssue, "提现申请会进入平台审核。")}</p>
          </div>
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={submitWithdrawal}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">提现金额</span>
                <input
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="例如 100.00"
                  inputMode="decimal"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">收款方式</span>
                <select
                  value={form.payoutChannel}
                  onChange={(event) => setForm((current) => ({ ...current, payoutChannel: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                >
                  {payoutChannels.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">收款人姓名</span>
                <input
                  value={form.accountName}
                  onChange={(event) => setForm((current) => ({ ...current, accountName: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder="填写真实姓名"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">收款账号</span>
                <input
                  value={form.accountNo}
                  onChange={(event) => setForm((current) => ({ ...current, accountNo: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  placeholder={form.payoutChannel === "ALIPAY" ? "支付宝账号" : "银行卡号"}
                />
              </label>
              {form.payoutChannel === "BANK_TRANSFER" && (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">开户行</span>
                  <input
                    value={form.bankName}
                    onChange={(event) => setForm((current) => ({ ...current, bankName: event.target.value }))}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="例如 招商银行上海分行"
                  />
                </label>
              )}
              <label className="block">
                <span className="text-sm font-medium text-slate-700">备注</span>
                <Textarea
                  value={form.note}
                  onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                  className="mt-2 min-h-24 rounded-xl bg-white text-sm"
                />
              </label>
              <Button type="submit" disabled={!canSubmit} className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                提交提现申请
              </Button>
              {!canSubmit && (
                <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> 当前没有可提现余额时，按钮会保持不可提交。
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
