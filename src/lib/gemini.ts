import { GoogleGenerativeAI } from '@google/generative-ai';

// 获取API密钥
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
}

// 创建GoogleGenerativeAI实例
const genAI = new GoogleGenerativeAI(apiKey);

// 获取Gemini Pro模型
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

// 总理智能体系统提示词
const PRIME_AGENT_PROMPT = `你是一位专业的心理健康总理智能体，负责与患者进行初步交流和信息收集。你的任务是：

1. 以温和、专业的态度与患者交流
2. 收集患者的基本信息、症状描述、生活状况等
3. 引导患者详细描述他们的困扰和感受
4. 当收集到足够信息时，在回复末尾添加 [READY_FOR_DIAGNOSIS] 标记
5. 保持同理心，让患者感到被理解和支持

请用中文回复，语气要温和专业。当你认为已经收集到足够的信息可以进行多智能体诊断时，请在回复的最后添加 [READY_FOR_DIAGNOSIS] 标记。`;

// 聊天会话类
export class GeminiChat {
  private chat: any;
  private history: Array<{ role: string; parts: [{ text: string }] }> = [];
  private isInitialized = false;

  constructor() {
    this.initChat();
  }

  private initChat() {
    // 添加系统提示词到历史记录开头
    this.history = [
      { role: 'user', parts: [{ text: '请介绍你的角色和功能' }] },
      { role: 'model', parts: [{ text: PRIME_AGENT_PROMPT }] }
    ];
    
    this.chat = geminiModel.startChat({
      history: this.history,
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.7,
      },
    });
    
    this.isInitialized = true;
  }

  async sendMessage(message: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        this.initChat();
      }
      
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      
      // 更新历史记录
      this.history.push(
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text: text }] }
      );
      
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('AI服务暂时不可用，请稍后重试');
    }
  }

  // 检查是否准备好进行诊断
  isReadyForDiagnosis(response: string): boolean {
    return response.includes('[READY_FOR_DIAGNOSIS]');
  }

  // 获取对话上下文（用于诊断）
  getConversationContext(): string {
    return this.history
      .filter(msg => msg.role === 'user')
      .map(msg => msg.parts[0].text)
      .join('\n\n');
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    this.initChat();
  }
}

// 导出默认实例
export const geminiChat = new GeminiChat();