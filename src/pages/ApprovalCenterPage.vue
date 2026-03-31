<template>
  <section v-if="page" class="page-stack approval-center-page desktop-center-page">
    <DesktopNotificationSummaryCard
      class="desktop-center-summary"
      eyebrow="企业端审批中心"
      title="先处理当前决策"
      :description="page.approvalHeadline || page.attentionHeadline || '集中处理当前待批事项。'"
      total-label="当前审批队列"
      :total-value="totalApprovalValue"
      total-note="先处理当前决策。"
      :stats="summaryStats"
      :highlights="summaryHighlights"
      highlight-title="要点"
      :primary-action="{ label: selectedPrimaryLabel, to: selectedPrimaryRoute }"
      :secondary-action="{ label: secondarySummaryLabel, to: secondarySummaryRoute }"
      @primary-action="goTo(selectedPrimaryRoute)"
      @secondary-action="goTo(secondarySummaryRoute)"
    />

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

    <article v-if="approvalCenterIssue" class="result-card stack-sm">
      <strong>审批中心已切换到兜底队列</strong>
      <p class="muted">{{ approvalCenterIssue }}</p>
    </article>

    <section class="approval-center-workbench desktop-center-workbench">
      <aside class="glass-panel approval-center-sidebar desktop-center-sidebar stack-md">
        <div class="stack-xs desktop-center-sidebar__head">
          <span class="eyebrow">审批分组</span>
          <h3>按分组处理</h3>
        </div>

        <div class="approval-center-group-list desktop-center-group-list">
          <button
            v-for="group in groupItems"
            :key="group.key"
            type="button"
            class="approval-center-group desktop-center-group"
            :class="{ 'is-active': activeGroup === group.key }"
            @click="setActiveGroup(group.key)"
          >
            <div class="stack-xs">
              <strong>{{ group.label }}</strong>
              <span class="muted">{{ group.note }}</span>
            </div>
            <span class="approval-center-group__count desktop-center-group__count">{{ group.count }}</span>
          </button>
        </div>
      </aside>

      <DesktopNotificationList
        class="desktop-center-list"
        eyebrow="当前审批"
        :title="listTitle"
        :description="listDescription"
        :items="filteredItems"
        :empty-title="emptyListTitle"
        :empty-description="emptyListDescription"
        :show-refresh="true"
        refresh-label="刷新队列"
        footer-note="先处理当前项。"
        :footer-actions="footerActions"
        @refresh="loadPage"
        @select="handleSelect"
        @action="handleAction"
        @footer-action="handleFooterAction"
      />

      <article class="glass-panel approval-center-context desktop-center-context stack-md">
        <div v-if="selectedItem" class="stack-md">
          <div class="stack-xs desktop-center-context__summary">
            <span class="eyebrow">当前决策摘要</span>
            <h3>{{ selectedItem.title }}</h3>
            <p class="muted">{{ selectedItem.summary }}</p>
          </div>

          <div class="approval-center-context__meta desktop-center-context__meta">
            <span class="soft-pill">{{ selectedItem.groupLabel }}</span>
            <span class="soft-pill">{{ selectedItem.status }}</span>
          </div>

          <section v-if="selectedDecisionActions.length" class="approval-center-context__section desktop-center-context__section stack-sm">
            <div class="stack-sm">
              <div class="stack-xs">
                <span class="eyebrow">动作</span>
              </div>
              <div class="approval-center-context__actions desktop-center-context__actions">
                <button
                  v-for="action in selectedDecisionActions"
                  :key="decisionActionKey(action)"
                  type="button"
                  :class="action.tone === 'primary' ? 'button-primary' : 'button-secondary'"
                  :disabled="actionPendingKey === decisionActionKey(action)"
                  @click="handleDecisionAction(action)"
                >
                  {{ actionPendingKey === decisionActionKey(action) ? '处理中…' : action.label }}
                </button>
              </div>
            </div>
          </section>

          <section class="approval-center-context__section desktop-center-context__section stack-sm">
            <div class="stack-xs">
              <span class="eyebrow">入口</span>
            </div>
            <div class="approval-center-context__actions desktop-center-context__actions">
              <button
                v-for="action in selectedContextActions"
                :key="action.key"
                type="button"
                :class="action.tone === 'primary' ? 'button-primary' : 'button-secondary'"
                @click="goTo(action.to)"
              >
                {{ action.label }}
              </button>
            </div>
          </section>

          <section class="approval-center-context__section desktop-center-context__section stack-sm">
            <div class="stack-xs">
              <span class="eyebrow">要点</span>
            </div>
            <ul class="approval-center-context__list desktop-center-context__list">
              <li v-for="item in selectedItem.highlights.slice(0, 2)" :key="`${selectedItem.id}-${item.label}`">
                <strong>{{ item.label }}</strong>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </section>

          <section class="approval-center-context__section desktop-center-context__section stack-sm">
            <div class="stack-xs">
              <span class="eyebrow">留痕</span>
            </div>
            <ul class="approval-center-context__list desktop-center-context__list">
              <li v-for="item in selectedItem.related.slice(0, 2)" :key="`${selectedItem.id}-${item.label}-${item.value}`">
                <strong>{{ item.label }}</strong>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </section>

          <article v-if="actionFeedback" class="result-card stack-sm">
            <strong>{{ actionFeedback.title }}</strong>
            <p class="muted">{{ actionFeedback.message }}</p>
          </article>
        </div>

        <div v-else class="approval-center-context__empty desktop-center-context__empty stack-sm">
          <strong>{{ selectedItemMissing ? '当前事项已处理或不可用' : '当前没有待审批事项' }}</strong>
          <p class="muted">
            {{
              selectedItemMissing
                ? '请重新选择事项，或切换分组后继续处理。'
                : '可以先去通知中心看普通更新。'
            }}
          </p>
          <div v-if="selectedItemMissing" class="approval-center-context__actions desktop-center-context__actions">
            <button
              v-for="action in invalidRecoveryActions"
              :key="action.key"
              type="button"
              :class="action.tone === 'primary' ? 'button-primary' : 'button-secondary'"
              @click="goTo(action.to)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LiveSyncStatusBar from '../components/LiveSyncStatusBar.vue';
