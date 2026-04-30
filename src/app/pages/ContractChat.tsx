import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AttachmentButton } from '../components/AttachmentButton';
import { useStore } from '../store';
import { BusinessRealtimeEvent, openBusinessEventStream } from '../services/realtime';
import {
  Send, Paperclip, Image as ImageIcon, Smile, MoreVertical, X,
  Phone, Video, CheckCircle2, Clock
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { getTaskRoom, getTaskRooms, sendTaskRoomMessage, submitTaskConfirmation, uploadTaskAttachmentAsset } from '../services/api';
import { useTaskImRoom } from '../services/useTaskImRoom';
import type { TaskImIncomingMessage } from '../services/tencentImClient';
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
  isOwn?: boolean;
}

type TaskActionMode = 'update' | 'request_changes' | 'withdraw_update' | '';

interface TaskActionForm {
  note: string;
  summary: string;
  scopeNote: string;
  period: string;
  scheduleNote: string;
  budget: string;
}

function stringOf(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const next = String(value).trim();
    if (next) return next;
  }
  return '';
}

function imageSrcOf(value: unknown) {
  const src = stringOf(value);
  if (!src || /^(undefined|null)$/i.test(src)) return '';
  return /^(https?:\/\/|data:image\/|blob:|\/)/i.test(src) ? src : '';
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

function normalizeMessage(raw: any, index = 0, currentUserId = ''): ChatMessageItem {
  const senderUserId = stringOf(raw?.senderUserId, raw?.senderId, raw?.userId);
  return {
    id: stringOf(raw?.providerMessageId, raw?.id, raw?.messageId, `message-${index}`),
    author: stringOf(raw?.author, raw?.senderName, '系统消息'),
    text: stringOf(raw?.text, raw?.content, raw?.summary),
    time: stringOf(raw?.time, raw?.createdAt, raw?.sentAt, ''),
    type: stringOf(raw?.type, raw?.messageType, 'text').toUpperCase(),
    attachments: Array.isArray(raw?.attachments) ? raw.attachments : [],
    isOwn: Boolean(raw?.isOwn) || Boolean(currentUserId && senderUserId === currentUserId)
  };
}

function normalizeImMessage(raw: TaskImIncomingMessage, index = 0, currentUserName = ''): ChatMessageItem {
  const own = raw.senderAccount && raw.senderAccount.startsWith('u_') && raw.author === raw.senderAccount ? false : raw.author === currentUserName;
  return {
    id: stringOf(raw.providerMessageId, `im-message-${index}`),
    author: raw.flow === 'out' ? stringOf(currentUserName, '我') : stringOf(raw.author, raw.senderAccount, '协作方'),
    text: stringOf(raw.text),
    time: stringOf(raw.createdAt),
    type: raw.attachments.length > 0 && !raw.text ? 'FILE' : 'TEXT',
    attachments: raw.attachments,
    isOwn: Boolean(raw.isOwn) || raw.flow === 'out' || own
  };
}

function mergeMessages(businessMessages: ChatMessageItem[], imMessages: ChatMessageItem[]) {
  const seen = new Set<string>();
  const result: ChatMessageItem[] = [];
  [...businessMessages, ...imMessages].forEach((message) => {
    const key = stringOf(message.id, message.text, message.time);
    if (key && seen.has(key)) return;
    if (key) seen.add(key);
    result.push(message);
  });
  return result;
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
  const [isSubmittingTaskAction, setIsSubmittingTaskAction] = useState(false);
  const [taskActionMode, setTaskActionMode] = useState<TaskActionMode>('');
  const [taskActionForm, setTaskActionForm] = useState<TaskActionForm>({
    note: '',
    summary: '',
    scopeNote: '',
    period: '',
    scheduleNote: '',
    budget: ''
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const taskId = searchParams.get('taskId') || '';
  const currentUserId = stringOf(currentUser?.id, currentUser?.raw?.id);
  const userDisplayName = stringOf(currentUser?.raw?.displayName, currentUser?.name);
  const taskImRoom = useTaskImRoom(activeRoomKey);

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
    const businessMessages = list.map((item, index) => normalizeMessage(item, index, currentUserId));
    const imMessages = taskImRoom.messages.map((item, index) => normalizeImMessage(item, index, userDisplayName));
    return mergeMessages(businessMessages, imMessages);
  }, [currentUserId, roomDetail, taskImRoom.messages, userDisplayName]);

  const activeRoom = normalizeRoom(roomDetail || rooms.find((room) => room.roomKey === activeRoomKey) || {});
  const roomTaskConfirmation = roomDetail?.taskConfirmation || null;
  const currentAudience = currentUser?.role === 'TALENT' ? 'talent' : 'enterprise';
  const confirmationStatus = stringOf(roomTaskConfirmation?.status, '任务确认中');
  const confirmationPendingAudience = stringOf(roomTaskConfirmation?.pendingAudience).toLowerCase();
  const confirmationVersion = Number(roomTaskConfirmation?.version || 1);
  const confirmationPendingForCurrentUser = confirmationPendingAudience === currentAudience;
  const enterpriseWaitingTalentConfirm =
    currentAudience === 'enterprise' &&
    confirmationPendingAudience === 'talent' &&
    confirmationStatus === '待人才确认';
  const canEnterpriseOpenUpdate =
    currentAudience === 'enterprise' && (confirmationPendingAudience !== 'none' || confirmationStatus === '已确认');
  const canWithdrawTaskChange = enterpriseWaitingTalentConfirm && confirmationVersion > 1;
  const confirmationTaskId = stringOf(roomDetail?.taskId, activeRoom.taskId, taskId);
  const isTaskConfirmationPending = Boolean(
    confirmationPendingAudience && confirmationPendingAudience !== 'none'
  ) || ['待人才确认', '待企业修改'].includes(confirmationStatus);
  const displayStage = isTaskConfirmationPending ? confirmationStatus : activeRoom.stage;
  const activeTaskId = stringOf(roomDetail?.taskId, activeRoom.taskId, taskId);

  const taskActionTitle =
    taskActionMode === 'request_changes'
      ? '提出任务修改'
      : taskActionMode === 'withdraw_update'
        ? '撤回本次变更'
        : confirmationStatus === '已确认'
          ? '发起任务变更（范围 / 工期 / 金额）'
          : '补充信息或修改范围 / 工期后重新发送';
  const taskActionPrimaryLabel =
    taskActionMode === 'request_changes'
      ? '提交修改意见'
      : taskActionMode === 'withdraw_update'
        ? '确认撤回'
        : confirmationStatus === '已确认'
          ? '提交变更并重新发送'
          : '提交补充并重新发送';

  const refreshActiveRoom = useCallback(async (options?: { silent?: boolean }) => {
    if (!activeRoomKey) return;
    const latest = await getTaskRoom(activeRoomKey);
    if (latest?.requestError) {
      if (!options?.silent) {
        setError(latest.requestError);
      }
    } else {
      setRoomDetail(latest);
    }
  }, [activeRoomKey]);

  useEffect(() => {
    if (!activeRoomKey) return;

    let cancelled = false;
    const refreshVisibleRoom = () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      void refreshActiveRoom({ silent: true });
    };
    const timer = window.setInterval(refreshVisibleRoom, 6000);
    document.addEventListener('visibilitychange', refreshVisibleRoom);
    window.addEventListener('focus', refreshVisibleRoom);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshVisibleRoom);
      window.removeEventListener('focus', refreshVisibleRoom);
    };
  }, [activeRoomKey, refreshActiveRoom]);

  useEffect(() => {
    if (!currentUser) return;

    const refreshRoomsSilently = async () => {
      const payload = await getTaskRooms();
      if (!payload.requestError && Array.isArray(payload.items)) {
        setRooms(payload.items.map(normalizeRoom));
      }
    };

    const handleRealtimeEvent = (event: BusinessRealtimeEvent) => {
      const eventType = stringOf(event.type).toLowerCase();
      const eventScope = stringOf(event.scope).toLowerCase();
      const eventRoomKey = stringOf(event.roomKey);
      const eventTaskId = stringOf(event.taskId);
      const isMessageScope = eventScope === 'messages' || eventType.includes('message') || eventType.includes('confirmation');
      if (!isMessageScope) return;

      void refreshRoomsSilently();
      const matchesActiveRoom =
        (eventRoomKey && eventRoomKey === activeRoomKey) ||
        (eventTaskId && eventTaskId === activeTaskId);
      if (matchesActiveRoom) {
        void refreshActiveRoom({ silent: true });
      }
    };

    return openBusinessEventStream(handleRealtimeEvent);
  }, [activeRoomKey, activeTaskId, currentUser, refreshActiveRoom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && pendingFiles.length === 0) || !activeRoomKey) return;

    setIsSending(true);
    setError('');
    setNotice('');
    const uploadTaskId = taskId || activeRoom.taskId;

    const sendViaLegacyChannel = async () => {
      const uploadedAttachments = [];
      if (pendingFiles.length > 0) {
        if (!uploadTaskId) {
          throw new Error('缺少任务 ID，暂时无法上传附件。');
        }
        for (const file of pendingFiles) {
          const uploaded = await uploadTaskAttachmentAsset(uploadTaskId, file, {
            scene: 'CHAT_ATTACHMENT',
            source: 'CHAT_MESSAGE'
          });
          if ((uploaded as any).requestError) {
            throw new Error((uploaded as any).requestError);
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
        throw new Error(response.requestError);
      }
      setRoomDetail(response);
    };

    try {
      if (taskImRoom.status === 'ready') {
        let sentByIm = false;
        if (message.trim()) {
          await taskImRoom.sendText(message.trim());
          sentByIm = true;
        }
        if (pendingFiles.length > 0 && !uploadTaskId) {
          throw new Error('缺少任务 ID，暂时无法上传附件。');
        }
        for (const file of pendingFiles) {
          // Native Lite Chat image upload currently has no production upload endpoint,
          // so images use the same platform-backed attachment path as other files.
          const uploaded = await uploadTaskAttachmentAsset(uploadTaskId, file, {
            scene: 'CHAT_ATTACHMENT',
            source: 'CHAT_MESSAGE'
          });
          if ((uploaded as any).requestError) {
            throw new Error((uploaded as any).requestError);
          }
          await taskImRoom.sendBusinessFile({
            kind: 'YQG_TASK_FILE',
            taskId: uploadTaskId,
            roomKey: activeRoomKey,
            assetId: stringOf((uploaded as any).id, (uploaded as any).uploadId, (uploaded as any).objectKey),
            uploadId: stringOf((uploaded as any).uploadId),
            objectKey: stringOf((uploaded as any).objectKey),
            fileName: stringOf((uploaded as any).name, file.name),
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream',
            downloadUrl: stringOf((uploaded as any).downloadUrl, (uploaded as any).url),
            uploadedAt: new Date().toISOString()
          });
          sentByIm = true;
        }
        if (sentByIm) {
          void refreshActiveRoom({ silent: true });
        }
      } else if (taskImRoom.isDegraded) {
        await sendViaLegacyChannel();
        setNotice('腾讯 IM 暂不可用，已使用备用消息通道。');
      } else {
        throw new Error('腾讯 IM 正在连接，请稍候再发送。');
      }
      setMessage('');
      setPendingFiles([]);
    } catch (exception) {
      if (taskImRoom.status !== 'ready') {
        setError(exception instanceof Error ? exception.message : '当前暂时无法发送消息。');
      } else {
        setError(exception instanceof Error ? exception.message : '腾讯 IM 消息发送失败。');
      }
    } finally {
      setIsSending(false);
    }
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
      await refreshActiveRoom();
    }
  };

  const openTaskAction = (mode: TaskActionMode) => {
    if (!roomTaskConfirmation) return;
    setTaskActionMode(mode);
    setError('');
    setNotice('');
    setTaskActionForm({
      note: stringOf(roomTaskConfirmation?.changeRequest),
      summary: stringOf(roomTaskConfirmation?.summary, activeRoom.title),
      scopeNote: stringOf(roomTaskConfirmation?.scopeNote),
      period: stringOf(roomTaskConfirmation?.period),
      scheduleNote: stringOf(roomTaskConfirmation?.scheduleNote),
      budget: stringOf(roomTaskConfirmation?.budget)
    });
  };

  const closeTaskAction = () => {
    setTaskActionMode('');
    setTaskActionForm({
      note: '',
      summary: '',
      scopeNote: '',
      period: '',
      scheduleNote: '',
      budget: ''
    });
  };

  const submitTaskAction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!taskActionMode || !confirmationTaskId) {
      setError('缺少任务 ID，暂时无法提交任务确认动作。');
      return;
    }

    setIsSubmittingTaskAction(true);
    setError('');
    setNotice('');
    const response = await submitTaskConfirmation(confirmationTaskId, {
      action: taskActionMode,
      note: taskActionForm.note,
      summary: taskActionForm.summary,
      scopeNote: taskActionForm.scopeNote,
      period: taskActionForm.period,
      scheduleNote: taskActionForm.scheduleNote,
      budget: taskActionForm.budget
    }) as any;
    setIsSubmittingTaskAction(false);

    if (response?.requestError || response?.status === 'FAILED' || response?.status === 'BLOCKED' || response?.actionBlocked) {
      setError(response?.requestError || response?.actionMessage || response?.nextStep || '当前暂时无法更新任务确认单。');
      return;
    }

    setNotice(response?.nextStep || '任务确认单已更新。');
    closeTaskAction();
    await refreshActiveRoom();
  };

  function isOwnMessage(msg: ChatMessageItem) {
    return Boolean(msg.isOwn || (userDisplayName && msg.author === userDisplayName));
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
                {displayStage}：{activeRoom.title}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                disabled
                title="CALL_NOT_ENABLED"
                aria-label="语音通话暂未启用"
                className="text-slate-300 hidden md:inline-flex"
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled
                title="CALL_NOT_ENABLED"
                aria-label="视频通话暂未启用"
                className="text-slate-300 hidden md:inline-flex"
              >
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

          {taskImRoom.isDegraded && activeRoomKey && (
            <div className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
              腾讯 IM 暂不可用，已使用备用消息通道。
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
                      {confirmationStatus}
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

                <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                  {confirmationPendingForCurrentUser && currentAudience === 'talent' && (
                    <>
                      <Button
                        disabled={isConfirmingTask}
                        onClick={handleConfirmTaskVersion}
                        className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        {isConfirmingTask ? '确认中...' : '确认进入执行'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmittingTaskAction}
                        onClick={() => openTaskAction('request_changes')}
                        className="rounded-xl border-slate-200 bg-white"
                      >
                        提出修改
                      </Button>
                    </>
                  )}
                  {canEnterpriseOpenUpdate && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmittingTaskAction}
                      onClick={() => openTaskAction('update')}
                      className="rounded-xl border-slate-200 bg-white"
                    >
                      {confirmationStatus === '已确认' ? '发起任务变更' : '补充信息 / 修改任务'}
                    </Button>
                  )}
                  {canWithdrawTaskChange && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmittingTaskAction}
                      onClick={() => openTaskAction('withdraw_update')}
                      className="rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    >
                      撤回本次变更
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {taskActionMode && roomTaskConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8" onClick={closeTaskAction}>
              <form
                onSubmit={submitTaskAction}
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">任务确认</h2>
                    <p className="mt-1 text-sm text-slate-500">{taskActionTitle}</p>
                  </div>
                  <button type="button" className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100" onClick={closeTaskAction}>
                    关闭
                  </button>
                </div>

                <div className="space-y-4 px-6 py-5">
                  <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <span className="text-xs text-slate-400">当前状态</span>
                      <p className="font-semibold text-slate-800">{confirmationStatus} · 第 {confirmationVersion} 版</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">当前金额</span>
                      <p className="font-semibold text-slate-800">{stringOf(roomTaskConfirmation?.budget, '待确认')}</p>
                    </div>
                  </div>

                  {taskActionMode === 'withdraw_update' ? (
                    <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      撤回后将恢复上一版已确认的范围、工期和金额，人才端不会继续看到当前待确认变更。
                    </p>
                  ) : null}

                  {taskActionMode === 'update' && (
                    <>
                      <label className="block text-sm font-semibold text-slate-700">
                        任务摘要
                        <textarea
                          value={taskActionForm.summary}
                          onChange={(event) => setTaskActionForm((value) => ({ ...value, summary: event.target.value }))}
                          rows={3}
                          className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                          placeholder="例如：第一阶段先确认任务发布、人才接单、聊天协作和验收结算主链路。"
                        />
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          任务金额
                          <input
                            value={taskActionForm.budget}
                            onChange={(event) => setTaskActionForm((value) => ({ ...value, budget: event.target.value }))}
                            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            placeholder="例如：26000 或 ￥26000"
                          />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                          预计工期
                          <input
                            value={taskActionForm.period}
                            onChange={(event) => setTaskActionForm((value) => ({ ...value, period: event.target.value }))}
                            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            placeholder="例如：6 个 AI 协同工作日"
                          />
                        </label>
                      </div>
                      <label className="block text-sm font-semibold text-slate-700">
                        范围说明
                        <textarea
                          value={taskActionForm.scopeNote}
                          onChange={(event) => setTaskActionForm((value) => ({ ...value, scopeNote: event.target.value }))}
                          rows={3}
                          className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                          placeholder="例如：首版只覆盖发布、接单、消息确认、协作验收和结算。"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-slate-700">
                        协作安排说明
                        <textarea
                          value={taskActionForm.scheduleNote}
                          onChange={(event) => setTaskActionForm((value) => ({ ...value, scheduleNote: event.target.value }))}
                          rows={3}
                          className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                          placeholder="例如：先确认新版金额与工期，再提交交付物并进入验收。"
                        />
                      </label>
                    </>
                  )}

                  <label className="block text-sm font-semibold text-slate-700">
                    {taskActionMode === 'request_changes' ? '修改意见' : '附加说明'}
                    <textarea
                      value={taskActionForm.note}
                      onChange={(event) => setTaskActionForm((value) => ({ ...value, note: event.target.value }))}
                      rows={3}
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      placeholder={taskActionMode === 'request_changes' ? '例如：当前工期过短，希望把验收整理时间单独留出来。' : '例如：已根据反馈调整金额、工期和范围，请再次确认。'}
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
                  <Button type="button" variant="outline" className="rounded-xl border-slate-200 bg-white" onClick={closeTaskAction}>
                    取消
                  </Button>
                  <Button type="submit" disabled={isSubmittingTaskAction} className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                    {isSubmittingTaskAction ? '提交中...' : taskActionPrimaryLabel}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/30">
            {messages.map((msg, idx) => {
              const own = isOwnMessage(msg);
              const system = msg.type === 'SYSTEM' || msg.author === '系统消息';
              const ownAvatarSrc = own ? imageSrcOf(currentUser?.avatar) : '';
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
                        {ownAvatarSrc ? <AvatarImage src={ownAvatarSrc} /> : null}
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
                    <span
                      key={`${file.name}-${file.size}`}
                      className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 sm:max-w-[320px]"
                    >
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      <button
                        type="button"
                        aria-label={`移除 ${file.name}`}
                        title="移除"
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
                        onClick={() => setPendingFiles((items) => items.filter((item) => item !== file))}
                      >
                        <X className="h-3.5 w-3.5" />
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
                  disabled={!activeRoomKey || isSending || taskImRoom.status === 'connecting'}
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
                  disabled={(!message.trim() && pendingFiles.length === 0) || !activeRoomKey || isSending || taskImRoom.status === 'connecting'}
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
