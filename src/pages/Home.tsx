import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Zap, Heart, ArrowRight, Play } from 'lucide-react';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // 案例数据
  const demosCases = [
    {
      id: 'depression',
      title: '抑郁症诊断分析',
      description: '通过文本情感分析和音频语调检测，结合多模态数据进行抑郁症风险评估',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      features: ['文本情感分析', '音频语调检测', 'fNIRS脑功能成像']
    },
    {
      id: 'anxiety',
      title: '焦虑症评估',
      description: '基于视频面部表情识别和EEG脑电信号分析，精准评估焦虑症状严重程度',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      features: ['视频表情识别', 'EEG脑电分析', '生理指标监测']
    },
    {
      id: 'comprehensive',
      title: '综合心理健康评估',
      description: '整合所有模态数据，提供全面的心理健康状况评估和个性化建议',
      icon: Heart,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      features: ['多模态数据融合', '智能体协作分析', '个性化建议']
    }
  ];

  // 处理案例点击 - 跳转到预设演示
  const handleCaseClick = (caseData: typeof demosCases[0]) => {
    // 跳转到预设演示页面
    navigate('/preset-demo', { 
      state: { 
        caseType: caseData.id 
      } 
    });
  };



  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden animate-fade-in-up">
        {/* 动态背景元素 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="relative z-10">
          {/* 主标题区域 */}
          <div className="text-center py-20 px-4 pt-24">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 animate-fade-in-scale">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 leading-tight animate-neon-glow hover:scale-105 transition-transform duration-500">连心智诊师</h1>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full animate-shimmer"></div>
              </div>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                多智能体心理疾病诊断系统，融合 <span className="text-blue-400 font-semibold">fNIRS</span>、<span className="text-purple-400 font-semibold">EEG</span>、<span className="text-pink-400 font-semibold">音频</span>、<span className="text-green-400 font-semibold">视频</span> 等多模态数据
                <br />
                通过智能体协作提供精准的心理健康评估
              </p>
              <div className="flex justify-center space-x-6">
                <Button 
                  disabled 
                  className="px-10 py-4 text-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl shadow-2xl cursor-not-allowed opacity-60 backdrop-blur-sm border border-white/10"
                >
                  正在实现中
                </Button>
                <Button 
                  disabled 
                  variant="outline" 
                  className="px-10 py-4 text-lg border-2 border-white/20 text-gray-300 rounded-2xl cursor-not-allowed opacity-60 backdrop-blur-sm hover:bg-white/5"
                >
                  了解更多
                </Button>
              </div>
            </div>
          </div>

          {/* 使用示例案例 */}
          <div className="max-w-7xl mx-auto px-4 pb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">使用示例</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">探索我们的智能诊断案例，体验多模态数据分析的强大能力</p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {demosCases.map((caseItem) => {
              const IconComponent = caseItem.icon;
              return (
                <Card 
                  key={caseItem.id} 
                  className="group glass-card card-3d hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-3 cursor-pointer border-0 shadow-xl animate-fade-in-up"
                  onClick={() => handleCaseClick(caseItem)}
                  style={{animationDelay: `${caseItem.id === 'depression' ? '0.2s' : caseItem.id === 'anxiety' ? '0.4s' : '0.6s'}`}}
                >
                  <div className="p-8">
                    {/* 图标和渐变背景 */}
                    <div className="relative mb-8">
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${caseItem.color} flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg animate-float avatar-glow`}>
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <div className={`absolute inset-0 w-20 h-20 rounded-3xl bg-gradient-to-r ${caseItem.color} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 animate-glow-pulse`}></div>
                    </div>
                    
                    {/* 标题和描述 */}
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-4 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                      {caseItem.title}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed text-sm">
                      {caseItem.description}
                    </p>
                    
                    {/* 特性标签 */}
                    <div className="space-y-2 mb-8">
                      {caseItem.features.map((feature, index) => (
                        <div key={index} className="inline-block px-3 py-1.5 bg-white/10 backdrop-blur-sm text-gray-300 text-xs rounded-full mr-2 mb-2 border border-white/10 hover:bg-white/20 transition-colors duration-300">
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex items-center justify-end">
                      <div className="flex items-center space-x-2 text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                        <Play className="h-4 w-4" />
                        <span className="text-sm font-medium">观看演示</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

          {/* 底部说明 */}
          <div className="bg-black/20 backdrop-blur-xl py-16 mt-16 border-t border-white/10">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">智能体协作诊断</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                我们的系统采用多智能体协作架构，每个智能体专门负责不同模态的数据分析，
                通过协调智能体整合所有分析结果，为您提供全面、准确的心理健康评估报告。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;