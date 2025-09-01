-- 多智能体心理诊断演示系统数据库架构
-- 创建时间: 2024-01-20

-- 演示会话表 (demo_sessions)
CREATE TABLE IF NOT EXISTS demo_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255),
    demo_type VARCHAR(50) NOT NULL CHECK (demo_type IN ('guided', 'free')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'uploading', 'analyzing', 'debating', 'completed', 'error')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_demo_sessions_status ON demo_sessions(status);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_created_at ON demo_sessions(created_at DESC);

-- 聊天消息表 (chat_messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES demo_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'agent')),
    sender_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- 上传文件表 (uploaded_files)
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES demo_sessions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('fnirs', 'eeg', 'audio', 'video', 'document')),
    file_size INTEGER NOT NULL,
    validation_result JSONB DEFAULT '{}',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_uploaded_files_session_id ON uploaded_files(session_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_data_type ON uploaded_files(data_type);

-- 智能体活动表 (agent_activities)
CREATE TABLE IF NOT EXISTS agent_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES demo_sessions(id) ON DELETE CASCADE,
    agent_id VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error')),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_agent_activities_session_id ON agent_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_agent_id ON agent_activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activities_status ON agent_activities(status);

-- 辩论会话表 (debate_sessions)
CREATE TABLE IF NOT EXISTS debate_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demo_session_id UUID NOT NULL REFERENCES demo_sessions(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    participants JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
    conclusion JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_debate_sessions_demo_session_id ON debate_sessions(demo_session_id);
CREATE INDEX IF NOT EXISTS idx_debate_sessions_status ON debate_sessions(status);

-- 辩论消息表 (debate_messages)
CREATE TABLE IF NOT EXISTS debate_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_session_id UUID NOT NULL REFERENCES debate_sessions(id) ON DELETE CASCADE,
    agent_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'argument' CHECK (message_type IN ('argument', 'counter', 'evidence', 'conclusion')),
    supporting_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_debate_messages_debate_session_id ON debate_messages(debate_session_id);
CREATE INDEX IF NOT EXISTS idx_debate_messages_agent_id ON debate_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_debate_messages_created_at ON debate_messages(created_at);

-- 插入演示数据
INSERT INTO demo_sessions (user_id, demo_type, status, metadata) VALUES
('demo-user-1', 'guided', 'completed', '{"demo_name": "抑郁症诊断演示", "patient_age": 28, "patient_gender": "female"}'),
('demo-user-2', 'free', 'active', '{"demo_name": "焦虑症诊断演示", "patient_age": 35, "patient_gender": "male"}');

-- 为表授权给anon和authenticated角色
GRANT SELECT, INSERT, UPDATE, DELETE ON demo_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON uploaded_files TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON agent_activities TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON debate_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON debate_messages TO anon, authenticated;