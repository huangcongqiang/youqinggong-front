import { getIntlLocale } from '../utils/uiLocale.js'

const STORAGE_KEY = 'yqg:talent-proposal-drafts:v1'

export function createEmptyMarketplace() {
  return {
    summary: {
      title: '任务',
      description: '先看任务说明，再比较可信信号，然后打开详情决定是否申请。',
    },
    items: [],
    filterGroups: [],
    metrics: [],
  }
}

export function createEmptyProposalDraft() {
  return {
    coverLetter: '',
    proposedRate: '',
    availability: '',
    startDate: '',
    proof: '',
    notes: '',
    responses: {},
  }
}

export function isUniversalFilterOption(option) {
  const normalized = String(option || '').trim().toLowerCase()
  return ['all', '全部', 'any', '不限'].includes(normalized)
}

export function filterQueryKey(label) {
  return `filter_${String(label || 'filters')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'filters'}`
}

export function serializeSelectedFilters(filters) {
  return Object.entries(filters || {})
    .map(([label, items]) => [
      String(label || '').trim(),
      Array.isArray(items)
        ? items.map((item) => String(item || '').trim()).filter(Boolean).sort()
        : [],
    ])
    .filter(([, items]) => items.length)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, items]) => `${label}:${items.join('|')}`)
    .join('||')
}

export function buildFilterQuery(filters = {}, filterGroups = []) {
  return filterGroups.reduce((accumulator, group) => {
    const values = Array.isArray(filters?.[group.label])
      ? filters[group.label]
        .map((item) => String(item || '').trim())
        .filter((item) => item && !isUniversalFilterOption(item))
      : []
    if (values.length) {
      accumulator[filterQueryKey(group.label)] = values
    }
    return accumulator
  }, {})
}

export function parseSelectedFilters(query = {}, filterGroups = []) {
  return filterGroups.reduce((accumulator, group) => {
    const queryKey = filterQueryKey(group.label)
    const rawValue = query?.[queryKey]
    const rawItems = Array.isArray(rawValue)
      ? rawValue
      : rawValue
        ? [rawValue]
        : []
    const matchedItems = rawItems
      .flatMap((item) => String(item || '').split(','))
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .map((item) => {
        const normalized = item.toLowerCase()
        return group.items.find((option) => String(option || '').trim().toLowerCase() === normalized) || ''
      })
      .filter((item) => item && !isUniversalFilterOption(item))
    if (matchedItems.length) {
      accumulator[group.label] = Array.from(new Set(matchedItems))
    }
    return accumulator
  }, {})
}

export function buildBrowseQuery(currentQuery = {}, overrides = {}) {
  const next = {}
  Object.entries(currentQuery || {}).forEach(([key, value]) => {
    if (key === 'q' || key === 'taskId' || key === 'sort' || key.startsWith('filter_')) {
      next[key] = value
    }
  })
  Object.entries(overrides || {}).forEach(([key, value]) => {
    if (value == null || value === '' || (Array.isArray(value) && !value.length)) {
      delete next[key]
      return
    }
    next[key] = value
  })
  return next
}

export function buildTaskBrowseLocation(currentQuery = {}, overrides = {}) {
  return {
    path: '/talent/tasks',
    query: buildBrowseQuery(currentQuery, overrides)
  }
}

export function buildTaskDetailLocation(taskId, currentQuery = {}) {
  return {
    path: `/talent/tasks/${encodeURIComponent(String(taskId || '').trim())}`,
    query: buildBrowseQuery(currentQuery, { taskId: String(taskId || '').trim() })
  }
}

export function buildTaskApplyLocation(taskId, currentQuery = {}) {
  return {
    path: `/talent/tasks/${encodeURIComponent(String(taskId || '').trim())}/apply`,
    query: buildBrowseQuery(currentQuery, { taskId: String(taskId || '').trim() })
  }
}

export function formatWorkspaceTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : ''
  return new Intl.DateTimeFormat(getIntlLocale(), getIntlLocale() === 'zh-CN' ? {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  } : {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function readProposalDraftStore() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function writeProposalDraftStore(store) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // local drafts are best-effort only
  }
}