import DesktopNotificationList from '../components/notifications/DesktopNotificationList.vue';
import DesktopNotificationSummaryCard from '../components/notifications/DesktopNotificationSummaryCard.vue';
import { getApprovalCenterData, submitEnterpriseApprovalAction } from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream';
import { buildCurrentObjectContextActions } from '../utils/attentionNavigation';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();

const page = ref(null);
const activeGroup = ref('confirmations');
const selectedItemId = ref('');
const selectedItemMissing = ref(false);
const actionPendingKey = ref('');
const actionFeedback = ref(null);
const liveSyncStatus = ref(null);
const liveSyncError = ref('');
let stopBusinessLiveSync = null;

function handleLiveSyncStatus(snapshot) {
  liveSyncStatus.value = snapshot ? { ...snapshot } : null;
  if (snapshot?.state === 'open') {
    liveSyncError.value = '';
  }
}

function handleLiveSyncError() {
  liveSyncError.value = '最近一次实时同步出现波动，页面会自动重连或切到轮询。';
}

const approvalCenterIssue = computed(() => {
  const rawIssue = String(page.value?.requestIssue || page.value?.requestError || '').trim();
  if (!rawIssue) {
    return '';
  }

  if (rawIssue.includes('Unknown path') && rawIssue.includes('/api/enterprise/approvals')) {
    return '审批数据暂时无法直连，已切换到本地兜底队列。';
  }

  if (rawIssue.includes('/api/enterprise/approvals')) {
    return '审批数据接口暂时不可用，已显示本地兜底队列。';
  }

  return '审批数据暂时未同步到最新版本，已显示本地兜底队列。';
});

const approvalGroupMeta = {
  confirmations: { label: '待确认', note: '先确认版本和工期。' },
  changes: { label: '待修改', note: '先收口修改意见。' },
  reviews: { label: '待评级 / 验收', note: '先处理验收和评级。' },
  cancellations: { label: '待取消', note: '先确认取消事项。' }
};

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function textOf(value, fallback = '') {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
}

function numberOf(value) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
}

