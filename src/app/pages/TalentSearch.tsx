import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Search, Star, MapPin, Clock, Briefcase, Filter, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { getTalentMarketplaceData } from '../services/api';
import { asArray, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { TalentInviteDialog, type TalentInviteProfile } from '../components/TalentInviteDialog';

type TalentCard = {
  slug: string;
  talentUserId: string;
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

type TalentPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

const TALENT_PAGE_SIZE = 8;

function normalizeTalent(item: any): TalentCard {
  return {
    slug: stringOf(item?.slug, item?.talentUserId, item?.platformUserId),
    talentUserId: stringOf(item?.talentUserId, item?.platformUserId, item?.userId),
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
  const [searchParams] = useSearchParams();
  const urlKeyword = searchParams.get('keyword') || '';
  const [searchTerm, setSearchTerm] = useState(urlKeyword);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [talents, setTalents] = useState<TalentCard[]>([]);
  const [filters, setFilters] = useState<string[]>(['为您推荐']);
  const [pagination, setPagination] = useState<TalentPagination>({
    page: 1,
    pageSize: TALENT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteTalent, setInviteTalent] = useState<TalentInviteProfile | null>(null);
  const keyword = searchTerm.trim();

  useEffect(() => {
    setSearchTerm(urlKeyword);
    setPage(1);
  }, [urlKeyword]);

  useEffect(() => {
    setPage(1);
  }, [keyword, activeFilter]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getTalentMarketplaceData({
      page,
      size: TALENT_PAGE_SIZE,
      keyword,
      filter: activeFilter === 'all' ? '' : activeFilter
    }).then((data: any) => {
      if (!alive) {
        return;
      }
      setTalents(asArray<any>(data?.items || data?.talents).map(normalizeTalent).filter((item) => item.slug));
      setFilters(['为您推荐', ...asArray<string>(data?.filters).map(String)]);
      const pageInfo = data?.pagination || {};
      setPagination({
        page: Number(pageInfo.page) || page,
        pageSize: Number(pageInfo.pageSize) || TALENT_PAGE_SIZE,
        total: Number(pageInfo.total) || 0,
        totalPages: Number(pageInfo.totalPages) || 0,
        hasPrevious: Boolean(pageInfo.hasPrevious),
        hasNext: Boolean(pageInfo.hasNext)
      });
      setError(data?.requestError || '');
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [activeFilter, keyword, page]);

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

      <div className="flex flex-wrap gap-2 pb-2">
        {filters.map((filter) => {
          const key = filter === '为您推荐' ? 'all' : filter;
          const active = activeFilter === key;
          return (
            <Badge
              key={key}
              variant={active ? 'default' : 'outline'}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm ${
                active ? 'border-transparent bg-indigo-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
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
      ) : talents.length === 0 ? (
        <EmptyState title="暂无可展示人才" text={keyword || activeFilter !== 'all' ? '当前搜索或筛选条件没有匹配的人才。' : '人才广场接口暂时没有返回数据。'} />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {talents.map((talent, index) => (
              <motion.div
                key={talent.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative overflow-hidden border-none bg-white shadow-md transition-all duration-300 hover:shadow-xl">
                  {Number(talent.rating) >= 4.8 && (
                    <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      高评分
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-50 text-xl font-bold text-indigo-700 shadow-sm ring-2 ring-slate-100/50">
                        {talent.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-indigo-700">
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
                          <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 font-semibold text-indigo-600">
                            匹配度 {talent.matchScore}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <Link to={`/enterprise/talents/${talent.slug}`}>
                          <Button variant="ghost" className="rounded-lg px-4 font-semibold text-indigo-700 hover:bg-indigo-50">
                            查看主页
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-lg border-indigo-100 bg-indigo-50 px-5 font-semibold text-indigo-700 hover:border-indigo-200 hover:bg-indigo-100"
                          onClick={() => setInviteTalent(talent)}
                        >
                          选择任务邀约
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {pagination.total > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row">
              <p className="text-sm text-slate-500">
                共 <span className="font-semibold text-slate-900">{pagination.total}</span> 位人才
                <span className="mx-2 text-slate-300">/</span>
                第 <span className="font-semibold text-slate-900">{pagination.page}</span> 页，共 {pagination.totalPages || 1} 页
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-slate-200"
                  disabled={!pagination.hasPrevious}
                  onClick={() => setPage(Math.max(1, pagination.page - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> 上一页
                </Button>
                <div className="min-w-16 rounded-lg bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-slate-700">
                  {pagination.page}/{pagination.totalPages || 1}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg border-slate-200"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage(pagination.page + 1)}
                >
                  下一页 <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <TalentInviteDialog
        open={Boolean(inviteTalent)}
        talent={inviteTalent}
        onClose={() => setInviteTalent(null)}
      />
    </div>
  );
}
