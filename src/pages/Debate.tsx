import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, Users, Brain, Crown,
  Play, Pause, Square, Clock, TrendingUp, 
  BarChart3, PieChart, CheckCircle, AlertCircle,
  Zap, Target, Shield, Heart
} from 'lucide-react';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// 数据接口定义
interface DebateSession {
  id: string;
  demo_session_id: string;
  topic: string;
  participants: string[];
  status: 'active' | 'completed' | 'terminated';
  conclusion: any;
  started_at: string;
  ended_at?: string;
}

interface DebateMessage {
  id: string;
  debate_session_id: string;
  agent_id: string;
  content: string;
  message_type: 'argument' | 'counter' | 'evidence' | 'conclusion';
  supporting_data: any;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  avatar?: string;
}

// 智能体配置
const agentConfig = {
  prime: { name: '总理智能体', icon: Crown, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  fnirs: { name: 'fNIRS分析师', icon: Brain, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  eeg: { name: 'EEG分析师', icon: Zap, color: 'text-green-600 bg-green-50 border-green-200' },
  psychology: { name: '心理评估师', icon: Heart, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  diagnosis: { name: '综合诊断师', icon: Target, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  quality: { name: '质量控制师', icon: Shield, color: 'text-gray-600 bg-gray-50 border-gray-200' }
};

// 消息类型配置
const messageTypeConfig = {
  argument: { name: '论点', color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
  counter: { name: '反驳', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  evidence: { name: '证据', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  conclusion: { name: '结论', color: 'bg-purple-100 text-purple-800', icon: TrendingUp }
};

export default function Debate() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 状态管理
  const [debateSession, setDebateSession] = useState<DebateSession | null>(null);
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedMessageType, setSelectedMessageType] = useState<string>('all');

  // 获取辩论会话信息
  const fetchDebateSession = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('debate_sessions')
        .select('*')
        .eq('demo_session_id', sessionId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('获取辩论会话失败:', error);
        return;
      }
      
      setDebateSession(data);
    } catch (error) {
      console.error('获取辩论会话失败:', error);
    }
  };

  // 获取辩论消息
  const fetchDebateMessages = async () => {
    if (!debateSession?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('debate_messages')
        .select('*')
        .eq('debate_session_id', debateSession.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('获取辩论消息失败:', error);
        return;
      }
      
      setDebateMessages(data || []);
    } catch (error) {
      console.error('获取辩论消息失败:', error);
    }
  };

  // 获取智能体信息
  const fetchAgents = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('session_id', sessionId);
      
      if (error) {
        console.error('获取智能体信息失败:', error);
        return;
      }
      
      setAgents(data || []);
    } catch (error) {
      console.error('获取智能体信息失败:', error);
    }
  };

  // 启动辩论
  const startDebate = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/demo/debate/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          topic: '患者诊断结果分析',
          participants: ['fnirs', 'eeg', 'psychology', 'diagnosis']
        }),
      });
      
      if (response.ok) {
        toast.success('辩论已启动');
        await fetchDebateSession();
      } else {
        toast.error('启动辩论失败');
      }
    } catch (error) {
      console.error('启动辩论失败:', error);
      toast.error('启动辩论失败');
    }
  };

  // 暂停辩论
  const pauseDebate = async () => {
    if (!debateSession?.id) return;
    
    try {
      const { error } = await supabase
        .from('debate_sessions')
        .update({ status: 'terminated' })
        .eq('id', debateSession.id);
      
      if (error) {
        toast.error('暂停辩论失败');
        return;
      }
      
      toast.success('辩论已暂停');
      await fetchDebateSession();
    } catch (error) {
      console.error('暂停辩论失败:', error);
      toast.error('暂停辩论失败');
    }
  };

  // 结束辩论
  const endDebate = async () => {
    if (!debateSession?.id) return;
    
    try {
      const { error } = await supabase
        .from('debate_sessions')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString(),
          conclusion: { summary: '辩论已手动结束' }
        })
        .eq('id', debateSession.id);
      
      if (error) {
        toast.error('结束辩论失败');
        return;
      }
      
      toast.success('辩论已结束');
      await fetchDebateSession();
    } catch (error) {
      console.error('结束辩论失败:', error);
      toast.error('结束辩论失败');
    }
  };

  // 刷新数据
  const refreshData = async () => {
    await Promise.all([
      fetchDebateSession(),
      fetchAgents()
    ]);
  };

  // 初始化
  useEffect(() => {
    const initializeDebate = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    
    if (sessionId) {
      initializeDebate();
    }
  }, [sessionId]);

  // 获取辩论消息
  useEffect(() => {
    if (debateSession?.id) {
      fetchDebateMessages();
    }
  }, [debateSession?.id]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || debateSession?.status !== 'active') return;
    
    const interval = setInterval(() => {
      fetchDebateMessages();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, debateSession?.status, debateSession?.id]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debateMessages]);

  // 过滤消息
  const filteredMessages = debateMessages.filter(message => {
    const agentMatch = selectedAgent === 'all' || message.agent_id === selectedAgent;
    const typeMatch = selectedMessageType === 'all' || message.message_type === selectedMessageType;
    return agentMatch && typeMatch;
  });

  // 统计数据
  const stats = {
    totalMessages: debateMessages.length,
    participantCount: new Set(debateMessages.map(m => m.agent_id)).size,
    argumentCount: debateMessages.filter(m => m.message_type === 'argument').length,
    evidenceCount: debateMessages.filter(m => m.message_type === 'evidence').length,
    conclusionCount: debateMessages.filter(m => m.message_type === 'conclusion').length
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载辩论数据中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/monitor/${sessionId}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>返回监控</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">智能体辩论观察</h1>
              <p className="text-gray-600">实时观察智能体间的辩论过程和观点交锋</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                debateSession?.status === 'active' ? 'bg-green-500 animate-pulse' :
                debateSession?.status === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium">
                {debateSession?.status === 'active' ? '辩论进行中' :
                 debateSession?.status === 'completed' ? '辩论已完成' : '等待开始'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：辩论控制和统计 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 辩论控制 */}
            <Card title="辩论控制">
              <div className="space-y-4">
                {!debateSession ? (
                  <Button
                    onClick={startDebate}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>启动辩论</span>
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {debateSession.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={pauseDebate}
                          className="w-full flex items-center justify-center space-x-2"
                        >
                          <Pause className="h-4 w-4" />
                          <span>暂停辩论</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={endDebate}
                          className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Square className="h-4 w-4" />
                          <span>结束辩论</span>
                        </Button>
                      </>
                    )}
                    
                    {debateSession.status === 'completed' && (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">辩论已完成</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">自动刷新</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* 辩论统计 */}
            <Card title="辩论统计">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                    <div className="text-xs text-gray-500">总消息数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.participantCount}</div>
                    <div className="text-xs text-gray-500">参与智能体</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">论点</span>
                    <span className="text-sm font-medium">{stats.argumentCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">证据</span>
                    <span className="text-sm font-medium">{stats.evidenceCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">结论</span>
                    <span className="text-sm font-medium">{stats.conclusionCount}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 过滤器 */}
            <Card title="消息过滤">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">智能体</label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">全部智能体</option>
                    {Object.entries(agentConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">消息类型</label>
                  <select
                    value={selectedMessageType}
                    onChange={(e) => setSelectedMessageType(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">全部类型</option>
                    {Object.entries(messageTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* 右侧：辩论消息 */}
          <div className="lg:col-span-3">
            <Card title="辩论过程">
              <div className="h-96 overflow-y-auto border rounded-lg bg-gray-50 p-4">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无辩论消息</p>
                    {!debateSession && (
                      <p className="text-sm text-gray-400 mt-2">点击"启动辩论"开始智能体辩论</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMessages.map((message) => {
                      const agentInfo = agentConfig[message.agent_id as keyof typeof agentConfig];
                      const messageTypeInfo = messageTypeConfig[message.message_type];
                      const AgentIcon = agentInfo?.icon || Users;
                      const MessageIcon = messageTypeInfo?.icon || MessageSquare;
                      
                      return (
                        <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm border">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${agentInfo?.color || 'bg-gray-100'}`}>
                              <AgentIcon className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">
                                    {agentInfo?.name || message.agent_id}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${messageTypeInfo?.color}`}>
                                    <MessageIcon className="h-3 w-3 mr-1" />
                                    {messageTypeInfo?.name}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatTime(message.created_at)}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {message.content}
                              </p>
                              
                              {message.supporting_data && Object.keys(message.supporting_data).length > 0 && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="text-xs font-medium text-gray-600 mb-1">支持数据：</div>
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                    {JSON.stringify(message.supporting_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}