function withSource(to, source = 'approvals') {
  if (!to) {
    return { path: roleRouteMap.enterprise.notifications, query: { source } };
  }

  if (typeof to === 'string') {
    if (to.includes('?')) {
      const [path, rawQuery = ''] = to.split('?');
      const query = Object.fromEntries(new URLSearchParams(rawQuery).entries());
      if (!query.source) {
        query.source = source;
      }
      return { path, query };
    }
    return { path: to, query: { source } };
  }

  const query = { ...(to.query || {}) };
  if (!query.source) {
    query.source = source;
  }
  return { ...to, query };
}

function routeQueryOf(routeLike) {
  if (!routeLike) {
    return {};
  }

  if (typeof routeLike === 'string') {
    if (!routeLike.includes('?')) {
      return {};
    }
    const [, rawQuery = ''] = routeLike.split('?');
    return Object.fromEntries(new URLSearchParams(rawQuery).entries());
  }

  if (routeLike && typeof routeLike === 'object' && routeLike.query && typeof routeLike.query === 'object') {
    return routeLike.query;
  }

  return {};
}

function normalizeGroupKey(value) {
  const text = textOf(value).toLowerCase();
  if (!text) {
    return '';
  }
  if (text.includes('confirm') || text.includes('确认')) {
    return 'confirmations';
  }
  if (text.includes('change') || text.includes('修改')) {
    return 'changes';
  }
  if (text.includes('selection') || text.includes('match') || text.includes('选人') || text.includes('发布')) {
    return 'matching';
  }
  if (text.includes('grade') || text.includes('review') || text.includes('验收') || text.includes('评级') || text.includes('提前完成')) {
    return 'reviews';
  }
  if (text.includes('cancel') || text.includes('取消')) {
    return 'cancellations';
  }
  return '';
}

function syncGroupFromRoute() {
  const groupFromRoute = normalizeGroupKey(route.query.group);
  activeGroup.value = groupFromRoute || 'confirmations';
}

function setActiveGroup(groupKey) {
  activeGroup.value = groupKey || 'confirmations';
  selectedItemMissing.value = false;
  const query = { ...(route.query || {}) };
  delete query.itemId;
  delete query.approvalId;
  delete query.taskId;
  delete query.recordId;
  delete query.room;
  delete query.roomKey;
  if (activeGroup.value === 'confirmations') {
    delete query.group;
  } else {
    query.group = activeGroup.value;
  }
  router.replace({ path: route.path, query });
}

function notificationRouteSource(groupKey) {
  if (groupKey === 'reviews') {
    return 'records';
  }
  if (groupKey === 'matching') {
    return 'matching';
  }
  return 'tasks';
}

function routeForSource(source, preferredRoute) {
  if (preferredRoute) {
    return withSource(preferredRoute);
  }
  if (source === 'records') {
    return withSource(roleRouteMap.enterprise.records);
  }
  if (source === 'matching') {
    return withSource(roleRouteMap.enterprise.publish);
  }
  return withSource(roleRouteMap.enterprise.workspace);
}

function attachRouteContext(target, context = {}) {
  const baseRoute = target && typeof target === 'object' ? { ...target } : { path: roleRouteMap.enterprise.workspace };
  const query = { ...(baseRoute.query || {}) };

  ['group', 'itemId', 'approvalId', 'taskId', 'recordId', 'room'].forEach((key) => {
    const value = textOf(context?.[key]);
    if (value) {
      query[key] = value;
    }
  });

  return Object.keys(query).length ? { ...baseRoute, query } : baseRoute;
}

function normalizeEntries(entries, fallback) {
  const normalized = listOf(entries)
    .map((entry, index) => {
      if (typeof entry === 'string') {
        return { label: `信息 ${index + 1}`, value: entry };
      }
      return {
        label: textOf(entry?.label, `信息 ${index + 1}`),
        value: textOf(entry?.value, textOf(entry?.summary, '待补充'))
      };
    })
    .filter((entry) => entry.value);

  return normalized.length ? normalized : fallback;
}

