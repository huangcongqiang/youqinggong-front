<template>
  <section
    v-if="page"
    class="page-stack notification-center-page desktop-center-page notification-message-page"
    :class="{ 'is-zero-state': isZeroState }"
  >
    <article v-if="page.requestError" class="result-card stack-sm">
      <strong>当前待办暂时不可用</strong>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <article class="glass-panel notification-message-header stack-sm">
      <span class="eyebrow">通知中心</span>
      <h1>查看公告、任务提醒与账号提醒。</h1>
      <p class="muted">通知里只保留消息提醒，不承担处理工作台角色。每条通知都能直接跳到对应页面继续处理。</p>
    </article>

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

    <section class="glass-panel notification-message-stream stack-md">
      <div class="notification-message-filters">
        <button
          v-for="group in groupItems"
          :key="group.key"
          type="button"
          class="notification-message-filter"
          :class="{ 'is-active': activeGroup === group.key }"
          @click="setActiveGroup(group.key)"
        >
          <strong>{{ group.label }}</strong>
          <span>{{ group.count }}</span>
        </button>
      </div>

      <DesktopNotificationList
        class="desktop-center-list notification-message-list"
        eyebrow="消息流"
        :title="listTitle"
        :description="listDescription"
        :items="filteredItems"
        :empty-title="listEmptyTitle"
        :empty-description="listEmptyDescription"
        :show-refresh="true"
        :refresh-label="refreshLabel"
        footer-note=""
        :footer-actions="footerActions"
        @refresh="loadPage"
        @select="handleSelect"
        @action="handleAction"
        @footer-action="handleFooterAction"
      />

      <article
        v-if="selectedItem && selectedItem.groupKey === 'tasks' && !selectedRecruitingInvite"
        class="notification-message-helper stack-sm"
      >
        <span class="eyebrow">任务提醒</span>
        <strong>{{ selectedItem.title }}</strong>
        <p class="muted">{{ selectedItem.summary }}</p>
        <p class="muted">涉及招聘申请时，这里只负责提醒你“有申请来了”；真正处理申请请回工作台里的 `招聘申请` 入口。当前没有独立面试节点时，确认合作后会自动开启聊天。</p>
      </article>

      <article
        v-if="selectedRecruitingInvite"
        class="notification-message-helper notification-message-helper--invite stack-sm"
      >
        <span class="eyebrow">面试邀约</span>
        <strong>{{ selectedRecruitingInviteDetails.taskName }}</strong>
        <p class="muted">{{ selectedRecruitingInviteDetails.companyName }}</p>
        <div class="notification-message-invite-grid">
          <div>
            <span class="eyebrow">面试时间</span>
            <strong>{{ selectedRecruitingInviteDetails.interviewTime }}</strong>
          </div>
          <div>
            <span class="eyebrow">腾讯会议号</span>
            <strong>{{ selectedRecruitingInviteDetails.meetingCode }}</strong>
          </div>
          <div>
            <span class="eyebrow">备注</span>
            <strong>{{ selectedRecruitingInviteDetails.note }}</strong>
          </div>
        </div>
        <p class="muted">这里显示的是人才侧收到的面试邀约提醒。你可以先在这里确认信息，再决定同意面试或拒绝面试。</p>
        <div class="toolbar toolbar--wrap notification-message-invite-actions">
          <button type="button" class="button-primary" @click="handleRecruitingInterviewDecision('ACCEPT')">同意面试</button>
          <button type="button" class="button-secondary" @click="handleRecruitingInterviewDecision('REJECT')">拒绝面试</button>
        </div>
      </article>

      <article v-if="navigationFeedback" class="result-card stack-sm">
          <strong>{{ navigationFeedback.title }}</strong>
          <p class="muted">{{ navigationFeedback.message }}</p>
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
import { buildSettlementRoute } from './settlementHelpers.js';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();

const page = ref(null);
const activeGroup = ref('all');
const selectedItemId = ref('');
const selectedItemMissing = ref(false);
const navigationFeedback = ref(null);
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
  liveSyncError.value = isApprovalCenter.value ? '审批同步暂时中断，页面会自动重连。' : '通知同步暂时中断，页面会自动重连。';
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
  all: { label: '全部', note: '查看全部通知。' },
  announcements: { label: '公告', note: '查看系统公告、维护提醒和平台更新。' },
  tasks: { label: '任务', note: '查看任务、招聘申请、面试邀约和进度提醒。' },
  account: { label: '账号', note: '查看账号资料、审核和权限提醒。' }
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

