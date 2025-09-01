import { useState, useCallback, useRef } from 'react';
// 预设回复消息 (最终版)
// 严格遵循六智能体架构，首席助手作为总指挥，并保持共情、温和的交互风格。
// 预设回复消息 (最终纯文本版)
// 移除了所有 Markdown 星号，确保在无渲染环境下显示正常。
const presetReplies = [
  // 消息 2: 收到主诉后，明确指派任务
  '谢谢您愿意分享这些感受，听起来这段时间您过得相当不容易。我已指派我的文本与病史分析师开始对您的描述进行深度语义分析。您现在可以在左侧面板看到它的工作状态。',

  // 消息 3: 引导视频录制，并解释原因
  '为了能更深入地理解您的感受，而不仅仅是通过文字，我能邀请您录制一段简短的视频，谈谈这些情绪对您生活的影响吗？有时候，非语言的表达能传递更多信息。我将指派我的音频与视频分析师共同进行分析。',

  // 消息 4: 视频分析后的初步综合评估
  '谢谢您。我的音频与视频分析师已经完成了分析。现在，我整合了他们与文本与病史分析师的初步报告：无论是从您的亲口叙述，还是声音、表情中的细微线索，所有信息都一致地指向了您当前正经历着一次显著的抑郁心境。',
  
  // 消息 5: 循循善诱地提出关键问题
  `【一同回顾与探索】为了能够更完整地理解您当前的状态，我们有时需要回顾一下过去。这就像是了解一幅画的全貌，不仅要看阴影，也要看光亮的部分。

如果可以的话，我想邀请您一同回忆一下：在过去的一年里，您是否也经历过与之完全相反的、一段精力异常充沛的时期呢？哪怕只有几天，您感觉自己情绪高涨、思维敏捷，甚至不太需要睡觉。任何类似的经历，对我们来说都非常有价值。`,

  // 消息 6: 对用户关键信息的反应，并指派二次分析
  '非常感谢您如此坦诚地分享这段经历。我知道，回忆并讲述这些可能并不容易。您刚才提到的信息，对我们理解您情绪变化的“完整模式”至关重要。我将立即重新指派文本与病史分析师，在这一新背景下，对您的完整病程进行紧急的二次评估。',

  // 消息 7: 引导上传生理/图像数据，明确激活相应专家
  `我的文本与病史分析师已完成二次评估，并确认您描述的情况符合一次独立的躁狂发作。这一发现从根本上重构了我们的诊断方向。

现在，为了对您当前的抑郁状态进行最客观的生理学确认，我们有一个可选的步骤。如果您方便并愿意上传相关的生理数据（如EEG、fNIRS）或医学图像（如脑部扫描），我将立即激活我的EEG分析师、fNIRS分析师与图像分析师，为您提供生物学层面的深度解读。`,
  
  // 消息 8: 最终裁决前的铺垫
  `【首席诊断助手：正在为您进行最终评估】感谢您的耐心等待。在过去的几分钟里，我召集了所有专家团队，共同审阅了我们整个交流过程中的所有信息——从您的每一次讲述，到每一个细微的行为特征，再到客观的生理数据。我们正在形成一份全面、审慎的评估报告。`,
  
  // 消息 9: 最终的详细诊断报告 (以关怀的口吻呈现)
  `📋 我们的综合评估报告已准备好：

王先生，在整合了我们整个交流过程、您的宝贵回忆以及所有客观数据后，我的团队和我形成了一份全面的评估报告。希望它能为您带来启发与帮助。

我们的理解与评估: 双相情感障碍I型，当前正经历一次重度抑郁发-作。
评估的信心度: 96% (因评估结论由您的亲身经历与客观生理数据共同支持)

我们是如何得出这个理解的:
1.  【最关键的信息 - 您的经历】经我的文本与病史分析师深度评估，您坦诚分享的“春天那一周”的经历，符合一次独立的躁狂发作。这是我们理解您情绪“完整模式”的核心。
2.  【客观的生理印证 - 您当前的状态】fNIRS与EEG分析师的报告，客观地证实了您当前大脑的功能状态，与您所感受到的“重度抑郁”是完全一致的。
3.  【行为上的一致性 - 您当前的状态】音频与视频分析师的发现，也从行为层面印证了您当前的感受，与生理证据形成了交叉验证。

我们最真诚的建议与提醒:
• 【最重要的事】我们强烈建议您与精神科医生交流时，一定要分享您那段“精力异常充沛”的经历。因为这对于制定最适合您、最安全的治疗方案至关重要（例如，心境稳定剂可能是比抗抑郁药更优先的选择）。
• 【请记住】这个评估是一个专业的起点，而不是终点。它为您提供了一个清晰的方向，去寻求更精准的帮助。您为理解自己所付出的努力，是康复之路上最宝贵的第一步。

如果您对这份报告有任何疑问，或者想聊聊您的感受，我随时都在这里。`
];

