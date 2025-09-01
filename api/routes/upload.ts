/**
 * 数据上传API路由
 * 处理fNIRS、EEG、音频、视频等多模态数据文件上传
 */
import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import WebSocketService from '../websocket';

const router = Router();

// 配置multer存储
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许的文件类型
  const allowedTypes = {
    'fnirs': ['.mat', '.csv', '.txt', '.nirs'],
    'eeg': ['.edf', '.bdf', '.mat', '.csv', '.txt'],
    'audio': ['.wav', '.mp3', '.m4a', '.flac'],
    'video': ['.mp4', '.avi', '.mov', '.mkv']
  };
  
  const fileExt = path.extname(file.originalname).toLowerCase();
  const dataType = req.body.dataType || req.query.dataType;
  
  if (dataType && allowedTypes[dataType as keyof typeof allowedTypes]) {
    const isAllowed = allowedTypes[dataType as keyof typeof allowedTypes].includes(fileExt);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的${dataType}文件格式: ${fileExt}`));
    }
  } else {
    cb(new Error('未指定数据类型或数据类型不支持'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// 模拟上传记录
let uploadRecords: any[] = [];

/**
 * 单文件上传
 * POST /api/upload/single
 */
router.post('/single', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: '未选择文件'
      });
      return;
    }
    
    const { dataType, patientId, description } = req.body;
    
    if (!dataType || !patientId) {
      res.status(400).json({
        success: false,
        error: '缺少必填参数: dataType 或 patientId'
      });
      return;
    }
    
    // 生成文件ID和存储路径
    const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${fileId}_${req.file.originalname}`;
    const filePath = path.join('uploads', dataType, fileName);
    
    // 创建上传记录
    const uploadRecord = {
      id: fileId,
      originalName: req.file.originalname,
      fileName,
      filePath,
      dataType,
      patientId,
      description: description || '',
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
      processedAt: null,
      analysisStatus: 'pending'
    };
    
    uploadRecords.push(uploadRecord);
    
    // 获取WebSocket服务实例
    const wsService = req.app.get('wsService') as WebSocketService;
    
    // 模拟文件保存（实际应用中应该保存到磁盘或云存储）
    console.log(`文件上传成功: ${fileName}, 大小: ${req.file.size} bytes`);
    
    // 发送上传完成通知
    if (wsService) {
      wsService.sendUploadComplete(patientId, {
        fileId,
        fileName: req.file.originalname,
        dataType,
        patientId,
        status: 'success',
        message: '文件上传成功'
      });
    }
    
    res.json({
      success: true,
      data: uploadRecord,
      message: '文件上传成功'
    });
  } catch (error) {
    // 获取WebSocket服务实例
    const wsService = req.app.get('wsService') as WebSocketService;
    
    // 发送上传失败通知
    if (wsService) {
      wsService.sendUploadComplete(req.body.patientId || 'unknown', {
        fileId: 'error',
        fileName: req.file?.originalname || 'unknown',
        dataType: req.body.dataType || 'unknown',
        patientId: req.body.patientId || 'unknown',
        status: 'error',
        message: error instanceof Error ? error.message : '文件上传失败'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '文件上传失败'
    });
  }
});

/**
 * 多文件上传
 * POST /api/upload/multiple
 */
router.post('/multiple', upload.array('files', 10), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: '未选择文件'
      });
      return;
    }
    
    const { dataType, patientId, description } = req.body;
    
    if (!dataType || !patientId) {
      res.status(400).json({
        success: false,
        error: '缺少必填参数: dataType 或 patientId'
      });
      return;
    }
    
    const uploadedFiles = [];
    
    // 获取WebSocket服务实例
    const wsService = req.app.get('wsService') as WebSocketService;
    
    for (const file of files) {
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = `${fileId}_${file.originalname}`;
      const filePath = path.join('uploads', dataType, fileName);
      
      const uploadRecord = {
        id: fileId,
        originalName: file.originalname,
        fileName,
        filePath,
        dataType,
        patientId,
        description: description || '',
        fileSize: file.size,
        mimeType: file.mimetype,
        status: 'uploaded',
        uploadedAt: new Date().toISOString(),
        processedAt: null,
        analysisStatus: 'pending'
      };
      
      uploadRecords.push(uploadRecord);
      uploadedFiles.push(uploadRecord);
      
      // 发送单个文件上传完成通知
      if (wsService) {
        wsService.sendUploadComplete(patientId, {
          fileId,
          fileName: file.originalname,
          dataType,
          patientId,
          status: 'success',
          message: `文件 ${file.originalname} 上传成功`
        });
      }
    }
    
    // 发送批量上传完成通知
    if (wsService) {
      wsService.sendNotification(patientId, {
        type: 'upload_batch_complete',
        title: '批量上传完成',
        message: `成功上传 ${files.length} 个文件`,
        data: {
          patientId,
          dataType,
          fileCount: files.length,
          totalSize: files.reduce((sum, file) => sum + file.size, 0)
        }
      });
    }
    
    res.json({
      success: true,
      data: uploadedFiles,
      message: `成功上传 ${files.length} 个文件`
    });
  } catch (error) {
    // 获取WebSocket服务实例
    const wsService = req.app.get('wsService') as WebSocketService;
    
    // 发送批量上传失败通知
    if (wsService) {
      wsService.sendNotification(req.body.patientId || 'unknown', {
        type: 'upload_batch_error',
        title: '批量上传失败',
        message: error instanceof Error ? error.message : '文件上传失败',
        data: {
          patientId: req.body.patientId || 'unknown',
          dataType: req.body.dataType || 'unknown'
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '文件上传失败'
    });
  }
});

