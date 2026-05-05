import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useStore } from '../store';
import { Building2, UserCircle, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

export function Register() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<'ENTERPRISE' | 'TALENT' | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    code: '',
    name: '',
    password: '',
    companyName: '' // only for enterprise
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { registerAccount } = useStore();
  const navigate = useNavigate();

  const handleNext = () => {
    if (!role) {
      setError('请选择您的注册身份');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.phone.length !== 11) {
      setError('请输入有效的11位手机号');
      return;
    }
    if (formData.password.length < 6) {
      setError('请输入至少 6 位登录密码');
      return;
    }
    if (!formData.name.trim()) {
      setError('请输入姓名/昵称');
      return;
    }
    if (role === 'ENTERPRISE' && !formData.companyName.trim()) {
      setError('请输入企业名称');
      return;
    }

    setIsLoading(true);

    try {
      const audience = role === 'ENTERPRISE' ? 'enterprise' : 'talent';
      const result = await registerAccount({
        audience,
        mobile: formData.phone,
        password: formData.password,
        displayName: formData.name,
        organizationName: role === 'ENTERPRISE' ? formData.companyName : undefined,
        headline: role === 'TALENT' ? '自由职业者' : undefined,
        skills: []
      });

      navigate(result?.user?.homeRoute || (role === 'ENTERPRISE' ? '/enterprise' : '/talent'));
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : '注册失败，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50 blur-3xl opacity-70 mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-50 blur-3xl opacity-70 mix-blend-multiply pointer-events-none" />
      
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex z-10 min-h-[600px]">
        {/* Left Info Panel */}
        <div className="hidden lg:flex w-5/12 bg-indigo-600 flex-col justify-between p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90" />
          
          <div className="relative z-10">
            <Link to="/" className="text-3xl font-bold tracking-tight text-white mb-2 inline-block">
              有轻功 <span className="text-indigo-200">Pro</span>
            </Link>
            <p className="text-indigo-100 mt-2 text-lg">新一代灵活用工与人才协作平台</p>
          </div>

          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl font-semibold mb-6">加入我们，体验：</h3>
            {[
              { title: '安全合规', desc: '平台资金托管，电子合同存证，合规保障。' },
              { title: '极速匹配', desc: 'AI 驱动双向推荐，缩短招聘与求职周期。' },
              { title: '线上验收', desc: '全流程云端协作，阶段节点把控项目进度。' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-sm text-indigo-100/80 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 mt-12 text-sm text-indigo-200">
            © 2026 有轻功. All rights reserved.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto w-full space-y-8"
              >
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">创建您的账号</h2>
                  <p className="text-slate-500 mt-3">请选择您在平台上的主要身份角色</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Enterprise Role */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole('ENTERPRISE')}
                    className={cn(
                      "cursor-pointer rounded-2xl border-2 p-6 transition-all relative overflow-hidden",
                      role === 'ENTERPRISE' 
                        ? "border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100" 
                        : "border-slate-100 hover:border-indigo-200 bg-white"
                    )}
                  >
                    {role === 'ENTERPRISE' && (
                      <div className="absolute top-4 right-4 text-indigo-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      role === 'ENTERPRISE' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">我是企业</h3>
                    <p className="text-sm text-slate-500">发布项目需求，寻找优质的专业人才与团队。</p>
                  </motion.div>

                  {/* Talent Role */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole('TALENT')}
                    className={cn(
                      "cursor-pointer rounded-2xl border-2 p-6 transition-all relative overflow-hidden",
                      role === 'TALENT' 
                        ? "border-purple-600 bg-purple-50/50 shadow-md shadow-purple-100" 
                        : "border-slate-100 hover:border-purple-200 bg-white"
                    )}
                  >
                    {role === 'TALENT' && (
                      <div className="absolute top-4 right-4 text-purple-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      role === 'TALENT' ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">我是人才</h3>
                    <p className="text-sm text-slate-500">接取匹配的项目，施展专业技能，获取报酬。</p>
                  </motion.div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-medium text-center">
                    {error}
                  </motion.p>
                )}

                <Button 
                  onClick={handleNext}
                  className="w-full h-12 text-base font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  下一步 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-center text-sm text-slate-500 mt-6">
                  已有账号？{' '}
                  <Link to="/auth" className="text-indigo-600 font-semibold hover:underline">
                    立即登录
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-md mx-auto w-full space-y-6"
              >
                <div className="flex flex-col items-start">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> 返回修改身份
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900">
                    完善{role === 'ENTERPRISE' ? '企业' : '个人'}信息
                  </h2>
                  <p className="text-slate-500 mt-2">只需几步即可开启您的旅程</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">手机号码</label>
                    <Input 
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="请输入11位手机号" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="h-11 rounded-xl bg-slate-50/50"
                      maxLength={11}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">验证码</label>
                    <div className="flex space-x-3">
                      <Input 
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="请输入验证码" 
                        value={formData.code}
                        onChange={e => setFormData({...formData, code: e.target.value})}
                        className="flex-1 h-11 rounded-xl bg-slate-50/50"
                        maxLength={6}
                      />
                      <Button type="button" variant="outline" className="h-11 px-6 rounded-xl shrink-0">
                        获取验证码
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">登录密码</label>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="至少 6 位，用于真实账号登录"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="h-11 rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">真实姓名 / 昵称</label>
                    <Input 
                      autoComplete="name"
                      placeholder={role === 'ENTERPRISE' ? '请输入联系人姓名' : '请输入您的姓名'}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="h-11 rounded-xl bg-slate-50/50"
                    />
                  </div>

                  {role === 'ENTERPRISE' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="text-sm font-medium text-slate-700">企业名称</label>
                      <Input 
                        autoComplete="organization"
                        placeholder="请输入完整企业名称"
                        value={formData.companyName}
                        onChange={e => setFormData({...formData, companyName: e.target.value})}
                        className="h-11 rounded-xl bg-slate-50/50"
                      />
                    </motion.div>
                  )}

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-medium pt-2">
                      {error}
                    </motion.p>
                  )}

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-12 text-base font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '立即注册'}
                    </Button>
                    <p className="text-xs text-slate-400 text-center mt-4">
                      注册即代表您同意平台的 <a href="#" className="text-indigo-500 hover:underline">用户协议</a> 和 <a href="#" className="text-indigo-500 hover:underline">隐私政策</a>
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
