/**
 * 全局状态管理
 * 使用zustand管理应用状态
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== 用户认证状态 ====================

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    
    login: (user: User, token: string) => {
      localStorage.setItem('auth_token', token);
      set({ user, token, isAuthenticated: true });
    },
    
    logout: () => {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isAuthenticated: false });
    },
    
    updateUser: (userData: Partial<User>) => {
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...userData } });
      }
    }
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({ 
      user: state.user, 
      token: state.token, 
      isAuthenticated: state.isAuthenticated 
    })
  }
));

// ==================== 患者管理状态 ====================

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  medicalHistory?: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface PatientsState {
  patients: Patient[];
  currentPatient: Patient | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    gender?: string;
    riskLevel?: string;
    status?: string;
  };
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  setPatients: (patients: Patient[]) => void;
  setCurrentPatient: (patient: Patient | null) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  removePatient: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<PatientsState['filters']>) => void;
  setPagination: (pagination: Partial<PatientsState['pagination']>) => void;
  clearFilters: () => void;
}

export const usePatientsStore = create<PatientsState>((set, get) => ({
  patients: [],
  currentPatient: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  },
  
  setPatients: (patients) => set({ patients }),
  
  setCurrentPatient: (patient) => set({ currentPatient: patient }),
  
  addPatient: (patient) => {
    const { patients } = get();
    set({ patients: [patient, ...patients] });
  },
  
  updatePatient: (id, patientData) => {
    const { patients } = get();
    const updatedPatients = patients.map(p => 
      p.id === id ? { ...p, ...patientData } : p
    );
    set({ patients: updatedPatients });
  },
  
  removePatient: (id) => {
    const { patients } = get();
    const filteredPatients = patients.filter(p => p.id !== id);
    set({ patients: filteredPatients });
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  setFilters: (newFilters) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },
  
  setPagination: (newPagination) => {
    const { pagination } = get();
    set({ pagination: { ...pagination, ...newPagination } });
  },
  
  clearFilters: () => set({ 
    filters: {}, 
    searchQuery: '', 
    pagination: { ...get().pagination, current: 1 } 
  })
}));

// ==================== 诊断分析状态 ====================

type AgentType = 'fnirs' | 'eeg' | 'audio' | 'video' | 'coordination';
type AgentStatus = 'pending' | 'running' | 'completed' | 'error';
type DiagnosisStatus = 'pending' | 'analyzing' | 'debating' | 'completed' | 'error';

interface DiagnosisSession {
  id: string;
  patientId: string;
  status: DiagnosisStatus;
  progress: number;
  startTime: string;
  endTime?: string;
  agents: Record<AgentType, {
    status: AgentStatus;
    progress: number;
    result?: any;
    error?: string;
    startTime?: string;
    endTime?: string;
  }>;
  dataFiles: {
    fnirs?: string[];
    eeg?: string[];
    audio?: string[];
    video?: string[];
  };
  debateLog: {
    timestamp: string;
    agent: AgentType;
    message: string;
    confidence: number;
  }[];
  finalResult?: {
    diagnosis: string;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    evidence: Record<string, any>;
    recommendations: string[];
  };
}

interface DiagnosisState {
  sessions: DiagnosisSession[];
  currentSession: DiagnosisSession | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setSessions: (sessions: DiagnosisSession[]) => void;
  setCurrentSession: (session: DiagnosisSession | null) => void;
  addSession: (session: DiagnosisSession) => void;
  updateSession: (id: string, session: Partial<DiagnosisSession>) => void;
  updateAgentStatus: (sessionId: string, agentType: AgentType, status: Partial<DiagnosisSession['agents'][AgentType]>) => void;
  addDebateLog: (sessionId: string, log: DiagnosisSession['debateLog'][0]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  
  setSessions: (sessions) => set({ sessions }),
  
  setCurrentSession: (session) => set({ currentSession: session }),
  
  addSession: (session) => {
    const { sessions } = get();
    set({ sessions: [session, ...sessions] });
  },
  
  updateSession: (id, sessionData) => {
    const { sessions, currentSession } = get();
    const updatedSessions = sessions.map(s => 
      s.id === id ? { ...s, ...sessionData } : s
    );
    const updatedCurrentSession = currentSession?.id === id 
      ? { ...currentSession, ...sessionData } 
      : currentSession;
    
    set({ 
      sessions: updatedSessions, 
      currentSession: updatedCurrentSession 
    });
  },
  
  updateAgentStatus: (sessionId, agentType, status) => {
    const { sessions, currentSession } = get();
    
    const updateSessionAgents = (session: DiagnosisSession) => ({
      ...session,
      agents: {
        ...session.agents,
        [agentType]: {
          ...session.agents[agentType],
          ...status
        }
      }
    });
    
    const updatedSessions = sessions.map(s => 
      s.id === sessionId ? updateSessionAgents(s) : s
    );
    
    const updatedCurrentSession = currentSession?.id === sessionId 
      ? updateSessionAgents(currentSession) 
      : currentSession;
    
    set({ 
      sessions: updatedSessions, 
      currentSession: updatedCurrentSession 
    });
  },
  
  addDebateLog: (sessionId, log) => {
    const { sessions, currentSession } = get();
    
    const updateSessionDebateLog = (session: DiagnosisSession) => ({
      ...session,
      debateLog: [...session.debateLog, log]
    });
    
    const updatedSessions = sessions.map(s => 
      s.id === sessionId ? updateSessionDebateLog(s) : s
    );
    
    const updatedCurrentSession = currentSession?.id === sessionId 
      ? updateSessionDebateLog(currentSession) 
      : currentSession;
    
    set({ 
      sessions: updatedSessions, 
      currentSession: updatedCurrentSession 
    });
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error })
}));

// ==================== 文件上传状态 ====================

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  result?: any;
}

interface UploadState {
  files: UploadFile[];
  uploading: boolean;
  
  // Actions
  addFiles: (files: File[]) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (id: string, status: UploadFile['status'], error?: string, result?: any) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setUploading: (uploading: boolean) => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  files: [],
  uploading: false,
  
  addFiles: (newFiles) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'pending'
    }));
    
    const { files } = get();
    set({ files: [...files, ...uploadFiles] });
  },
  
  updateFileProgress: (id, progress) => {
    const { files } = get();
    const updatedFiles = files.map(f => 
      f.id === id ? { ...f, progress } : f
    );
    set({ files: updatedFiles });
  },
  
  updateFileStatus: (id, status, error, result) => {
    const { files } = get();
    const updatedFiles = files.map(f => 
      f.id === id ? { ...f, status, error, result } : f
    );
    set({ files: updatedFiles });
  },
  
  removeFile: (id) => {
    const { files } = get();
    const filteredFiles = files.filter(f => f.id !== id);
    set({ files: filteredFiles });
  },
  
  clearFiles: () => set({ files: [] }),
  
  setUploading: (uploading) => set({ uploading })
}));

// ==================== 应用全局状态 ====================

interface AppState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notifications: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
  }[];
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(persist(
  (set, get) => ({
    sidebarCollapsed: false,
    theme: 'light',
    notifications: [],
    
    toggleSidebar: () => {
      const { sidebarCollapsed } = get();
      set({ sidebarCollapsed: !sidebarCollapsed });
    },
    
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    
    setTheme: (theme) => set({ theme }),
    
    addNotification: (notification) => {
      const { notifications } = get();
      const newNotification = {
        ...notification,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      set({ notifications: [newNotification, ...notifications] });
    },
    
    removeNotification: (id) => {
      const { notifications } = get();
      const filteredNotifications = notifications.filter(n => n.id !== id);
      set({ notifications: filteredNotifications });
    },
    
    clearNotifications: () => set({ notifications: [] })
  }),
  {
    name: 'app-storage',
    partialize: (state) => ({ 
      sidebarCollapsed: state.sidebarCollapsed, 
      theme: state.theme 
    })
  }
));

// 导出所有store
export default {
  useAuthStore,
  usePatientsStore,
  useDiagnosisStore,
  useUploadStore,
  useAppStore
};