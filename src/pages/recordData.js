import { formatDateLabel, formatDateRangeLabel, formatGrade, formatMoney } from '../services/recordFormatters.js';

export { formatDateLabel, formatDateRangeLabel, formatGrade, formatMoney } from '../services/recordFormatters.js';

export const recordTabs = [
  { value: 'all', label: '全部' },
  { value: 'ongoing', label: '进行中' },
  { value: 'completed', label: '已完成' }
];

function makeTimeline(prefix, finishNote) {
  return [
    { time: '09:10', title: `${prefix}发单`, note: '完成需求发布、预算确认和首轮协商。' },
    { time: '13:40', title: `${prefix}执行`, note: '进展、附件和沟通纪要持续同步。' },
    { time: '18:20', title: `${prefix}结算`, note: finishNote }
  ];
}

function makeRecord(record) {
  return {
    ...record,
    tags: record.tags || [],
    timeline: record.timeline || []
  };
}

const enterpriseRecords = [
  makeRecord({
    id: 'enterprise-brand-launch',
    title: '品牌官网首版',
    amount: 36800,
    startDate: '2026-03-01',
    endDate: '2026-03-08',
    status: '已完成',
    myGrade: 'S',
    partnerName: '林昭',
    summary: '从发单到验收一次闭环，官网首版已经按期上线。',
    detail:
      '这单更关注页面结构、品牌调性和上线节奏。团队在发单后 2 小时完成匹配，后续通过聊天、协作和验收页把过程留痕。',
    tags: ['官网改版', '验收闭环', 'S 级'],
    timeline: makeTimeline('品牌官网', '按 100% 结算并进入案例沉淀。')
  }),
  makeRecord({
    id: 'enterprise-ai-h5',
    title: 'AI 招聘 H5 首版',
    amount: 24000,
    startDate: '2026-03-10',
    endDate: '2026-03-19',
    status: '进行中',
    myGrade: '待评级',
    partnerName: '苏禾',
    summary: '需求确认已完成，正在推进首版交互和移动端适配。',
    detail:
      '这单更偏快节奏协作，当前已经完成任务拆解、候选确认和首轮界面方向。下一步会继续跟进素材、文案与表单交互。',
    tags: ['H5', '移动端', '交互打样'],
    timeline: makeTimeline('AI 招聘', '项目完成后会在这里同步我的最终评级。')
  }),
  makeRecord({
    id: 'enterprise-campaign-page',
    title: '品牌活动页迭代',
    amount: 15200,
    startDate: '2026-03-14',
    endDate: '2026-03-28',
    status: '进行中',
    myGrade: '待评级',
    partnerName: '顾岩',
    summary: '活动页进入修改阶段，主要是补齐节奏和转化细节。',
    detail:
      '这单在协作空间里记录了多轮进展和 AI 巡检建议，适合查看改动节奏、附件留痕和每次协商结果。',
    tags: ['活动页', '转化优化', '协作留痕'],
    timeline: makeTimeline('活动页', '当前仍在执行中，结算将在验收后完成。')
  }),
  makeRecord({
    id: 'enterprise-brand-system',
    title: '品牌视觉系统',
    amount: 19800,
    startDate: '2026-02-20',
    endDate: '2026-03-04',
    status: '已完成',
    myGrade: 'A',
    partnerName: '周珞',
    summary: '已完成一轮品牌视觉整理，交付节奏稳定。',
    detail:
      '这单沉淀了视觉规范、主视觉组件和交付说明。虽然没有 S 级，但过程稳定、沟通清晰，已经保留在记录里。',
    tags: ['品牌系统', '视觉规范', 'A 级'],
    timeline: makeTimeline('品牌视觉', '按 A 级结算，记录继续保留。')
  })
];

