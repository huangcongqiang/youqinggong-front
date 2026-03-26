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
        route: '/register?audience=enterprise',
        cta: '注册企业端'
      },
      {
        title: '人才端',
        desc: '适合独立开发者、设计师、内容创作者、视频剪辑师、AI 工作流专家。可浏览任务广场、接单协作、上传作品和经营个人品牌。',
        route: '/register?audience=talent',
        cta: '注册人才端'
      }
    ],
    journeys: [
      {
        title: '企业端路径',
        route: '/register?audience=enterprise',
        steps: ['提交入驻材料', '发布任务并确认 AI 拆解', '进入人才广场选择合作对象', '围绕项目沟通、协作、验收完成交付']
      },
      {
        title: '人才端路径',
        route: '/register?audience=talent',
        steps: ['完善资料、作品、档期与接单偏好', '进入任务广场查看匹配项目', '接单后持续同步进度与附件', '在验收后沉淀评分、收入和个人品牌']
      }
    ],
    cases: [
      {
        name: '星河智能',
        type: '企业案例',
        summary: '4 个 AI 协同工作日内完成 AI 招聘 H5 首版，把任务发布、人才匹配和协作闭环先跑通。',
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
    caseGroups: [
      {
        id: 'enterprise',
        items: [
          {
            name: '星河智能',
            type: '企业案例',
            summary: '4 个 AI 协同工作日内完成 AI 招聘 H5 首版，把任务发布、人才匹配和协作闭环先跑通。',
            result: 'AI 先拆解需求后，企业只需在人才广场确认候选人，立项效率提升明显。',
            ratingSummary: '人才最新评分 5 分：需求清晰、反馈及时、验收过程顺畅。',
            ratingBadge: '5 分',
            coverTitle: '4 天跑通招聘协作首版',
            coverCaption: '企业把需求说清、先看推荐人才，再进入聊天确认与协作执行。',
            coverStats: ['4 天交付', '4 位候选', '首版闭环'],
            coverGradient:
              'linear-gradient(135deg, rgba(38, 92, 255, 0.92) 0%, rgba(79, 198, 255, 0.72) 50%, rgba(179, 162, 255, 0.46) 100%)'
          },
          {
            name: '深蓝科技',
            type: '企业案例',
            summary: '围绕中后台重构项目，把沟通、进度和验收统一沉淀，减少反复确认成本。',
            result: '交付记录完整，争议节点清楚，后台只在审核和风控时介入。',
            coverTitle: '重构项目不再靠反复拉会推进',
            coverCaption: '把任务确认、进展回写和验收节点都沉淀下来，减少沟通损耗。',
            coverStats: ['中后台重构', '过程留痕', '风控清晰'],
            coverGradient:
              'linear-gradient(135deg, rgba(13, 55, 129, 0.96) 0%, rgba(34, 124, 255, 0.76) 46%, rgba(84, 214, 244, 0.42) 100%)'
          },
          {
            name: '北辰品牌实验室',
            type: '企业案例',
            summary: '用平台同时管理品牌视觉、内容脚本和活动页三个并行任务，统一人才协作节奏。',
            result: '企业端从一页总览直接进入发布、选人、聊天和协作，管理多任务时更轻。',
            coverTitle: '一页总览管理多条外包任务',
            coverCaption: '适合品牌方、增长团队和轻量项目组快速推进多个合作需求。',
            coverStats: ['并行 3 任务', '品牌项目', '总览推进'],
            coverGradient:
              'linear-gradient(135deg, rgba(88, 52, 174, 0.94) 0%, rgba(71, 113, 255, 0.78) 48%, rgba(98, 218, 255, 0.42) 100%)'
          }
        ]
      },
      {
        id: 'talent',
        items: [
          {
            name: '立方增长工作室',
            type: '人才案例',
            summary: '通过任务广场连续承接 4 个品牌数字化项目，逐步沉淀作品与高评分。',
            result: '人才端通过档期、作品、评价组合展示，复购和转介绍转化更高。',
            ratingSummary: '企业最新评级 S 级 · 100% 结算：交付完整、节奏稳定、合作体验优秀。',
            ratingBadge: 'S 级',
            coverTitle: '4 个项目沉淀出稳定复购',
            coverCaption: '人才通过作品、评价和接单节奏建立长期合作，而不是只拼低价。',
            coverStats: ['4 个项目', '高评分', '复购增长'],
            coverGradient:
              'linear-gradient(135deg, rgba(18, 127, 117, 0.94) 0%, rgba(64, 198, 165, 0.78) 46%, rgba(112, 231, 255, 0.4) 100%)'
          },
          {
            name: '陈一宁',
            type: '人才案例',
            summary: '把复杂 AI 协作项目拆成简历页、聊天页、协作空间和验收页，逐步形成完整作品闭环。',
            result: '在平台内持续沉淀履历、收入和交付结果，后续接单时信任建立更快。',
            coverTitle: '把交付过程沉淀成下一次接单资本',
            coverCaption: '人才不只是接任务，也在持续积累自己的案例、评价和公开形象。',
            coverStats: ['履历沉淀', '收入可见', '作品闭环'],
            coverGradient:
              'linear-gradient(135deg, rgba(144, 67, 214, 0.94) 0%, rgba(93, 96, 255, 0.76) 48%, rgba(78, 203, 255, 0.42) 100%)'
          },
          {
            name: '云梯内容工坊',
            type: '人才案例',
            summary: '内容团队通过平台统一接品牌短视频与活动页项目，在聊天和协作区同步脚本、素材和修改建议。',
            result: '人才端能更清楚展示过程质量，不再只靠一句“已完成”去证明交付。',
            coverTitle: '过程透明后，作品价值更容易被看见',
            coverCaption: '适合内容创作者、设计师和开发者持续经营自己的对外名片。',
            coverStats: ['内容交付', '素材留痕', '过程透明'],
            coverGradient:
              'linear-gradient(135deg, rgba(255, 109, 88, 0.9) 0%, rgba(255, 164, 73, 0.74) 40%, rgba(120, 205, 255, 0.36) 100%)'
          }
        ]
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
    latestTalentRating: {
      rating: '5',
      content: '需求清晰、反馈及时、验收过程顺畅。'
    },
    metrics: [
      {
        label: '待审核入驻',
        value: '06',
        note: '企业资质与虚拟企业申请混合待处理。',
        source: '演示数据',
        todos: ['补 2 份营业执照扫描件', '补 1 位联系人实名材料', '确认 1 份虚拟企业申请说明'],
        doneStats: ['今日已通过 3 份入驻审核', '昨日退回补资料 2 份', '本周累计完成 11 份准入处理']
      },
      {
        label: 'AI 拆解中任务',
        value: '13',
        note: '支持语音录入、文本补充、自动结构化输出。',
        source: '演示数据',
        todos: ['4 个任务待企业确认 AI 拆解', '3 个任务待补充附件说明', '2 个任务待重新估算工期'],
        doneStats: ['今日已完成 5 个需求拆解', '最近一次平均拆解耗时 2 分 10 秒', '已输出 18 组技能标签与风险提醒']
      },
      {
        label: '匹配候选人才',
        value: '41',
        note: '当前推荐覆盖产品、研发、设计、运营与内容岗位。',
        source: '演示数据',
        todos: ['7 个项目待企业从推荐名单中选人', '3 个项目建议补充人工筛选', '2 位高匹配人才待确认档期'],
        doneStats: ['今日新增推荐候选人 9 位', '最近 24 小时已成功匹配 4 个项目', '高评分人才占推荐池的 62%']
      },
      {
        label: '进行中项目',
        value: '19',
        note: '全部绑定里程碑与进展巡检。',
        source: '演示数据',
        todos: ['5 个项目待同步最新进度', '2 个项目待企业验收', '1 个项目待补交付附件'],
        doneStats: ['今日已完成 3 次里程碑确认', 'AI 巡检已输出 6 条修改建议', '本周已完成验收 4 个项目']
      }
    ],
    onboardingChecklist: [
      '上传企业营业执照 / 品牌证明',
      '上传项目联系人与合作偏好',
      '个人入驻时补充身份证、实名信息与虚拟企业申请',
      '通过后台审核后启用发布权限与聊天权限'
    ],
    sampleBrief:
      '我想做一个面向中小企业的 AI 招聘小程序，支持职位发布、人才筛选、聊天沟通和简历分析，希望在 4 个 AI 协同工作日内完成首版可演示产品，风格要偏现代科技感。',
    recommendedTalents: [
      {
        slug: 'lin-zhao',
        name: '林昭',
        role: '全栈产品工程师',
        score: '4.9',
        tags: ['任务闭环', '后台协作', 'AI 工作流'],
        summary: '做过 18 个中后台与交易协作项目，擅长快速把复杂需求落成第一阶段可交付版本。'
      },
      {
        slug: 'su-he',
        name: '苏禾',
        role: '品牌与交互设计师',
        score: '4.8',
        tags: ['品牌官网', '交互升级', '品牌系统'],
        summary: '擅长把复杂产品做得清晰、有商业质感。'
      },
      {
        slug: 'gu-yan',
        name: '顾岩',
        role: '独立 AI 自动化顾问',
        score: '5.0',
        tags: ['需求梳理', '知识问答', '业务流程设计'],
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
      '项目工期：4 个 AI 协同工作日',
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
      { title: 'AI 招聘 H5 首版', budget: '￥18k - ￥28k', period: '4 个 AI 协同工作日', tags: ['招聘闭环', '角色分流', '现代感'], match: '92%' },
      { title: '企业知识库后台重构', budget: '￥22k - ￥36k', period: '6 个 AI 协同工作日', tags: ['知识治理', '检索配置', '后台管理'], match: '87%' },
      { title: '智能外呼质检可视化', budget: '￥15k - ￥24k', period: '4 个 AI 协同工作日', tags: ['可视化', '质检复盘', '交付快'], match: '84%' }
    ],
    activeTasks: [
      { title: 'AI 招聘市场第一阶段', progress: '65%', note: '已完成首页、角色工作台与任务模型。' },
      { title: '品牌视觉升级', progress: '30%', note: '等待甲方确认三套主视觉方向。' }
    ],
    latestDeliveryGrade: {
      grade: 'S',
      payoutRatio: '100%'
    },
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
        period: '4 个 AI 协同工作日',
        match: '92%',
        status: '推荐中',
        tags: ['招聘闭环', '多端体验', '现代感', '任务协作'],
        summary: '需要同时覆盖前台多端体验与管理后台首版体验，强调任务闭环和 AI 拆解能力。',
        deliverables: ['首页与角色工作台', '任务协作区', '管理后台骨架']
      },
      {
        id: 'task-002',
        title: '企业知识库后台重构',
        company: '深蓝科技',
        budget: '￥22k - ￥36k',
        period: '6 个 AI 协同工作日',
        match: '87%',
        status: '待邀约',
        tags: ['知识治理', '数据治理', '中后台', '权限与审计'],
        summary: '重构知识运营后台，补权限模型、检索策略配置与结果监控。',
        deliverables: ['用户权限模型', '知识库管理台', '搜索日志分析']
      },
      {
        id: 'task-003',
        title: '创作者选题系统',
        company: '宇川内容',
        budget: '￥12k - ￥18k',
        period: '4 个 AI 协同工作日',
        match: '81%',
        status: '可抢单',
        tags: ['内容协作', '内容策略', '任务看板'],
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
        talentUserId: 'talent-user-002',
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
        talentUserId: 'talent-user-026',
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
        talentUserId: 'talent-user-018',
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
        talentUserId: 'talent-user-019',
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
      platformUserId: 'talent-user-002',
      name: '陈一宁',
      avatar: 'https://api.dicebear.com/9.x/notionists-neutral/svg?seed=chen-yining&backgroundColor=1d3557,274c77,457b9d',
      role: 'AI 产品设计 + 全栈开发',
      specialty: 'AI 产品 MVP / 协作平台 / 全栈交付',
      location: '上海',
      score: '4.9',
      completionRate: '96%',
      responseTime: '8 分钟',
      intro:
        '擅长把复杂业务拆成用户能理解、团队能交付的产品方案，习惯把前台体验、后台管理和 API 结构一起思考。',
      resumeSummary:
        '更适合需要快速做出第一阶段可演示版本的项目，能把产品结构、界面体验和接口骨架一起拉通。',
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
      experience: [
        {
          period: '2024 - 至今',
          title: '独立 AI 产品顾问 / 全栈交付',
          organization: '自由职业',
          summary:
            '连续承接 AI 招聘、知识助手、任务协作平台等项目，负责需求拆解、界面原型、前端实现和 API 结构设计。',
          highlights: ['AI 产品拆解', 'Vue 3 + Java', '多端协作']
        },
        {
          period: '2021 - 2024',
          title: 'SaaS 产品负责人',
          organization: '企业服务公司',
          summary:
            '负责企业中后台、交付流程与权限系统，推动设计、研发与运营共用一套结构化文档和里程碑机制。',
          highlights: ['中后台产品', '交付流程', '权限体系']
        },
        {
          period: '2018 - 2021',
          title: 'B 端产品设计师',
          organization: '数字化服务团队',
          summary:
            '长期服务中小企业数字化改造项目，擅长把复杂业务流程转换成用户能理解的操作界面。',
          highlights: ['复杂流程梳理', '原型设计', '客户沟通']
        }
      ],
      platformResults: {
        summary:
          '平台上的项目更看重首版可演示、文档同步和 AI 协作效率，所以会重点记录交付速度、复购和验收表现。',
        metrics: [
          { label: '平台完工项目', value: '26 个', note: '其中 14 个是前后台一体的第一阶段交付。' },
          { label: '复购合作率', value: '78%', note: '主要来自企业端二次迭代和长期托管。' },
          { label: '平均首版周期', value: '4.5 天', note: '按熟练使用 AI 工具的人才工作方式估算。' },
          { label: '验收一次通过', value: '91%', note: '多数修改点会在 AI 巡检阶段提前修正。' }
        ],
        highlights: [
          { title: '首版交付速度快', note: '最近 6 个项目都在 48 小时内拿出了第一轮可确认方案。' },
          { title: '文档沉淀完整', note: '需求、设计、开发和验收资料会一起整理，方便后续扩展。' }
        ]
      },
      portfolio: [
        {
          type: 'IMAGE',
          title: 'AI 简历诊断平台',
          tag: '产品设计 / 前后端一体',
          desc: '把简历解析、打分、建议和顾问协同整合进一套轻量工作流。',
          cover: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=80',
          linkUrl: ''
        },
        {
          type: 'VIDEO',
          title: '创作者任务协作台',
          tag: '协作录屏 / 里程碑演示',
          desc: '支持任务拆解、里程碑、素材上传与复盘归档，适合看整体协作节奏。',
          cover: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          linkUrl: ''
        },
        {
          type: 'LINK',
          title: '企业知识助手后台',
          tag: 'IT 项目 / 页面链接',
          desc: '覆盖权限、内容运营、问答监控和知识健康度管理，适合直接查看页面结构。',
          cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: '',
          linkUrl: 'https://github.com/huangcongqiang/youqinggong-front'
        }
      ],
      reviews: [
        {
          author: '星河智能',
          role: 'B 端客户',
          score: '4.9 / 5',
          content: '不只是把页面做出来，更会主动帮我们重新梳理任务流程。',
          outcome: '5 个 AI 协同工作日完成企业端、人才端和后台管理的首版演示。'
        },
        {
          author: '立方增长',
          role: '品牌团队',
          score: '4.8 / 5',
          content: '沟通很顺，迭代响应快，阶段交付材料很完整。',
          outcome: '从需求确认到验收，所有资料都能完整追溯。'
        },
        {
          author: '深蓝科技',
          role: '产品负责人',
          score: '5.0 / 5',
          content: '做中后台时兼顾运营视角和工程可扩展性。',
          outcome: '首版上线后继续承接二期智能化方案设计。'
        }
      ],
      availability: [
        '本周剩余可接单 3 天',
        '下周适合承接 3-6 个 AI 协同工作日的产品第一阶段开发',
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
      platformUserId: 'talent-user-026',
      name: '林昭',
      avatar: 'https://api.dicebear.com/9.x/notionists-neutral/svg?seed=lin-zhao&backgroundColor=0b3954,087e8b,bfd7ea',
      role: '全栈产品工程师',
      specialty: '全栈交付 / 中后台 / API 主链路',
      location: '杭州',
      score: '4.9',
      completionRate: '94%',
      responseTime: '12 分钟',
      intro:
        '偏工程实施型，擅长快速把业务原型转成前后端可联调版本，尤其适合带一点产品复杂度的协作平台。',
      resumeSummary:
        '适合工期紧、流程复杂、需要快速打通前后台主链路的项目，尤其擅长首版联调和接口边界梳理。',
      headlineTags: ['Vue 3', 'Spring Boot', 'MySQL', '中后台'],
      strengths: ['实现速度快', '接口边界清楚', '能兼顾前后台结构'],
      services: ['前后端一体化第一阶段开发', '管理后台开发', '交付流程产品化'],
      experience: [
        {
          period: '2023 - 至今',
          title: '独立全栈产品工程师',
          organization: '自由职业',
          summary: '长期承接供应链、教育和工具类平台项目，擅长先打通主链路，再逐步补齐细节。',
          highlights: ['全栈开发', '主链路联调', 'API 设计']
        },
        {
          period: '2020 - 2023',
          title: '后端负责人',
          organization: '教育 SaaS 团队',
          summary: '负责 API、权限模型与数据结构设计，并推动前端和后端共享一套业务边界。',
          highlights: ['Spring Boot', '权限模型', '数据流设计']
        }
      ],
      platformResults: {
        summary:
          '林昭在平台上的项目以“时间紧、流程重、联调要求高”为主，所以数据会更偏交付稳定性和响应效率。',
        metrics: [
          { label: '平台完工项目', value: '19 个', note: '以供应链、教育与 B 端工具类项目为主。' },
          { label: '准时交付率', value: '94%', note: '对里程碑把控稳定，延期主要来自需求加项。' },
          { label: '平均接口回合', value: '2.1 轮', note: '接口边界通常会在前期被定义清楚。' },
          { label: '响应速度', value: '12 分钟', note: '适合高频联调和排查问题。' }
        ],
        highlights: [
          { title: '结构先行', note: '会先补齐字段和流程，再做样式和扩展功能。' },
          { title: '联调顺畅', note: '前后台都能看，比较适合任务协作、中后台和工具产品。' }
        ]
      },
      portfolio: [
        {
          title: '供应商协作台',
          type: 'IMAGE',
          tag: '全栈交付 / PC 管理台',
          desc: '覆盖供应商入驻、报价、沟通和验收，重点在主链路联调效率。',
          cover: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=80',
          linkUrl: ''
        },
        {
          title: '教育 SaaS 中台',
          type: 'LINK',
          tag: 'IT 项目 / 后台链接',
          desc: '负责 API、权限与数据流设计，更适合通过页面链接直接查看信息结构。',
          cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: '',
          linkUrl: 'https://github.com/huangcongqiang/youqinggong-admin'
        },
        {
          title: '运营任务流录屏',
          type: 'VIDEO',
          tag: '交付录屏 / 主链路演示',
          desc: '演示从创建任务到状态流转的完整路径，方便企业端判断落地能力。',
          cover: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          linkUrl: ''
        }
      ],
      reviews: [
        {
          author: '某教育 SaaS',
          role: 'CTO',
          score: '4.9 / 5',
          content: '交付稳定，拆解明确，适合时间紧的项目。',
          outcome: '5 个 AI 协同工作日完成接口首版、后台基础表和前后台联调。'
        }
      ],
      availability: ['本周可并行 1 个 3-5 天冲刺项目', '适合产品骨架与接口首版联调'],
      process: ['先出结构，再做核心路径，再补细节']
    },
    'su-he': {
      slug: 'su-he',
      platformUserId: 'talent-user-018',
      name: '苏禾',
      avatar: 'https://api.dicebear.com/9.x/notionists-neutral/svg?seed=su-he&backgroundColor=22223b,4a4e69,9a8c98',
      role: '品牌与交互设计师',
      specialty: '品牌系统 / H5 体验 / 产品界面设计',
      location: '深圳',
      score: '4.8',
      completionRate: '97%',
      responseTime: '15 分钟',
      intro:
        '专注把复杂产品做得更清楚、更有品牌感，擅长 H5 与 SaaS 界面的统一视觉语言搭建。',
      resumeSummary:
        '更适合需要同时提升品牌感、信息层级和转化效率的项目，能把首页、工作台和设计系统一并收口。',
      headlineTags: ['品牌系统', '交互设计', 'H5 体验', '设计规范'],
      strengths: ['视觉完整度高', '品牌统一能力强', '擅长复杂流程梳理'],
      services: ['产品界面设计', '设计系统', '品牌升级'],
      experience: [
        {
          period: '2022 - 至今',
          title: '品牌与交互设计顾问',
          organization: '自由职业',
          summary: '服务品牌官网、H5 活动页和 SaaS 产品工作台，擅长统一视觉语言和信息节奏。',
          highlights: ['品牌升级', 'H5 体验', '设计系统']
        },
        {
          period: '2019 - 2022',
          title: '高级交互设计师',
          organization: '数字品牌工作室',
          summary: '负责复杂业务流程的信息架构和关键页面视觉方向，兼顾商业感与可用性。',
          highlights: ['信息架构', '视觉方向', '组件规范']
        }
      ],
      platformResults: {
        summary:
          '苏禾在平台上的项目多是首页改版、品牌升级和复杂流程工作台，评价重点集中在信息层级和视觉完成度。',
        metrics: [
          { label: '平台完工项目', value: '21 个', note: '以 H5、官网和工作台视觉升级为主。' },
          { label: '复购合作', value: '9 个', note: '不少客户会在首版后继续让她做设计系统。' },
          { label: '平均评分', value: '4.8 / 5', note: '高频被评价为“设计不空，理解业务”。' },
          { label: '首版出稿', value: '1.8 天', note: '适合前期风格快速确认。' }
        ],
        highlights: [
          { title: '留白控制稳定', note: '复杂信息也能被收得更清楚，不会堆满整页。' },
          { title: '品牌气质统一', note: '会把首页、工作台和组件样式一起往同一方向收。' }
        ]
      },
      portfolio: [
        {
          title: '品牌投放素材矩阵',
          type: 'IMAGE',
          tag: '品牌设计 / 视觉系统',
          desc: '从策略到产出统一视觉语言，适合看品牌延展和成套输出能力。',
          cover: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1800&q=80',
          linkUrl: ''
        },
        {
          title: 'AI 服务官网',
          type: 'IMAGE',
          tag: '官网改版 / 叙事节奏',
          desc: '强化首屏价值表达和转化节奏，减少文字堆叠感。',
          cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80',
          linkUrl: ''
        },
        {
          title: 'H5 动效提案录屏',
          type: 'VIDEO',
          tag: '视频提案 / 动效节奏',
          desc: '通过录屏展示首页滚动节奏、留白处理和关键模块过渡。',
          cover: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          linkUrl: ''
        }
      ],
      reviews: [
        {
          author: '立方增长',
          role: '品牌负责人',
          score: '4.8 / 5',
          content: '设计不空，和业务目标贴得很紧。',
          outcome: '首页转化信息更清楚，后续继续合作品牌系统和工作台规范。'
        }
      ],
      availability: ['本周可承接设计冲刺', '适合首页、品牌系统和工作台视觉升级'],
      process: ['先信息架构，再主视觉方向，再组件体系']
    },
    'gu-yan': {
      slug: 'gu-yan',
      platformUserId: 'talent-user-019',
      name: '顾岩',
      avatar: 'https://api.dicebear.com/9.x/notionists-neutral/svg?seed=gu-yan&backgroundColor=0b132b,1c2541,3a506b',
      role: '独立 AI 自动化顾问',
      specialty: 'AI 工作流 / RAG / 业务规则自动化',
      location: '北京',
      score: '5.0',
      completionRate: '98%',
      responseTime: '18 分钟',
      intro:
        '擅长把业务规则转成 AI 工作流，尤其适合需求拆解、审查建议、知识检索和自动化协作场景。',
      resumeSummary:
        '适合项目进入第二阶段智能化升级时介入，会先明确数据边界，再设计 AI 能力如何落地。',
      headlineTags: ['Prompt Engineering', 'RAG', '工作流自动化', 'Agent'],
      strengths: ['AI 规则抽象能力强', '适合二期智能化升级', '擅长流程自动化'],
      services: ['AI 拆单设计', 'RAG 方案', '自动化工作流'],
      experience: [
        {
          period: '2023 - 至今',
          title: '独立 AI 自动化顾问',
          organization: '自由职业',
          summary: '围绕需求拆解、知识检索、审查建议和工作流自动化提供方案设计与落地验证。',
          highlights: ['Prompt 设计', 'RAG', '工作流自动化']
        },
        {
          period: '2020 - 2023',
          title: '智能化方案负责人',
          organization: '产业平台团队',
          summary: '负责把业务规则结构化，推动审批、客服和知识问答场景逐步自动化。',
          highlights: ['业务规则抽象', '知识库', '自动化策略']
        }
      ],
      platformResults: {
        summary:
          '顾岩在平台上的合作多数是咨询 + 方案设计 + 小范围验证，重点看建议质量、落地性和二期升级能力。',
        metrics: [
          { label: '平台合作项目', value: '17 个', note: '大多是企业二期智能化和流程自动化升级。' },
          { label: '方案采纳率', value: '88%', note: '多数建议会进入实际排期或作为二期方向。' },
          { label: '平均验收评分', value: '5.0 / 5', note: '客户对建议质量和结构化表达评价较高。' },
          { label: '首次方案周期', value: '1.5 天', note: '适合先快速验证 AI 切入点。' }
        ],
        highlights: [
          { title: '适合二期升级', note: '先把现有流程跑通，再用 AI 补效率和自动化，是他最擅长的方式。' },
          { title: '建议结构清晰', note: '会把哪些能做、哪些不能做、为什么做不清楚全部写明。' }
        ]
      },
      portfolio: [
        {
          title: 'AI 审批助手',
          type: 'IMAGE',
          tag: '工作流自动化 / AI 审查',
          desc: '把审批条件结构化，减少人工来回确认，适合看规则设计能力。',
          cover: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80',
          linkUrl: ''
        },
        {
          title: '知识问答中台',
          type: 'LINK',
          tag: 'AI 架构 / 项目链接',
          desc: '完成检索、回答与监控闭环，适合从项目链接看信息结构和配置方式。',
          cover: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: '',
          linkUrl: 'https://github.com/huangcongqiang/youqinggong-backend'
        },
        {
          title: '流程自动化演示视频',
          type: 'VIDEO',
          tag: 'Agent 录屏 / 流程演示',
          desc: '录屏展示从规则输入到自动执行的完整过程，适合企业快速理解方案。',
          cover: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1400&q=80',
          mediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          linkUrl: ''
        }
      ],
      reviews: [
        {
          author: '某产业平台',
          role: '运营总监',
          score: '5.0 / 5',
          content: '很适合当第二阶段智能化升级伙伴。',
          outcome: '先完成方案梳理，再把知识检索和自动审查纳入下一阶段排期。'
        }
      ],
      availability: ['适合以咨询或方案设计形式介入', '可协助项目沟通与智能化策略设计'],
      process: ['先明确数据边界，再做 AI 能力切入，再验证效果']
    }
  },
  workspace: {
    summary: {
      taskId: 'task-001',
      taskName: 'AI 招聘 H5 首版',
      business: '星河智能',
      talent: '陈一宁',
      range: '4 个 AI 协同工作日',
      status: '协作中'
    },
    taskDetail: {
      taskId: 'task-001',
      title: 'AI 招聘 H5 首版',
      company: '星河智能',
      brief: '围绕官网分流、企业端发布任务、人才端接单协作和聊天确认，先完成第一阶段 MVP 闭环。',
      budget: '￥26,000',
      period: '4 个 AI 协同工作日',
      status: '执行中',
      tags: ['任务闭环', '聊天协作', '验收评分', '多端体验'],
      deliverables: ['官网首页', '企业端发布链路', '人才端协作空间', '聊天与验收入口'],
      modules: [
        { name: '官网与角色分流' },
        { name: '企业端发布与匹配' },
        { name: '人才端执行与进展提交' },
        { name: '聊天、验收与评分入口' }
      ],
      recommendations: ['优先保证任务闭环，再继续补真实上传和通知能力', '进度与附件尽量按轮次归档，方便企业验收'],
      risk: '交付前需要再次核对范围、附件和验收口径。',
      assumption: '工期按熟练使用 AI 工具的人才估算。'
    },
    focus: '围绕当前任务继续提交进展、补充协助说明和上传附件，聊天已经拆到单独页面。',
    pulse: [
      { label: '当前进度', value: '68%', note: '已进入执行阶段，当前优先同步本轮完成度与附件。' },
      { label: '已提交附件', value: '4', note: '图片、视频、资料和说明文档都会继续留痕。' },
      { label: '待处理协助', value: '1 条', note: '如果需要企业补充素材或确认边界，可以在本页直接记录。' },
      { label: '最近同步', value: '03/22 18:20', note: '最新进展和 AI 建议已经同步。' }
    ],
    executionChecklist: [
      { title: '当前任务范围', status: '已完成', note: '任务说明、工期和交付边界已经通过聊天确认单沉淀。' },
      { title: '本轮进展同步', status: '进行中', note: '在这里填写完成度、需要的协助，并上传本轮附件。' },
      { title: '企业验收准备', status: '待开始', note: '交付接近完成后，平台会提醒企业进入验收。' }
    ],
    progressFeed: [
      {
        time: '03/20 10:20',
        author: '陈一宁',
        stage: '任务结构与页面方向',
        completion: '28%',
        summary: '完成任务结构梳理和关键页面方向确认，企业端已锁定第一阶段交付边界。',
        attachments: ['任务结构图.png', '交付范围说明.md']
      },
      {
        time: '03/21 16:40',
        author: '陈一宁',
        stage: '企业端发布与匹配闭环',
        completion: '54%',
        summary: '已完成任务发布、AI 拆解、推荐人才与聊天确认链路，开始补执行页和验收页细节。',
        attachments: ['发布流程录屏.mp4', '推荐人才说明.md']
      },
      {
        time: '03/22 18:20',
        author: '陈一宁',
        stage: '人才执行页与验收准备',
        completion: '68%',
        summary: '开始收敛协作空间结构，把人才执行、附件留痕和 AI 建议整理到同一页里。',
        attachments: ['协作页首版.png', '执行说明.md', '任务确认记录.md']
      }
    ],
    assetLibrary: [
      { type: '图片', name: '任务结构图.png', size: '3.4 MB', updatedAt: '03/20 10:20', status: '已确认' },
      { type: '视频', name: '发布流程录屏.mp4', size: '21.8 MB', updatedAt: '03/21 16:40', status: '待企业查看' },
      { type: '资料', name: '执行说明.md', size: '28 KB', updatedAt: '03/22 18:20', status: 'AI 已分析' },
      { type: '资料', name: '任务确认记录.md', size: '16 KB', updatedAt: '03/22 18:20', status: '已归档' }
    ],
    aiReviewHistory: [
      {
        title: '第 1 次巡检',
        score: '82',
        status: '可继续推进',
        focus: '进展说明完整度',
        summary: '当前进展说明已经能覆盖主要工作内容，建议继续把附件和对应阶段对齐。',
        suggestions: ['每轮提交时附上对应文件，减少企业回问成本', '协助需求尽量写成可执行动作']
      },
      {
        title: '第 2 次巡检',
        score: '88',
        status: '信息清晰',
        focus: '附件归档',
        summary: '附件和任务说明已经可以对应起来，建议继续按阶段归档，方便验收时快速核对。',
        suggestions: ['关键交付件优先放在最前面', '用同一命名规则整理图片、视频和说明']
      },
      {
        title: '第 3 次巡检',
        score: '91',
        status: '可进入验收',
        focus: '验收前准备',
        summary: '当前协作记录已经足够支撑验收，建议在交付前再做一次范围核对，避免遗漏。',
        suggestions: ['完工前回看任务详情和交付件', '确认最后一轮协助项是否已关闭']
      }
    ],
    reviewHistory: [
      { reviewer: '星河智能', role: '企业方', rating: '5.0', time: '04/08 18:30', content: '任务范围清晰，协作记录完整，验收时核对成本很低。' },
      { reviewer: '陈一宁', role: '人才方', rating: '4.8', time: '04/08 19:10', content: '反馈节奏稳定，协助项回应及时，整体协作体验顺畅。' }
    ],
    supportOptions: [
      '需要补充素材',
      '需要确认交付边界',
      '需要接口或账号支持',
      '需要调整排期'
    ],
    acceptance: [
      '确认交付件是否已齐全并可直接核对',
      '确认最后一轮协助项和修改项已经关闭',
      '完成验收后进入双方评分与信用沉淀'
    ]
  },
  taskClosure: {
    summary: {
      taskId: 'task-001',
      title: 'AI 人才市场第一阶段交付',
      businessUserId: 'business-user-001',
      talentUserId: 'talent-user-002',
      business: '星河智能',
      talent: '陈一宁',
      status: '已完成评级',
      acceptedAt: '04/08 18:20',
      nextStep: '当前任务已完成企业评级，继续沉淀人才对企业的合作反馈。'
    },
    metrics: [
      { label: '交付完成度', value: '100%', note: '页面、API、SQL 与核心文档均已核对。' },
      { label: '企业交付评级', value: 'S', note: '企业会按 S / A / B 给出交付评级。' },
      { label: '结算比例', value: '100%', note: 'S = 100%，A = 80%，B = 30%。' },
      { label: '最后验收时间', value: '04/08 18:20', note: '由 B 端发起并确认验收。' }
    ],
    timeline: [
      { title: 'AI 提醒发起验收', status: '已完成', note: '系统根据完成度和附件完整度提醒 B 端进入验收。', time: '04/08 17:20' },
      { title: '提前完成流程', status: '已完成评级', note: 'AI 已审核通过，人才同意提前完成，企业给出 S 级评级。', time: '04/08 18:30' },
      { title: '双方互评沉淀信用', status: '进行中', note: '评分将联动推荐、信用标签与协作画像。', time: '04/08 19:10' }
    ],
    reviewSummary: [
      '企业最终按 S / A / B 给出交付评级，并决定 100% / 80% / 30% 结算比例。',
      '人才评分关注需求清晰度、反馈效率和验收配合度。',
      '平台会把本次合作结果同步到信用画像、工作台与首页案例轮播。'
    ],
    reviewHistory: [
      { reviewer: '星河智能', reviewerAudience: 'enterprise', reviewerRole: '企业方', rating: 'S', time: '04/08 18:30', content: '交付完整、节奏稳定、合作体验优秀。', type: 'DELIVERY_GRADE' },
      { reviewer: '陈一宁', role: '人才方', rating: '4.8', time: '04/08 19:10', content: '需求反馈及时，验收边界清晰，协作回合数比较健康。' },
      { reviewer: 'AI 系统摘要', role: '平台辅助', rating: '91', time: '04/08 19:15', content: '交付链路完整，建议保留附件状态与验收复盘，适合作为后续迭代底座。' }
    ],
    creditImpact: [
      { title: '人才信用画像', note: '新增“交付稳健”“文档完整”标签，推荐权重上调。' },
      { title: '企业合作信用', note: '新增“反馈及时”“验收明确”标签，更容易匹配高评分人才。' },
      { title: '平台后续动作', note: '若 48 小时内仍有互评未完成，系统会自动提醒并记录待处理状态。' }
    ],
    earlyCompletion: {
      status: '已完成评级',
      grade: 'S',
      payoutRatio: '100%',
      gradeNote: '交付完整、节奏稳定、合作体验优秀。',
      aiReviewSummary: '当前交付质量与完成度满足提前完成条件。'
    }
  }
};

export const aiPublishPresetMockData = [
  {
    id: 'custom-blank',
    title: '不选模板，直接描述需求',
    source: 'TEXT',
    brief: '',
    focus: '适合需求还没想清楚，先让 AI 帮你梳理',
    period: '由 AI 估算',
    tags: ['自由输入', 'AI 共创', '需求梳理'],
    isCustom: true
  },
  {
    id: 'recruit-launch',
    title: 'AI 招聘 H5 首版',
    source: 'TEXT',
    brief: '我想做一个面向中小企业的 AI 招聘 H5，支持发布任务、查看人才、在线沟通和进度协作，希望在 4 个 AI 协同工作日内完成首版可演示版本，整体风格偏现代科技感。',
    focus: '任务闭环 + 人才匹配 + 项目沟通',
    period: '4 个 AI 协同工作日',
    tags: ['招聘闭环', '人才匹配', '项目协作']
  },
  {
    id: 'knowledge-refactor',
    title: '企业知识库后台重构',
    source: 'TEXT',
    brief: '我们要重构企业知识库后台，覆盖知识分类、检索策略配置、权限分级、日志分析和管理端体验，希望 6 个 AI 协同工作日内完成一期联调版本。',
    focus: '知识库管理 + 检索配置 + 权限模型',
    period: '6 个 AI 协同工作日',
    tags: ['知识治理', '检索配置', '后台管理']
  },
  {
    id: 'brand-voice',
    title: '品牌官网与工作台视觉升级',
    source: 'VOICE',
    brief: '需要帮一家 AI 服务公司做官网和工作台的视觉升级，首页要更科技、更有留白，企业端和人才端要明显区分，最好 3 个 AI 协同工作日给出首版。',
    voiceTranscript: '我们想把官网和工作台一起升级，首页要更有科技感，企业端和人才端分开表达，整体希望 3 个 AI 协同工作日能做一个可演示的首版。',
    focus: '官网首页 + 工作台视觉升级',
    period: '3 个 AI 协同工作日',
    tags: ['品牌官网', '视觉升级', '角色分流']
  },
  {
    id: 'creator-agent',
    title: '创作者脚本智能协作台',
    source: 'VOICE',
    brief: '想做一个给短视频团队用的脚本协作台，支持选题池、AI 生成脚本、多人评论反馈和进度推进，先做 MVP 版本。',
    voiceTranscript: '我们要做短视频团队的脚本协作台，要有选题池、AI 生成脚本、多人反馈和进度管理，先做一个 MVP。',
    focus: '内容生产协作 + AI 辅助生成',
    period: '5 个 AI 协同工作日',
    tags: ['内容协作', '脚本生成', '任务看板']
  }
];

export const taskRoomMockData = [];

function cloneMock(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildWorkspaceNode({
  id,
  title,
  status,
  progress,
  updatedAt,
  summary,
  talentSubmission,
  aiReview,
  enterpriseSuggestion,
  aiInterpretation,
  nodeType
}) {
  return {
    id,
    title,
    status,
    progress,
    updatedAt,
    summary,
    nodeType,
    talentSubmission,
    aiReview,
    enterpriseSuggestion,
    aiInterpretation,
    enterpriseFeedback: {
      text: enterpriseSuggestion || '',
      updatedAt: '',
      aiInterpretation: aiInterpretation || ''
    }
  };
}

function buildWorkspaceTaskRecord(definition) {
  const taskDetail = {
    taskId: definition.taskId,
    title: definition.title,
    company: definition.company,
    brief: definition.brief,
    budget: definition.budget,
    period: definition.period,
    status: definition.status,
    tags: definition.tags,
    deliverables: definition.deliverables,
    modules: definition.modules,
    recommendations: definition.recommendations,
    risk: definition.risk,
    assumption: definition.assumption
  };

  return {
    summary: {
      taskId: definition.taskId,
      taskName: definition.title,
      business: definition.business,
      talent: definition.talent,
      range: definition.period,
      status: definition.status
    },
    taskDetail,
    focus: definition.focus,
    pulse: definition.pulse,
    executionChecklist: definition.executionChecklist,
    progressFeed: definition.progressFeed,
    assetLibrary: definition.assetLibrary,
    aiReviewHistory: definition.aiReviewHistory,
    reviewHistory: definition.reviewHistory,
    supportOptions: definition.supportOptions,
    acceptance: definition.acceptance,
    collaborationNodes: definition.collaborationNodes,
    taskOptionsItem: {
      taskId: definition.taskId,
      title: definition.title,
      company: definition.company,
      status: definition.status,
      budget: definition.budget,
      period: definition.period,
      summary: definition.summary,
      progress: definition.progress,
      latestNode: definition.latestNode,
      latestSync: definition.latestSync
    }
  };
}

const workspaceTaskCatalog = [
  buildWorkspaceTaskRecord({
    taskId: 'task-001',
    title: 'AI 招聘 H5 首版',
    company: '星河智能',
    business: '星河智能',
    talent: '陈一宁',
    budget: '￥26,000',
    period: '4 个 AI 协同工作日',
    status: '协作中',
    brief: '围绕官网分流、企业端发布任务、人才端接单协作和聊天确认，先完成第一阶段 MVP 闭环。',
    focus: '围绕当前任务继续提交进展、补充协助说明和上传附件，聊天已经拆到单独页面。',
    summary: 'AI 招聘 H5 首版已进入执行阶段，重点看任务确认、进展与验收准备。',
    progress: '68%',
    latestNode: '执行与验收准备',
    latestSync: '03/22 18:20',
    tags: ['Vue 3', '任务闭环', '聊天协作', '验收评分'],
    deliverables: ['官网首页', '企业端发布链路', '人才端协作空间', '聊天与验收入口'],
    modules: [
      { name: '官网与角色分流' },
      { name: '企业端发布与匹配' },
      { name: '人才端执行与进展提交' },
      { name: '聊天、验收与评分入口' }
    ],
    recommendations: [
      '优先保证任务闭环，再继续补真实上传和通知能力',
      '进度与附件尽量按轮次归档，方便企业验收'
    ],
    risk: '交付前需要再次核对范围、附件和验收口径。',
    assumption: '工期按熟练使用 AI 工具的人才估算。',
    pulse: [
      { label: '当前进度', value: '68%', note: '已进入执行阶段，当前优先同步本轮完成度与附件。' },
      { label: '已提交附件', value: '4', note: '图片、视频、资料和说明文档都会继续留痕。' },
      { label: '待处理协助', value: '1 条', note: '如果需要企业补充素材或确认边界，可以在本页直接记录。' },
      { label: '最近同步', value: '03/22 18:20', note: '最新进展和 AI 建议已经同步。' }
    ],
    executionChecklist: [
      { title: '当前任务范围', status: '已完成', note: '任务说明、工期和交付边界已经通过聊天确认单沉淀。' },
      { title: '本轮进展同步', status: '进行中', note: '在这里填写完成度、需要的协助，并上传本轮附件。' },
      { title: '企业验收准备', status: '待开始', note: '交付接近完成后，平台会提醒企业进入验收。' }
    ],
    progressFeed: [
      {
        time: '03/20 10:20',
        author: '陈一宁',
        stage: '任务结构与页面方向',
        completion: '28%',
        summary: '完成任务结构梳理和关键页面方向确认，企业端已锁定第一阶段交付边界。',
        attachments: ['任务结构图.png', '交付范围说明.md']
      },
      {
        time: '03/21 16:40',
        author: '陈一宁',
        stage: '企业端发布与匹配闭环',
        completion: '54%',
        summary: '已完成任务发布、AI 拆解、推荐人才与聊天确认链路，开始补执行页和验收页细节。',
        attachments: ['发布流程录屏.mp4', '推荐人才说明.md']
      },
      {
        time: '03/22 18:20',
        author: '陈一宁',
        stage: '人才执行页与验收准备',
        completion: '68%',
        summary: '开始收敛协作空间结构，把人才执行、附件留痕和 AI 建议整理到同一页里。',
        attachments: ['协作页首版.png', '执行说明.md', '任务确认记录.md']
      }
    ],
    assetLibrary: [
      { type: '图片', name: '任务结构图.png', size: '3.4 MB', updatedAt: '03/20 10:20', status: '已确认' },
      { type: '视频', name: '发布流程录屏.mp4', size: '21.8 MB', updatedAt: '03/21 16:40', status: '待企业查看' },
      { type: '资料', name: '执行说明.md', size: '28 KB', updatedAt: '03/22 18:20', status: 'AI 已分析' },
      { type: '资料', name: '任务确认记录.md', size: '16 KB', updatedAt: '03/22 18:20', status: '已归档' }
    ],
    aiReviewHistory: [
      {
        title: '第 1 次巡检',
        score: '82',
        status: '可继续推进',
        focus: '进展说明完整度',
        summary: '当前进展说明已经能覆盖主要工作内容，建议继续把附件和对应阶段对齐。',
        suggestions: ['每轮提交时附上对应文件，减少企业回问成本', '协助需求尽量写成可执行动作']
      },
      {
        title: '第 2 次巡检',
        score: '88',
        status: '信息清晰',
        focus: '附件归档',
        summary: '附件和任务说明已经可以对应起来，建议继续按阶段归档，方便验收时快速核对。',
        suggestions: ['关键交付件优先放在最前面', '用同一命名规则整理图片、视频和说明']
      },
      {
        title: '第 3 次巡检',
        score: '91',
        status: '可进入验收',
        focus: '验收前准备',
        summary: '当前协作记录已经足够支撑验收，建议在交付前再做一次范围核对，避免遗漏。',
        suggestions: ['完工前回看任务详情和交付件', '确认最后一轮协助项是否已关闭']
      }
    ],
    reviewHistory: [
      { reviewer: '星河智能', role: '企业方', rating: '5.0', time: '04/08 18:30', content: '任务范围清晰，协作记录完整，验收时核对成本很低。' },
      { reviewer: '陈一宁', role: '人才方', rating: '4.8', time: '04/08 19:10', content: '反馈节奏稳定，协助项回应及时，整体协作体验顺畅。' }
    ],
    supportOptions: [
      '需要补充素材',
      '需要确认交付边界',
      '需要接口或账号支持',
      '需要调整排期'
    ],
    acceptance: [
      '确认交付件是否已齐全并可直接核对',
      '确认最后一轮协助项和修改项已经关闭',
      '完成验收后进入双方评分与信用沉淀'
    ],
    collaborationNodes: [
      buildWorkspaceNode({
        id: 'requirements',
        title: '需求确认',
        status: '已完成',
        progress: '100%',
        updatedAt: '03/20 10:20',
        summary: '已确认首版范围、工作台结构和企业 / 人才双端分流。',
        nodeType: '确认节点',
        talentSubmission: {
          title: '需求拆解草稿',
          time: '03/20 10:20',
          content: '先把首页、企业端、人才端和后台管理四条主链路拆开，确保首版能跑通闭环。',
          attachments: ['任务结构图.png', '交付范围说明.md']
        },
        aiReview: {
          status: '通过',
          summary: '范围已经足够支撑第一阶段交付，建议继续保留单列阅读路径。',
          suggestions: ['首版先保证入口清晰', '聊天、协作和验收拆分到独立页面']
        },
        enterpriseSuggestion: '企业建议：先确认闭环，再把更多业务细节放到第二阶段。',
        aiInterpretation: 'AI 认为企业已确认第一阶段边界，当前重点是推进执行和验收准备。'
      }),
      buildWorkspaceNode({
        id: 'matching',
        title: '选人确认',
        status: '已完成',
        progress: '100%',
        updatedAt: '03/21 16:40',
        summary: '已从推荐名单里确认人才，并进入项目聊天协商。',
        nodeType: '协作节点',
        talentSubmission: {
          title: '推荐人才回执',
          time: '03/21 16:40',
          content: '企业已从推荐名单里选中人才，准备进入协商与任务确认。',
          attachments: ['推荐人才说明.md']
        },
        aiReview: {
          status: '通过',
          summary: '推荐名单与任务需求匹配度较高，选人动作已完成。',
          suggestions: ['优先确认预算与周期', '把工作边界写进任务确认单']
        },
        enterpriseSuggestion: '企业建议：选人后立即在聊天里确认预算、工期和验收口径。',
        aiInterpretation: 'AI 补充理解：当前协作目标是缩短确认回合数，尽快进入执行。'
      }),
      buildWorkspaceNode({
        id: 'execution',
        title: '执行与反馈',
        status: '进行中',
        progress: '68%',
        updatedAt: '03/22 18:20',
        summary: '人才正在提交进展、附件和协助需求，企业可在节点里直接查看。',
        nodeType: '执行节点',
        talentSubmission: {
          title: '本轮进展提交',
          time: '03/22 18:20',
          content: '已收敛协作空间结构，开始把进展、附件和 AI 建议整理到同一页。',
          attachments: ['协作页首版.png', '执行说明.md', '任务确认记录.md']
        },
        aiReview: {
          status: '进行中',
          summary: '进展说明已经能覆盖核心内容，建议继续把附件和对应节点对齐。',
          suggestions: ['优先补关键交付件', '需要协助时尽量写成明确动作']
        },
        enterpriseSuggestion: '企业建议：需要补素材时直接点开节点，确认后续修改口径。',
        aiInterpretation: 'AI 补充理解：当前节点聚焦进度透明化，后续可直接进入验收准备。'
      }),
      buildWorkspaceNode({
        id: 'acceptance',
        title: '验收准备',
        status: '待开始',
        progress: '28%',
        updatedAt: '待更新',
        summary: '交付接近完成后，企业将从这里进入验收和评分。',
        nodeType: '验收节点',
        talentSubmission: {
          title: '验收前置检查',
          time: '待更新',
          content: '待人才补充最终交付件与验收说明。',
          attachments: []
        },
        aiReview: {
          status: '待生成',
          summary: 'AI 会在本轮进度稳定后补充验收建议。',
          suggestions: ['先核对交付清单', '确认最后一轮协助项是否关闭']
        },
        enterpriseSuggestion: '企业建议：进入验收前先确认附件齐全与范围一致。',
        aiInterpretation: 'AI 补充理解：验收节点会聚焦交付件齐全度和最终修改闭环。'
      })
    ]
  }),
  buildWorkspaceTaskRecord({
    taskId: 'task-018',
    title: '官网与工作台视觉升级',
    company: '深蓝科技',
    business: '深蓝科技',
    talent: '苏禾',
    budget: '￥18,000',
    period: '3 个 AI 协同工作日',
    status: '协作中',
    brief: '围绕首页展示、企业端和人才端视觉统一做首版升级，强调留白、层级和品牌感。',
    focus: '品牌官网 + 工作台视觉统一',
    summary: '官网与工作台视觉升级正在推进，重点在首页、角色入口和协作空间。',
    progress: '54%',
    latestNode: '视觉定稿',
    latestSync: '03/21 15:10',
    tags: ['视觉升级', '单列官网', '品牌系统'],
    deliverables: ['首页视觉首版', '企业端视觉收敛', '人才端视觉收敛', '组件样式规范'],
    modules: [
      { name: '首页品牌展示' },
      { name: '企业端视觉统一' },
      { name: '人才端执行台' },
      { name: '组件层级与配色' }
    ],
    recommendations: [
      '先统一官网和工作台的字体、留白和卡片系统',
      '把高亮色控制在少数按钮和关键节点上'
    ],
    risk: '视觉稿需要尽早确认边界，不然后续页面联动会反复改。',
    assumption: '工期按熟练使用 AI 工具的人才估算。',
    pulse: [
      { label: '当前进度', value: '54%', note: '视觉首版已经基本收敛。' },
      { label: '待确认节点', value: '2 个', note: '首页 CTA 和协作空间节点样式待企业确认。' },
      { label: '最近同步', value: '03/21 15:10', note: '设计稿已同步到工作区。' },
      { label: '已提交附件', value: '3', note: '视觉稿、配色板和组件说明已留痕。' }
    ],
    executionChecklist: [
      { title: '首页视觉方向', status: '已完成', note: '品牌展示、案例轮播和入口分流已经定稿。' },
      { title: '工作台层级', status: '进行中', note: '正在收敛单列布局和节点图的视觉表达。' },
      { title: '验收准备', status: '待开始', note: '等视觉和交互确认后进入细节收尾。' }
    ],
    progressFeed: [
      {
        time: '03/20 14:00',
        author: '苏禾',
        stage: '首页视觉方向',
        completion: '20%',
        summary: '完成首页 hero、案例轮播和角色入口的首版视觉方向。',
        attachments: ['首页视觉稿.png']
      },
      {
        time: '03/21 11:20',
        author: '苏禾',
        stage: '工作台层级',
        completion: '42%',
        summary: '开始收敛企业端和人才端工作台的单列布局与节点图。',
        attachments: ['工作台布局说明.md', '节点样式稿.png']
      },
      {
        time: '03/21 15:10',
        author: '苏禾',
        stage: '视觉定稿',
        completion: '54%',
        summary: '视觉变量与组件层级继续统一，准备给企业确认。',
        attachments: ['配色板.png', '组件说明.md']
      }
    ],
    assetLibrary: [
      { type: '图片', name: '首页视觉稿.png', size: '4.1 MB', updatedAt: '03/20 14:00', status: '已确认' },
      { type: '文档', name: '工作台布局说明.md', size: '18 KB', updatedAt: '03/21 11:20', status: 'AI 已分析' },
      { type: '图片', name: '节点样式稿.png', size: '2.8 MB', updatedAt: '03/21 11:20', status: '待企业确认' }
    ],
    aiReviewHistory: [
      {
        title: '第 1 次巡检',
        score: '86',
        status: '风格统一',
        focus: '首页留白',
        summary: '当前官网和工作台已经具备统一的视觉方向，建议继续压缩文案密度。',
        suggestions: ['案例展示可以继续用图片化封面', '工作台节点图不要放太多解释性文字']
      },
      {
        title: '第 2 次巡检',
        score: '89',
        status: '体验稳定',
        focus: '节点样式',
        summary: '企业端协作空间可进一步收敛为节点图交互，减少冗余模块。',
        suggestions: ['把节点详情收进弹窗', '保留单列阅读节奏']
      }
    ],
    reviewHistory: [
      { reviewer: '深蓝科技', role: '企业方', rating: '5.0', time: '03/21 16:00', content: '官网和工作台风格统一，信息层级更清楚。' },
      { reviewer: '苏禾', role: '人才方', rating: '4.9', time: '03/21 16:20', content: '企业反馈节奏清楚，视觉方向比较好收敛。' }
    ],
    supportOptions: [
      '需要确认首屏留白',
      '需要确认节点视觉',
      '需要补图片化案例',
      '需要调整页面层级'
    ],
    acceptance: [
      '确认首页和工作台的视觉语言一致',
      '确认节点图和弹窗交互是否足够简洁',
      '完成后继续沉淀到设计系统'
    ],
    collaborationNodes: [
      buildWorkspaceNode({
        id: 'visual-home',
        title: '首页视觉',
        status: '已完成',
        progress: '100%',
        updatedAt: '03/20 14:00',
        summary: '首页 hero、案例轮播和角色入口已收敛。',
        nodeType: '视觉节点',
        talentSubmission: {
          title: '首页视觉稿',
          time: '03/20 14:00',
          content: '首页改成单列官网展示，案例区用图片化封面和轮播处理。',
          attachments: ['首页视觉稿.png']
        },
        aiReview: {
          status: '通过',
          summary: '首页结构清晰，文案密度已经下降。',
          suggestions: ['继续保持单列节奏', '案例区保留图片 + 简短文案']
        },
        enterpriseSuggestion: '企业建议：首屏要更有记忆点，按钮和案例卡要更轻。',
        aiInterpretation: 'AI 补充理解：当前节点已经达成官网展示方向，可继续推进工作台统一。'
      }),
      buildWorkspaceNode({
        id: 'visual-shell',
        title: '工作台层级',
        status: '进行中',
        progress: '54%',
        updatedAt: '03/21 11:20',
        summary: '企业端和人才端正在收敛单列布局和节点图视觉表达。',
        nodeType: '布局节点',
        talentSubmission: {
          title: '工作台布局说明',
          time: '03/21 11:20',
          content: '工作台拆成总览、入口卡和详情弹窗，不再用大段说明填满页面。',
          attachments: ['工作台布局说明.md', '节点样式稿.png']
        },
        aiReview: {
          status: '进行中',
          summary: '布局已经明显收敛，建议继续压缩解释性文案。',
          suggestions: ['节点详情放进弹窗', '列表和卡片保留简洁信息']
        },
        enterpriseSuggestion: '企业建议：协作空间要更像总览，不要像说明页。',
        aiInterpretation: 'AI 补充理解：这里要把多任务切换和节点详情交互做成更短路径。'
      }),
      buildWorkspaceNode({
        id: 'visual-finish',
        title: '视觉定稿',
        status: '待开始',
        progress: '20%',
        updatedAt: '待更新',
        summary: '准备做最后一轮确认和验收。',
        nodeType: '收尾节点',
        talentSubmission: {
          title: '视觉收尾计划',
          time: '待更新',
          content: '待补充最后一轮视觉细节。',
          attachments: []
        },
        aiReview: {
          status: '待生成',
          summary: 'AI 会在企业反馈后继续补充理解。',
          suggestions: ['确认首页案例和工作台节点图样式', '检查移动端的阅读节奏']
        },
        enterpriseSuggestion: '企业建议：收尾时重点核对页面节奏和单列阅读感。',
        aiInterpretation: 'AI 补充理解：本节点主要做样式统一和信息减法。'
      })
    ]
  }),
  buildWorkspaceTaskRecord({
    taskId: 'task-026',
    title: '企业知识库后台重构',
    company: '深蓝科技',
    business: '深蓝科技',
    talent: '顾岩',
    budget: '￥32,000',
    period: '6 个 AI 协同工作日',
    status: '执行中',
    brief: '围绕知识分类、检索配置、权限模型和后台体验做重构，强调可配置与可运营。',
    focus: '知识模型 + 检索配置 + 权限后台',
    summary: '知识库后台重构已进入中段，当前重点是权限模型、检索配置和审计日志。',
    progress: '42%',
    latestNode: '权限模型确认',
    latestSync: '03/22 11:30',
    tags: ['Spring Boot', 'MySQL', '权限模型', '检索配置'],
    deliverables: ['知识分类方案', '检索配置面板', '权限与审计模块', '管理后台骨架'],
    modules: [
      { name: '知识模型与分类' },
      { name: '检索配置中心' },
      { name: '权限与审计' },
      { name: '运营后台' }
    ],
    recommendations: [
      '先把知识分类、权限和检索实验面板做成最小闭环',
      '日志分析优先保留核心字段'
    ],
    risk: '权限粒度和检索策略建议尽早定清。',
    assumption: '工期按熟练使用 AI 工具的人才估算。',
    pulse: [
      { label: '当前进度', value: '42%', note: '正在确认权限模型和检索策略。' },
      { label: '待确认节点', value: '3 个', note: '分类、权限和审计都需要企业反馈。' },
      { label: '最近同步', value: '03/22 11:30', note: '知识库后台重构已有最新同步。' },
      { label: '已提交附件', value: '5', note: '设计图、字段表和接口说明已归档。' }
    ],
    executionChecklist: [
      { title: '知识分类方案', status: '已完成', note: '已确认核心分类和字段结构。' },
      { title: '权限模型', status: '进行中', note: '正在对齐角色、数据范围与操作日志。' },
      { title: '检索与审计', status: '待开始', note: '等待权限模型确认后进入联调。' }
    ],
    progressFeed: [
      {
        time: '03/20 09:40',
        author: '顾岩',
        stage: '知识分类方案',
        completion: '18%',
        summary: '已完成知识分类与字段初稿，并整理首版后台目录。',
        attachments: ['知识分类草稿.md']
      },
      {
        time: '03/21 14:50',
        author: '顾岩',
        stage: '权限模型确认',
        completion: '42%',
        summary: '开始确认角色、权限模型和审计字段，后台骨架继续推进。',
        attachments: ['权限模型图.png', '字段说明.md']
      }
    ],
    assetLibrary: [
      { type: '文档', name: '知识分类草稿.md', size: '24 KB', updatedAt: '03/20 09:40', status: '已确认' },
      { type: '图片', name: '权限模型图.png', size: '1.9 MB', updatedAt: '03/21 14:50', status: '待确认' },
      { type: '文档', name: '字段说明.md', size: '31 KB', updatedAt: '03/21 14:50', status: 'AI 已分析' }
    ],
    aiReviewHistory: [
      {
        title: '第 1 次巡检',
        score: '84',
        status: '结构清晰',
        focus: '权限模型',
        summary: '权限与知识分类的边界已经比较清楚，建议先做最小闭环。',
        suggestions: ['日志字段先保留核心信息', '检索实验面板可以后补']
      },
      {
        title: '第 2 次巡检',
        score: '87',
        status: '建议尽早联调',
        focus: '后台体验',
        summary: '后台目录与运营流已经适合开始联调，建议继续缩短页面路径。',
        suggestions: ['把复杂配置收进抽屉', '保留最常用的管理动作']
      }
    ],
    reviewHistory: [
      { reviewer: '深蓝科技', role: '企业方', rating: '5.0', time: '03/21 16:10', content: '权限和检索策略讲得很清楚，执行节奏也稳定。' },
      { reviewer: '顾岩', role: '人才方', rating: '4.8', time: '03/21 16:30', content: '反馈明确，后台结构收敛得比较快。' }
    ],
    supportOptions: [
      '需要补充字段',
      '需要确认权限范围',
      '需要检索策略建议',
      '需要补审计日志'
    ],
    acceptance: [
      '确认知识分类和权限模型是否一致',
      '确认检索实验面板是否需要补充',
      '完成验收后再进入数据沉淀'
    ],
    collaborationNodes: [
      buildWorkspaceNode({
        id: 'schema',
        title: '知识分类',
        status: '已完成',
        progress: '100%',
        updatedAt: '03/20 09:40',
        summary: '知识分类和字段结构已经确认。',
        nodeType: '方案节点',
        talentSubmission: {
          title: '知识分类草稿',
          time: '03/20 09:40',
          content: '先把知识模型、分类和检索字段整理清楚，再开始做配置面板。',
          attachments: ['知识分类草稿.md']
        },
        aiReview: {
          status: '通过',
          summary: '分类边界清晰，可以进入权限和审计的确认。',
          suggestions: ['先做核心字段', '减少首版配置复杂度']
        },
        enterpriseSuggestion: '企业建议：分类先保留最常用的管理动作，别让后台过重。',
        aiInterpretation: 'AI 补充理解：该节点已经完成知识模型草拟，后续可转到权限模型。'
      }),
      buildWorkspaceNode({
        id: 'permission',
        title: '权限模型',
        status: '进行中',
        progress: '42%',
        updatedAt: '03/21 14:50',
        summary: '正在确认角色、数据范围和审计字段。',
        nodeType: '协作节点',
        talentSubmission: {
          title: '权限模型确认单',
          time: '03/21 14:50',
          content: '当前已确认企业 / 管理员基础角色，下一步补数据范围和审计字段。',
          attachments: ['权限模型图.png', '字段说明.md']
        },
        aiReview: {
          status: '进行中',
          summary: '权限范围已经比较清楚，建议先做最小闭环再扩展。',
          suggestions: ['日志字段先保留核心信息', '配置面板可放到抽屉里']
        },
        enterpriseSuggestion: '企业建议：权限和检索策略尽早确定，避免后续反复改配置。',
        aiInterpretation: 'AI 补充理解：此节点当前聚焦角色映射和审计粒度。'
      }),
      buildWorkspaceNode({
        id: 'search',
        title: '检索与审计',
        status: '待开始',
        progress: '18%',
        updatedAt: '待更新',
        summary: '等待权限模型确认后再进入检索策略与审计联调。',
        nodeType: '收尾节点',
        talentSubmission: {
          title: '检索配置计划',
          time: '待更新',
          content: '待补充检索实验面板和审计日志说明。',
          attachments: []
        },
        aiReview: {
          status: '待生成',
          summary: 'AI 会在权限模型确认后给出检索和审计建议。',
          suggestions: ['保留实验面板入口', '日志分析先看核心字段']
        },
        enterpriseSuggestion: '企业建议：检索和审计要跟权限保持一致，避免字段重复。',
        aiInterpretation: 'AI 补充理解：这里会把配置与运营动作统一到后台流程中。'
      })
    ]
  })
];

function findWorkspaceTask(taskId = '') {
  const normalizedTaskId = String(taskId || '').trim();
  const target = workspaceTaskCatalog.find((item) => item.summary.taskId === normalizedTaskId);
  return target || workspaceTaskCatalog[0];
}

export function buildWorkspaceFallback(taskId = '') {
  const task = cloneMock(findWorkspaceTask(taskId));
  const taskOptions = workspaceTaskCatalog.map((item) => cloneMock(item.taskOptionsItem));
  return {
    ...task,
    summary: cloneMock(task.summary),
    taskDetail: cloneMock(task.taskDetail),
    taskOptions,
    collaborationNodes: cloneMock(task.collaborationNodes)
  };
}

export function buildWorkspaceFeedbackFallback(taskId = '', payload = {}) {
  const task = cloneMock(findWorkspaceTask(taskId));
  const targetNodeId = String(payload.nodeId || payload.id || '').trim();
  const currentNode = (task.collaborationNodes || []).find((item) => item.id === targetNodeId) || task.collaborationNodes?.[0] || null;
  const feedbackText = String(payload.summary || payload.feedbackText || payload.note || '').trim();
  const nextInterpretation = feedbackText
    ? `AI 补充理解：企业建议已记录，当前更关注“${feedbackText.slice(0, 42)}${feedbackText.length > 42 ? '…' : ''}”。`
    : currentNode?.aiInterpretation || 'AI 补充理解：企业反馈已记录，后续协作会优先参考该节点。';

  const nextNode = currentNode
    ? {
        ...currentNode,
        enterpriseFeedback: {
          text: feedbackText,
          updatedAt: new Date().toISOString(),
          aiInterpretation: nextInterpretation
        },
        aiInterpretation: nextInterpretation
      }
    : null;

  return {
    taskId: task.summary.taskId,
    nodeId: targetNodeId,
    businessSuggestion: {
      summary: feedbackText,
      aiSupplement: nextInterpretation,
      updatedAt: new Date().toISOString(),
      author: task.summary.business || '企业端'
    },
    node: nextNode,
    collaborationNodes: nextNode
      ? task.collaborationNodes.map((item) => (item.id === nextNode.id ? nextNode : item))
      : task.collaborationNodes,
    taskOptions: workspaceTaskCatalog.map((item) => cloneMock(item.taskOptionsItem)),
    status: 'RECORDED',
    nextStep: '企业改进建议已保存，AI 已补充理解并同步到节点详情。'
  };
}

export function buildTaskRoomCommunicationRecord(room = {}) {
  const messages = Array.isArray(room.messages) ? room.messages : [];
  const humanMessages = messages
    .filter((item) => item && item.type !== 'SYSTEM' && item.text)
    .map((item) => `${item.author}：${item.text}`);
  const decisions = messages
    .filter((item) => item && item.type !== 'SYSTEM' && item.text)
    .map((item) => item.text)
    .filter((text) => text.includes('确认') || text.includes('先') || text.includes('按') || text.includes('可以'));

  return {
    title: 'AI 沟通纪要',
    status: '已保存',
    savedAt: room.lastTime || '刚刚',
    summary: `${room.stage || '项目沟通'}：${room.focus || '围绕当前任务继续对齐执行方式。'} 当前最新结论是“${room.lastMessage || '待补充'}”。`,
    recordNote: '聊天记录会自动保存，AI 会同步整理出关键结论与待办事项。',
    keyPoints: humanMessages.slice(-3),
    decisions: decisions.length ? decisions : ['当前沟通重点已记录，建议继续把范围、工期和交付边界明确下来。'],
    openItems: Array.isArray(room.pendingActions) ? room.pendingActions : []
  };
}

export function getTaskRoomsMock() {
  return cloneMock(
    taskRoomMockData.map(({ messages, ...room }) => {
      const communicationRecord = room.communicationRecord || buildTaskRoomCommunicationRecord({ ...room, messages });
      return {
        ...room,
        communicationStatus: communicationRecord.status || '已生成',
        communicationSavedAt: communicationRecord.savedAt || room.lastTime || ''
      };
    })
  );
}

export function getTaskRoomMock(roomKey = '') {
  return cloneMock({
    roomKey,
    taskId: '',
    title: '还没有聊天',
    stage: '等待任务开始',
    focus: '当企业发布任务并选中人才后，新的协商房间会出现在这里。',
    provider: 'Tencent IM',
    roomId: '',
    taskRoom: {
      taskId: '',
      provider: 'TENCENT_IM',
      providerRoomId: '',
      groupType: 'Public',
      joinOption: 'FreeAccess',
      status: 'INACTIVE'
    },
    members: [],
    unreadCount: '0',
    lastTime: '',
    lastMessage: '',
    participants: [],
    taskTags: [],
    quickReplies: [],
    pendingActions: [],
    messages: []
  });
}

export function getTaskRoomBindingMock(roomKey = '') {
  return getTaskRoomMock(roomKey).taskRoom || {
    taskId: '',
    provider: 'TENCENT_IM',
    providerRoomId: '',
    groupType: 'Public',
    joinOption: 'FreeAccess',
    status: 'INACTIVE'
  };
}

export function getTaskRoomMemberMock(roomKey = '', audience = 'enterprise') {
  const normalizedAudience = audience === 'talent' ? 'talent' : 'enterprise';
  const room = getTaskRoomMock(roomKey);
  const member = (room.members || []).find((item) => item.audience === normalizedAudience);

  if (member) {
    return member;
  }

  return normalizedAudience === 'talent'
    ? {
        audience: 'talent',
        platformUserId: 'talent-user-demo',
        imUserId: 'u_talent_user_demo',
        displayName: '陈一宁',
        role: 'TALENT'
      }
    : {
        audience: 'enterprise',
        platformUserId: 'business-user-demo',
        imUserId: 'u_business_user_demo',
        displayName: '星河智能',
        role: 'PROJECT_OWNER'
      };
}

export function getTaskRoomCounterpartMock(roomKey = '', audience = 'enterprise') {
  const normalizedAudience = audience === 'talent' ? 'enterprise' : 'talent';
  return getTaskRoomMemberMock(roomKey, normalizedAudience);
}

function findMockTalentCandidateByUserId(talentUserId) {
  return webMockData.talentMarketplace.items.find((item) => item.talentUserId === talentUserId) || null;
}

function recommendedMockTalentCandidates(content) {
  const normalized = (content || '').toLowerCase();
  let candidateUserIds = ['talent-user-002', 'talent-user-026', 'talent-user-018', 'talent-user-019'];

  if (normalized.includes('知识库') || normalized.includes('检索') || normalized.includes('权限')) {
    candidateUserIds = ['talent-user-026', 'talent-user-019', 'talent-user-002'];
  } else if (normalized.includes('脚本') || normalized.includes('内容') || normalized.includes('视频')) {
    candidateUserIds = ['talent-user-018', 'talent-user-019', 'talent-user-002'];
  } else if (normalized.includes('品牌') || normalized.includes('首页') || normalized.includes('视觉')) {
    candidateUserIds = ['talent-user-018', 'talent-user-002', 'talent-user-019'];
  }

  return candidateUserIds
    .map((talentUserId, index) => {
      const talent = findMockTalentCandidateByUserId(talentUserId);
      if (!talent) {
        return null;
      }

      const reasonMap = {
        'talent-user-002': '适合从需求梳理到交付验收的整条链路协同推进，兼顾产品和实现。',
        'talent-user-026': normalized.includes('知识库') || normalized.includes('权限')
          ? '适合把知识库后台、权限模型和接口联调快速做成首版。'
          : '适合推进前后台一体的 MVP 首版，能把复杂业务快速落成可联调版本。',
        'talent-user-018': normalized.includes('脚本') || normalized.includes('内容') || normalized.includes('品牌') || normalized.includes('视觉')
          ? '适合把内容协作台或品牌官网的结构、视觉和交互层级做清楚。'
          : '适合把首页、工作台和任务流程的视觉层级做顺。',
        'talent-user-019': normalized.includes('知识库') || normalized.includes('检索')
          ? '适合补强检索策略、RAG 规则和 AI 审查建议。'
          : '适合补强 AI 拆单、巡检建议和自动化协作规则。'
      };

      const availabilityMap = {
        'talent-user-002': '本周剩余可接单 3 天',
        'talent-user-026': '本周可并行 1 个 3-5 天冲刺项目',
        'talent-user-018': '本周可承接设计冲刺',
        'talent-user-019': '3 天内可接入 AI 方案设计'
      };

      const matchScoreMap = {
        'talent-user-002': index === 0 ? '96% 匹配' : '93% 匹配',
        'talent-user-026': index === 0 ? '95% 匹配' : '92% 匹配',
        'talent-user-018': index === 0 ? '94% 匹配' : '91% 匹配',
        'talent-user-019': '89% 匹配'
      };

      return {
        talentUserId: talent.talentUserId,
        slug: talent.slug,
        name: talent.name,
        role: talent.role,
        score: talent.score,
        responseTime: talent.responseTime,
        availability: availabilityMap[talentUserId],
        matchScore: matchScoreMap[talentUserId],
        reason: reasonMap[talentUserId]
      };
    })
    .filter(Boolean);
}

function detectAnalysisProfile(content) {
  if (content.includes('知识库') || content.includes('检索') || content.includes('权限')) {
    return {
      modules: [
        { name: '知识模型与分类', duration: '3 天', output: '知识分类、元数据字段和内容生命周期管理' },
        { name: '检索配置中心', duration: '4 天', output: '检索策略、召回权重、问答参数与实验面板' },
        { name: '权限与审计', duration: '3 天', output: '组织、角色、数据范围与操作日志' },
        { name: '运营后台', duration: '4 天', output: '知识内容管理、日志分析与问题回溯' }
      ],
      schedule: {
        total: '6 个 AI 协同工作日',
        assumption: '按熟练使用 AI 检索、生成和配置工具的人才估算，传统多周工作量会被明显压缩。',
        risk: '权限粒度和检索策略建议在第一阶段就定清，否则后续联调回合数会明显增加。'
      },
      tags: ['知识治理', '权限与审计', '检索配置', '后台管理'],
      recommendations: [
        '先用飞书文档或腾讯文档把知识分类、权限和检索实验面板做成最小闭环',
        '日志分析优先保留核心字段，报表和可视化可以第二阶段再补',
        '需要尽早确认知识同步来源和清洗规则'
      ],
      matchingPreview: recommendedMockTalentCandidates(content)
    };
  }

  if (content.includes('脚本') || content.includes('内容') || content.includes('视频')) {
    return {
      modules: [
        { name: '选题池与素材管理', duration: '2 天', output: '热点池、素材标签和脚本来源沉淀' },
        { name: 'AI 脚本生成', duration: '3 天', output: '脚本草稿生成、改写、版本对比与提示词模板' },
        { name: '协作评论与进度', duration: '3 天', output: '评论反馈、状态流转和多人协作记录' },
        { name: '复盘面板', duration: '2 天', output: '选题命中率、脚本采用率和内容复盘' }
      ],
      schedule: {
        total: '4 个 AI 协同工作日',
        assumption: '按熟练使用 AI 生成、改写和自动化工作流的人才估算，脚本生产效率会显著高于传统方式。',
        risk: 'AI 生成效果要依赖提示词模板和素材沉淀，首版建议先限制脚本模板种类。'
      },
      tags: ['内容协作', '脚本生成', '流程复盘', '任务看板'],
      recommendations: [
        '首版先覆盖脚本草稿生成与多人反馈，不要一开始就做复杂分发',
        '把脚本版本记录和评论放到同一条时间线里',
        '先沉淀可复用的提示词模板，再扩多风格内容，建议优先结合 DeepSeek、通义千问或豆包'
      ],
      matchingPreview: recommendedMockTalentCandidates(content)
    };
  }

  if (content.includes('首页') || content.includes('官网') || content.includes('品牌') || content.includes('视觉升级') || content.includes('界面升级')) {
    return {
      modules: [
        { name: '首页结构与文案收敛', duration: '0.5 天', output: '首屏结构、角色入口与案例层级明确' },
        { name: '视觉方向与组件规范', duration: '1 天', output: '配色、字体、按钮和卡片规则收敛' },
        { name: '官网页面与工作台首版', duration: '1 天', output: '首页、角色入口和关键工作台首版稿' },
        { name: '验收与细节修订', duration: '0.5 天', output: '按反馈补细节并整理交付说明' }
      ],
      schedule: {
        total: '3 个 AI 协同工作日',
        assumption: '按熟练使用 AI 设计、生成和前端工具的人才估算，官网首页或视觉升级类首版通常 3 个 AI 协同工作日可交付。',
        risk: '如果临时扩成整站重构、品牌系统重做或多端深度联动，工期会继续拉长。'
      },
      tags: ['官网升级', '角色分流', '品牌视觉', '交付验收'],
      recommendations: [
        '先锁首屏、角色入口、案例轮播和联系方式四个核心板块，再补次级说明内容',
        '视觉方向优先用 MasterGo 或即时设计快速共评，减少来回口头描述',
        '交付时建议同步给出组件规范和改动说明，方便后续继续扩展页面'
      ],
      matchingPreview: recommendedMockTalentCandidates(content)
    };
  }

  return {
    modules: [
      { name: '角色与权限', duration: '0.5 天', output: '企业 / 人才 / 管理员基础角色与权限映射' },
      { name: '任务闭环', duration: '1.5 天', output: '发布、AI 拆解、确认、匹配、协作、验收流程' },
      { name: '沟通与进度', duration: '1 天', output: '消息列表、里程碑、附件上传、AI 审查建议' },
      { name: '后台管理', duration: '1 天', output: '用户、任务、审核、风控看板' }
    ],
    schedule: {
      total: '4 个 AI 协同工作日',
      assumption: '按熟练使用 AI 编码、设计和自动化工具的人才估算，传统一周左右的工作量可能压缩到 1 天左右。',
      risk: '在线沟通、文件同步和支付结算建议拆成分阶段推进。'
    },
    tags: ['需求梳理', '任务闭环', '在线沟通', '交付验收'],
    recommendations: [
      '第一阶段先保证任务闭环和审核流程完整，优先把 AI 辅助高频环节做深',
      '文件上传与 AI 审查可以先接 mock 能力，再对接真实模型',
      'AI 给出的工期是按高效 AI 人才估算，发布前建议再结合预算和合作方式人工确认一次',
      '界面稿与流程图优先用 MasterGo 或即时设计，需求记录优先沉淀在飞书文档或腾讯文档'
    ],
    matchingPreview: recommendedMockTalentCandidates(content)
  };
}

export function mockAnalyzeTaskBrief(brief) {
  const content = brief && brief.trim() ? brief.trim() : webMockData.business.sampleBrief;
  const profile = detectAnalysisProfile(content);

  return {
    provider: '本地分析',
    model: 'rule-based',
    originalBrief: content,
    modules: profile.modules,
    schedule: profile.schedule,
    tags: profile.tags,
    recommendations: profile.recommendations,
    matchingPreview: profile.matchingPreview
  };
}
