<template>
  <section
    v-if="page"
    class="page-stack notification-center-page desktop-center-page"
    :class="{ 'is-zero-state': isZeroState }"
  >
    <DesktopNotificationSummaryCard
      class="desktop-center-summary"
      :eyebrow="summaryEyebrow"
      :title="summaryTitle"
      :description="summaryDescription"
      total-label="当前待处理"
      :total-value="totalAttentionValue"
      :total-note="summaryTotalNote"
      :stats="summaryStats"
      :highlights="summaryHighlights"
      highlight-title="当前要点"
      :primary-action="{ label: selectedPrimaryLabel, to: selectedPrimaryRoute }"
      @primary-action="goTo(selectedPrimaryRoute)"
    />

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

    <section class="notification-center-workbench desktop-center-workbench">
      <aside class="glass-panel notification-center-sidebar desktop-center-sidebar stack-md">
        <div class="desktop-center-sidebar__head">
          <h3>{{ isZeroState ? '分组' : '分组处理' }}</h3>
        </div>

        <div class="notification-center-group-list desktop-center-group-list">
          <button
            v-for="group in groupItems"
            :key="group.key"
            type="button"
            class="notification-center-group desktop-center-group"
            :class="{ 'is-active': activeGroup === group.key }"
            @click="setActiveGroup(group.key)"
          >
            <div class="stack-xs">
              <strong>{{ group.label }}</strong>
            </div>
            <span class="notification-center-group__count desktop-center-group__count">{{ group.count }}</span>
          </button>
        </div>
      </aside>

      <DesktopNotificationList
        class="desktop-center-list"
        eyebrow="当前事项"
        :title="listTitle"
        :description="listDescription"
        :items="filteredItems"
        :empty-title="listEmptyTitle"
        :empty-description="listEmptyDescription"
        :show-refresh="true"
        refresh-label="刷新列表"
        footer-note=""
        :footer-actions="footerActions"
        @refresh="loadPage"
        @select="handleSelect"
        @action="handleAction"
        @footer-action="handleFooterAction"
      />

      <article class="glass-panel notification-center-context desktop-center-context stack-md">
          <div v-if="selectedItem" class="stack-md">
            <div class="stack-xs desktop-center-context__summary">
              <span class="eyebrow">当前摘要</span>
              <h3>{{ selectedItem.title }}</h3>
              <p class="muted">{{ selectedItem.summary }}</p>
          </div>

          <div class="notification-center-context__meta desktop-center-context__meta">
            <span class="soft-pill">{{ selectedItem.groupLabel }}</span>
            <span class="soft-pill">{{ selectedItem.countLabel }}</span>
            <span v-if="selectedItem.status" class="soft-pill">{{ selectedItem.status }}</span>
          </div>

          <section class="notification-center-context__section desktop-center-context__section stack-sm">
            <div class="stack-xs">
              <span class="eyebrow">动作</span>
            </div>
            <div class="notification-center-context__actions desktop-center-context__actions">
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

          <section class="notification-center-context__section desktop-center-context__section stack-sm">
            <div class="stack-xs">
              <span class="eyebrow">要点</span>
            </div>
            <ul class="notification-center-context__list desktop-center-context__list">
              <li v-for="item in selectedItem.highlights" :key="`${selectedItem.id}-${item.label}`">
                <strong>{{ item.label }}</strong>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </section>

          <section class="notification-center-context__section desktop-center-context__section stack-sm">
            <div class="stack-xs">
              <span class="eyebrow">留痕</span>
            </div>
            <ul class="notification-center-context__list desktop-center-context__list">
              <li v-for="item in selectedItem.related" :key="`${selectedItem.id}-${item.label}-${item.value}`">
                <strong>{{ item.label }}</strong>
                <span>{{ item.value }}</span>
              </li>
            </ul>
          </section>
        </div>

        <div
          v-else
          class="notification-center-context__empty desktop-center-context__empty stack-sm"
          :class="{ 'is-zero': isZeroState && !selectedItemMissing }"
        >
          <strong>{{ selectedItemMissing ? '当前事项已处理或不可用' : '当前没有待处理事项' }}</strong>
          <p class="muted">
            {{
              selectedItemMissing
                ? '请重新选择事项，或切换分组后继续处理。'
                : '新的高优先级事项会自动汇总到这里。'
            }}
          </p>
          <div v-if="selectedItemMissing" class="notification-center-context__actions desktop-center-context__actions">
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
import { getBusinessData, getTalentData } from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream';
import { buildCurrentObjectContextActions } from '../utils/attentionNavigation';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();

