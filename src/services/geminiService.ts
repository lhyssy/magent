import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDg0vQOGQvsJjchmRYS3yKHjFL3qVMPHdI';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AgentTask {
  agentId: string;
  agentName: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export interface ChiefAgentResponse {
  message: string;
  needsMoreInfo: boolean;
  questions?: string[];
  agentTasks?: AgentTask[];
  diagnosis?: string;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  private conversationHistory: { role: string; content: string }[] = [];
  private userInfo: Record<string, any> = {};

  async sendMessage(userMessage: string, fileInfo?: any): Promise<ChiefAgentResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const conversationHistory = this.formatConversationHistory();
      
      // 构建对话内容数组
      const contents = [];
      
      // 添加系统指令（如果支持）
      if (systemPrompt) {
        contents.push({
          role: "user",
          parts: [{ text: systemPrompt }]
        });
      }
      
      // 添加对话历史
      this.conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
      
      // 构建当前用户消息
      let currentMessage = userMessage;
      if (fileInfo) {
        currentMessage += `\n\n用户上传了文件信息：${JSON.stringify(fileInfo)}`;
      }
      
      contents.push({
        role: "user",
        parts: [{ text: currentMessage }]
      });

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent({
        contents: contents
      });
      const response = await result.response;
      const text = response.text();

      // 尝试解析JSON响应
      let parsedResponse: ChiefAgentResponse;
      try {
        // 清理可能的markdown格式
        const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
        parsedResponse = JSON.parse(cleanText);
        
        // 确保agentTasks存在
        if (!parsedResponse.agentTasks) {
          parsedResponse.agentTasks = this.generateDefaultAgentTasks(userMessage, fileInfo ? true : false, fileInfo ? ['file'] : []);
        }
      } catch (e) {
        console.error('JSON解析失败:', e, '原始文本:', text);
        // 如果解析失败，创建一个智能的默认响应
        parsedResponse = this.createIntelligentResponse(userMessage, fileInfo ? true : false, fileInfo ? ['file'] : [], text);
      }

      // 添加AI回复到历史记录
      this.conversationHistory.push({ role: 'assistant', content: parsedResponse.message });

      // 更新用户信息
      this.extractUserInfo(userMessage);

      return parsedResponse;
    } catch (error) {
      console.error('Gemini API调用失败:', error);
      return this.createErrorResponse();
    }
  }

  private buildSystemPrompt(): string {
    return `你是连心智诊师智能诊疗助手的首席智能体，负责协调多个专业智能体团队为用户提供全面的健康分析和建议。

## 核心使命
你的主要职责是：
1. 理解用户的健康问题和需求
2. 智能调度相应的专业智能体
3. 提供初步的专业建议
4. 引导用户提供更多有用信息

## 智能交互策略

### 首次访问场景
- 热情欢迎用户使用连心智诊师系统
- 简要介绍系统的专业能力（EEG分析、fNIRS检测、音频分析、视频分析、图像分析等）
- 主动询问用户的主要健康关注点
- 建议用户上传相关的生理数据文件

### 健康问题咨询
- 仔细分析用户描述的症状
- 提出专业的后续问题来收集关键信息
- 根据症状类型智能调度相关专家：
  * 神经系统问题 → EEG分析师
  * 认知/注意力问题 → fNIRS分析师  
  * 语音/听觉问题 → 音频分析师
  * 行为/运动问题 → 视频分析师
  * 医学影像问题 → 图像分析师

### 数据上传场景
- 立即感谢用户的配合
- 根据文件类型调度对应的专家智能体
- 说明分析过程和预期时间
- 提供数据质量优化建议

### 进度查询场景
- 及时更新各智能体的工作状态
- 提供阶段性分析结果
- 预告下一步的分析计划

## 专业数据收集指导

根据用户症状，主动建议收集以下数据：

**神经系统症状**（头痛、癫痫、认知障碍）：
- EEG脑电图数据（.edf, .bdf格式）
- 详细的症状发作时间和频率
- 用药历史和效果

**认知注意力问题**（注意力不集中、学习困难）：
- fNIRS近红外光谱数据
- 认知任务表现记录
- 日常生活中的具体表现

**语音听觉问题**（语言障碍、听力问题）：
- 音频记录（语音清晰度分析）
- 听力测试结果
- 语言表达能力评估

**行为运动问题**（运动障碍、行为异常）：
- 视频记录（行为模式分析）
- 运动功能评估
- 日常活动表现记录

**医学影像问题**（影像学检查）：
- 医学图像文件
- 影像学报告
- 病变区域标注

## 数据质量优化建议

**EEG数据**：
- 确保电极接触良好，阻抗<5kΩ
- 记录时长建议≥10分钟
- 避免眼动、肌电等伪迹
- 标注特殊事件（如症状发作）

**fNIRS数据**：
- 确保光极与头皮良好接触
- 避免头发遮挡影响信号
- 记录任务执行的具体时间点
- 控制环境光线干扰

**音频数据**：
- 使用高质量录音设备
- 确保环境安静，信噪比高
- 录音时长建议3-5分钟
- 包含自然对话和朗读内容

**视频数据**：
- 确保光线充足，画面清晰
- 保持稳定的拍摄角度
- 记录时长建议5-10分钟
- 包含不同的行为状态

**图像数据**：
- 确保图像清晰度和分辨率
- 避免过度曝光或欠曝光
- 保持适当的拍摄距离和角度
- 标注关键区域或异常部位

## 重要：响应格式要求

你必须始终严格按照以下JSON格式回复，不能有任何偏差：

{
  "message": "你的专业回复内容（字符串）",
  "needsMoreInfo": true或false（布尔值）,
  "questions": ["问题1", "问题2"],
  "agentTasks": [
    {
      "agentId": "智能体ID（字符串）",
      "agentName": "智能体名称（字符串）",
      "task": "具体任务描述（字符串）",
      "priority": "high或medium或low（字符串）",
      "estimatedTime": "预估完成时间（字符串）"
    }
  ],
  "diagnosis": "基于当前信息的专业分析或建议（字符串）"
}

注意：
1. 必须返回有效的JSON格式
2. 所有字段都必须存在
3. agentTasks数组至少包含一个任务
4. 字符串字段不能为null，如果没有信息则使用空字符串
5. 数组字段不能为null，如果没有内容则使用空数组
6. agentId必须从以下列表中选择：eeg-analyst, fnirs-analyst, audio-analyst, video-analyst, image-analyst, coordinator

## 核心行为准则

1. **专业性**：始终保持医疗专业水准，使用准确的医学术语
2. **主动性**：主动询问关键信息，不等待用户完全描述
3. **协调性**：展现团队协调能力，合理分配智能体任务
4. **同理心**：理解用户的担忧，提供情感支持
5. **实用性**：提供具体可行的建议和指导
6. **安全性**：强调专业医疗建议的重要性，不替代医生诊断

记住：你是用户健康管理的智能伙伴，要展现出专业、可靠、主动的特质！

## 当前用户信息
${JSON.stringify(this.userInfo, null, 2)}`;
  }

  private formatConversationHistory(): string {
    return this.conversationHistory
      .map(msg => `${msg.role === 'user' ? '用户' : '总代理'}：${msg.content}`)
      .join('\n');
  }

  private extractUserInfo(userMessage: string): void {
    // 简单的信息提取逻辑，可以根据需要扩展
    const lowerMessage = userMessage.toLowerCase();
    
    // 提取年龄信息
    const ageMatch = userMessage.match(/(\d+)岁|年龄(\d+)/);
    if (ageMatch) {
      this.userInfo.age = ageMatch[1] || ageMatch[2];
    }

    // 提取性别信息
    if (lowerMessage.includes('男') || lowerMessage.includes('先生')) {
      this.userInfo.gender = '男';
    } else if (lowerMessage.includes('女') || lowerMessage.includes('女士')) {
      this.userInfo.gender = '女';
    }

    // 提取症状信息
    const symptoms = ['头痛', '失眠', '焦虑', '抑郁', '记忆力下降', '注意力不集中', '疲劳'];
    symptoms.forEach(symptom => {
      if (lowerMessage.includes(symptom)) {
        if (!this.userInfo.symptoms) this.userInfo.symptoms = [];
        if (!this.userInfo.symptoms.includes(symptom)) {
          this.userInfo.symptoms.push(symptom);
        }
      }
    });
  }

  private generateDefaultAgentTasks(userMessage: string, hasFiles: boolean, fileTypes: string[]): AgentTask[] {
    const tasks: AgentTask[] = [];
    
    if (hasFiles) {
      // 根据文件类型分配任务
      if (fileTypes.some(type => type.includes('audio') || type.includes('wav') || type.includes('mp3'))) {
        tasks.push({
          agentId: 'audio-analyst',
          agentName: '音频分析师',
          task: '分析用户上传的音频文件，提取语音特征、情绪指标和语言模式',
          priority: 'high',
          estimatedTime: '5-10分钟'
        });
      }
      
      if (fileTypes.some(type => type.includes('video') || type.includes('mp4') || type.includes('avi'))) {
        tasks.push({
          agentId: 'video-analyst',
          agentName: '视频分析师',
          task: '分析用户上传的视频文件，评估行为模式、面部表情和肢体语言',
          priority: 'high',
          estimatedTime: '10-15分钟'
        });
      }
      
      if (fileTypes.some(type => type.includes('eeg') || type.includes('脑电'))) {
        tasks.push({
          agentId: 'eeg-analyst',
          agentName: 'EEG分析师',
          task: '处理脑电图数据，分析脑波模式和神经活动指标',
          priority: 'high',
          estimatedTime: '15-20分钟'
        });
      }
      
      if (fileTypes.some(type => type.includes('fnirs') || type.includes('近红外'))) {
        tasks.push({
          agentId: 'fnirs-analyst',
          agentName: 'fNIRS分析师',
          task: '分析功能性近红外光谱数据，评估大脑血氧变化和激活模式',
          priority: 'high',
          estimatedTime: '15-20分钟'
        });
      }
    }
    
    // 根据文件类型添加图像分析师
    if (fileTypes.some(type => type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('jpeg'))) {
      tasks.push({
        agentId: 'image-analyst',
        agentName: '图像分析师',
        task: '分析用户上传的图像文件，提取视觉特征和医学影像信息',
        priority: 'high',
        estimatedTime: '8-12分钟'
      });
    }
    
    return tasks;
  }

  private createIntelligentResponse(userMessage: string, hasFiles: boolean, fileTypes: string[], originalText: string): ChiefAgentResponse {
    let message = '';
    
    if (hasFiles && fileTypes.length > 0) {
      message = `感谢您上传的${fileTypes.join('、')}文件！我已经立即调度我的专家团队开始分析。`;
    } else {
      message = '我已经收到您的信息，正在调度专家团队进行分析。';
    }
    
    return {
      message: message + ' 让我为您安排最专业的诊断服务。',
      needsMoreInfo: !hasFiles,
      questions: hasFiles ? [] : ['请上传相关的音频、视频或生理数据文件以便进行更准确的分析'],
      agentTasks: this.generateDefaultAgentTasks(userMessage, hasFiles, fileTypes)
    };
  }

  private createErrorResponse(): ChiefAgentResponse {
    return {
      message: '系统暂时繁忙，但我的团队随时准备为您服务。请稍后再试或上传您的数据文件。',
      needsMoreInfo: true,
      questions: ['请描述您的症状或上传相关数据文件'],
      agentTasks: [{
        agentId: 'system-monitor',
        agentName: '系统监控',
        task: '检查系统状态并准备接收用户数据',
        priority: 'high',
        estimatedTime: '1-2分钟'
      }]
    };
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  getUserInfo() {
    return this.userInfo;
  }

  resetConversation() {
    this.conversationHistory = [];
    this.userInfo = {};
  }
}

export const geminiService = new GeminiService();
export default geminiService;