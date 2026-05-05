import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowRight, Award, Briefcase, CheckCircle, Clock, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { getLandingData, getTalentMarketplaceData, getTaskMarketplaceData } from '../services/api';
import { asArray, stringOf } from '../services/workflowFormatters';

interface TalentCard {
  slug: string;
  name: string;
  title: string;
  rating: string;
  reviews: string;
  skills: string[];
  desc: string;
  price: string;
  avatarUrl: string;
}

interface CaseCard {
  id: string;
  title: string;
  enterprise: string;
  stats: Array<{ label: string; value: string; tone: 'indigo' | 'emerald' }>;
  roles: string[];
  desc: string;
  imageUrl: string;
}

const featureFallback = [
  {
    title: '风控与争议处理',
    desc: '完善的平台认证体系与交易风险提醒，异常情况一键介入，保障双方权益。',
    icon: <Shield className="w-6 h-6 text-indigo-600" />
  },
  {
    title: '全过程合作留痕',
    desc: '从任务沟通、面试邀约、确认合作到进度交付，每一环节自动留痕，清晰可溯。',
    icon: <Briefcase className="w-6 h-6 text-purple-600" />
  },
  {
    title: '财务状态全同步',
    desc: '打通请款、开票、对账、结算四大环节，企业审批与人才入账实时同步，告别烂尾账。',
    icon: <CheckCircle className="w-6 h-6 text-emerald-600" />
  }
];

const showcaseAvatarFallbacks = [
  'https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NjgzNzk1NHww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc2ODQ1NDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1633524418260-6cc5b2b1cd89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMGdsYXNzZXMlMjBkZXZlbG9wZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzY5Mjc0MTh8MA&ixlib=rb-4.1.0&q=80&w=1080'
];

const caseImageFallbacks = [
  'https://images.unsplash.com/photo-1642132652860-603f4e3c19b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWFzJTIwZGFzaGJvYXJkJTIwd2ViJTIwZGVzaWdufGVufDF8fHx8MTc3NjkyNzQyMXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1577333715735-8fcb0359d906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjB3ZWJzaXRlJTIwbW9ja3VwfGVufDF8fHx8MTc3NjkyNzQyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGRlc2lnbiUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzY5MzUyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080'
];

function buildTalentCards(data: any): TalentCard[] {
  return asArray<any>(data?.items || data?.talents).slice(0, 3).map((talent, index) => {
    const skills = asArray<string>(talent?.tags || talent?.services).map(String).slice(0, 3);
    return {
      slug: stringOf(talent?.slug, talent?.talentUserId, `talent-${index}`),
      name: stringOf(talent?.name, `人才 ${index + 1}`),
      title: stringOf(talent?.role, talent?.headline, '认证协作人才'),
      rating: stringOf(talent?.score, talent?.rating, '待评分'),
      reviews: stringOf(talent?.reviews, talent?.reviewCount, talent?.portfolio ? '有作品' : '资料完善中'),
      skills,
      desc: stringOf(talent?.summary, talent?.intro, talent?.portfolio, '该人才资料正在从服务端同步。'),
      price: stringOf(talent?.price, talent?.rate, talent?.responseTime, '可邀约'),
      avatarUrl: stringOf(
        talent?.avatarUrl,
        talent?.avatar,
        talent?.photoUrl,
        talent?.photo,
        talent?.imageUrl,
        showcaseAvatarFallbacks[index % showcaseAvatarFallbacks.length]
      )
    };
  });
}

