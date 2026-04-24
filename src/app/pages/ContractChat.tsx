import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AttachmentButton } from '../components/AttachmentButton';
import { useStore } from '../store';
import {
  Send, Paperclip, Image as ImageIcon, Smile, MoreVertical,
  Phone, Video, CheckCircle2, Clock
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { getTaskRoom, getTaskRooms, sendTaskRoomMessage, submitTaskConfirmation, uploadTaskAttachmentAsset } from '../services/api';
import { useSearchParams } from 'react-router';

interface ChatRoomListItem {
  roomKey: string;
  taskId: string;
  title: string;
  counterpartName: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: string;
  stage: string;
}

interface ChatMessageItem {
  id: string;
  author: string;
  text: string;
  time: string;
  type: string;
  attachments: Array<Record<string, any>>;
}

function stringOf(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const next = String(value).trim();
    if (next) return next;
  }
  return '';
}

function normalizeRoom(raw: any, index = 0): ChatRoomListItem {
  return {
    roomKey: stringOf(raw?.roomKey, raw?.room, raw?.providerRoomId, `room-${index}`),
    taskId: stringOf(raw?.taskId),
    title: stringOf(raw?.title, raw?.taskTitle, '任务沟通'),
    counterpartName: stringOf(raw?.counterpartName, raw?.name, '协作方'),
    lastMessage: stringOf(raw?.lastMessage, raw?.focus, '暂无消息'),
    lastTime: stringOf(raw?.lastTime, raw?.updatedAt, ''),
    unreadCount: stringOf(raw?.unreadCount, '0'),
    stage: stringOf(raw?.stage, raw?.status, '沟通中')
  };
}

function normalizeMessage(raw: any, index = 0): ChatMessageItem {
  return {
    id: stringOf(raw?.id, raw?.messageId, `message-${index}`),
    author: stringOf(raw?.author, raw?.senderName, '系统消息'),
    text: stringOf(raw?.text, raw?.content, raw?.summary),
    time: stringOf(raw?.time, raw?.createdAt, raw?.sentAt, ''),
    type: stringOf(raw?.type, raw?.messageType, 'text').toUpperCase(),
    attachments: Array.isArray(raw?.attachments) ? raw.attachments : []
  };
}

