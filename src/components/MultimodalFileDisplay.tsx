import React from 'react'
import { X, Download, BarChart3, Brain, Activity, Eye } from 'lucide-react'
import Button from './Button'

interface FileDisplayProps {
  file: {
    id: string
    name: string
    type: string
    size: number
    url?: string
    preview?: string
    description?: string
  }
  onClose?: () => void
}

const MultimodalFileDisplay: React.FC<FileDisplayProps> = ({ file, onClose }) => {

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = () => {
    if (file.type.includes('video')) return <Activity className="w-6 h-6 text-red-500" />
    if (file.type.includes('audio')) return <Activity className="w-6 h-6 text-green-500" />
    if (file.type.includes('edf') || file.name.includes('eeg')) return <BarChart3 className="w-6 h-6 text-blue-500" />
    if (file.type.includes('mat') || file.name.includes('fnirs')) return <Brain className="w-6 h-6 text-purple-500" />
    if (file.type.includes('image')) return <Eye className="w-6 h-6 text-orange-500" />
    return <BarChart3 className="w-6 h-6 text-gray-500" />
  }

  const getFileTypeLabel = () => {
    if (file.type.includes('video')) return 'Video'
    if (file.type.includes('audio')) return 'Audio'
    if (file.type.includes('edf') || file.name.includes('eeg')) return 'EEG Data'
    if (file.type.includes('mat') || file.name.includes('fnirs')) return 'fNIRS Data'
    if (file.type.includes('image')) return 'Image'
    if (file.type.includes('pdf')) return 'Document'
    return 'Data File'
  }

  // 简化文件显示，只显示文件名
  const renderFileInfo = () => {
    return (
      <div className="text-center py-2">
        <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getFileIcon()}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">{file.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getFileTypeLabel()} • {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="relative mb-3">
          {renderFileInfo()}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Processing...
          </div>
        </div>
      </div>


    </>
  )
}

export default MultimodalFileDisplay