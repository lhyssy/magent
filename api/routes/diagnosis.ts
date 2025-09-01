/**
 * 诊断分析API路由
 * 处理多智能体心理疾病诊断分析流程
 */
import { Router, type Request, type Response } from 'express';
import type WebSocketService from '../websocket';

const router = Router();

// 智能体类型定义
type AgentType = 'fnirs' | 'eeg' | 'audio' | 'video' | 'coordination';
type AgentStatus = 'pending' | 'running' | 'completed' | 'error';
type DiagnosisStatus = 'pending' | 'analyzing' | 'debating' | 'completed' | 'error';

// 诊断会话接口
interface DiagnosisSession {
  id: string;
  patientId: string;
  status: DiagnosisStatus;
  progress: number;
  startTime: string;
  endTime?: string;
  agents: Record<AgentType, {
    status: AgentStatus;
    progress: number;
    result?: any;
    error?: string;
    startTime?: string;
    endTime?: string;
  }>;
  dataFiles: {
    fnirs?: string[];
    eeg?: string[];
    audio?: string[];
    video?: string[];
  };
  debateLog: {
    timestamp: string;
    agent: AgentType;
    message: string;
    confidence: number;
  }[];
  finalResult?: {
    diagnosis: string;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    evidence: Record<string, any>;
    recommendations: string[];
  };
}

// 模拟诊断会话存储
let diagnosisSessions: DiagnosisSession[] = [];

/**
 * 创建新的诊断会话
 * POST /api/diagnosis/sessions
 */
router.post('/sessions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, dataFiles } = req.body;
    
    if (!patientId) {
      res.status(400).json({
        success: false,
        error: '缺少患者ID'
      });
      return;
    }
    
    if (!dataFiles || Object.keys(dataFiles).length === 0) {
      res.status(400).json({
        success: false,
        error: '缺少数据文件'
      });
      return;
    }
    
    const sessionId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: DiagnosisSession = {
      id: sessionId,
      patientId,
      status: 'pending',
      progress: 0,
      startTime: new Date().toISOString(),
      agents: {
        fnirs: { status: 'pending', progress: 0 },
        eeg: { status: 'pending', progress: 0 },
        audio: { status: 'pending', progress: 0 },
        video: { status: 'pending', progress: 0 },
        coordination: { status: 'pending', progress: 0 }
      },
      dataFiles,
      debateLog: []
    };
    
    diagnosisSessions.push(session);
    
    res.json({
      success: true,
      data: session,
      message: '诊断会话创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建诊断会话失败'
    });
  }
});

/**
 * 开始诊断分析
 * POST /api/diagnosis/sessions/:id/start
 */
router.post('/sessions/:id/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = diagnosisSessions.find(s => s.id === id);
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: '诊断会话不存在'
      });
      return;
    }
    
    if (session.status !== 'pending') {
      res.status(400).json({
        success: false,
        error: '诊断会话状态不允许启动'
      });
      return;
    }
    
    // 更新会话状态
    session.status = 'analyzing';
    session.progress = 5;
    
    // 模拟启动各个智能体
    const agentTypes: AgentType[] = ['fnirs', 'eeg', 'audio', 'video'];
    agentTypes.forEach(agentType => {
      if (session.dataFiles[agentType] && session.dataFiles[agentType]!.length > 0) {
        session.agents[agentType].status = 'running';
        session.agents[agentType].startTime = new Date().toISOString();
      }
    });
    
    // 获取WebSocket服务实例
    const wsService = req.app.get('wsService') as WebSocketService;
    
    // 模拟异步分析过程
    simulateAnalysisProcess(session, wsService);
    
    // 发送诊断状态更新
    if (wsService) {
      wsService.sendDiagnosisStatusUpdate(session.id, {
        status: session.status,
        progress: session.progress
      });
    }
    
    res.json({
      success: true,
      data: session,
      message: '诊断分析已启动'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '启动诊断分析失败'
    });
  }
});

/**
 * 获取诊断会话详情
 * GET /api/diagnosis/sessions/:id
 */
router.get('/sessions/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = diagnosisSessions.find(s => s.id === id);
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: '诊断会话不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取诊断会话详情失败'
    });
  }
});

/**
 * 获取诊断会话列表
 * GET /api/diagnosis/sessions
 */