function buildCaseCards(landing: any, taskData: any): CaseCard[] {
  const landingCases = asArray<any>(landing?.cases).slice(0, 2).map((item, index) => {
    const title = stringOf(item?.title, `合作案例 ${index + 1}`);
    const enterprise = stringOf(item?.enterprise, item?.company, '真实合作案例');
    const roles = asArray<string>(item?.roles || item?.tags).map(String).slice(0, 4);
    return {
      id: stringOf(item?.id, `case-${index}`),
      title,
      enterprise,
      stats: asArray<any>(item?.stats).slice(0, 2).map((stat, statIndex) => ({
        label: stringOf(stat?.label, statIndex === 0 ? '周期' : '结果'),
        value: stringOf(stat?.value, '--'),
        tone: statIndex === 0 ? 'indigo' as const : 'emerald' as const
      })),
      roles,
      desc: stringOf(item?.desc, item?.description, item?.summary),
      imageUrl: stringOf(
        item?.coverUrl,
        item?.image,
        item?.imageUrl,
        item?.thumbnail,
        caseImageFallbacks[index % caseImageFallbacks.length]
      )
    };
  });

  if (landingCases.length) {
    return landingCases;
  }

  return asArray<any>(taskData?.items || taskData?.tasks).slice(0, 2).map((task, index) => {
    const title = stringOf(task?.title, `真实任务 ${index + 1}`);
    const enterprise = stringOf(task?.company, '平台任务');
    const roles = asArray<string>(task?.tags || task?.deliverables).map(String).slice(0, 4);
    return {
    id: stringOf(task?.id, `task-${index}`),
    title,
    enterprise,
    stats: [
      { label: '预算', value: stringOf(task?.budget, '待确认'), tone: 'indigo' as const },
      { label: '周期', value: stringOf(task?.period, task?.deadline, '待确认'), tone: 'emerald' as const }
    ],
    roles,
    desc: stringOf(task?.summary, task?.description, '任务详情正在从服务端同步。'),
    imageUrl: stringOf(
      task?.coverUrl,
      task?.image,
      task?.imageUrl,
      task?.thumbnail,
      caseImageFallbacks[index % caseImageFallbacks.length]
    )
  }});
}