function normalizeApprovalItem(item, index) {
  const groupKey = normalizeGroupKey(item?.groupKey || item?.id || item?.label || item?.title) || 'confirmations';
  const group = approvalGroupMeta[groupKey];
  const routeQuery = routeQueryOf(item?.route || item?.to || item?.link);
  const itemId = textOf(item?.itemId, item?.id, routeQuery.itemId, `approval-${index}`);
  const taskId = textOf(item?.taskId, item?.summary?.taskId, item?.task?.taskId, routeQuery.taskId);
  const recordId = textOf(item?.recordId, item?.record?.recordId, item?.record?.id, routeQuery.recordId);
  const room = textOf(item?.room, item?.roomKey, item?.roomId, item?.taskRoom?.roomKey, routeQuery.room, routeQuery.roomKey);
  const route = attachRouteContext(routeForSource(item?.source || notificationRouteSource(groupKey), item?.route), {
    group: groupKey,
    itemId,
    taskId,
    recordId,
    room
  });
  const count = Math.max(numberOf(item?.count || 1), 1);
  const decisionActions = listOf(item?.decisionActions)
    .map((action, actionIndex) => ({
      key: textOf(action?.key, action?.action, `decision-${actionIndex}`),
      label: textOf(action?.label, '处理审批'),
      tone: textOf(action?.tone, 'primary'),
      action: textOf(action?.action),
      note: textOf(action?.note),
      approvalId: textOf(item?.approvalId, item?.id)
    }))
    .filter((action) => action.action);
  const highlights = normalizeEntries(item?.highlights, [
    { label: '状态', value: textOf(item?.status, group.label) },
    { label: '下一步', value: group.note }
  ]);
  const related = normalizeEntries(item?.related, [
    { label: '备注', value: textOf(item?.note, '进入对应页面处理。') }
  ]);

  return {
    id: textOf(item?.id, `approval-${index}`),
    itemId,
    title: textOf(item?.title, group.label),
    summary: textOf(item?.summary, group.note),
    groupKey,
    groupLabel: group.label,
    count,
    countLabel: textOf(item?.badge, `${count} 项`),
    status: textOf(item?.status, group.label),
    note: textOf(item?.note, group.note),
    updatedAt: textOf(item?.updatedAt, '实时同步'),
    approvalId: textOf(item?.approvalId, item?.id, itemId),
    approvalType: textOf(item?.approvalType),
    approvalStatus: textOf(item?.approvalStatus, 'PENDING'),
    pendingAudience: textOf(item?.pendingAudience),
    decisionSummary: textOf(item?.decisionSummary, item?.summary, item?.note),
    taskId,
    recordId,
    room,
    route,
    primaryActionLabel: groupKey === 'matching' ? '去选人' : groupKey === 'reviews' ? '去处理验收' : '去处理',
    contextDescription: textOf(item?.note, group.note),
    active: false,
    highlights,
    related,
    decisionActions,
    actions: [
      { key: 'open', label: groupKey === 'matching' ? '去选人' : groupKey === 'reviews' ? '去处理验收' : '去处理', tone: 'primary', to: route },
      {
        key: 'notifications',
        label: '查看全部通知',
        tone: 'secondary',
        to: attachRouteContext(withSource(roleRouteMap.enterprise.notifications), {
          group: groupKey,
          itemId,
          taskId,
          recordId,
          room
        })
      }
    ]
  };
}

const approvalItems = computed(() =>
  listOf(page.value?.approvalItems)
    .map((item, index) => normalizeApprovalItem(item, index))
    .filter((item) => Object.prototype.hasOwnProperty.call(approvalGroupMeta, item.groupKey))
);

const groupItems = computed(() => {
  const groupsFromPage = listOf(page.value?.approvalGroups)
    .filter((group) => Object.prototype.hasOwnProperty.call(approvalGroupMeta, textOf(group?.key)))
    .map((group) => ({
      key: textOf(group?.key),
      label: textOf(group?.label, approvalGroupMeta[textOf(group?.key)]?.label),
      note: textOf(group?.note, approvalGroupMeta[textOf(group?.key)]?.note),
      count: Math.max(numberOf(group?.count), 0)
    }));

  if (groupsFromPage.length) {
    return Object.keys(approvalGroupMeta).map((key) =>
      groupsFromPage.find((group) => group.key === key) || {
        key,
        label: approvalGroupMeta[key].label,
        note: approvalGroupMeta[key].note,
        count: 0
      }
    );
  }

  const counts = approvalItems.value.reduce(
    (acc, item) => {
      acc[item.groupKey] += numberOf(item.count);
      return acc;
    },
    { confirmations: 0, changes: 0, reviews: 0, cancellations: 0 }
  );

  return Object.entries(approvalGroupMeta).map(([key, meta]) => ({
    key,
    label: meta.label,
    note: meta.note,
    count: counts[key] || 0
  }));
});