function firstText(...values) {
  for (const value of values) {
    const text = textOf(value);
    if (text) {
      return text;
    }
  }
  return '';
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

function routePathOf(routeLike) {
  if (!routeLike) {
    return '';
  }

  if (typeof routeLike === 'string') {
    return routeLike.split('?')[0];
  }

  return String(routeLike.path || '').split('?')[0];
}

function routesSharePath(firstRoute, secondRoute) {
  const firstPath = routePathOf(firstRoute);
  const secondPath = routePathOf(secondRoute);
  return Boolean(firstPath && secondPath && firstPath === secondPath);
}

function normalizeGroupKey(value) {
  const text = textOf(value).toLowerCase();
  if (!text) {
    return '';
  }
  if (text.includes('all') || text.includes('全部')) {
    return 'all';
  }
  if (
    text.includes('announcement')
    || text.includes('notice')
    || text.includes('system')
    || text.includes('公告')
    || text.includes('维护')
    || text.includes('更新')
  ) {
    return 'announcements';
  }
  if (
    text.includes('account')
    || text.includes('profile')
    || text.includes('setting')
    || text.includes('approval')
    || text.includes('账号')
    || text.includes('资料')
    || text.includes('设置')
    || text.includes('审核')
    || text.includes('权限')
  ) {
    return 'account';
  }
  return 'tasks';
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
  return groupMeta[key] || groupMeta.tasks;
}

function recruitingIntentText(item = {}) {
  return [
    textOf(item?.source),
    textOf(item?.originSource),
    textOf(item?.surface),
    textOf(item?.originSurface),
    textOf(item?.kind),
    textOf(item?.type),
    textOf(item?.title),
    textOf(item?.label),
    textOf(item?.summary),
    textOf(item?.description),
    textOf(item?.note),
    textOf(item?.contextDescription)
  ].filter(Boolean).join(' ').toLowerCase();
}

function isRecruitingMessage(item = {}) {
  return /招聘|申请|邀约|面试|interview|invite|application|apply|meeting|腾讯会议/.test(recruitingIntentText(item));
}

function hasRecruitingInviteFields(item = {}) {
  return Boolean(
    recruitingInviteTime(item)
    || recruitingInviteMeetingCode(item)
  );
}

function entryValueByLabel(entries = [], labels = []) {
  const matched = listOf(entries).find((entry) => {
    const labelText = textOf(entry?.label).toLowerCase();
    return labels.some((label) => labelText.includes(String(label).toLowerCase()));
  });
  return textOf(matched?.value);
}

function recruitingInviteTime(item = {}) {
  return firstText(
    item?.interviewAt,
    item?.interviewTime,
    item?.meetingTime,
    item?.appointmentTime,
    item?.time,
    item?.scheduleTime,
    item?.currentInvite?.interviewAt,
    item?.currentInvite?.time,
    entryValueByLabel(item?.highlights, ['面试时间']),
    entryValueByLabel(item?.related, ['面试时间'])
  );
}

function recruitingInviteMeetingCode(item = {}) {
  return firstText(
    item?.meetingCode,
    item?.tencentMeetingCode,
    item?.meetingNumber,
    item?.meetingNo,
    item?.roomCode,
    item?.currentInvite?.meetingCode,
    item?.currentInvite?.meetingNumber,
    entryValueByLabel(item?.highlights, ['腾讯会议号', '会议号']),
    entryValueByLabel(item?.related, ['腾讯会议号', '会议号'])
  );
}

function recruitingInviteCompanyName(item = {}) {
  return firstText(
    item?.companyName,
    item?.organizationName,
    item?.enterpriseName,
    item?.businessName,
    item?.partner,
    item?.counterpartName,
    item?.currentInvite?.invitedByName,
    entryValueByLabel(item?.highlights, ['企业']),
    entryValueByLabel(item?.related, ['企业'])
  );
}

function talentRecruitingNotificationRoute(context = {}) {
  const query = {
    source: 'recruiting',
    group: 'tasks',
    ...(textOf(context.itemId) ? { itemId: textOf(context.itemId) } : {}),
    ...(textOf(context.taskId) ? { taskId: textOf(context.taskId) } : {}),
    ...(textOf(context.recordId) ? { recordId: textOf(context.recordId) } : {}),
    ...(textOf(context.room) ? { room: textOf(context.room), roomKey: textOf(context.room) } : {})
  };
  return {
    path: roleRouteMap.talent.notifications,
    query
  };
}

function notificationMessageGroupKey(legacyGroupKey, item = {}) {
  const fields = [
    textOf(item?.source),
    textOf(item?.originSource),
    textOf(item?.surface),
    textOf(item?.originSurface),
    textOf(item?.kind),
    textOf(item?.type),
    textOf(item?.title),
    textOf(item?.label),
    textOf(item?.summary),
    textOf(item?.description)
  ].filter(Boolean).join(' ').toLowerCase();

  if (
    /announcement|notice|system|公告|维护|更新/.test(fields)
  ) {
    return 'announcements';
  }

  if (
    /account|profile|setting|settings|approval|auth|register|onboarding|账号|资料|设置|审核|权限/.test(fields)
  ) {
    return 'account';
  }

  if (legacyGroupKey === 'all') {
    return 'all';
  }

  return 'tasks';
}

function notificationRouteSource(key, item = {}) {
  if (isRecruitingMessage(item)) {
    return 'recruiting';
  }
  if (key === 'reviews') {
    const ownerKind = explicitReviewOwnerKind(item, item.route || item.to || item.link);
    if (ownerKind === 'settlement' || ownerKind === 'record') {
      return 'records';
    }
    if (ownerKind === 'review') {
      return textOf(item?.taskId) ? 'tasks' : 'records';
    }
    if (textOf(item?.taskId)) {
      return 'tasks';
    }
    return 'records';
  }
  if (key === 'matching') {
    return 'recruiting';
  }
  if (key === 'followup') {
    if (textOf(item?.financeAction) || textOf(item?.recordId)) {
      return 'records';
    }
    if (textOf(item?.messageId) || textOf(item?.room) || textOf(item?.roomKey) || textOf(item?.roomId)) {
      return 'messages';
    }
    if (textOf(item?.taskId)) {
      return 'tasks';
    }
    return 'messages';
  }
  if (textOf(item?.recordId) || textOf(item?.financeAction)) {
    return 'records';
  }
  if (textOf(item?.taskId)) {
    return 'tasks';
  }
  if (textOf(item?.messageId) || textOf(item?.room) || textOf(item?.roomKey) || textOf(item?.roomId)) {
    return 'messages';
  }
  return 'tasks';
}

function explicitGroupKeyForItem(item) {
  const routePath = typeof (item?.route || item?.to || item?.link) === 'string'
    ? (item.route || item.to || item.link).split('?')[0]
    : String(item?.route?.path || item?.to?.path || item?.link?.path || '');
  const fields = [
    textOf(item?.groupKey),
    textOf(item?.groupId),
    textOf(item?.group),
    textOf(item?.category),
    textOf(item?.type),
    textOf(item?.source),
    textOf(item?.originSource),
    textOf(item?.surface),
    textOf(item?.originSurface),
    textOf(item?.kind),
    routePath
  ].filter(Boolean).map((value) => value.toLowerCase());

  if (matchesExplicitOwnerFields(fields, [
    /(^|[-_/ ])(settlement|record|records|history)([-_/ ]|$)/i,
    /结算|记录|历史/,
    /\/records(\/|$)/i,
    /\/settlement(\/|$)/i
  ])) {
    return 'followup';
  }
  if (matchesExplicitOwnerFields(fields, [
    /(^|[-_/ ])(matching|market|publish|talent|talents|selection)([-_/ ]|$)/i,
    /选人|人才|发布/,
    /\/talents(\/|$)/i,
    /\/market(\/|$)/i,
    /\/publish(\/|$)/i
  ])) {
    return 'matching';
  }
  if (matchesExplicitOwnerFields(fields, [
    /(^|[-_/ ])(message|messages|chat|followup)([-_/ ]|$)/i,
    /消息|聊天|回看/,
    /\/messages(\/|$)/i,
    /\/chat(\/|$)/i
  ])) {
    return 'followup';
  }
  if (matchesExplicitOwnerFields(fields, [
    /(^|[-_/ ])(review|reviews|acceptance)([-_/ ]|$)/i,
    /验收|审核|评级/,
    /\/acceptance(\/|$)/i
  ])) {
    return 'reviews';
  }
  if (matchesExplicitOwnerFields(fields, [
    /(^|[-_/ ])(confirm|confirmation|confirmations)([-_/ ]|$)/i,
    /确认/
  ])) {
    return 'confirmations';
  }
  if (matchesExplicitOwnerFields(fields, [
    /(^|[-_/ ])(change|changes|revision)([-_/ ]|$)/i,
    /修改/
  ])) {
    return 'changes';
  }
  if (matchesExplicitOwnerFields(fields, [
    /(^|[-_/ ])(cancel|cancellation|cancellations)([-_/ ]|$)/i,
    /取消/
  ])) {
    return 'cancellations';
  }

  return '';
}

function groupKeyForItem(item) {
  return (
    explicitGroupKeyForItem(item) ||
    normalizeGroupKey(item?.groupKey || item?.groupId || item?.group || item?.category || item?.type || item?.label) ||
    (textOf(item?.financeAction, item?.recordId, item?.record?.recordId, item?.record?.id) ? 'followup' : '') ||
    (textOf(item?.approvalId) ? 'confirmations' : '') ||
    'followup'
  );
}

function sourceLabel(source) {
  switch (source) {
    case 'records':
      return '记录';
    case 'messages':
      return '消息';
    case 'tasks':
      return '合同';
    case 'recruiting':
      return '招聘';
    default:
      return '辅助信息';
  }
}

function explicitOwnerFields(context = {}, preferredRoute) {
  const preferredPath = typeof preferredRoute === 'string'
    ? preferredRoute.split('?')[0]
    : String(preferredRoute?.path || '').trim();

  return [
    textOf(context.source),
    textOf(context.originSource),
    textOf(context.surface),
    textOf(context.originSurface),
    textOf(context.group),
    textOf(context.groupKey),
    textOf(context.category),
    textOf(context.type),
    textOf(context.kind),
    preferredPath
  ].filter(Boolean).map((value) => value.toLowerCase());
}

function matchesExplicitOwnerFields(fields, patterns) {
  return fields.some((field) => patterns.some((pattern) => pattern.test(field)));
}

function isExplicitApplicationTaskContext(context = {}) {
  if (textOf(context.financeAction)) {
    return false;
  }

  return matchesExplicitOwnerFields(explicitOwnerFields(context), [
    /(^|[-_/ ])(application|apply)([-_/ ]|$)/i,
    /协作申请|提交申请/,
    /^申请$/,
    /\/apply$/
  ]);
}

function explicitReviewOwnerKind(context = {}, preferredRoute) {
  const fields = explicitOwnerFields(context, preferredRoute);

  if (
    textOf(context.financeAction)
    || matchesExplicitOwnerFields(fields, [
      /\/settlement(\/|$)/i,
      /(^|[-_/ ])(settlement|finance|claim|invoice|reconciliation|dispute)([-_/ ]|$)/i,
      /结算|请款|开票|对账|争议/
    ])
  ) {
    return 'settlement';
  }

  if (
    matchesExplicitOwnerFields(fields, [
      /\/records(\/|$)/i,
      /(^|[-_/ ])(record|records|history|archive)([-_/ ]|$)/i,
      /记录|历史/
    ])
  ) {
    return 'record';
  }

  if (
    matchesExplicitOwnerFields(fields, [
      /\/acceptance(\/|$)/i,
      /(^|[-_/ ])(review|reviews|acceptance|grade|rating)([-_/ ]|$)/i,
      /审核|验收|评级|评分/
    ])
  ) {
    return 'review';
  }

  return '';
}

function taskOwnerFallbackLabel() {
  return isTalent.value ? '查看任务' : '打开工作台';
}

function primaryActionFallbackLabel(groupKey) {
  if (groupKey === 'announcements') {
    return '查看公告';
  }
  if (groupKey === 'account') {
    return '继续完善设置';
  }
  if (groupKey === 'tasks') {
    return '查看任务';
  }
  return taskOwnerFallbackLabel();
}

function secondaryActionFallbackLabel(groupKey) {
  if (groupKey === 'announcements') {
    return '稍后查看';
  }
  if (groupKey === 'account') {
    return '查看账号状态';
  }
  if (groupKey === 'tasks') {
    return '打开对应页面';
  }
  return taskOwnerFallbackLabel();
}

function matchingSecondaryRoute(context = {}) {
  if (isTalent.value) {
    return attachRouteContext(withSource(roleRouteMap.talent.market), context);
  }
  const requestedTalentSlugs = listOf(context.requestedTalentSlugs)
    .map((item) => textOf(item))
    .filter(Boolean);
  if (requestedTalentSlugs.length) {
    return attachRouteContext(withSource(roleRouteMap.enterprise.talentDetail(requestedTalentSlugs[0]), 'matching'), context);
  }
  const taskId = textOf(context.taskId);
  return attachRouteContext(
    withSource(
      {
        path: '/enterprise/recruiting',
        query: {
          source: 'notifications',
          ...(taskId ? { taskId } : {})
        }
      },
      'recruiting'
    ),
    context
  );
}

function ctaLabelForRoute(target, fallback = taskOwnerFallbackLabel()) {
  const path = typeof target === 'string' ? target : String(target?.path || '');
  const query = routeQueryOf(target);
  if (!path) {
    return fallback;
  }
  if (String(query.mode || '').trim() === 'matching') {
    return '去处理申请';
  }
  if (/\/tasks\/[^/]+\/apply$/.test(path)) {
    return '打开申请';
  }
  if (/\/tasks\/[^/]+$/.test(path)) {
    return '查看任务';
  }
  if (path.includes('/settlement')) {
    return '打开结算';
  }
  if (/\/records\/[^/]+$/.test(path)) {
    return '查看记录';
  }
  if (path.includes('/acceptance')) {
    return '打开验收';
  }
  if (path.includes('/records')) {
    return '查看记录';
  }
  if (path.includes('/messages') || path.includes('/chat') || path.includes('/room')) {
    return '打开消息';
  }
  if (path.includes('/workspace')) {
    return '打开工作台';
  }
  if (path.includes('/recruiting')) {
    return isTalent.value ? '查看邀约' : '处理申请';
  }
  if (path.includes('/approvals')) {
    return '打开审批';
  }
  if (path.includes('/notifications')) {
    if (isTalent.value && String(query.source || '').trim() === 'recruiting') {
      return '查看面试邀约';
    }
    return '查看通知';
  }
  if (/\/talents\/[^/]+$/.test(path)) {
    return '查看人才详情';
  }
  if (path.includes('/talents') || path.includes('/market')) {
    return isTalent.value ? '去找工作' : '搜索人才';
  }
  return fallback;
}

function routeForSource(source, preferredRoute, context = {}) {
  if (preferredRoute) {
    return withSource(preferredRoute);
  }
  if (source === 'records') {
    return withSource(isTalent.value ? roleRouteMap.talent.records : roleRouteMap.enterprise.records);
  }
  if (source === 'recruiting') {
    const taskId = textOf(context.taskId);
    if (isTalent.value) {
      return talentRecruitingNotificationRoute(context);
    }
    return withSource(
      {
        path: '/enterprise/recruiting',
        query: {
          source: 'notifications',
          ...(taskId ? { taskId } : {})
        }
      },
      'recruiting'
    );
  }
  if (source === 'matching') {
    if (!isTalent.value) {
      const taskId = textOf(context.taskId);
      const requestedTalentIds = listOf(context.requestedTalentIds || context.requestedTalentUserIds)
        .map((item) => textOf(item))
        .filter(Boolean);
      return {
        path: roleRouteMap.enterprise.market,
        query: {
          source: 'matching',
          mode: 'matching',
          ...(taskId ? { taskId } : {}),
          ...(requestedTalentIds.length ? { requestedTalentIds: requestedTalentIds.join(',') } : {})
        }
      };
    }
    return withSource(roleRouteMap.talent.market);
  }
  if (source === 'tasks') {
    if (isTalent.value) {
      if (isRecruitingMessage(context)) {
        return talentRecruitingNotificationRoute(context);
      }
      const taskId = textOf(context.taskId);
      if (taskId) {
        const isApplicationHint = isExplicitApplicationTaskContext(context);
        return withSource(
          isApplicationHint ? roleRouteMap.talent.taskApply(taskId) : roleRouteMap.talent.taskDetail(taskId)
        );
      }
      return withSource(roleRouteMap.talent.market);
    }
    const taskId = textOf(context.taskId);
    if (isRecruitingMessage(context)) {
      return withSource(
        {
          path: '/enterprise/recruiting',
          query: {
            source: 'notifications',
            ...(taskId ? { taskId } : {})
          }
        },
        'recruiting'
      );
    }
    if (taskId) {
      return withSource(roleRouteMap.enterprise.workspace);
    }
    return withSource(roleRouteMap.enterprise.approvals, 'tasks');
  }
  return withSource(isTalent.value ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages);
}

function recordHistoryRoute(context = {}) {
  return attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.records : roleRouteMap.enterprise.records, 'reviews'), context);
}

