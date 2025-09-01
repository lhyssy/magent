import { supabase } from '../lib/supabase';

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  status: 'idle' | 'working' | 'completed' | 'error';
}

export interface AgentActivity {
  id: string;
  sessionId: string;
  agentId: string;
  activityType: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  inputData: any;
  outputData: any;
  startedAt: Date;
  completedAt?: Date;
}

class AgentManager {
  private agents: Map<string, Agent> = new Map();
  private wsService: any;

  constructor(wsService?: any) {
    this.wsService = wsService;
    this.initializeAgents();
  }

  private initializeAgents() {
    // 总理智能体 (Prime Agent)
    this.agents.set('prime-agent', {
      id: 'prime-agent',
      name: '总理智能体',
      role: 'coordinator',
      description: '负责与患者交互，收集信息，协调其他智能体工作',
      capabilities: ['对话管理', '信息收集', '流程协调', '决策制定'],
      status: 'idle'
    });

    // 数据分析智能体
    this.agents.set('data-analyst', {
      id: 'data-analyst',
      name: '数据分析智能体',
      role: 'analyst',
      description: '分析fNIRS、EEG等生理数据',
      capabilities: ['fNIRS数据分析', 'EEG信号处理', '生理指标提取', '异常检测'],
      status: 'idle'
    });

    // 心理评估智能体
    this.agents.set('psych-evaluator', {
      id: 'psych-evaluator',
      name: '心理评估智能体',
      role: 'evaluator',
      description: '基于心理学理论进行评估和诊断',
      capabilities: ['心理状态评估', '症状识别', '诊断建议', '风险评估'],
      status: 'idle'
    });

    // 多模态融合智能体
    this.agents.set('multimodal-fusion', {
      id: 'multimodal-fusion',
      name: '多模态融合智能体',
      role: 'integrator',
      description: '整合多种数据源进行综合分析',
      capabilities: ['数据融合', '特征提取', '模式识别', '综合评估'],
      status: 'idle'
    });

    // 辩论协调智能体
    this.agents.set('debate-coordinator', {
      id: 'debate-coordinator',
      name: '辩论协调智能体',
      role: 'moderator',
      description: '协调智能体间的辩论和讨论',
      capabilities: ['辩论管理', '观点整合', '共识达成', '决策支持'],
      status: 'idle'
    });
  }

