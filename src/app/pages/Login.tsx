import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useStore } from '../store';
import { requestPasswordResetCode, resetPassword, type AuthAudience } from '../services/api';
import { Lock, Phone, ShieldCheck, ArrowRight, Loader2, X, CheckCircle2 } from 'lucide-react';

type ResetAudience = Extract<AuthAudience, 'enterprise' | 'talent'>;
type ResetStep = 'request' | 'confirm';

export function Login() {
  const [method, setMethod] = useState<'password' | 'code'>('password');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('request');
  const [resetAudience, setResetAudience] = useState<ResetAudience>('enterprise');
  const [resetPhone, setResetPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetDemoCode, setResetDemoCode] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  
  const { loginWithPassword } = useStore();
  const navigate = useNavigate();

  const isAudienceResolutionError = (message: string) =>
    [
      '当前账号不属于这个入口',
      '未找到匹配账号，请确认手机号/邮箱和当前入口角色是否一致'
    ].some((fragment) => message.includes(fragment));

  const loginByResolvedAudience = async () => {
    try {
      return await loginWithPassword({
        audience: 'enterprise',
        mobile: phone,
        password
      });
    } catch (enterpriseError) {
      const enterpriseMessage = enterpriseError instanceof Error ? enterpriseError.message : '';
      if (!isAudienceResolutionError(enterpriseMessage)) {
        throw enterpriseError;
      }
    }

    return loginWithPassword({
      audience: 'talent',
      mobile: phone,
      password
    });
  };

  const openPasswordReset = () => {
    setIsResetOpen(true);
    setResetStep('request');
    setResetAudience('enterprise');
    setResetPhone(phone);
    setResetCode('');
    setResetDemoCode('');
    setResetPasswordValue('');
    setResetPasswordConfirm('');
    setResetMessage('');
    setResetError('');
  };

  const closePasswordReset = () => {
    setIsResetOpen(false);
    setIsResetLoading(false);
  };

  const handleRequestPasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetDemoCode('');

    if (resetPhone.length !== 11) {
      setResetError('请输入有效的11位手机号');
      return;
    }

    setIsResetLoading(true);
    try {
      const result = await requestPasswordResetCode({
        audience: resetAudience,
        mobile: resetPhone
      });
      if (result.requestError || result.success === false) {
        setResetError(result.requestError || result.message || '当前暂时无法获取重置验证码。');
        return;
      }
      const demoCode = String(result.demoCode || '');
      setResetDemoCode(demoCode);
      setResetCode(demoCode);
      setResetMessage(result.message || '如果账号存在，验证码会发送到预留联系方式。');
      setResetStep('confirm');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setResetError('');

    if (!resetCode.trim()) {
      setResetError('请输入验证码');
      return;
    }
    if (resetPasswordValue.length < 6) {
      setResetError('新密码至少需要 6 位');
      return;
    }
    if (resetPasswordValue !== resetPasswordConfirm) {
      setResetError('两次输入的新密码不一致');
      return;
    }

    setIsResetLoading(true);
    try {
      const result = await resetPassword({
        audience: resetAudience,
        mobile: resetPhone,
        code: resetCode.trim(),
        newPassword: resetPasswordValue
      });
      if (result.requestError || result.success === false) {
        setResetError(result.requestError || result.message || '当前暂时无法重置密码。');
        return;
      }
      setPhone(resetPhone);
      setPassword('');
      setMethod('password');
      setNotice(result.message || '密码已重置，请使用新密码登录。');
      setError('');
      closePasswordReset();
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setNotice('');
    
    if (method === 'code') {
      setError('验证码登录还没有真实后端通道，先使用密码登录跑通数据流。');
      setIsLoading(false);
      return;
    }
    
    if (phone.length !== 11) {
      setError('请输入有效的11位手机号');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('请输入登录密码');
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginByResolvedAudience();
      const resolvedAudience = result?.user?.audience === 'talent' ? 'talent' : 'enterprise';
      navigate(result?.user?.homeRoute || (resolvedAudience === 'talent' ? '/talent' : '/enterprise'));
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80')] opacity-5 bg-cover bg-center"></div>
      
      <motion.div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-8 sm:p-12">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">登录有轻功</h2>
          <p className="text-center text-slate-500 text-sm mb-8">登录后会自动进入您对应的工作台</p>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-8 relative">
            <div className="flex-1 text-center py-2 text-sm font-medium z-10 cursor-pointer"
                 onClick={() => setMethod('code')}
                 style={{ color: method === 'code' ? '#4f46e5' : '#64748b' }}
            >
              验证码登录
            </div>
            <div className="flex-1 text-center py-2 text-sm font-medium z-10 cursor-pointer"
                 onClick={() => setMethod('password')}
                 style={{ color: method === 'password' ? '#4f46e5' : '#64748b' }}
            >
              密码登录
            </div>
            <motion.div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm"
              animate={{ left: method === 'code' ? '4px' : '50%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="请输入手机号" 
                  className="pl-10 h-12 bg-slate-50 border-transparent focus:bg-white" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {method === 'code' ? (
                <motion.div 
                  key="code"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative flex gap-2"
                >
                  <div className="relative flex-1">
                    <ShieldCheck className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input 
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="请输入验证码" 
                      className="pl-10 h-12 bg-slate-50 border-transparent focus:bg-white" 
                      value={code}
                      onChange={e => setCode(e.target.value)}
                    />
                  </div>
                  <Button type="button" variant="outline" className="h-12 px-4 shrink-0 text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                    获取验证码
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="relative"
                >
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    type="password"
                    autoComplete="current-password"
                    placeholder="请输入密码" 
                    className="pl-10 h-12 bg-slate-50 border-transparent focus:bg-white" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {notice && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-emerald-600 text-sm m-0"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {notice}
                </motion.p>
              )}
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm m-0"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full h-12 text-base rounded-xl group relative overflow-hidden"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">登录 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-8 text-center flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={openPasswordReset}
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              忘记密码？
            </button>
            <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700">去注册</Link>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isResetOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-reset-title"
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h3 id="password-reset-title" className="text-lg font-semibold text-slate-900">重置登录密码</h3>
                  <p className="mt-1 text-sm text-slate-500">选择账号角色后验证手机号</p>
                </div>
                <button
                  type="button"
                  onClick={closePasswordReset}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="关闭重置密码弹窗"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-5">
                <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  {(['enterprise', 'talent'] as ResetAudience[]).map((audience) => (
                    <button
                      key={audience}
                      type="button"
                      onClick={() => setResetAudience(audience)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        resetAudience === audience
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {audience === 'enterprise' ? '企业账号' : '人才账号'}
                    </button>
                  ))}
                </div>

                {resetStep === 'request' ? (
                  <form className="space-y-4" onSubmit={handleRequestPasswordReset}>
                    <div className="relative">
                      <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="请输入注册手机号"
                        className="pl-10 h-12 bg-slate-50 border-transparent focus:bg-white"
                        value={resetPhone}
                        onChange={(event) => setResetPhone(event.target.value)}
                      />
                    </div>
                    {resetError && <p className="text-sm text-red-500">{resetError}</p>}
                    <Button type="submit" variant="primary" className="h-11 w-full rounded-xl" disabled={isResetLoading}>
                      {isResetLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '获取重置验证码'}
                    </Button>
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={handleConfirmPasswordReset}>
                    {resetMessage && (
                      <div className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                        {resetMessage}
                        {resetDemoCode && (
                          <div className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-base font-semibold tracking-widest text-indigo-600">
                            {resetDemoCode}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="relative">
                      <ShieldCheck className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="请输入验证码"
                        className="pl-10 h-12 bg-slate-50 border-transparent focus:bg-white"
                        value={resetCode}
                        onChange={(event) => setResetCode(event.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="请输入新密码"
                        className="pl-10 h-12 bg-slate-50 border-transparent focus:bg-white"
                        value={resetPasswordValue}
                        onChange={(event) => setResetPasswordValue(event.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="请再次输入新密码"
                        className="pl-10 h-12 bg-slate-50 border-transparent focus:bg-white"
                        value={resetPasswordConfirm}
                        onChange={(event) => setResetPasswordConfirm(event.target.value)}
                      />
                    </div>
                    {resetError && <p className="text-sm text-red-500">{resetError}</p>}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => setResetStep('request')}
                        disabled={isResetLoading}
                      >
                        返回
                      </Button>
                      <Button type="submit" variant="primary" className="h-11 rounded-xl" disabled={isResetLoading}>
                        {isResetLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '确认重置'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