export function Home() {
  const [landing, setLanding] = useState<any>({});
  const [talentData, setTalentData] = useState<any>({});
  const [taskData, setTaskData] = useState<any>({});

  useEffect(() => {
    let alive = true;
    Promise.all([getLandingData(), getTalentMarketplaceData(), getTaskMarketplaceData()]).then(([landingRes, talentRes, taskRes]) => {
      if (!alive) return;
      if (!landingRes?.requestError) setLanding(landingRes);
      if (!talentRes?.requestError) setTalentData(talentRes);
      if (!taskRes?.requestError) setTaskData(taskRes);
    });
    return () => {
      alive = false;
    };
  }, []);

  const badges = asArray<string>(landing?.badges).map(String);
  const talentCards = buildTalentCards(talentData);
  const caseCards = buildCaseCards(landing, taskData);
  const featureCards = asArray<any>(landing?.pillars).slice(0, 3).map((item, index) => ({
    title: stringOf(item?.title, featureFallback[index]?.title),
    desc: stringOf(item?.description, item?.desc, featureFallback[index]?.desc),
    icon: featureFallback[index]?.icon || <CheckCircle className="w-6 h-6 text-emerald-600" />
  }));
  const features = featureCards.length ? featureCards : featureFallback;

  return (
    <div className="min-h-screen bg-white overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="fixed top-0 inset-x-0 box-border h-16 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">有轻功</span>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6">
          <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">登录</Link>
          <Link to="/register" data-home-register-link className="hidden sm:block">
            <Button size="sm" className="rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700">免费注册</Button>
          </Link>
        </div>
      </nav>

      <section data-home-hero className="box-border w-full max-w-full pt-32 pb-20 px-4 flex flex-col items-center text-center relative sm:max-w-5xl sm:mx-auto">
        <div className="absolute inset-0 -z-10 h-[600px] w-full bg-[radial-gradient(100%_100%_at_top_center,rgba(99,102,241,0.08),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          data-home-hero-fit
          className="inline-flex max-w-[calc(100vw-2rem)] items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8 border border-indigo-100/50"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          <span>{badges.length ? badges.join(' · ') : '全新企业雇佣协作结算闭环平台'}</span>
        </motion.div>

        <motion.h1
          data-home-hero-title
          data-home-hero-fit
          className="w-full min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-full text-3xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6 break-words [overflow-wrap:anywhere]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="block">不再为找外包发愁</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            <span className="block sm:inline">用有轻功，</span>
            <span className="block sm:inline">连接全球顶尖人才</span>
          </span>
        </motion.h1>

        <motion.p
          data-home-hero-fit
          className="w-full min-w-0 text-base sm:text-lg text-slate-500 max-w-[calc(100vw-2rem)] sm:max-w-2xl mx-auto mb-10 leading-relaxed break-words [overflow-wrap:anywhere]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          有轻功不仅是一个招聘平台，更是完整的协作、交付与财务管家。覆盖任务拆解、人才匹配、合同进度推进到一键请款对账结算。
        </motion.p>

        <motion.div
          data-home-hero-fit
          data-home-hero-actions
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-[calc(100vw-2rem)] sm:max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/register?role=enterprise" className="w-full sm:w-auto">
            <Button size="lg" className="w-full rounded-xl gap-2 bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 group">
              我是企业，发布任务
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/register?role=talent" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full rounded-xl gap-2 hover:bg-slate-50">
              我是人才，发现机会
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="w-full py-24 bg-slate-50 border-t border-slate-100 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-6 min-w-0">
          <div className="flex min-w-0 flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-indigo-600 font-semibold mb-3">
                <Award className="w-5 h-5" />
                <span>严选数字人才</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 break-words [overflow-wrap:anywhere]">连接前 1% 的顶尖自由职业者</h2>
              <p className="text-slate-500 max-w-2xl text-base sm:text-lg break-words [overflow-wrap:anywhere]">
                所有人才卡片均来自服务端人才广场，展示当前可被企业查看、邀请和继续沟通的真实人才资料。
              </p>
            </div>
            <Link to="/enterprise/talents" className="hidden md:flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              查看更多人才 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {talentCards.length ? (
            <div className="grid md:grid-cols-3 gap-8">
              {talentCards.map((talent, idx) => (
                <motion.div
                  key={talent.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <Card className="h-full border-none shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden">
                    <CardContent className="p-6 relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <ImageWithFallback
                              src={talent.avatarUrl}
                              alt={talent.name}
                              className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-slate-100"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">{talent.name}</h3>
                            <p className="text-sm font-medium text-indigo-600">{talent.title}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 mb-4 bg-amber-50 inline-flex px-2.5 py-1 rounded-md">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-amber-700">{talent.rating}</span>
                        <span className="text-sm text-amber-600/70 ml-1">({talent.reviews})</span>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2 h-10">
                        {talent.desc}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6 min-h-[28px]">
                        {talent.skills.length ? talent.skills.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                            {skill}
                          </span>
                        )) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs rounded-md font-medium">技能资料待补充</span>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-slate-900 font-bold">{talent.price}</span>
                        <Link to={`/enterprise/talents/${encodeURIComponent(talent.slug)}`}>
                          <Button variant="outline" size="sm" className="rounded-xl text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                            邀请合作
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-slate-200 bg-white">
              <CardContent className="p-8 text-center text-slate-500">服务端暂未返回可展示人才。</CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="w-full py-24 bg-white relative overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-6 min-w-0">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 break-words [overflow-wrap:anywhere]">见证成功业务落地</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg break-words [overflow-wrap:anywhere]">
              从灵感迸发到产品上线，有轻功平台助力企业完成高质量的敏捷协作与交付。
            </p>
          </div>

          {caseCards.length ? (
            <div className="grid md:grid-cols-2 gap-8">
              {caseCards.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="group rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 bg-white flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-white/80 text-sm font-medium mb-2">{item.enterprise}</p>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{item.title}</h3>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex gap-4 mb-6">
                      {item.stats.slice(0, 2).map((stat, sIdx) => (
                        <div key={`${stat.label}-${sIdx}`} className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                          <div className="flex items-center space-x-2 mb-1">
                            {stat.tone === 'emerald' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-indigo-500" />}
                            <span className="text-sm text-slate-500">{stat.label}</span>
                          </div>
                          <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    <p className="text-slate-600 leading-relaxed mb-6">
                      {item.desc}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400 font-medium">参与角色:</span>
                        <div className="flex flex-wrap gap-2">
                          {item.roles.length ? item.roles.map(role => (
                            <span key={role} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                              {role}
                            </span>
                          )) : (
                            <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs rounded-full font-medium">待补充</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-slate-200 bg-white">
              <CardContent className="p-8 text-center text-slate-500">服务端暂未返回可展示任务或案例。</CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="w-full py-24 bg-slate-50 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-6 min-w-0">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 break-words [overflow-wrap:anywhere]">重新定义企业雇佣</h2>
            <p className="text-slate-500 break-words [overflow-wrap:anywhere]">打破信息差，通过真实业务状态同步，建立 100% 互信的合作环境</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={`${feature.title}-${index}`} icon={feature.icon} title={feature.title} desc={feature.desc} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}
