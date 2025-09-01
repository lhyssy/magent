import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { Search, Plus, Filter, Eye, Edit, Trash2, Calendar, User, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { usePatientsStore } from '@/store';
import { patientsApi } from '@/utils/api';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  lastVisit: string;
  status: string;
  diagnosis: string;
  riskLevel: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

interface PatientStats {
  total: number;
  completed: number;
  inTreatment: number;
  pending: number;
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export default function Patients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [total, setTotal] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // 获取患者列表
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        status: selectedFilter === 'all' ? undefined : selectedFilter
      };
      
      const response = await patientsApi.getPatients(params);
      setPatients(response.data.data.patients);
      setTotal(response.data.data.pagination.total);
    } catch (error) {
      console.error('获取患者列表失败:', error);
      toast.error('获取患者列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const response = await patientsApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  // 删除患者
  const handleDeletePatient = async (patient: Patient) => {
    try {
      await patientsApi.deletePatient(patient.id);
      toast.success('患者删除成功');
      fetchPatients();
      fetchStats();
      setShowDeleteModal(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error('删除患者失败:', error);
      toast.error('删除患者失败');
    }
  };

  // 查看患者详情
  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  // 编辑患者
  const handleEditPatient = (patientId: string) => {
    navigate(`/patients/${patientId}/edit`);
  };

  // 查看诊断报告
  const handleViewReport = (patientId: string) => {
    navigate(`/report/${patientId}`);
  };

  // 新增患者
  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, searchTerm, selectedFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '治疗中': return 'bg-blue-100 text-blue-800';
      case '已完成': return 'bg-green-100 text-green-800';
      case '待复诊': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">患者管理</h1>
              <p className="text-gray-600">管理患者档案和诊断记录</p>
            </div>
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={handleAddPatient}>
              新增患者
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats?.total || 0}
                </div>
                <p className="text-gray-600">总患者数</p>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats?.completed || 0}
                </div>
                <p className="text-gray-600">已完成治疗</p>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {stats?.inTreatment || 0}
                </div>
                <p className="text-gray-600">治疗中</p>
              </div>
            </Card>
            
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {stats?.pending || 0}
                </div>
                <p className="text-gray-600">待复诊</p>
              </div>
            </Card>
          </div>

          {/* 搜索和筛选 */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索患者姓名、ID或诊断..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">全部状态</option>
                  <option value="治疗中">治疗中</option>
                  <option value="已完成">已完成</option>
                  <option value="待复诊">待复诊</option>
                </select>
                
                <Button variant="outline" icon={<Filter className="h-4 w-4" />}>
                  高级筛选
                </Button>
              </div>
            </div>
          </Card>

          {/* 患者列表 */}
          <Card title="患者列表" subtitle="当前系统中的所有患者信息">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">患者信息</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">诊断结果</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">风险等级</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">状态</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">最后就诊</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">
                              {patient.id} | {patient.age}岁 {patient.gender} | {patient.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">{patient.diagnosis}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(patient.riskLevel)}`}>
                          {patient.riskLevel === 'high' ? '高风险' : 
                           patient.riskLevel === 'medium' ? '中风险' : '低风险'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{patient.lastVisit}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button 
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            onClick={() => handleViewPatient(patient.id)}
                            title="查看详情"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            onClick={() => handleEditPatient(patient.id)}
                            title="编辑患者"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            onClick={() => handleViewReport(patient.id)}
                            title="查看报告"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowDeleteModal(true);
                            }}
                            title="删除患者"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* 分页 */}
            {!loading && patients.length > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  显示 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, total)} 条，共 {total} 条记录
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    上一页
                  </Button>
                  
                  {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1)
                    .filter(page => {
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(Math.ceil(total / pageSize), currentPage + 2);
                      return page >= start && page <= end;
                    })
                    .map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))
                  }
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === Math.ceil(total / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
            
            {/* 空状态 */}
            {!loading && patients.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">暂无患者数据</p>
                <p className="text-sm text-gray-400">点击"新增患者"按钮添加第一个患者</p>
              </div>
            )}
          </Card>
          
          {/* 删除确认模态框 */}
          {showDeleteModal && selectedPatient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
                    <p className="text-sm text-gray-600">此操作不可撤销</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  确定要删除患者 <span className="font-semibold">{selectedPatient.name}</span> 的所有信息吗？
                  这将同时删除该患者的所有诊断记录和相关数据。
                </p>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedPatient(null);
                    }}
                  >
                    取消
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => handleDeletePatient(selectedPatient)}
                  >
                    确认删除
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}