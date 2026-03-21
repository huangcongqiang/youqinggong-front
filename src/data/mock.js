export const webMockData = {
  landing: {
    badges: ['AI 拆单', '人才匹配', '协作验收', '企业审核'],
    entryNotes: [
      '企业端先看人才广场，确认合作对象后再进入项目沟通与协作。',
      '人才端先看任务广场，接单之后围绕任务推进进度与验收。',
      '官网首页只负责介绍、案例展示和入口分流，不混放具体业务操作。'
    ],
    metrics: [
      { label: '任务确认效率', value: '3 倍', note: 'AI 先拆解需求、工期与技能标签，再由 B 端确认。' },
      { label: '人才响应速度', value: '15 分钟', note: '系统按技能、档期、评分与历史交付表现自动推荐。' },
      { label: '进度透明度', value: '100%', note: '里程碑、附件、AI 审查建议全部沉淀在协作工作区。' },
      { label: '验收完成率', value: '92%', note: 'AI 先提醒验收节点，再进入双方评分。' }
    ],
    pillars: [
      {
        title: '企业 / 个人双入驻',
        description: '企业可上传资质材料，个人可申请虚拟企业，通过审核后即可发布合作需求。'
      },
      {
        title: 'AI 先拆需求再找人',
        description: '语音或文本输入后，自动生成任务拆解、工期评估、技能标签与风险提示。'
      },
      {
        title: '从接单到验收的协作闭环',
        description: '消息、日历、进度上传、AI 审查、验收和评分集中在统一工作区。'
      }
    ],
    stages: [
      { title: '1. 入驻与审核', note: '企业证照、身份证明、虚拟企业申请全部留痕。' },
      { title: '2. AI 生成执行方案', note: '拆分模块、给出排期、标记关键交付件和协作风险。' },
      { title: '3. 自动匹配人才', note: '按技能、作品、评分、当前档期和沟通偏好综合排序。' },
      { title: '4. 协作与验收', note: '里程碑追踪、AI 巡检进度、完工后自动提醒验收。' }
    ],
    roleCards: [
      {
        title: '企业端',
        desc: '适合企业主、项目负责人、个人品牌方。可发布任务、确认 AI 拆单、浏览人才广场并验收。',
        route: '/enterprise',
        cta: '进入企业端'
      },
      {
        title: '人才端',
        desc: '适合独立开发者、设计师、内容创作者、视频剪辑师、AI 工作流专家。可浏览任务广场、接单协作、上传作品和经营个人品牌。',
        route: '/talent',
        cta: '进入人才端'
      }
    ],
    journeys: [
      {
        title: '企业端路径',
        route: '/enterprise',
        steps: ['提交入驻材料', '发布任务并确认 AI 拆解', '进入人才广场选择合作对象', '围绕项目沟通、协作、验收完成交付']
      },
      {
        title: '人才端路径',
        route: '/talent',
        steps: ['完善资料、作品、档期与接单偏好', '进入任务广场查看匹配项目', '接单后持续同步进度与附件', '在验收后沉淀评分、收入和个人品牌']
      }
    ],
    cases: [
      {
        name: '星河智能',
        type: '企业案例',
        summary: '3 周内完成 AI 招聘 H5 首版，把任务发布、人才匹配和协作闭环先跑通。',
        result: 'AI 先拆解需求后，企业只需在人才广场确认候选人，立项效率提升明显。 '
      },
      {
        name: '立方增长工作室',
        type: '人才案例',
        summary: '通过任务广场连续承接 4 个品牌数字化项目，逐步沉淀作品与高评分。',
        result: '人才端通过档期、作品、评价组合展示，复购和转介绍转化更高。'
      },
      {
        name: '深蓝科技',
        type: '协作案例',
        summary: '围绕中后台重构项目，把沟通、进度和验收统一沉淀，减少反复确认成本。',
        result: '交付记录完整，争议节点清楚，后台只在审核和风控时介入。'
      }
    ],
    contacts: [
      { label: '商务合作', value: 'bd@youqinggong.ai', note: '适合企业入驻、渠道合作、方案咨询。' },
      { label: '人才入驻', value: 'talent@youqinggong.ai', note: '适合作品投递、档期同步、入驻咨询。' },
      { label: '微信咨询', value: 'YouQingGong-AI', note: '适合预约产品演示、沟通需求和获取报价。' }
    ],
    highlights: [
      {
        title: '作品驱动的选人方式',
        desc: '人才详情页同时展示简介、代表作、行业评价与历史交付风格。'
      },
      {
        title: 'AI 协作者而非冷冰冰的审批机',
        desc: '在任务拆解、进度复核、修改建议和验收提醒中持续参与。'
      },
      {
        title: '随时推进的工作体验',
        desc: '碎片时间也能跟进协作，集中处理时也能清楚查看全局任务。'
      }
    ]
  },
  business: {
    metrics: [
      { label: '待审核入驻', value: '06', note: '企业资质与虚拟企业申请混合待处理。' },
      { label: 'AI 拆解中任务', value: '13', note: '支持语音录入、文本补充、自动结构化输出。' },
      { label: '匹配候选人才', value: '41', note: '当前推荐覆盖产品、研发、设计、运营与内容岗位。' },
      { label: '进行中项目', value: '19', note: '全部绑定里程碑与进展巡检。' }
    ],
    onboardingChecklist: [
      '上传企业营业执照 / 品牌证明',
      '上传项目联系人与合作偏好',
      '个人入驻时补充身份证、实名信息与虚拟企业申请',
      '通过后台审核后启用发布权限与聊天权限'
    ],
    sampleBrief:
      '我想做一个面向中小企业的 AI 招聘小程序，支持职位发布、人才筛选、聊天沟通和简历分析，需要 3 周内完成首版可演示产品，风格要偏现代科技感。',
    recommendedTalents: [
      {
        slug: 'lin-zhao',
        name: '林昭',
        role: '全栈产品工程师',
        score: '4.9',
        tags: ['Vue 3', 'Spring Boot', 'AI 工作流'],
        summary: '做过 18 个中后台与交易协作项目，擅长快速把复杂需求落成第一阶段可交付版本。'
      },
      {
        slug: 'su-he',
        name: '苏禾',
        role: '品牌与交互设计师',
        score: '4.8',
        tags: ['Figma', 'H5 体验', '品牌系统'],
        summary: '擅长把复杂产品做得清晰、有商业质感。'
      },
      {
        slug: 'gu-yan',
        name: '顾岩',
        role: '独立 AI 自动化顾问',
        score: '5.0',
        tags: ['Prompt Engineering', 'RAG', '业务流程设计'],
        summary: '可补足 AI 拆单、审查和验收规则设计。'
      }
    ],
    taskBoard: [
      { title: '需求确认', status: '已完成', note: 'B 端已确认 AI 拆解方案与目标工期。' },
      { title: '人才邀约', status: '进行中', note: '已向 3 位候选人才发起邀约。' },
      { title: '工期协商', status: '待开始', note: '等待 talent 对每个里程碑给出反馈。' },
      { title: '正式交付', status: '未开始', note: '双方确认合同后自动开始统计进度。' }
    ],
    liveConversation: [
      { author: 'AI 助手', text: '建议将首版交付拆为 4 个模块，先交互型原型，再联调核心流程。', time: '09:20' },
      { author: '林昭', text: '如果保留聊天和任务进度，我建议把支付放到第二阶段。', time: '09:27' },
      { author: '你', text: '可以，先保证首版闭环和后台管理可交付，沟通和进度先围绕项目主链路完成。', time: '09:31' }
    ],
    contractSummary: [
      '项目工期：21 天',
      '里程碑：需求梳理 / 前端联调 / 交付验收',
      'AI 风险提示：在线沟通与附件同步要跟里程碑一起设计',
      '推荐技能标签：Vue 3、Java API、SQL 设计、交付协作'
    ]
  },
  talent: {
    hero: {
      name: '陈一宁',
      role: 'AI 产品设计 + 全栈开发',
      intro: '专注把复杂业务做成轻量、可运营、可扩展的产品体验。擅长从需求梳理到交付验收的端到端协作。',
      availability: '本周剩余可接单 3 天',
      score: '4.9',
      income: '￥86,400'
    },
    skills: ['Vue 3', 'Java', 'MySQL', 'AI Agent', '多端协作', 'H5 体验'],
    portfolio: [
      { title: 'AI 简历诊断平台', desc: '支持解析、评分、建议输出与顾问协同。' },
      { title: '创作者任务协作台', desc: '支持任务拆解、时间线协作、素材上传与复盘。' },
      { title: '企业知识助手后台', desc: '重点做内容运营、权限管理与回答监控。' }
    ],
    calendar: [
      { day: '周一', state: 'open', note: '可接新单' },
      { day: '周二', state: 'busy', note: '进行中任务' },
      { day: '周三', state: 'open', note: '可接新单' },
      { day: '周四', state: 'busy', note: '里程碑评审' },
      { day: '周五', state: 'open', note: '可接新单' },
      { day: '周六', state: 'open', note: '可接紧急单' },
      { day: '周日', state: 'busy', note: '验收交付' }
    ],
    marketplace: [
      { title: 'AI 招聘 H5 首版', budget: '￥18k - ￥28k', period: '3 周', tags: ['Vue', '协作', '现代感'], match: '92%' },
      { title: '企业知识库后台重构', budget: '￥22k - ￥36k', period: '4 周', tags: ['Java', 'SQL', '管理端'], match: '87%' },
      { title: '智能外呼质检可视化', budget: '￥15k - ￥24k', period: '2 周', tags: ['大屏', '图表', '交付快'], match: '84%' }
    ],
    activeTasks: [
      { title: 'AI 招聘市场第一阶段', progress: '65%', note: '已完成首页、角色工作台与任务模型。' },
      { title: '品牌视觉升级', progress: '30%', note: '等待甲方确认三套主视觉方向。' }
    ],
    messages: [
      { from: '招募方 / 星河智能', text: '今天可以确认一下第二阶段的接口边界吗？', time: '10:10' },
      { from: '系统消息', text: '项目沟通已开启，当前任务消息会同步到工作区记录。', time: '10:18' },
      { from: '平台通知', text: '你本周收入较上周提升 18%，继续保持高质量交付。', time: '10:24' }
    ],
    evaluations: [
      '沟通清楚、能主动拆解需求',
      '上传进度及时，文档和录屏都很完整',
      'AI 修改建议响应很快，整体交付节奏稳'
    ]
  },
  taskMarketplace: {
    summary: {
      title: '任务广场',
      description: '人才可以主动浏览任务，也可以等待系统按技能、档期和历史评分自动推荐。'
    },
    filters: ['全部', 'AI 产品', '前端开发', '品牌设计', '数据分析', '内容增长'],
    metrics: [
      { label: '今日新任务', value: '28', note: '新发布需求已完成 AI 拆解和标签化。' },
      { label: '高匹配任务', value: '11', note: '与你当前技能栈与接单日历高度吻合。' },
      { label: '急单机会', value: '04', note: '适合档期充足的人才快速接入。' },
      { label: '自动分配中', value: '17', note: '平台正在根据候选池生成推荐名单。' }
    ],
    items: [
      {
        id: 'task-001',
        title: 'AI 招聘 H5 首版',
        company: '星河智能',
        budget: '￥18k - ￥28k',
        period: '3 周',
        match: '92%',
        status: '推荐中',
        tags: ['Vue 3', 'H5', '现代感', '任务协作'],
        summary: '需要同时覆盖前台多端体验与管理后台首版体验，强调任务闭环和 AI 拆解能力。',
        deliverables: ['首页与角色工作台', '任务协作区', '管理后台骨架']
      },
      {
        id: 'task-002',
        title: '企业知识库后台重构',
        company: '深蓝科技',
        budget: '￥22k - ￥36k',
        period: '4 周',
        match: '87%',
        status: '待邀约',
        tags: ['Java', 'SQL', '中后台', '权限'],
        summary: '重构知识运营后台，补权限模型、检索策略配置与结果监控。',
        deliverables: ['用户权限模型', '知识库管理台', '搜索日志分析']
      },
      {
        id: 'task-003',
        title: '创作者选题系统',
        company: '宇川内容',
        budget: '￥12k - ￥18k',
        period: '2 周',
        match: '81%',
        status: '可抢单',
        tags: ['AI Agent', '内容策略', '看板'],
        summary: '构建一套轻量选题工作台，支持热点池、AI 生成与协作评论。',
        deliverables: ['选题看板', 'AI 提示工作流', '复盘面板']
      }
    ]
  },
  talentMarketplace: {
    summary: {
      title: '人才广场',
      description: '企业和个人品牌方可以在这里查看人才的专长、作品、评分、响应速度和近期档期。'
    },
    filters: ['产品研发', '设计创意', 'AI 顾问', '内容增长', '近期可接单', '高评分'],
    metrics: [
      { label: '可邀约人才', value: '128', note: '覆盖产品、研发、设计、内容与 AI 顾问方向。' },
      { label: '本周可接单', value: '42', note: '适合在当前周期内快速进入合作。' },
      { label: '高评分人才', value: '36', note: '历史交付评分和完工率都保持在高位。' },
      { label: '近期新作品', value: '18', note: '最近一周更新了作品或服务案例。' }
    ],
    items: [
      {
        slug: 'chen-yining',
        name: '陈一宁',
        role: 'AI 产品设计 + 全栈开发',
        location: '上海',
        score: '4.9',
        responseTime: '8 分钟',
        summary: '擅长把复杂业务拆成用户能理解、团队能交付的产品方案，适合从需求梳理到交付验收的端到端协作。',
        tags: ['Vue 3', 'Java API', '任务协作', '多端产品'],
        services: ['产品方案设计', '前后端协作', '交付流程梳理'],
        portfolio: 'AI 简历诊断平台 / 创作者任务协作台'
      },
      {
        slug: 'lin-zhao',
        name: '林昭',
        role: '全栈产品工程师',
        location: '杭州',
        score: '4.9',
        responseTime: '12 分钟',
        summary: '偏工程实施型，适合带一点产品复杂度的协作平台，能快速把业务原型落成可联调版本。',
        tags: ['Spring Boot', 'MySQL', '中后台', '联调效率'],
        services: ['第一阶段开发', '后台搭建', '接口联调'],
        portfolio: '供应商协作台 / 教育 SaaS 中台'
      },
      {
        slug: 'su-he',
        name: '苏禾',
        role: '品牌与交互设计师',
        location: '深圳',
        score: '4.8',
        responseTime: '15 分钟',
        summary: '擅长把复杂产品做得更清楚、更有品牌感，适合首页、工作台和产品视觉升级。',
        tags: ['品牌系统', '交互设计', '首页升级', '设计规范'],
        services: ['产品界面设计', '设计系统', '品牌升级'],
        portfolio: '品牌投放素材矩阵 / AI 服务官网'
      },
      {
        slug: 'gu-yan',
        name: '顾岩',
        role: '独立 AI 自动化顾问',
        location: '北京',
        score: '5.0',
        responseTime: '18 分钟',
        summary: '擅长把业务规则转成 AI 工作流，适合需求拆解、审查建议和自动化协作场景。',
        tags: ['Prompt Engineering', 'RAG', '工作流自动化', 'Agent'],
        services: ['需求拆解设计', '智能化方案', '流程自动化'],
        portfolio: 'AI 审批助手 / 知识问答中台'
      }
    ]
  },
  talentProfiles: {
    'chen-yining': {
      slug: 'chen-yining',
      name: '陈一宁',
      role: 'AI 产品设计 + 全栈开发',
      location: '上海',
      score: '4.9',
      completionRate: '96%',
      responseTime: '8 分钟',
      intro:
        '擅长把复杂业务拆成用户能理解、团队能交付的产品方案，习惯把前台体验、后台管理和 API 结构一起思考。',
      headlineTags: ['Vue 3', 'Java API', '任务协作', 'AI Agent', '多端产品'],
      strengths: [
        '擅长从 0 到 1 搭建第一阶段产品，并提前为第二阶段扩展留边界',
        '在产品设计、前端落地和接口结构之间切换顺畅',
        '能用结构化文档把需求、设计、开发同步起来'
      ],
      services: [
        'AI 产品第一阶段设计与开发',
        '多端协作平台',
        '后台管理系统设计与实现',
        '需求拆解与交付流程设计'
      ],
      portfolio: [
        {
          title: 'AI 简历诊断平台',
          type: '产品 + 前端 + 后端',
          desc: '把简历解析、打分、建议和顾问协同整合进一套轻量工作流。'
        },
        {
          title: '创作者任务协作台',
          type: '全栈',
          desc: '支持任务拆解、里程碑、素材上传与复盘归档。'
        },
        {
          title: '企业知识助手后台',
          type: '后台管理',
          desc: '覆盖权限、内容运营、问答监控和知识健康度管理。'
        }
      ],
      reviews: [
        { author: '星河智能', role: 'B 端客户', content: '不只是把页面做出来，更会主动帮我们重新梳理任务流程。' },
        { author: '立方增长', role: '品牌团队', content: '沟通很顺，迭代响应快，阶段交付材料很完整。' },
        { author: '深蓝科技', role: '产品负责人', content: '做中后台时兼顾运营视角和工程可扩展性。' }
      ],
      availability: [
        '本周剩余可接单 3 天',
        '下周适合承接 2-4 周的产品第一阶段开发',
        '可配合在线沟通、AI 审查和后台管理一体化方案'
      ],
      process: [
        '先对齐需求目标、上线优先级和交付边界',
        '将大需求拆成可确认的里程碑与附件列表',
        '以周为单位同步演示、进度和 AI 巡检反馈'
      ]
    },
    'lin-zhao': {
      slug: 'lin-zhao',
      name: '林昭',
      role: '全栈产品工程师',
      location: '杭州',
      score: '4.9',
      completionRate: '94%',
      responseTime: '12 分钟',
      intro:
        '偏工程实施型，擅长快速把业务原型转成前后端可联调版本，尤其适合带一点产品复杂度的协作平台。',
      headlineTags: ['Vue 3', 'Spring Boot', 'MySQL', '中后台'],
      strengths: ['实现速度快', '接口边界清楚', '能兼顾前后台结构'],
      services: ['前后端一体化第一阶段开发', '管理后台开发', '交付流程产品化'],
      portfolio: [
        { title: '供应商协作台', type: '全栈', desc: '覆盖供应商入驻、报价、沟通和验收。' },
        { title: '教育 SaaS 中台', type: '后端主导', desc: '负责 API、权限与数据流设计。' }
      ],
      reviews: [
        { author: '某教育 SaaS', role: 'CTO', content: '交付稳定，拆解明确，适合时间紧的项目。' }
      ],
      availability: ['两周内可并行 1 个 3 周项目', '适合产品骨架与接口首版联调'],
      process: ['先出结构，再做核心路径，再补细节']
    },
    'su-he': {
      slug: 'su-he',
      name: '苏禾',
      role: '品牌与交互设计师',
      location: '深圳',
      score: '4.8',
      completionRate: '97%',
      responseTime: '15 分钟',
      intro:
        '专注把复杂产品做得更清楚、更有品牌感，擅长 H5 与 SaaS 界面的统一视觉语言搭建。',
      headlineTags: ['品牌系统', '交互设计', 'H5 体验', '设计规范'],
      strengths: ['视觉完整度高', '品牌统一能力强', '擅长复杂流程梳理'],
      services: ['产品界面设计', '设计系统', '品牌升级'],
      portfolio: [
        { title: '品牌投放素材矩阵', type: '设计', desc: '从策略到产出统一视觉语言。' },
        { title: 'AI 服务官网', type: 'H5 设计', desc: '强化叙事节奏与转化信息。' }
      ],
      reviews: [
        { author: '立方增长', role: '品牌负责人', content: '设计不空，和业务目标贴得很紧。' }
      ],
      availability: ['本周可承接设计冲刺', '适合首页、品牌系统和工作台视觉升级'],
      process: ['先信息架构，再主视觉方向，再组件体系']
    },
    'gu-yan': {
      slug: 'gu-yan',
      name: '顾岩',
      role: '独立 AI 自动化顾问',
      location: '北京',
      score: '5.0',
      completionRate: '98%',
      responseTime: '18 分钟',
      intro:
        '擅长把业务规则转成 AI 工作流，尤其适合需求拆解、审查建议、知识检索和自动化协作场景。',
      headlineTags: ['Prompt Engineering', 'RAG', '工作流自动化', 'Agent'],
      strengths: ['AI 规则抽象能力强', '适合二期智能化升级', '擅长流程自动化'],
      services: ['AI 拆单设计', 'RAG 方案', '自动化工作流'],
      portfolio: [
        { title: 'AI 审批助手', type: '工作流', desc: '把审批条件结构化，减少人工回合。' },
        { title: '知识问答中台', type: 'AI 架构', desc: '完成检索、回答与监控闭环。' }
      ],
      reviews: [
        { author: '某产业平台', role: '运营总监', content: '很适合当第二阶段智能化升级伙伴。' }
      ],
      availability: ['适合以咨询或方案设计形式介入', '可协助项目沟通与智能化策略设计'],
      process: ['先明确数据边界，再做 AI 能力切入，再验证效果']
    }
  },
  workspace: {
    summary: {
      taskName: 'AI 人才市场第一阶段交付',
      business: '星河智能',
      talent: '陈一宁',
      range: '03/18 - 04/08',
      status: '协作中'
    },
    pulse: [
      { label: '整体完成度', value: '68%', note: '核心路径已闭环，正在补交付历史与验收沉淀。' },
      { label: '已回传附件', value: '12', note: '图片、录屏、代码与 SQL 说明都已留痕。' },
      { label: 'AI 风险提醒', value: '2 条', note: '重点在移动端信息密度和验收摘要补充。' },
      { label: '最近同步', value: '今天 18:20', note: '最新进度、审查结果和验收节点已同步。' }
    ],
    milestones: [
      { title: '里程碑 1：信息架构与视觉方向', owner: '设计 + 产品', status: '已完成', note: '完成首页和角色工作台的结构确认。' },
      { title: '里程碑 2：前台与管理台骨架', owner: '前端', status: '进行中', note: '已完成核心页面，等待接口联调。' },
      { title: '里程碑 3：API 与数据模型', owner: '后端', status: '进行中', note: '任务、用户、评价与审核模型已建。' },
      { title: '里程碑 4：验收与优化', owner: '双方', status: '待开始', note: '根据 AI 巡检结果做最后调整。' }
    ],
    progressFeed: [
      {
        time: '03/19 21:30',
        author: '陈一宁',
        stage: '信息架构与视觉方向',
        completion: '24%',
        summary: '完成首页价值表达、角色入口和任务闭环主路径，B 端已确认首版走现代轻协作方向。',
        attachments: ['首页视觉稿 V2.fig', '角色路径说明.md']
      },
      {
        time: '03/20 18:40',
        author: '陈一宁',
        stage: '前台与管理台骨架',
        completion: '51%',
        summary: '完成多端页面路由、核心页面和后台管理首屏，进入接口对齐和协作区补深阶段。',
        attachments: ['H5 演示录屏.mp4', 'admin-dashboard-wireframe.png']
      },
      {
        time: '03/21 17:55',
        author: '陈一宁',
        stage: '协作闭环补齐',
        completion: '68%',
        summary: '补上进度提交、验收评分、评分沉淀与项目沟通入口，AI 巡检开始覆盖进度与交付完整度。',
        attachments: ['frontend-workspace.patch', 'api-contract-v3.md', 'schema-review.sql']
      }
    ],
    assetLibrary: [
      { type: '图片', name: '首页视觉稿 V2.fig', size: '18 MB', updatedAt: '03/19 21:30', status: '已确认' },
      { type: '视频', name: 'H5 演示录屏.mp4', size: '42 MB', updatedAt: '03/20 18:40', status: '待 B 端查看' },
      { type: '代码', name: 'frontend-workspace.patch', size: '126 KB', updatedAt: '03/21 17:55', status: 'AI 已分析' },
      { type: '资料', name: 'api-contract-v3.md', size: '36 KB', updatedAt: '03/21 18:12', status: '已归档' }
    ],
    aiReviewHistory: [
      {
        title: '第 1 次巡检',
        score: '82',
        status: '结构完整',
        focus: '附件状态回显',
        summary: '核心流程已经清晰，但建议把附件上传后的状态和已读回执做得更显性，方便 B 端快速判断是否需要追问。',
        suggestions: ['附件卡片增加状态字段和最近查看时间', '把重要交付件放到同一组里集中展示']
      },
      {
        title: '第 2 次巡检',
        score: '88',
        status: '移动端可读性良好',
        focus: '移动端信息密度',
        summary: '任务匹配和协作面板的信息层级合理，但在 390px 左右宽度下需要减少并列信息，避免滚动疲劳。',
        suggestions: ['移动端下将多列卡片收敛为单列', '高频动作保留在首屏工具条']
      },
      {
        title: '第 3 次巡检',
        score: '91',
        status: '可进入验收',
        focus: '验收摘要',
        summary: '当前交付已满足演示要求，建议在验收页增加 AI 风险复盘摘要与评分历史，帮助双方快速完成闭环。',
        suggestions: ['验收页补充交付时间线', '增加互评历史和信用影响说明']
      }
    ],
    reviewHistory: [
      { reviewer: '星河智能', role: 'B 端客户', rating: '5.0', time: '04/08 18:30', content: '节奏非常稳，文档和页面都能直接拿去做演示与继续开发。' },
      { reviewer: '陈一宁', role: '人才方', rating: '4.8', time: '04/08 19:10', content: '需求反馈及时，验收边界清晰，协作回合数比较健康。' }
    ],
    aiReview: [
      '进度完整度 82%，建议补充上传附件的状态回显。',
      '任务匹配卡片信息密度合理，但移动端下建议减少一列。',
      '验收阶段建议增加“AI 风险复盘摘要”，帮助双方快速确认交付范围。'
    ],
    acceptance: [
      '确认交付件：页面、API、SQL 结构、说明文档',
      '确认可演示流程：入驻 -> AI 拆单 -> 匹配 -> 协作 -> 验收',
      '验收完成后，双方可互评并沉淀到个人/企业信用画像'
    ]
  },
  taskClosure: {
    summary: {
      taskId: 'task-001',
      title: 'AI 人才市场第一阶段交付',
      status: '待双方评分闭环',
      acceptedAt: '04/08 18:20',
      nextStep: '完成互评后，平台将同步信用画像与后续推荐策略。'
    },
    metrics: [
      { label: '交付完成度', value: '100%', note: '页面、API、SQL 与核心文档均已核对。' },
      { label: '当前平均评分', value: '4.9', note: '综合历史合作与本次交付表现。' },
      { label: '信用增量', value: '+12', note: '会影响后续推荐排序和曝光概率。' },
      { label: '最后验收时间', value: '04/08 18:20', note: '由 B 端发起并确认验收。' }
    ],
    timeline: [
      { title: 'AI 提醒发起验收', status: '已完成', note: '系统根据完成度和附件完整度提醒 B 端进入验收。', time: '04/08 17:20' },
      { title: 'B 端确认交付范围', status: '已完成', note: '页面、接口、数据结构和文档都已核对。', time: '04/08 18:20' },
      { title: '双方互评沉淀信用', status: '进行中', note: '评分将联动推荐、信用标签与协作画像。', time: '04/08 19:10' }
    ],
    reviewSummary: [
      'B 端评分关注沟通质量、交付完整度和响应速度。',
      '人才评分关注需求清晰度、反馈效率和验收配合度。',
      '平台会把本次合作结果同步到信用画像与推荐逻辑。'
    ],
    reviewHistory: [
      { reviewer: '星河智能', role: 'B 端客户', rating: '5.0', time: '04/08 18:30', content: '节奏非常稳，文档和页面都能直接拿去做演示与继续开发。' },
      { reviewer: '陈一宁', role: '人才方', rating: '4.8', time: '04/08 19:10', content: '需求反馈及时，验收边界清晰，协作回合数比较健康。' },
      { reviewer: 'AI 系统摘要', role: '平台辅助', rating: '91', time: '04/08 19:15', content: '交付链路完整，建议保留附件状态与验收复盘，适合作为后续迭代底座。' }
    ],
    creditImpact: [
      { title: '人才信用画像', note: '新增“交付稳健”“文档完整”标签，推荐权重上调。' },
      { title: '企业合作信用', note: '新增“反馈及时”“验收明确”标签，更容易匹配高评分人才。' },
      { title: '平台后续动作', note: '若 48 小时内仍有互评未完成，系统会自动提醒并记录待处理状态。' }
    ]
  }
};

export function mockAnalyzeTaskBrief(brief) {
  const content = brief && brief.trim() ? brief.trim() : webMockData.business.sampleBrief;

  return {
    originalBrief: content,
    modules: [
      { name: '角色与权限', duration: '2 天', output: '企业 / 人才 / 管理员基础角色与权限映射' },
      { name: '任务闭环', duration: '4 天', output: '发布、AI 拆解、确认、匹配、协作、验收流程' },
      { name: '沟通与进度', duration: '3 天', output: '消息列表、里程碑、附件上传、AI 审查建议' },
      { name: '后台管理', duration: '3 天', output: '用户、任务、审核、风控看板' }
    ],
    schedule: {
      total: '12 个开发日',
      risk: '在线沟通、文件同步和支付结算建议拆成分阶段推进。'
    },
    tags: ['Vue 3', 'Java API', 'SQL 建模', 'AI 拆单', '在线沟通'],
    recommendations: [
      '第一阶段先保证任务闭环和审核流程完整',
      '文件上传与 AI 审查可以先接 mock 能力，再对接真实模型',
      '移动端优先处理消息、日历、进度上传，桌面端优先处理总览与筛选'
    ]
  };
}
