import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Square, Brain, Activity, Mic, Video, Users, RefreshCw, MessageSquare, TrendingUp, AlertTriangle, ArrowLeft, FileText, Clock, Zap, Crown } from 'lucide-react';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import StatusIndicator from '@/components/StatusIndicator';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  progress: number;
  current_task?: string;
  output?: any;
  created_at: string;
  updated_at: string;
}

interface AgentActivity {
  id: string;
  session_id: string;
  agent_id: string;
  activity_type: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  input_data?: any;
  output_data?: any;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

interface DebateMessage {
  id: string;
  debate_session_id: string;
  agent_id: string;
  message_type: 'argument' | 'counter_argument' | 'consensus' | 'final_decision';
  content: string;
  confidence_score?: number;
  created_at: string;
}

interface DemoSession {
  id: string;
  session_name: string;
  status: 'active' | 'paused' | 'completed' | 'error';
  progress: number;
  current_stage: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export default function Diagnosis() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 静态演示数据
  const staticSession: DemoSession = {
    id: 'demo-session-123',
    session_name: '诊断会话-演示',
    status: 'active',
    progress: 75,
    current_stage: '分析中',
    metadata: { patient_id: id || 'demo-patient' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const staticAgents: Agent[] = [
    {
      id: 'agent-1',
      name: '总理智能体',
      type: 'coordinator',
      status: 'completed',
      progress: 100,
      current_task: '信息收集完成',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'agent-2',
      name: '分析师智能体',
      type: 'fnirs',
      status: 'working',
      progress: 80,
      current_task: '深度心理分析中',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'agent-3',
      name: '辩论智能体',
      type: 'eeg',
      status: 'working',
      progress: 60,
      current_task: '验证分析结果',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  const staticActivities: AgentActivity[] = [
    {
      id: 'activity-1',
      session_id: 'demo-session-123',
      agent_id: 'agent-1',
      activity_type: '信息收集',
      status: 'completed',
      progress: 100,
      output_data: '患者基本信息收集完成，包括症状描述、病史等',
      started_at: new Date(Date.now() - 300000).toISOString(),
      completed_at: new Date(Date.now() - 180000).toISOString(),
      created_at: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 'activity-2',
      session_id: 'demo-session-123',
      agent_id: 'agent-2',
      activity_type: '心理分析',
      status: 'running',
      progress: 80,
      output_data: '正在进行深度心理状态分析...',
      started_at: new Date(Date.now() - 180000).toISOString(),
      created_at: new Date(Date.now() - 180000).toISOString()
    },
    {
      id: 'activity-3',
      session_id: 'demo-session-123',
      agent_id: 'agent-3',
      activity_type: '诊断验证',
      status: 'running',
      progress: 60,
      output_data: '正在验证分析结果的准确性...',
      started_at: new Date(Date.now() - 120000).toISOString(),
      created_at: new Date(Date.now() - 120000).toISOString()
    }
  ];
  
  const staticDebateMessages: DebateMessage[] = [
    {
      id: 'debate-1',
      debate_session_id: 'demo-session-123',
      agent_id: 'agent-2',
      message_type: 'argument',
      content: '根据患者的症状描述和行为模式，我认为患者存在中度抑郁和焦虑状态。主要依据包括：持续的情绪低落、兴趣减退、睡眠障碍等典型症状。',
      confidence_score: 85,
      created_at: new Date(Date.now() - 120000).toISOString()
    },
    {
      id: 'debate-2',
      debate_session_id: 'demo-session-123',
      agent_id: 'agent-3',
      message_type: 'counter_argument',
      content: '我对这个诊断有一些质疑。虽然症状确实符合抑郁的表现，但我们需要排除其他可能的原因，比如生理疾病、药物副作用等。建议进行更全面的评估。',
      confidence_score: 70,
      created_at: new Date(Date.now() - 90000).toISOString()
    },
    {
      id: 'debate-3',
      debate_session_id: 'demo-session-123',
      agent_id: 'agent-2',
      message_type: 'argument',
      content: '你的质疑很有道理。经过进一步分析，患者的症状持续时间超过2周，且没有明显的生理疾病史或药物使用史。心理因素是主要的致病因素。',
      confidence_score: 90,
      created_at: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'debate-4',
      debate_session_id: 'demo-session-123',
      agent_id: 'agent-3',
      message_type: 'consensus',
      content: '经过充分讨论，我同意这个诊断。患者确实存在中度抑郁和焦虑状态，建议进行心理治疗和必要的药物干预。',
      confidence_score: 88,
      created_at: new Date(Date.now() - 30000).toISOString()
    }
  ];
  
  const currentSession = staticSession;
  const agents = staticAgents;
  const activities = staticActivities;
  const debateMessages = staticDebateMessages;
  const isLoading = false;
  const [autoRefresh, setAutoRefresh] = useState(false);

  // 静态演示：移除所有动态数据获取逻辑

  // 开始诊断（静态演示）
  const startDiagnosis = () => {
    alert('静态演示：诊断已开始');
    setAutoRefresh(true);
  };

  // 暂停诊断（静态演示）
  const pauseDiagnosis = () => {
    alert('静态演示：诊断已暂停');
    setAutoRefresh(false);
  };

  // 停止诊断（静态演示）
  const stopDiagnosis = () => {
    alert('静态演示：诊断已停止');
    setAutoRefresh(false);
  };

  // 刷新会话状态（静态演示）
  const refreshSession = () => {
    alert('静态演示：状态已刷新');
  };

  // 初始化会话（静态演示）
  const initializeSession = () => {
    alert('静态演示：会话已初始化');
  };

  // 静态演示：移除所有useEffect逻辑

  // 获取智能体图标
  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'fnirs': return <Brain className="h-5 w-5" />;
      case 'eeg': return <Activity className="h-5 w-5" />;
      case 'audio': return <Mic className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'coordinator': return <Users className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 获取辩论条目类型颜色
  const getDebateTypeColor = (type: string) => {
    switch (type) {
      case 'analysis': return 'text-blue-600 bg-blue-50';
      case 'debate': return 'text-orange-600 bg-orange-50';
      case 'consensus': return 'text-green-600 bg-green-50';
      case 'decision': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">诊断分析</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-gray-600">诊断ID: {id || 'demo-001'}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full bg-green-500`}></div>
                    <span className="text-sm text-gray-500">
                      实时连接
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshSession}
                  disabled={!currentSession || isLoading}
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  刷新
                </Button>
                {!currentSession && (
                  <Button
                    onClick={initializeSession}
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    创建会话
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 诊断控制 */}
          {currentSession && (
            <Card title="诊断控制" subtitle="控制诊断流程" className="mb-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  {currentSession.status === 'paused' ? (
                    <Button
                      onClick={startDiagnosis}
                      disabled={isLoading}
                      icon={<Play className="h-4 w-4" />}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {currentSession.status === 'paused' ? '继续诊断' : '开始诊断'}
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseDiagnosis}
                      disabled={isLoading}
                      icon={<Pause className="h-4 w-4" />}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      暂停诊断
                    </Button>
                  )}
                  
                  <Button
                    onClick={stopDiagnosis}
                    disabled={isLoading || currentSession.status === 'paused'}
                    icon={<Square className="h-4 w-4" />}
                    variant="danger"
                  >
                    停止诊断
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  {debateMessages.length > 0 && (
                    <Button
                      onClick={() => navigate(`/debate/${currentSession.id}`)}
                      icon={<MessageSquare className="h-4 w-4" />}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      观察辩论
                    </Button>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    会话ID: {currentSession.id.slice(0, 8)}
                  </div>
                  <StatusIndicator 
                    status={currentSession.status as any} 
                    label={`状态: ${currentSession.status}`}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* 整体进度 */}
          {currentSession && (
            <Card title="诊断进度" subtitle="当前诊断任务的整体进度" className="mb-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">整体进度</span>
                  <span className="text-sm text-gray-500">{Math.round(currentSession.progress)}%</span>
                </div>
                <ProgressBar progress={currentSession.progress} color="blue" size="lg" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {agents.filter(a => a.status === 'working').length}
                  </div>
                  <div className="text-sm text-gray-600">活跃智能体</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activities.filter(a => a.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">已完成分析</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {debateMessages.filter(d => d.message_type === 'argument' || d.message_type === 'counter_argument').length}
                  </div>
                  <div className="text-sm text-gray-600">辩论轮次</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {debateMessages.length > 0 ? Math.round(
                      debateMessages
                        .filter(d => d.confidence_score !== undefined)
                        .reduce((sum, d) => sum + (d.confidence_score || 0), 0) /
                      debateMessages.filter(d => d.confidence_score !== undefined).length || 0
                    ) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">平均置信度</div>
                </div>
              </div>
              
              {currentSession.created_at && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>开始时间: {new Date(currentSession.created_at).toLocaleTimeString()}</span>
                    {currentSession.updated_at && currentSession.status === 'completed' && (
                      <span>结束时间: {new Date(currentSession.updated_at).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* 智能体状态 */}
          {agents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {agents.map((agent) => {
                const getAgentColor = (type: string) => {
                  switch (type) {
                    case 'fnirs': return 'blue';
                    case 'eeg': return 'green';
                    case 'audio': return 'purple';
                    case 'video': return 'orange';
                    case 'coordinator': return 'indigo';
                    default: return 'gray';
                  }
                };
                
                const getAgentDescription = (type: string) => {
                  switch (type) {
                    case 'fnirs': return '血氧信号处理';
                    case 'eeg': return '脑电信号分析';
                    case 'audio': return '语音情感识别';
                    case 'video': return '面部表情识别';
                    case 'coordinator': return '多模态融合';
                    default: return '数据分析';
                  }
                };
                
                const color = getAgentColor(agent.type);
                
                // 获取该智能体的最新活动
                const latestActivity = activities
                  .filter(activity => activity.agent_id === agent.id)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                
                return (
                  <Card key={agent.id} title={agent.name} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                          <div className={`text-${color}-600`}>
                            {getAgentIcon(agent.type)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                          <p className="text-sm text-gray-600">{getAgentDescription(agent.type)}</p>
                        </div>
                      </div>
                      <StatusIndicator 
                        status={agent.status === 'working' ? 'running' : agent.status === 'error' ? 'error' : 'pending'} 
                        label={agent.status} 
                      />
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">进度</span>
                        <span className="text-xs text-gray-500">{Math.round(latestActivity?.progress || 0)}%</span>
                      </div>
                      <ProgressBar 
                        progress={latestActivity?.progress || 0} 
                        color={color as any} 
                        size="sm" 
                      />
                    </div>
                    
                    {agent.current_task && (
                      <p className="text-xs text-gray-500 mb-2">
                        当前任务: {agent.current_task}
                      </p>
                    )}
                    
                    {latestActivity?.activity_type && (
                      <p className="text-xs text-gray-500 mb-2">
                        活动类型: {latestActivity.activity_type}
                      </p>
                    )}
                    
                    {latestActivity?.output_data && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">输出结果:</p>
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                          {typeof latestActivity.output_data === 'string' 
                            ? latestActivity.output_data 
                            : JSON.stringify(latestActivity.output_data).slice(0, 100) + '...'}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-400">
                      更新: {new Date(agent.updated_at).toLocaleTimeString()}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}



          {/* 智能体辩论日志 */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
              智能体辩论日志
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
              {debateMessages.length > 0 ? (
                debateMessages
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((message) => {
                    const agent = agents.find(a => a.id === message.agent_id);
                    const agentColors = {
                      'fnirs': 'border-l-red-500 bg-red-50',
                      'eeg': 'border-l-blue-500 bg-blue-50',
                      'audio': 'border-l-green-500 bg-green-50',
                      'video': 'border-l-purple-500 bg-purple-50',
                      'coordinator': 'border-l-orange-500 bg-orange-50',
                      'prime': 'border-l-yellow-500 bg-yellow-50'
                    };
                    
                    const colorClass = agentColors[agent?.type as keyof typeof agentColors] || 'border-l-gray-500 bg-gray-50';
                    
                    return (
                      <div key={message.id} className={`border-l-4 p-3 rounded-r ${colorClass}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {agent?.name || '未知智能体'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              message.message_type === 'argument' ? 'bg-blue-100 text-blue-800' :
                              message.message_type === 'counter_argument' ? 'bg-purple-100 text-purple-800' :
                              message.message_type === 'consensus' ? 'bg-green-100 text-green-800' :
                              message.message_type === 'final_decision' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {message.message_type === 'argument' ? '论点' :
                               message.message_type === 'counter_argument' ? '反驳' :
                               message.message_type === 'consensus' ? '共识' :
                               message.message_type === 'final_decision' ? '决策' :
                               message.message_type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                        
                        {message.confidence_score !== undefined && (
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <span>置信度:</span>
                            <span className="font-mono">{message.confidence_score}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无辩论记录</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}