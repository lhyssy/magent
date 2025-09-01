import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusIndicator from '@/components/StatusIndicator';
import ProgressBar from '@/components/ProgressBar';
import { Play, Pause, RotateCcw, Brain, Eye, Mic, Video, MessageSquare, Zap, ArrowRight, Users, Upload, Monitor, MessageCircle, FileText } from 'lucide-react';

export default function Demo() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    { title: '数据上传', description: '上传fNIRS、EEG、音频、视频数据', progress: 100 },
    { title: '数据预处理', description: '清洗和标准化多模态数据', progress: 100 },
    { title: 'fNIRS分析', description: 'fNIRS智能体分析血氧数据', progress: 100 },
    { title: 'EEG分析', description: 'EEG智能体分析脑电数据', progress: 85 },
    { title: '音频分析', description: '音频智能体分析语音特征', progress: 60 },
    { title: '视频分析', description: '视频智能体分析面部表情', progress: 30 },
    { title: '数据整合', description: '协调智能体整合分析结果', progress: 0 },
    { title: '智能体辩论', description: '多智能体协商诊断结果', progress: 0 },
    { title: '生成报告', description: '输出最终诊断报告', progress: 0 }
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">多智能体心理诊断演示系统</h1>
            <p className="text-gray-600 mb-6">体验先进的多智能体协作心理诊断技术，感受AI驱动的精准医疗</p>
            
            {/* 快速体验入口 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">开始您的诊断体验</h2>
                  <p className="text-blue-100 mb-4">与总理智能体对话，上传多模态数据，观察智能体协作诊断过程</p>
                  <Button 
                    variant="secondary" 
                    icon={<Play className="h-4 w-4" />}
                    onClick={() => navigate('/chat')}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    立即开始体验
                  </Button>
                </div>
                <div className="hidden md:block">
                  <Brain className="h-24 w-24 text-blue-200" />
                </div>
              </div>
            </div>
            
            {/* 演示流程导航 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div 
                className="bg-white border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/chat')}
              >
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900 text-sm">智能对话</div>
                <div className="text-xs text-gray-500">与总理智能体交流</div>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/upload')}
              >
                <Upload className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900 text-sm">资料上传</div>
                <div className="text-xs text-gray-500">上传多模态数据</div>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/monitor')}
              >
                <Monitor className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900 text-sm">诊断监控</div>
                <div className="text-xs text-gray-500">观察智能体工作</div>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/debate')}
              >
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900 text-sm">辩论观察</div>
                <div className="text-xs text-gray-500">智能体协商过程</div>
              </div>
              
              <div 
                className="bg-white border border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/report')}
              >
                <FileText className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900 text-sm">诊断报告</div>
                <div className="text-xs text-gray-500">查看最终结果</div>
              </div>
            </div>
          </div>

          {/* 演示控制 */}
          <Card title="演示控制" subtitle="控制演示流程的播放和重置" className="mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant={isPlaying ? "outline" : "primary"}
                icon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                onClick={handlePlayPause}
              >
                {isPlaying ? '暂停演示' : '开始演示'}
              </Button>
              
              <Button 
                variant="outline"
                icon={<RotateCcw className="h-4 w-4" />}
                onClick={handleReset}
              >
                重置演示
              </Button>
              
              <div className="flex-1">
                <ProgressBar 
                  progress={(currentStep / (demoSteps.length - 1)) * 100} 
                  label="整体进度" 
                  color="blue" 
                  size="md" 
                />
              </div>
            </div>
          </Card>

          {/* 系统架构概览 */}
          <Card title="系统架构" subtitle="多智能体协作诊断架构" className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  专业智能体
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-medium text-blue-800">fNIRS智能体</div>
                    <div className="text-xs text-blue-600">血氧分析</div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="font-medium text-green-800">EEG智能体</div>
                    <div className="text-xs text-green-600">脑电分析</div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                    <Mic className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-medium text-purple-800">音频智能体</div>
                    <div className="text-xs text-purple-600">语音分析</div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                    <Video className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="font-medium text-orange-800">视频智能体</div>
                    <div className="text-xs text-orange-600">表情分析</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center">
                  <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                  协调机制
                </h4>
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">协调智能体</span>
                    </div>
                    <p className="text-yellow-700 text-sm">
                      整合各专业智能体的分析结果，协调诊断过程
                    </p>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">辩论机制</span>
                    </div>
                    <p className="text-red-700 text-sm">
                      当诊断结果存在分歧时，启动智能体间的辩论协商
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 演示流程 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card title="演示流程" subtitle="当前演示的详细步骤">
              <div className="space-y-3">
                {demoSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      index === currentStep ? 'bg-blue-50 border-blue-200' : 
                      index < currentStep ? 'bg-green-50 border-green-200' : 
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${
                        index === currentStep ? 'text-blue-800' : 
                        index < currentStep ? 'text-green-800' : 
                        'text-gray-600'
                      }`}>
                        {index + 1}. {step.title}
                      </span>
                      <span className={`text-sm ${
                        index === currentStep ? 'text-blue-600' : 
                        index < currentStep ? 'text-green-600' : 
                        'text-gray-500'
                      }`}>
                        {step.progress}%
                      </span>
                    </div>
                    <p className={`text-sm ${
                      index === currentStep ? 'text-blue-700' : 
                      index < currentStep ? 'text-green-700' : 
                      'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                    {(index <= currentStep || step.progress > 0) && (
                      <div className="mt-2">
                        <ProgressBar 
                          progress={step.progress} 
                          showPercentage={false} 
                          color={index < currentStep ? "green" : "blue"} 
                          size="sm" 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="实时状态" subtitle="当前智能体的工作状态">
              <div className="space-y-4">
                <StatusIndicator 
                  status="completed" 
                  label="fNIRS智能体" 
                  description="血氧数据分析完成，检测到DLPFC异常"
                />
                <StatusIndicator 
                  status="running" 
                  label="EEG智能体" 
                  description="正在分析α波和θ波模式..."
                />
                <StatusIndicator 
                  status="running" 
                  label="音频智能体" 
                  description="正在提取语音特征和情感标记..."
                />
                <StatusIndicator 
                  status="pending" 
                  label="视频智能体" 
                  description="等待面部表情数据处理"
                />
                <StatusIndicator 
                  status="pending" 
                  label="协调智能体" 
                  description="等待各智能体完成初步分析"
                />
              </div>
            </Card>
          </div>

          {/* 技术特点 */}
          <Card title="技术特点" subtitle="系统的核心技术优势">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">多模态融合</h4>
                <p className="text-gray-600 text-sm">
                  整合fNIRS、EEG、音频、视频等多种生理和行为数据
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">智能体协作</h4>
                <p className="text-gray-600 text-sm">
                  多个专业智能体协同工作，通过辩论机制提高诊断准确性
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">实时分析</h4>
                <p className="text-gray-600 text-sm">
                  实时处理和分析数据，快速生成诊断结果和治疗建议
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}