export function readStoredProposalDraft(taskKey) {
  const store = readProposalDraftStore()
  const saved = store[String(taskKey || '').trim()] || createEmptyProposalDraft()
  const restoredResponses = saved.responses && typeof saved.responses === 'object'
    ? saved.responses
    : Array.isArray(saved.answers)
      ? saved.answers.reduce((accumulator, item) => {
          const question = String(item?.question || '').trim()
          const answer = String(item?.answer || '').trim()
          if (question && answer) {
            accumulator[question] = answer
          }
          return accumulator
        }, {})
      : {}

  return {
    coverLetter: saved.coverLetter || '',
    proposedRate: saved.proposedRate || '',
    availability: saved.availability || '',
    startDate: saved.startDate || '',
    proof: saved.proof || '',
    notes: saved.notes || '',
    responses: { ...restoredResponses },
    submittedAt: saved.submittedAt || '',
    submittedRoomKey: saved.submittedRoomKey || '',
    savedAt: saved.savedAt ? formatWorkspaceTimestamp(saved.savedAt) : '',
  }
}

export function buildProposalDraftSnapshot(draft = {}, selectedQuestions = []) {
  const answers = selectedQuestions
    .map((question) => ({ question, answer: String(draft.responses?.[question] || '').trim() }))
    .filter((item) => item.answer)
  return {
    coverLetter: String(draft.coverLetter || '').trim(),
    proposedRate: String(draft.proposedRate || '').trim(),
    availability: String(draft.availability || '').trim(),
    startDate: String(draft.startDate || '').trim(),
    proof: String(draft.proof || '').trim(),
    notes: String(draft.notes || '').trim(),
    responses: answers.reduce((accumulator, item) => {
      accumulator[item.question] = item.answer
      return accumulator
    }, {}),
  }
}

export function persistProposalDraft(taskKey, snapshot, options = {}) {
  const safeTaskKey = String(taskKey || '').trim()
  if (!safeTaskKey) return ''
  const store = readProposalDraftStore()
  const savedAtIso = new Date().toISOString()
  store[safeTaskKey] = {
    ...snapshot,
    savedAt: savedAtIso,
    ...(options.submittedAt ? { submittedAt: options.submittedAt } : {}),
    ...(options.submittedRoomKey ? { submittedRoomKey: options.submittedRoomKey } : {}),
  }
  writeProposalDraftStore(store)
  return formatWorkspaceTimestamp(savedAtIso)
}

function formatDeliverables(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean).join(' / ')
  }

  const text = String(value || '').trim()
  if (!text) {
    return ''
  }

  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || '').trim()).filter(Boolean).join(' / ')
    }
  } catch {}

  return text
}

export function buildSignals(item) {
  const signals = []
  const deliverables = formatDeliverables(item?.deliverables || item?.expectedDeliverables || item?.deliverable)
  if (item?.matchNote || item?.matchReason) {
    signals.push({ title: '匹配原因', note: item.matchNote || item.matchReason })
  }
  if (item?.clientSize || item?.businessSize) {
    signals.push({ title: '企业规模', note: item.clientSize || item.businessSize })
  }
  if (deliverables) {
    signals.push({ title: '交付内容', note: deliverables })
  }
  if (item?.deadline || item?.dueDate) {
    signals.push({ title: '时间安排', note: item.deadline || item.dueDate })
  }
  if (item?.responseTime) {
    signals.push({ title: '响应速度', note: item.responseTime })
  }
  if (item?.paymentVerified) {
    signals.push({ title: '付款已验证', note: '企业已经验证付款方式。' })
  }
  if (item?.clientSpend || item?.totalSpent) {
    signals.push({ title: '企业支出', note: item.clientSpend || item.totalSpent })
  }
  if (item?.hireRate) {
    signals.push({ title: '雇佣率', note: item.hireRate })
  }
  if (item?.proposals) {
    signals.push({ title: '申请活跃度', note: item.proposals })
  }
  if (item?.openJobs) {
    signals.push({ title: '开放中的任务', note: item.openJobs })
  }
  return signals.slice(0, 5)
}

