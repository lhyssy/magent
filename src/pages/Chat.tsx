import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Card from '../components/Card'
import DiagnosisProgress from '../components/DiagnosisProgress'
import TypewriterMessage from '../components/TypewriterMessage'
import useStreamingChat from '../hooks/useStreamingChat'
import geminiService, { type ChiefAgentResponse, type AgentTask } from '../services/geminiService'
import {
  Bot,
  User,
  Send,
  Mic,
  MicOff,
  Upload,
  ArrowRight,
  Activity,
  Brain,
  Zap,
  Eye,
  FileText,
  X,
  Video,
  Headphones,
  Camera,
  BarChart3,
  Sparkles,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url?: string
}

interface AgentStatus {
  id: string
  name: string
  status: 'idle' | 'working' | 'completed' | 'error'
  progress: number
  currentTask: string
  icon: React.ReactNode
}

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  files?: UploadedFile[]
  isAgentAnalysis?: boolean
}

interface DiagnosisState {
  isActive: boolean
  progress: number
  currentStage: string
  estimatedTime: string
  startTime?: Date
}

// 预设回复消息
// 这是一个包含完整演示流程的有序消息数组。
// 您的前端应用可以按顺序依次取出并显示这些消息，以驱动整个演示过程。
const presetReplies = [
  // 消息 2: 收到用户主诉后的确认
  '收到您的主诉信息。我已指派**文本与病史分析师**立即开始处理。',

  // 消息 3: 文本分析师的初步分析报告
  `**文本与病史分析师**已提交初步分析报告。

*   **专家输出:** 已从您的叙述中，成功识别并标记了 **4个** 符合DSM-5诊断标准的抑郁核心症状实体：\`兴趣丧失/快感缺乏\`、\`精力疲劳\`、\`注意力不集中\`、\`失眠\`。
*   **初步假设:** 高度提示 **重度抑-郁发作 (MDD)**。`,

  // 消息 4: 引导用户录制视频
  '接下来，为了进行行为模式评估，请您录制一段60秒的短视频，谈谈这些感受对您生活的影响。',

  // 消息 5: 确认收到视频
  '视频资料已接收。**音频分析师**与**视频分析师**正在进行并行处理。',

  // 消息 6: 音频与视频分析师的报告
  `**音频分析师**与**视频分析师**已提交分析报告。

*   **音频分析师输出:** 检测到平均语速为 \`82词/分钟\`（低于历史基线 \`30%\`）。声音韵律平坦度为 \`0.82\`，显著高于常模。声学特征支持**精神运动性迟滞**的判断。
*   **视频分析师输出:** 面部动作单元（FACS）分析显示，代表“悲伤”的 \`AU1+AU4\` 组合激活时间占比 \`73%\`，代表“喜悦”的 \`AU12\` 激活率低于 \`1%\`。行为特征支持**抑郁心境**的判断。`,
  
  // 消息 7: 关键鉴别诊断提问
  `**【关键鉴别诊断环节】** 王先生，目前，我的团队中三位专家（文本、音频、视频）的初步分析均一致指向了\`重度抑郁症\`。然而，在精神医学诊断中，排除其最重要的鉴别诊断——**双相障碍**——是确保诊断准确性的核心步骤。

为此，我需要向您探查一项关键的病史信息。请仔细回忆，**在过去的一生中，是否曾有过至少连续4天**，您的状态与现在截然相反？例如，情绪异常高涨或易怒，精力充沛，睡眠需求显著减少，思维飞快，或者参与了许多有风险或不计后果的活动？`,

  // 消息 8: 对用户关键信息的反应
  '**【重大发现】** 感谢您提供的这一决定性信息！这触发了系统最高优先级的诊断冲突，我将立即指派**叙事与病史分析智能体**（文本分析师的深度模式）进行紧急评估。',
  
  // 消息 9: 叙事与病程分析师的报告 (推翻初步诊断)
  `**叙事与病史分析智能体**已提交决定性分析报告。

*   **专家输出:** 1. **病程模式:** 确认为\`周期性发作\`。2. **躁狂评估:** 您描述的“春天的那一周”满足DSM-5关于**躁狂发作**的A、B、C全部准则（包含心境、症状和功能损害）。
*   **系统警报:** **初步诊断被推翻！** 新证据强烈支持**双相障碍I型**的诊断。`,

  // 消息 10: 引导上传生理数据
  '为了对您**当前**的抑郁状态进行最客观的生理学确认，并为将来的治疗提供基线参考，我强烈建议您上传相关的生理数据文件。',

  // 消息 11: 最终协同裁决的摘要
  `**【首席诊断助手：最终协同裁决】** 所有专家团队已完成最终分析。作为首席诊断助手，我已主持了内部的**多智能体案例研讨会**，并基于所有证据形成了最终决议。

*[案例研讨会摘要]*
*   **核心议题:** 患者的最终诊断归属。
*   **关键论点 (叙事与病史分析师):** “患者明确的、符合DSM-5标准的躁狂发作史，是诊断的‘金标准’。根据循证医学的层级原则，双相障碍的诊断优先于所有其他心境障碍。”
*   **佐证论点 (视频/音频分析师):** “我们提供的行为学证据，与fNIRS分析师的生理学证据交叉验证，共同证实了患者当前处于抑郁状态。”
*   **客观证据 (fNIRS分析师):** “我提供的生理数据——左侧DLPFC激活水平Z-Score为\`-2.3\`，为当前\`重度抑郁\`的发作相态提供了生物学级别的佐证。”
*   **首席裁决:** “研讨结束。所有证据链完整且逻辑闭环。**叙事与病史分析师**确立了疾病的**诊断归属**。**fNIRS、视频和音频分析师**共同精准定义了疾病**当前的发作相态**。”`,
  
  // 消息 12: 最终的详细诊断报告
  `📋 **您的深度智能诊断报告已生成：**

*   **初步诊断:** **双相情感障碍I型，当前为最近一次发作（重度抑郁）**。
*   **置信度:** **96% (因包含客观生理数据)**
*   **关键诊断依据 (按证据层级排序):**
    1.  **[决定性证据 - 病史]** 您对“春天那一周”的描述，满足DSM-5关于**躁狂发作**的全部核心标准，这是确立双相I型障碍诊断的**充分且必要条件**。
    2.  **[客观生理证据 - 当前状态]** fNIRS数据显示，您当前大脑前额叶皮层功能活动呈现典型的重度抑郁模式，为当前发作相态提供了**生物学级别的佐证**。
    3.  **[行为学证据 - 当前状态]** 音频与视频分析的量化指标（低语速、平面化韵律、悲伤微表情等）与生理证据交叉验证，共同证实了您当前的抑郁状态。
*   **临床风险与建议:**
    *   **【最高优先级】** **请务必告知您的医生，您曾有过那段“精力异常充沛”的时期。** 因为针对双相障碍的抑郁发作，单独使用抗抑郁药可能诱发转躁或快速循环，存在风险。
    *   治疗通常需要以**心境稳定剂**为核心。
    *   本报告可作为您与医生沟通的有力参考，帮助医生快速、全面地了解您的完整病史。`
]