router.get('/sessions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, status, page = 1, limit = 10 } = req.query;
    
    let filteredSessions = diagnosisSessions;
    
    if (patientId) {
      filteredSessions = filteredSessions.filter(s => s.patientId === patientId);
    }
    
    if (status) {
      filteredSessions = filteredSessions.filter(s => s.status === status);
    }
    
    // 分页
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedSessions = filteredSessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        sessions: paginatedSessions,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total: filteredSessions.length,
          totalPages: Math.ceil(filteredSessions.length / limitNum)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取诊断会话列表失败'
    });
  }
});

/**
 * 获取智能体状态
 * GET /api/diagnosis/sessions/:id/agents
 */
router.get('/sessions/:id/agents', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = diagnosisSessions.find(s => s.id === id);
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: '诊断会话不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      data: session.agents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取智能体状态失败'
    });
  }
});

/**
 * 获取辩论日志
 * GET /api/diagnosis/sessions/:id/debate-log
 */
router.get('/sessions/:id/debate-log', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;
    
    const session = diagnosisSessions.find(s => s.id === id);
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: '诊断会话不存在'
      });
      return;
    }
    
    const limitNum = parseInt(limit.toString());
    const recentLogs = session.debateLog
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limitNum);
    
    res.json({
      success: true,
      data: recentLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取辩论日志失败'
    });
  }
});

/**
 * 停止诊断分析
 * POST /api/diagnosis/sessions/:id/stop
 */
router.post('/sessions/:id/stop', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = diagnosisSessions.find(s => s.id === id);
    
    if (!session) {
      res.status(404).json({
        success: false,
        error: '诊断会话不存在'
      });
      return;
    }
    
    if (session.status !== 'analyzing' && session.status !== 'debating') {
      res.status(400).json({
        success: false,
        error: '诊断会话状态不允许停止'
      });
      return;
    }
    
    // 停止所有智能体
    Object.keys(session.agents).forEach(agentType => {
      const agent = session.agents[agentType as AgentType];
      if (agent.status === 'running') {
        agent.status = 'error';
        agent.error = '用户手动停止';
        agent.endTime = new Date().toISOString();
      }
    });
    
    session.status = 'error';
    session.endTime = new Date().toISOString();
    
    res.json({
      success: true,
      data: session,
      message: '诊断分析已停止'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '停止诊断分析失败'
    });
  }
});

/**
 * 获取诊断统计信息
 * GET /api/diagnosis/stats
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const totalSessions = diagnosisSessions.length;
    
    const statusStats = diagnosisSessions.reduce((stats, session) => {
      if (!stats[session.status]) {
        stats[session.status] = 0;
      }
      stats[session.status]++;
      return stats;
    }, {} as Record<string, number>);
    
    const completedSessions = diagnosisSessions.filter(s => s.status === 'completed');
    const averageAnalysisTime = completedSessions.length > 0 
      ? completedSessions.reduce((sum, session) => {
          if (session.endTime) {
            return sum + (new Date(session.endTime).getTime() - new Date(session.startTime).getTime());
          }
          return sum;
        }, 0) / completedSessions.length
      : 0;
    
    res.json({
      success: true,
      data: {
        totalSessions,
        statusStats,
        completedSessions: completedSessions.length,
        averageAnalysisTime: Math.round(averageAnalysisTime / 1000), // 转换为秒
        successRate: totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取诊断统计信息失败'
    });
  }
});

/**
 * 模拟分析过程
 */