const page = ref(null);
const activeGroup = ref('all');
const selectedItemId = ref('');
const selectedItemMissing = ref(false);
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

const audience = computed(() => (route.meta?.audience === 'talent' ? 'talent' : 'enterprise'));
const isTalent = computed(() => audience.value === 'talent');
const notificationItemsSource = computed(() => listOf(page.value?.notificationItems));
const notificationGroupsSource = computed(() => listOf(page.value?.notificationGroups));
const hasNotificationItemsContract = computed(
  () => Boolean(page.value && Object.prototype.hasOwnProperty.call(page.value, 'notificationItems'))
);
const hasNotificationGroupsContract = computed(
  () => Boolean(page.value && Object.prototype.hasOwnProperty.call(page.value, 'notificationGroups'))
);

const groupMeta = {
  all: { label: '全部', note: '看所有高优先级事项。' },
  confirmations: { label: '待确认', note: '先确认版本和边界。' },
  changes: { label: '待修改', note: '处理范围和补充说明。' },
  matching: { label: '发布与选人', note: '先看候选人和当前轮选择。' },
  reviews: { label: '待评级 / 验收', note: '先处理验收和评级。' },
  cancellations: { label: '待取消', note: '双方确认的取消事项。' },
  followup: { label: '待回看', note: '回到聊天或记录继续处理。' }
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

function withSource(to, source = 'notifications') {
  if (!to) {
    return {
      path: isTalent.value ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages,
      query: { source }
    };
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
  if (text.includes('all') || text.includes('全部')) {
    return 'all';
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
  if (text.includes('grade') || text.includes('review') || text.includes('验收') || text.includes('评级')) {
    return 'reviews';
  }
  if (text.includes('cancel') || text.includes('取消')) {
    return 'cancellations';
  }
  if (text.includes('follow') || text.includes('chat') || text.includes('message') || text.includes('回看')) {
    return 'followup';
  }
  return '';
}

function syncGroupFromRoute() {
  const groupFromRoute = normalizeGroupKey(route.query.group);
  activeGroup.value = groupFromRoute || 'all';
}

function setActiveGroup(groupKey) {
  activeGroup.value = groupKey || 'all';
  selectedItemMissing.value = false;
  const query = { ...(route.query || {}) };
  delete query.itemId;
  delete query.taskId;
  delete query.recordId;
  delete query.room;
  delete query.roomKey;
  if (activeGroup.value === 'all') {
    delete query.group;
  } else {
    query.group = activeGroup.value;
  }
  router.replace({ path: route.path, query });
}

function notificationGroupMeta(key) {
  return groupMeta[key] || groupMeta.followup;
}

function notificationRouteSource(key) {
  if (key === 'reviews') {
    return 'records';
  }
  if (key === 'matching') {
    return 'matching';
  }
  if (key === 'followup') {
    return 'messages';
  }
  return 'tasks';
}

function groupKeyForItem(item) {
  return (
    normalizeGroupKey(item?.groupKey || item?.groupId || item?.group || item?.category || item?.type) ||
    normalizeGroupKey(item?.id || item?.key || item?.label || item?.title || item?.summary) ||
    'followup'
  );
}

function sourceLabel(source) {
  switch (source) {
    case 'records':
      return '记录';
    case 'messages':
      return '聊天';
    case 'tasks':
      return '任务';
    default:
      return '留痕';
  }
}

function routeForSource(source, preferredRoute) {
  if (preferredRoute) {
    return withSource(preferredRoute);
  }
  if (source === 'records') {
    return withSource(isTalent.value ? roleRouteMap.talent.records : roleRouteMap.enterprise.records);
  }
  if (source === 'matching') {
    return withSource(isTalent.value ? roleRouteMap.talent.market : roleRouteMap.enterprise.publish);
  }
  if (source === 'tasks') {
    return withSource(isTalent.value ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace);
  }
  return withSource(isTalent.value ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages);
}

function attachRouteContext(target, context = {}) {
  const fallbackPath = isTalent.value ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages;
  const baseRoute = target && typeof target === 'object' ? { ...target } : { path: fallbackPath };
  const query = { ...(baseRoute.query || {}) };

  ['group', 'itemId', 'taskId', 'recordId', 'room'].forEach((key) => {
    const value = textOf(context?.[key]);
    if (value) {
      query[key] = value;
    }
  });

  return Object.keys(query).length ? { ...baseRoute, query } : baseRoute;
}

function normalizeNotificationEntries(entries, groupKey, fallbackLabel) {
  return listOf(entries)
    .map((entry, index) => {
      if (typeof entry === 'string') {
        return {
          label: `${fallbackLabel || notificationGroupMeta(groupKey).label}${index + 1}`,
          value: entry
        };
      }

      const label = textOf(
        entry.label || entry.title || entry.name || entry.key,
        `${fallbackLabel || notificationGroupMeta(groupKey).label}${index + 1}`
      );
      const value = textOf(entry.value || entry.description || entry.summary || entry.note, label);
      const route = entry.route
        ? routeForSource(entry.source || notificationRouteSource(groupKey), entry.route)
        : null;

      return {
        label,
        value,
        ...(route ? { route } : {})
      };
    })
    .filter((entry) => entry.label && entry.value)
    .slice(0, 3);
}

function buildLegacyRelatedEntries() {
  const related = {
    confirmations: [],
    changes: [],
    matching: [],
    reviews: [],
    cancellations: [],
    followup: []
  };

  if (isTalent.value) {
    listOf(page.value?.pendingConfirmations).forEach((item) => {
      related.confirmations.push({
        label: textOf(item.title, '待确认任务'),
        value: `${textOf(item.version, '1')} 版 · ${textOf(item.period, '待确认')} · ${textOf(item.summary, '企业已发送新的任务版本')}`,
        route: routeForSource('messages', {
          path: roleRouteMap.talent.messages,
          query: {
            room: textOf(item.roomKey),
            taskId: textOf(item.taskId)
          }
        })
      });
    });

    listOf(page.value?.activeTasks).forEach((task) => {
      const progress = textOf(task.progress);
      const group = progress.includes('待确认')
        ? 'confirmations'
        : progress.includes('待修改')
          ? 'changes'
          : 'followup';
      related[group].push({
        label: textOf(task.title, '任务'),
        value: textOf(task.note, progress || '进入协作空间继续处理'),
        route: routeForSource('tasks')
      });
    });

    listOf(page.value?.acceptRecords).forEach((record) => {
      related.reviews.push({
        label: textOf(record.title, '接单记录'),
        value: `${textOf(record.amountValue, '金额待补充')} · ${textOf(record.stage, '待验收')}`,
        route: routeForSource('records', record.route)
      });
    });

    listOf(page.value?.messages).forEach((message) => {
      const text = `${textOf(message.from, '协作对象')} · ${textOf(message.text, '进入聊天继续处理')}`;
      const group = text.includes('取消') ? 'cancellations' : 'followup';
      related[group].push({
        label: textOf(message.time, '最新消息'),
        value: text,
        route: routeForSource('messages')
      });
    });
  } else {
    listOf(page.value?.taskBoard).forEach((task) => {
      const status = textOf(task.status);
      const group = status.includes('修改')
        ? 'changes'
        : status.includes('选择')
          ? 'matching'
        : status.includes('评级')
          ? 'reviews'
          : status.includes('取消')
            ? 'cancellations'
            : status.includes('确认') || status.includes('协商')
              ? 'confirmations'
              : 'followup';
      related[group].push({
        label: textOf(task.title, '任务'),
        value: `${status || '待处理'} · ${textOf(task.note, '进入协作空间继续处理')}`,
        route: routeForSource('tasks')
      });
    });

    listOf(page.value?.publishRecords).forEach((record) => {
      const stage = textOf(record.stage);
      const group = stage.includes('评级') || stage.includes('验收') || textOf(record.rating).includes('级')
        ? 'reviews'
        : 'followup';
      related[group].push({
        label: textOf(record.title, '发单记录'),
        value: `${textOf(record.amountValue, '金额待补充')} · ${stage || '查看记录详情'}`,
        route: routeForSource('records', record.route)
      });
    });

    listOf(page.value?.liveConversation).forEach((message) => {
      related.followup.push({
        label: textOf(message.author, '协作成员'),
        value: `${textOf(message.text, '进入聊天继续处理')} · ${textOf(message.time, '刚刚')}`,
        route: routeForSource('messages')
      });
    });

    listOf(page.value?.recommendedTalents).forEach((talent) => {
      related.matching.push({
        label: textOf(talent.name, '推荐人才'),
        value: `${textOf(talent.role, '待确认角色')} · ${textOf(talent.reason, '继续查看匹配理由')}`,
        route: routeForSource('matching')
      });
    });
  }

  return related;
}

function buildLegacyNotificationItems() {
  const related = buildLegacyRelatedEntries();
  return listOf(page.value?.attentionItems).map((item, index) => {
    const groupKey = groupKeyForItem(item);
    const originalRouteValue = item?.route || item?.to || item?.link;
    const routeQuery = routeQueryOf(item?.route || item?.to || item?.link);
    const itemId = textOf(item.itemId, item.id, routeQuery.itemId, `notification-${index}`);
    const taskId = textOf(item.taskId, item.summary?.taskId, item.task?.taskId, routeQuery.taskId);
    const recordId = textOf(item.recordId, item.record?.recordId, item.record?.id, routeQuery.recordId);
    const room = textOf(item.room, item.roomKey, item.roomId, item.taskRoom?.roomKey, routeQuery.room, routeQuery.roomKey);
    const route = attachRouteContext(routeForSource(notificationRouteSource(groupKey), item.route), {
      group: groupKey,
      itemId,
      taskId,
      recordId,
      room
    });
    const baseRelated = listOf(related[groupKey]).slice(0, 3);
    const count = numberOf(item.count);
    const groupLabel = notificationGroupMeta(groupKey).label;

    return {
      id: textOf(item.id, `notification-${index}`),
      itemId,
      title: textOf(item.label, groupLabel),
      summary: `${groupLabel}当前有 ${count} 项，建议集中处理后再进入其它模块。`,
      groupKey,
      groupLabel,
      count,
      countLabel: `${count} 项`,
      status: textOf(item.label, groupLabel),
      note: count > 0 ? '支持直接进入处理上下文' : '当前分组暂无事项',
      updatedAt: textOf(page.value?.summary?.latestUpdatedAt, '实时汇总'),
      taskId,
      recordId,
      room,
      route,
      primaryActionLabel: groupKey === 'reviews' ? '去查看记录' : groupKey === 'followup' ? '去聊天' : '去处理',
      secondaryActionLabel: groupKey === 'reviews' ? '去协作空间' : groupKey === 'matching' ? '去人才广场' : '保留原入口',
      secondaryRoute: groupKey === 'reviews'
        ? attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace), {
            group: groupKey,
            itemId,
            taskId,
            recordId,
            room
          })
        : groupKey === 'matching'
          ? attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.market : roleRouteMap.enterprise.market), {
              group: groupKey,
              itemId,
              taskId,
              recordId,
              room
            })
          : originalRouteValue
            ? attachRouteContext(routeForSource(notificationRouteSource(groupKey), originalRouteValue), {
                group: groupKey,
                itemId,
                taskId,
                recordId,
                room
              })
            : attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages), {
                group: groupKey,
                itemId,
                taskId,
                recordId,
                room
              }),
      contextDescription: notificationGroupMeta(groupKey).note || '先进入对应页面处理。',
      unread: count > 0,
      urgent: groupKey !== 'followup',
      active: false,
      highlights: baseRelated.length
        ? baseRelated
        : [
            { label: '下一步', value: notificationGroupMeta(groupKey).note || '进入对应页面处理。' },
            { label: '入口', value: textOf(item.label, '通知项') }
          ],
      related: baseRelated.length
        ? baseRelated
        : [
            { label: sourceLabel(notificationRouteSource(groupKey)), value: '当前没有更多留痕，可直接进入处理入口。' }
          ],
      actions: [
        {
          key: 'open',
          label: groupKey === 'reviews' ? '查看记录' : groupKey === 'followup' ? '进入聊天' : groupKey === 'matching' ? '去选人' : '进入处理',
          tone: 'primary',
          to: route
        },
        {
          key: 'secondary',
          label: groupKey === 'reviews' ? '查看协作' : groupKey === 'matching' ? '去人才广场' : '保留原入口',
          tone: 'secondary',
          to: groupKey === 'reviews'
            ? attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace), {
                group: groupKey,
                itemId,
                taskId,
                recordId,
                room
              })
            : groupKey === 'matching'
              ? attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.market : roleRouteMap.enterprise.market), {
                  group: groupKey,
                  itemId,
                  taskId,
                  recordId,
                  room
                })
              : originalRouteValue
                ? attachRouteContext(routeForSource(notificationRouteSource(groupKey), originalRouteValue), {
                    group: groupKey,
                    itemId,
                    taskId,
                    recordId,
                    room
                  })
                : attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages), {
                    group: groupKey,
                    itemId,
                    taskId,
                    recordId,
                    room
                  })
        }
      ]
    };
  });
}

