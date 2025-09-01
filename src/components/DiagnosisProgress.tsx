import React from 'react'
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface DiagnosisProgressProps {
  isActive: boolean
  progress: number
  currentStage: string
  estimatedTime: string
  onComplete?: () => void
}

const DiagnosisProgress: React.FC<DiagnosisProgressProps> = ({
  isActive,
  progress,
  currentStage,
  estimatedTime,
  onComplete
}) => {
  if (!isActive) return null

  const getProgressColor = () => {
    if (progress >= 100) return 'from-green-500 to-emerald-600'
    if (progress >= 75) return 'from-blue-500 to-indigo-600'
    if (progress >= 50) return 'from-yellow-500 to-orange-600'
    return 'from-gray-400 to-gray-500'
  }

  const getStatusIcon = () => {
    if (progress >= 100) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (progress >= 75) return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
    return <Clock className="w-5 h-5 text-orange-600" />
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200/60 rounded-3xl p-6 shadow-xl backdrop-blur-md mx-4 my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            智能诊断进行中
          </h3>
        </div>
        <div className="text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full border border-gray-200/50">
          预计 {estimatedTime}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{currentStage}</span>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
          <div 
            className={`bg-gradient-to-r ${getProgressColor()} h-3 rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse" />
            {progress < 100 && (
              <div className="absolute right-0 top-0 h-full w-2 bg-white/50 animate-pulse" />
            )}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600 bg-white/40 rounded-lg p-3 border border-gray-200/30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span>多智能体协作分析系统正在处理您的数据...</span>
        </div>
        <div className="mt-2 text-gray-500">
          • EEG分析师、fNIRS分析师、音频分析师、视频分析师、图像分析师正在并行工作
        </div>
      </div>
    </div>
  )
}

export default DiagnosisProgress