export default function Chat() {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const [isAgentPanelCollapsed, setIsAgentPanelCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // 在移动设备上默认折叠智能体面板
      if (window.innerWidth < 768) {
        setIsAgentPanelCollapsed(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 触摸手势支持
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isMobile) {
      if (isLeftSwipe && !isAgentPanelCollapsed) {
        setIsAgentPanelCollapsed(true)
      }
      if (isRightSwipe && isAgentPanelCollapsed) {
        setIsAgentPanelCollapsed(false)
      }
    }
  }
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const sessionId = 'demo-session-001'
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  // 流式聊天状态
  const {
    messages: streamingMessages,
    isStreaming,
    currentStreamingId,
    sendMessage,
    stopStreaming
  } = useStreamingChat({
    onMessageComplete: (message) => {
      console.log('消息完成:', message);
    },
    onError: (error) => {
      console.error('流式输出错误:', error);
    }
  });

  // 兼容原有消息格式的状态
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content:   // 消息 1: 温和的开场白，并完整介绍专家团队
    `您好，我是连心智诊师首席诊断助手。很高兴能在这里陪伴您，一同梳理您近期的感受。

请放心，接下来的整个过程，我都会在这里引导您。我身后的专家团队也已准备就绪，他们将以最专业、最审慎的态度，帮助我们理解您所提供的信息。

🔬 我的专业团队包括：
• 文本与病史分析师 - 负责深度解析您的症状描述与病史信息
• 音频分析师 - 负责进行专业的语音情感与声学功能评估
• 视频分析师 - 负责精准的行为模式与微表情分析
• 图像分析师 - 负责医学图像（如脑部扫描）的处理与分析
• EEG分析师 - 负责脑电图信号的精密处理与解读
• fNIRS分析师 - 负责功能性近红外光谱的脑功能数据分析

您可以在左侧的【智能体协作状态】面板，实时查看每位专家的工作进展。

准备好了吗？我们可以从聊聊您最近的感受开始。`,
      timestamp: new Date(),
    },
  ])
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [currentAgentTasks, setCurrentAgentTasks] = useState<AgentTask[]>([])
  const [diagnosisState, setDiagnosisState] = useState<DiagnosisState>({
    isActive: false,
    progress: 0,
    currentStage: '等待开始诊断',
    estimatedTime: '1-2分钟'
  })
  const [shouldStartDiagnosis, setShouldStartDiagnosis] = useState(false)
  // 轮流发言状态
  const [turnBasedState, setTurnBasedState] = useState({
    currentReplyIndex: 0,
    isWaitingForResponse: false
  })

  // 智能体激活关键词映射
  const agentKeywords = {
    'text-analyst': ['症状', '病史', '感受', '情绪', '抑郁', '焦虑', '失眠', '疲劳', '心情'],
    'text-pathology-analyst': ['病理', '文本分析', '病理报告', '组织', '细胞', '诊断报告', '病理学'],
    'audio-analyst': ['语音', '录音', '说话', '声音', '语调'],
    'video-analyst': ['视频', '录制', '表情', '行为', '动作'],
    'eeg-analyst': ['脑电', 'EEG', '脑波', '神经'],
    'fnirs-analyst': ['fNIRS', '近红外', '脑功能', '血氧'],
    'image-analyst': ['图片', '照片', '影像', '扫描']
  }


  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    {
      id: 'coordinator',
      name: '总代理',
      status: 'working',
      progress: 100,
      currentTask: '与用户对话、协调各专家分析',
      icon: <Users className="w-5 h-5 text-indigo-500" />,
    },
    {
      id: 'text-pathology-analyst',
      name: '文本与病理分析师',
      status: 'idle',
      progress: 0,
      currentTask: '等待文本与病理数据',
      icon: <FileText className="w-5 h-5 text-teal-500" />,
    },
    {
      id: 'fnirs-analyst',
      name: 'FNIRS分析师',
      status: 'idle',
      progress: 0,
      currentTask: '等待fNIRS数据',
      icon: <Brain className="w-5 h-5 text-purple-500" />,
    },
    {
      id: 'audio-analyst',
      name: '音频分析师',
      status: 'idle',
      progress: 0,
      currentTask: '等待音频数据',
      icon: <Headphones className="w-5 h-5 text-green-500" />,
    },
    {
      id: 'eeg-analyst',
      name: 'EEG分析师',
      status: 'idle',
      progress: 0,
      currentTask: '等待EEG数据',
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 'video-analyst',
      name: '视频分析师',
      status: 'idle',
      progress: 0,
      currentTask: '等待视频数据',
      icon: <Video className="w-5 h-5 text-red-500" />,
    },
    {
      id: 'image-analyst',
      name: '图像分析师',
      status: 'idle',
      progress: 0,
      currentTask: '等待图像数据',
      icon: <Camera className="w-5 h-5 text-orange-500" />,
    }
  ])
  
  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // 轮流发言机制：用户上传后自动回复
  const handleTurnBasedReply = () => {
    if (turnBasedState.currentReplyIndex < presetReplies.length) {
      const reply = presetReplies[turnBasedState.currentReplyIndex];
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setTurnBasedState(prev => ({
        ...prev,
        currentReplyIndex: prev.currentReplyIndex + 1
      }));
    }
  };

  // 文件上传处理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles: UploadedFile[] = []
    
    Array.from(files).forEach(file => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      }
      
      newFiles.push(newFile)
    })
    
    // 更新上传文件列表
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    toast.success(`已选择 ${newFiles.length} 个文件，请编辑消息后点击发送`)
  }
  
  // 获取文件类型描述
  const getFileTypeDescription = (fileType: string): string => {
    if (fileType.includes('video')) return '视频'
    if (fileType.includes('image')) return '图像'
    if (fileType.includes('edf') || fileType.includes('bdf')) return 'EEG'
    if (fileType.includes('mat')) return 'fNIRS'
    return '数据'
  }
  
  // 更新智能体状态（带延时机制）
  const updateAgentStatus = (fileType: string) => {
    setAgentStatuses(prev => prev.map(agent => {
      if ((fileType.includes('video') && agent.id === 'video-analyst') ||
          (fileType.includes('edf') && agent.id === 'eeg-analyst') ||
          (fileType.includes('mat') && agent.id === 'fnirs-analyst')) {
        return {
          ...agent,
          status: 'working' as const,
          progress: 5,
          currentTask: '初始化分析...'
        }
      }
      return agent
    }))
    
    // 为不同智能体设置不同的分析时间（统一调整为20秒内完成）
    const getAnalysisSteps = (agentId: string) => {
      // 生成15-20秒的随机完成时间
      const randomDuration = Math.floor(Math.random() * 5000) + 15000; // 15000-20000毫秒
      const step1 = Math.floor(randomDuration * 0.2);
      const step2 = Math.floor(randomDuration * 0.4);
      const step3 = Math.floor(randomDuration * 0.6);
      const step4 = Math.floor(randomDuration * 0.8);
      const step5 = randomDuration;
      
      // 根据智能体类型设置不同的任务描述
      if (['fnirs-analyst', 'audio-analyst', 'video-analyst'].includes(agentId)) {
        return [
          { delay: step1, progress: 20, task: '数据预处理...' },
          { delay: step2, progress: 40, task: '特征提取中...' },
          { delay: step3, progress: 60, task: '模式识别分析...' },
          { delay: step4, progress: 80, task: '深度学习推理...' },
          { delay: step5, progress: 100, task: '分析完成', status: 'completed' }
        ]
      }
      if (agentId === 'text-pathology-analyst') {
        return [
          { delay: step1, progress: 20, task: '文本解析中...' },
          { delay: step2, progress: 40, task: '病理特征提取...' },
          { delay: step3, progress: 60, task: '病理模式分析...' },
          { delay: step4, progress: 80, task: '诊断结果生成...' },
          { delay: step5, progress: 100, task: '分析完成', status: 'completed' }
        ]
      }
      // 其他智能体使用通用任务描述
      return [
        { delay: step1, progress: 20, task: '正在分析数据...' },
        { delay: step2, progress: 40, task: '特征识别中...' },
        { delay: step3, progress: 60, task: '深度分析中...' },
        { delay: step4, progress: 80, task: '结果生成中...' },
        { delay: step5, progress: 100, task: '分析完成', status: 'completed' }
      ]
    }
    
    // 为每个激活的智能体设置渐进式状态更新
    setAgentStatuses(prev => {
      const updatedAgents = prev.map(agent => {
        if ((fileType.includes('video') && agent.id === 'video-analyst') ||
            (fileType.includes('edf') && agent.id === 'eeg-analyst') ||
            (fileType.includes('mat') && agent.id === 'fnirs-analyst')) {
          
          const steps = getAnalysisSteps(agent.id)
          
          // 为每个步骤设置定时器
          steps.forEach(step => {
            setTimeout(() => {
              setAgentStatuses(current => current.map(a => {
                if (a.id === agent.id) {
                  return {
                    ...a,
                    progress: step.progress,
                    currentTask: step.task,
                    status: (step.status || a.status) as 'idle' | 'working' | 'completed' | 'error'
                  }
                }
                return a
              }))
            }, step.delay)
          })
        }
        return agent
      })
      return updatedAgents
    })
  }
  
  // 智能激活智能体（基于消息内容）
  const activateAgentsByContent = (messageContent: string, files?: UploadedFile[]) => {
    const content = messageContent.toLowerCase()
    const activatedAgents: string[] = []

    // 根据关键词激活智能体
    Object.entries(agentKeywords).forEach(([agentId, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        activatedAgents.push(agentId)
      }
    })

    // 根据文件类型激活智能体
    if (files && files.length > 0) {
      files.forEach(file => {
        const fileType = file.type.toLowerCase()
        const fileName = file.name.toLowerCase()
        
        if (fileType.includes('video') || fileName.includes('mp4') || fileName.includes('avi')) {
          activatedAgents.push('video-analyst')
          activatedAgents.push('audio-analyst') // 视频通常包含音频
        }
        if (fileType.includes('audio') || fileName.includes('wav') || fileName.includes('mp3')) {
          activatedAgents.push('audio-analyst')
        }
        if (fileName.includes('edf') || fileName.includes('bdf')) {
          activatedAgents.push('eeg-analyst')
        }
        if (fileName.includes('mat') || fileName.includes('fnirs')) {
          activatedAgents.push('fnirs-analyst')
        }
        if (fileType.includes('image') || fileName.includes('jpg') || fileName.includes('png')) {
          activatedAgents.push('image-analyst')
        }
      })
    }

    // 文本分析师总是会被激活（因为有文本输入）
    if (messageContent.trim()) {
      activatedAgents.push('text-analyst')
    }

    // 更新被激活的智能体状态
    if (activatedAgents.length > 0) {
      setAgentStatuses(prev => prev.map(agent => {
        const shouldActivate = activatedAgents.some(id => agent.id.includes(id) || id.includes(agent.id.split('-')[0]))
        
        if (shouldActivate && agent.status === 'idle') {
          return {
            ...agent,
            status: 'working' as const,
            progress: 10,
            currentTask: '开始分析...'
          }
        }
        return agent
      }))

      // 为激活的智能体设置渐进式分析进度
      activatedAgents.forEach(agentType => {
        const targetAgent = agentStatuses.find(agent => 
          agent.id.includes(agentType) || agentType.includes(agent.id.split('-')[0])
        )
        
        if (targetAgent) {
          const getProgressSteps = (agentId: string) => {
            // 生成15-20秒的随机完成时间
            const randomDuration = Math.floor(Math.random() * 5000) + 15000; // 15000-20000毫秒
            const step1 = Math.floor(randomDuration * 0.25);
            const step2 = Math.floor(randomDuration * 0.5);
            const step3 = Math.floor(randomDuration * 0.75);
            const step4 = randomDuration;
            
            // 根据智能体类型设置不同的任务描述
            if (['fnirs-analyst', 'audio-analyst', 'video-analyst'].includes(agentId)) {
              return [
                { delay: step1, progress: 25, task: '数据预处理完成...' },
                { delay: step2, progress: 50, task: '特征提取中...' },
                { delay: step3, progress: 75, task: '模式分析中...' },
                { delay: step4, progress: 100, task: '分析完成', status: 'completed' }
              ]
            }
            if (agentId === 'text-pathology-analyst') {
              return [
                { delay: step1, progress: 25, task: '文本解析完成...' },
                { delay: step2, progress: 50, task: '病理特征识别...' },
                { delay: step3, progress: 75, task: '病理模式匹配...' },
                { delay: step4, progress: 100, task: '分析完成', status: 'completed' }
              ]
            }
            // 其他智能体使用通用任务描述
            return [
              { delay: step1, progress: 25, task: '语义分析中...' },
              { delay: step2, progress: 50, task: '特征识别中...' },
              { delay: step3, progress: 75, task: '深度分析中...' },
              { delay: step4, progress: 100, task: '分析完成', status: 'completed' }
            ]
          }
          
          const steps = getProgressSteps(targetAgent.id)
          
          steps.forEach(step => {
            setTimeout(() => {
              setAgentStatuses(current => current.map(agent => {
                if (agent.id === targetAgent.id) {
                  return {
                    ...agent,
                    progress: step.progress,
                    currentTask: step.task,
                    status: (step.status || agent.status) as 'idle' | 'working' | 'completed' | 'error'
                  }
                }
                return agent
              }))
            }, step.delay)
          })
        }
      })
    }
  }

  // 更新智能体状态（AI任务版本）
  const updateAgentStatusByTasks = (status: 'idle' | 'working' | 'completed', agentTasks?: AgentTask[]) => {
    if (agentTasks && agentTasks.length > 0) {
      // 根据AI返回的任务更新对应智能体状态
      setAgentStatuses(prev => prev.map(agent => {
        const hasTask = agentTasks.some(task => 
          task.agentName.includes(agent.name) || agent.name.includes(task.agentName)
        );
        return {
          ...agent,
          status: hasTask ? status : agent.status,
          progress: hasTask ? (status === 'working' ? 50 : status === 'completed' ? 100 : 0) : agent.progress,
          currentTask: hasTask ? (status === 'working' ? '正在分析...' : status === 'completed' ? '分析完成' : agent.currentTask) : agent.currentTask
        };
      }));
    } else {
      // 更新所有智能体状态
      setAgentStatuses(prev => prev.map(agent => ({
        ...agent,
        status,
        progress: status === 'working' ? 50 : status === 'completed' ? 100 : 0,
        currentTask: status === 'working' ? '正在分析...' : status === 'completed' ? '分析完成' : '等待任务'
      })));
    }
  }
  
  // 删除文件
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    toast.success('文件已删除')
  }
  
  // 发送消息
  const handleSendMessage = async () => {
    if ((!message.trim() && uploadedFiles.length === 0) || isAiProcessing) return

    setIsAiProcessing(true)

    // 根据文件类型激活对应的智能体
     if (uploadedFiles.length > 0) {
       uploadedFiles.forEach(file => {
         updateAgentStatus(file.type)
       })
     }
 
     // 根据消息内容激活智能体
     activateAgentsByContent(message.trim(), uploadedFiles)

    try {
      // 使用流式聊天发送消息
      await sendMessage(message.trim())
      
      setMessage('')
      setUploadedFiles([])
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      setIsAiProcessing(false)
    }
  }
  

  
  // 语音录制
  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast.info('开始语音录制...')
      // 这里可以集成实际的语音录制功能
      setTimeout(() => {
        setIsRecording(false)
        toast.success('语音录制完成')
      }, 3000)
    } else {
      toast.info('停止语音录制')
    }
  }
  
  // 启动诊断
  const handleStartDiagnosis = () => {
    if (uploadedFiles.length === 0) {
      toast.error('请先上传数据文件')
      return
    }
    navigate('/monitor')
  }
  
  // 获取智能体状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }
  
  // 获取智能体状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'working': return '工作中'
      case 'completed': return '已完成'
      case 'error': return '错误'
      default: return '空闲'
    }
  }

  // 启动诊断进程
  const startDiagnosisProcess = (tasks: AgentTask[]) => {
    setDiagnosisState({
      isActive: true,
      progress: 0,
      currentStage: '初始化诊断系统...',
      estimatedTime: '1-2分钟',
      startTime: new Date()
    })
    
    setCurrentAgentTasks(tasks)
    updateAgentStatusByTasks('working', tasks)
  }






  

  

  

  

  


  // 合并流式消息和原有消息
  const allMessages = [...messages, ...streamingMessages]
  
  // 过滤消息，只显示用户和助手的对话
  const filteredMessages = allMessages.filter(message => 
    !message.isAgentAnalysis && 
    message.type !== 'system'
  )

  return (
    <Layout>
      <div 
        className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 智能体协作状态显示区域 - 固定在左侧边缘 */}
        <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white/95 via-blue-50/90 to-indigo-50/95 backdrop-blur-md border-r border-white/30 shadow-xl z-10 transform transition-all duration-700 ease-in-out animate-slide-in-left ${
          isAgentPanelCollapsed ? 'w-16' : isMobile ? 'w-72' : 'w-80'
        }`}>
          <div className={`${isAgentPanelCollapsed ? 'p-2' : 'p-4'} h-full overflow-y-auto transition-all duration-300`}>
            {isAgentPanelCollapsed ? (
              <div className="flex flex-col items-center space-y-3 mt-4">
                <button
                    onClick={() => setIsAgentPanelCollapsed(!isAgentPanelCollapsed)}
                    className={`rounded-lg bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/80 transition-all duration-200 ${
                      isMobile ? 'p-3 w-12 h-12' : 'p-2'
                    }`}
                    title="展开智能体面板"
                  >
                    <ChevronRight className={`text-gray-700 ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  </button>
                {/* 折叠状态下的简化状态指示器 */}
                <div className="flex flex-col space-y-2">
                  {agentStatuses.map((agent) => (
                    <div key={agent.id} className="flex justify-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} title={`${agent.name}: ${getStatusText(agent.status)}`} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/80 backdrop-blur-sm p-2 rounded-lg">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent flex items-center">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg mr-3">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    智能体协作状态
                  </h3>
                  <button
                    onClick={() => setIsAgentPanelCollapsed(!isAgentPanelCollapsed)}
                    className={`rounded-lg bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/80 transition-all duration-200 ${
                      isMobile ? 'p-3 w-12 h-12' : 'p-2'
                    }`}
                    title="折叠智能体面板"
                  >
                    <ChevronLeft className={`text-gray-700 ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  </button>
                </div>
                <div className="space-y-4">
                  {agentStatuses.map((agent) => (
                    <div key={agent.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 rounded-2xl shadow-lg ring-2 ring-white/50">
                            {agent.icon}
                          </div>
                          <span className="font-bold text-gray-900 text-sm">{agent.name}</span>
                        </div>
                        <div className={`relative w-3 h-3 rounded-full ${
                          getStatusColor(agent.status)
                        } shadow-lg`}>
                          {agent.status === 'working' && (
                            <div className={`absolute inset-0 rounded-full ${
                              getStatusColor(agent.status)
                            } animate-ping opacity-75`} />
                          )}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-gray-700 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        状态: <span className="ml-1 font-bold">{getStatusText(agent.status)}</span>
                      </div>
                      <div className="text-xs text-gray-600 mb-3 bg-gray-50/80 rounded-lg p-2 border border-gray-200/50">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {agent.currentTask}
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-2 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden" 
                            style={{ width: `${agent.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/30 animate-pulse" />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-right font-medium">
                          {agent.progress}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 主聊天区域 - 添加左边距为智能体面板留出空间 */}
        <div className={`flex-1 flex flex-col min-w-0 relative animate-expand-main transition-all duration-700 ${
          isMobile 
            ? (isAgentPanelCollapsed ? 'ml-16' : 'ml-72')
            : (isAgentPanelCollapsed ? 'ml-16' : 'ml-80')
        }`}>
          {/* 聊天头部 */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between">
              {/* 移动端菜单按钮 - 在移动设备上显示，用于切换智能体面板 */}
              <button
                onClick={() => setIsAgentPanelCollapsed(!isAgentPanelCollapsed)}
                className="md:hidden p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/80 transition-all duration-200"
                title={isAgentPanelCollapsed ? "展开智能体面板" : "折叠智能体面板"}
              >
                {isAgentPanelCollapsed ? <ChevronRight className="w-5 h-5 text-gray-700" /> : <ChevronLeft className="w-5 h-5 text-gray-700" />}
              </button>
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">连心智诊师</h1>
                  <p className="text-xs lg:text-sm text-gray-600 flex items-center mt-1 hidden sm:flex">
                    <Sparkles className="w-4 h-4 mr-1 text-indigo-500" />
                    多智能体协作诊断系统
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/50 px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 inline-block animate-pulse"></span>
                  系统在线
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
                  <MessageSquare className="w-4 h-4 mr-1 inline-block" />
                  {messages.length - 1} 条对话
                </div>
                

              </div>
            </div>
          </div>


          {/* 文件上传区域 */}
          {uploadedFiles.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border-b border-blue-200/30 p-5 md:p-5 sm:p-3 xs:p-2">
              <div className="flex items-center mb-3">
                <Upload className="w-5 h-5 text-blue-600 mr-2 md:w-5 md:h-5 sm:w-4 sm:h-4 xs:w-4 xs:h-4" />
                <h3 className="text-sm font-semibold text-blue-900 md:text-sm sm:text-xs xs:text-xs">已上传数据文件</h3>
                <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium md:text-xs sm:text-xs xs:text-xs">
                  {uploadedFiles.length} 个文件
                </span>
              </div>
              <div className="flex flex-wrap gap-3 md:gap-3 sm:gap-2 xs:gap-1">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 md:px-4 md:py-2 sm:px-3 sm:py-1 xs:px-2 xs:py-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center md:w-8 md:h-8 sm:w-6 sm:h-6 xs:w-6 xs:h-6">
                      <FileText className="w-4 h-4 text-white md:w-4 md:h-4 sm:w-3 sm:h-3 xs:w-3 xs:h-3" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800 md:text-sm sm:text-xs xs:text-xs truncate max-w-24 md:max-w-32">{file.name}</span>
                      <p className="text-xs text-gray-500 md:text-xs sm:text-xs xs:text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all duration-200"
                    >
                      <X className="w-4 h-4 md:w-4 md:h-4 sm:w-3 sm:h-3 xs:w-3 xs:h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 聊天消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 md:p-6 sm:p-4 xs:p-3 space-y-6 lg:space-y-8 md:space-y-6 sm:space-y-4 xs:space-y-3 max-h-full">
            {/* 诊断进度条 */}
            <DiagnosisProgress
              isActive={diagnosisState.isActive}
              progress={diagnosisState.progress}
              currentStage={diagnosisState.currentStage}
              estimatedTime={diagnosisState.estimatedTime}
            />
            
            {/* 欢迎界面 - 仅在没有消息且没有进行诊断时显示 */}
            {filteredMessages.length === 0 && !diagnosisState.isActive && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                  <Bot className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-4">
                  欢迎使用智能医疗诊断系统
                </h2>
                <p className="text-gray-600 text-lg lg:text-xl mb-8 max-w-2xl leading-relaxed">
                  我是您的专业医疗助手，请详细描述您的症状或上传相关的医疗数据文件，我将为您提供专业的分析和建议。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 max-w-4xl">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                    <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-2">症状描述</h3>
                    <p className="text-sm text-gray-600">详细描述您的身体状况和症状</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                    <Upload className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-2">数据上传</h3>
                    <p className="text-sm text-gray-600">上传医疗检查报告或相关文件</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                    <Sparkles className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-2">智能分析</h3>
                    <p className="text-sm text-gray-600">获得专业的医疗建议和分析</p>
                  </div>
                </div>
              </div>
            )}
            
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6 lg:mb-8 group animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div className="flex items-start space-x-3 lg:space-x-4 max-w-[85%] lg:max-w-[75%]">
                  {message.type !== 'user' && !(message.id === currentStreamingId && isStreaming) && (
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 ring-2 ring-white/20">
                      {message.type === 'system' ? (
                        <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      )}
                    </div>
                  )}
                  <div
                    className={`px-5 lg:px-8 py-4 lg:py-6 rounded-3xl shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white border-2 border-blue-300/30'
                        : message.type === 'system'
                        ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-green-800 border-2 border-green-200/60'
                        : 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 text-gray-800 border-2 border-gray-200/60'
                    }`}
                  >
                    {message.id === currentStreamingId && isStreaming ? (
                      <TypewriterMessage
                        content={message.content}
                        speed={30}
                        className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap font-medium break-words"
                      />
                    ) : (
                      <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap font-medium break-words">{message.content}</p>
                    )}
                    {message.files && message.files.length > 0 && (
                      <div className="mt-3 lg:mt-4 space-y-2 lg:space-y-3">
                        {message.files.map((file) => (
                          <div key={file.id} className={`flex items-center space-x-3 text-xs lg:text-sm p-2 lg:p-3 rounded-2xl ${
                            message.type === 'user' ? 'bg-white/20' : 'bg-gray-100/80'
                          } backdrop-blur-sm`}>
                            <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                            <span className="truncate font-medium">{file.name}</span>
                            <span className="text-xs opacity-70">({(file.size / 1024).toFixed(1)}KB)</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.type === 'assistant' && (
                      <div className="flex justify-end mt-3 lg:mt-4 pt-2 border-t border-white/20">
                        <CheckCircle className="w-4 h-4 opacity-75" />
                      </div>
                    )}
                  </div>
                  {message.type === 'user' && (
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-500 via-gray-600 to-slate-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0 ring-2 ring-white/20">
                      <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="bg-gradient-to-r from-white/95 via-blue-50/90 to-indigo-50/95 backdrop-blur-md border-t-2 border-white/30 p-4 lg:p-8 md:p-6 sm:p-4 xs:p-3 shadow-2xl">
            <div className="flex items-end space-x-3 lg:space-x-6 md:space-x-4 sm:space-x-2 xs:space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".edf,.bdf,.mat,.mp4,.avi,.mov,.jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
              <div className="flex space-x-2 lg:space-x-3 md:space-x-2 sm:space-x-1 xs:space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 lg:space-x-3 md:space-x-2 sm:space-x-1 xs:space-x-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200/60 text-blue-700 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl px-4 py-3 md:px-3 md:py-2 sm:px-2 sm:py-2 xs:px-2 xs:py-1"
                >
                  <Upload className="w-5 h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-3 xs:h-3" />
                  <span className="font-semibold hidden sm:inline md:text-sm sm:text-xs xs:text-xs">上传数据</span>
                </Button>
                <Button
                  variant={isRecording ? "danger" : "outline"}
                  size="sm"
                  onClick={toggleRecording}
                  className={`transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl px-4 py-3 md:px-3 md:py-2 sm:px-2 sm:py-2 xs:px-2 xs:py-1 ${
                    isRecording 
                      ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white animate-pulse border-2 border-red-300' 
                      : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200/60 text-green-700 hover:from-green-100 hover:to-teal-100 hover:border-green-300'
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-3 xs:h-3" /> : <Mic className="w-5 h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-3 xs:h-3" />}
                </Button>
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder={uploadedFiles.length > 0 ? `已选择 ${uploadedFiles.length} 个文件，可继续编辑消息内容...` : "详细描述您的症状或上传相关数据文件..."}
                  className="w-full px-5 lg:px-7 md:px-5 sm:px-4 xs:px-3 py-3 lg:py-4 md:py-3 sm:py-2 xs:py-2 bg-white/90 backdrop-blur-sm border-2 border-white/60 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400 shadow-lg text-gray-900 placeholder-gray-500 transition-all duration-300 text-sm lg:text-base md:text-sm sm:text-xs xs:text-xs font-medium hover:shadow-xl"
                />
                {message.trim() && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <span className="text-xs lg:text-sm md:text-xs sm:text-xs xs:text-xs text-gray-500 font-medium bg-white/80 px-2 py-1 rounded-lg">{message.length}/500</span>
                  </div>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={(!message.trim() && uploadedFiles.length === 0) || isAiProcessing || isStreaming}
                size="sm"
                className={`shadow-xl hover:shadow-2xl transition-all duration-300 px-4 lg:px-8 md:px-6 sm:px-4 xs:px-3 py-3 lg:py-4 md:py-3 sm:py-2 xs:py-2 rounded-3xl font-semibold ${
                  (isAiProcessing || isStreaming)
                    ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105'
                }`}
              >
                {(isAiProcessing || isStreaming) ? (
                  <>
                    <div className="w-5 h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-3 xs:h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span className="hidden sm:inline md:text-sm sm:text-xs xs:text-xs">{isStreaming ? '回复中...' : '分析中...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-3 xs:h-3 mr-2" />
                    <span className="hidden sm:inline md:text-sm sm:text-xs xs:text-xs">发送</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>


      </div>
    </Layout>
  );
}