import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Brain, Mic, Video, X, CheckCircle, AlertCircle, Eye, ArrowRight, Info, Clock, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import ProgressBar from '@/components/ProgressBar';
import { useUploadStore, useAppStore } from '../store';
import { uploadApi } from '../utils/api';
import { useNotificationWebSocket } from '@/hooks/useWebSocket';

interface UploadFile {
  id: string;
  file: File;
  type: 'fnirs' | 'eeg' | 'audio' | 'video';
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  preview?: string;
}

export default function Upload() {
  const navigate = useNavigate();
  const { addNotification } = useAppStore();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState<'fnirs' | 'eeg' | 'audio' | 'video'>('fnirs');
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // WebSocket连接
  const {
    isConnected,
    onUploadProgress,
    onUploadComplete,
    onNotification
  } = useNotificationWebSocket();

  // 上传步骤定义
  const uploadSteps = [
    {
      id: 1,
      title: '选择数据类型',
      description: '选择要上传的多模态数据类型',
      icon: FileText
    },
    {
      id: 2,
      title: '上传文件',
      description: '拖拽或选择文件进行上传',
      icon: UploadIcon
    },
    {
      id: 3,
      title: '数据验证',
      description: '系统自动验证数据格式和完整性',
      icon: CheckCircle
    },
    {
      id: 4,
      title: '开始分析',
      description: '启动多智能体协同分析',
      icon: Users
    }
  ];

  // 支持的文件类型
  const fileTypes = {
    fnirs: { extensions: ['.nirs', '.snirf', '.mat'], accept: '.nirs,.snirf,.mat' },
    eeg: { extensions: ['.edf', '.bdf', '.set', '.fdt'], accept: '.edf,.bdf,.set,.fdt' },
    audio: { extensions: ['.wav', '.mp3', '.flac'], accept: '.wav,.mp3,.flac' },
    video: { extensions: ['.mp4', '.avi', '.mov'], accept: '.mp4,.avi,.mov' }
  };

  // 验证文件类型
  const validateFile = (file: File, type: string): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return fileTypes[type as keyof typeof fileTypes].extensions.includes(extension);
  };

  // 处理文件选择
  const handleFileSelect = useCallback((files: FileList | null, type: string) => {
    if (!files) return;

    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validateFile(file, type)) {
        addNotification({
          type: 'error',
          title: '文件类型不支持',
          message: `${file.name} 不是支持的${type.toUpperCase()}文件格式`
        });
        continue;
      }

      const uploadFile: UploadFile = {
        id: Date.now().toString() + i,
        file,
        type: type as any,
        progress: 0,
        status: 'pending'
      };

      // 为图片和视频生成预览
      if (type === 'video' && file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        uploadFile.preview = url;
      }

      newFiles.push(uploadFile);
    }

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, [addNotification]);

  // 拖拽处理
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files, selectedType);
    }
  }, [handleFileSelect, selectedType]);

  // 上传单个文件
  const uploadSingleFile = async (uploadFile: UploadFile) => {
    try {
      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)
      );

      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('type', uploadFile.type);
      formData.append('patientId', 'demo-patient'); // 演示用患者ID

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => 
          prev.map(f => {
            if (f.id === uploadFile.id && f.progress < 90) {
              return { ...f, progress: f.progress + Math.random() * 20 };
            }
            return f;
          })
        );
      }, 500);

      const response = await uploadApi.uploadSingle(uploadFile.file, uploadFile.type, 'demo-patient', '演示上传');
      
      clearInterval(progressInterval);

      if (response.success) {
        setUploadFiles(prev => 
          prev.map(f => f.id === uploadFile.id ? 
            { ...f, status: 'completed', progress: 100 } : f
          )
        );
        
        addNotification({
          type: 'success',
          title: '上传成功',
          message: `${uploadFile.file.name} 上传完成`
        });
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error) {
      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? 
          { ...f, status: 'error', error: error instanceof Error ? error.message : '上传失败' } : f
        )
      );
      
      addNotification({
        type: 'error',
        title: '上传失败',
        message: `${uploadFile.file.name}: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  };

  // 批量上传
  const handleBatchUpload = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await uploadSingleFile(file);
    }
  };

  // 删除文件
  const removeFile = (id: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // 清空所有文件
  const clearAllFiles = () => {
    uploadFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setUploadFiles([]);
  };

  // WebSocket事件监听
  useEffect(() => {
    if (!isConnected) return;

    // 监听上传进度更新
    onUploadProgress((data) => {
      console.log('上传进度更新:', data);
      setUploadFiles(prev => prev.map(file => 
        file.id === data.fileId 
          ? { ...file, progress: data.progress, status: 'uploading' }
          : file
      ));
    });

    // 监听上传完成
    onUploadComplete((data) => {
      console.log('上传完成:', data);
      setUploadFiles(prev => prev.map(file => 
        file.id === data.fileId 
          ? { 
              ...file, 
              progress: 100, 
              status: data.success ? 'completed' : 'error',
              uploadId: data.uploadId 
            }
          : file
      ));
      
      if (data.success) {
        addNotification({
          type: 'success',
          title: '上传成功',
          message: `文件 ${data.fileName} 上传成功`
        });
      } else {
        addNotification({
          type: 'error',
          title: '上传失败',
          message: `文件 ${data.fileName} 上传失败: ${data.error}`
        });
      }
    });

    // 监听通用通知
    onNotification((data) => {
      console.log('收到通知:', data);
      if (data.type === 'upload') {
        addNotification({
          type: 'info',
          title: '上传通知',
          message: data.message
        });
      }
    });

  }, [isConnected, onUploadProgress, onUploadComplete, onNotification, addNotification]);

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 处理下一步
  const handleNextStep = () => {
    if (currentStep < uploadSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 处理上一步
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 开始分析
  const handleStartAnalysis = () => {
    navigate('/monitor');
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题和状态 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">多模态数据上传</h1>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">上传fNIRS、EEG、音频和视频数据，启动智能体协同分析</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-500">
                    {isConnected ? '实时连接' : '连接断开'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/demo')}
                >
                  返回首页
                </Button>
              </div>
            </div>
          </div>

          {/* 上传步骤指示器 */}
          <Card className="mb-8">
            <div className="p-6">
              <div className="flex items-center justify-between">
                {uploadSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted 
                            ? 'bg-green-500 border-green-500 text-white'
                            : isActive 
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <Icon className="h-6 w-6" />
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 max-w-24">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      {index < uploadSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-4 ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
          
          {/* 步骤1: 数据类型选择 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Info className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900">选择数据类型</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    请选择您要上传的多模态数据类型。系统支持同时处理多种类型的数据，以提供更全面的心理诊断分析。
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card 
                      className={`p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
                        selectedType === 'fnirs' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-center" onClick={() => setSelectedType('fnirs')}>
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Brain className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">fNIRS数据</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          功能性近红外光谱数据
                        </p>
                        <p className="text-xs text-gray-500">
                          支持: {fileTypes.fnirs.extensions.join(', ')}
                        </p>
                      </div>
                    </Card>

                    <Card 
                      className={`p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
                        selectedType === 'eeg' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-center" onClick={() => setSelectedType('eeg')}>
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">EEG数据</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          脑电图数据文件
                        </p>
                        <p className="text-xs text-gray-500">
                          支持: {fileTypes.eeg.extensions.join(', ')}
                        </p>
                      </div>
                    </Card>

                    <Card 
                      className={`p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
                        selectedType === 'audio' ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-center" onClick={() => setSelectedType('audio')}>
                        <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Mic className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">音频数据</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          语音录音文件
                        </p>
                        <p className="text-xs text-gray-500">
                          支持: {fileTypes.audio.extensions.join(', ')}
                        </p>
                      </div>
                    </Card>

                    <Card 
                      className={`p-6 hover:shadow-lg transition-all cursor-pointer border-2 ${
                        selectedType === 'video' ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="text-center" onClick={() => setSelectedType('video')}>
                        <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Video className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">视频数据</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          面部表情视频
                        </p>
                        <p className="text-xs text-gray-500">
                          支持: {fileTypes.video.extensions.join(', ')}
                        </p>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button onClick={handleNextStep}>
                      下一步：上传文件
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 步骤2: 文件上传 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <UploadIcon className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900">上传{selectedType.toUpperCase()}文件</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    请上传您的{selectedType.toUpperCase()}数据文件。系统将自动验证文件格式并进行预处理。
                  </p>
                  
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      拖拽{selectedType.toUpperCase()}文件到此处
                    </h3>
                    <p className="text-gray-600 mb-4">或者点击选择文件上传</p>
                    <Button 
                      className="mb-4"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      选择文件
                    </Button>
                    <p className="text-sm text-gray-500">
                      支持格式：{fileTypes[selectedType].extensions.join(', ')}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={fileTypes[selectedType].accept}
                      onChange={(e) => handleFileSelect(e.target.files, selectedType)}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePrevStep}>
                      上一步
                    </Button>
                    <Button 
                      onClick={handleNextStep}
                      disabled={uploadFiles.length === 0}
                    >
                      下一步：验证数据
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 文件列表 - 在步骤2中显示 */}
          {currentStep === 2 && uploadFiles.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">已选择的文件</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      共 {uploadFiles.length} 个文件
                    </span>
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        onClick={handleBatchUpload}
                        disabled={!uploadFiles.some(f => f.status === 'pending')}
                      >
                        批量上传
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={clearAllFiles}
                      >
                        清空列表
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                  {uploadFiles.map((uploadFile) => {
                    const getStatusIcon = () => {
                      switch (uploadFile.status) {
                        case 'completed':
                          return <CheckCircle className="h-5 w-5 text-green-500" />;
                        case 'error':
                          return <AlertCircle className="h-5 w-5 text-red-500" />;
                        case 'uploading':
                          return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />;
                        default:
                          return <FileText className="h-5 w-5 text-gray-400" />;
                      }
                    };
                    
                    const getStatusColor = () => {
                      switch (uploadFile.status) {
                        case 'completed': return 'green';
                        case 'error': return 'red';
                        case 'uploading': return 'blue';
                        default: return 'gray';
                      }
                    };
                    
                    return (
                      <div key={uploadFile.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon()}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {uploadFile.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(uploadFile.file.size)} • {uploadFile.type.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {uploadFile.preview && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(uploadFile.preview, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {uploadFile.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => uploadSingleFile(uploadFile)}
                              >
                                上传
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => removeFile(uploadFile.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {uploadFile.status === 'uploading' && (
                          <div className="mb-2">
                            <ProgressBar 
                              progress={uploadFile.progress} 
                              color={getStatusColor() as any}
                              size="sm"
                            />
                          </div>
                        )}
                        
                        {uploadFile.error && (
                          <p className="text-sm text-red-600 mt-2">
                            错误: {uploadFile.error}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            </Card>
          )}

          {/* 步骤3: 数据验证 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900">数据验证</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    系统正在验证您上传的数据文件格式和完整性，确保数据质量符合分析要求。
                  </p>
                  
                  <div className="space-y-4">
                    {uploadFiles.map((file) => {
                      const isValidated = file.status === 'completed';
                      const isValidating = file.status === 'uploading';
                      
                      return (
                        <div key={file.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isValidated ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : isValidating ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {file.file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.file.size)} • {file.type.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm">
                              {isValidated && (
                                <span className="text-green-600 font-medium">验证通过</span>
                              )}
                              {isValidating && (
                                <span className="text-blue-600 font-medium">验证中...</span>
                              )}
                              {!isValidated && !isValidating && (
                                <span className="text-gray-500 font-medium">等待验证</span>
                              )}
                            </div>
                          </div>
                          {isValidating && (
                            <div className="mt-2">
                              <ProgressBar progress={file.progress} color="blue" size="sm" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handlePrevStep}>
                      上一步
                    </Button>
                    <Button 
                      onClick={handleNextStep}
                      disabled={!uploadFiles.every(f => f.status === 'completed')}
                    >
                      下一步：开始分析
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* 步骤4: 开始分析 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900">启动多智能体分析</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    数据验证完成！现在可以启动多智能体协同分析系统，开始心理诊断流程。
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-800 font-medium">数据准备就绪</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      已成功上传并验证 {uploadFiles.length} 个{selectedType.toUpperCase()}数据文件
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">分析模式</h4>
                      <p className="text-sm text-gray-600">多智能体协同分析</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">数据类型</h4>
                      <p className="text-sm text-gray-600">{selectedType.toUpperCase()}数据</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">文件数量</h4>
                      <p className="text-sm text-gray-600">{uploadFiles.length} 个文件</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">预计时间</h4>
                      <p className="text-sm text-gray-600">5-10 分钟</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep}>
                      上一步
                    </Button>
                    <Button onClick={handleStartAnalysis} className="bg-green-600 hover:bg-green-700">
                      开始分析
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}