import assert from 'assert'
import {
  buildSignals,
  buildTaskApplyLocation,
  buildTaskBrowseLocation,
  buildTaskDetailLocation,
  buildBrowseQuery,
  deriveProposalState,
  parseSelectedFilters,
  buildFilterQuery,
} from './taskMarketSurfaceState.js'

const filters = [{ label: 'Type', items: ['Hourly', 'Fixed'] }]
const parsed = parseSelectedFilters({ filter_type: ['Hourly'] }, filters)
assert.deepEqual(parsed, { Type: ['Hourly'] })
assert.deepEqual(buildFilterQuery(parsed, filters), { filter_type: ['Hourly'] })

const detailQuery = buildTaskBrowseLocation({ q: 'designer', filter_type: ['Hourly'], junk: 'x' }, { taskId: 'task-1' }).query
assert.equal(detailQuery.q, 'designer')
assert.deepEqual(detailQuery.filter_type, ['Hourly'])
assert.equal(detailQuery.taskId, 'task-1')
assert.equal(detailQuery.junk, undefined)
assert.equal(buildBrowseQuery({ q: 'designer', sort: 'recent', filter_type: ['Hourly'], junk: 'x' }, {}).sort, 'recent')

const taskDetailLocation = buildTaskDetailLocation('task-1', { q: 'designer', sort: 'recent', filter_type: ['Hourly'] })
assert.equal(taskDetailLocation.path, '/talent/tasks/task-1')
assert.equal(taskDetailLocation.query.sort, 'recent')
assert.equal(taskDetailLocation.query.taskId, 'task-1')

const applyLocation = buildTaskApplyLocation('task-1', { q: 'designer', filter_type: ['Hourly'] })
assert.equal(applyLocation.path, '/talent/tasks/task-1/apply')
assert.equal(applyLocation.query.taskId, 'task-1')

const signals = buildSignals({
  deliverables: ['需求分析与品牌定位', '概念草图与创意构思', '数字化设计与优化']
})
assert.equal(
  signals.find((item) => item.title === '交付内容')?.note,
  '需求分析与品牌定位 / 概念草图与创意构思 / 数字化设计与优化'
)
assert.equal(
  buildSignals({
    deliverables: '["脚本梳理","视频剪辑","发布复盘"]'
  }).find((item) => item.title === '交付内容')?.note,
  '脚本梳理 / 视频剪辑 / 发布复盘'
)

const state = deriveProposalState({
  job: {
    taskId: 'task-1',
    briefAvailable: true,
    applicationStatus: '',
    actionLabel: '',
    actionNote: '',
    actionDisabled: false,
    actionRoomKey: ''
  },
  draft: {
    coverLetter: 'I can help',
    proposedRate: '$40/hr',
    availability: '',
    startDate: '',
    proof: '',
    notes: '',
    responses: { 'Q1': 'Answer' }
  },
  selectedQuestions: ['Q1'],
  selectedSignals: [{ title: 'Fit', note: 'Strong' }],
  submittedAt: '',
  submittedRoomKey: ''
})

assert.equal(state.canSubmit, true)
assert.equal(state.primaryAction, 'submit')
assert.equal(state.stateLabel, '可以提交')
