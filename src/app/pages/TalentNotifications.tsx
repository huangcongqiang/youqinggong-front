import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, Briefcase, CheckCircle, FileText, ArrowRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router';
import { getTalentData } from '../services/api';
import { asArray, stringOf } from '../services/workflowFormatters';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';

function buildTalentNotificationLink(item: any) {
  const taskId = stringOf(item?.taskId, item?.recordId);
  const roomKey = stringOf(item?.roomKey, item?.room);
  const source = stringOf(item?.source, item?.groupKey, 'records').toLowerCase();
  const query = new URLSearchParams();
  if (taskId) query.set('taskId', taskId);
  if (roomKey) query.set('roomKey', roomKey);
  const suffix = query.toString() ? `?${query.toString()}` : '';

  if (!taskId && !roomKey) {
    return '/talent';
  }
  if (source === 'matching') {
    return `/talent/tasks${suffix}`;
  }
  if (source === 'records') {
    return `/talent/records/${encodeURIComponent(taskId)}${suffix}`;
  }
  if (/review|acceptance/.test(source)) {
    return `/talent/acceptance${suffix}`;
  }
  if (/workspace|contract/.test(source)) {
    return `/talent/workspace${suffix}`;
  }
  if (/message|followup/.test(source) || roomKey) {
    return `/talent/chat${suffix}`;
  }
  return `/talent/workspace${suffix}`;
}

function normalizeNote(item: any, index = 0) {
  const source = stringOf(item?.source, item?.groupKey, 'records');
  return {
    id: stringOf(item?.id, item?.key, `${source}-${stringOf(item?.taskId, item?.recordId)}-${index}`),
    type: stringOf(item?.groupKey, source),
    title: stringOf(item?.title, `通知 ${index + 1}`),
    desc: stringOf(item?.summary, item?.note, item?.description, '有一条事项需要处理。'),
    time: stringOf(item?.updatedAt, item?.time, '待同步'),
    status: stringOf(item?.status, '未读'),
    read: /已完成|已处理|已读|DONE|COMPLETED/i.test(stringOf(item?.status)),
    link: buildTalentNotificationLink(item)
  };
}

function getIcon(type: string) {
  if (/matching|interview|message/i.test(type)) return <MessageSquare className="h-5 w-5 text-emerald-600" />;
  if (/offer|workspace|tasks/i.test(type)) return <Briefcase className="h-5 w-5 text-emerald-600" />;
  if (/review|acceptance|record/i.test(type)) return <CheckCircle className="h-5 w-5 text-blue-500" />;
  return <FileText className="h-5 w-5 text-slate-500" />;
}

export function TalentNotifications() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [headline, setHeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getTalentData().then((data: any) => {
      if (!alive) return;
      setNotifications(asArray<any>(data?.notificationItems || data?.attentionItems || data?.taskPool).map(normalizeNote));
      setHeadline(stringOf(data?.attentionHeadline));
      setError(data?.requestError || '');
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const unreadCount = notifications.filter((note) => !note.read).length;
  const filtered = useMemo(() => notifications.filter((note) => activeFilter === 'all' || note.read === (activeFilter === 'read')), [activeFilter, notifications]);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            通知中心
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{unreadCount} 未处理</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">{headline || '面试、合作、验收与系统消息。'}</p>
        </div>
        <Button variant="outline" className="gap-2 border-slate-200 text-slate-500 hover:text-emerald-700">
          <CheckCircle className="h-4 w-4" /> 真实状态随业务流更新
        </Button>
      </div>

      <ErrorState text={error} />

      <div className="mb-6 flex gap-4">
        {[
          { id: 'all', label: '全部' },
          { id: 'unread', label: `待处理 (${unreadCount})` },
          { id: 'read', label: '已处理' }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter.id ? 'bg-emerald-700 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState text="正在同步真实通知..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="暂无相关通知" text={notifications.length ? '当前筛选下没有通知。' : '后端暂时没有返回通知事项。'} />
      ) : (
        <div className="space-y-4">
          {filtered.map((note) => (
            <Card key={note.id} className={`border transition-all ${note.read ? 'border-transparent bg-slate-50/50' : 'border-emerald-100 bg-white shadow-sm hover:border-emerald-300'}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">{getIcon(note.type)}</div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-start justify-between">
                      <h3 className={`text-sm font-bold ${note.read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {note.title}
                        {!note.read && <span className="relative -top-0.5 ml-2 inline-block h-2 w-2 rounded-full bg-emerald-600" />}
                      </h3>
                      <span className="whitespace-nowrap text-xs text-slate-400">{note.time}</span>
                    </div>
                    <p className={`mb-3 text-sm leading-relaxed ${note.read ? 'text-slate-500' : 'text-slate-600'}`}>{note.desc}</p>
                    <Link to={note.link} className={`inline-flex items-center text-xs font-medium ${note.read ? 'text-slate-500 hover:text-emerald-700' : 'text-emerald-700 hover:text-emerald-800'}`}>
                      查看详情 <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