function reviewPrimaryRoute(context = {}, preferredRoute) {
  const routeQuery = routeQueryOf(preferredRoute);
  const financeAction = textOf(context.financeAction, routeQuery.financeAction);
  const ownerKind = explicitReviewOwnerKind(context, preferredRoute);
  if (context.recordId && ownerKind === 'settlement') {
    return buildSettlementRoute({
      audience: audience.value,
      recordId: context.recordId,
      taskId: context.taskId,
      room: context.room,
      current: route.query,
      source: 'reviews',
      financeAction
    });
  }
  if (context.recordId && ownerKind === 'record') {
    return attachRouteContext(
      withSource(
        isTalent.value ? roleRouteMap.talent.recordDetail(context.recordId) : roleRouteMap.enterprise.recordDetail(context.recordId),
        'reviews'
      ),
      context
    );
  }
  if (context.taskId && ownerKind === 'review') {
    const taskId = encodeURIComponent(String(context.taskId));
    return attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.acceptanceDetail(taskId) : roleRouteMap.enterprise.acceptanceDetail(taskId), 'reviews'), context);
  }
  if (context.recordId && !context.taskId) {
    return attachRouteContext(
      withSource(
        isTalent.value ? roleRouteMap.talent.recordDetail(context.recordId) : roleRouteMap.enterprise.recordDetail(context.recordId),
        'reviews'
      ),
      context
    );
  }
  if (context.taskId && !context.recordId) {
    const taskId = encodeURIComponent(String(context.taskId));
    return attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.acceptanceDetail(taskId) : roleRouteMap.enterprise.acceptanceDetail(taskId), 'reviews'), context);
  }
  if (context.recordId) {
    return attachRouteContext(
      withSource(
        isTalent.value ? roleRouteMap.talent.recordDetail(context.recordId) : roleRouteMap.enterprise.recordDetail(context.recordId),
        'reviews'
      ),
      context
    );
  }
  if (context.taskId) {
    const taskId = encodeURIComponent(String(context.taskId));
    return attachRouteContext(withSource(isTalent.value ? roleRouteMap.talent.acceptanceDetail(taskId) : roleRouteMap.enterprise.acceptanceDetail(taskId), 'reviews'), context);
  }
  return recordHistoryRoute(context);
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
        ? routeForSource(entry.source || notificationRouteSource(groupKey, entry), entry.route)
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

