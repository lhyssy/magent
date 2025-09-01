import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Users, Play, BarChart3, Activity, Clock, AlertTriangle, TrendingUp, FileText, Brain } from 'lucide-react';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { usePatientsStore, useDiagnosisStore, useAppStore } from '../store';
import { patientsApi, diagnosisApi, uploadApi } from '../utils/api';

const Home: React.FC = () => {
  const { addNotification } = useAppStore();
  const [stats, setStats] = useState({
    patients: { total: 0, active: 0, newThisMonth: 0 },
    diagnosis: { totalSessions: 0, completedSessions: 0, successRate: 0 },
    upload: { totalUploads: 0, totalSize: 0 }
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // 并行加载各种统计数据
        const [patientsStats, diagnosisStats, uploadStats] = await Promise.all([
          patientsApi.getStats(),
          diagnosisApi.getStats(),
          uploadApi.getStats()
        ]);
        
        if (patientsStats.success && diagnosisStats.success && uploadStats.success) {
          setStats({
            patients: patientsStats.data,
            diagnosis: diagnosisStats.data,
            upload: uploadStats.data
          });
        }
        
        // 加载最近活动（模拟数据）
        setRecentActivities([
          {
            id: '1',
            type: 'diagnosis',
            message: '患者张三的诊断分析已完成',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'completed'
          },
          {
            id: '2',
            type: 'upload',
            message: '患者李四上传了新的EEG数据',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            status: 'success'
          },
          {
            id: '3',
            type: 'patient',
            message: '新患者王五已注册',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            status: 'info'
          }
        ]);
        
      } catch (error) {
        console.error('加载统计数据失败:', error);
        addNotification({
          type: 'error',
          title: '数据加载失败',
          message: '无法加载系统统计数据，请稍后重试'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [addNotification]);

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      return time.toLocaleDateString();
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* 欢迎区域 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-4">欢迎使用连心智诊师</h1>
          <p className="text-blue-100 text-lg mb-6">
            多智能体心理疾病诊断系统，融合fNIRS、EEG、音频、视频等多模态数据，
            通过智能体协作提供精准的心理健康评估。
          </p>
          <div className="flex space-x-4">
            <Link to="/demo">
              <Button variant="outline" className="text-blue-600 border-blue-600 bg-white/90 hover:bg-blue-600 hover:text-white">了解更多</Button>
            </Link>
            <Link to="/upload">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">开始使用</Button>
            </Link>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总患者数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.patients.total}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  活跃: {loading ? '...' : stats.patients.active}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">本月新增</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.patients.newThisMonth}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  较上月增长
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">诊断会话</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stats.diagnosis.totalSessions}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  完成: {loading ? '...' : stats.diagnosis.completedSessions}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">成功率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : `${stats.diagnosis.successRate}%`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  数据: {loading ? '...' : formatFileSize(stats.upload.totalSize)}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* 快速操作卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">数据上传</h3>
                <p className="text-gray-600 mb-4">上传fNIRS、EEG、音视频数据</p>
                <Link to="/upload">
                  <Button className="w-full">开始上传</Button>
                </Link>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">患者管理</h3>
                <p className="text-gray-600 mb-4">管理患者档案和历史记录</p>
                <Link to="/patients">
                  <Button className="w-full">患者管理</Button>
                </Link>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">系统演示</h3>
                <p className="text-gray-600 mb-4">查看系统功能演示</p>
                <Link to="/demo">
                  <Button className="w-full">查看演示</Button>
                </Link>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">数据统计</h3>
                <p className="text-gray-600 mb-4">查看诊断统计和分析</p>
                <Button className="w-full" disabled>
                  即将推出
                </Button>
              </div>
            </Card>
          </div>

        {/* 最近活动 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="系统状态概览" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">fNIRS智能体</span>
                </div>
                <span className="text-xs text-green-600">正常运行</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">EEG智能体</span>
                </div>
                <span className="text-xs text-green-600">正常运行</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">音频智能体</span>
                </div>
                <span className="text-xs text-green-600">正常运行</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">视频智能体</span>
                </div>
                <span className="text-xs text-green-600">正常运行</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">协调智能体</span>
                </div>
                <span className="text-xs text-blue-600">待机中</span>
              </div>
            </div>
          </Card>
          
          <Card title="最近活动" className="p-6">
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const getIcon = (type: string) => {
                    switch (type) {
                      case 'diagnosis': return Brain;
                      case 'upload': return Upload;
                      case 'patient': return Users;
                      default: return FileText;
                    }
                  };
                  
                  const getIconColor = (status: string) => {
                    switch (status) {
                      case 'completed': return 'text-green-600 bg-green-100';
                      case 'success': return 'text-blue-600 bg-blue-100';
                      case 'error': return 'text-red-600 bg-red-100';
                      default: return 'text-gray-600 bg-gray-100';
                    }
                  };
                  
                  const Icon = getIcon(activity.type);
                  
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getIconColor(activity.status)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无最近活动</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Home;