<template>
  <section v-if="page" class="page-stack approval-center-page desktop-center-page">
    <DesktopNotificationSummaryCard
      class="desktop-center-summary"
      eyebrow="审批中心"
      title="先处理当前决策"
      :description="page.approvalHeadline || page.attentionHeadline || '把待审批事项集中在这里处理。'"
      total-label="当前队列"
      :total-value="totalApprovalValue"
      total-note="先处理当前决策。"
      :stats="summaryStats"
      :highlights="summaryHighlights"
      highlight-title="重点"
      :primary-action="{ label: selectedPrimaryLabel, to: selectedPrimaryRoute }"
      :secondary-action="{ label: secondarySummaryLabel, to: secondarySummaryRoute }"
      @primary-action="goTo(selectedPrimaryRoute)"
      @secondary-action="goTo(secondarySummaryRoute)"
    />

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

    <article v-if="approvalCenterIssue" class="result-card stack-sm">
      <strong>当前审批数据暂时不可用</strong>
      <p class="muted">{{ approvalCenterIssue }}</p>
    </article>

    <section class="approval-center-workbench desktop-center-workbench">
      <aside class="glass-panel approval-center-sidebar desktop-center-sidebar stack-md">
        <div class="stack-xs desktop-center-sidebar__head">
          <span class="eyebrow">审批队列</span>
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
        footer-note="先处理当前事项。"
        :footer-actions="footer动作"
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

          <section v-if="selectedDecision动作.length" class="approval-center-context__section desktop-center-context__section stack-sm">
            <div class="stack-sm">
              <div class="stack-xs">
                <span class="eyebrow">动作</span>
              </div>
              <div class="approval-center-context__actions desktop-center-context__actions">
                <button
                  v-for="action in selectedDecision动作"
                  :key="decisionActionKey(action)"
                  type="button"
                  :class="action.tone === 'primary' ? 'button-primary' : 'button-secondary'"
                  :disabled="actionPendingKey === decisionActionKey(action)"
                  @click="handleDecisionAction(action)"
                >
                  {{ actionPendingKey === decisionActionKey(action) ? '提交中…' : action.label }}
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
                v-for="action in selectedContext动作"
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
              <span class="eyebrow">重点</span>
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
              <span class="eyebrow">相关线索</span>
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
          <article v-if="reviewTrail.length" class="result-card stack-sm">
            <strong>处理记录</strong>
            <ul class="stack-xs approval-center-context__trail">
              <li v-for="item in reviewTrail.slice(0, 5)" :key="`${item.at}-${item.action}-${item.status}`">
                <strong>{{ item.status }}</strong>
                <span class="muted">{{ item.message }}</span>
              </li>
            </ul>
          </article>
        </div>

        <div v-else class="approval-center-context__empty desktop-center-context__empty stack-sm">
          <strong>{{ selectedItemMissing ? '这条审批已经处理完毕或当前不可用' : '当前还没有审批事项' }}</strong>
          <p class="muted">
            {{
              selectedItemMissing
                ? '重新选择事项，或切换分组继续处理。'
                : '也可以先回通知中心查看通用更新。'
            }}
          </p>
          <div v-if="selectedItemMissing" class="approval-center-context__actions desktop-center-context__actions">
            <button
              v-for="action in invalidRecovery动作"
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
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();

const page = ref(null);
const activeGroup = ref('confirmations');
const selectedItemId = ref('');
const selectedItemMissing = ref(false);
const actionPendingKey = ref('');
const actionFeedback = ref(null);
const reviewTrail = ref([]);
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
  liveSyncError.value = '最新同步刚刚中断，页面会自动重连，必要时再回退到轮询。';
}

const approvalCenterIssue = computed(() => {
  const rawIssue = String(page.value?.requestIssue || page.value?.requestError || '').trim();
  if (!rawIssue) {
    return '';
  }

  if (rawIssue.includes('Unknown path') && rawIssue.includes('/api/enterprise/approvals')) {
    return '当前审批接口暂时不可用，请稍后再试。';
  }

  if (rawIssue.includes('/api/enterprise/approvals')) {
    return '当前审批数据暂时不可用，请稍后再试。';
  }

  return '审批数据还没同步到最新版本，稍后刷新再试。';
});