function simulateAnalysisProcess(session: DiagnosisSession, wsService?: WebSocketService) {
  const agentTypes: AgentType[] = ['fnirs', 'eeg', 'audio', 'video'];
  const activeAgents = agentTypes.filter(type => 
    session.dataFiles[type] && session.dataFiles[type]!.length > 0
  );
  
  let completedAgents = 0;
  
  // 模拟各个智能体的分析过程
  activeAgents.forEach((agentType, index) => {
    const agent = session.agents[agentType];
    
    // 模拟分析进度
    const progressInterval = setInterval(() => {
      if (agent.status === 'running') {
        agent.progress = Math.min(agent.progress + Math.random() * 15, 95);
        
        // 发送智能体状态更新
        if (wsService) {
          wsService.sendAgentStatusUpdate(session.id, {
            agentType,
            status: agent.status,
            progress: agent.progress
          });
        }
        
        // 模拟分析完成
        if (agent.progress >= 90) {
          agent.status = 'completed';
          agent.progress = 100;
          agent.endTime = new Date().toISOString();
          
          // 模拟分析结果
          agent.result = generateMockAnalysisResult(agentType);
          
          completedAgents++;
          clearInterval(progressInterval);
          
          // 发送智能体完成状态
          if (wsService) {
            wsService.sendAgentStatusUpdate(session.id, {
              agentType,
              status: agent.status,
              progress: agent.progress,
              result: agent.result
            });
          }
          
          // 添加辩论日志
          const debateEntry = {
            timestamp: new Date().toISOString(),
            agent: agentType,
            message: `${agentType.toUpperCase()}智能体分析完成，置信度: ${agent.result.confidence}%`,
            confidence: agent.result.confidence
          };
          session.debateLog.push(debateEntry);
          
          // 发送辩论更新
          if (wsService) {
            wsService.sendDebateUpdate(session.id, debateEntry);
          }
          
          // 检查是否所有智能体都完成了
          if (completedAgents === activeAgents.length) {
            startDebatePhase(session, wsService);
          }
        }
      }
    }, 1000 + index * 500); // 错开启动时间
  });
  
  // 更新整体进度
  const overallProgressInterval = setInterval(() => {
    if (session.status === 'analyzing') {
      const totalProgress = activeAgents.reduce((sum, type) => 
        sum + session.agents[type].progress, 0
      );
      session.progress = Math.round(totalProgress / activeAgents.length * 0.7); // 分析阶段占70%
      
      // 发送分析进度更新
      if (wsService) {
        wsService.sendAnalysisProgress(session.id, {
          progress: session.progress,
          status: session.status,
          activeAgents: activeAgents.map(type => ({
            type,
            progress: session.agents[type].progress,
            status: session.agents[type].status
          }))
        });
      }
    } else {
      clearInterval(overallProgressInterval);
    }
  }, 1000);
}

/**
 * 开始辩论阶段
 */
function startDebatePhase(session: DiagnosisSession, wsService?: WebSocketService) {
  session.status = 'debating';
  session.agents.coordination.status = 'running';
  session.agents.coordination.startTime = new Date().toISOString();
  
  // 发送诊断状态更新
  if (wsService) {
    wsService.sendDiagnosisStatusUpdate(session.id, {
      status: session.status,
      progress: session.progress
    });
  }
  
  // 模拟辩论过程
  const debateMessages = [
    { agent: 'coordination' as AgentType, message: '开始智能体辩论阶段，协调各方观点' },
    { agent: 'fnirs' as AgentType, message: '基于fNIRS数据，前额叶皮层活动异常，建议诊断为抑郁症' },
    { agent: 'eeg' as AgentType, message: 'EEG数据显示α波功率降低，支持抑郁症诊断' },
    { agent: 'audio' as AgentType, message: '语音分析显示情绪低落特征，与抑郁症症状一致' },
    { agent: 'video' as AgentType, message: '面部表情分析显示负面情绪占主导，支持抑郁症诊断' },
    { agent: 'coordination' as AgentType, message: '综合各智能体分析结果，达成一致诊断意见' }
  ];
  
  let messageIndex = 0;
  const debateInterval = setInterval(() => {
    if (messageIndex < debateMessages.length) {
      const message = debateMessages[messageIndex];
      const debateEntry = {
        timestamp: new Date().toISOString(),
        agent: message.agent,
        message: message.message,
        confidence: 85 + Math.random() * 10
      };
      session.debateLog.push(debateEntry);
      
      session.progress = 70 + (messageIndex / debateMessages.length) * 30;
      
      // 发送辩论更新
      if (wsService) {
        wsService.sendDebateUpdate(session.id, debateEntry);
        wsService.sendAnalysisProgress(session.id, {
          progress: session.progress,
          status: session.status
        });
      }
      
      messageIndex++;
    } else {
      // 辩论完成，生成最终结果
      session.agents.coordination.status = 'completed';
      session.agents.coordination.progress = 100;
      session.agents.coordination.endTime = new Date().toISOString();
      
      session.status = 'completed';
      session.progress = 100;
      session.endTime = new Date().toISOString();
      
      session.finalResult = generateFinalDiagnosisResult();
      
      // 发送诊断完成通知
      if (wsService) {
        wsService.sendDiagnosisComplete(session.id, {
          status: session.status,
          progress: session.progress,
          finalResult: session.finalResult,
          endTime: session.endTime
        });
      }
      
      clearInterval(debateInterval);
    }
  }, 2000);
}

