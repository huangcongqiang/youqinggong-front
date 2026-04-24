import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useStore } from '../store';
import { Lock, Phone, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export function Login() {
  const [method, setMethod] = useState<'password' | 'code'>('password');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
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
                    placeholder="请输入密码" 
                    className="pl-10 h-12 bg-slate-50 border-transparent focus:bg-white" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
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
            <a href="#" className="text-slate-500 hover:text-indigo-600 transition-colors">忘记密码？</a>
            <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700">去注册</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
