import { useEffect, useRef, useCallback } from 'react';
import websocketService from '@/utils/websocket';
import { Socket } from 'socket.io-client';

export const useWebSocket = (url?: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = websocketService.connect(url);

    return () => {
      // 组件卸载时不断开连接，保持全局连接
    };
  }, [url]);

  const emit = useCallback((event: string, data?: any) => {
    websocketService.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    websocketService.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    websocketService.off(event, callback);
  }, []);

  return {
    socket: socketRef.current,
    emit,
    on,
    off,
    isConnected: websocketService.isConnected(),
  };
};

// 诊断专用的WebSocket hook
export const useDiagnosisWebSocket = (sessionId?: string) => {
  const { socket, emit, on, off, isConnected } = useWebSocket();

  useEffect(() => {
    if (sessionId && isConnected) {
      websocketService.joinDiagnosisRoom(sessionId);
    }

    return () => {
      if (sessionId) {
        websocketService.leaveDiagnosisRoom(sessionId);
        websocketService.offDiagnosisEvents();
      }
    };
  }, [sessionId, isConnected]);

  const onDiagnosisStatusUpdate = useCallback((callback: (data: any) => void) => {
    websocketService.onDiagnosisStatusUpdate(callback);
  }, []);

  const onAgentStatusUpdate = useCallback((callback: (data: any) => void) => {
    websocketService.onAgentStatusUpdate(callback);
  }, []);

  const onDebateUpdate = useCallback((callback: (data: any) => void) => {
    websocketService.onDebateUpdate(callback);
  }, []);

  const onAnalysisProgress = useCallback((callback: (data: any) => void) => {
    websocketService.onAnalysisProgress(callback);
  }, []);

  const onDiagnosisComplete = useCallback((callback: (data: any) => void) => {
    websocketService.onDiagnosisComplete(callback);
  }, []);

  return {
    socket,
    emit,
    on,
    off,
    isConnected,
    onDiagnosisStatusUpdate,
    onAgentStatusUpdate,
    onDebateUpdate,
    onAnalysisProgress,
    onDiagnosisComplete,
  };
};

// 实时通知的WebSocket hook
export const useNotificationWebSocket = () => {
  const { socket, on, off, isConnected } = useWebSocket();

  const onNotification = useCallback((callback: (data: any) => void) => {
    on('notification', callback);
  }, [on]);

  const onSystemAlert = useCallback((callback: (data: any) => void) => {
    on('system_alert', callback);
  }, [on]);

  const onUploadProgress = useCallback((callback: (data: any) => void) => {
    on('upload_progress', callback);
  }, [on]);

  const onUploadComplete = useCallback((callback: (data: any) => void) => {
    on('upload_complete', callback);
  }, [on]);

  return {
    socket,
    isConnected,
    onNotification,
    onSystemAlert,
    onUploadProgress,
    onUploadComplete,
    off,
  };
};