function buildContractNotificationItems() {
  if (!hasNotificationItemsContract.value) {
    return [];
  }

  const related = buildLegacyRelatedEntries();
  return notificationItemsSource.value.map((item, index) => {
    const groupKey = groupKeyForItem(item);
    const group = notificationGroupMeta(groupKey);
    const routeSource = notificationRouteSource(groupKey);
    const count = numberOf(item?.count ?? item?.unreadCount ?? item?.total ?? item?.size ?? 1);
    const originalRouteValue = item?.route || item?.to || item?.link;
    const routeQuery = routeQueryOf(item?.route || item?.to || item?.link);
    const itemId = textOf(item?.itemId, item?.id, item?.key, routeQuery.itemId, `notification-${index}`);
    const taskId = textOf(item?.taskId, item?.summary?.taskId, item?.task?.taskId, routeQuery.taskId);
    const recordId = textOf(item?.recordId, item?.record?.recordId, item?.record?.id, routeQuery.recordId);
    const room = textOf(item?.room, item?.roomKey, item?.roomId, item?.taskRoom?.roomKey, routeQuery.room, routeQuery.roomKey);
    const route = attachRouteContext(routeForSource(item?.source || routeSource, item?.route || item?.to || item?.link), {
      group: groupKey,
      itemId,
      taskId,
      recordId,
      room
    });
    const primaryActionLabel = textOf(
      item?.primaryActionLabel || item?.actionLabel || item?.cta,
      groupKey === 'reviews' ? '去查看记录' : groupKey === 'followup' ? '去聊天' : groupKey === 'matching' ? '去选人' : '去处理'
    );
    const secondaryActionLabel = textOf(
      item?.secondaryActionLabel || item?.secondaryLabel,
      groupKey === 'reviews' ? '去协作空间' : groupKey === 'matching' ? '去人才广场' : '保留原入口'
    );
    const relatedEntries = normalizeNotificationEntries(item?.related || item?.context || item?.details, groupKey, sourceLabel(routeSource));
    const highlights = normalizeNotificationEntries(item?.highlights || item?.summaryItems, groupKey, group.label);
    const baseRelated = relatedEntries.length ? relatedEntries : listOf(related[groupKey]).slice(0, 3);
    const secondaryRouteValue = item?.secondaryRoute || item?.secondaryTo || item?.secondaryLink;
    const fallbackSecondaryRoute =
      groupKey === 'reviews'
        ? withSource(isTalent.value ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace)
        : groupKey === 'matching'
          ? withSource(isTalent.value ? roleRouteMap.talent.market : roleRouteMap.enterprise.market)
          : originalRouteValue
            ? routeForSource(item?.source || routeSource, originalRouteValue)
            : withSource(isTalent.value ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages);

    return {
      id: textOf(item?.id || item?.key, `notification-${index}`),
      itemId,
      title: textOf(item?.title || item?.label || item?.name, group.label),
      summary: textOf(
        item?.summary || item?.description || item?.content,
        `${group.label}当前有 ${count} 项，建议集中处理后再进入其它模块。`
      ),
      groupKey,
      groupLabel: textOf(item?.groupLabel || item?.categoryLabel, group.label),
      count,
      countLabel: `${count} 项`,
      status: textOf(item?.status || item?.state, textOf(item?.title || item?.label || item?.name, group.label)),
      note: textOf(item?.note, count > 0 ? '支持直接进入处理上下文' : '当前分组暂无事项'),
      updatedAt: textOf(item?.updatedAt || item?.time || item?.updatedTime, textOf(page.value?.summary?.latestUpdatedAt, '实时汇总')),
      taskId,
      recordId,
      room,
      route,
      primaryActionLabel,
      secondaryActionLabel,
      secondaryRoute: secondaryRouteValue
        ? attachRouteContext(routeForSource(item?.secondarySource || (groupKey === 'reviews' ? 'tasks' : groupKey === 'matching' ? 'matching' : 'messages'), secondaryRouteValue), {
            group: groupKey,
            itemId,
            taskId,
            recordId,
            room
          })
        : attachRouteContext(fallbackSecondaryRoute, {
            group: groupKey,
            itemId,
            taskId,
            recordId,
            room
          }),
      contextDescription: textOf(item?.contextDescription || item?.context || item?.note, group.note || '先进入对应页面处理。'),
      unread: count > 0,
      urgent: groupKey !== 'followup',
      active: false,
      highlights: highlights.length
        ? highlights
        : baseRelated.length
          ? baseRelated
          : [
              { label: '下一步', value: group.note || '进入对应页面处理。' },
              { label: '入口', value: textOf(item?.label || item?.title || item?.name, '通知项') }
            ],
      related: baseRelated.length
        ? baseRelated
        : [
            { label: sourceLabel(routeSource), value: '当前没有更多留痕，可直接进入处理入口。' }
          ],
      actions: Array.isArray(item?.actions) && item.actions.length
        ? item.actions.map((action, actionIndex) => ({
            key: textOf(action?.key, `action-${actionIndex}`),
            label: textOf(action?.label, primaryActionLabel),
            tone: action?.tone === 'secondary' ? 'secondary' : 'primary',
            to: attachRouteContext(action?.to ? routeForSource(action?.source || routeSource, action.to) : route, {
              group: groupKey,
              itemId,
              taskId,
              recordId,
              room
            })
          }))
        : [
            {
              key: 'open',
              label: primaryActionLabel,
              tone: 'primary',
              to: route
            },
            {
              key: 'secondary',
              label: secondaryActionLabel,
              tone: 'secondary',
              to: attachRouteContext(fallbackSecondaryRoute, {
                group: groupKey,
                itemId,
                taskId,
                recordId,
                room
              })
            }
          ]
    };
  });
}

