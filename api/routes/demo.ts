import express, { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// 创建演示会话
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { user_id, demo_type, metadata } = req.body;
    
    const { data, error } = await supabase
      .from('demo_sessions')
      .insert({
        user_id: user_id || `demo-user-${Date.now()}`,
        demo_type: demo_type || 'guided',
        status: 'active',
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create demo session' });
  }
});

// 获取演示会话
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const { data, error } = await supabase
      .from('demo_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get demo session' });
  }
});

// 更新演示会话状态
router.patch('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { status, metadata } = req.body;
    
    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (metadata) updateData.metadata = metadata;

    const { data, error } = await supabase
      .from('demo_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update demo session' });
  }
});

// 发送聊天消息
router.post('/sessions/:sessionId/messages', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { sender_type, sender_id, content, message_type, attachments } = req.body;
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender_type,
        sender_id,
        content,
        message_type: message_type || 'text',
        attachments: attachments || []
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // 通过WebSocket广播消息
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.broadcastToSession(sessionId, {
        type: 'new_message',
        data
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// 获取聊天消息
router.get('/sessions/:sessionId/messages', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get messages' });
  }
});

// 记录智能体活动
router.post('/sessions/:sessionId/agent-activities', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { agent_id, activity_type, status, input_data, output_data } = req.body;
    
    const { data, error } = await supabase
      .from('agent_activities')
      .insert({
        session_id: sessionId,
        agent_id,
        activity_type,
        status: status || 'pending',
        input_data: input_data || {},
        output_data: output_data || {}
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // 通过WebSocket广播智能体活动
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.broadcastToSession(sessionId, {
        type: 'agent_activity',
        data
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to record agent activity' });
  }
});

// 获取智能体活动
router.get('/sessions/:sessionId/agent-activities', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const { data, error } = await supabase
      .from('agent_activities')
      .select('*')
      .eq('session_id', sessionId)
      .order('started_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get agent activities' });
  }
});

// 更新智能体活动状态
router.patch('/agent-activities/:activityId', async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const { status, output_data } = req.body;
    
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (output_data) updateData.output_data = output_data;

    const { data, error } = await supabase
      .from('agent_activities')
      .update(updateData)
      .eq('id', activityId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // 通过WebSocket广播状态更新
    const wsService = req.app.get('wsService');
    if (wsService && data) {
      wsService.broadcastToSession(data.session_id, {
        type: 'agent_activity_updated',
        data
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update agent activity' });
  }
});

// 创建辩论会话
router.post('/sessions/:sessionId/debates', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { topic, participants } = req.body;
    
    const { data, error } = await supabase
      .from('debate_sessions')
      .insert({
        demo_session_id: sessionId,
        topic,
        participants: participants || [],
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // 通过WebSocket广播辩论开始
    const wsService = req.app.get('wsService');
    if (wsService) {
      wsService.broadcastToSession(sessionId, {
        type: 'debate_started',
        data
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create debate session' });
  }
});

// 发送辩论消息
router.post('/debates/:debateId/messages', async (req: Request, res: Response) => {
  try {
    const { debateId } = req.params;
    const { agent_id, content, message_type, supporting_data } = req.body;
    
    const { data, error } = await supabase
      .from('debate_messages')
      .insert({
        debate_session_id: debateId,
        agent_id,
        content,
        message_type: message_type || 'argument',
        supporting_data: supporting_data || {}
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // 获取关联的演示会话ID
    const { data: debateSession } = await supabase
      .from('debate_sessions')
      .select('demo_session_id')
      .eq('id', debateId)
      .single();

    // 通过WebSocket广播辩论消息
    const wsService = req.app.get('wsService');
    if (wsService && debateSession) {
      wsService.broadcastToSession(debateSession.demo_session_id, {
        type: 'debate_message',
        data
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send debate message' });
  }
});

// 获取辩论消息
router.get('/debates/:debateId/messages', async (req: Request, res: Response) => {
  try {
    const { debateId } = req.params;
    
    const { data, error } = await supabase
      .from('debate_messages')
      .select('*')
      .eq('debate_session_id', debateId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get debate messages' });
  }
});

export default router;