const filteredItems = computed(() => approvalItems.value
  .filter((item) => item.groupKey === activeGroup.value)
  .map((item) => ({ ...item, active: item.id === selectedItemId.value })));
const currentGroupFirstItem = computed(() => filteredItems.value[0] || null);
const clearedSelectionRoute = computed(() => ({
  path: route.path,
  query: activeGroup.value === 'confirmations' ? {} : { group: activeGroup.value }
}));

function buildCenterSelectionRoute(item) {
  if (!item) {
    return clearedSelectionRoute.value;
  }

  const query = {};
  const groupKey = item.groupKey || activeGroup.value;
  if (groupKey && groupKey !== 'confirmations') {
    query.group = groupKey;
  }

  query.itemId = item.itemId || item.id;
  if (item.approvalId) {
    query.approvalId = item.approvalId;
  }

  if (item.taskId) {
    query.taskId = item.taskId;
  }
  if (item.recordId) {
    query.recordId = item.recordId;
  }
  if (item.room) {
    query.room = item.room;
  }

  return { path: route.path, query };
}

const invalidRecoveryActions = computed(() => {
  const actions = [];

  if (currentGroupFirstItem.value) {
    actions.push({
      key: 'recover-group',
      label: '查看当前分组首项',
      tone: 'primary',
      to: buildCenterSelectionRoute(currentGroupFirstItem.value)
    });
  } else {
    actions.push({
      key: 'clear-anchor',
      label: '清除当前定位',
      tone: 'primary',
      to: clearedSelectionRoute.value
    });
  }

  if (currentGroupFirstItem.value) {
    actions.push({
      key: 'clear-anchor',
      label: '清除当前定位',
      tone: 'secondary',
      to: clearedSelectionRoute.value
    });
  } else {
    actions.push({
      key: 'notifications',
      label: '查看全部通知',
      tone: 'secondary',
      to: notificationsRoute.value
    });
  }

  return actions;
});

