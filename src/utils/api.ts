/**
 * API服务工具类
 * 统一管理前端与后端API的通信
 */

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 通用请求配置
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

// 通用响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页响应接口
interface PaginatedResponse<T> {
  success: boolean;
  data: {
    records?: T[];
    sessions?: T[];
    patients?: T[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * 通用请求函数
 */
async function request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body } = config;
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  // 获取认证token（如果存在）
  const token = localStorage.getItem('auth_token');
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * 文件上传请求函数
 */
async function uploadRequest<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {};
  
  // 获取认证token（如果存在）
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Upload request failed:', error);
    throw error;
  }
}

// ==================== 认证API ====================

export const authApi = {
  /**
   * 用户登录
   */
  login: (credentials: { username: string; password: string }) => 
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: credentials
    }),
  
  /**
   * 用户注册
   */
  register: (userData: { username: string; password: string; email: string }) => 
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: userData
    }),
  
  /**
   * 用户登出
   */
  logout: () => 
    request('/auth/logout', { method: 'POST' })
};

// ==================== 患者管理API ====================

export const patientsApi = {
  /**
   * 获取患者列表
   */
  getPatients: (params?: {
    search?: string;
    gender?: string;
    riskLevel?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return request<PaginatedResponse<any>>(`/patients${queryString ? `?${queryString}` : ''}`);
  },
  
  /**
   * 获取患者详情
   */
  getPatient: (id: string) => 
    request<any>(`/patients/${id}`),
  
  /**
   * 创建患者
   */
  createPatient: (patientData: {
    name: string;
    age: number;
    gender: string;
    phone?: string;
    email?: string;
    medicalHistory?: string;
  }) => 
    request<any>('/patients', {
      method: 'POST',
      body: patientData
    }),
  
  /**
   * 更新患者信息
   */
  updatePatient: (id: string, patientData: any) => 
    request<any>(`/patients/${id}`, {
      method: 'PUT',
      body: patientData
    }),
  
  /**
   * 删除患者
   */
  deletePatient: (id: string) => 
    request(`/patients/${id}`, { method: 'DELETE' }),
  
  /**
   * 获取患者统计信息
   */
  getStats: () => 
    request<any>('/patients/stats')
};

// ==================== 数据上传API ====================

export const uploadApi = {
  /**
   * 单文件上传
   */
  uploadSingle: (file: File, dataType: string, patientId: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataType', dataType);
    formData.append('patientId', patientId);
    if (description) {
      formData.append('description', description);
    }
    return uploadRequest<any>('/upload/single', formData);
  },
  
  /**
   * 多文件上传
   */
  uploadMultiple: (files: File[], dataType: string, patientId: string, description?: string) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('dataType', dataType);
    formData.append('patientId', patientId);
    if (description) {
      formData.append('description', description);
    }
    return uploadRequest<any>('/upload/multiple', formData);
  },
  
  /**
   * 获取上传记录
   */
  getRecords: (params?: {
    patientId?: string;
    dataType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return request<PaginatedResponse<any>>(`/upload/records${queryString ? `?${queryString}` : ''}`);
  },
  
  /**
   * 获取上传记录详情
   */
  getRecord: (id: string) => 
    request<any>(`/upload/records/${id}`),
  
  /**
   * 删除上传记录
   */
  deleteRecord: (id: string) => 
    request(`/upload/records/${id}`, { method: 'DELETE' }),
  
  /**
   * 获取支持的文件类型
   */
  getSupportedTypes: () => 
    request<any>('/upload/supported-types'),
  
  /**
   * 获取上传统计信息
   */
  getStats: () => 
    request<any>('/upload/stats')
};

// ==================== 诊断分析API ====================

export const diagnosisApi = {
  /**
   * 创建诊断会话
   */
  createSession: (sessionData: {
    patientId: string;
    dataFiles: Record<string, string[]>;
  }) => 
    request<any>('/diagnosis/sessions', {
      method: 'POST',
      body: sessionData
    }),
  
  /**
   * 开始诊断分析
   */
  startAnalysis: (sessionId: string) => 
    request<any>(`/diagnosis/sessions/${sessionId}/start`, {
      method: 'POST'
    }),
  
  /**
   * 获取诊断会话详情
   */
  getSession: (sessionId: string) => 
    request<any>(`/diagnosis/sessions/${sessionId}`),
  
  /**
   * 获取诊断会话列表
   */
  getSessions: (params?: {
    patientId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return request<PaginatedResponse<any>>(`/diagnosis/sessions${queryString ? `?${queryString}` : ''}`);
  },
  
  /**
   * 获取智能体状态
   */
  getAgentStatus: (sessionId: string) => 
    request<any>(`/diagnosis/sessions/${sessionId}/agents`),
  
  /**
   * 获取辩论日志
   */
  getDebateLog: (sessionId: string, limit?: number) => {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    const queryString = queryParams.toString();
    return request<any>(`/diagnosis/sessions/${sessionId}/debate-log${queryString ? `?${queryString}` : ''}`);
  },
  
  /**
   * 停止诊断分析
   */
  stopAnalysis: (sessionId: string) => 
    request<any>(`/diagnosis/sessions/${sessionId}/stop`, {
      method: 'POST'
    }),
  
  /**
   * 停止诊断会话
   */
  stopSession: (sessionId: string) => 
    request<any>(`/diagnosis/sessions/${sessionId}/stop`, {
      method: 'POST'
    }),
  
  /**
   * 启动诊断会话
   */
  startSession: (sessionId: string) => 
    request<any>(`/diagnosis/sessions/${sessionId}/start`, {
      method: 'POST'
    }),
  
  /**
   * 暂停诊断会话
   */
  pauseSession: (sessionId: string) => 
    request<any>(`/diagnosis/sessions/${sessionId}/pause`, {
      method: 'POST'
    }),
  
  /**
   * 获取会话状态
   */
  getSessionStatus: (sessionId: string) => 
    request<any>(`/diagnosis/sessions/${sessionId}/status`),
  
  /**
   * 获取诊断统计信息
   */
  getStats: () => 
    request<any>('/diagnosis/stats'),
  
  /**
   * 获取诊断报告
   */
  getReport: (sessionId: string) => 
    request<any>(`/diagnosis/sessions/${sessionId}/report`),
  
  /**
   * 导出诊断报告
   */
  exportReport: (sessionId: string, format: 'pdf' | 'docx' = 'pdf') => 
    request<any>(`/diagnosis/sessions/${sessionId}/export?format=${format}`)
};

// ==================== 通用API ====================

export const commonApi = {
  /**
   * 健康检查
   */
  healthCheck: () => 
    request<{ status: string; timestamp: string }>('/health')
};

// 导出默认对象
export default {
  auth: authApi,
  patients: patientsApi,
  upload: uploadApi,
  diagnosis: diagnosisApi,
  common: commonApi
};