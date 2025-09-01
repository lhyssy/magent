# 连心智诊师 - 多智能体心理诊断系统

## 📋 项目介绍

连心智诊师是一个基于多智能体架构的心理健康诊断演示系统，采用React + TypeScript + Node.js技术栈开发。系统模拟了多个专业分析师协同工作的场景，包括文本分析师、音频分析师、视频分析师、EEG分析师、fNIRS分析师等，为用户提供全方位的心理健康评估体验。

### 🌟 主要功能

- **多智能体协同分析**: 6个专业分析师同时工作，模拟真实的多学科诊断团队
- **实时进度展示**: 可视化展示各个分析师的工作进度和状态
- **流式对话体验**: 支持打字机效果的AI回复，提供自然的对话体验
- **多模态数据支持**: 支持文本、音频、视频、EEG、fNIRS等多种数据类型
- **智能体辩论系统**: 模拟专家团队的讨论和决策过程
- **响应式设计**: 适配各种设备屏幕尺寸

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS (样式框架)
- React Router (路由管理)
- Zustand (状态管理)
- Socket.IO Client (实时通信)
- Lucide React (图标库)

### 后端
- Node.js + Express
- TypeScript
- Socket.IO (WebSocket服务)
- Multer (文件上传)
- CORS (跨域处理)
- Helmet (安全中间件)

## 📋 环境要求

- **Node.js**: 版本 18.0 或更高
- **npm**: 版本 8.0 或更高 (或使用 pnpm/yarn)
- **操作系统**: Windows 10/11, macOS 10.15+, Linux Ubuntu 18.04+
- **浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🚀 快速开始

### 1. 克隆项目

```bash
# 从GitHub克隆项目
git clone https://github.com/your-username/magent.git

# 进入项目目录
cd magent
```

### 2. 安装依赖

```bash
# 安装所有依赖包
npm install

# 或者使用pnpm (推荐，速度更快)
pnpm install
```

### 3. 环境配置

```bash
# 复制环境变量模板文件
cp .env.example .env

# 编辑环境变量文件 (可选)
# 默认配置已经可以正常运行，如需自定义可以修改以下配置：
# PORT=3002                    # 服务器端口
# NODE_ENV=development         # 运行环境
# MAX_FILE_SIZE=50MB          # 最大文件上传大小
```

### 4. 启动项目

```bash
# 同时启动前端和后端开发服务器
npm run dev

# 或者分别启动
# 启动前端开发服务器 (端口: 5173)
npm run client:dev

# 启动后端开发服务器 (端口: 3002)
npm run server:dev
```

### 5. 访问应用

启动成功后，在浏览器中访问：

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3002

## 🧪 测试指南

### 访问聊天页面

1. 打开浏览器，访问 http://localhost:5173
2. 在首页点击「开始诊断」或直接访问 http://localhost:5173/chat
3. 进入聊天界面，开始与AI助手对话

### 测试功能

#### 基础对话测试
1. 在聊天输入框中输入任意文本，如："我最近感觉很焦虑"
2. 点击发送按钮或按Enter键
3. 观察AI回复的打字机效果
4. 查看左侧智能体面板，观察分析师的工作状态和进度

#### 文件上传测试
1. 点击聊天输入框旁的📎图标
2. 选择测试文件（支持视频、音频、图片、EEG、fNIRS等格式）
3. 观察对应的分析师被激活并开始工作
4. 查看分析进度和状态变化

#### 多智能体协同测试
1. 上传多种类型的文件
2. 输入包含多种症状关键词的文本
3. 观察多个分析师同时工作的效果
4. 等待所有分析师完成工作（15-20秒）

## 🔧 AI回复内容修改指南

### 预设回复内容位置

项目中的AI回复内容主要存储在以下文件中：

#### 1. 前端预设回复 (主要)
**文件位置**: `src/hooks/useStreamingChat.ts`

```typescript
// 第1-15行附近
const presetReplies = [
  // 消息1: 初始回复
  '谢谢您愿意分享这些感受，听起来这段时间您过得相当不容易...',
  
  // 消息2: 分析回复
  '我已指派我的文本与病史分析师开始对您的描述进行深度语义分析...',
  
  // ... 更多预设回复
];
```

**修改方法**:
1. 打开 `src/hooks/useStreamingChat.ts` 文件
2. 找到 `presetReplies` 数组
3. 修改数组中的字符串内容
4. 保存文件，热重载会自动生效

#### 2. 后端动态回复
**文件位置**: `api/agents/AgentManager.ts`

```typescript
// 第395-442行附近
const responses = {
  greeting: [
    '您好！我是您的专属心理健康助手...',
    '欢迎来到多智能体心理诊断系统！...'
  ],
  mood: [
    '感谢您的分享。为了更好地了解您的情况...',
    '我理解您的感受。接下来，我们需要一些客观的生理指标...'
  ],
  // ... 更多回复类型
};
```