const selectedItem = computed(() => {
  if (selectedItemMissing.value) {
    return null;
  }

  return filteredItems.value.find((item) => item.id === selectedItemId.value) || filteredItems.value[0] || null;
});
const selectedRouteContext = computed(() => ({
  group: selectedItem.value?.groupKey || activeGroup.value,
  itemId: selectedItem.value?.itemId || selectedItem.value?.id || '',
  approvalId: selectedItem.value?.approvalId || '',
  taskId: selectedItem.value?.taskId || '',
  recordId: selectedItem.value?.recordId || '',
  room: selectedItem.value?.room || ''
}));
const notificationsRoute = computed(() =>
  attachRouteContext(withSource(roleRouteMap.enterprise.notifications), selectedRouteContext.value)
);
const selectedPrimaryRoute = computed(() => {
  if (selectedItem.value?.route) {
    return selectedItem.value.route;
  }

  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value[0]?.to || clearedSelectionRoute.value;
  }

  return notificationsRoute.value;
});
const selectedPrimaryLabel = computed(() => {
  if (selectedItem.value?.primaryActionLabel) {
    return selectedItem.value.primaryActionLabel;
  }

  return selectedItemMissing.value ? invalidRecoveryActions.value[0]?.label || '清除当前定位' : '去处理';
});
const selectedContextActions = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value;
  }

  return buildCurrentObjectContextActions({
    item: selectedItem.value,
    audience: 'enterprise',
    primaryAction: {
      key: 'primary',
      label: selectedPrimaryLabel.value,
      tone: 'primary',
      to: selectedPrimaryRoute.value
    },
    secondaryAction: {
      key: 'notifications',
      label: '去通知中心',
      tone: 'secondary',
      to: notificationsRoute.value
    },
    withSource,
    attachRouteContext
  });
});
const selectedDecisionActions = computed(() => listOf(selectedItem.value?.decisionActions));
const secondarySummaryRoute = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value[1]?.to || null;
  }

  return notificationsRoute.value;
});
const secondarySummaryLabel = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value[1]?.label || '';
  }

  return '查看全部通知';
});
const totalApprovalValue = computed(() => `${approvalItems.value.reduce((sum, item) => sum + numberOf(item.count), 0)} 项`);
const summaryStats = computed(() => [
  {
    label: '待确认',
    value: String(groupItems.value.find((item) => item.key === 'confirmations')?.count || 0),
    note: '先确认版本和工期。'
  },
  {
    label: '待修改',
    value: String(groupItems.value.find((item) => item.key === 'changes')?.count || 0),
    note: '先收口修改意见。'
  }
]);
const summaryHighlights = computed(() => {
  if (selectedItemMissing.value) {
    return [
      {
        label: '当前事项',
        value: '当前锚点已失效，请重新选择。'
      }
    ];
  }

  if (selectedItem.value?.highlights?.length) {
    return selectedItem.value.highlights.slice(0, 2);
  }

  return filteredItems.value.slice(0, 3).map((item) => ({
    label: item.title,
    value: item.contextDescription
  }));
});
const listTitle = computed(() => `${approvalGroupMeta[activeGroup.value]?.label || '审批'}队列`);
const listDescription = computed(() => {
  if (selectedItemMissing.value) {
    return '当前锚点已失效，请重新选择。';
  }

  return approvalGroupMeta[activeGroup.value]?.note || '只看当前待批项。';
});
const emptyListTitle = computed(() => (approvalCenterIssue.value ? '审批队列已切换到兜底数据' : '当前没有待审批事项'));
const emptyListDescription = computed(() =>
  approvalCenterIssue.value || '待确认、待修改、待评级和待取消都会收口到这里。'
);
const footerActions = computed(() =>
  selectedItemMissing.value
    ? invalidRecoveryActions.value
    : [{ key: 'notifications', label: '查看全部通知', tone: 'secondary', to: notificationsRoute.value }]
);

function preferredQueryContext() {
  return {
    itemId: textOf(route.query.itemId),
    approvalId: textOf(route.query.approvalId),
    taskId: textOf(route.query.taskId),
    recordId: textOf(route.query.recordId),
    room: textOf(route.query.room, route.query.roomKey)
  };
}

function hasPreferredQueryContext() {
  const preferred = preferredQueryContext();
  return Boolean(preferred.itemId || preferred.taskId || preferred.recordId || preferred.room);
}

function matchesPreferredItem(item, preferred) {
  if (!item || !preferred) {
    return false;
  }
  if (preferred.approvalId && item.approvalId === preferred.approvalId) {
    return true;
  }
  if (preferred.itemId && (item.itemId === preferred.itemId || item.id === preferred.itemId)) {
    return true;
  }
  if (preferred.recordId && item.recordId === preferred.recordId) {
    return true;
  }
  if (preferred.room && item.room === preferred.room) {
    return true;
  }
  if (preferred.taskId && item.taskId === preferred.taskId) {
    return true;
  }
  return false;
}

function syncSelectedItemFromRoute() {
  const preferred = preferredQueryContext();
  const candidate = approvalItems.value.find((item) => matchesPreferredItem(item, preferred));

  if (candidate) {
    activeGroup.value = candidate.groupKey || activeGroup.value;
    selectedItemId.value = candidate.id;
    selectedItemMissing.value = false;
    return;
  }

  if (hasPreferredQueryContext()) {
    selectedItemId.value = '';
    selectedItemMissing.value = true;
    return;
  }

  const items = approvalItems.value.filter((item) => item.groupKey === activeGroup.value);
  if (!items.length) {
    selectedItemId.value = '';
    selectedItemMissing.value = false;
    return;
  }
  if (!items.some((item) => item.id === selectedItemId.value)) {
    selectedItemId.value = items[0].id;
  }
  selectedItemMissing.value = false;
}

