import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string = 'http://localhost:3002'): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 诊断相关事件
  joinDiagnosisRoom(sessionId: string) {
    this.emit('join_diagnosis_room', { sessionId });
  }

  leaveDiagnosisRoom(sessionId: string) {
    this.emit('leave_diagnosis_room', { sessionId });
  }

  // 监听诊断状态更新
  onDiagnosisStatusUpdate(callback: (data: any) => void) {
    this.on('diagnosis_status_update', callback);
  }

  // 监听智能体状态更新
  onAgentStatusUpdate(callback: (data: any) => void) {
    this.on('agent_status_update', callback);
  }

  // 监听辩论过程更新
  onDebateUpdate(callback: (data: any) => void) {
    this.on('debate_update', callback);
  }

  // 监听分析进度更新
  onAnalysisProgress(callback: (data: any) => void) {
    this.on('analysis_progress', callback);
  }

  // 监听诊断完成
  onDiagnosisComplete(callback: (data: any) => void) {
    this.on('diagnosis_complete', callback);
  }

  // 移除诊断相关监听器
  offDiagnosisEvents() {
    this.off('diagnosis_status_update');
    this.off('agent_status_update');
    this.off('debate_update');
    this.off('analysis_progress');
    this.off('diagnosis_complete');
  }
}

// 创建单例实例
const websocketService = new WebSocketService();

export default websocketService;
export { WebSocketService };