function itemSummaryText(item, fallback = '') {
  return firstText(item?.summary, item?.description, item?.content, item?.note, fallback);
}

function itemContextDescription(item, groupKey, fallback = '') {
  return firstText(
    item?.contextDescription,
    item?.context,
    itemSummaryText(item),
    fallback,
    notificationGroupMeta(groupKey).note,
    '打开对应页面继续处理。'
  );
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
        label: textOf(item.title, '待确认合同'),
        value: `${textOf(item.version, 'v1')} · ${textOf(item.period, '待确认')} · ${textOf(item.summary, '客户已发来新版本')}`,
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
        label: textOf(task.title, '合同'),
        value: textOf(task.note, progress || '打开合同继续处理。'),
        route: routeForSource('tasks')
      });
    });

    listOf(page.value?.acceptRecords).forEach((record) => {
      related.reviews.push({
        label: textOf(record.title, '合同记录'),
        value: `${textOf(record.amountValue, '待处理金额')} · ${textOf(record.stage, '待验收')}`,
        route: routeForSource('records', record.route)
      });
    });

    listOf(page.value?.messages).forEach((message) => {
      const text = `${textOf(message.from, '合同伙伴')} · ${textOf(message.text, '打开消息继续处理')}`;
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
        label: textOf(task.title, '合同'),
        value: `${status || '待处理'} · ${textOf(task.note, '打开合同继续处理。')}`,
        route: routeForSource('tasks')
      });
    });

    listOf(page.value?.publishRecords).forEach((record) => {
      const stage = textOf(record.stage);
      const group = stage.includes('评级') || stage.includes('验收') || textOf(record.rating).includes('级')
        ? 'reviews'
        : 'followup';
      related[group].push({
        label: textOf(record.title, '发布记录'),
        value: `${textOf(record.amountValue, '待处理金额')} · ${stage || '打开记录详情'}`,
        route: routeForSource('records', record.route)
      });
    });

    listOf(page.value?.liveConversation).forEach((message) => {
      related.followup.push({
        label: textOf(message.author, '协作者'),
        value: `${textOf(message.text, '打开消息继续处理')} · ${textOf(message.time, '刚刚')}`,
        route: routeForSource('messages')
      });
    });

    listOf(page.value?.recommendedTalents).forEach((talent) => {
      related.matching.push({
        label: textOf(talent.name, '推荐人才'),
        value: `${textOf(talent.role, '职位待补充')} · ${textOf(talent.reason, '查看推荐原因')}`,
        route: routeForSource('matching')
      });
    });
  }

  return related;
}

