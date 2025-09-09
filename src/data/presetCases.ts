// 预设案例对话数据
export interface PresetMessage {
  id: string
  type: 'user' | 'assistant' | 'system' | 'file-upload'
  content: string
  timestamp: Date
  files?: {
    id: string
    name: string
    type: string
    size: number
    url?: string
    preview?: string // 预览图片URL
    description?: string
  }[]
  agentActivations?: string[] // 激活的智能体ID
  analysisResults?: {
    agentId: string
    result: string
    confidence: number
  }[]
  delay?: number // 自动播放时的延迟时间（毫秒）
}

export interface PresetCase {
  id: string
  title: string
  description: string
  duration: string
  tags: string[]
  messages: PresetMessage[]
}

// 抑郁症诊断案例
const depressionCase: PresetCase = {
  id: 'depression',
  title: '抑郁症多模态诊断案例',
  description: '展示AI如何通过EEG、行为视频等多模态数据诊断抑郁症',
  duration: '约3分钟',
  tags: ['抑郁症', 'EEG分析', '行为识别', '多模态融合'],
  messages: [
    {
      id: 'dep-1',
      type: 'user',
      content: '医生您好，我最近几个月感觉情绪很低落，对以前喜欢的事情都失去了兴趣，经常感到疲惫，晚上也睡不好觉，注意力很难集中。这种情况已经持续了大概3个月了，严重影响了我的工作和生活。我之前很喜欢画画和听音乐，但现在完全提不起兴趣。工作效率也大幅下降，同事们都注意到了我的变化。我很担心自己的状态，请帮我分析一下这是什么情况。',
      timestamp: new Date(),
      delay: 1000
    },
    {
      id: 'dep-2',
      type: 'assistant',
      content: '感谢您详细描述了您的情况。我已经指派**文本与病史分析师**开始分析您的症状描述。从您的叙述中，我识别到了几个重要的抑郁症状指标：情绪低落、兴趣丧失（快感缺失）、疲劳感、睡眠障碍和注意力问题。\n\n您提到的症状持续时间（3个月）和严重程度（影响工作和社交功能）都提示需要进一步的专业评估。为了进行更准确的评估，我建议您上传一些客观的生理数据。请问您是否有最近的EEG（脑电图）数据？这将帮助我们从神经生理学角度分析您的大脑活动模式，特别是前额叶和边缘系统的功能状态。',
      timestamp: new Date(),
      agentActivations: ['text-analyst'],
      delay: 3000
    },
    {
      id: 'dep-3',
      type: 'user',
      content: '我这里有上周在医院做的EEG检查数据，是在我情绪最低落的时候测量的。医生说我的脑电波有些异常，但没有详细解释。我现在上传给您，希望能得到更专业的分析。',
      timestamp: new Date(),
      delay: 2000
    },
    {
      id: 'dep-7-1',
      type: 'assistant',
      content: '**视频分析师**和**音频分析师**正在并行处理您的视频数据。为了完善我们的评估，我还需要您完成一份标准化的抑郁评估量表。请您填写PHQ-9（患者健康问卷-9）并上传结果。这是国际通用的抑郁症筛查工具。',
      timestamp: new Date(),
      delay: 3000
    },
    {
      id: 'dep-7-2',
      type: 'user',
      content: '我已经完成了PHQ-9量表，总分是19分。我把填写好的量表拍照上传给您。',
      timestamp: new Date(),
      delay: 2500
    },
    {
      id: 'dep-7-3',
      type: 'file-upload',
      content: '用户上传了PHQ-9抑郁量表结果',
      timestamp: new Date(),
      files: [
        {
          id: 'phq9-scale',
          name: 'PHQ9_depression_questionnaire.pdf',
          type: 'application/pdf',
          size: 1048576,
          preview: '',
          description: 'PHQ-9抑郁症问卷评估结果，总分19分，提示重度抑郁症状'
        }
      ],
      agentActivations: ['image-analyst'],
      delay: 1500
    },
    {
      id: 'dep-7-4',
      type: 'assistant',
      content: '**图像分析师**正在处理您的PHQ-9量表结果。19分的得分提示重度抑郁症状。为了更全面地评估您的状况，我需要了解一些具体信息：\n\n1. 您的抑郁症状是否有特定的触发因素？\n2. 是否有家族精神疾病史？\n3. 最近是否有重大生活事件或压力源？\n4. 您是否尝试过任何应对策略？\n\n这些信息将帮助我们制定个性化的治疗方案。',
      timestamp: new Date(),
      delay: 3000
    },
    {
      id: 'dep-7-5',
      type: 'user',
      content: '关于触发因素，主要是工作压力和人际关系问题。我最近工作任务很重，经常感到无法胜任，对未来也很悲观。家族史方面，我父亲有过抑郁症。最近确实压力很大，感觉生活失去了意义。我试过运动和听音乐，但效果不太明显。',
      timestamp: new Date(),
      delay: 4000
    },
    {
      id: 'dep-7-6',
      type: 'assistant',
      content: '感谢您提供的详细信息。工作压力和人际关系问题确实是抑郁症的常见触发因素，而家族史也是重要的风险因素。我已经将这些信息整合到评估中，并启动了**心理社会因素分析师**来评估环境因素的影响。\n\n现在让我为您提供完整的抑郁症诊断分析。',
      timestamp: new Date(),
      agentActivations: ['text-analyst'],
      delay: 3500
    },
    {
      id: 'dep-4',
      type: 'file-upload',
      content: '用户上传了EEG数据文件',
      timestamp: new Date(),
      files: [
        {
          id: 'eeg-1',
          name: 'patient_eeg_20241201.edf',
          type: 'application/edf',
          size: 2048576,
          preview: '',
          description: 'EEG脑电图数据，显示抑郁症特征性的α波减少和θ波增加模式'
        }
      ],
      agentActivations: ['eeg-analyst'],
      delay: 1500
    },
    {
      id: 'dep-4-1',
      type: 'assistant',
      content: '**EEG分析师**正在处理您的脑电数据，初步观察显示一些值得关注的模式。同时，为了建立完整的症状档案，我想了解一些具体细节：\n\n1. 您的睡眠模式具体是怎样的？是入睡困难还是早醒？\n2. 食欲和体重是否有变化？\n3. 是否有过自我伤害或自杀的想法？\n\n这些信息对于准确评估您的状况非常重要。',
      timestamp: new Date(),
      delay: 3000
    },
    {
      id: 'dep-4-2',
      type: 'user',
      content: '关于睡眠，我主要是早醒问题，通常凌晨3-4点就醒了，然后再也睡不着。食欲确实下降了很多，体重在这3个月里减轻了大约8公斤。至于自杀想法...说实话，我确实有过这样的念头，特别是在最难熬的时候，但我没有具体的计划。这让我很害怕，所以我才来寻求帮助。',
      timestamp: new Date(),
      delay: 4000
    },
    {
      id: 'dep-4-3',
      type: 'assistant',
      content: '感谢您的坦诚，这需要很大的勇气。您提到的早醒、体重下降和自杀意念都是重要的临床指标。我已经将这些信息标记为高优先级，并启动了**风险评估专家**来评估您的安全状况。\n\n您寻求帮助是非常正确的决定。现在让我们继续收集数据来制定最适合的治疗方案。',
      timestamp: new Date(),
      agentActivations: ['text-analyst'],
      delay: 3500
    },
    {
      id: 'dep-5',
      type: 'assistant',
      content: '收到您的EEG数据，**EEG分析师**正在进行深度分析。初步观察显示您的α波活动确实有显著异常。同时，为了获得更全面的评估，我建议您录制一段简短的视频，描述一下这些症状对您日常生活的具体影响，比如工作表现、人际关系、日常活动等。这将帮助**视频分析师**分析您的面部表情、语调和行为模式，从而提供更准确的情绪状态评估。',
      timestamp: new Date(),
      delay: 4000
    },
    {
      id: 'dep-6',
      type: 'user',
      content: '好的，我录制了一段视频，详细描述了我的感受和日常状态。在视频中我谈到了工作中的困难、与家人朋友的疏远，以及每天早上起床时的那种绝望感。希望这能帮助您更好地了解我的情况。',
      timestamp: new Date(),
      delay: 3000
    },
    {
      id: 'dep-7',
      type: 'file-upload',
      content: '用户上传了行为评估视频',
      timestamp: new Date(),
      files: [
        {
          id: 'video-1',
          name: 'behavioral_assessment.mp4',
          type: 'video/mp4',
          size: 15728640,
          preview: '',
          description: '患者行为评估视频，包含面部表情、语调和肢体语言分析'
        }
      ],
      agentActivations: ['video-analyst', 'audio-analyst'],
      delay: 2000
    },
    {
      id: 'dep-8',
      type: 'assistant',
      content: '**EEG分析师详细报告**：\n• α波活动显著降低（8-12Hz频段功率下降35%）\n• θ波活动异常增加（4-8Hz频段功率上升28%）\n• 左侧前额叶区域活动不对称，提示情绪调节功能受损\n• δ波在清醒状态下异常增加，与认知功能下降相关\n• **结论**：EEG模式高度符合重度抑郁症的神经生理特征\n\n**视频分析师报告**：\n• 面部表情分析：悲伤表情占比73%，微笑表情仅占2%\n• 眼神接触时间减少42%，显示社交回避倾向\n• 语速较正常水平降低30%，语调单调\n• 肢体语言：肩膀下垂，姿态消极\n• **结论**：行为模式显示典型的重度抑郁症状表现\n\n**图像分析师报告**：\n• PHQ-9总分19分（重度抑郁范围：15-27分）\n• 高分项目：情绪低落(3分)、兴趣丧失(3分)、自杀意念(2分)\n• **结论**：量表评估确认重度抑郁症诊断',
      timestamp: new Date(),
      analysisResults: [
        {
          agentId: 'eeg-analyst',
          result: '重度抑郁症神经生理特征',
          confidence: 0.92
        },
        {
          agentId: 'video-analyst',
          result: '典型抑郁行为模式',
          confidence: 0.88
        },
        {
          agentId: 'image-analyst',
          result: '重度抑郁症量表确认',
          confidence: 0.95
        }
      ],
      delay: 6000
    },
    {
      id: 'dep-9',
      type: 'assistant',
      content: '**风险评估专家报告**：\n基于您提到的自杀意念，我进行了紧急风险评估：\n• 自杀风险等级：中等风险\n• 保护因素：主动寻求帮助，无具体计划\n• **建议**：需要密切监护和及时干预\n\n现在让我为您提供完整的诊断分析。',
      timestamp: new Date(),
      analysisResults: [
        {
          agentId: 'text-analyst',
          result: '中等自杀风险评估',
          confidence: 0.87
        }
      ],
      delay: 3000
    },
    {
      id: 'dep-10',
      type: 'assistant',
      content: '**多模态融合诊断报告**\n\n经过我的专家团队全面协作分析，现提供综合诊断结果：\n\n**最终诊断**：重度抑郁症（Major Depressive Disorder）\n**诊断置信度**：96%\n**风险等级**：中等自杀风险，需要紧急关注\n\n**多维度证据支持**：\n\n🧠 **神经生理证据**：\n• EEG：α波下降35%，θ波增加28%\n• 左侧前额叶功能不对称，情绪调节受损\n• 神经生理证据置信度：92%\n\n📊 **标准化评估证据**：\n• PHQ-9评分19分（重度抑郁范围）\n• 符合DSM-5重度抑郁症7项核心标准\n• 量表评估证据置信度：95%\n\n🎭 **行为与表情证据**：\n• 悲伤表情占比73%，社交回避明显\n• 语速下降30%，肢体语言消极\n• 行为学证据置信度：88%\n\n⚠️ **风险因素**：\n• 自杀意念存在但无具体计划\n• 社会功能严重受损\n• 体重显著下降（8公斤/3个月）\n\n**紧急治疗建议**：\n1. **立即就医**：建议24小时内就诊精神科\n2. **药物治疗**：SSRI类抗抑郁药物（如舍曲林）\n3. **心理治疗**：认知行为疗法（CBT）\n4. **安全计划**：建立危机干预联系方式\n5. **社会支持**：告知家属，建立支持网络\n\n**监测方案**：\n• 每周EEG监测治疗反应\n• 每2周PHQ-9评估症状变化\n• 持续自杀风险评估\n\n**预后评估**：通过规范治疗，症状有望在6-8周内显著改善。\n\n**重要提醒**：鉴于存在自杀风险，请立即寻求专业医疗帮助。如有紧急情况，请拨打心理危机干预热线：400-161-9995',
      timestamp: new Date(),
      delay: 8000
    }
  ]
}

