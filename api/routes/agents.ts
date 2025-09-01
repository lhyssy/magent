import express from 'express';
import { GeminiAgentChat, multiAgentDiagnosis } from '../lib/gemini';
import { supabase } from '../lib/supabase';

const router = express.Router();

// 总理智能体聊天接口
router.post('/prime-chat', async (req, res) => {
  try {
    const { session_id, user_message } = req.body;
    
    if (!session_id || !user_message) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const primeAgent = new GeminiAgentChat('prime');
    const response = await primeAgent.sendMessage(user_message);
    
    // 保存对话到数据库
    await supabase.from('chat_messages').insert({
      session_id,
      message: response,
      sender: 'prime_agent',
      timestamp: new Date().toISOString()
    });

    res.json({ 
      response,
      suggest_upload: response.includes('上传') || response.includes('多模态')
    });
  } catch (error) {
    console.error('Prime agent chat error:', error);
    res.status(500).json({ error: 'AI服务暂时不可用' });
  }
});

// 启动多智能体诊断
router.post('/start-diagnosis', async (req, res) => {
  try {
    const { session_id, patient_info } = req.body;
    
    if (!session_id || !patient_info) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 更新会话状态为诊断中
    await supabase
      .from('demo_sessions')
      .update({ 
        status: 'diagnosing',
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session_id);

    // 启动多智能体诊断（异步处理）
    processDiagnosis(session_id, patient_info);

    res.json({ 
      success: true,
      message: '多智能体诊断已启动'
    });
  } catch (error) {
    console.error('Start diagnosis error:', error);
    res.status(500).json({ error: '启动诊断失败' });
  }
});

// 异步处理诊断流程
async function processDiagnosis(sessionId: string, patientInfo: string) {
  try {
    console.log(`开始处理会话 ${sessionId} 的多智能体诊断`);
    
    // 执行多智能体诊断
    const diagnosisResult = await multiAgentDiagnosis.startDiagnosis(patientInfo);
    
    // 保存诊断结果到数据库
    await supabase.from('diagnosis_results').insert({
      session_id: sessionId,
      analysis_result: diagnosisResult.analysis,
      debate_result: diagnosisResult.debate,
      final_report: diagnosisResult.finalReport,
      created_at: new Date().toISOString()
    });

    // 更新会话状态为已完成
    await supabase
      .from('demo_sessions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    console.log(`会话 ${sessionId} 的多智能体诊断已完成`);
  } catch (error) {
    console.error(`会话 ${sessionId} 诊断处理失败:`, error);
    
    // 更新会话状态为失败
    await supabase
      .from('demo_sessions')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);
  }
}

// 获取诊断状态
router.get('/diagnosis-status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // 获取会话状态
    const { data: session, error: sessionError } = await supabase
      .from('demo_sessions')
      .select('status, updated_at')
      .eq('session_id', sessionId)
      .single();

    if (sessionError) {
      return res.status(404).json({ error: '会话不存在' });
    }

    // 如果诊断完成，获取诊断结果
    let diagnosisResult = null;
    if (session.status === 'completed') {
      const { data: result } = await supabase
        .from('diagnosis_results')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      
      diagnosisResult = result;
    }

    res.json({
      status: session.status,
      updated_at: session.updated_at,
      diagnosis_result: diagnosisResult
    });
  } catch (error) {
    console.error('Get diagnosis status error:', error);
    res.status(500).json({ error: '获取诊断状态失败' });
  }
});

// 获取诊断报告
router.get('/diagnosis-report/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const { data: result, error } = await supabase
      .from('diagnosis_results')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      return res.status(404).json({ error: '诊断报告不存在' });
    }

    res.json(result);
  } catch (error) {
    console.error('Get diagnosis report error:', error);
    res.status(500).json({ error: '获取诊断报告失败' });
  }
});

export default router;