function buildNotificationItems() {
  return hasNotificationItemsContract.value ? buildContractNotificationItems() : buildLegacyNotificationItems();
}

function buildNotificationGroups(items) {
  const counts = items.reduce(
    (acc, item) => {
      acc.all += numberOf(item.count);
      acc[item.groupKey] += numberOf(item.count);
      return acc;
    },
    { all: 0, confirmations: 0, changes: 0, matching: 0, reviews: 0, cancellations: 0, followup: 0 }
  );

  if (hasNotificationGroupsContract.value) {
    const contractGroups = notificationGroupsSource.value.reduce((acc, group, index) => {
      const key = normalizeGroupKey(group?.key || group?.id || group?.groupKey || group?.label || group?.name) || `group-${index}`;
      acc[key] = {
        label: textOf(group?.label || group?.name, notificationGroupMeta(key).label),
        note: textOf(group?.note || group?.description, notificationGroupMeta(key).note),
        count: numberOf(group?.count ?? group?.total ?? group?.value ?? counts[key] ?? 0)
      };
      return acc;
    }, {});

    return Object.entries(groupMeta).map(([key, meta]) => ({
      key,
      label: contractGroups[key]?.label || meta.label,
      note: contractGroups[key]?.note || meta.note,
      count: key === 'all' ? counts.all : contractGroups[key]?.count ?? counts[key] ?? 0
    }));
  }

  return Object.entries(groupMeta).map(([key, meta]) => ({
    key,
    label: meta.label,
    note: meta.note,
    count: counts[key] || 0
  }));
}