export function ContractChat() {
  const { currentUser } = useStore();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [activeRoomKey, setActiveRoomKey] = useState(searchParams.get('roomKey') || searchParams.get('room') || '');
  const [roomDetail, setRoomDetail] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConfirmingTask, setIsConfirmingTask] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const taskId = searchParams.get('taskId') || '';
  const userDisplayName = stringOf(currentUser?.raw?.displayName, currentUser?.name);

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      setIsLoading(true);
      setError('');
      const payload = await getTaskRooms();
      if (cancelled) return;
      if (payload.requestError) {
        setError(payload.requestError);
      }
      const normalizedRooms = Array.isArray(payload.items) ? payload.items.map(normalizeRoom) : [];
      setRooms(normalizedRooms);

      if (!activeRoomKey) {
        const matched = normalizedRooms.find((room) => taskId && room.taskId === taskId) || normalizedRooms[0];
        if (matched?.roomKey) {
          setActiveRoomKey(matched.roomKey);
        }
      }
      setIsLoading(false);
    }

    loadRooms();
    return () => {
      cancelled = true;
    };
  }, [activeRoomKey, taskId]);

  useEffect(() => {
    let cancelled = false;

    async function loadRoomDetail() {
      if (!activeRoomKey) {
        setRoomDetail(null);
        return;
      }

      setIsLoading(true);
      setError('');
      setNotice('');
      const payload = await getTaskRoom(activeRoomKey);
      if (cancelled) return;
      if (payload.requestError) {
        setError(payload.requestError);
      }
      setRoomDetail(payload);
      setIsLoading(false);
    }

    loadRoomDetail();
    return () => {
      cancelled = true;
    };
  }, [activeRoomKey]);

  const messages = useMemo(() => {
    const list = Array.isArray(roomDetail?.messages) ? roomDetail.messages : [];
    return list.map(normalizeMessage);
  }, [roomDetail]);

  const activeRoom = normalizeRoom(roomDetail || rooms.find((room) => room.roomKey === activeRoomKey) || {});
  const roomTaskConfirmation = roomDetail?.taskConfirmation || null;
  const currentAudience = currentUser?.role === 'TALENT' ? 'talent' : 'enterprise';
  const confirmationPendingForCurrentUser = stringOf(roomTaskConfirmation?.pendingAudience).toLowerCase() === currentAudience;
  const confirmationTaskId = stringOf(roomDetail?.taskId, activeRoom.taskId, taskId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && pendingFiles.length === 0) || !activeRoomKey) return;

    setIsSending(true);
    setError('');
    setNotice('');
    const uploadTaskId = taskId || activeRoom.taskId;
    const uploadedAttachments = [];
    if (pendingFiles.length > 0) {
      if (!uploadTaskId) {
        setError('缺少任务 ID，暂时无法上传附件。');
        setIsSending(false);
        return;
      }
      for (const file of pendingFiles) {
        const uploaded = await uploadTaskAttachmentAsset(uploadTaskId, file, {
          scene: 'CHAT_ATTACHMENT',
          source: 'CHAT_MESSAGE'
        });
        if ((uploaded as any).requestError) {
          setError((uploaded as any).requestError);
          setIsSending(false);
          return;
        }
        uploadedAttachments.push(uploaded);
      }
    }
    const response = await sendTaskRoomMessage(activeRoomKey, {
      type: uploadedAttachments.length && !message.trim() ? 'FILE' : 'TEXT',
      text: message.trim(),
      attachments: uploadedAttachments
    });
    if (response.requestError) {
      setError(response.requestError);
    } else {
      setRoomDetail(response);
      setMessage('');
      setPendingFiles([]);
    }
    setIsSending(false);
  };

  const handleConfirmTaskVersion = async () => {
    if (!confirmationTaskId) {
      setError('缺少任务 ID，暂时无法确认当前版本。');
      return;
    }

    setIsConfirmingTask(true);
    setError('');
    setNotice('');
    const response = await submitTaskConfirmation(confirmationTaskId, {
      action: 'confirm',
      note: '当前版本已确认进入执行阶段。'
    }) as any;

    setIsConfirmingTask(false);
    if (response?.requestError || response?.status === 'FAILED' || response?.status === 'BLOCKED') {
      setError(response?.requestError || response?.nextStep || '当前暂时无法确认任务版本。');
      return;
    }

    setNotice(response?.nextStep || '当前版本已确认，任务将进入执行阶段。');
    if (activeRoomKey) {
      const latest = await getTaskRoom(activeRoomKey);
      if (latest?.requestError) {
        setError(latest.requestError);
      } else {
        setRoomDetail(latest);
      }
    }
  };

  function isOwnMessage(msg: ChatMessageItem) {
    return Boolean(userDisplayName && msg.author === userDisplayName);
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <Card className="border-slate-200 shadow-md h-full flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-80 border-r border-slate-100 bg-slate-50/50 flex flex-col h-1/3 md:h-full shrink-0">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h2 className="text-lg font-semibold text-slate-800">消息与协作</h2>
            <div className="mt-3 hidden md:block">
              <Input
                placeholder="搜索联系人或任务..."
                className="bg-slate-50 border-transparent focus-visible:ring-indigo-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {rooms.map((room) => (
              <motion.div
                key={room.roomKey}
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveRoomKey(room.roomKey)}
                className={`p-3 rounded-xl cursor-pointer transition-colors flex items-start space-x-3 ${
                  room.roomKey === activeRoomKey ? 'bg-white shadow-sm ring-1 ring-slate-200/50' : 'hover:bg-slate-100/50'
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>{room.counterpartName[0] || '协'}</AvatarFallback>
                  </Avatar>
                  {Number(room.unreadCount) > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-sm font-semibold text-slate-800 truncate pr-2">{room.counterpartName}</h3>
                    <span className="text-xs text-slate-400 shrink-0">{room.lastTime}</span>
                  </div>
                  <p className="text-xs font-medium text-indigo-600 truncate mb-1">{room.title}</p>
                  <p className="text-xs text-slate-500 truncate hidden md:block">{room.lastMessage}</p>
                </div>
              </motion.div>
            ))}

            {rooms.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
                暂时没有真实消息房间。确认合作后，后端应创建 task room。
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col h-2/3 md:h-full bg-white relative">
          <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white z-10 shrink-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-slate-800">
                {activeRoom.counterpartName || '选择会话'}
              </h2>
              <Badge variant="outline" className="hidden md:flex bg-indigo-50 text-indigo-700 border-none">
                {activeRoom.stage}：{activeRoom.title}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hidden md:inline-flex">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hidden md:inline-flex">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          {notice && (
            <div className="mx-4 mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm text-emerald-700">
              {notice}
            </div>
          )}

          {isLoading && (
            <div className="mx-4 mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-500">
              正在同步真实消息...
            </div>
          )}

          {roomTaskConfirmation && (
            <div className="mx-4 mt-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-indigo-100 bg-indigo-50 text-indigo-700">
                      {stringOf(roomTaskConfirmation?.status, '任务确认中')}
                    </Badge>
                    <span className="text-xs text-slate-400">第 {stringOf(roomTaskConfirmation?.version, '1')} 版</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{stringOf(roomTaskConfirmation?.summary, activeRoom.title, '当前任务确认')}</p>
                  <div className="grid gap-1 text-xs text-slate-500 md:grid-cols-3">
                    <span>范围：{stringOf(roomTaskConfirmation?.scopeNote, '待补充')}</span>
                    <span>排期：{stringOf(roomTaskConfirmation?.period, '待确认')}</span>
                    <span>预算：{stringOf(roomTaskConfirmation?.budget, '待确认')}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {stringOf(roomTaskConfirmation?.changeReview?.summary, roomTaskConfirmation?.scheduleNote, '请先确认当前范围、排期与预算。')}
                  </p>
                </div>

                {confirmationPendingForCurrentUser && currentAudience === 'talent' && (
                  <Button
                    disabled={isConfirmingTask}
                    onClick={handleConfirmTaskVersion}
                    className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {isConfirmingTask ? '确认中...' : '确认进入执行'}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30">
            {messages.map((msg, idx) => {
              const own = isOwnMessage(msg);
              const system = msg.type === 'SYSTEM' || msg.author === '系统消息';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex flex-col ${own ? 'items-end' : 'items-start'} ${system ? 'items-center' : ''}`}
                >
                  {system ? (
                    <div className="bg-slate-100/80 text-slate-500 text-xs px-4 py-2 rounded-full flex items-center max-w-lg text-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`flex max-w-[85%] md:max-w-[70%] ${own ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="w-8 h-8 shrink-0 mt-1 hidden md:block">
                        {own ? <AvatarImage src={currentUser?.avatar} /> : null}
                        <AvatarFallback>{own ? '我' : msg.author[0] || 'Ta'}</AvatarFallback>
                      </Avatar>

                      <div className={`flex flex-col ${own ? 'md:mr-3 items-end' : 'md:ml-3 items-start'}`}>
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="text-xs font-medium text-slate-500 hidden md:block">
                            {own ? '我' : msg.author}
                          </span>
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>

                        {msg.text && (
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            own
                              ? 'bg-indigo-600 text-white rounded-tr-sm'
                              : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
                          }`}>
                            {msg.text}
                          </div>
                        )}

                        {msg.attachments.map((attachment, index) => (
                          <div key={`${msg.id}-attachment-${index}`} className="mt-2 w-[260px]">
                            <AttachmentButton file={attachment} compact />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {messages.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                这个房间还没有真实消息。
              </div>
            )}
          </div>

          <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={handleSendMessage} className="flex flex-col space-y-2 md:space-y-3">
              <div className="flex items-center space-x-1 text-slate-400">
                <label className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-indigo-50 hover:text-indigo-600">
                  <Paperclip className="w-4 h-4" />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    disabled={!activeRoomKey || isSending}
                    onChange={(event) => setPendingFiles((items) => [...items, ...Array.from(event.target.files || [])])}
                  />
                </label>
                <label className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-indigo-50 hover:text-indigo-600">
                  <ImageIcon className="w-4 h-4" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={!activeRoomKey || isSending}
                    onChange={(event) => setPendingFiles((items) => [...items, ...Array.from(event.target.files || [])])}
                  />
                </label>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-500 hover:bg-amber-50 hidden md:inline-flex">
                  <Smile className="w-4 h-4" />
                </Button>
              </div>

              {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pendingFiles.map((file) => (
                    <span key={`${file.name}-${file.size}`} className="inline-flex max-w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                      <span className="truncate">{file.name}</span>
                      <button type="button" className="text-slate-400 hover:text-rose-500" onClick={() => setPendingFiles((items) => items.filter((item) => item !== file))}>
                        移除
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-end space-x-2 md:space-x-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={activeRoomKey ? '输入消息，按 Enter 发送...' : '请先选择一个真实会话'}
                  disabled={!activeRoomKey || isSending}
                  className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border-transparent focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2 md:py-3 text-sm resize-none transition-all disabled:opacity-60"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={(!message.trim() && pendingFiles.length === 0) || !activeRoomKey || isSending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-4 md:px-6 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">{isSending ? '发送中' : '发送'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