/**
 * 获取上传记录列表
 * GET /api/upload/records
 */
router.get('/records', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, dataType, status, page = 1, limit = 10 } = req.query;
    
    let filteredRecords = uploadRecords;
    
    // 过滤条件
    if (patientId) {
      filteredRecords = filteredRecords.filter(record => record.patientId === patientId);
    }
    
    if (dataType) {
      filteredRecords = filteredRecords.filter(record => record.dataType === dataType);
    }
    
    if (status) {
      filteredRecords = filteredRecords.filter(record => record.analysisStatus === status);
    }
    
    // 分页
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedRecords = filteredRecords
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total: filteredRecords.length,
          totalPages: Math.ceil(filteredRecords.length / limitNum)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取上传记录失败'
    });
  }
});

/**
 * 获取单个上传记录详情
 * GET /api/upload/records/:id
 */
router.get('/records/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const record = uploadRecords.find(r => r.id === id);
    
    if (!record) {
      res.status(404).json({
        success: false,
        error: '上传记录不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取上传记录详情失败'
    });
  }
});

/**
 * 删除上传记录
 * DELETE /api/upload/records/:id
 */
router.delete('/records/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const recordIndex = uploadRecords.findIndex(r => r.id === id);
    if (recordIndex === -1) {
      res.status(404).json({
        success: false,
        error: '上传记录不存在'
      });
      return;
    }
    
    // 删除记录（实际应用中还应该删除对应的文件）
    uploadRecords.splice(recordIndex, 1);
    
    res.json({
      success: true,
      message: '上传记录删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除上传记录失败'
    });
  }
});

/**
 * 获取支持的文件类型
 * GET /api/upload/supported-types
 */
router.get('/supported-types', async (req: Request, res: Response): Promise<void> => {
  try {
    const supportedTypes = {
      fnirs: {
        name: 'fNIRS数据',
        extensions: ['.mat', '.csv', '.txt', '.nirs'],
        description: '功能性近红外光谱数据文件'
      },
      eeg: {
        name: 'EEG数据',
        extensions: ['.edf', '.bdf', '.mat', '.csv', '.txt'],
        description: '脑电图数据文件'
      },
      audio: {
        name: '音频数据',
        extensions: ['.wav', '.mp3', '.m4a', '.flac'],
        description: '音频录音文件'
      },
      video: {
        name: '视频数据',
        extensions: ['.mp4', '.avi', '.mov', '.mkv'],
        description: '视频录像文件'
      }
    };
    
    res.json({
      success: true,
      data: supportedTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取支持的文件类型失败'
    });
  }
});

/**
 * 获取上传统计信息
 * GET /api/upload/stats
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUploads = uploadRecords.length;
    const totalSize = uploadRecords.reduce((sum, record) => sum + record.fileSize, 0);
    
    const typeStats = uploadRecords.reduce((stats, record) => {
      if (!stats[record.dataType]) {
        stats[record.dataType] = { count: 0, size: 0 };
      }
      stats[record.dataType].count++;
      stats[record.dataType].size += record.fileSize;
      return stats;
    }, {} as Record<string, { count: number; size: number }>);
    
    const statusStats = uploadRecords.reduce((stats, record) => {
      if (!stats[record.analysisStatus]) {
        stats[record.analysisStatus] = 0;
      }
      stats[record.analysisStatus]++;
      return stats;
    }, {} as Record<string, number>);
    
    res.json({
      success: true,
      data: {
        totalUploads,
        totalSize,
        typeStats,
        statusStats,
        averageFileSize: totalUploads > 0 ? Math.round(totalSize / totalUploads) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取上传统计信息失败'
    });
  }
});

export default router;