function syncSelectionQuery(item) {
  if (!item) {
    return;
  }

  const query = { ...(route.query || {}) };
  if (item.groupKey === 'confirmations') {
    delete query.group;
  } else {
    query.group = item.groupKey;
  }
  query.itemId = item.itemId || item.id;
  if (item.approvalId) {
    query.approvalId = item.approvalId;
  } else {
    delete query.approvalId;
  }

  if (item.taskId) {
    query.taskId = item.taskId;
  } else {
    delete query.taskId;
  }
  if (item.recordId) {
    query.recordId = item.recordId;
  } else {
    delete query.recordId;
  }
  if (item.room) {
    query.room = item.room;
  } else {
    delete query.room;
    delete query.roomKey;
  }

  router.replace({ path: route.path, query });
}

async function loadPage() {
  page.value = await getApprovalCenterData();
}

function decisionActionKey(action) {
  return `${textOf(selectedItem.value?.approvalId, selectedItem.value?.id)}:${textOf(action?.key, action?.action)}`;
}

function syncSelectionAfterAction() {
  const nextItem = approvalItems.value.find((item) => item.groupKey === activeGroup.value) || approvalItems.value[0] || null;
  if (nextItem) {
    selectedItemId.value = nextItem.id;
    selectedItemMissing.value = false;
    syncSelectionQuery(nextItem);
    return;
  }

  selectedItemId.value = '';
  selectedItemMissing.value = false;
  router.replace(clearedSelectionRoute.value);
}

function goTo(target) {
  if (!target) {
    return;
  }
  router.push(target);
}

function handleSelect(item) {
  selectedItemId.value = item.id;
  selectedItemMissing.value = false;
  syncSelectionQuery(item);
}

function handleAction({ action }) {
  if (action?.to) {
    goTo(action.to);
  }
}

async function handleDecisionAction(action) {
  const approvalId = textOf(action?.approvalId, selectedItem.value?.approvalId, selectedItem.value?.id);
  if (!approvalId || !action?.action || actionPendingKey.value) {
    return;
  }

  actionPendingKey.value = decisionActionKey(action);
  actionFeedback.value = null;
  const result = await submitEnterpriseApprovalAction(approvalId, {
    action: action.action,
    note: action.note || ''
  });
  actionPendingKey.value = '';

  if (result?.requestError) {
    actionFeedback.value = {
      title: '审批动作提交失败',
      message: result.requestIssue || approvalCenterIssue.value || '审批动作暂时无法提交，已保留当前队列。'
    };
    return;
  }

  page.value = result;
  if (result?.result?.actionBlocked) {
    syncSelectedItemFromRoute();
  } else {
    syncSelectionAfterAction();
  }
  actionFeedback.value = {
    title: result?.result?.actionBlocked ? '当前审批暂未推进' : '审批动作已提交',
    message: textOf(
      result?.result?.actionMessage,
      result?.result?.nextStep,
      result?.result?.message,
      '审批结果已同步到当前队列。'
    )
  };
}

function handleFooterAction(action) {
  if (action?.to) {
    goTo(action.to);
  }
}

onMounted(async () => {
  syncGroupFromRoute();
  await loadPage();
  syncSelectedItemFromRoute();
  stopBusinessLiveSync = startBusinessLiveSync({
    refresh: () => loadPage(),
    acceptsEvent(event) {
      const scope = String(event?.scope || '').trim();
      return !scope || ['approvals', 'notifications', 'messages', 'workspace', 'acceptance', 'reviews', 'cancellations'].includes(scope);
    },
    onStatusChange: handleLiveSyncStatus,
    onSyncError: handleLiveSyncError
  });
});

watch([
  () => route.query.group,
  () => route.query.itemId,
  () => route.query.approvalId,
  () => route.query.taskId,
  () => route.query.recordId,
  () => route.query.room,
  () => route.query.roomKey,
  approvalItems
], () => {
  syncGroupFromRoute();
  syncSelectedItemFromRoute();
});

onBeforeUnmount(() => {
  stopBusinessLiveSync?.();
  stopBusinessLiveSync = null;
});
</script>