const talentRecords = [
  makeRecord({
    id: 'talent-brand-launch',
    title: '品牌官网首版',
    amount: 36800,
    startDate: '2026-03-01',
    endDate: '2026-03-08',
    status: '已完成',
    myGrade: 'S',
    partnerName: '星河智能',
    summary: '企业给出的最终评级是 S 级，合作体验很顺。',
    detail:
      '这个项目从接单开始就把节奏、验收和附件拆得很清楚。现在可以直接回看发单、进展和企业评分的全过程。',
    tags: ['S 级', '稳定交付', '100% 结算'],
    timeline: makeTimeline('官网项目', '企业已完成评级，当前按 100% 结算。')
  }),
  makeRecord({
    id: 'talent-ai-h5',
    title: 'AI 招聘 H5 首版',
    amount: 24000,
    startDate: '2026-03-10',
    endDate: '2026-03-19',
    status: '进行中',
    myGrade: '待评分',
    partnerName: '深蓝科技',
    summary: '当前在执行中，等待下一轮进展同步和企业确认。',
    detail:
      '这单适合查看我最近一次提交、协助需求和 AI 审核建议。项目完成后，企业评分会直接沉淀到这条记录。',
    tags: ['执行中', '移动端', '待评分'],
    timeline: makeTimeline('H5 交付', '项目结束后企业会在这里留下我的最终评级。')
  }),
  makeRecord({
    id: 'talent-campaign-page',
    title: '品牌活动页迭代',
    amount: 15200,
    startDate: '2026-03-14',
    endDate: '2026-03-28',
    status: '进行中',
    myGrade: '待评分',
    partnerName: '北辰品牌实验室',
    summary: '正在补交付细节，合作过程会持续留痕。',
    detail:
      '这条记录把我每次提交的节奏都保留了下来，方便后面回看哪些调整影响了最终结果。',
    tags: ['活动页', '持续协作', '过程透明'],
    timeline: makeTimeline('活动页', '完成验收后会同步我的接单评级。')
  }),
  makeRecord({
    id: 'talent-brand-system',
    title: '品牌视觉系统',
    amount: 19800,
    startDate: '2026-02-20',
    endDate: '2026-03-04',
    status: '已完成',
    myGrade: 'A',
    partnerName: '立方增长工作室',
    summary: '这单已经完成，企业给出了 A 级反馈。',
    detail:
      '可以在这里回看任务确认、执行和验收结果。虽然不是最高评级，但流程顺利、反馈清楚，适合继续积累复购。',
    tags: ['A 级', '品牌系统', '可复用'],
    timeline: makeTimeline('品牌视觉', '已完成评级，当前记录可继续复用。')
  })
];

const collectionMap = {
  enterprise: {
    eyebrow: '企业发单记录',
    title: '发单记录',
    lead: '按发单、执行和结算节奏回看每一单合作，重点看金额、时间和我的评级。',
    partnerLabel: '合作人才',
    gradeLabel: '我的评级',
    emptyHint: '企业发单记录会在这里按状态沉淀，便于继续跟进和复盘。',
    stats: [
      { label: '记录总额', value: '¥96,800', note: '当前展示的发单总额。' },
      { label: '进行中', value: '2', note: '正在协作的发单记录。' },
      { label: '已完成', value: '2', note: '已经完成评级的记录。' },
      { label: '最近评级', value: 'S', note: '最近一次完成的企业评级。' }
    ],
    records: enterpriseRecords
  },
  talent: {
    eyebrow: '人才接单记录',
    title: '接单记录',
    lead: '按接单、执行和验收节奏查看每一单合作，把收入、周期和企业评级保留下来。',
    partnerLabel: '合作企业',
    gradeLabel: '企业评级',
    emptyHint: '人才接单记录会在这里按状态沉淀，方便复盘作品和合作质量。',
    stats: [
      { label: '记录总额', value: '¥96,800', note: '当前展示的接单总额。' },
      { label: '进行中', value: '2', note: '正在执行的接单记录。' },
      { label: '已完成', value: '2', note: '已经完成评级的记录。' },
      { label: '最近评级', value: 'S', note: '最近一次完成的企业评分。' }
    ],
    records: talentRecords
  }
};

export function getRecordCollection(audience = 'enterprise') {
  return collectionMap[audience] || collectionMap.enterprise;
}

export function getRecordById(audience = 'enterprise', recordId = '') {
  return getRecordCollection(audience).records.find((item) => item.id === recordId) || null;
}

