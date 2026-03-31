import { normalizeWorkspacePayload, WORKSPACE_TASK_MISMATCH_MESSAGE } from './workspacePayload.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nexpected: ${expected}\nactual: ${actual}`);
  }
}

const fallback = {
  taskOptions: [],
  summary: {
    taskId: 'task-002',
    status: '待开始'
  },
  taskDetail: null,
  focus: '等待任务进入协作空间',
  collaborationNodes: [],
  pulse: [],
  executionChecklist: [],
  progressFeed: [],
  assetLibrary: [],
  aiReviewHistory: [],
  reviewHistory: [],
  supportOptions: [],
  acceptance: []
};

const mismatched = normalizeWorkspacePayload(
  {
    summary: {
      taskId: 'task-001',
      status: '协作中'
    },
    taskDetail: {
      taskId: 'task-001',
      title: '旧任务'
    },
    taskOptions: [
      {
        taskId: 'task-001',
        title: '旧任务'
      }
    ],
    collaborationNodes: [
      {
        nodeId: 'node-1',
        title: '旧节点'
      }
    ]
  },
  fallback,
  'task-002'
);

assertEqual(
  mismatched.requestError,
  WORKSPACE_TASK_MISMATCH_MESSAGE,
  'normalizeWorkspacePayload should flag task mismatches even when enterprise collections exist'
);
assertEqual(
  mismatched.requestStatus,
  409,
  'normalizeWorkspacePayload should expose 409 status for mismatched task payloads'
);
assertEqual(
  mismatched.summary.taskId,
  'task-002',
  'normalizeWorkspacePayload should keep the requested task id when the payload task mismatches'
);
assertEqual(
  mismatched.taskOptions.length,
  0,
  'normalizeWorkspacePayload should drop mismatched task collections instead of rendering another task'
);
assertEqual(
  mismatched.collaborationNodes.length,
  0,
  'normalizeWorkspacePayload should drop mismatched collaboration nodes'
);

const matching = normalizeWorkspacePayload(
  {
    summary: {
      taskId: 'task-002',
      status: '协作中'
    },
    taskDetail: {
      taskId: 'task-002',
      title: '当前任务'
    },
    taskOptions: [
      {
        taskId: 'task-002',
        title: '当前任务'
      }
    ],
    collaborationNodes: [
      {
        nodeId: 'node-2',
        title: '当前节点'
      }
    ]
  },
  fallback,
  'task-002'
);

assert(!matching.requestError, 'normalizeWorkspacePayload should not attach mismatch errors for matching tasks');
assertEqual(matching.taskOptions.length, 1, 'normalizeWorkspacePayload should preserve matching task collections');
assertEqual(
  matching.collaborationNodes.length,
  1,
  'normalizeWorkspacePayload should preserve matching collaboration nodes'
);