**修改方法**:
1. 打开 `api/agents/AgentManager.ts` 文件
2. 找到 `generatePrimeAgentResponse` 方法中的 `responses` 对象
3. 修改对应类型的回复内容
4. 重启后端服务器使修改生效

#### 3. 诊断路由回复
**文件位置**: `api/routes/diagnosis.ts`

```typescript
// 第684-707行附近
function generateAIResponse(message: string): string {
  const responses = {
    '症状': '我理解您的症状描述。让我为您分析一下...',
    '抑郁': '抑郁症状需要专业的评估和治疗...',
    '焦虑': '焦虑情绪是很常见的心理状态...',
    // ... 更多关键词回复
  };
}
```

### 自定义回复内容

#### 添加新的预设回复

1. **前端添加**:
```typescript
// 在 src/hooks/useStreamingChat.ts 中
const presetReplies = [
  // 现有回复...
  '您的新回复内容在这里', // 添加新回复
];
```

2. **后端添加**:
```typescript
// 在 api/agents/AgentManager.ts 中
const responses = {
  // 现有类型...
  newType: [ // 添加新类型
    '新类型的回复内容1',
    '新类型的回复内容2'
  ]
};
```

#### 修改智能体激活关键词

**文件位置**: `src/pages/Chat.tsx`

```typescript
// 第250-293行附近
const agentKeywords = {
  'text-analyst': ['症状', '病史', '感受', '情绪', '抑郁', '焦虑'],
  'audio-analyst': ['语音', '录音', '说话', '声音', '语调'],
  'video-analyst': ['视频', '表情', '动作', '行为'],
  // ... 添加或修改关键词
};
```

#### 调整分析时间

**文件位置**: `src/pages/Chat.tsx`

```typescript
// 第405行和第541行附近
// 修改分析完成时间（当前为15-20秒）
const randomDuration = Math.floor(Math.random() * 5000) + 15000; // 15000-20000毫秒

// 可以修改为其他时间范围，例如10-15秒：
const randomDuration = Math.floor(Math.random() * 5000) + 10000; // 10000-15000毫秒
```

## 📁 项目结构

```
magent/
├── api/                          # 后端代码
│   ├── agents/                   # 智能体管理
│   │   └── AgentManager.ts       # 智能体管理器
│   ├── routes/                   # API路由
│   │   ├── auth.ts              # 认证路由
│   │   ├── diagnosis.ts         # 诊断路由
│   │   ├── patients.ts          # 患者管理
│   │   └── upload.ts            # 文件上传
│   ├── lib/                     # 工具库
│   ├── app.ts                   # Express应用配置
│   ├── index.ts                 # Vercel部署入口
│   └── server.ts                # 开发服务器
├── src/                         # 前端代码
│   ├── components/              # 通用组件
│   │   ├── ProgressBar.tsx      # 进度条组件
│   │   ├── TypewriterMessage.tsx # 打字机效果组件
│   │   └── ...
│   ├── hooks/                   # 自定义Hook
│   │   ├── useStreamingChat.ts  # 流式聊天Hook (包含预设回复)
│   │   └── useWebSocket.ts      # WebSocket Hook
│   ├── pages/                   # 页面组件
│   │   ├── Chat.tsx             # 聊天页面 (主要功能)
│   │   ├── Home.tsx             # 首页
│   │   └── ...
│   ├── utils/                   # 工具函数
│   └── store/                   # 状态管理
├── public/                      # 静态资源
├── uploads/                     # 文件上传目录
├── .env.example                 # 环境变量模板
├── package.json                 # 项目配置
├── vite.config.ts              # Vite配置
├── tailwind.config.js          # Tailwind配置
└── vercel.json                 # Vercel部署配置
```

## 🔨 开发命令

```bash
# 开发环境
npm run dev              # 同时启动前后端
npm run client:dev       # 仅启动前端
npm run server:dev       # 仅启动后端

# 构建
npm run build           # 构建生产版本
npm run build:prod      # 构建并进行类型检查

# 代码检查
npm run lint            # ESLint代码检查
npm run check           # TypeScript类型检查

# 预览
npm run preview         # 预览构建结果
```

## 🚀 部署指南

### Vercel部署 (推荐)

1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. 配置环境变量 (如果需要)
4. 部署完成

### 本地构建部署

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 🐛 常见问题

### Q: 启动时提示端口被占用
A: 修改 `.env` 文件中的 `PORT` 配置，或者关闭占用端口的程序

### Q: 文件上传失败
A: 检查 `uploads/` 目录是否存在，确保有写入权限

### Q: AI回复不显示
A: 检查浏览器控制台是否有错误，确保前后端都正常启动

### Q: 智能体不激活
A: 检查输入的关键词是否在 `agentKeywords` 配置中

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## 📞 联系方式

如有问题，请通过GitHub Issues联系我们。
