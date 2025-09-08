import React, { useState } from 'react'
import { X, Play, Pause, Download, Eye, BarChart3, Brain, Activity } from 'lucide-react'
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = () => {
    if (file.type.includes('video')) return <Play className="w-6 h-6 text-red-500" />
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

  const renderPreview = () => {
    if (!file.preview) {
      return (
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            {getFileIcon()}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No preview available</p>
          </div>
        </div>
      )
    }

    if (file.type.includes('video')) {
      return (
        <div className="relative w-full h-48 bg-black rounded-lg overflow-hidden">
          <img 
            src={file.preview} 
            alt="Video preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              variant="ghost"
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-black rounded-full p-3"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            Video File
          </div>
        </div>
      )
    }

    if (file.type.includes('audio')) {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg overflow-hidden">
          <img 
            src={file.preview} 
            alt="Audio waveform" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              variant="ghost"
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      )
    }

    // EEG, fNIRS, and other medical data
    return (
      <div className="w-full h-48 rounded-lg overflow-hidden cursor-pointer" onClick={() => setShowFullPreview(true)}>
        <img 
          src={file.preview} 
          alt={`${getFileTypeLabel()} preview`} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {getFileTypeLabel()}
        </div>
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
          {renderPreview()}
        </div>

        {file.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {file.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setShowFullPreview(true)}
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
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

      {/* Full Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {getFileIcon()}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{file.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getFileTypeLabel()} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowFullPreview(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              {file.preview && (
                <div className="mb-4">
                  <img 
                    src={file.preview} 
                    alt={`${getFileTypeLabel()} full preview`} 
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
              )}
              
              {file.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Details</h4>
                  <p className="text-gray-600 dark:text-gray-300">{file.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">File Type:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">{getFileTypeLabel()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">File Size:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">{formatFileSize(file.size)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Status:</span>
                  <span className="ml-2 text-green-600 dark:text-green-400">Processing Complete</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Format:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">{file.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MultimodalFileDisplay