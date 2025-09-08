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
      content: '医生您好，我最近几个月感觉情绪很低落，对以前喜欢的事情都失去了兴趣，经常感到疲惫，晚上也睡不好觉，注意力很难集中。这种情况已经持续了大概3个月了，严重影响了我的工作和生活。请帮我分析一下这是什么情况。',
      timestamp: new Date(),
      delay: 1000
    },
    {
      id: 'dep-2',
      type: 'assistant',
      content: '感谢您详细描述了您的情况。我已经指派**文本与病史分析师**开始分析您的症状描述。从您的叙述中，我识别到了几个重要的抑郁症状指标：情绪低落、兴趣丧失、疲劳感、睡眠障碍和注意力问题。\n\n为了进行更准确的评估，我建议您上传一些客观的生理数据。请问您是否有最近的EEG（脑电图）数据？这将帮助我们从神经生理学角度分析您的大脑活动模式。',
      timestamp: new Date(),
      agentActivations: ['text-pathology-analyst'],
      delay: 3000
    },
    {
      id: 'dep-3',
      type: 'user',
      content: '我这里有上周在医院做的EEG检查数据，我现在上传给您。',
      timestamp: new Date(),
      delay: 2000
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
          preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=EEG%20brainwave%20chart%20showing%20depression%20patterns%20with%20reduced%20alpha%20waves%20and%20increased%20theta%20activity%2C%20medical%20visualization%2C%20blue%20and%20green%20waveforms%20on%20dark%20background&image_size=landscape_4_3',
          description: 'EEG脑电图数据，显示抑郁症特征性的α波减少和θ波增加模式'
        }
      ],
      agentActivations: ['eeg-analyst'],
      delay: 1500
    },
    {
      id: 'dep-5',
      type: 'assistant',
      content: '收到您的EEG数据，**EEG分析师**正在进行深度分析。同时，为了获得更全面的评估，我建议您录制一段简短的视频，描述一下这些症状对您日常生活的具体影响。这将帮助**视频分析师**分析您的面部表情、语调和行为模式。',
      timestamp: new Date(),
      delay: 4000
    },
    {
      id: 'dep-6',
      type: 'user',
      content: '好的，我录制了一段视频，描述了我的感受和日常状态。',
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
          preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Person%20speaking%20to%20camera%20with%20sad%20expression%2C%20clinical%20interview%20setting%2C%20soft%20lighting%2C%20professional%20medical%20environment&image_size=landscape_4_3',
          description: '患者行为评估视频，包含面部表情、语调和肢体语言分析'
        }
      ],
      agentActivations: ['video-analyst', 'audio-analyst'],
      delay: 2000
    },
    {
      id: 'dep-8',
      type: 'assistant',
      content: '**EEG分析师报告**：\n• α波活动显著降低（8-12Hz频段功率下降35%）\n• θ波活动异常增加（4-8Hz频段功率上升28%）\n• 左侧前额叶区域活动不对称\n• **结论**：EEG模式高度符合重度抑郁症的神经生理特征\n\n**视频分析师报告**：\n• 面部表情分析：悲伤表情占比73%，微笑表情仅占2%\n• 眼神接触时间减少42%\n• 语速较正常水平降低30%\n• **结论**：行为模式显示典型的抑郁症状表现',
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
        }
      ],
      delay: 6000
    },
    {
      id: 'dep-9',
      type: 'assistant',
      content: '**综合诊断报告**\n\n基于多模态数据分析，我的专家团队达成一致诊断：\n\n**诊断结果**：重度抑郁症（Major Depressive Disorder）\n**置信度**：94%\n\n**关键证据**：\n1. **临床症状**：符合DSM-5重度抑郁症9项标准中的6项\n2. **神经生理**：EEG显示典型的抑郁症脑电模式\n3. **行为表现**：视频分析确认抑郁相关的表情和语言特征\n\n**建议**：\n• 建议尽快就医，寻求专业精神科医生的进一步评估\n• 考虑药物治疗结合心理治疗\n• 建议定期监测症状变化\n\n**注意**：本分析仅供参考，不能替代专业医疗诊断。',
      timestamp: new Date(),
      delay: 5000
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
      content: '医生，我最近总是感到很紧张和担心，心跳很快，手心出汗，经常有一种说不出的恐惧感。特别是在人多的地方或者要做重要事情的时候，这种感觉会更强烈。有时候甚至会突然感到呼吸困难，好像要窒息一样。这种情况已经影响到我的日常生活了。',
      timestamp: new Date(),
      delay: 1000
    },
    {
      id: 'anx-2',
      type: 'assistant',
      content: '您描述的症状很典型，我已经启动**文本与病史分析师**来分析您的症状模式。从您的描述中，我识别到了广泛性焦虑和可能的惊恐发作症状。\n\n为了更准确地评估您的焦虑水平和大脑功能状态，我建议您上传fNIRS（功能性近红外光谱）数据。这项检查可以实时监测您大脑前额叶皮层的血氧变化，帮助我们了解焦虑时的大脑活动模式。',
      timestamp: new Date(),
      agentActivations: ['text-pathology-analyst'],
      delay: 3500
    },
    {
      id: 'anx-3',
      type: 'user',
      content: '我有上个月做的fNIRS检查数据，是在焦虑发作时测量的。我现在上传给您。',
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
          preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=fNIRS%20brain%20heatmap%20showing%20anxiety%20patterns%20with%20increased%20prefrontal%20cortex%20activity%2C%20red%20and%20yellow%20activation%20areas%2C%20medical%20brain%20imaging%20visualization&image_size=landscape_4_3',
          description: 'fNIRS功能性近红外光谱数据，显示焦虑状态下前额叶皮层的异常激活模式'
        }
      ],
      agentActivations: ['fnirs-analyst'],
      delay: 2000
    },
    {
      id: 'anx-5',
      type: 'assistant',
      content: '**fNIRS分析师**正在处理您的脑功能数据。同时，为了完善评估，我需要您完成一份标准化的焦虑评估量表。请您上传GAD-7（广泛性焦虑量表）的评估结果。',
      timestamp: new Date(),
      delay: 3000
    },
    {
      id: 'anx-6',
      type: 'user',
      content: '我已经完成了GAD-7量表，总分是16分。我把结果截图上传给您。',
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
          preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=GAD-7%20anxiety%20scale%20form%20with%20checkmarks%20showing%20high%20anxiety%20score%2C%20medical%20assessment%20document%2C%20clean%20clinical%20layout&image_size=portrait_4_3',
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
          preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Audio%20waveform%20visualization%20showing%20anxious%20speech%20patterns%2C%20irregular%20amplitude%20and%20frequency%2C%20blue%20and%20green%20sound%20waves%20on%20dark%20background&image_size=landscape_4_3',
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
      content: '医生，我想做一个全面的心理健康评估。最近我的情绪波动比较大，有时候很兴奋有干劲，有时候又很沮丧。睡眠也不太规律，有时候几乎不需要睡觉就很有精神，有时候又嗜睡。我担心自己的心理状态，希望能得到专业的分析和建议。',
      timestamp: new Date(),
      delay: 1000
    },
    {
      id: 'comp-2',
      type: 'assistant',
      content: '您的症状描述提示可能存在情绪周期性变化，这需要我们进行全面的评估。我已经启动**文本与病史分析师**来分析您的症状模式。\n\n您描述的情绪波动和睡眠变化模式很重要，可能提示双相情感障碍的可能性。为了准确诊断，我建议您提供多种类型的检查数据，包括EEG和fNIRS数据，这样我们可以进行多模态融合分析。',
      timestamp: new Date(),
      agentActivations: ['text-pathology-analyst'],
      delay: 4000
    },
    {
      id: 'comp-3',
      type: 'user',
      content: '我这里有完整的检查数据，包括在不同情绪状态下的EEG和fNIRS数据。我现在一起上传给您。',
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
          preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=EEG%20brainwave%20comparison%20showing%20manic%20vs%20depressive%20episodes%2C%20split%20screen%20with%20high%20amplitude%20fast%20waves%20vs%20slow%20waves%2C%20medical%20visualization&image_size=landscape_4_3',
          description: 'EEG数据对比：躁狂期vs抑郁期的脑电活动模式'
        },
        {
          id: 'multi-fnirs',
          name: 'bipolar_fnirs_states.mat',
          type: 'application/matlab',
          size: 6291456,
          preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=fNIRS%20brain%20activation%20heatmap%20comparison%20showing%20bipolar%20disorder%20patterns%2C%20side%20by%20side%20manic%20and%20depressive%20brain%20states%2C%20colorful%20medical%20imaging&image_size=landscape_4_3',
          description: 'fNIRS数据：不同情绪状态下的前额叶皮层激活模式'
        }
      ],
      agentActivations: ['eeg-analyst', 'fnirs-analyst'],
      delay: 2000
    },
    {
      id: 'comp-5',
      type: 'assistant',
      content: '收到您的多模态数据，**EEG分析师**和**fNIRS分析师**正在进行并行分析。同时，为了更好地理解您的症状时间线，请您录制一段视频，详细描述一下您在不同情绪状态下的具体表现和行为变化。',
      timestamp: new Date(),
      delay: 3000
    },
    {
      id: 'comp-6',
      type: 'user',
      content: '我录制了一段详细的视频，描述了我在高涨期和低落期的不同表现。',
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
          preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Person%20describing%20different%20mood%20states%2C%20split%20personality%20concept%2C%20one%20side%20energetic%20and%20happy%2C%20other%20side%20sad%20and%20tired%2C%20clinical%20setting&image_size=landscape_4_3',
          description: '患者描述不同情绪状态的视频，包含躁狂期和抑郁期的行为对比'
        }
      ],
      agentActivations: ['video-analyst', 'audio-analyst'],
      delay: 2500
    },
    {
      id: 'comp-8',
      type: 'assistant',
      content: '**EEG分析师初步报告**：\n• 躁狂期：β波活动显著增加（13-30Hz，+45%）\n• 抑郁期：θ波活动异常增加（4-8Hz，+38%）\n• 发现明显的周期性脑电模式变化\n• **初步结论**：EEG模式提示双相情感障碍特征\n\n**fNIRS分析师初步报告**：\n• 躁狂期：前额叶皮层过度激活\n• 抑郁期：前额叶皮层活动显著降低\n• 发现情绪调节网络的异常波动模式\n• **初步结论**：脑功能成像支持双相障碍诊断',
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
      content: '为了完善诊断，请您上传心境评估量表的结果，包括MDQ（心境障碍问卷）和任何其他相关的心理测评结果。',
      timestamp: new Date(),
      delay: 2000
    },
    {
      id: 'comp-10',
      type: 'user',
      content: '我有MDQ量表和PHQ-9的评估结果，现在上传给您。',
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
          preview: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Medical%20assessment%20forms%20showing%20mood%20disorder%20questionnaire%20results%2C%20checkboxes%20and%20scores%2C%20clinical%20documentation%2C%20professional%20layout&image_size=portrait_4_3',
          description: 'MDQ和PHQ-9量表结果，显示双相障碍的高风险评分'
        }
      ],
      agentActivations: ['image-analyst'],
      delay: 1500
    },
    {
      id: 'comp-12',
      type: 'assistant',
      content: '**视频分析师报告**：\n• 躁狂期描述：语速快（+65%），手势增多，眼神明亮\n• 抑郁期描述：语速慢（-40%），表情平淡，眼神回避\n• 发现明显的行为模式双相性变化\n• **结论**：行为表现符合双相障碍典型特征\n\n**音频分析师报告**：\n• 躁狂期：语调高亢，语速极快，音量增大\n• 抑郁期：语调低沉，语速缓慢，音量减小\n• 情绪识别算法检测到极端情绪波动\n• **结论**：语音特征确认双相情绪模式',
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
        }
      ],
      delay: 5000
    },
    {
      id: 'comp-13',
      type: 'assistant',
      content: '**图像分析师报告**：\n• MDQ量表：总分11分（≥7分提示双相障碍高风险）\n• PHQ-9评分：当前抑郁期评分18分（重度抑郁）\n• 量表结果与临床症状高度一致\n• **结论**：标准化评估确认双相障碍诊断',
      timestamp: new Date(),
      analysisResults: [
        {
          agentId: 'image-analyst',
          result: '双相障碍量表确认',
          confidence: 0.94
        }
      ],
      delay: 3000
    },
    {
      id: 'comp-14',
      type: 'assistant',
      content: '**多模态融合分析与最终诊断报告**\n\n经过我的专家团队全面协作分析，现提供综合诊断结果：\n\n**最终诊断**：双相I型情感障碍（Bipolar I Disorder）\n**诊断置信度**：96%\n\n**多维度证据融合**：\n\n🧠 **神经生理证据**：\n• EEG：躁狂期β波增加45%，抑郁期θ波增加38%\n• fNIRS：前额叶皮层激活呈现典型的双相波动模式\n• 神经影像学证据置信度：88%\n\n🎭 **行为与语音证据**：\n• 视频分析：确认躁狂期和抑郁期的行为对比特征\n• 音频分析：语音情绪呈现极端双相性变化\n• 行为学证据置信度：90%\n\n📋 **标准化评估证据**：\n• MDQ评分11分（高风险阈值≥7分）\n• PHQ-9当前评分18分（重度抑郁期）\n• 量表评估证据置信度：94%\n\n**治疗建议**：\n1. **药物治疗**：心境稳定剂（如锂盐）作为一线治疗\n2. **心理治疗**：认知行为疗法和家庭治疗\n3. **生活方式**：规律作息，避免诱发因素\n4. **监测方案**：定期EEG和fNIRS监测，评估治疗效果\n\n**预后评估**：通过规范治疗，可有效控制情绪波动，显著改善生活质量。\n\n**重要提醒**：请尽快就医，本分析报告可作为专业医生诊疗的重要参考。',
      timestamp: new Date(),
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