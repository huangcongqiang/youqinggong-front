import fs from 'node:fs'
import assert from 'assert'

const source = fs.readFileSync('/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/AssistantPage.vue', 'utf8')

assert.ok(
  source.includes('const hasAttachedContext = computed(() => (')
    && source.includes('assistantContextTitle.value')
    && source.includes('assistantContextPartner.value')
    && source.includes('assistantContextMeta.value.length')
    && source.includes('attachedRecordId.value')
    && source.includes('attachedTaskId.value')
    && source.includes('attachedRoomKey.value'),
  'Assistant should treat standalone taskId, recordId, or roomKey as attached context instead of requiring a full dedicated route shell.'
)

assert.ok(
  source.includes("if (hasAttachedContext.value && preferredContextTool.value) return preferredContextTool.value;"),
  'Assistant should auto-open a context-aware tool instead of falling back to the generic entry shell when task context is already attached.'
)

assert.ok(
  source.includes("if (surface.includes('messages') || surface.includes('chat')) return 'message-draft';")
    && source.includes("if (surface.includes('acceptance') || surface.includes('review')) return 'review-draft';")
    && source.includes("if (surface.includes('record') || surface.includes('history') || surface.includes('contract') || surface.includes('workspace') || surface.includes('settlement')) return 'record-summary';")
    && source.includes("if (surface.includes('matching') || surface.includes('recruiting') || surface.includes('application') || surface.includes('opportunity')) {"),
  'Assistant should map message, acceptance, record/workspace, and recruiting surfaces to the matching single-purpose tool pages.'
)

assert.ok(
  source.includes('const assistantSurface = computed(() => (queryText(\'assistantSurface\') || queryText(\'surface\') || queryText(\'source\')).toLowerCase());')
    && source.includes('const preferredContextTool = computed(() => {'),
  'Assistant should derive context behavior from the attached surface/source instead of relying on the old settlement card structure.'
)

assert.ok(
  source.includes('const nextTool = seedText')
    && source.includes('preferredContextTool.value')
    && source.includes('tool: nextTool'),
  'Assistant should persist the inferred context tool into the route query so refreshes stay on the right tool page.'
)

console.log('assistant context contracts ok')
