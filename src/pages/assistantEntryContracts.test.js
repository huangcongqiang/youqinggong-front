import fs from 'node:fs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const source = fs.readFileSync(new URL('./AssistantPage.vue', import.meta.url), 'utf8');

assert(
  source.includes('assistant-entry-shell')
    && source.includes('assistant-entry-priority')
    && source.includes('assistant-entry-secondary-grid')
    && source.includes('选择这次要让 AI 帮你完成的动作')
    && source.includes('进入真实发任务流程')
    && source.includes('任务拆分')
    && source.includes('人才匹配')
    && source.includes('消息起草')
    && source.includes('验收说明')
    && source.includes('记录总结'),
  'AssistantPage should become a simple enterprise entry surface instead of a mixed landing/workspace/error page.'
);

assert(
  source.includes('assistant-tool-shell')
    && source.includes('const toolConfigs = {')
    && source.includes('quickPrompts')
    && source.includes('applyQuickPrompt')
    && source.includes('assistant-quick-prompt-list')
    && source.includes("'task-breakdown'")
    && source.includes("'talent-fit'")
    && source.includes("'message-draft'")
    && source.includes("'review-draft'")
    && source.includes("'record-summary'")
    && source.includes('activeToolConfig')
    && source.includes('handlePrimaryAction')
    && source.includes('开始拆分')
    && source.includes('开始生成')
    && source.includes('带到发布流程')
    && source.includes('带到消息页')
    && source.includes('带到验收页')
    && source.includes('带到合作记录')
    && source.includes('analysisResult')
    && source.includes('normalizedModules'),
  'AssistantPage should provide single-purpose tool pages for task breakdown, talent fit, message drafting, review drafting, and record summary instead of sending most cards away to unrelated pages.'
);

assert(
  !source.includes('Choose context')
    && !source.includes('Attach Assistant to')
    && !source.includes('请先从一个真实上下文页面打开 AI 助手')
    && !source.includes('先选择 AI 助手要附着的页面。'),
  'AssistantPage should remove the old context-attachment landing copy and error-like empty state.'
);