function buildListItem(audience, record) {
  const gradeLabel = audience === 'talent' ? '企业评级' : '我的评级';
  return {
    taskId: record.id,
    roomKey: '',
    title: record.title,
    counterpartName: record.partnerName,
    counterpartRole: audience === 'talent' ? '企业' : '人才',
    amountLabel: audience === 'talent' ? '收入' : '预算',
    amountValue: formatMoney(record.amount),
    amountNote: record.summary,
    startAt: record.startDate,
    endAt: record.endDate,
    statusGroup: record.status,
    statusKey: record.status === '已完成' ? 'completed' : 'ongoing',
    stage: record.status,
    stageNote: record.summary,
    rating: {
      label: gradeLabel,
      value: formatGrade(record.myGrade),
      note: record.detail
    },
    summary: record.summary,
    updatedAt: record.endDate || record.startDate,
    route: audience === 'talent' ? `/talent/records/${record.id}` : `/enterprise/records/${record.id}`,
    tags: record.tags,
    timeline: record.timeline,
    detail: record.detail
  };
}

export function buildOrderRecordsFallback(audience = 'enterprise', tab = 'all') {
  const collection = getRecordCollection(audience);
  const items = collection.records.map((record) => buildListItem(audience, record));
  const normalizedTab = tab === 'ongoing' || tab === 'completed' ? tab : 'all';
  const filteredItems = normalizedTab === 'all'
    ? items
    : items.filter((item) => item.statusKey === normalizedTab);
  const ongoingCount = items.filter((item) => item.statusKey === 'ongoing').length;
  const completedCount = items.filter((item) => item.statusKey === 'completed').length;
  const latest = items[0] || {};

  return {
    role: audience,
    title: collection.title,
    summary: {
      title: collection.title,
      description: collection.lead,
      total: items.length,
      ongoing: ongoingCount,
      completed: completedCount,
      activeTab: normalizedTab === 'all' ? '全部' : normalizedTab === 'ongoing' ? '进行中' : '已完成',
      latestTaskId: latest.taskId || '',
      latestTitle: latest.title || '',
      latestUpdatedAt: latest.updatedAt || ''
    },
    tabs: [
      { key: 'all', label: '全部', count: items.length, active: normalizedTab === 'all' },
      { key: 'ongoing', label: '进行中', count: ongoingCount, active: normalizedTab === 'ongoing' },
      { key: 'completed', label: '已完成', count: completedCount, active: normalizedTab === 'completed' }
    ],
    activeTab: normalizedTab,
    items: filteredItems
  };
}

export function buildOrderRecordDetailFallback(audience = 'enterprise', recordId = '') {
  const collection = getRecordCollection(audience);
  const baseRecord = getRecordById(audience, recordId);
  if (!baseRecord) {
    return {
      role: audience,
      title: collection.title,
      summary: {},
      record: null
    };
  }

  const listItem = buildListItem(audience, baseRecord);
  return {
    role: audience,
    title: collection.title,
    summary: {
      title: listItem.title,
      taskId: listItem.taskId,
      statusGroup: listItem.statusGroup,
      stage: listItem.stage,
      amountLabel: listItem.amountLabel,
      amountValue: listItem.amountValue,
      ratingLabel: listItem.rating.label,
      ratingValue: listItem.rating.value,
      updatedAt: listItem.updatedAt,
      route: listItem.route
    },
    record: {
      ...listItem,
      found: true,
      task: {
        title: baseRecord.title,
        budget: formatMoney(baseRecord.amount),
        period: formatDateRangeLabel(baseRecord.startDate, baseRecord.endDate),
        brief: baseRecord.detail,
        tags: baseRecord.tags
      },
      taskConfirmation: {
        status: baseRecord.status,
        summary: baseRecord.summary,
        updatedAt: baseRecord.endDate || baseRecord.startDate,
        history: baseRecord.timeline.map((step) => ({
          action: step.title,
          note: step.note,
          time: step.time
        }))
      },
      timeline: baseRecord.timeline,
      progressFeed: [],
      aiReviewHistory: [],
      assetLibrary: [],
      reviews: [],
      notes: [
        `任务名称：${baseRecord.title}`,
        `当前状态：${baseRecord.status}`,
        `${audience === 'talent' ? '企业评级' : '我的评级'}：${formatGrade(baseRecord.myGrade)}`
      ],
      sections: {
        brief: baseRecord.detail,
        deliverables: [],
        taskTags: baseRecord.tags,
        confirmationHistory: baseRecord.timeline,
        progressFeed: [],
        assetLibrary: [],
        aiReviewHistory: [],
        reviews: []
      }
    }
  };
}