  // 获取所有智能体
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  // 获取特定智能体
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  // 更新智能体状态
  updateAgentStatus(agentId: string, status: Agent['status']) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      this.agents.set(agentId, agent);
    }
  }

  // 启动智能体活动
  async startAgentActivity(
    sessionId: string,
    agentId: string,
    activityType: string,
    inputData: any = {}
  ): Promise<string | null> {
    try {
      // 更新智能体状态
      this.updateAgentStatus(agentId, 'working');

      // 记录活动到数据库
      const { data, error } = await supabase
        .from('agent_activities')
        .insert({
          session_id: sessionId,
          agent_id: agentId,
          activity_type: activityType,
          status: 'running',
          input_data: inputData
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to record agent activity:', error);
        return null;
      }

      // 通过WebSocket广播活动开始
      if (this.wsService) {
        this.wsService.broadcastToSession(sessionId, {
          type: 'agent_activity_started',
          data: {
            activityId: data.id,
            agentId,
            activityType,
            status: 'running'
          }
        });
      }

      // 模拟智能体工作
      this.simulateAgentWork(sessionId, data.id, agentId, activityType, inputData);

      return data.id;
    } catch (error) {
      console.error('Failed to start agent activity:', error);
      return null;
    }
  }

  // 模拟智能体工作过程
  private async simulateAgentWork(
    sessionId: string,
    activityId: string,
    agentId: string,
    activityType: string,
    inputData: any
  ) {
    // 模拟工作时间（2-8秒）
    const workDuration = Math.random() * 6000 + 2000;
    
    setTimeout(async () => {
      try {
        // 生成模拟输出数据
        const outputData = this.generateMockOutput(agentId, activityType, inputData);

        // 更新活动状态
        const { error } = await supabase
          .from('agent_activities')
          .update({
            status: 'completed',
            output_data: outputData,
            completed_at: new Date().toISOString()
          })
          .eq('id', activityId);

        if (error) {
          console.error('Failed to update agent activity:', error);
          return;
        }

        // 更新智能体状态
        this.updateAgentStatus(agentId, 'completed');

        // 通过WebSocket广播活动完成
        if (this.wsService) {
          this.wsService.broadcastToSession(sessionId, {
            type: 'agent_activity_completed',
            data: {
              activityId,
              agentId,
              activityType,
              status: 'completed',
              outputData
            }
          });
        }

        // 检查是否需要启动辩论
        if (activityType === 'diagnosis' && Math.random() > 0.3) {
          setTimeout(() => {
            this.initiateDebate(sessionId, '诊断结果存在分歧，需要进一步讨论');
          }, 1000);
        }

      } catch (error) {
        console.error('Agent work simulation failed:', error);
        this.updateAgentStatus(agentId, 'error');
      }
    }, workDuration);
  }

  // 生成模拟输出数据
  private generateMockOutput(agentId: string, activityType: string, inputData: any): any {
    const agent = this.agents.get(agentId);
    if (!agent) return {};

    switch (agentId) {
      case 'prime-agent':
        return {
          message: '已完成患者信息收集，准备启动诊断流程',
          nextSteps: ['数据分析', '心理评估', '多模态融合'],
          confidence: 0.85
        };

      case 'data-analyst':
        return {
          analysis: {
            fnirs: {
              oxygenation: Math.random() * 0.3 + 0.4,
              activation_regions: ['前额叶皮层', '颞叶'],
              anomalies: Math.random() > 0.7 ? ['异常激活模式'] : []
            },
            eeg: {
              alpha_power: Math.random() * 20 + 8,
              beta_power: Math.random() * 15 + 12,
              theta_power: Math.random() * 10 + 4,
              asymmetry_index: Math.random() * 0.4 - 0.2
            }
          },
          conclusion: '检测到轻度异常脑活动模式',
          confidence: Math.random() * 0.3 + 0.6
        };

      case 'psych-evaluator':
        return {
          assessment: {
            mood_state: ['轻度抑郁', '焦虑倾向'],
            cognitive_function: '正常范围',
            risk_factors: ['睡眠质量差', '工作压力大'],
            protective_factors: ['社会支持良好', '治疗依从性高']
          },
          diagnosis_suggestion: '轻度抑郁症，伴焦虑症状',
          confidence: Math.random() * 0.2 + 0.7
        };

      case 'multimodal-fusion':
        return {
          integrated_analysis: {
            physiological_score: Math.random() * 40 + 30,
            psychological_score: Math.random() * 35 + 25,
            behavioral_score: Math.random() * 30 + 35,
            overall_score: Math.random() * 25 + 45
          },
          fusion_result: '多模态数据显示中等程度心理健康风险',
          recommendations: ['认知行为治疗', '药物治疗评估', '生活方式调整'],
          confidence: Math.random() * 0.2 + 0.75
        };

      default:
        return {
          result: `${agent.name}完成了${activityType}任务`,
          timestamp: new Date().toISOString()
        };
    }
  }

  // 启动辩论
  private async initiateDebate(sessionId: string, topic: string) {
    try {
      const participants = ['psych-evaluator', 'data-analyst', 'multimodal-fusion'];
      
      // 创建辩论会话
      const { data, error } = await supabase
        .from('debate_sessions')
        .insert({
          demo_session_id: sessionId,
          topic,
          participants,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create debate session:', error);
        return;
      }

      // 通过WebSocket广播辩论开始
      if (this.wsService) {
        this.wsService.broadcastToSession(sessionId, {
          type: 'debate_initiated',
          data: {
            debateId: data.id,
            topic,
            participants
          }
        });
      }

      // 模拟辩论过程
      this.simulateDebate(sessionId, data.id, participants);

    } catch (error) {
      console.error('Failed to initiate debate:', error);
    }
  }

  // 模拟辩论过程
  private async simulateDebate(sessionId: string, debateId: string, participants: string[]) {
    const debateMessages = [
      { agent: 'psych-evaluator', type: 'argument', content: '基于心理评估结果，患者表现出明显的抑郁症状，建议优先考虑抑郁症诊断。' },
      { agent: 'data-analyst', type: 'counter', content: '但是生理数据显示焦虑相关的脑区激活更为明显，可能焦虑是主要问题。' },
      { agent: 'multimodal-fusion', type: 'evidence', content: '综合多模态数据分析，患者同时存在抑郁和焦虑症状，建议诊断为混合性焦虑抑郁障碍。' },
      { agent: 'psych-evaluator', type: 'argument', content: '从临床表现来看，抑郁症状更为突出，焦虑可能是继发性的。' },
      { agent: 'data-analyst', type: 'evidence', content: '最新的脑电数据分析支持焦虑为主要诊断的观点。' },
      { agent: 'multimodal-fusion', type: 'conclusion', content: '经过综合分析，建议最终诊断为：主要抑郁障碍，伴焦虑症状。' }
    ];

    for (let i = 0; i < debateMessages.length; i++) {
      setTimeout(async () => {
        const message = debateMessages[i];
        
        // 插入辩论消息
        const { data, error } = await supabase
          .from('debate_messages')
          .insert({
            debate_session_id: debateId,
            agent_id: message.agent,
            content: message.content,
            message_type: message.type,
            supporting_data: {}
          })
          .select()
          .single();

        if (!error && this.wsService) {
          this.wsService.broadcastToSession(sessionId, {
            type: 'debate_message',
            data
          });
        }

        // 如果是最后一条消息，结束辩论
        if (i === debateMessages.length - 1) {
          setTimeout(async () => {
            await supabase
              .from('debate_sessions')
              .update({
                status: 'completed',
                ended_at: new Date().toISOString(),
                conclusion: {
                  final_diagnosis: '主要抑郁障碍，伴焦虑症状',
                  confidence: 0.82,
                  consensus_reached: true
                }
              })
              .eq('id', debateId);

            if (this.wsService) {
              this.wsService.broadcastToSession(sessionId, {
                type: 'debate_concluded',
                data: {
                  debateId,
                  conclusion: {
                    final_diagnosis: '主要抑郁障碍，伴焦虑症状',
                    confidence: 0.82,
                    consensus_reached: true
                  }
                }
              });
            }
          }, 2000);
        }
      }, (i + 1) * 3000); // 每3秒发送一条消息
    }
  }

  // 生成总理智能体回复
  async generatePrimeAgentResponse(sessionId: string, userMessage: string): Promise<string> {
    // 模拟智能体思考时间
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // 基于用户消息生成回复
    const responses = {
      greeting: [
        '您好！我是您的专属心理健康助手。我将协助您完成心理健康评估。请告诉我，您今天感觉如何？',
        '欢迎来到多智能体心理诊断系统！我会全程陪伴您完成评估过程。您可以放心地与我分享您的感受。'
      ],
      mood: [
        '感谢您的分享。为了更好地了解您的情况，我需要收集一些生理数据。请准备上传您的fNIRS或EEG数据文件。',
        '我理解您的感受。接下来，我们需要一些客观的生理指标来辅助诊断。您可以上传相关的检测数据吗？'
      ],
      data_uploaded: [
        '很好！我已经收到您的数据。现在我的团队智能体们将开始分析这些信息。请稍等片刻。',
        '数据上传成功！我正在调动专业的分析智能体来处理您的数据，这可能需要几分钟时间。'
      ],
      analysis_complete: [
        '分析完成！根据多智能体协作分析的结果，我们有了初步的评估。您想了解详细的诊断报告吗？',
        '我的团队已经完成了综合分析。结果显示需要进一步的专业讨论，我们正在启动智能体辩论系统。'
      ],
      default: [
        '我明白了。请继续告诉我更多关于您的情况，这将帮助我们提供更准确的评估。',
        '感谢您的信任。每一个细节都很重要，请继续分享您的感受和经历。',
        '我在认真倾听。您的感受对我们的诊断非常重要，请不要有任何顾虑。'
      ]
    };

    // 简单的关键词匹配来选择回复类型
    let responseType = 'default';
    const message = userMessage.toLowerCase();
    
    if (message.includes('你好') || message.includes('hello') || message.includes('hi')) {
      responseType = 'greeting';
    } else if (message.includes('心情') || message.includes('感觉') || message.includes('情绪')) {
      responseType = 'mood';
    } else if (message.includes('上传') || message.includes('数据') || message.includes('文件')) {
      responseType = 'data_uploaded';
    }

    const responseList = responses[responseType as keyof typeof responses];
    return responseList[Math.floor(Math.random() * responseList.length)];
  }
}

export default AgentManager;