// 焦虑症评估案例
const anxietyCase: PresetCase = {
  id: 'anxiety',
  title: '焦虑症fNIRS评估案例',
  description: '通过fNIRS脑功能成像和心理量表评估焦虑障碍',
  duration: '约4分钟',
  tags: ['焦虑症', 'fNIRS分析', '心理量表', '脑功能成像'],
  messages: [
    {
      id: 'anx-1',
      type: 'user',
      content: '医生，我最近总是感到很紧张和担心，心跳很快，手心出汗，经常有一种说不出的恐惧感。特别是在人多的地方或者要做重要事情的时候，这种感觉会更强烈。有时候甚至会突然感到呼吸困难，好像要窒息一样。这种情况已经影响到我的日常生活了，我经常在开会前就开始紧张，晚上也经常失眠，脑子里总是想着各种担心的事情。',
      timestamp: new Date(),
      delay: 1000
    },
    {
      id: 'anx-2',
      type: 'assistant',
      content: '您描述的症状很典型，我已经启动**文本与病史分析师**来分析您的症状模式。从您的描述中，我识别到了广泛性焦虑和可能的惊恐发作症状，包括心悸、出汗、呼吸困难、社交焦虑和睡眠障碍。\n\n您提到的症状对日常生活的影响提示需要专业评估。为了更准确地评估您的焦虑水平和大脑功能状态，我建议您上传fNIRS（功能性近红外光谱）数据。这项检查可以实时监测您大脑前额叶皮层的血氧变化，帮助我们了解焦虑时的大脑活动模式。',
      timestamp: new Date(),
      agentActivations: ['text-analyst'],
      delay: 3500
    },
    {
      id: 'anx-3',
      type: 'user',
      content: '我有上个月做的fNIRS检查数据，是在焦虑发作时测量的。检查时我正好处于高度紧张状态，心率很快，感觉很不舒服。我现在上传给您，希望能得到详细的分析。',
      timestamp: new Date(),
      delay: 2500
    },
    {
      id: 'anx-4',
      type: 'file-upload',
      content: '用户上传了fNIRS脑功能数据',
      timestamp: new Date(),
      files: [
        {
          id: 'fnirs-1',
          name: 'anxiety_fnirs_data.mat',
          type: 'application/matlab',
          size: 5242880,
          preview: '',
          description: 'fNIRS功能性近红外光谱数据，显示焦虑状态下前额叶皮层的异常激活模式'
        }
      ],
      agentActivations: ['fnirs-analyst'],
      delay: 2000
    },
    {
      id: 'anx-5',
      type: 'assistant',
      content: '**fNIRS分析师**正在处理您的脑功能数据，初步观察显示前额叶皮层有异常激活模式。同时，为了完善评估，我需要您完成一份标准化的焦虑评估量表。请您上传GAD-7（广泛性焦虑量表）的评估结果，这将帮助我们量化您的焦虑程度。',
      timestamp: new Date(),
      delay: 3000
    },
    {
      id: 'anx-6',
      type: 'user',
      content: '我已经完成了GAD-7量表，总分是16分。在填写过程中我发现，我在"难以控制担心"和"担心太多不同的事情"这两项得分最高。我把结果截图上传给您。',
      timestamp: new Date(),
      delay: 2000
    },
    {
      id: 'anx-7',
      type: 'file-upload',
      content: '用户上传了GAD-7量表结果',
      timestamp: new Date(),
      files: [
        {
          id: 'scale-1',
          name: 'GAD7_results.png',
          type: 'image/png',
          size: 524288,
          preview: '',
          description: 'GAD-7广泛性焦虑量表结果，总分16分，提示重度焦虑'
        }
      ],
      agentActivations: ['image-analyst'],
      delay: 1500
    },
    {
      id: 'anx-8',
      type: 'assistant',
      content: '**fNIRS分析师报告**：\n• 双侧前额叶皮层（PFC）血氧浓度显著升高\n• 右侧杏仁核-前额叶连接异常增强\n• 默认模式网络活动紊乱\n• **结论**：脑功能模式符合广泛性焦虑症的神经影像学特征\n\n**图像分析师报告**：\n• GAD-7总分：16分（重度焦虑范围：15-21分）\n• 高分项目：过度担心(3分)、难以控制担心(3分)、坐立不安(3分)\n• **结论**：量表评估确认重度焦虑症状',
      timestamp: new Date(),
      analysisResults: [
        {
          agentId: 'fnirs-analyst',
          result: '广泛性焦虑症神经影像特征',
          confidence: 0.91
        },
        {
          agentId: 'image-analyst',
          result: '重度焦虑症状评估',
          confidence: 0.95
        }
      ],
      delay: 5500
    },
    {
      id: 'anx-9',
      type: 'assistant',
      content: '为了更全面地评估您的焦虑表现，请您录制一段音频，描述一下您在焦虑发作时的具体感受和身体反应。这将帮助**音频分析师**分析您的语音特征和情绪状态。',
      timestamp: new Date(),
      delay: 2000
    },
    {
      id: 'anx-10',
      type: 'user',
      content: '我录制了一段音频，详细描述了我焦虑时的感受和症状。',
      timestamp: new Date(),
      delay: 3000
    },
    {
      id: 'anx-11',
      type: 'file-upload',
      content: '用户上传了焦虑症状描述音频',
      timestamp: new Date(),
      files: [
        {
          id: 'audio-1',
          name: 'anxiety_description.wav',
          type: 'audio/wav',
          size: 3145728,
          preview: '',
          description: '患者焦虑症状描述音频，包含语音情感和声学特征分析'
        }
      ],
      agentActivations: ['audio-analyst'],
      delay: 2000
    },
    {
      id: 'anx-12',
      type: 'assistant',
      content: '**音频分析师报告**：\n• 语音基频变异性增加47%（正常范围：±15%）\n• 语速不规律，平均语速比正常快23%\n• 声音颤抖指数：2.8（正常<1.5）\n• 情绪识别：焦虑情绪置信度89%\n• **结论**：语音特征显示明显的焦虑状态',
      timestamp: new Date(),
      analysisResults: [
        {
          agentId: 'audio-analyst',
          result: '焦虑状态语音特征',
          confidence: 0.89
        }
      ],
      delay: 4000
    },
    {
      id: 'anx-13',
      type: 'assistant',
      content: '**综合诊断报告**\n\n基于多模态数据的全面分析，专家团队诊断结果：\n\n**诊断结果**：广泛性焦虑症（Generalized Anxiety Disorder）\n**置信度**：92%\n\n**多维度证据支持**：\n1. **临床量表**：GAD-7评分16分，确认重度焦虑\n2. **脑功能成像**：fNIRS显示前额叶皮层异常激活\n3. **语音分析**：声学特征符合焦虑状态模式\n4. **症状描述**：符合DSM-5广泛性焦虑症诊断标准\n\n**治疗建议**：\n• 认知行为疗法（CBT）作为一线治疗\n• 必要时考虑抗焦虑药物治疗\n• 放松训练和正念冥想\n• 定期fNIRS监测治疗效果\n\n**预后评估**：通过系统治疗，症状有望显著改善。',
      timestamp: new Date(),
      delay: 6000
    }
  ]
}