const notificationItems = computed(() => buildNotificationItems());
const totalAttentionCount = computed(() =>
  notificationItems.value.reduce((sum, item) => sum + numberOf(item.count), 0)
);
const totalAttentionValue = computed(
  () => `${totalAttentionCount.value} 项`
);
const isZeroState = computed(() => !selectedItemMissing.value && totalAttentionCount.value === 0);

const groupItems = computed(() => buildNotificationGroups(notificationItems.value));

const filteredItems = computed(() => {
  const items = notificationItems.value
    .filter((item) => activeGroup.value === 'all' || item.groupKey === activeGroup.value)
    .map((item) => ({ ...item, active: item.id === selectedItemId.value }));
  return items;
});
const currentGroupFirstItem = computed(() => filteredItems.value[0] || null);
const clearedSelectionRoute = computed(() => ({
  path: route.path,
  query: activeGroup.value === 'all' ? {} : { group: activeGroup.value }
}));

function buildCenterSelectionRoute(item) {
  if (!item) {
    return clearedSelectionRoute.value;
  }

  const query = {};
  const groupKey = item.groupKey || activeGroup.value;
  if (groupKey && groupKey !== 'all') {
    query.group = groupKey;
  }

  query.itemId = item.itemId || item.id;

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
  } else if (activeGroup.value !== 'all' && notificationItems.value.length) {
    actions.push({
      key: 'recover-all',
      label: '查看全部事项',
      tone: 'primary',
      to: { path: route.path, query: {} }
    });
  }

  actions.push({
    key: 'clear-anchor',
    label: '清除当前定位',
    tone: actions.length ? 'secondary' : 'primary',
    to: clearedSelectionRoute.value
  });

  return actions;
});

