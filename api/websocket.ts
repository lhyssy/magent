import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, string>(); // userId -> socketId
  private diagnosisRooms = new Map<string, Set<string>>(); // sessionId -> Set<socketId>

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      },
      transports: ['websocket']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // 身份验证中间件
    this.io.use((socket: any, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        // 允许匿名连接，但标记为未认证
        socket.userId = null;
        socket.userRole = 'anonymous';
        return next();
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        socket.userId = decoded.userId;
        socket.userRole = decoded.role || 'user';
        next();
      } catch (error) {
        console.error('WebSocket authentication failed:', error);
        socket.userId = null;
        socket.userRole = 'anonymous';
        next();
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: any) => {
      console.log(`WebSocket client connected: ${socket.id}`);
      
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
        console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      }

      // 加入诊断房间
      socket.on('join_diagnosis_room', (data: { sessionId: string }) => {
        const { sessionId } = data;
        socket.join(`diagnosis_${sessionId}`);
        
        if (!this.diagnosisRooms.has(sessionId)) {
          this.diagnosisRooms.set(sessionId, new Set());
        }
        this.diagnosisRooms.get(sessionId)?.add(socket.id);
        
        console.log(`Socket ${socket.id} joined diagnosis room: ${sessionId}`);
        
        // 通知房间内其他用户
        socket.to(`diagnosis_${sessionId}`).emit('user_joined_diagnosis', {
          userId: socket.userId,
          socketId: socket.id
        });
      });

      // 离开诊断房间
      socket.on('leave_diagnosis_room', (data: { sessionId: string }) => {
        const { sessionId } = data;
        socket.leave(`diagnosis_${sessionId}`);
        
        this.diagnosisRooms.get(sessionId)?.delete(socket.id);
        if (this.diagnosisRooms.get(sessionId)?.size === 0) {
          this.diagnosisRooms.delete(sessionId);
        }
        
        console.log(`Socket ${socket.id} left diagnosis room: ${sessionId}`);
        
        // 通知房间内其他用户
        socket.to(`diagnosis_${sessionId}`).emit('user_left_diagnosis', {
          userId: socket.userId,
          socketId: socket.id
        });
      });

      // 处理断开连接
      socket.on('disconnect', (reason) => {
        console.log(`WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
        
        // 从所有诊断房间中移除
        this.diagnosisRooms.forEach((sockets, sessionId) => {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);
            socket.to(`diagnosis_${sessionId}`).emit('user_left_diagnosis', {
              userId: socket.userId,
              socketId: socket.id
            });
            
            if (sockets.size === 0) {
              this.diagnosisRooms.delete(sessionId);
            }
          }
        });
      });

      // 处理错误
      socket.on('error', (error: Error) => {
        console.error(`WebSocket error for ${socket.id}:`, error);
      });
    });
  }

  // 发送诊断状态更新
  public sendDiagnosisStatusUpdate(sessionId: string, data: any) {
    this.io.to(`diagnosis_${sessionId}`).emit('diagnosis_status_update', data);
    console.log(`Sent diagnosis status update to session ${sessionId}:`, data);
  }

  // 发送智能体状态更新
  public sendAgentStatusUpdate(sessionId: string, data: any) {
    this.io.to(`diagnosis_${sessionId}`).emit('agent_status_update', data);
    console.log(`Sent agent status update to session ${sessionId}:`, data);
  }

  // 发送辩论过程更新
  public sendDebateUpdate(sessionId: string, data: any) {
    this.io.to(`diagnosis_${sessionId}`).emit('debate_update', data);
    console.log(`Sent debate update to session ${sessionId}:`, data);
  }

  // 发送分析进度更新
  public sendAnalysisProgress(sessionId: string, data: any) {
    this.io.to(`diagnosis_${sessionId}`).emit('analysis_progress', data);
    console.log(`Sent analysis progress to session ${sessionId}:`, data);
  }

  // 发送诊断完成通知
  public sendDiagnosisComplete(sessionId: string, data: any) {
    this.io.to(`diagnosis_${sessionId}`).emit('diagnosis_complete', data);
    console.log(`Sent diagnosis complete to session ${sessionId}:`, data);
  }

  // 发送上传进度更新
  public sendUploadProgress(userId: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('upload_progress', data);
      console.log(`Sent upload progress to user ${userId}:`, data);
    }
  }

  // 发送上传完成通知
  public sendUploadComplete(userId: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('upload_complete', data);
      console.log(`Sent upload complete to user ${userId}:`, data);
    }
  }

  // 发送通用通知
  public sendNotification(userId: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', data);
      console.log(`Sent notification to user ${userId}:`, data);
    }
  }

  // 广播系统警告
  public broadcastSystemAlert(data: any) {
    this.io.emit('system_alert', data);
    console.log('Broadcasted system alert:', data);
  }

  // 获取连接统计
  public getConnectionStats() {
    return {
      totalConnections: this.io.sockets.sockets.size,
      authenticatedUsers: this.connectedUsers.size,
      activeDiagnosisRooms: this.diagnosisRooms.size
    };
  }

  // 获取诊断房间信息
  public getDiagnosisRoomInfo(sessionId: string) {
    const room = this.diagnosisRooms.get(sessionId);
    return {
      sessionId,
      connectedSockets: room ? Array.from(room) : [],
      userCount: room ? room.size : 0
    };
  }
}

export default WebSocketService;
export { WebSocketService };