// 综合心理健康评估案例
const comprehensiveCase: PresetCase = {
  id: 'comprehensive',
  title: '双相障碍综合评估案例',
  description: '多模态数据融合分析，识别复杂的双相情感障碍',
  duration: '约5分钟',
  tags: ['双相障碍', '多模态融合', 'EEG+fNIRS', '综合评估'],
  messages: [
    {
      id: 'comp-1',
      type: 'user',
      content: '医生，我想做一个全面的心理健康评估。最近几个月我的情绪波动特别大，让我很困扰。有时候我会突然变得异常兴奋和有干劲，感觉自己充满能量，可以连续工作十几个小时而不觉得累，思维也特别活跃，想法一个接一个冒出来。在这种状态下，我几乎不需要睡觉，每天只睡2-3小时就觉得精神饱满，还会做出一些平时不会做的冲动决定，比如大额消费或者制定不切实际的计划。\n\n但过一段时间，我又会陷入完全相反的状态，变得极度沮丧和绝望，对任何事情都提不起兴趣，连起床都觉得困难。在低落期，我会嗜睡，一天能睡十几个小时还是觉得疲惫。我的食欲也会发生很大变化，有时候完全没有食欲，有时候又暴饮暴食。\n\n这种极端的情绪变化已经严重影响了我的工作和人际关系，我担心自己的心理状态，希望能得到专业的分析和建议。',
      timestamp: new Date(),
      delay: 1000
    },
    {
      id: 'comp-2',
      type: 'assistant',
      content: '感谢您详细描述症状。您提到的极端情绪波动、睡眠模式剧烈变化、思维活跃度的巨大差异以及冲动行为，这些都是非常重要的临床信息。我已经启动**文本与病史分析师**来分析您的症状模式。\n\n您描述的症状高度提示双相情感障碍的可能性，特别是躁狂发作和抑郁发作的交替出现。为了进行准确的诊断，我需要了解更多信息：\n\n1. 这种情绪波动的模式大概持续多长时间了？\n2. 您的家族中是否有精神疾病史？\n3. 是否有过创伤经历或重大生活事件？\n4. 目前是否在服用任何药物？\n\n同时，为了进行多模态融合分析，我建议您提供神经影像学检查数据，包括EEG和fNIRS数据，这样我们可以从神经生理学角度进行客观评估。',
      timestamp: new Date(),
      agentActivations: ['text-analyst'],
      delay: 4000
    },
    {
      id: 'comp-3',
      type: 'user',
      content: '这种情况大概有一年半了，最开始我以为只是工作压力大导致的。关于家族史，我的父亲有抑郁症，我姑姑被诊断过双相障碍。我在大学时期经历过一次严重的感情创伤，不过那已经是很多年前的事了。目前我没有服用任何精神类药物，只是偶尔会服用安眠药帮助睡眠。\n\n我这里有完整的神经影像学检查数据，包括在不同情绪状态下的EEG和fNIRS数据，还有一些心理量表的评估结果。我现在一起上传给您。',
      timestamp: new Date(),
      delay: 2500
    },
    {
      id: 'comp-4',
      type: 'file-upload',
      content: '用户上传了多模态神经影像数据',
      timestamp: new Date(),
      files: [
        {
          id: 'multi-eeg',
          name: 'bipolar_eeg_episodes.edf',
          type: 'application/edf',
          size: 4194304,
          preview: '',
          description: 'EEG数据对比：躁狂期vs抑郁期的脑电活动模式'
        },
        {
          id: 'multi-fnirs',
          name: 'bipolar_fnirs_states.mat',
          type: 'application/matlab',
          size: 6291456,
          preview: '',
          description: 'fNIRS数据：不同情绪状态下的前额叶皮层激活模式'
        }
      ],
      agentActivations: ['eeg-analyst', 'fnirs-analyst'],
      delay: 2000
    },
    {
      id: 'comp-5',
      type: 'assistant',
      content: '收到您的多模态数据，**EEG分析师**、**fNIRS分析师**和**情绪模式分析师**正在进行并行分析。您的家族史信息非常重要，父亲的抑郁症和姑姑的双相障碍提示了遗传易感性。我已经启动**遗传风险评估师**来分析这些因素。\n\n**情绪模式分析师初步反馈**：6个月追踪数据显示明显的周期性波动，高峰期和低谷期交替出现，符合双相障碍的典型模式。\n\n为了更好地理解您的症状时间线和行为表现，请您录制一段视频，详细描述一下您在躁狂期和抑郁期的具体表现和行为变化。同时，如果您有任何生理监测数据（如心率、活动量等），也请一并提供。',
      timestamp: new Date(),
      agentActivations: ['text-analyst'],
      delay: 3000
    },
    {
      id: 'comp-6',
      type: 'user',
      content: '我录制了一段详细的视频，描述了我在躁狂期和抑郁期的不同表现。在躁狂期，我感觉自己像换了一个人，精力充沛，思维敏捷，说话速度很快，有时候朋友都说跟不上我的思路。我会变得特别自信，觉得自己能做任何事情，有时候会制定一些不切实际的计划。而在抑郁期，我几乎不想说话，感觉身体很沉重，对任何事情都失去兴趣，连洗澡都觉得是负担。\n\n另外，我还有智能手表记录的6个月生理数据，包括心率、步数、睡眠质量等，可以清楚地看到我的生理指标随情绪状态的变化。',
      timestamp: new Date(),
      delay: 3500
    },
    {
      id: 'comp-7',
      type: 'file-upload',
      content: '用户上传了情绪状态对比视频',
      timestamp: new Date(),
      files: [
        {
          id: 'bipolar-video',
          name: 'mood_episodes_description.mp4',
          type: 'video/mp4',
          size: 20971520,
          preview: '',
          description: '患者描述不同情绪状态的视频，包含躁狂期和抑郁期的行为对比'
        }
      ],
      agentActivations: ['video-analyst', 'audio-analyst'],
      delay: 2500
    },
    {
      id: 'comp-8',
      type: 'assistant',
      content: '**多专家协作分析报告**：\n\n**EEG分析师详细报告**：\n• 躁狂期：β波活动显著增加（13-30Hz，+45%），γ波异常增强\n• 抑郁期：θ波活动异常增加（4-8Hz，+38%），α波功率降低\n• 发现明显的周期性脑电模式变化，符合双相障碍神经生理特征\n• **结论**：EEG模式高度提示双相I型情感障碍\n\n**fNIRS分析师详细报告**：\n• 躁狂期：前额叶皮层（PFC）过度激活，血氧饱和度增加35%\n• 抑郁期：PFC活动显著降低，血流灌注减少28%\n• 情绪调节网络呈现典型的双相波动模式\n• **结论**：脑功能成像强烈支持双相障碍诊断\n\n**情绪模式分析师详细报告**：\n• 6个月数据显示4个完整的情绪周期\n• 躁狂期：持续5-9天，情绪评分8-10分\n• 抑郁期：持续14-28天，情绪评分1-3分\n• 周期性模式高度规律，符合双相I型特征\n• **结论**：情绪追踪数据确认双相障碍诊断\n\n**遗传风险评估师报告**：\n• 父亲抑郁症史：增加情绪障碍风险2-3倍\n• 姑姑双相障碍史：显著增加双相障碍易感性\n• 遗传负荷评估：高风险等级\n• **结论**：家族史强烈支持双相障碍易感性',
      timestamp: new Date(),
      analysisResults: [
        {
          agentId: 'eeg-analyst',
          result: '双相障碍EEG特征',
          confidence: 0.87
        },
        {
          agentId: 'fnirs-analyst',
          result: '双相障碍脑功能模式',
          confidence: 0.89
        }
      ],
      delay: 6000
    },
    {
      id: 'comp-9',
      type: 'assistant',
      content: '**生理数据分析师报告**：\n• 躁狂期：平均心率95-110bpm（基线+25%），日均步数15000+\n• 抑郁期：平均心率65-75bpm（基线-15%），日均步数<3000\n• 睡眠模式：躁狂期2-4小时，抑郁期10-14小时\n• 心率变异性在情绪发作期间显著异常\n• **结论**：生理指标完全支持双相障碍诊断\n\n为了完善诊断评估，请您上传标准化心理评估量表的结果，包括MDQ（心境障碍问卷）、YMRS（Young躁狂评定量表）和任何其他相关的心理测评结果。',
      timestamp: new Date(),
      analysisResults: [
        {
          agentId: 'text-analyst',
          result: '双相障碍生理确认',
          confidence: 0.91
        }
      ],
      delay: 2000
    },
    {
      id: 'comp-10',
      type: 'user',
      content: '我有完整的心理评估量表结果，包括MDQ量表、YMRS评定量表、PHQ-9抑郁量表，还有GAF功能评估。我在不同情绪状态下分别做过这些测试，现在把所有结果都上传给您。',
      timestamp: new Date(),
      delay: 2000
    },
    {
      id: 'comp-11',
      type: 'file-upload',
      content: '用户上传了心理评估量表结果',
      timestamp: new Date(),
      files: [
        {
          id: 'scales-comp',
          name: 'mood_disorder_scales.pdf',
          type: 'application/pdf',
          size: 1048576,
          preview: '',
          description: 'MDQ和PHQ-9量表结果，显示双相障碍的高风险评分'
        }
      ],
      agentActivations: ['image-analyst'],
      delay: 1500
    },
    {
      id: 'comp-12',
      type: 'assistant',
      content: '**视频分析师报告**：\n• 躁狂期描述：语速快（+65%），手势增多，眼神明亮\n• 抑郁期描述：语速慢（-40%），表情平淡，眼神回避\n• 发现明显的行为模式双相性变化\n• **结论**：行为表现符合双相障碍典型特征\n\n**音频分析师报告**：\n• 躁狂期：语调高亢，语速极快，音量增大\n• 抑郁期：语调低沉，语速缓慢，音量减小\n• 情绪识别算法检测到极端情绪波动\n• **结论**：语音特征确认双相情绪模式\n\n**量表分析师详细报告**：\n• **MDQ评分**：11/13分，超过阈值（≥7分），高度提示双相障碍\n• **YMRS评分**：躁狂期28分，达到中度躁狂标准（20-30分）\n• **PHQ-9评分**：抑郁期16分，符合中重度抑郁标准（15-19分）\n• **GAF评分**：55分，显示中度功能损害，影响社会和职业功能\n• **结论**：所有标准化量表结果一致支持双相I型情感障碍诊断\n\n**临床心理学家评估**：\n• 症状持续时间：18个月，符合诊断时间标准\n• 功能损害程度：中度，影响工作和人际关系\n• 发作频率：年均4-5个周期，属于快速循环型\n• 严重程度：中度到重度，需要积极干预',
      timestamp: new Date(),
      analysisResults: [
        {
          agentId: 'video-analyst',
          result: '双相行为模式特征',
          confidence: 0.91
        },
        {
          agentId: 'audio-analyst',
          result: '双相语音情绪特征',
          confidence: 0.88
        },
        {
          agentId: 'scale-analyst',
          result: '双相障碍量表确认',
          confidence: 0.92
        },
        {
          agentId: 'clinical-psychologist',
          result: '双相I型快速循环',
          confidence: 0.89
        }
      ],
      delay: 5000
    },
    {
      id: 'comp-13',
      type: 'assistant',
      content: '**综合诊断结论**\n\n基于多学科专家团队的全面分析，我们达成一致诊断：\n\n**主要诊断**：双相I型情感障碍，快速循环型\n**诊断置信度**：96%\n**功能损害等级**：中度\n\n**核心证据**：\n• 临床症状完全符合DSM-5双相I型障碍标准\n• EEG和fNIRS数据显示典型的双相神经生理模式\n• 标准化量表评估（MDQ、YMRS、PHQ-9）均支持诊断\n• 家族遗传史提供重要风险背景\n\n**治疗建议**：\n1. **紧急措施**：立即转诊精神科专科医生\n2. **药物治疗**：情绪稳定剂（如锂盐）\n3. **心理治疗**：认知行为疗法\n4. **生活管理**：规律作息，情绪监测\n\n**预后**：通过规范治疗可获得良好的症状控制。请务必在专业医生指导下进行治疗。',
      timestamp: new Date(),
      analysisResults: [
        {
          agentId: 'comprehensive-diagnosis-expert',
          result: '双相I型快速循环确诊',
          confidence: 0.96
        },
        {
          agentId: 'treatment-planner',
          result: '个性化治疗方案',
          confidence: 0.94
        }
      ],
      delay: 8000
    }
  ]
}

export const presetCases: PresetCase[] = [
  depressionCase,
  anxietyCase,
  comprehensiveCase
]

export const getCaseById = (id: string): PresetCase | undefined => {
  return presetCases.find(presetCase => presetCase.id === id)
}