const selectedItem = computed(() => {
  if (selectedItemMissing.value) {
    return null;
  }

  return filteredItems.value.find((item) => item.id === selectedItemId.value) || filteredItems.value[0] || null;
});
const selectedRouteContext = computed(() => ({
  group: selectedItem.value?.groupKey || (activeGroup.value === 'all' ? '' : activeGroup.value),
  itemId: selectedItem.value?.itemId || selectedItem.value?.id || '',
  taskId: selectedItem.value?.taskId || '',
  recordId: selectedItem.value?.recordId || '',
  room: selectedItem.value?.room || ''
}));
const selectedPrimaryRoute = computed(() => {
  if (isZeroState.value) {
    return attachRouteContext(
      withSource(isTalent.value ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.approvals),
      selectedRouteContext.value
    );
  }

  if (selectedItem.value?.route) {
    return selectedItem.value.route;
  }

  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value[0]?.to || clearedSelectionRoute.value;
  }

  return withSource(isTalent.value ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages);
});
const selectedPrimaryLabel = computed(() => {
  if (isZeroState.value) {
    return isTalent.value ? '去协作空间' : '去审批中心';
  }

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
    audience: isTalent.value ? 'talent' : 'enterprise',
    primaryAction: {
      key: 'primary',
      label: selectedPrimaryLabel.value,
      tone: 'primary',
      to: selectedPrimaryRoute.value
    },
    secondaryAction: selectedItem.value?.secondaryRoute
      ? {
          key: 'secondary',
          label: selectedItem.value.secondaryActionLabel,
          tone: 'secondary',
          to: selectedItem.value.secondaryRoute
        }
      : null,
    withSource,
    attachRouteContext
  });
});
const isApprovalCenter = computed(() => !isTalent.value && (route.path.includes('/approvals') || route.meta?.title === '审批中心'));
const secondarySummaryRoute = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value[1]?.to || null;
  }

  if (isTalent.value) {
    return attachRouteContext(withSource(roleRouteMap.talent.workspace), selectedRouteContext.value);
  }

  return attachRouteContext(
    withSource(isApprovalCenter.value ? roleRouteMap.enterprise.notifications : roleRouteMap.enterprise.approvals),
    selectedRouteContext.value
  );
});
const secondarySummaryLabel = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value[1]?.label || '';
  }

  if (isTalent.value) {
    return '去协作空间';
  }

  return isApprovalCenter.value ? '去通知中心' : '去审批中心';
});
const summaryEyebrow = computed(() => {
  if (isTalent.value) {
    return '确认与执行通知';
  }

  return isApprovalCenter.value ? '审批中心' : '审批与处理通知';
});
const summaryTitle = computed(() => {
  if (isZeroState.value) {
    return isApprovalCenter.value ? '审批概览' : '当前通知概览';
  }

  return isTalent.value ? '先处理当前通知' : (isApprovalCenter.value ? '审批中心' : '先处理当前通知');
});
const summaryDescription = computed(() => {
  if (selectedItemMissing.value) {
    return '先从列表里重新定位事项。';
  }

  if (isZeroState.value) {
    return '目前没有待处理事项。';
  }

  return isTalent.value ? '先确认，再继续执行。' : '先处理确认、修改和评级。';
});
const summaryTotalNote = computed(() => (isZeroState.value ? '' : '确认、修改、评级先处理。'));
const summaryStats = computed(() => {
  if (isZeroState.value) {
    return [];
  }

  return [
    {
      label: '待确认',
      value: String(groupItems.value.find((item) => item.key === 'confirmations')?.count || 0),
      note: isTalent.value ? '版本与边界先确认。' : '范围与工期先确认。'
    },
    {
      label: '待评级 / 验收',
      value: String(groupItems.value.find((item) => item.key === 'reviews')?.count || 0),
      note: '验收和评级先完成。'
    }
  ];
});
const summaryHighlights = computed(() => {
  if (selectedItemMissing.value) {
    return [
      {
        label: '当前事项',
        value: '当前锚点已失效，请在通知列表中重新选择。'
      }
    ];
  }

  if (isZeroState.value) {
    return [];
  }

  if (selectedItem.value?.highlights?.length) {
    return selectedItem.value.highlights.slice(0, 1);
  }

  return filteredItems.value.slice(0, 1).map((item) => ({
    label: item.title,
    value: item.contextDescription
  }));
});
const listTitle = computed(() => {
  const groupLabel = groupMeta[activeGroup.value]?.label || '全部';
  return isApprovalCenter.value ? `${groupLabel}审批队列` : `${groupLabel}通知`;
});
const listDescription = computed(() => {
  if (selectedItemMissing.value) {
    return '当前锚点已失效。';
  }

  if (isZeroState.value) {
    return '';
  }

  return isApprovalCenter.value ? '只看待审批项。' : '只看待处理项。';
});
const listEmptyTitle = computed(() => (isZeroState.value ? '当前暂无事项' : '当前分组暂无事项'));
const listEmptyDescription = computed(() =>
  isZeroState.value ? '需要处理的新通知会自动汇总到这里。' : '切换分组，或继续去审批中心。'
);
const footerActions = computed(() =>
  selectedItemMissing.value
    ? invalidRecoveryActions.value
    : isZeroState.value
      ? []
    : !isTalent.value
      ? [{
          key: 'approval-center',
          label: isApprovalCenter.value ? '去通知中心' : '去审批中心',
          disabled: false,
          tone: 'secondary',
          to: attachRouteContext(
            withSource(isApprovalCenter.value ? roleRouteMap.enterprise.notifications : roleRouteMap.enterprise.approvals),
            selectedRouteContext.value
          )
        }]
      : []
);