/**
 * 生成模拟分析结果
 */
function generateMockAnalysisResult(agentType: AgentType) {
  const results = {
    fnirs: {
      confidence: 87,
      findings: ['前额叶皮层活动异常', '血氧饱和度降低'],
      diagnosis: '抑郁症倾向'
    },
    eeg: {
      confidence: 82,
      findings: ['α波功率降低', 'θ波活动增强'],
      diagnosis: '抑郁症特征'
    },
    audio: {
      confidence: 79,
      findings: ['语调低沉', '语速缓慢', '情绪低落'],
      diagnosis: '抑郁情绪'
    },
    video: {
      confidence: 85,
      findings: ['面部表情消极', '眼神接触减少', '肢体语言封闭'],
      diagnosis: '抑郁症状'
    }
  };
  
  return results[agentType] || { confidence: 80, findings: [], diagnosis: '待分析' };
}

/**
 * 生成最终诊断结果
 */
function generateFinalDiagnosisResult() {
  return {
    diagnosis: '重度抑郁症',
    confidence: 86,
    riskLevel: 'high' as const,
    evidence: {
      fnirs: '前额叶皮层活动显著异常',
      eeg: 'α波功率明显降低',
      audio: '语音情绪特征符合抑郁症模式',
      video: '面部表情和肢体语言显示明显抑郁症状'
    },
    recommendations: [
      '建议立即开始抗抑郁药物治疗',
      '配合认知行为疗法',
      '定期心理咨询',
      '建立社会支持网络',
      '监控自杀风险'
    ]
  };
}

/**
 * 流式聊天API
 * GET /api/diagnosis/chat/stream
 */
router.get('/chat/stream', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sessionId } = req.query;
    
    if (!message) {
      res.status(400).json({
        success: false,
        error: '缺少消息内容'
      });
      return;
    }
    
    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // 模拟AI回复内容
    const aiResponse = generateAIResponse(message as string);
    
    // 流式发送响应
    await streamResponse(res, aiResponse);
    
  } catch (error) {
    console.error('流式聊天错误:', error);
    res.write(`data: ${JSON.stringify({ error: '服务器内部错误' })}\n\n`);
    res.end();
  }
});

/**
 * 生成AI回复内容
 */
function generateAIResponse(message: string): string {
  // 根据消息内容生成相应的回复
  const responses = {
    '症状': '我理解您的症状描述。让我为您分析一下这些症状的可能原因和建议的处理方式。',
    '抑郁': '抑郁症状需要专业的评估和治疗。我建议您详细描述症状的持续时间、严重程度以及对日常生活的影响。',
    '焦虑': '焦虑情绪是很常见的心理状态。让我们一起分析您的焦虑触发因素和应对策略。',
    '失眠': '睡眠问题可能与多种因素相关。请告诉我您的睡眠模式、入睡困难的具体情况以及睡眠质量。',
    '视频': '我已收到您的视频文件。视频分析师正在对您的面部表情、肢体语言和行为模式进行专业分析。',
    '音频': '音频文件已接收。音频分析师将对您的语音特征、语调变化和情感表达进行深度分析。',
    'default': '感谢您的信息。我正在综合分析您提供的内容，并协调相关专家为您提供专业的诊断建议。'
  };
  
  // 查找匹配的关键词
  for (const [keyword, response] of Object.entries(responses)) {
    if (keyword !== 'default' && message.toLowerCase().includes(keyword)) {
      return response;
    }
  }
  
  return responses.default;
}

/**
 * 流式发送响应
 */
async function streamResponse(res: Response, content: string): Promise<void> {
  const words = content.split('');
  
  for (let i = 0; i < words.length; i++) {
    const char = words[i];
    
    // 发送字符数据
    res.write(`data: ${JSON.stringify({ 
      type: 'content',
      content: char,
      index: i,
      total: words.length
    })}\n\n`);
    
    // 控制打字速度（30-80ms之间的随机延迟）
    const delay = Math.random() * 50 + 30;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // 发送完成信号
  res.write(`data: ${JSON.stringify({ 
    type: 'complete',
    timestamp: new Date().toISOString()
  })}\n\n`);
  
  res.end();
}

export default router;