function buildLegacyNotificationItems() {
  const related = buildLegacyRelatedEntries();
  return listOf(page.value?.attentionItems).map((item, index) => {
    const legacyGroupKey = groupKeyForItem(item);
    const groupKey = notificationMessageGroupKey(legacyGroupKey, item);
    const originalRouteValue = item?.route || item?.to || item?.link;
    const routeQuery = routeQueryOf(item?.route || item?.to || item?.link);
    const itemId = textOf(item.itemId, item.id, routeQuery.itemId, `notification-${index}`);
    const taskId = textOf(item.taskId, item.summary?.taskId, item.task?.taskId, routeQuery.taskId);
    const recordId = textOf(item.recordId, item.record?.recordId, item.record?.id, routeQuery.recordId);
    const room = textOf(item.room, item.roomKey, item.roomId, item.taskRoom?.roomKey, routeQuery.room, routeQuery.roomKey);
    const count = numberOf(item.count);
    const groupLabel = notificationGroupMeta(groupKey).label;
    const summaryText = itemSummaryText(item, `${groupLabel}里有 ${count} 条新提醒。`);
    const contextText = itemContextDescription(item, groupKey, notificationGroupMeta(groupKey).note);
    const routeSource = notificationRouteSource(legacyGroupKey, item);
    const routeContext = {
      group: groupKey,
      itemId,
      taskId,
      recordId,
      room,
      requestedTalentIds: listOf(item?.requestedTalentUserIds || item?.requestedTalentIds),
      requestedTalentSlugs: listOf(item?.requestedTalentSlugs),
      financeAction: textOf(item.financeAction, routeQuery.financeAction),
      source: textOf(routeSource, item.source, routeQuery.source),
      originSource: textOf(item.originSource, routeQuery.originSource),
      surface: textOf(item.surface, routeQuery.surface),
      originSurface: textOf(item.originSurface, routeQuery.originSurface),
      kind: textOf(item.kind, item.type, routeQuery.kind)
    };
    const route = legacyGroupKey === 'reviews'
      ? reviewPrimaryRoute(routeContext, item.route)
      : attachRouteContext(routeForSource(routeSource, item.route, {
          ...routeContext,
          primaryActionLabel: item.primaryActionLabel,
          secondaryActionLabel: item.secondaryActionLabel,
          title: item.title,
          summary: item.summary,
          status: item.status
        }), routeContext);
    const primaryActionLabel = ctaLabelForRoute(route, primaryActionFallbackLabel(groupKey));
    const secondaryRoute = legacyGroupKey === 'reviews'
      ? recordHistoryRoute(routeContext)
      : legacyGroupKey === 'matching'
        ? matchingSecondaryRoute(routeContext)
        : originalRouteValue
          ? attachRouteContext(routeForSource(routeSource, originalRouteValue, {
              ...routeContext,
              primaryActionLabel: item.primaryActionLabel,
              secondaryActionLabel: item.secondaryActionLabel,
              title: item.title,
              summary: item.summary,
              status: item.status
            }), routeContext)
          : null;
    const normalizedSecondaryRoute = routesSharePath(route, secondaryRoute) ? null : secondaryRoute;
    const secondaryActionLabel = normalizedSecondaryRoute ? ctaLabelForRoute(normalizedSecondaryRoute, secondaryActionFallbackLabel(groupKey)) : '';
    const baseRelated = listOf(related[legacyGroupKey]).slice(0, 3);

    return {
      id: textOf(item.id, `notification-${index}`),
      itemId,
      title: textOf(item.label, groupLabel),
      summary: summaryText,
      groupKey,
      groupLabel,
      count,
      countLabel: `${count} 项`,
      status: textOf(item.label, groupLabel),
      note: textOf(item.note, count > 0 ? '点开对应按钮继续处理。' : '当前还没有新的提醒。'),
      updatedAt: textOf(page.value?.summary?.latestUpdatedAt, '实时汇总'),
      taskId,
      recordId,
      room,
      route,
      primaryActionLabel,
      secondaryActionLabel,
      secondaryRoute: normalizedSecondaryRoute,
      contextDescription: contextText,
      unread: count > 0,
      urgent: groupKey !== 'announcements',
      active: false,
      highlights: [
        { label: '当前处理对象', value: summaryText || textOf(item.label, '当前通知') },
        { label: '下一步', value: contextText || notificationGroupMeta(groupKey).note || '打开对应页面继续处理。' }
      ],
      related: baseRelated.length
        ? baseRelated
        : [
            { label: sourceLabel(notificationRouteSource(groupKey, routeContext)), value: '暂时还没有更多辅助信息，先打开主入口继续。' }
          ],
      actions: [
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
          to: secondaryRoute
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
    const legacyGroupKey = groupKeyForItem(item);
    const groupKey = notificationMessageGroupKey(legacyGroupKey, item);
    const group = notificationGroupMeta(groupKey);
    const routeSource = notificationRouteSource(legacyGroupKey, item);
    const count = numberOf(item?.count ?? item?.unreadCount ?? item?.total ?? item?.size ?? 1);
    const originalRouteValue = item?.route || item?.to || item?.link;
    const routeQuery = routeQueryOf(item?.route || item?.to || item?.link);
    const itemId = textOf(item?.itemId, item?.id, item?.key, routeQuery.itemId, `notification-${index}`);
    const taskId = textOf(item?.taskId, item?.summary?.taskId, item?.task?.taskId, routeQuery.taskId);
    const recordId = textOf(item?.recordId, item?.record?.recordId, item?.record?.id, routeQuery.recordId);
    const room = textOf(item?.room, item?.roomKey, item?.roomId, item?.taskRoom?.roomKey, routeQuery.room, routeQuery.roomKey);
    const summaryText = itemSummaryText(item, `${group.label}里有 ${count} 条新提醒。`);
    const contextText = itemContextDescription(item, groupKey, group.note);
    const routeContext = {
      group: groupKey,
      itemId,
      taskId,
      recordId,
      room,
      requestedTalentIds: listOf(item?.requestedTalentUserIds || item?.requestedTalentIds),
      requestedTalentSlugs: listOf(item?.requestedTalentSlugs),
      financeAction: textOf(item?.financeAction, routeQuery.financeAction),
      source: textOf(item?.source, routeQuery.source, routeSource),
      originSource: textOf(item?.originSource, routeQuery.originSource),
      surface: textOf(item?.surface, routeQuery.surface),
      originSurface: textOf(item?.originSurface, routeQuery.originSurface),
      kind: textOf(item?.kind, item?.type, routeQuery.kind)
    };
    const primaryActionLabelFallback = primaryActionFallbackLabel(groupKey);
    const secondaryActionLabelFallback = secondaryActionFallbackLabel(groupKey);
    const secondaryActionLabelSeed = textOf(item?.secondaryActionLabel || item?.secondaryLabel, secondaryActionLabelFallback);
    const route = legacyGroupKey === 'reviews'
      ? reviewPrimaryRoute(routeContext, item?.route || item?.to || item?.link)
      : attachRouteContext(routeForSource(routeSource, item?.route || item?.to || item?.link, {
          ...routeContext,
          primaryActionLabel: textOf(item?.primaryActionLabel || item?.actionLabel || item?.cta, primaryActionLabelFallback),
          secondaryActionLabel: secondaryActionLabelSeed,
          title: item?.title || item?.label || item?.name,
          summary: item?.summary || item?.description || item?.content,
          status: item?.status || item?.state
        }), routeContext);
    const primaryActionLabel = textOf(
      item?.primaryActionLabel || item?.actionLabel || item?.cta,
      ctaLabelForRoute(route, primaryActionLabelFallback)
    );
    const relatedEntries = normalizeNotificationEntries(item?.related || item?.context || item?.details, groupKey, sourceLabel(routeSource));
    const highlights = normalizeNotificationEntries(item?.highlights || item?.summaryItems, groupKey, group.label);
    const baseRelated = relatedEntries.length ? relatedEntries : listOf(related[legacyGroupKey]).slice(0, 3);
    const secondaryRouteValue = item?.secondaryRoute || item?.secondaryTo || item?.secondaryLink;
    const secondarySource = item?.secondarySource || (routeSource === 'recruiting'
      ? 'recruiting'
      : legacyGroupKey === 'reviews'
        ? 'records'
        : legacyGroupKey === 'matching'
          ? 'matching'
          : 'messages');
    const fallbackSecondaryRoute =
      legacyGroupKey === 'reviews'
        ? recordHistoryRoute(routeContext)
        : legacyGroupKey === 'matching'
          ? matchingSecondaryRoute(routeContext)
          : originalRouteValue
            ? routeForSource(routeSource, originalRouteValue, {
                ...routeContext,
                primaryActionLabel,
                secondaryActionLabel: secondaryActionLabelSeed,
            title: item?.title || item?.label || item?.name,
            summary: item?.summary || item?.description || item?.content,
            status: item?.status || item?.state
              })
            : null;
    const secondaryActionLabel = textOf(
      item?.secondaryActionLabel || item?.secondaryLabel,
      fallbackSecondaryRoute ? ctaLabelForRoute(fallbackSecondaryRoute, secondaryActionLabelFallback) : ''
    );

    return {
      id: textOf(item?.id || item?.key, `notification-${index}`),
      itemId,
      title: textOf(item?.title || item?.label || item?.name, group.label),
      summary: summaryText,
      talentUserId: textOf(item?.talentUserId, item?.summary?.talentUserId),
      platformUserId: textOf(item?.platformUserId, item?.summary?.platformUserId),
      groupKey,
      groupLabel: textOf(item?.groupLabel || item?.categoryLabel, group.label),
      count,
      countLabel: `${count} 项`,
      status: textOf(item?.status || item?.state, textOf(item?.title || item?.label || item?.name, group.label)),
      note: textOf(item?.note, count > 0 ? '点开对应按钮继续处理。' : '当前还没有新的提醒。'),
      updatedAt: textOf(item?.updatedAt || item?.time || item?.updatedTime, textOf(page.value?.summary?.latestUpdatedAt, '实时汇总')),
      taskId,
      recordId,
      room,
      route,
      primaryActionLabel,
      secondaryActionLabel,
      secondaryRoute: secondaryRouteValue && !routesSharePath(route, attachRouteContext(routeForSource(secondarySource, secondaryRouteValue), {
        group: groupKey,
        itemId,
        taskId,
        recordId,
        room
      }))
        ? attachRouteContext(routeForSource(secondarySource, secondaryRouteValue), {
          group: groupKey,
          itemId,
          taskId,
          recordId,
          room
        })
        : !routesSharePath(route, fallbackSecondaryRoute)
          ? attachRouteContext(fallbackSecondaryRoute, {
            group: groupKey,
            itemId,
            taskId,
            recordId,
            room
          })
          : null,
      contextDescription: contextText,
      unread: count > 0,
      urgent: groupKey !== 'announcements',
      active: false,
      highlights: highlights.length
        ? highlights
        : [
            { label: '当前处理对象', value: summaryText || textOf(item?.label || item?.title || item?.name, '当前通知') },
            { label: '下一步', value: contextText || group.note || '打开对应页面继续处理。' }
          ],
      related: baseRelated.length
        ? baseRelated
        : [
            { label: sourceLabel(routeSource), value: '暂时还没有更多辅助信息，先打开主入口继续。' }
          ],
      actions: Array.isArray(item?.actions) && item.actions.length
        ? item.actions.map((action, actionIndex) => {
            const tone = action?.tone === 'secondary' ? 'secondary' : 'primary';
            const resolvedRoute = attachRouteContext(action?.to ? routeForSource(action?.source || routeSource, action.to) : route, {
              group: groupKey,
              itemId,
              taskId,
              recordId,
              room
            });
            const fallbackLabel = tone === 'secondary' ? secondaryActionLabel : primaryActionLabel;
            return {
              key: textOf(action?.key, `action-${actionIndex}`),
              label: textOf(action?.label, ctaLabelForRoute(resolvedRoute, fallbackLabel)),
              tone,
              to: resolvedRoute
            };
          })
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
              to: fallbackSecondaryRoute
                ? attachRouteContext(fallbackSecondaryRoute, {
                    group: groupKey,
                    itemId,
                    taskId,
                    recordId,
                    room
                  })
                : null
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
    { all: 0, announcements: 0, tasks: 0, account: 0 }
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
const isMatchingView = computed(() => false);

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
      label: '打开这个分类的第一条',
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
    label: '清除当前焦点',
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
const selectedRecruitingInvite = computed(() => {
  if (!selectedItem.value || selectedItemMissing.value) {
    return null;
  }
  if (selectedItem.value.groupKey !== 'tasks') {
    return null;
  }
  return isRecruitingMessage(selectedItem.value) && hasRecruitingInviteFields(selectedItem.value)
    ? selectedItem.value
    : null;
});
const selectedRecruitingInviteDetails = computed(() => {
  if (!selectedRecruitingInvite.value) {
    return null;
  }

  const item = selectedRecruitingInvite.value;
  return {
    taskName: firstText(
      item?.taskTitle,
      item?.taskName,
      item?.task?.title,
      item?.title,
      item?.label,
      '面试邀约'
    ),
    companyName: firstText(
      recruitingInviteCompanyName(item),
      '邀请企业'
    ),
    interviewTime: firstText(
      recruitingInviteTime(item),
      '待确认'
    ),
    meetingCode: firstText(
      recruitingInviteMeetingCode(item),
      '待确认'
    ),
    note: firstText(item?.note, item?.summary, item?.description, '暂无备注')
  };
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
      withSource(isTalent.value ? roleRouteMap.talent.market : roleRouteMap.enterprise.approvals),
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
    return isTalent.value ? '去找工作' : '打开审批';
  }

  const contextPrimaryAction = selectedContextActions.value.find((action) => action.tone === 'primary' && action.to)
    || selectedContextActions.value.find((action) => action.to);

  if (contextPrimaryAction?.label) {
    return contextPrimaryAction.label;
  }

  if (selectedItem.value?.primaryActionLabel) {
    return selectedItem.value.primaryActionLabel;
  }

  return selectedItemMissing.value
    ? invalidRecoveryActions.value[0]?.label || '清除当前焦点'
    : ctaLabelForRoute(selectedPrimaryRoute.value);
});
const selectedContextActions = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value;
  }

  const itemActions = listOf(selectedItem.value?.actions)
    .map((action, actionIndex) => ({
      key: textOf(action?.key, `action-${actionIndex}`),
      label: textOf(
        action?.label,
        ctaLabelForRoute(
          action?.to,
          action?.tone === 'secondary'
            ? secondaryActionFallbackLabel(selectedItem.value?.groupKey)
            : primaryActionFallbackLabel(selectedItem.value?.groupKey)
        )
      ),
      tone: action?.tone === 'secondary' ? 'secondary' : 'primary',
      to: action?.to
    }))
    .filter((action) => action.to);

  if (itemActions.length) {
    const deduped = [];
    const seenPaths = new Set();
    const seenLabels = new Set();

    itemActions.forEach((action) => {
      const path = typeof action.to === 'string'
        ? action.to.split('?')[0]
        : String(action.to?.path || '');
      const labelKey = String(action.label || '').trim().toLowerCase();
      if (!path || seenPaths.has(path) || seenLabels.has(labelKey) || deduped.length >= 2) {
        return;
      }
      seenPaths.add(path);
      if (labelKey) {
        seenLabels.add(labelKey);
      }
      deduped.push(action);
    });

    if (deduped.length) {
      return deduped;
    }
  }

  const secondaryRoute = (() => {
    const target = selectedItem.value?.secondaryRoute;
    if (!target) {
      return null;
    }
    const primaryPath = typeof selectedPrimaryRoute.value === 'string'
      ? selectedPrimaryRoute.value.split('?')[0]
      : String(selectedPrimaryRoute.value?.path || '');
    const secondaryPath = typeof target === 'string'
      ? target.split('?')[0]
      : String(target?.path || '');
    return secondaryPath && secondaryPath === primaryPath ? null : target;
  })();

  const actions = [
    {
      key: 'primary',
      label: selectedPrimaryLabel.value,
      tone: 'primary',
      to: selectedPrimaryRoute.value
    }
  ];

  if (secondaryRoute) {
    actions.push({
      key: 'secondary',
      label: textOf(
        selectedItem.value?.secondaryActionLabel,
        ctaLabelForRoute(secondaryRoute, secondaryActionFallbackLabel(selectedItem.value?.groupKey))
      ),
      tone: 'secondary',
      to: secondaryRoute
    });
  }

  return actions;
});
const selectedSecondaryAction = computed(() => {
  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value[1] || null;
  }

  const secondaryAction = selectedContextActions.value.find((action) => action.tone === 'secondary' && action.to)
    || selectedContextActions.value[1]
    || null;
  if (secondaryAction && routesSharePath(secondaryAction.to, selectedPrimaryRoute.value)) {
    return null;
  }
  if (secondaryAction && textOf(secondaryAction.label).trim().toLowerCase() === textOf(selectedPrimaryLabel.value).trim().toLowerCase()) {
    return null;
  }
  return secondaryAction;
});
const isApprovalCenter = computed(() => !isTalent.value && (route.path.includes('/approvals') || route.meta?.title === '审批中心'));
const secondarySummaryRoute = computed(() => {
  const candidate = (() => {
    if (selectedSecondaryAction.value?.to) {
      return selectedSecondaryAction.value.to;
    }

    if (selectedItem.value?.secondaryRoute) {
      return selectedItem.value.secondaryRoute;
    }

    if (selectedItem.value?.related?.length) {
      const relatedRoute = selectedItem.value.related.find((entry) => entry?.route && !routesSharePath(entry.route, selectedPrimaryRoute.value))?.route;
      if (relatedRoute) {
        return relatedRoute;
      }
    }

    if (selectedItemMissing.value) {
      return invalidRecoveryActions.value[1]?.to || null;
    }

    return null;
  })();

  const primaryPath = routePathOf(selectedPrimaryRoute.value);
  const secondaryPath = routePathOf(candidate);

  return secondaryPath && secondaryPath === primaryPath ? null : candidate;
});
const secondarySummaryLabel = computed(() => {
  if (selectedSecondaryAction.value?.label) {
    return selectedSecondaryAction.value.label;
  }

  if (selectedItemMissing.value) {
    return invalidRecoveryActions.value[1]?.label || '';
  }

  if (!secondarySummaryRoute.value) {
    return '';
  }

  return textOf(selectedItem.value?.secondaryActionLabel, ctaLabelForRoute(secondarySummaryRoute.value, secondaryActionFallbackLabel(selectedItem.value?.groupKey)));
});
const summaryEyebrow = computed(() => (isApprovalCenter.value ? '审批中心' : '通知中心'));
const summaryTitle = computed(() => {
  if (isZeroState.value) {
    return isApprovalCenter.value ? '审批概览' : '通知概览';
  }

  return textOf(
    selectedItem.value?.title,
    isTalent.value ? '先处理当前事项' : (isApprovalCenter.value ? '先处理当前审批' : '先处理当前事项')
  );
});
const summaryDescription = computed(() => {
  if (selectedItemMissing.value) {
    return '请先从列表中重新选择这项内容。';
  }

  if (isZeroState.value) {
    return '当前没有需要处理的事项。';
  }

  return firstText(
    selectedItem.value?.contextDescription,
    selectedItem.value?.summary,
    selectedItem.value?.note,
    selectedItem.value?.status,
    isTalent.value ? '先确认，再继续执行。' : '先处理确认、变更和评级。'
  );
});
const summaryTotalNote = computed(() => (isZeroState.value ? '' : '先处理最紧急的一项。'));
const summaryStats = computed(() => {
  if (isZeroState.value) {
    return [];
  }

  return [
    {
      label: '待确认',
      value: String(groupItems.value.find((item) => item.key === 'confirmations')?.count || 0),
      note: isTalent.value ? '先确认版本和边界。' : '先确认范围和时间。'
    },
    {
      label: '验收',
      value: String(groupItems.value.find((item) => item.key === 'reviews')?.count || 0),
      note: '先完成验收、评级和结算衔接。'
    }
  ];
});
const summaryHighlights = computed(() => {
  if (selectedItemMissing.value) {
    return [
      {
        label: '当前通知',
        value: '当前定位已失效，请从列表中重新选择。'
      }
    ];
  }

  if (isZeroState.value) {
    return [];
  }

  if (selectedItem.value?.highlights?.length) {
    return selectedItem.value.highlights.slice(0, 2);
  }

  if (selectedItem.value?.related?.length) {
    return selectedItem.value.related.slice(0, 2);
  }

  return filteredItems.value.slice(0, 2).map((item) => ({
    label: item.title,
    value: item.contextDescription
  }));
});
const listTitle = computed(() => {
  const groupLabel = groupMeta[activeGroup.value]?.label || '全部';
  return `${groupLabel}通知`;
});
const listDescription = computed(() => {
  if (selectedItemMissing.value) {
    return '当前定位已失效。';
  }

  if (isZeroState.value) {
    return '当前没有新的通知。';
  }

  return '先从这里查看提醒，再用按钮进入对应页面继续处理。';
});
const listEmptyTitle = computed(() => {
  if (selectedItemMissing.value) {
    return '当前定位已失效';
  }

  return isZeroState.value ? '当前没有新的通知' : '这个分类里还没有新的提醒';
});
const listEmptyDescription = computed(() => {
  if (selectedItemMissing.value) {
    return '请从列表中重新选择，或切换分组继续处理。';
  }

  return isZeroState.value
    ? '新的公告、任务提醒和账号提醒会继续汇总到这里。'
    : '切换分类，查看其它提醒。';
});
const footerActions = computed(() =>
  selectedItemMissing.value
    ? invalidRecoveryActions.value
    : isZeroState.value
      ? []
      : !isTalent.value
      ? [{
          key: 'approval-center',
          label: isApprovalCenter.value ? '返回通知中心' : '返回审批中心',
          disabled: false,
          tone: 'secondary',
          to: attachRouteContext(
            withSource(isApprovalCenter.value ? roleRouteMap.enterprise.notifications : roleRouteMap.enterprise.approvals),
            selectedRouteContext.value
          )
        }]
      : []
);
const refreshLabel = computed(() => (isApprovalCenter.value ? '刷新审批' : '刷新通知'));

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
  const resolved = router.resolve(target);
  const resolvedPath = String(resolved?.path || '');
  const resolvedTaskId = String(resolved?.query?.taskId || '').trim();
  const resolvedRoomKey = String(resolved?.query?.roomKey || resolved?.query?.room || '').trim();
  const needsConversationContext = (
    resolvedPath.includes('/chat')
    || resolvedPath.includes('/room')
  ) && !resolvedTaskId && !resolvedRoomKey;
  const needsWorkspaceContext = resolvedPath.includes('/workspace') && !resolvedTaskId;
  if (needsConversationContext || needsWorkspaceContext) {
    navigationFeedback.value = {
      title: '缺少必要的上下文',
      message: needsConversationContext
        ? '这条入口缺少会话上下文，暂时无法打开。请从合同、通知详情或审批详情重新进入。'
        : '这条入口缺少任务信息，暂时无法打开。请从合同、通知详情或审批详情重新进入。'
    };
    return;
  }
  navigationFeedback.value = null;
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

async function handleRecruitingInterviewDecision(decision) {
  const item = selectedRecruitingInvite.value;
  if (!item) {
    return;
  }
  const talentUserId = Number(textOf(item?.talentUserId, item?.summary?.talentUserId, ''));
  if (!Number.isFinite(talentUserId) || talentUserId <= 0) {
    navigationFeedback.value = {
      title: '缺少申请人信息',
      message: '这条面试邀约缺少人才信息，暂时不能处理。'
    };
    return;
  }

  try {
    const api = await import('../services/api');
    const responder = api.respondRecruitingInterviewInvite || api.default?.respondRecruitingInterviewInvite;

    if (typeof responder !== 'function') {
      navigationFeedback.value = {
        title: '面试邀约接口暂未接入',
        message: '按钮已经挂到页面上了，等 respondRecruitingInterviewInvite 落地后就会直接调用。'
      };
      return;
    }

    const payload = await responder({
      taskId: textOf(item?.taskId, item?.summary?.taskId, item?.task?.taskId),
      talentUserId,
      decision
    });
    if (payload?.requestError || payload?.success === false) {
      navigationFeedback.value = {
        title: '面试邀约操作失败',
        message: textOf(payload?.requestError, payload?.message, '请稍后重试。')
      };
      return;
    }

    navigationFeedback.value = {
      title: decision === 'ACCEPT' ? '已同意面试' : '已拒绝面试',
      message: textOf(
        payload?.nextStep,
        decision === 'ACCEPT'
          ? '面试邀约已提交同意，后续会继续在通知里跟进。'
          : '面试邀约已提交拒绝，本次申请会结束。'
      )
    };

    await loadPage();
  } catch (error) {
    navigationFeedback.value = {
      title: '面试邀约操作失败',
      message: textOf(error?.message, '请稍后重试。')
    };
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
      return !scope || ['notifications', 'messages', 'workspace', 'acceptance', 'matching', 'reviews', 'records', 'settlement', 'billing', 'followup'].includes(scope);
    },
    onStatusChange: handleLiveSyncStatus,
    onSyncError: handleLiveSyncError
  });
});

