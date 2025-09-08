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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* 动态背景元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-400/20 to-cyan-600/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-2xl animate-breathing"></div>
        </div>
        
        <div className="relative z-10 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-4 animate-fade-in-up">多智能体心理诊断演示系统</h1>
              <p className="text-gray-600 text-lg lg:text-xl mb-6 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>体验先进的多智能体协作心理诊断技术，感受AI驱动的精准医疗</p>
            </div>
            
            {/* 快速体验入口 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="glass-card hover:shadow-glow transition-all duration-500 cursor-pointer group animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <div className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">开始演示</h3>
                  <p className="text-gray-600 text-sm">观看完整的诊断流程演示</p>
                </div>
              </Card>
              
              <Card className="glass-card hover:shadow-glow transition-all duration-500 cursor-pointer group animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">智能对话</h3>
                  <p className="text-gray-600 text-sm">与AI智能体进行交互对话</p>
                </div>
              </Card>
              
              <Card className="glass-card hover:shadow-glow transition-all duration-500 cursor-pointer group animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                <div className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">查看报告</h3>
                  <p className="text-gray-600 text-sm">浏览详细的诊断分析报告</p>
                </div>
              </Card>
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

          {/* 演示控制栏 */}
          <Card title="演示控制" subtitle="控制演示播放和进度" className="glass-card mb-6 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center space-x-4">
              <Button 
                variant={isPlaying ? "secondary" : "primary"}
                icon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                onClick={handlePlayPause}
                className="btn-gradient shadow-glow"
              >
                {isPlaying ? '暂停演示' : '播放演示'}
              </Button>
              
              <Button 
                variant="outline" 
                icon={<RotateCcw className="h-4 w-4" />}
                onClick={handleReset}
                className="glass-effect shadow-glow"
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
          <Card title="系统架构" subtitle="多智能体协作诊断架构" className="glass-card mb-6 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center text-gray-800">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  专业智能体
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-effect border border-blue-200/50 rounded-lg p-3 text-center hover:shadow-glow transition-all duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-medium text-blue-800">fNIRS智能体</div>
                    <div className="text-xs text-blue-600">血氧分析</div>
                  </div>
                  
                  <div className="glass-effect border border-green-200/50 rounded-lg p-3 text-center hover:shadow-glow transition-all duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-medium text-green-800">EEG智能体</div>
                    <div className="text-xs text-green-600">脑电分析</div>
                  </div>
                  
                  <div className="glass-effect border border-purple-200/50 rounded-lg p-3 text-center hover:shadow-glow transition-all duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <Mic className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-medium text-purple-800">音频智能体</div>
                    <div className="text-xs text-purple-600">语音分析</div>
                  </div>
                  
                  <div className="glass-effect border border-orange-200/50 rounded-lg p-3 text-center hover:shadow-glow transition-all duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div className="font-medium text-orange-800">视频智能体</div>
                    <div className="text-xs text-orange-600">表情分析</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center text-gray-800">
                  <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                  协调机制
                </h4>
                <div className="space-y-3">
                  <div className="glass-effect border border-yellow-200/50 rounded-lg p-4 hover:shadow-glow transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-yellow-800">协调智能体</span>
                    </div>
                    <p className="text-yellow-700 text-sm leading-relaxed">
                      整合各专业智能体的分析结果，协调诊断过程
                    </p>
                  </div>
                  
                  <div className="glass-effect border border-red-200/50 rounded-lg p-4 hover:shadow-glow transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-red-800">辩论机制</span>
                    </div>
                    <p className="text-red-700 text-sm leading-relaxed">
                      当诊断结果存在分歧时，启动智能体间的辩论协商
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 演示流程 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card title="演示流程" subtitle="当前演示的详细步骤" className="glass-card animate-fade-in-up" style={{animationDelay: '0.8s'}}>
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

            <Card title="实时状态" subtitle="当前智能体的工作状态" className="glass-card animate-fade-in-up" style={{animationDelay: '0.9s'}}>
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
          <Card title="技术特点" subtitle="系统的核心技术优势" className="glass-card animate-fade-in-up" style={{animationDelay: '1.0s'}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:shadow-xl transition-all duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">多模态融合</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  整合fNIRS、EEG、音频、视频等多种生理和行为数据
                </p>
              </div>
              
              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:shadow-xl transition-all duration-300">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">智能体协作</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  多个专业智能体协同工作，通过辩论机制提高诊断准确性
                </p>
              </div>
              
              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:shadow-xl transition-all duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">实时分析</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
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