const approvalGroupMeta = {
  matching: { label: '招聘', note: '先处理候选人筛选和入围决定。' },
  confirmations: { label: '待确认', note: '先确认范围、版本和时间安排。' },
  changes: { label: '待修改', note: '先处理对方提出的修改。' },
  reviews: { label: '待验收', note: '先处理验收、评级和结算衔接。' },
  cancellations: { label: '取消事项', note: '先处理取消相关决定。' }
};

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function textOf(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
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
    return 'acceptance';
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
  if (source === 'acceptance') {
    return withSource(roleRouteMap.enterprise.acceptance);
  }
  if (source === 'records') {
    return withSource(roleRouteMap.enterprise.records);
  }
  if (source === 'matching') {
    return withSource(roleRouteMap.enterprise.market);
  }
  return withSource(roleRouteMap.enterprise.workspace);
}

function approvalCtaLabelForRoute(target, fallback = '打开审批') {
  const path = typeof target === 'string' ? target : String(target?.path || '');
  if (!path) {
    return fallback;
  }
  if (path.includes('/settlement')) {
    return '打开结算';
  }
  if (/\/records\/[^/]+$/.test(path)) {
    return '打开记录';
  }
  if (path.includes('/acceptance')) {
    return '打开验收';
  }
  if (path.includes('/records')) {
    return '打开历史';
  }
  if (path.includes('/approvals')) {
    return '返回审批中心';
  }
  if (path.includes('/notifications')) {
    return '返回通知中心';
  }
  if (path.includes('/messages') || path.includes('/chat') || path.includes('/room')) {
    return '打开消息';
  }
  if (path.includes('/workspace')) {
    return '打开协作';
  }
  if (path.includes('/talents') || path.includes('/market')) {
    return '查看人才';
  }
  return fallback;
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
        value: textOf(entry?.value, textOf(entry?.summary, '信息还没同步过来'))
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
    { label: '说明', value: textOf(item?.note, '打开对应页面继续处理。') }
  ]);

  return {
    id: textOf(item?.id, `approval-${index}`),
    itemId,
    title: textOf(item?.title, group.label),
    summary: textOf(item?.summary, group.note),
    groupKey,
    groupLabel: group.label,
    count,
    countLabel: textOf(item?.badge, `${count} 条事项`),
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
    primaryActionLabel: approvalCtaLabelForRoute(
      route,
      groupKey === 'matching' ? '查看人才' : groupKey === 'reviews' ? '打开验收' : '打开审批'
    ),
    contextDescription: textOf(item?.note, group.note),
    active: false,
    highlights,
    related,
    decisionActions,
    actions: [
      {
        key: 'open',
        label: approvalCtaLabelForRoute(
          route,
          groupKey === 'matching' ? '查看人才' : groupKey === 'reviews' ? '打开验收' : '打开审批'
        ),
        tone: 'primary',
        to: route
      },
      {
        key: 'notifications',
        label: '返回通知中心',
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
    { matching: 0, confirmations: 0, changes: 0, reviews: 0, cancellations: 0 }
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

const invalidRecovery动作 = computed(() => {
  const actions = [];

  if (currentGroupFirstItem.value) {
    actions.push({
      key: 'recover-group',
      label: '打开这个分组里的第一条事项',
      tone: 'primary',
      to: buildCenterSelectionRoute(currentGroupFirstItem.value)
    });
  } else {
    actions.push({
      key: 'clear-anchor',
      label: '清除当前焦点',
      tone: 'primary',
      to: clearedSelectionRoute.value
    });
  }

  if (currentGroupFirstItem.value) {
    actions.push({
      key: 'clear-anchor',
      label: '清除当前焦点',
      tone: 'secondary',
      to: clearedSelectionRoute.value
    });
  } else {
    actions.push({
      key: 'notifications',
      label: '返回通知中心',
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
    return invalidRecovery动作.value[0]?.to || clearedSelectionRoute.value;
  }

  return notificationsRoute.value;
});
const selectedPrimaryLabel = computed(() => {
  if (selectedItem.value?.primaryActionLabel) {
    return selectedItem.value.primaryActionLabel;
  }

  return selectedItemMissing.value
    ? invalidRecovery动作.value[0]?.label || '清除当前焦点'
    : approvalCtaLabelForRoute(selectedPrimaryRoute.value, '打开审批');
});
const selectedContext动作 = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecovery动作.value;
  }

  const actions = [
    {
      key: 'primary',
      label: selectedPrimaryLabel.value,
      tone: 'primary',
      to: selectedPrimaryRoute.value
    }
  ];
  const secondaryRoute = selectedItem.value?.secondaryRoute || notificationsRoute.value;
  const secondaryLabel = selectedItem.value?.secondaryActionLabel || '返回通知中心';
  if (secondaryRoute) {
    actions.push({
      key: 'secondary',
      label: secondaryLabel,
      tone: 'secondary',
      to: secondaryRoute
    });
  }
  return actions;
});
const selectedDecision动作 = computed(() => listOf(selectedItem.value?.decisionActions));
const secondarySummaryRoute = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecovery动作.value[1]?.to || null;
  }

  return notificationsRoute.value;
});
const secondarySummaryLabel = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecovery动作.value[1]?.label || '';
  }

  return '返回通知中心';
});
const totalApprovalValue = computed(() => `${approvalItems.value.reduce((sum, item) => sum + numberOf(item.count), 0)} 条事项`);
const summaryStats = computed(() => [
  {
    label: '招聘',
    value: String(groupItems.value.find((item) => item.key === 'matching')?.count || 0),
    note: '先处理候选人筛选和入围决定。'
  },
  {
    label: '待确认',
    value: String(groupItems.value.find((item) => item.key === 'confirmations')?.count || 0),
    note: '先确认范围、版本和时间安排。'
  }
]);
const summaryHighlights = computed(() => {
  if (selectedItemMissing.value) {
    return [
      {
        label: '当前审批',
        value: '当前锚点已经失效，请重新选择事项。'
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
    return '当前锚点已经失效，请重新选择事项。';
  }

  return approvalGroupMeta[activeGroup.value]?.note || '这里只展示当前审批分组。';
});
const emptyListTitle = computed(() => (approvalCenterIssue.value ? '当前审批数据暂时不可用' : '当前还没有审批事项'));
const emptyListDescription = computed(() =>
  approvalCenterIssue.value || '招聘、确认、修改、验收和取消相关事项都会汇总到这里。'
);
const footer动作 = computed(() =>
  selectedItemMissing.value
    ? invalidRecovery动作.value
    : [{ key: 'notifications', label: '返回通知中心', tone: 'secondary', to: notificationsRoute.value }]
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
    const firstAvailable = approvalItems.value[0] || null;
    if (firstAvailable) {
      activeGroup.value = firstAvailable.groupKey || activeGroup.value;
      selectedItemId.value = firstAvailable.id;
      selectedItemMissing.value = false;
      syncSelectionQuery(firstAvailable);
      return;
    }
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
  const resolved = router.resolve(target);
  const resolvedPath = String(resolved?.path || '');
  const resolvedTaskId = String(resolved?.query?.taskId || '').trim();
  const needsTaskContext = (
    resolvedPath.includes('/chat')
    || resolvedPath.includes('/room')
    || resolvedPath.includes('/workspace')
  );
  if (needsTaskContext && !resolvedTaskId) {
    actionFeedback.value = {
      title: '缺少任务上下文',
      message: '这条入口没有带上合同上下文，所以暂时无法跳转。请从合同、通知详情或审批详情重新进入。'
    };
    return;
  }
  actionFeedback.value = null;
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

function isMutation失败(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
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

  if (isMutation失败(result)) {
    actionFeedback.value = {
      title: '审批动作提交失败',
      message: result.requestIssue || approvalCenterIssue.value || '当前审批动作暂时无法提交，队列状态还没有变化。'
    };
    reviewTrail.value = [
      {
        at: new Date().toLocaleString(),
        action: action.action,
        status: '失败',
        message: actionFeedback.value.message
      },
      ...reviewTrail.value
    ].slice(0, 5);
    return;
  }

  page.value = result;
  if (result?.result?.actionBlocked) {
    syncSelectedItemFromRoute();
  } else {
    syncSelectionAfterAction();
  }
  actionFeedback.value = {
    title: result?.result?.actionBlocked ? '这条审批还没有推进' : '审批动作已提交',
    message: textOf(
      result?.result?.actionMessage,
      result?.result?.nextStep,
      result?.result?.message,
      '审批结果已经同步到当前队列。'
    )
  };
  reviewTrail.value = [
    {
      at: new Date().toLocaleString(),
      action: action.action,
      status: result?.result?.actionBlocked ? '未推进' : '已提交',
      message: actionFeedback.value.message
    },
    ...reviewTrail.value
  ].slice(0, 5);
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
