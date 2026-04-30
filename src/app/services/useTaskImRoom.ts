import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTencentImConfig } from './api';
import {
  type BusinessFilePayload,
  createTaskImRoomClient,
  type TaskImIncomingMessage,
  type TaskImRoomClient
} from './tencentImClient';

export type TaskImRoomStatus = 'idle' | 'connecting' | 'ready' | 'degraded' | 'error';

export function useTaskImRoom(roomKey: string | null | undefined) {
  const [status, setStatus] = useState<TaskImRoomStatus>('idle');
  const [messages, setMessages] = useState<TaskImIncomingMessage[]>([]);
  const [error, setError] = useState('');
  const clientRef = useRef<TaskImRoomClient | null>(null);
  const generationRef = useRef(0);

  useEffect(() => {
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    let disposed = false;
    let localClient: TaskImRoomClient | null = null;
    let unsubscribe: (() => void) | undefined;
    const isCurrentEffect = () => !disposed && generationRef.current === generation;

    async function connect() {
      setMessages([]);
      if (!roomKey) {
        clientRef.current = null;
        setStatus('idle');
        setError('');
        return;
      }

      setStatus('connecting');
      setError('');
      try {
        const config = await getTencentImConfig(roomKey);
        if (!isCurrentEffect()) return;
        if (config.requestError) {
          throw new Error(config.requestError);
        }
        if (config.enabled === false || String(config.status || '').toUpperCase() === 'DEGRADED') {
          throw new Error(config.realtimeDisabledReason || 'Tencent IM unavailable');
        }
        localClient = createTaskImRoomClient(config);
        unsubscribe = localClient.onMessage((message) => {
          if (isCurrentEffect()) {
            setMessages((current) => upsertImMessage(current, message));
          }
        });
        await localClient.connect();
        if (!isCurrentEffect()) {
          unsubscribe?.();
          await localClient.disconnect().catch(() => undefined);
          return;
        }
        clientRef.current = localClient;
        setStatus('ready');
      } catch (exception) {
        if (isCurrentEffect()) {
          unsubscribe?.();
          void localClient?.disconnect();
          clientRef.current = null;
          setStatus('degraded');
          setError(exception instanceof Error ? exception.message : 'Tencent IM unavailable');
        }
      }
    }

    void connect();

    return () => {
      disposed = true;
      unsubscribe?.();
      const client = localClient;
      if (generationRef.current === generation) {
        clientRef.current = null;
      }
      void client?.disconnect();
    };
  }, [roomKey]);

  const sendText = useCallback(async (text: string) => {
    if (!clientRef.current || status !== 'ready') throw new Error('IM_DEGRADED');
    const message = await clientRef.current.sendText(text);
    setMessages((current) => upsertImMessage(current, message));
    return message;
  }, [status]);

  const sendImage = useCallback(async (file: File) => {
    if (!clientRef.current || status !== 'ready') throw new Error('IM_DEGRADED');
    const message = await clientRef.current.sendImage(file);
    setMessages((current) => upsertImMessage(current, message));
    return message;
  }, [status]);

  const sendBusinessFile = useCallback(async (payload: BusinessFilePayload) => {
    if (!clientRef.current || status !== 'ready') throw new Error('IM_DEGRADED');
    const message = await clientRef.current.sendBusinessFile(payload);
    setMessages((current) => upsertImMessage(current, message));
    return message;
  }, [status]);

  const refreshFromBusinessStore = useCallback(async () => undefined, []);

  return useMemo(() => ({
    status,
    messages,
    error,
    sendText,
    sendImage,
    sendBusinessFile,
    refreshFromBusinessStore,
    isDegraded: status === 'degraded' || status === 'error'
  }), [error, messages, refreshFromBusinessStore, sendBusinessFile, sendImage, sendText, status]);
}

function upsertImMessage(current: TaskImIncomingMessage[], next: TaskImIncomingMessage) {
  const key = next.providerMessageId;
  if (key && current.some((message) => message.providerMessageId === key)) {
    return current.map((message) => (message.providerMessageId === key ? next : message));
  }
  return [...current, next];
}
