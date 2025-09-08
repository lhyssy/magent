import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import Layout from '@/components/Layout'
import Button from '@/components/Button'
import MultimodalFileDisplay from '@/components/MultimodalFileDisplay'
import { SimpleTypewriter } from '@/components/SimpleTypewriter'
import { presetCases, PresetCase, PresetMessage } from '@/data/presetCases'
import {
  Bot,
  User,
  Play,
  Pause,
  RotateCcw,
  X,
  Menu,
  FastForward,
  Rewind,
  Volume2,
  Settings,
} from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url?: string
  preview?: string
  description?: string
}

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system' | 'file-upload'
  content: string
  timestamp: Date
  files?: UploadedFile[]
  agentActivations?: string[]
}

export default function PresetDemoChat() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 演示状态
  const [currentPresetCase, setCurrentPresetCase] = useState<PresetCase | null>(null)
  const [presetMessageIndex, setPresetMessageIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(2000)
  const [demoMessages, setDemoMessages] = useState<Message[]>([])
  const [showControls, setShowControls] = useState(true)
  const [currentTypingMessageId, setCurrentTypingMessageId] = useState<string | null>(null)
  const [isWaitingAfterReply, setIsWaitingAfterReply] = useState(false)

  // 初始化演示案例
  useEffect(() => {
    const state = location.state as { caseType?: string } | null
    const caseParam = searchParams.get('case')
    
    const caseType = state?.caseType || caseParam
    if (caseType) {
      const presetCase = presetCases.find(c => c.id === caseType)
      
      if (presetCase) {
        setCurrentPresetCase(presetCase)
        setDemoMessages([])
        setPresetMessageIndex(0)
        
        // 显示欢迎消息
        const welcomeMessage: Message = {
          id: 'welcome',
          type: 'assistant',
          content: `欢迎观看${presetCase.title}演示案例。\n\n${presetCase.description}\n\n点击播放按钮开始演示，您将看到一个完整的AI诊断流程，包括用户与AI的对话、多模态文件上传和分析过程。`,
          timestamp: new Date()
        }
        
        setDemoMessages([welcomeMessage])
        
        toast.success(`加载演示案例：${presetCase.title}`)
        
        // 清除location state
        window.history.replaceState({}, document.title)
      } else {
        toast.error('未找到指定的演示案例')
        navigate('/chat')
      }
    } else {
      toast.error('请选择一个演示案例')
      navigate('/')
    }
  }, [location.state, searchParams, navigate])

  // 自动播放逻辑
  useEffect(() => {
    if (!isAutoPlaying || !currentPresetCase || presetMessageIndex >= currentPresetCase.messages.length || currentTypingMessageId !== null || isWaitingAfterReply) {
      if (presetMessageIndex >= currentPresetCase?.messages.length && currentPresetCase) {
        setIsAutoPlaying(false)
        toast.success('演示完成！您可以重新播放或返回首页选择其他案例。')
      }
      return
    }

    const timer = setTimeout(() => {
      const currentMessage = currentPresetCase.messages[presetMessageIndex]
      
      const newMessage: Message = {
        id: `preset-${presetMessageIndex}`,
        type: currentMessage.type,
        content: currentMessage.content,
        timestamp: new Date(),
        files: currentMessage.files?.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          size: f.size,
          preview: f.preview,
          description: f.description
        })),
        agentActivations: currentMessage.agentActivations
      }
      
      setDemoMessages(prev => [...prev, newMessage])
      
      // 如果是AI消息，启动打字机效果
      if (currentMessage.type === 'assistant') {
        setCurrentTypingMessageId(newMessage.id)
      }
      
      setPresetMessageIndex(prev => prev + 1)
      
      // 特殊提示
      if (currentMessage.files && currentMessage.files.length > 0) {
        toast.info(`📁 上传了 ${currentMessage.files.length} 个多模态文件`)
      }
      
      if (currentMessage.agentActivations && currentMessage.agentActivations.length > 0) {
        toast.info(`🤖 激活智能体：${currentMessage.agentActivations.join(', ')}`)
      }
      
    }, playbackSpeed)

    return () => clearTimeout(timer)
  }, [isAutoPlaying, currentPresetCase, presetMessageIndex, playbackSpeed, currentTypingMessageId, isWaitingAfterReply])

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [demoMessages])

  // 控制函数
  const handlePlayPause = () => {
    if (!currentPresetCase) return
    
    if (presetMessageIndex >= currentPresetCase.messages.length) {
      // 如果已经播放完毕，重新开始
      handleRestart()
    } else {
      setIsAutoPlaying(!isAutoPlaying)
    }
  }

  const handleRestart = () => {
    setPresetMessageIndex(0)
    setDemoMessages([])
    
    if (currentPresetCase) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `重新开始${currentPresetCase.title}演示。\n\n${currentPresetCase.description}`,
        timestamp: new Date()
      }
      setDemoMessages([welcomeMessage])
    }
    
    setTimeout(() => {
      setIsAutoPlaying(true)
    }, 500)
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    toast.info(`播放速度已调整为${speed === 1000 ? '快速' : speed === 2000 ? '正常' : '慢速'}`)
  }

  const handleTypingComplete = () => {
    setCurrentTypingMessageId(null)
    
    // AI回复完成后，增加2-3秒等待时间模拟真实用户思考过程
    setIsWaitingAfterReply(true)
    setTimeout(() => {
      setIsWaitingAfterReply(false)
    }, 2500) // 2.5秒等待时间
  }

  const handleStepForward = () => {
    if (!currentPresetCase || presetMessageIndex >= currentPresetCase.messages.length) return
    
    const currentMessage = currentPresetCase.messages[presetMessageIndex]
    
    const newMessage: Message = {
      id: `preset-${presetMessageIndex}`,
      type: currentMessage.type,
      content: currentMessage.content,
      timestamp: new Date(),
      files: currentMessage.files?.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: f.size,
        url: f.preview, // 使用preview作为url
        preview: f.preview,
        description: f.description
      })),
      agentActivations: currentMessage.agentActivations
    }
    
    setDemoMessages(prev => [...prev, newMessage])
    setPresetMessageIndex(prev => prev + 1)
  }

  const handleStepBackward = () => {
    if (presetMessageIndex <= 0) return
    
    setPresetMessageIndex(prev => prev - 1)
    setDemoMessages(prev => prev.slice(0, -1))
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const getProgressPercentage = () => {
    if (!currentPresetCase) return 0
    return Math.round((presetMessageIndex / currentPresetCase.messages.length) * 100)
  }

  if (!currentPresetCase) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载演示案例中...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen relative overflow-hidden">
        {/* 动态背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-spin-slow" />
        </div>
        
        {/* 顶部控制栏 */}
        <div className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBackToHome}
                variant="ghost"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-blue-400 drop-shadow-lg" />
                <div>
                  <h1 className="text-lg font-semibold text-white drop-shadow-lg">
                    {currentPresetCase.title}
                  </h1>
                  <p className="text-sm text-blue-200/80">
                    演示案例 - {currentPresetCase.description}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowControls(!showControls)}
              variant="ghost"
              size="sm"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* 进度条 */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span className="font-medium">演示进度</span>
              <span className="bg-white/10 px-2 py-1 rounded-full backdrop-blur-sm">{presetMessageIndex} / {currentPresetCase.messages.length} ({getProgressPercentage()}%)</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
                style={{ width: `${getProgressPercentage()}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        {showControls && (
          <div className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 p-4 shadow-lg">
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={handleStepBackward}
                size="sm"
                variant="outline"
                disabled={presetMessageIndex <= 0 || currentTypingMessageId !== null || isWaitingAfterReply}
              >
                <Rewind className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handlePlayPause}
                size="sm"
                className="px-6"
                disabled={currentTypingMessageId !== null || isWaitingAfterReply}
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="ml-2">
                   {currentTypingMessageId !== null ? '输出中...' : isWaitingAfterReply ? '等待中...' : (isAutoPlaying ? '暂停' : presetMessageIndex >= currentPresetCase.messages.length ? '重播' : '播放')}
                  </span>
              </Button>
              
              <Button
                onClick={handleStepForward}
                size="sm"
                variant="outline"
                disabled={presetMessageIndex >= currentPresetCase.messages.length || currentTypingMessageId !== null || isWaitingAfterReply}
              >
                <FastForward className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handleRestart}
                size="sm"
                variant="outline"
                disabled={currentTypingMessageId !== null || isWaitingAfterReply}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-white/70" />
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  disabled={currentTypingMessageId !== null || isWaitingAfterReply}
                  className="px-3 py-1 text-sm border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={1000} className="bg-gray-800 text-white">快速 (1s)</option>
                  <option value={2000} className="bg-gray-800 text-white">正常 (2s)</option>
                  <option value={3000} className="bg-gray-800 text-white">慢速 (3s)</option>
                  <option value={4000} className="bg-gray-800 text-white">很慢 (4s)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 消息区域 */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
          {demoMessages.map((msg, index) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-4xl ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-4 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white backdrop-blur-sm'
                  }`}>
                    {msg.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  <div className={`flex-1 ${msg.type === 'user' ? 'text-left' : 'text-left'}`}>
                    <div className={`inline-block p-4 rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/30'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                    }`}>
                      {msg.type === 'assistant' ? (
                        msg.id === currentTypingMessageId ? (
                          <div className="whitespace-pre-wrap leading-relaxed">
                            <SimpleTypewriter
                              content={msg.content}
                              onComplete={handleTypingComplete}
                              speed={30}
                              className=""
                            />
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap leading-relaxed">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                strong: ({ children }) => (
                                  <strong className="font-bold text-white">{children}</strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-white/90">{children}</em>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0">{children}</p>
                                ),
                                code: ({ children }) => (
                                  <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="bg-white/10 p-3 rounded-lg overflow-x-auto text-sm font-mono">{children}</pre>
                                )
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      )}
                    </div>
                    
                    {/* 智能体激活提示 */}
                    {msg.agentActivations && msg.agentActivations.length > 0 && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl text-sm text-green-300 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="font-medium">🤖 激活智能体：{msg.agentActivations.join(', ')}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* 文件展示 */}
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="text-sm text-blue-300 font-medium bg-white/5 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                          📁 上传的多模态文件 ({msg.files.length}个):
                        </div>
                        {msg.files.map((file) => (
                          <MultimodalFileDisplay
                            key={file.id}
                            file={file}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-white/60 mt-3 flex items-center justify-between">
                      <span className="bg-white/5 px-2 py-1 rounded-full backdrop-blur-sm">{msg.timestamp.toLocaleTimeString()}</span>
                      {index === demoMessages.length - 1 && isAutoPlaying && (
                        <span className="ml-2 inline-flex items-center bg-green-500/20 px-2 py-1 rounded-full backdrop-blur-sm border border-green-400/30">
                          <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="ml-1 text-green-300 font-medium">正在播放...</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 底部状态栏 */}
        <div className="relative z-10 backdrop-blur-xl bg-white/5 border-t border-white/10 p-4 shadow-lg">
          <div className="flex items-center justify-between text-sm text-white/80">
            <div className="flex items-center space-x-4">
              <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                演示状态：<span className="text-blue-300 font-medium">{isAutoPlaying ? '播放中' : '已暂停'}</span>
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                播放速度：<span className="text-green-300 font-medium">{playbackSpeed === 1000 ? '快速' : playbackSpeed === 2000 ? '正常' : playbackSpeed === 3000 ? '慢速' : '很慢'}</span>
              </span>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
              <span>这是一个用户真实的测试案例，展示了完整的AI诊断流程</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}