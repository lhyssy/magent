import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  Brain, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface DiagnosisStatus {
  status: 'pending' | 'diagnosing' | 'completed' | 'failed';
  updated_at: string;
  diagnosis_result?: {
    analysis_result: string;
    debate_result: string;
    final_report: string;
    created_at: string;
  };
}

interface AgentActivity {
  id: string;
  agent: string;
  action: string;
  timestamp: Date;
  status: 'active' | 'completed' | 'waiting';
}

// 静态诊断状态数据
const staticDiagnosisStatus: DiagnosisStatus = {
  status: 'completed',
  updated_at: '2024-01-15T09:15:00Z',
  diagnosis_result: {
    analysis_result: '患者表现出明显的焦虑症状，包括工作压力导致的失眠和注意力不集中',
    debate_result: '经过多轮辩论验证，诊断结果具有较高可信度',
    final_report: '综合分析建议进行认知行为治疗和压力管理训练',
    created_at: '2024-01-15T09:15:00Z'
  }
};

// 静态智能体活动数据
const staticAgentActivities: AgentActivity[] = [
  {
    id: '1',
    agent: '总理智能体',
    action: '收集患者信息完成',
    timestamp: new Date('2024-01-15T09:05:00'),
    status: 'completed'
  },
  {
    id: '2',
    agent: '分析师智能体',
    action: '心理分析完成',
    timestamp: new Date('2024-01-15T09:08:00'),
    status: 'completed'
  },
  {
    id: '3',
    agent: '辩论智能体',
    action: '诊断辩论和验证完成',
    timestamp: new Date('2024-01-15T09:12:00'),
    status: 'completed'
  },
  {
    id: '4',
    agent: '总理智能体',
    action: '最终诊断报告生成完成',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'completed'
  }
];

export default function Monitor() {
  const navigate = useNavigate();
  const sessionId = 'demo-session-12345';
  
  const [diagnosisStatus] = useState<DiagnosisStatus>(staticDiagnosisStatus);
  const [agentActivities] = useState<AgentActivity[]>(staticAgentActivities);
  const isLoading = false;
  const error = null;

  // 静态演示：移除所有动态数据获取逻辑

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'diagnosing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case '总理智能体':
        return <Brain className="h-4 w-4" />;
      case '分析师智能体':
        return <MessageSquare className="h-4 w-4" />;
      case '辩论智能体':
        return <FileText className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const viewReport = () => {
    navigate(`/report?session=${sessionId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">加载诊断状态...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card title="错误" subtitle="无法获取诊断状态">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/chat')}
                >
                  重新开始对话
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">诊断监控</h1>
            <p className="text-gray-600">实时观察多智能体协作诊断过程</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 诊断状态概览 */}
            <div className="lg:col-span-2">
              <Card title="诊断进度" subtitle="多智能体协作状态">
                <div className="space-y-4">
                  {/* 整体状态 */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(diagnosisStatus.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {diagnosisStatus.status === 'completed' && '诊断完成'}
                          {diagnosisStatus.status === 'diagnosing' && '诊断进行中'}
                          {diagnosisStatus.status === 'pending' && '等待开始'}
                          {diagnosisStatus.status === 'failed' && '诊断失败'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          会话ID: {sessionId.slice(-8)}
                        </p>
                      </div>
                    </div>
                    {diagnosisStatus.status === 'completed' && (
                      <Button
                        variant="primary"
                        icon={<ArrowRight className="h-4 w-4" />}
                        onClick={viewReport}
                      >
                        查看报告
                      </Button>
                    )}
                  </div>

                  {/* 智能体活动时间线 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">智能体活动时间线</h4>
                    <div className="space-y-3">
                      {agentActivities.map((activity, index) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                            activity.status === 'active' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {getAgentIcon(activity.agent)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{activity.agent}</span>
                              {activity.status === 'active' && (
                                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                              )}
                              {activity.status === 'completed' && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{activity.action}</p>
                            <p className="text-xs text-gray-400">
                              {activity.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 侧边栏信息 */}
            <div className="space-y-4">
              <Card title="诊断流程" subtitle="多智能体协作步骤">
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">1. 信息收集</h4>
                    <p className="text-blue-600">总理智能体收集患者基本信息和症状描述</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-1">2. 专业分析</h4>
                    <p className="text-purple-600">分析师智能体进行深度心理状态分析</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-1">3. 诊断辩论</h4>
                    <p className="text-orange-600">辩论智能体质疑和验证诊断结论</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">4. 报告生成</h4>
                    <p className="text-green-600">总理智能体整合结果生成最终报告</p>
                  </div>
                </div>
              </Card>

              <Card title="技术指标" subtitle="系统性能监控">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI响应时间</span>
                    <span className="text-green-600 font-medium">&lt; 3秒</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">智能体状态</span>
                    <span className="text-blue-600 font-medium">正常</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">数据同步</span>
                    <span className="text-green-600 font-medium">实时</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">诊断准确率</span>
                    <span className="text-blue-600 font-medium">95%+</span>
                  </div>
                </div>
              </Card>

              <Card title="操作选项" subtitle="可执行的操作">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/chat')}
                    className="w-full justify-start"
                  >
                    返回对话
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/debate')}
                    className="w-full justify-start"
                  >
                    观察辩论过程
                  </Button>
                  {diagnosisStatus.status === 'completed' && (
                    <Button
                      variant="primary"
                      onClick={viewReport}
                      className="w-full justify-start"
                    >
                      查看诊断报告
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}