export function normalizeJobItem(item, index) {
  const rawBrief = String(item?.summary || item?.brief || item?.description || '').trim()
  const placeholderBrief = ['待补充任务说明', 'brief pending', 'pending brief', 'description pending'].some((placeholder) => rawBrief.toLowerCase().includes(placeholder.toLowerCase()))
  const action = item?.action && typeof item.action === 'object' ? item.action : {}
  return {
    id: String(item?.id || item?.taskId || index),
    taskId: String(item?.taskId || item?.id || ''),
    title: item?.title || '未命名任务',
    company: item?.company || item?.businessName || '企业未公开',
    summary: rawBrief || '先打开详情，再决定是否申请。',
    briefAvailable: Boolean(rawBrief) && !placeholderBrief,
    budget: item?.budget || '预算未公开',
    period: item?.period || item?.duration || '周期未公开',
    match: item?.match || item?.matchLabel || '匹配度',
    matchNote: item?.matchNote || item?.matchReason || '',
    tags: Array.isArray(item?.tags) ? item.tags.slice(0, 6).filter(Boolean) : [],
    category: item?.category || item?.jobType || '',
    jobType: item?.jobType || item?.type || item?.category || '未公开',
    location: item?.location || item?.region || '',
    responseTime: item?.responseTime || item?.response || '',
    questions: Array.isArray(item?.questions) ? item.questions.filter(Boolean) : Array.isArray(item?.screeningQuestions) ? item.screeningQuestions.filter(Boolean) : [],
    applicationStatus: String(item?.applicationStatus || item?.application?.status || action?.status || '').trim().toUpperCase(),
    actionLabel: String(action?.label || action?.cta || '').trim(),
    actionNote: String(action?.note || action?.message || '').trim(),
    actionDisabled: Boolean(action?.disabled),
    actionRoomKey: String(action?.roomKey || action?.room?.roomKey || action?.room?.key || '').trim(),
    signals: buildSignals(item),
  }
}

export function normalizeMarketplace(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  return {
    ...createEmptyMarketplace(),
    ...source,
    summary: {
      ...createEmptyMarketplace().summary,
      ...(source.summary || {}),
    },
    items: Array.isArray(source.items) ? source.items : [],
    filterGroups: Array.isArray(source.filterGroups) || (source.filterGroups && typeof source.filterGroups === 'object') ? source.filterGroups : [],
    metrics: Array.isArray(source.metrics) ? source.metrics : [],
  }
}

export function buildStructuredFilterCandidates(item) {
  return [
    item?.company,
    item?.category,
    item?.jobType,
    item?.location,
    item?.match,
    ...(Array.isArray(item?.tags) ? item.tags : []),
    ...(Array.isArray(item?.signals) ? item.signals.flatMap((signal) => [signal?.title, signal?.note]) : []),
  ]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean)
}

export function filterMarketplaceItems(items, keyword, selectedFilters) {
  const q = String(keyword || '').trim().toLowerCase()
  const activeFilters = Object.values(selectedFilters || {})
    .flatMap((values) => Array.isArray(values) ? values : [values])
    .map((item) => String(item || '').trim().toLowerCase())
    .filter((item) => item && !isUniversalFilterOption(item))

  const byQuery = q
    ? items.filter((item) => {
        const bag = [item.title, item.company, item.summary, item.tags.join(' '), item.category, item.match, item.location, item.jobType]
          .join(' ')
          .toLowerCase()
        return bag.includes(q)
      })
    : items

  return activeFilters.length
    ? byQuery.filter((item) => {
        const candidates = buildStructuredFilterCandidates(item)
        return activeFilters.every((filter) => candidates.includes(filter))
      })
    : byQuery
}

