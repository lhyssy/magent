import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import Layout from '@/components/Layout'
import Button from '@/components/Button'
import MultimodalFileDisplay from '@/components/MultimodalFileDisplay'
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
    if (!isAutoPlaying || !currentPresetCase || presetMessageIndex >= currentPresetCase.messages.length) {
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
  }, [isAutoPlaying, currentPresetCase, presetMessageIndex, playbackSpeed])

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
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* 顶部控制栏 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
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
                <Bot className="w-6 h-6 text-blue-500" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentPresetCase.title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>演示进度</span>
              <span>{presetMessageIndex} / {currentPresetCase.messages.length} ({getProgressPercentage()}%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 控制面板 */}
        {showControls && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={handleStepBackward}
                size="sm"
                variant="outline"
                disabled={presetMessageIndex <= 0}
              >
                <Rewind className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handlePlayPause}
                size="sm"
                className="px-6"
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="ml-2">
                  {isAutoPlaying ? '暂停' : presetMessageIndex >= currentPresetCase.messages.length ? '重播' : '播放'}
                </span>
              </Button>
              
              <Button
                onClick={handleStepForward}
                size="sm"
                variant="outline"
                disabled={presetMessageIndex >= currentPresetCase.messages.length}
              >
                <FastForward className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handleRestart}
                size="sm"
                variant="outline"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-500" />
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={1000}>快速 (1s)</option>
                  <option value={2000}>正常 (2s)</option>
                  <option value={3000}>慢速 (3s)</option>
                  <option value={4000}>很慢 (4s)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {demoMessages.map((msg, index) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-4xl ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-4 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {msg.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  <div className={`flex-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-4 rounded-lg shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                    
                    {/* 智能体激活提示 */}
                    {msg.agentActivations && msg.agentActivations.length > 0 && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300">
                        🤖 激活智能体：{msg.agentActivations.join(', ')}
                      </div>
                    )}
                    
                    {/* 文件展示 */}
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
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
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {msg.timestamp.toLocaleTimeString()}
                      {index === demoMessages.length - 1 && isAutoPlaying && (
                        <span className="ml-2 inline-flex items-center">
                          <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="ml-1">正在播放...</span>
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
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>演示状态：{isAutoPlaying ? '播放中' : '已暂停'}</span>
              <span>播放速度：{playbackSpeed === 1000 ? '快速' : playbackSpeed === 2000 ? '正常' : playbackSpeed === 3000 ? '慢速' : '很慢'}</span>
            </div>
            <div>
              <span>这是一个预设的演示案例，展示了完整的AI诊断流程</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}