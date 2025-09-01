/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import patientsRoutes from './routes/patients';
import uploadRoutes from './routes/upload';
import diagnosisRoutes from './routes/diagnosis';
import demoRoutes from './routes/demo';
import agentsRoutes from './routes/agents';
// 错误处理中间件已在下方定义
import WebSocketService from './websocket';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();


const app: express.Application = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// 初始化WebSocket服务
const wsService = new WebSocketService(server);

// 将WebSocket服务实例添加到app中，供其他路由使用
app.set('wsService', wsService);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/agents', agentsRoutes);

/**
 * health
 */
app.use('/api/health', (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json({
    success: true,
    message: 'ok'
  });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error'
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found'
  });
});

// Server will be started by server.ts

export default app;