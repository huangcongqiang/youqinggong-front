import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Star, Shield, MapPin, Briefcase, Award, Clock, ArrowLeft } from 'lucide-react';
import { getTalentDetailData } from '../services/api';
import { asArray, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

function normalizeTalent(raw: any) {
  return {
    slug: stringOf(raw?.slug),
    name: stringOf(raw?.name, '人才资料'),
    role: stringOf(raw?.role, raw?.headline, '专业服务者'),
    location: stringOf(raw?.location, '远程协作'),
    score: stringOf(raw?.score, raw?.rating, '待评分'),
    completionRate: stringOf(raw?.completionRate, raw?.fulfillmentRate, '待沉淀'),
    responseTime: stringOf(raw?.responseTime, '待同步'),
    intro: stringOf(raw?.intro, raw?.summary, '这位人才暂未补充个人简介。'),
    skills: asArray<string>(raw?.skills || raw?.headlineTags || raw?.specialties).map(String),
    services: asArray<string>(raw?.services).map(String),
    strengths: asArray<string>(raw?.strengths).map(String),
    portfolio: asArray<any>(raw?.portfolio),
    reviews: asArray<any>(raw?.reviews),
    availability: asArray<any>(raw?.availability),
    process: asArray<any>(raw?.process)
  };
}

export function TalentDetails() {
  const { slug = '' } = useParams();
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getTalentDetailData(slug).then((data: any) => {
      if (!alive) {
        return;
      }
      setTalent(data?.requestError ? null : normalizeTalent(data));
      setError(data?.requestError || '');
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-5xl p-8"><LoadingState text="正在读取真实人才资料..." /></div>;
  }

  if (!talent) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <Link to="/enterprise/talents" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="mr-1 h-4 w-4" /> 返回人才列表
        </Link>
        <ErrorState text={error} />
        <EmptyState title="人才资料不存在" text="当前人才详情接口没有返回可展示数据。" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <Link to="/enterprise/talents" className="mb-2 inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="mr-1 h-4 w-4" /> 返回人才列表
      </Link>

      <ErrorState text={error} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardContent className="p-8">
              <div className="flex gap-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-lime-50 text-3xl font-bold text-emerald-700 shadow-sm">
                  {talent.name.slice(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                        {talent.name}
                        <Shield className="h-5 w-5 text-emerald-500" />
                      </h1>
                      <p className="mt-1 text-lg font-medium text-emerald-700">{talent.role}</p>
                    </div>
                    <Button disabled className="bg-slate-200 text-slate-500 hover:bg-slate-200">从任务中邀约</Button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {talent.location}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {talent.completionRate} 履约率</span>
                    <span className="flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 font-medium text-amber-600">
                      <Star className="h-4 w-4 fill-amber-500" /> {talent.score}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="mb-3 text-lg font-bold text-slate-900">个人简介</h3>
                <p className="leading-relaxed text-slate-600">{talent.intro}</p>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="mb-3 text-lg font-bold text-slate-900">专业技能</h3>
                <div className="flex flex-wrap gap-2">
                  {(talent.skills.length ? talent.skills : talent.services).map((skill: string) => (
                    <span key={skill} className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {talent.strengths.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h3 className="mb-3 text-lg font-bold text-slate-900">优势信号</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {talent.strengths.map((item: string) => (
                      <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h3 className="mb-6 text-lg font-bold text-slate-900">过往作品集</h3>
              {talent.portfolio.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {talent.portfolio.map((item: any, index: number) => (
                    <div key={`${stringOf(item?.title, index)}`} className="group overflow-hidden rounded-xl border border-slate-200 transition-colors hover:border-emerald-300">
                      <div className="h-28 bg-gradient-to-br from-emerald-100 via-lime-50 to-white" />
                      <div className="bg-white p-4">
                        <h4 className="font-semibold text-slate-900">{stringOf(item?.title, `作品 ${index + 1}`)}</h4>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{stringOf(item?.desc, item?.summary, '作品说明待补充')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="作品集暂未开放" text="该人才还没有从后端返回作品数据。" />
              )}
            </CardContent>
          </Card>

          {talent.reviews.length > 0 && (
            <Card>
              <CardContent className="p-8">
                <h3 className="mb-6 text-lg font-bold text-slate-900">历史评价</h3>
                <div className="space-y-3">
                  {talent.reviews.map((item: any, index: number) => (
                    <div key={`${stringOf(item?.content, index)}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                      {stringOf(item?.content, item?.reviewContent, item?.summary, item)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-bold text-slate-900">基本信息</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">响应速度</p>
                  <p className="text-sm font-medium text-slate-900">{talent.responseTime}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">履约率</p>
                  <p className="text-sm font-medium text-emerald-600">{talent.completionRate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">平台评分</p>
                  <p className="text-lg font-semibold text-slate-900">{talent.score}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">档期</p>
                  <p className="text-sm font-medium text-slate-900">
                    {talent.availability.length ? talent.availability.map((item: any) => stringOf(item?.label, item?.title, item)).join(' / ') : '待同步'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">平台认证信誉</h4>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                    人才资料、评分、作品和档期都来自后端接口；企业需要从具体任务中发起邀约或确认合作。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {talent.process.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <Clock className="h-4 w-4 text-slate-400" />
                  合作方式
                </h3>
                <div className="space-y-3">
                  {talent.process.map((item: any, index: number) => (
                    <div key={`${stringOf(item?.title, index)}`} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {stringOf(item?.title, item?.label, item)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
