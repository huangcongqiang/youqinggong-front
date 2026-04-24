import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Search, Star, MapPin, Clock, Briefcase, Filter, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { getTalentMarketplaceData } from '../services/api';
import { asArray, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

type TalentCard = {
  slug: string;
  name: string;
  role: string;
  rating: string;
  location: string;
  responseTime: string;
  skills: string[];
  summary: string;
  matchScore: string;
  portfolio: string;
};

function normalizeTalent(item: any): TalentCard {
  return {
    slug: stringOf(item?.slug, item?.talentUserId, item?.platformUserId),
    name: stringOf(item?.name, '人才资料'),
    role: stringOf(item?.role, item?.headline, '专业服务者'),
    rating: stringOf(item?.score, item?.rating, '待评分'),
    location: stringOf(item?.location, '远程协作'),
    responseTime: stringOf(item?.responseTime, '待同步'),
    skills: asArray<string>(item?.tags || item?.skills || item?.services).map(String).filter(Boolean),
    summary: stringOf(item?.summary, item?.intro, '这位人才暂未补充简介。'),
    matchScore: stringOf(item?.matchScore, item?.match, ''),
    portfolio: stringOf(item?.portfolio, '')
  };
}

export function TalentSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [talents, setTalents] = useState<TalentCard[]>([]);
  const [filters, setFilters] = useState<string[]>(['为您推荐']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getTalentMarketplaceData().then((data: any) => {
      if (!alive) {
        return;
      }
      setTalents(asArray<any>(data?.items || data?.talents).map(normalizeTalent).filter((item) => item.slug));
      setFilters(['为您推荐', ...asArray<string>(data?.filters).map(String)]);
      setError(data?.requestError || '');
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const displayTalents = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return talents.filter((talent) => {
      const text = [talent.name, talent.role, talent.summary, talent.portfolio, ...talent.skills].join(' ').toLowerCase();
      const matchedKeyword = !keyword || text.includes(keyword);
      const matchedFilter = activeFilter === 'all' || activeFilter === '为您推荐' || talent.skills.some((skill) => skill.includes(activeFilter));
      return matchedKeyword && matchedFilter;
    });
  }, [activeFilter, searchTerm, talents]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">寻找真实人才</h1>
          <p className="mt-2 text-slate-500">从 Spring 后端人才广场读取专长、作品、评分和档期。</p>
        </div>

        <div className="flex w-full gap-3 md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="搜索技能、角色、姓名..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-12 w-full rounded-xl border-slate-200 bg-white pl-11 shadow-sm"
            />
          </div>
          <Button variant="outline" className="h-12 gap-2 rounded-xl border-slate-200 px-6 shadow-sm">
            <Filter className="h-4 w-4" /> 筛选
          </Button>
        </div>
      </div>

      <ErrorState text={error} />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => {
          const key = filter === '为您推荐' ? 'all' : filter;
          const active = activeFilter === key;
          return (
            <Badge
              key={key}
              variant={active ? 'default' : 'outline'}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm ${
                active ? 'border-transparent bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setActiveFilter(key)}
            >
              {filter}
            </Badge>
          );
        })}
      </div>

      {loading ? (
        <LoadingState text="正在同步真实人才列表..." />
      ) : displayTalents.length === 0 ? (
        <EmptyState title="暂无可展示人才" text={talents.length ? '当前筛选条件没有匹配的人才。' : '人才广场接口暂时没有返回数据。'} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {displayTalents.map((talent, index) => (
            <motion.div
              key={talent.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group relative overflow-hidden border-none bg-white shadow-md transition-all duration-300 hover:shadow-xl">
                {Number(talent.rating) >= 4.8 && (
                  <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-amber-400 to-amber-500 px-12 py-1 text-xs font-bold text-white shadow-sm">
                    高评分
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-lime-50 text-xl font-bold text-emerald-700 shadow-sm ring-2 ring-slate-100/50">
                      {talent.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
                            {talent.name}
                            <CheckCircle2 className="h-4 w-4 fill-blue-50 text-blue-500" />
                          </h3>
                          <p className="mt-1 text-sm font-medium text-slate-500">{talent.role}</p>
                        </div>
                        <div className="flex items-center rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700">
                          <Star className="mr-1 h-4 w-4 fill-amber-500 text-amber-500" /> {talent.rating}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="flex items-center"><MapPin className="mr-1 h-3.5 w-3.5 text-slate-400" /> {talent.location}</span>
                        <span className="flex items-center"><Clock className="mr-1 h-3.5 w-3.5 text-slate-400" /> 响应: {talent.responseTime}</span>
                        <span className="flex items-center"><Briefcase className="mr-1 h-3.5 w-3.5 text-slate-400" /> {talent.portfolio || '作品待补充'}</span>
                      </div>

                      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-sm leading-relaxed text-slate-600">
                        {talent.summary}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {talent.skills.map((skill) => (
                          <span key={skill} className="rounded-md border border-slate-200/60 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                    <div className="flex items-center space-x-2 text-sm">
                      {talent.matchScore && (
                        <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 font-semibold text-emerald-600">
                          匹配度 {talent.matchScore}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <Link to={`/enterprise/talents/${talent.slug}`}>
                        <Button variant="ghost" className="rounded-lg px-4 font-semibold text-emerald-700 hover:bg-emerald-50">
                          查看主页
                        </Button>
                      </Link>
                      <Button variant="outline" className="rounded-lg border-slate-200 px-5 text-slate-500" disabled>
                        先选任务再邀约
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
