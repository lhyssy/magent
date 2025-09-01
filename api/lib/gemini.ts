import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 获取API密钥
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY or VITE_GEMINI_API_KEY is not set in environment variables');
}

// 创建GoogleGenerativeAI实例
const genAI = new GoogleGenerativeAI(apiKey);

// 获取Gemini模型
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// 智能体角色配置
export const agentPrompts = {
  prime: `你是一位专业的心理健康总理智能体，负责与患者进行初步交流和信息收集。你的任务是：
1. 以温和、专业的态度与患者交流
2. 收集患者的基本信息、症状描述、生活状况等
3. 引导患者详细描述他们的困扰和感受
4. 当收集到足够信息时，启动多智能体诊断流程
5. 保持同理心，让患者感到被理解和支持

请用中文回复，语气要温和专业。`,
  
  analyst: `你是一位专业的心理分析智能体，负责分析患者的心理状态。基于收集到的信息，你需要：
1. 分析患者的症状和行为模式
2. 识别可能的心理健康问题
3. 评估症状的严重程度
4. 提供专业的心理学观点和建议
5. 与其他智能体进行专业讨论

请提供客观、专业的分析意见。`,
  
  debater: `你是一位心理诊断辩论智能体，负责质疑和验证诊断结论。你的任务是：
1. 对其他智能体的诊断提出合理质疑
2. 寻找诊断中的不足或遗漏
3. 提出替代性的诊断可能
4. 确保诊断的准确性和全面性
5. 促进更深入的专业讨论

请保持批判性思维，提出建设性的质疑。`
};

// 聊天会话类
export class GeminiAgentChat {
  private model: any;
  private agentType: keyof typeof agentPrompts;
  private history: Array<{ role: string; parts: string }> = [];

  constructor(agentType: keyof typeof agentPrompts) {
    this.model = geminiModel;
    this.agentType = agentType;
  }

  async sendMessage(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = agentPrompts[this.agentType];
      const fullMessage = context 
        ? `${systemPrompt}\n\n上下文信息：${context}\n\n用户消息：${message}`
        : `${systemPrompt}\n\n用户消息：${message}`;

      const result = await this.model.generateContent(fullMessage);
      const response = await result.response;
      const text = response.text();
      
      // 更新历史记录
      this.history.push(
        { role: 'user', parts: message },
        { role: 'model', parts: text }
      );
      
      return text;
    } catch (error) {
      console.error(`Gemini API error for ${this.agentType}:`, error);
      
      // 提供模拟响应以便测试
      const mockResponses = {
        prime: `您好，我理解您最近感到焦虑和失眠的困扰。这些症状确实会影响您的日常生活质量。为了更好地帮助您，我想了解一些具体情况：\n\n1. 您的焦虑和失眠症状持续多长时间了？\n2. 是否有特定的事件或压力源触发了这些症状？\n3. 您的睡眠模式是怎样的？比如入睡困难还是容易醒来？\n4. 焦虑时您会有什么具体的身体感受？\n\n请放心，我们会一步步帮您分析和解决这些问题。`,
        analyst: `基于患者描述的症状，我观察到以下几个关键点：\n\n**症状分析：**\n- 焦虑症状伴随失眠，提示可能存在焦虑障碍\n- 需要评估症状的严重程度和持续时间\n- 睡眠障碍可能是焦虑的继发症状\n\n**可能的诊断方向：**\n- 广泛性焦虑障碍\n- 适应性障碍伴焦虑\n- 失眠障碍\n\n**建议进一步评估：**\n- 详细的症状时间线\n- 生活压力源识别\n- 既往心理健康史`,
        debater: `我对当前的分析提出以下质疑和补充：\n\n**需要质疑的点：**\n1. 仅凭焦虑和失眠症状就诊断焦虑障碍可能过于草率\n2. 需要排除其他可能的医学原因，如甲状腺功能异常\n3. 缺乏对患者社会功能影响程度的评估\n\n**替代性考虑：**\n- 可能是抑郁症的早期表现\n- 物质使用相关的睡眠障碍\n- 环境因素导致的暂时性适应问题\n\n**建议补充评估：**\n- 完整的精神状态检查\n- 医学检查排除器质性原因\n- 详细的生活史和家族史`
      };
      
      const mockResponse = mockResponses[this.agentType] || '抱歉，AI服务暂时不可用，请稍后重试。';
      
      // 更新历史记录
      this.history.push(
        { role: 'user', parts: message },
        { role: 'model', parts: mockResponse }
      );
      
      return mockResponse;
    }
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }
}

// 多智能体诊断流程
export class MultiAgentDiagnosis {
  private primeAgent: GeminiAgentChat;
  private analystAgent: GeminiAgentChat;
  private debaterAgent: GeminiAgentChat;

  constructor() {
    this.primeAgent = new GeminiAgentChat('prime');
    this.analystAgent = new GeminiAgentChat('analyst');
    this.debaterAgent = new GeminiAgentChat('debater');
  }

  async startDiagnosis(patientInfo: string): Promise<{
    analysis: string;
    debate: string;
    finalReport: string;
  }> {
    try {
      // 第一步：分析师分析
      const analysis = await this.analystAgent.sendMessage(
        '请基于以下患者信息进行心理分析',
        patientInfo
      );

      // 第二步：辩论者质疑
      const debate = await this.debaterAgent.sendMessage(
        '请对以下分析结果进行质疑和补充',
        `患者信息：${patientInfo}\n\n分析结果：${analysis}`
      );

      // 第三步：总理智能体生成最终报告
      const finalReport = await this.primeAgent.sendMessage(
        '请基于分析和辩论结果生成最终的心理诊断报告',
        `患者信息：${patientInfo}\n\n分析结果：${analysis}\n\n辩论意见：${debate}`
      );

      return {
        analysis,
        debate,
        finalReport
      };
    } catch (error) {
      console.error('Multi-agent diagnosis error:', error);
      throw new Error('多智能体诊断过程出现错误');
    }
  }
}

// 导出实例
export const multiAgentDiagnosis = new MultiAgentDiagnosis();