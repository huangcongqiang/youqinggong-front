import fs from 'node:fs'
import assert from 'assert'

const messages = fs.readFileSync('/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/MessagesPage.vue', 'utf8')
const workspace = fs.readFileSync('/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/WorkspacePage.vue', 'utf8')

;[
  '当前合同还没有消息',
  '下一条消息',
  '草稿已经带入当前会话，确认后再发送。',
  '发送消息',
  '当前消息暂时不可用',
  '请先选择一份合同，再发送消息。',
  '当前暂时无法发送这条消息。',
  '选择一条合同会话，继续查看消息。'
].forEach((snippet) => assert.ok(messages.includes(snippet), 'Messages shell should include: ' + snippet))

;[
  'No contract messages yet',
  'Next message',
  'Messages unavailable',
  'Could not open a contract room right now.',
  '文件与下一步',
  '切换合同',
  '还有 {{ sidebarRooms.length }} 份合同已收起',
  '选择一条合同会话，在上下文里查看消息。'
].forEach((snippet) => assert.ok(!messages.includes(snippet), 'Messages shell should not keep older English copy: ' + snippet))

;[
  '当前合同概览暂时不可用',
  '先在这里推进合同；只有在需要实时沟通细节时再打开消息。',
  '验收与结算概览',
  '等待同步',
  '添加进展',
  '@click.stop="openProgressDialog(node)"',
  '<section v-if="isEnterprise" class="workspace-card workspace-card--composer">',
  'class="progress-dialog-backdrop"',
  'aria-labelledby="progress-dialog-title"',
  '收起编辑器',
  '请输入有效进度，例如 68% 或 68。',
  '先补上进展说明，再提交。',
  '当前合同概览暂时无法同步。',
  '当前暂时无法提交这条进展。',
  '当前暂时无法提交这条备注。'
].forEach((snippet) => assert.ok(workspace.includes(snippet), 'Workspace shell should include: ' + snippet))

;[
  'Contract overview unavailable',
  'Review and settlement snapshot',
  'Awaiting sync',
  'The contract overview could not sync.',
  'Hide editor',
  'Enter a valid completion value, such as 68% or 68.',
  'Add the update summary before submitting.',
  'Click to open this contract.',
  'Contract asset',
  '提交一条里程碑进展',
  '打开进展编辑器',
  '把里程碑进展继续挂在这份合作下，概览先聚焦当前合同。'
].forEach((snippet) => assert.ok(!workspace.includes(snippet), 'Workspace shell should not keep older English copy: ' + snippet))

console.log('messages/workspace shell copy stays localized and owner-first.')
