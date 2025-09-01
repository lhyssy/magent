/**
 * 患者管理API路由
 * 处理患者档案的增删改查、历史记录等功能
 */
import { Router, type Request, type Response } from 'express';

const router = Router();

// 模拟患者数据
let patients = [
  {
    id: '1',
    name: '张三',
    age: 28,
    gender: '男',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    address: '北京市朝阳区',
    medicalHistory: '无重大疾病史',
    riskLevel: 'medium',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastVisit: '2024-01-20T14:20:00Z'
  },
  {
    id: '2',
    name: '李四',
    age: 35,
    gender: '女',
    phone: '13800138002',
    email: 'lisi@example.com',
    address: '上海市浦东新区',
    medicalHistory: '轻度焦虑症病史',
    riskLevel: 'high',
    status: 'active',
    createdAt: '2024-01-10T09:15:00Z',
    lastVisit: '2024-01-18T16:45:00Z'
  },
  {
    id: '3',
    name: '王五',
    age: 42,
    gender: '男',
    phone: '13800138003',
    email: 'wangwu@example.com',
    address: '广州市天河区',
    medicalHistory: '抑郁症治疗中',
    riskLevel: 'high',
    status: 'inactive',
    createdAt: '2024-01-05T11:00:00Z',
    lastVisit: '2024-01-12T10:30:00Z'
  }
];

/**
 * 获取患者列表
 * GET /api/patients
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', riskLevel = '', status = '' } = req.query;
    
    let filteredPatients = patients;
    
    // 搜索过滤
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredPatients = filteredPatients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.phone.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm)
      );
    }
    
    // 风险等级过滤
    if (riskLevel) {
      filteredPatients = filteredPatients.filter(patient => 
        patient.riskLevel === riskLevel
      );
    }
    
    // 状态过滤
    if (status) {
      filteredPatients = filteredPatients.filter(patient => 
        patient.status === status
      );
    }
    
    // 分页
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        patients: paginatedPatients,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total: filteredPatients.length,
          totalPages: Math.ceil(filteredPatients.length / limitNum)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取患者列表失败'
    });
  }
});

/**
 * 获取单个患者详情
 * GET /api/patients/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const patient = patients.find(p => p.id === id);
    
    if (!patient) {
      res.status(404).json({
        success: false,
        error: '患者不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取患者详情失败'
    });
  }
});

/**
 * 创建新患者
 * POST /api/patients
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, age, gender, phone, email, address, medicalHistory } = req.body;
    
    // 基本验证
    if (!name || !age || !gender || !phone) {
      res.status(400).json({
        success: false,
        error: '缺少必填字段'
      });
      return;
    }
    
    // 检查手机号是否已存在
    const existingPatient = patients.find(p => p.phone === phone);
    if (existingPatient) {
      res.status(400).json({
        success: false,
        error: '手机号已存在'
      });
      return;
    }
    
    const newPatient = {
      id: (patients.length + 1).toString(),
      name,
      age: parseInt(age),
      gender,
      phone,
      email: email || '',
      address: address || '',
      medicalHistory: medicalHistory || '',
      riskLevel: 'low',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString()
    };
    
    patients.push(newPatient);
    
    res.status(201).json({
      success: true,
      data: newPatient,
      message: '患者创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建患者失败'
    });
  }
});

/**
 * 更新患者信息
 * PUT /api/patients/:id
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, age, gender, phone, email, address, medicalHistory, riskLevel, status } = req.body;
    
    const patientIndex = patients.findIndex(p => p.id === id);
    if (patientIndex === -1) {
      res.status(404).json({
        success: false,
        error: '患者不存在'
      });
      return;
    }
    
    // 检查手机号是否被其他患者使用
    if (phone) {
      const existingPatient = patients.find(p => p.phone === phone && p.id !== id);
      if (existingPatient) {
        res.status(400).json({
          success: false,
          error: '手机号已被其他患者使用'
        });
        return;
      }
    }
    
    // 更新患者信息
    const updatedPatient = {
      ...patients[patientIndex],
      ...(name && { name }),
      ...(age && { age: parseInt(age) }),
      ...(gender && { gender }),
      ...(phone && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(medicalHistory !== undefined && { medicalHistory }),
      ...(riskLevel && { riskLevel }),
      ...(status && { status })
    };
    
    patients[patientIndex] = updatedPatient;
    
    res.json({
      success: true,
      data: updatedPatient,
      message: '患者信息更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新患者信息失败'
    });
  }
});

/**
 * 删除患者
 * DELETE /api/patients/:id
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const patientIndex = patients.findIndex(p => p.id === id);
    if (patientIndex === -1) {
      res.status(404).json({
        success: false,
        error: '患者不存在'
      });
      return;
    }
    
    patients.splice(patientIndex, 1);
    
    res.json({
      success: true,
      message: '患者删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除患者失败'
    });
  }
});

/**
 * 获取患者统计信息
 * GET /api/patients/stats/overview
 */
router.get('/stats/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    const highRiskPatients = patients.filter(p => p.riskLevel === 'high').length;
    const mediumRiskPatients = patients.filter(p => p.riskLevel === 'medium').length;
    const lowRiskPatients = patients.filter(p => p.riskLevel === 'low').length;
    
    // 本月新增患者（模拟数据）
    const thisMonth = new Date().getMonth();
    const newPatientsThisMonth = patients.filter(p => {
      const createdMonth = new Date(p.createdAt).getMonth();
      return createdMonth === thisMonth;
    }).length;
    
    res.json({
      success: true,
      data: {
        totalPatients,
        activePatients,
        newPatientsThisMonth,
        riskDistribution: {
          high: highRiskPatients,
          medium: mediumRiskPatients,
          low: lowRiskPatients
        },
        genderDistribution: {
          male: patients.filter(p => p.gender === '男').length,
          female: patients.filter(p => p.gender === '女').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取统计信息失败'
    });
  }
});

export default router;