export function buildProposalChecklist({ job, draft, selectedQuestions = [], selectedSignals = [] }) {
  if (!job) return []
  const safeDraft = draft || createEmptyProposalDraft()
  const 已回答QuestionsCount = selectedQuestions.filter((question) => String(safeDraft.responses?.[question] || '').trim()).length
  return [
    {
      label: '已查看机会',
      note: job.briefAvailable
        ? '任务详情已经可见，可以开始查看。'
        : '这条任务已经选中，但完整说明还没有同步过来。',
      checked: Boolean(job),
      required: false,
    },
    {
      label: '已查看可信信号',
      note: selectedSignals.length ? `${selectedSignals.length} 条信号可供查看。` : '当前还没有可见的可信信号。',
      checked: selectedSignals.length > 0,
      required: false,
    },
    {
      label: '已写求职说明',
      note: safeDraft.coverLetter.trim() ? '求职说明已经准备好。' : '提交前先补一段简短的求职说明。',
      checked: Boolean(safeDraft.coverLetter.trim()),
      required: true,
    },
    {
      label: '已填写报价',
      note: safeDraft.proposedRate.trim() ? safeDraft.proposedRate.trim() : '先填写你的报价或费率。',
      checked: Boolean(safeDraft.proposedRate.trim()),
      required: true,
    },
    {
      label: '已确认可用时间',
      note: safeDraft.availability.trim() ? safeDraft.availability.trim() : '补充你当前的可用时间。',
      checked: Boolean(safeDraft.availability.trim()),
      required: false,
    },
    {
      label: '已填写开始时间',
      note: safeDraft.startDate.trim() ? safeDraft.startDate.trim() : '补充最早可开始的时间。',
      checked: Boolean(safeDraft.startDate.trim()),
      required: false,
    },
    {
      label: '筛选问题已完成',
      note: selectedQuestions.length ? `${已回答QuestionsCount}/${selectedQuestions.length} 已回答` : '这条任务不要求回答。',
      checked: !selectedQuestions.length || 已回答QuestionsCount === selectedQuestions.length,
      required: true,
    },
  ]
}