function preferredQueryContext() {
  return {
    itemId: textOf(route.query.itemId),
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
  const candidate = notificationItems.value.find((item) => matchesPreferredItem(item, preferred));

  if (candidate) {
    if (hasPreferredQueryContext()) {
      activeGroup.value = candidate.groupKey || activeGroup.value;
    }
    selectedItemId.value = candidate.id;
    selectedItemMissing.value = false;
    return;
  }

  if (hasPreferredQueryContext()) {
    selectedItemId.value = '';
    selectedItemMissing.value = true;
    return;
  }

  const items = notificationItems.value.filter((item) => activeGroup.value === 'all' || item.groupKey === activeGroup.value);
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
  if (item.groupKey === 'all') {
    delete query.group;
  } else {
    query.group = item.groupKey;
  }
  query.itemId = item.itemId || item.id;

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
  page.value = isTalent.value ? await getTalentData() : await getBusinessData();
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
      return !scope || ['notifications', 'messages', 'workspace', 'acceptance', 'matching', 'reviews'].includes(scope);
    },
    onStatusChange: handleLiveSyncStatus,
    onSyncError: handleLiveSyncError
  });
});

watch([
  () => route.query.group,
  () => route.query.itemId,
  () => route.query.taskId,
  () => route.query.recordId,
  () => route.query.room,
  () => route.query.roomKey,
  notificationItems
], () => {
  syncGroupFromRoute();
  syncSelectedItemFromRoute();
});