watch([
  () => route.path,
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

.notification-center-page.is-matching-view :deep(.desktop-notification-summary),
.notification-center-page.is-matching-view :deep(.desktop-notification-list),
.notification-center-page.is-matching-view .notification-center-sidebar,
.notification-center-page.is-matching-view .notification-center-context {
  border-color: rgba(30, 128, 66, 0.14);
  background:
    linear-gradient(180deg, rgba(249, 252, 247, 0.98), rgba(240, 247, 241, 0.98)),
    radial-gradient(circle at top right, rgba(98, 181, 86, 0.08), transparent 34%);
  box-shadow: 0 22px 52px rgba(18, 52, 35, 0.08);
}

.notification-center-page.is-matching-view :deep(.desktop-notification-summary__metric),
.notification-center-page.is-matching-view :deep(.desktop-notification-summary__stat),
.notification-center-page.is-matching-view :deep(.desktop-notification-summary__highlights),
.notification-center-page.is-matching-view :deep(.desktop-notification-item),
.notification-center-page.is-matching-view .notification-center-group,
.notification-center-page.is-matching-view .notification-center-context__section {
  border-color: rgba(30, 128, 66, 0.12);
  background: rgba(255, 255, 255, 0.9);
}

.notification-center-page.is-matching-view .notification-center-group.is-active {
  border-color: rgba(30, 128, 66, 0.28);
  background: linear-gradient(180deg, #eff7ee 0%, #ffffff 100%);
}

.notification-center-context__section--matching-note {
  border: 1px solid rgba(30, 128, 66, 0.12);
  background: linear-gradient(180deg, rgba(241, 248, 242, 0.96), rgba(255, 255, 255, 0.98));
}

.notification-center-context__section--matching-note .muted {
  line-height: 1.72;
}
</style>

<style scoped>
/* codex visual polish */
.notification-center-workbench {
  grid-template-columns: 280px minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}
.notification-center-sidebar,
.notification-center-context {
  border-radius: 28px;
  background: #fcfcf8;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.05);
}
.notification-center-context__summary h3 {
  max-width: 14ch;
}
.notification-center-context__actions {
  gap: 10px;
}
.notification-center-context__actions .button-secondary {
  background: transparent;
}
@media (max-width: 1180px) {
  .notification-center-workbench {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.notification-message-page {
  gap: 18px;
}

.notification-message-header {
  border-radius: 28px;
  padding: 24px 26px;
  background:
    radial-gradient(circle at top left, rgba(229, 245, 228, 0.72), transparent 36%),
    #fffdf8;
  border: 1px solid rgba(32, 76, 42, 0.08);
}

.notification-message-header h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.06;
  letter-spacing: -0.04em;
}

.notification-message-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.notification-message-filter {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: rgba(255, 255, 255, 0.92);
  color: #253125;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font: inherit;
  cursor: pointer;
}

.notification-message-filter strong {
  font-size: 15px;
}

.notification-message-filter span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  background: #eef2eb;
  color: #556255;
  font-size: 13px;
  font-weight: 700;
}

.notification-message-filter.is-active {
  border-color: rgba(68, 155, 34, 0.28);
  background: linear-gradient(180deg, #eef7ea 0%, #ffffff 100%);
  box-shadow: 0 14px 28px rgba(70, 124, 53, 0.1);
}

.notification-message-filter.is-active span {
  background: #449b22;
  color: #fff;
}

.notification-message-stream {
  border-radius: 30px;
  padding: 22px;
  background:
    radial-gradient(circle at top right, rgba(235, 246, 232, 0.58), transparent 34%),
    #fffdf8;
}

.notification-message-list :deep(.desktop-notification-list) {
  border-radius: 26px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: none;
}

.notification-message-helper {
  border-radius: 24px;
  border: 1px solid rgba(68, 155, 34, 0.14);
  background: linear-gradient(180deg, rgba(241, 248, 238, 0.96), rgba(255, 255, 255, 0.98));
  padding: 18px 20px;
}

.notification-message-helper strong {
  font-size: 22px;
  line-height: 1.12;
}

.notification-message-helper--invite {
  border-color: rgba(68, 155, 34, 0.2);
  background: linear-gradient(180deg, rgba(240, 249, 236, 0.98), rgba(255, 255, 255, 0.98));
}

.notification-message-invite-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.notification-message-invite-grid > div {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.9);
}

.notification-message-invite-grid strong {
  line-height: 1.4;
}

.notification-message-invite-actions {
  margin-top: 2px;
}

@media (max-width: 820px) {
  .notification-message-invite-grid {
    grid-template-columns: 1fr;
  }
}
</style>