export function deriveProposalState({ job, draft, selectedQuestions = [], selectedSignals = [], submittedAt = '', submittedRoomKey = '' }) {
  if (!job) {
    return {
      stateLabel: '先选择任务',
      nextStep: '先选择任务',
      readOnly: false,
      canSubmit: false,
      primaryActionLabel: '先选择任务',
      primaryAction: 'none',
      primaryDisabled: true,
      submitHint: '先选择任务再继续。',
      checklist: []
    }
  }

  const checklist = buildProposalChecklist({ job, draft, selectedQuestions, selectedSignals })
  const requiredChecklist = checklist.filter((item) => item.required !== false)
  const serverProposalState = String(job.applicationStatus || '').trim().toUpperCase()
  const serverProposalActionLabel = String(job.actionLabel || '').trim()
  const serverProposalActionNote = String(job.actionNote || '').trim()
  const serverProposalActionDisabled = Boolean(job.actionDisabled)
  const serverProposalRoomKey = String(job.actionRoomKey || '').trim()
  const serverProposalSubmitted = ['REQUESTED', 'SUBMITTED', 'PENDING', 'SELECTED', 'SHORTLISTED', 'INTERVIEWING', 'INTERVIEW', 'OFFERED', 'HIRED', 'ACTIVE'].includes(serverProposalState)
  const serverProposalConversationOpen = Boolean(serverProposalRoomKey) && ['REQUESTED', 'SUBMITTED', 'PENDING'].includes(serverProposalState)
  const serverProposalLocked = ['BLOCKED', 'VIEW_ONLY', 'CLOSED', 'WITHDRAWN', 'DECLINED', 'ARCHIVED'].includes(serverProposalState)
    || (serverProposalActionDisabled && !serverProposalRoomKey && !serverProposalSubmitted)
  const localProposalAwaitingReview = Boolean(submittedAt) && !submittedRoomKey && !serverProposalSubmitted && !serverProposalRoomKey
  const localProposalConversationOpen = Boolean(submittedAt && submittedRoomKey) && !serverProposalSubmitted && !serverProposalLocked
  const canSubmit = requiredChecklist.every((item) => item.checked) && !serverProposalSubmitted && !serverProposalLocked

  let stateLabel = '草稿未开始'
  if (['HIRED', 'ACTIVE'].includes(serverProposalState)) stateLabel = '已进入合同'
  else if (['OFFERED', 'INTERVIEWING', 'INTERVIEW'].includes(serverProposalState)) stateLabel = '沟通中'
  else if (serverProposalState === 'SHORTLISTED') stateLabel = '已入围'
  else if (serverProposalState === 'SELECTED') stateLabel = '已被客户选中'
  else if (serverProposalConversationOpen) stateLabel = '已进入消息'
  else if (serverProposalSubmitted) stateLabel = '已提交'
  else if (serverProposalLocked) stateLabel = serverProposalActionLabel || '当前不开放申请'
  else if (localProposalConversationOpen) stateLabel = '已进入消息'
  else if (localProposalAwaitingReview) stateLabel = '等待客户回复'
  else if (submittedAt) stateLabel = '已提交'
  else if (canSubmit) stateLabel = '可以提交'
  else if (checklist.some((item) => item.checked)) stateLabel = '草稿进行中'

  let nextStep = '提交申请'
  if (['HIRED', 'ACTIVE'].includes(serverProposalState)) nextStep = '打开合同'
  else if (['OFFERED', 'INTERVIEWING', 'INTERVIEW'].includes(serverProposalState)) nextStep = serverProposalRoomKey ? '打开消息' : '查看客户回复'
  else if (serverProposalState === 'SHORTLISTED') nextStep = serverProposalRoomKey ? '打开消息' : '等待客户回复'
  else if (serverProposalState === 'SELECTED') nextStep = serverProposalRoomKey ? '打开消息' : '查看客户选择'
  else if (serverProposalConversationOpen || localProposalConversationOpen || submittedRoomKey) nextStep = '打开消息'
  else if (serverProposalSubmitted) nextStep = serverProposalActionNote || '等待客户审核'
  else if (serverProposalLocked) nextStep = serverProposalActionNote || '先查看这条任务'
  else if (localProposalAwaitingReview || submittedAt) nextStep = '等待客户审核'
  else if (!canSubmit) {
    const missing = requiredChecklist.filter((item) => !item.checked)
    nextStep = `还差 ${missing[0]?.label || '剩余资料'}`
  }

  let primaryAction = 'submit'
  let primaryActionLabel = '提交申请'
  let primaryDisabled = !canSubmit

  if (['HIRED', 'ACTIVE'].includes(serverProposalState)) {
    primaryAction = 'contract'
    primaryActionLabel = '打开合同'
    primaryDisabled = false
  } else if (serverProposalConversationOpen || localProposalConversationOpen || submittedRoomKey) {
    primaryAction = 'messages'
    primaryActionLabel = '打开消息'
    primaryDisabled = false
  } else if (serverProposalSubmitted || localProposalAwaitingReview || serverProposalLocked) {
    primaryAction = 'none'
    primaryActionLabel = nextStep
    primaryDisabled = true
  }

  let submitHint = '准备好后打开申请页继续提交。'
  if (primaryAction === 'contract') {
    submitHint = '这条申请已经进入合同，请到合同页继续。'
  } else if (primaryAction === 'messages') {
    submitHint = '这条申请已经打开实时会话，请到消息里继续。'
  } else if (serverProposalSubmitted || localProposalAwaitingReview) {
    submitHint = serverProposalActionNote || '对方已经收到这条申请，先等待下一步回复。'
  } else if (serverProposalLocked) {
    submitHint = serverProposalActionNote || '当前账号暂时不能继续申请这条任务。'
  } else if (canSubmit) {
    submitHint = '你的申请已经可以提交。'
  } else {
    const missing = requiredChecklist.filter((item) => !item.checked).map((item) => item.label)
    submitHint = `还需完成： ${missing.join(', ')}.`
  }

  return {
    checklist,
    requiredChecklist,
    serverProposalState,
    serverProposalRoomKey,
    serverProposalSubmitted,
    serverProposalConversationOpen,
    serverProposalLocked,
    localProposalAwaitingReview,
    localProposalConversationOpen,
    readOnly: serverProposalSubmitted || serverProposalLocked || localProposalAwaitingReview || localProposalConversationOpen,
    canSubmit,
    stateLabel,
    nextStep,
    primaryAction,
    primaryActionLabel,
    primaryDisabled,
    submitHint,
    progressPercent: requiredChecklist.length
      ? Math.round((requiredChecklist.filter((item) => item.checked).length / requiredChecklist.length) * 100)
      : 0,
  }
}