onBeforeUnmount(() => {
  stopBusinessLiveSync?.();
  stopBusinessLiveSync = null;
});
</script>

<style scoped>
.notification-center-page.is-zero-state {
  gap: 16px;
}

.notification-center-page.is-zero-state :deep(.desktop-notification-summary) {
  padding: 18px 20px;
  gap: 12px;
}

.notification-center-page.is-zero-state :deep(.desktop-notification-summary__header h3) {
  font-size: 22px;
}

.notification-center-page.is-zero-state :deep(.desktop-notification-summary__hero) {
  grid-template-columns: minmax(0, 1fr) minmax(180px, 0.56fr);
  gap: 10px;
}

.notification-center-page.is-zero-state :deep(.desktop-notification-summary__metric) {
  padding: 14px 16px;
}

.notification-center-page.is-zero-state :deep(.desktop-notification-summary__metric strong) {
  margin-top: 4px;
  font-size: 28px;
}

.notification-center-page.is-zero-state :deep(.desktop-notification-list) {
  padding: 18px;
}

.notification-center-page.is-zero-state :deep(.desktop-notification-list__header h3) {
  font-size: 20px;
}

.notification-center-page.is-zero-state :deep(.desktop-notification-list__empty) {
  min-height: 160px;
  padding: 18px;
  justify-content: center;
}

.notification-center-page.is-zero-state .notification-center-sidebar {
  padding: 18px;
}

.notification-center-page.is-zero-state .desktop-center-sidebar__head h3 {
  margin: 0;
  font-size: 18px;
}

.notification-center-page.is-zero-state .notification-center-group-list {
  gap: 8px;
}

.notification-center-page.is-zero-state .notification-center-group {
  padding-top: 10px;
  padding-bottom: 10px;
}

.notification-center-page.is-zero-state .notification-center-context {
  padding: 18px;
}

.notification-center-context__empty.is-zero {
  gap: 6px;
  justify-content: center;
}

.notification-center-context__empty.is-zero strong {
  font-size: 20px;
}
</style>
