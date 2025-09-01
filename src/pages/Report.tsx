import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  FileText, 
  Download, 
  Share2, 
  Brain, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface DiagnosisReport {
  session_id: string;
  analysis_result: string;
  debate_result: string;
  final_report: string;
  created_at: string;
  confidence_score?: number;
  recommendations?: string[];
}

export default function Report() {
  const navigate = useNavigate();
  
  // 静态诊断报告数据
  const staticReport: DiagnosisReport = {
    session_id: 'demo-session-789abc',
    analysis_result: `经过深入的心理状态分析，患者表现出以下特征：

1. 情绪状态：患者近期情绪波动较大，表现出明显的焦虑和抑郁倾向。在描述日常生活时，语调低沉，缺乏积极情绪表达。

2. 认知模式：存在明显的负性思维模式，倾向于灾难化思考和过度概括。对未来持悲观态度，自我评价偏低。

3. 行为表现：社交回避行为增加，对以往感兴趣的活动失去兴趣。睡眠质量下降，食欲不振。

4. 生理症状：报告有头痛、胸闷、心悸等躯体化症状，这些症状在心理压力增大时更为明显。

综合分析认为，患者可能存在中度抑郁和焦虑状态，建议进一步评估和干预。`,
    debate_result: `经过严格的诊断验证和质疑过程，我们对初步分析结果进行了以下验证：

质疑点1：症状是否符合诊断标准？
验证结果：患者症状持续时间超过2周，严重程度达到中度水平，符合相关诊断标准。

质疑点2：是否排除了其他可能的原因？
验证结果：已排除药物副作用、内科疾病等其他可能原因，心理因素为主要致病因素。

质疑点3：诊断的可靠性如何？
验证结果：基于多维度评估，包括症状学、病程、功能损害等方面，诊断具有较高可靠性。

质疑点4：治疗建议是否合适？
验证结果：建议的心理治疗和药物治疗方案符合循证医学证据，适合患者当前状态。

经过充分辩论和验证，确认初步诊断和治疗建议的合理性。`,
    final_report: `多智能体协作诊断报告

患者基本信息：
- 会话ID：demo-session-789abc
- 评估时间：${new Date().toLocaleString()}

诊断结论：
根据多智能体协作分析，患者目前存在中度抑郁和焦虑状态。主要表现为情绪低落、兴趣减退、睡眠障碍、认知功能下降等症状。

病情评估：
1. 严重程度：中度
2. 病程：急性发作期
3. 功能损害：中等程度的社会功能和职业功能受损
4. 自杀风险：低风险（需持续监测）

治疗建议：
1. 心理治疗：建议认知行为治疗（CBT），每周1-2次，持续12-16周
2. 药物治疗：如症状严重可考虑抗抑郁药物治疗
3. 生活方式调整：规律作息、适度运动、社交支持
4. 定期随访：建议2周后复诊评估

预后评估：
在适当治疗下，预后良好。预计3-6个月内症状可显著改善。

注意事项：
- 如出现自杀念头或行为，请立即就医
- 治疗过程中如有不适，及时联系医生
- 家属应给予理解和支持`,
    created_at: new Date().toISOString(),
    confidence_score: 85,
    recommendations: [
      '建议尽快开始专业心理治疗',
      '保持规律的作息时间',
      '适度进行有氧运动',
      '寻求家人和朋友的支持',
      '避免过度使用电子设备',
      '定期进行心理健康评估'
    ]
  };
  
  const sessionId = 'demo-session-789abc';
  const report = staticReport;
  const isLoading = false;
  const error = null;
  
  // 静态演示：移除所有动态数据获取逻辑

  const downloadReport = () => {
    if (!report) return;
    
    const reportContent = `
多智能体心理诊断报告
===================

会话ID: ${report.session_id}
生成时间: ${new Date(report.created_at).toLocaleString()}

分析师智能体分析结果:
${report.analysis_result}

辩论智能体验证结果:
${report.debate_result}

最终诊断报告:
${report.final_report}

置信度: ${report.confidence_score}%

建议:
${report.recommendations.join('\n')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `心理诊断报告_${sessionId.slice(-8)}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareReport = async () => {
    if (!report) return;
    
    const shareText = `多智能体心理诊断报告 - 会话 ${sessionId.slice(-8)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: report.final_report.substring(0, 200) + '...',
          url: window.location.href
        });
      } catch (error) {
        console.log('分享取消或失败');
      }
    } else {
      // 复制到剪贴板
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('报告链接已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">加载诊断报告...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card title="错误" subtitle="无法获取诊断报告">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/monitor')}
                  >
                    返回监控
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/chat')}
                  >
                    重新开始
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <Card title="报告未找到" subtitle="诊断报告不存在">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">未找到对应的诊断报告</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/chat')}
                >
                  重新开始对话
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* 页面头部 */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">诊断报告</h1>
                <p className="text-gray-600">
                  会话ID: {sessionId.slice(-8)} | 生成时间: {new Date(report.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  onClick={() => navigate('/monitor')}
                >
                  返回监控
                </Button>
                <Button
                  variant="outline"
                  icon={<Share2 className="h-4 w-4" />}
                  onClick={shareReport}
                >
                  分享
                </Button>
                <Button
                  variant="primary"
                  icon={<Download className="h-4 w-4" />}
                  onClick={downloadReport}
                >
                  下载报告
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 主要报告内容 */}
            <div className="lg:col-span-3 space-y-6">
              {/* 最终诊断报告 */}
              <Card 
                title="最终诊断报告" 
                subtitle="总理智能体综合分析结果"
              >
                <div className="prose max-w-none">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {report.final_report}
                    </div>
                  </div>
                </div>
              </Card>

              {/* 分析师智能体分析 */}
              <Card 
                title="专业分析" 
                subtitle="分析师智能体深度分析"
              >
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {report.analysis_result}
                  </div>
                </div>
              </Card>

              {/* 辩论智能体验证 */}
              <Card 
                title="诊断验证" 
                subtitle="辩论智能体质疑与验证"
              >
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {report.debate_result}
                  </div>
                </div>
              </Card>
            </div>

            {/* 侧边栏信息 */}
            <div className="space-y-4">
              {/* 诊断概要 */}
              <Card title="诊断概要" subtitle="关键信息总结">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">诊断状态</span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">已完成</span>
                    </div>
                  </div>
                  
                  {report.confidence_score && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">置信度</span>
                      <span className={`font-medium ${
                        report.confidence_score >= 80 ? 'text-green-600' :
                        report.confidence_score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {report.confidence_score}%
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">生成时间</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">
                        {new Date(report.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 建议事项 */}
              {report.recommendations && report.recommendations.length > 0 && (
                <Card title="建议事项" subtitle="后续行动建议">
                  <div className="space-y-2">
                    {report.recommendations.map((recommendation, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 智能体贡献 */}
              <Card title="智能体贡献" subtitle="协作诊断过程">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-800">总理智能体</p>
                      <p className="text-xs text-blue-600">信息收集 & 报告整合</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="font-medium text-purple-800">分析师智能体</p>
                      <p className="text-xs text-purple-600">专业心理分析</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium text-orange-800">辩论智能体</p>
                      <p className="text-xs text-orange-600">质疑与验证</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 操作选项 */}
              <Card title="操作选项" subtitle="可执行的操作">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/chat')}
                    className="w-full justify-start"
                  >
                    开始新对话
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/debate')}
                    className="w-full justify-start"
                  >
                    查看辩论过程
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full justify-start"
                  >
                    返回首页
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}