interface StreamingMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isComplete?: boolean;
  error?: string;
  files?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
  }>;
  isAgentAnalysis?: boolean;
}

interface UseStreamingChatOptions {
  sessionId?: string;
  onMessageComplete?: (message: StreamingMessage) => void;
  onError?: (error: string) => void;
}

interface StreamingChatState {
  messages: StreamingMessage[];
  isStreaming: boolean;
  currentStreamingId: string | null;
}

export function useStreamingChat(options: UseStreamingChatOptions = {}) {
  const { sessionId, onMessageComplete, onError } = options;
  
  const [state, setState] = useState<StreamingChatState>({
    messages: [],
    isStreaming: false,
    currentStreamingId: null
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const replyIndexRef = useRef<number>(0); // 用于跟踪当前应该使用的回复索引

  // 添加用户消息
  const addUserMessage = useCallback((content: string, files?: File[]) => {
    const message: StreamingMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content,
      timestamp: new Date(),
      isComplete: true,
      isAgentAnalysis: false,
      files: files?.map(file => ({
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));

    return message;
  }, []);



  // 开始流式AI回复（使用预设回答）
  const startStreamingReply = useCallback(async (userMessage: string) => {
    // 停止之前的流式输出
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const messageId = `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建初始的流式消息，显示思考状态
    const streamingMessage: StreamingMessage = {
      id: messageId,
      type: 'assistant',
      content: '正在思考...',
      timestamp: new Date(),
      isStreaming: true,
      isComplete: false,
      isAgentAnalysis: false
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, streamingMessage],
      isStreaming: true,
      currentStreamingId: messageId
    }));

    try {
      // 创建新的AbortController用于取消操作
      abortControllerRef.current = new AbortController();
      
      // 按顺序选择预设回答
      const currentResponse = presetReplies[replyIndexRef.current % presetReplies.length];
      replyIndexRef.current += 1; // 移动到下一个回复
      
      // 生成10-20秒的随机思考时间
      const thinkingDelay = Math.floor(Math.random() * 10000) + 10000; // 10000-20000毫秒
      
      // 思考延时
      setTimeout(() => {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        
        // 清空思考状态，开始实际内容输出
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: '' }
              : msg
          )
        }));
        
        // 模拟流式输出，每次输出几个字符
        let currentIndex = 0;
        const chunkSize = 1; // 减少每次输出的字符数，使输出更慢
        const delay = 120; // 增加延迟时间，使输出更慢
        
        const streamText = () => {
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }
          
          if (currentIndex < currentResponse.length) {
            const chunk = currentResponse.slice(currentIndex, currentIndex + chunkSize);
            currentIndex += chunkSize;
            
            // 更新消息内容
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            }));
            
            // 继续下一次输出
            setTimeout(streamText, delay);
          } else {
            // 流式完成
            setState(prev => {
              const updatedMessages = prev.messages.map(msg => 
                msg.id === messageId 
                  ? { ...msg, isStreaming: false, isComplete: true }
                  : msg
              );
              
              const completedMessage = updatedMessages.find(msg => msg.id === messageId);
              if (completedMessage) {
                onMessageComplete?.(completedMessage);
              }
              
              return {
                ...prev,
                messages: updatedMessages,
                isStreaming: false,
                currentStreamingId: null
              };
            });
          }
        };
        
        // 开始流式输出
        setTimeout(streamText, delay);
      }, thinkingDelay);

    } catch (err) {
      console.error('创建流式输出失败:', err);
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === messageId 
            ? { ...msg, isStreaming: false, isComplete: true, error: '输出失败' }
            : msg
        ),
        isStreaming: false,
        currentStreamingId: null
      }));
      
      onError?.('输出失败');
    }

    return messageId;
  }, [onMessageComplete, onError]);

  // 停止流式输出
  const stopStreaming = useCallback(() => {
    // 取消正在进行的流式输出
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => {
      if (prev.currentStreamingId) {
        return {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === prev.currentStreamingId 
              ? { ...msg, isStreaming: false, isComplete: true }
              : msg
          ),
          isStreaming: false,
          currentStreamingId: null
        };
      }
      return prev;
    });
  }, []);

  // 清空消息
  const clearMessages = useCallback(() => {
    stopStreaming();
    setState({
      messages: [],
      isStreaming: false,
      currentStreamingId: null
    });
  }, [stopStreaming]);

  // 发送消息（用户消息 + AI流式回复）
  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    // 添加用户消息
    const userMessage = addUserMessage(content, files);
    
    // 开始AI流式回复
    const streamingId = await startStreamingReply(content);
    
    return { userMessage, streamingId };
  }, [addUserMessage, startStreamingReply]);

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    currentStreamingId: state.currentStreamingId,
    addUserMessage,
    startStreamingReply,
    stopStreaming,
    clearMessages,
    sendMessage
  };
}

export default useStreamingChat;