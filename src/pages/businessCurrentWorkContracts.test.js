import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const source = fs.readFileSync(
  path.resolve('/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/BusinessPage.vue'),
  'utf8'
);

assert(
  source.includes("if (activeContracts.value.length && recentMessages.value.length) {")
    && source.includes("return 'dual'")
    && source.includes("secondaryRoute = item?.messageRoute || roleRouteMap.enterprise.messages")
    && source.includes("secondaryCta: '打开消息'")
    && source.includes("workspaceRoute: routeForWorkspace(item)")
    && source.includes("secondaryRoute = item?.workspaceRoute || roleRouteMap.enterprise.contracts")
    && source.includes("secondaryCta: '打开工作区'")
    && source.includes("secondaryCta: item?.workspaceRoute ? '打开工作区' : '打开合同'"),
  'Desktop BusinessPage should keep contract and message lead cards owner-first, add a dual lead-state when both signals exist, and avoid falling back to generic \"view all\" actions.'
);

assert(
  source.includes(":class=\"item.kind ? `priority-item--${item.kind}` : ''\"")
    && source.includes('class="priority-dual-grid"')
    && source.includes('const dualContractWorkCards = computed(() => currentWorkCards.value.filter((item) => item.kind === \'contract\'))')
    && source.includes('const dualMessageWorkCards = computed(() => currentWorkCards.value.filter((item) => item.kind === \'message\'))')
    && source.includes('合同工作区')
    && source.includes('消息线程')
    && source.includes("eyebrow: '合同工作区'")
    && source.includes("eyebrow: '消息线程'")
    && source.includes('const existingMeta = Array.isArray(item?.meta)')
    && source.includes("compactText(item?.time || item?.timeLabel || item?.updatedAt || '', 32)")
    && source.includes("currentWorkMode.value === 'contracts'")
    && source.includes("`${currentWorkCards.value.length} 条合同`")
    && source.includes("currentWorkMode.value === 'messages'")
    && source.includes("`${currentWorkCards.value.length} 条会话`")
    && source.includes("currentWorkMode.value === 'dual'")
    && source.includes("`${Math.min(activeContracts.value.length, 2)} 条合同 · ${Math.min(recentMessages.value.length, 2)} 条会话`"),
  'Desktop BusinessPage should visually and numerically distinguish contract cards from message cards, including a dual lead-state with separate contract and message lanes instead of one generic open-items list.'
);

assert(
  source.includes(":class=\"{ 'workspace-secondary-grid--single': !showHiringInboxPanel || !showSummaryRail }\"")
    && source.includes('const showHiringInboxPanel = computed(() =>')
    && source.includes("inboundItems.value.length > 0 || !showContractMessageLeadState.value"),
  'Desktop BusinessPage should hide an empty hiring inbox when contracts or messages are the real lead state instead of leaving a dead queue panel in the main work strip.'
);
