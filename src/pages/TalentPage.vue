<template>
  <section class="page-stack dashboard-page" v-if="page">
    <section class="dashboard-cockpit-grid" :class="{ 'is-single': !showOverviewRail }">
      <DesktopAttentionHub
        :eyebrow="dashboardHubEyebrow"
        :title="dashboardHubTitle"
        :description="dashboardHubDescription"
        :summary-label="dashboardSummaryLabel"
        :summary-value="attentionSummaryDisplay"
        :summary-note="dashboardSummaryNote"
        :stats="attentionHubStats"
        :items="attentionHubItems"
        detail-title="资料回看"
        detail-description="作品、档期和评价继续放在次级层。"
        :detail-items="attentionHubDetails"
        toggle-label="更多"
        :primary-action="attentionPrimaryAction"
        :secondary-action="attentionSecondaryAction"
      />

      <article v-if="showOverviewRail" class="glass-panel dashboard-overview-rail stack-sm">
        <div class="dashboard-overview-header">
          <span class="eyebrow">工作摘要</span>
          <h3>{{ overviewTitle }}</h3>
        </div>

        <div class="dashboard-overview-list">
          <article v-for="item in snapshotItems" :key="item.label" class="dashboard-overview-item">
            <div class="dashboard-overview-copy">
              <span class="dashboard-overview-label">{{ item.label }}</span>
            </div>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </article>
    </section>

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

    <section class="dashboard-module-list">
      <article v-for="module in primaryModules" :key="module.id" class="glass-panel dashboard-module-card">
        <div class="dashboard-module-row">
          <div class="dashboard-module-copy">
            <div class="dashboard-module-heading">
              <h3>{{ module.title }}</h3>
              <p class="muted">{{ module.description }}</p>
            </div>
            <div class="dashboard-module-preview">
              <p class="dashboard-module-meta">{{ module.preview[0] }}</p>
              <p v-if="module.preview[1]" class="dashboard-module-submeta muted">{{ module.preview[1] }}</p>
            </div>
          </div>

          <div class="dashboard-module-actions">
            <button class="button-secondary" type="button" @click="openModule(module)">
              打开
            </button>
          </div>
        </div>
      </article>
    </section>

    <section v-if="secondaryModules.length" class="glass-panel dashboard-secondary-strip">
      <div class="dashboard-secondary-copy">
        <span class="eyebrow">次级入口</span>
        <strong>协作和记录继续放在次级层。</strong>
        <p class="muted">首屏先处理待确认和主入口，执行细节继续留在次级入口和左侧导航里。</p>
      </div>

      <div class="dashboard-secondary-actions">
        <button
          v-for="module in secondaryModules"
          :key="module.id"
          class="button-secondary"
          type="button"
          @click="openModule(module)"
        >
          {{ module.title }}
        </button>
      </div>
    </section>

    <div v-if="activeModule" class="dashboard-detail-modal" @click.self="closeModule">
      <article class="dashboard-detail-card stack-md" role="dialog" aria-modal="true">
        <div class="panel-header">
          <div>
            <h3>{{ activeModule.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeModule">关闭</button>
        </div>

        <p class="muted">{{ activeModule.description }}</p>

        <div class="dashboard-detail-section">
          <h4>简要预览</h4>
          <ul class="dashboard-detail-list">
            <li v-for="item in activeModule.details.slice(0, 4)" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div class="dashboard-module-actions">
          <router-link class="button-primary" :to="resolveModuleNotificationRoute(activeModule)" @click="closeModule">
            进入通知中心
          </router-link>
          <router-link v-if="activeModule.allowDirectRoute && activeModule.route" class="button-secondary" :to="activeModule.route" @click="closeModule">
            保留原入口
          </router-link>
          <button v-else class="button-primary" type="button" @click="closeModule">已了解</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import DesktopAttentionHub from '../components/DesktopAttentionHub.vue';
import LiveSyncStatusBar from '../components/LiveSyncStatusBar.vue';
import { getTalentData } from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream';
import { roleRouteMap } from '../utils/roleRoutes';
import { buildCenterEntryRoute, pickPreferredAttentionItem } from '../utils/attentionNavigation';

const page = ref(null);
const activeModuleId = ref('');
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

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function joinText(value, separator = ' / ') {
  const items = listOf(value).filter(Boolean);
  return items.length ? items.join(separator) : '标签待补充';
}

function stringValue(value) {
  return value == null ? '' : String(value).trim();
}

function normalizeGroupKey(value) {
  const normalized = stringValue(value).toLowerCase();
  if (!normalized) {
    return '';
  }
  if (normalized.includes('all') || normalized.includes('全部')) {
    return 'all';
  }
  if (normalized.includes('confirm') || normalized.includes('确认')) {
    return 'confirmations';
  }
  if (normalized.includes('change') || normalized.includes('修改')) {
    return 'changes';
  }
  if (normalized.includes('selection') || normalized.includes('match') || normalized.includes('选人') || normalized.includes('发布')) {
    return 'matching';
  }
  if (normalized.includes('grade') || normalized.includes('review') || normalized.includes('验收') || normalized.includes('评级')) {
    return 'reviews';
  }
  if (normalized.includes('cancel') || normalized.includes('取消')) {
    return 'cancellations';
  }
  if (normalized.includes('follow') || normalized.includes('chat') || normalized.includes('message') || normalized.includes('回看')) {
    return 'followup';
  }
  return '';
}

function looksLikeTaskContext(source) {
  if (!source || typeof source !== 'object') {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(source, 'taskId') ||
    Object.prototype.hasOwnProperty.call(source, 'progress') ||
    Object.prototype.hasOwnProperty.call(source, 'stage') ||
    Object.prototype.hasOwnProperty.call(source, 'status') ||
    Object.prototype.hasOwnProperty.call(source, 'note') ||
    Object.prototype.hasOwnProperty.call(source, 'attachments')
  );
}

function looksLikeRecordContext(source) {
  if (!source || typeof source !== 'object') {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(source, 'recordId') ||
    Object.prototype.hasOwnProperty.call(source, 'amount') ||
    Object.prototype.hasOwnProperty.call(source, 'amountValue') ||
    Object.prototype.hasOwnProperty.call(source, 'rating') ||
    Object.prototype.hasOwnProperty.call(source, 'counterpartName') ||
    Object.prototype.hasOwnProperty.call(source, 'partnerName') ||
    Object.prototype.hasOwnProperty.call(source, 'startAt') ||
    Object.prototype.hasOwnProperty.call(source, 'endAt') ||
    Object.prototype.hasOwnProperty.call(source, 'startDate') ||
    Object.prototype.hasOwnProperty.call(source, 'endDate')
  );
}

function mergeRouteContext(...sources) {
  const context = {};
  const queue = [...sources];

  const assign = (key, value) => {
    const next = stringValue(value);
    if (next && !context[key]) {
      context[key] = next;
    }
  };

  while (queue.length) {
    const source = queue.shift();
    if (!source) {
      continue;
    }
    if (Array.isArray(source)) {
      queue.unshift(...source);
      continue;
    }
    if (typeof source !== 'object') {
      continue;
    }

    assign('taskId', source.taskId ?? source.summary?.taskId ?? source.task?.taskId ?? source.task?.id);
    assign('room', source.room ?? source.roomKey ?? source.roomId ?? source.taskRoom?.roomKey ?? source.taskRoom?.roomId);
    if (looksLikeRecordContext(source)) {
      assign('recordId', source.recordId ?? source.id ?? source.record?.recordId ?? source.record?.id);
    }
    if (looksLikeTaskContext(source)) {
      assign('taskId', source.taskId ?? source.id ?? source.task?.taskId ?? source.task?.id);
    }
    assign('source', source.source ?? source.origin ?? source.entrySource ?? source.inputSource);
  }

  return context;
}

function buildQuery(context, allowedKeys = ['taskId', 'room', 'recordId', 'source']) {
  const query = {};

  allowedKeys.forEach((key) => {
    const value = stringValue(context?.[key]);
    if (value) {
      query[key] = value;
    }
  });

  return query;
}

function buildRoute(path, context, allowedKeys) {
  const query = buildQuery(context, allowedKeys);
  if (!query.source) {
    query.source = 'dashboard-talent';
  }
  return Object.keys(query).length ? { path, query } : { path };
}

function buildNotificationCenterRoute(preferredItem) {
  return buildCenterEntryRoute({
    path: roleRouteMap.talent.notifications,
    source: 'dashboard-talent',
    preferredItem
  });
}

function buildChatRoute(...sources) {
  return buildRoute(roleRouteMap.talent.messages, mergeRouteContext(...sources));
}

function buildWorkspaceRoute(...sources) {
  return buildRoute(roleRouteMap.talent.workspace, mergeRouteContext(...sources));
}

function buildRecordRoute(...sources) {
  const context = mergeRouteContext(...sources);

  if (context.recordId) {
    return buildRoute(roleRouteMap.talent.recordDetail(context.recordId), context, ['taskId', 'room', 'source']);
  }

  return buildRoute(roleRouteMap.talent.records, context);
}

function buildModuleRoute(moduleId, ...sources) {
  switch (moduleId) {
    case 'messages':
      return buildChatRoute(...sources);
    case 'workspace':
      return buildWorkspaceRoute(...sources);
    case 'records':
      return buildRecordRoute(...sources);
    default:
      return buildRoute(roleRouteMap.talent.market, mergeRouteContext(...sources), ['taskId', 'source']);
  }
}

function buildModuleContext(moduleId) {
  const attentionContext = attentionItems.value;
  const moduleSources = {
    messages: [page.value, attentionContext, listOf(page.value?.messages), listOf(page.value?.activeTasks), listOf(page.value?.acceptRecords)],
    workspace: [page.value, attentionContext, listOf(page.value?.activeTasks), listOf(page.value?.messages), listOf(page.value?.acceptRecords)],
    records: [page.value, attentionContext, listOf(page.value?.acceptRecords), listOf(page.value?.activeTasks), listOf(page.value?.messages)],
    market: [page.value, attentionContext, listOf(page.value?.marketplace)]
  };

  return mergeRouteContext(...(moduleSources[moduleId] || [page.value, attentionContext]));
}

function resolveModuleNotificationRoute(module) {
  const moduleId = typeof module === 'string' ? module : module?.id;
  const preferredAttention = pickPreferredAttentionItem(hubSourceItems.value, moduleId, {
    excludeGroupsByModule: {
      workspace: ['followup']
    },
    preferredGroupsByModule: {
      market: ['matching']
    }
  });

  switch (moduleId) {
    case 'messages':
      return buildNotificationCenterRoute(preferredAttention);
    case 'workspace':
      return buildNotificationCenterRoute(preferredAttention);
    case 'records':
      return buildNotificationCenterRoute(preferredAttention);
    default:
      return buildNotificationCenterRoute(preferredAttention);
  }
}

const attentionItems = computed(() => listOf(page.value?.attentionItems));
const notificationItems = computed(() =>
  listOf(page.value?.notificationItems).filter((item) => normalizeGroupKey(item?.groupKey || item?.id || item?.label || item?.title) !== 'followup')
);
const notificationGroups = computed(() => listOf(page.value?.notificationGroups));
const hubSourceItems = computed(() => (notificationItems.value.length ? notificationItems.value : attentionItems.value));
const notificationCenterRoute = computed(() => buildNotificationCenterRoute(hubSourceItems.value[0]));
const attentionTotal = computed(
  () => hubSourceItems.value.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
);
const attentionSummaryValue = computed(() => `${attentionTotal.value} 项`);
const attentionSummaryDisplay = computed(() => (attentionTotal.value ? `${attentionTotal.value} 项` : '已清空'));
const dashboardSummaryLabel = computed(() => (attentionTotal.value ? '待处理事项' : '当前状态'));
const dashboardHubEyebrow = computed(() => (attentionTotal.value ? '待确认' : '当前状态'));
const dashboardHubTitle = computed(() => (attentionTotal.value ? '先确认' : '当前没有优先事项'));
const dashboardHubDescription = computed(() =>
  attentionTotal.value
    ? String(page.value?.attentionHeadline || '先确认任务，再决定是否修改。')
    : '直接进入聊天或任务广场即可。'
);
const dashboardSummaryNote = computed(() =>
  attentionTotal.value ? '先清确认、修改、验收。' : '首屏只保留最常用入口，次级信息下沉。'
);
const attentionHubItems = computed(() =>
  hubSourceItems.value.slice(0, 4).map((item, index) => ({
    id: item.id || `talent-attention-${index}`,
    label: item.label,
    note: String(item.note || item.copy || item.description || item.summary || '先进入通知中心，再落到当前事项'),
    count: item.count,
    to: buildNotificationCenterRoute(item)
  }))
);
const attentionPrimaryAction = computed(() => {
  return {
    to: attentionTotal.value ? notificationCenterRoute.value : roleRouteMap.talent.market,
    label: attentionTotal.value ? '通知中心' : '任务广场'
  };
});
const attentionSecondaryAction = computed(() => ({
  to: attentionTotal.value ? roleRouteMap.talent.market : roleRouteMap.talent.messages,
  label: attentionTotal.value ? '任务广场' : '去聊天'
}));
function groupCount(groupKey) {
  const group = notificationGroups.value.find((item) => normalizeGroupKey(item?.key || item?.id || item?.label || item?.name) === groupKey);
  if (group) {
    return Number(group.count) || 0;
  }
  return notificationItems.value
    .filter((item) => normalizeGroupKey(item?.groupKey || item?.id || item?.label || item?.title) === groupKey)
    .reduce((sum, item) => sum + (Number(item.count) || 0), 0);
}
const attentionHubStats = computed(() => {
  if (!attentionTotal.value) {
    return [];
  }

  return [
    {
      label: '待确认',
      value: String(groupCount('confirmations') || 0),
      note: '先确认任务，再决定是否提出修改。'
    },
    {
      label: '待修改',
      value: String(groupCount('changes') || 0),
      note: '集中处理任务范围、工期和补充说明。'
    },
    {
      label: '待验收',
      value: String(groupCount('reviews') || 0),
      note: '已接近收尾的任务尽快完成交付。'
    }
  ].filter((item) => Number(item.value) > 0);
});

const summaryHighlights = computed(() => {
  if (!page.value) {
    return [];
  }

  const openDays = listOf(page.value.calendar).filter((item) => item.state === 'open').length;

  return [
    `评分 ${page.value.hero.score}`,
    `收入 ${page.value.hero.income}`,
    `档期 ${openDays} 天`
  ];
});
const attentionHubDetails = computed(() => [
  { label: '待处理事项', value: attentionSummaryValue.value },
  { label: '通知分组', value: `${notificationGroups.value.length || 0} 组` },
  { label: '技能与标签', value: `${listOf(page.value?.skills).length} 项` },
  { label: '作品条目', value: `${listOf(page.value?.portfolio).length} 个` },
  { label: '档期记录', value: `${listOf(page.value?.calendar).length} 条` },
  { label: '历史评价', value: `${listOf(page.value?.evaluations).length} 条` },
  { label: '当前概览', value: summaryHighlights.value.join(' / ') || '待同步' }
]);

const snapshotItems = computed(() => {
  if (!page.value) {
    return [];
  }

  const openDays = listOf(page.value.calendar).filter((item) => item.state === 'open').length;

  return [
    {
      label: '评分',
      raw: stringValue(page.value.hero?.score),
      value: stringValue(page.value.hero?.score) || '暂无',
      copy: '当前合作评分继续保留在这里。'
    },
    {
      label: '收入',
      raw: stringValue(page.value.hero?.income),
      value: stringValue(page.value.hero?.income) || '￥0',
      copy: '累计收入继续留在资料与记录里。'
    },
    {
      label: '空档期',
      raw: String(openDays),
      value: `${openDays} 天`,
      copy: '开放档期继续影响推荐排序。'
    },
    {
      label: '历史评价',
      raw: String(listOf(page.value.evaluations).length),
      value: `${listOf(page.value.evaluations).length} 条`,
      copy: '历史合作评价继续沉淀在记录里。'
    }
  ].filter((item) => item.raw && item.raw !== '0' && item.raw !== '暂无' && item.raw !== '￥0');
});
const showOverviewRail = computed(() => snapshotItems.value.length > 0);
const overviewTitle = computed(() => (showOverviewRail.value ? '右侧只保留有效摘要' : '补充信息'));

const modules = computed(() => {
  if (!page.value) {
    return [];
  }

  return [
    {
      id: 'messages',
      title: '聊天',
      description: page.value.pendingConfirmations?.length
        ? '先确认任务，再决定是否修改。'
        : '确认、补充和留痕都在这里。',
      preview: listOf(page.value.messages).length
        ? listOf(page.value.messages).slice(0, 2).map((message) => `${message.from}：${message.text}`)
        : ['当前还没有聊天记录。'],
      details: listOf(page.value.messages).length
        ? listOf(page.value.messages).map((message) => `${message.time} · ${message.from}：${message.text}`)
        : ['聊天房间会按最新消息自动排序，新的协商任务也会在这里提醒。'],
      route: buildModuleRoute('messages', buildModuleContext('messages'))
    },
    {
      id: 'market',
      title: '任务广场',
      description: '按匹配度、预算和周期挑任务。',
      preview: listOf(page.value.marketplace).length
        ? listOf(page.value.marketplace).slice(0, 2).map((task) => `${task.title} · 匹配 ${task.match} · ${task.budget}`)
        : ['企业发布真实任务后，会在这里按时间和状态展示。'],
      details: listOf(page.value.marketplace).length
        ? listOf(page.value.marketplace).map((task) => `${task.title}：${task.period}，${task.budget}，标签 ${joinText(task.tags)}`)
        : ['当前还没有可浏览任务。企业发布后，任务广场会自动更新。'],
      route: buildModuleRoute('market', buildModuleContext('market')),
      allowDirectRoute: true
    },
    {
      id: 'workspace',
      title: '协作',
      description: '提交进度、协助需求和附件。',
      preview: listOf(page.value.activeTasks).length
        ? listOf(page.value.activeTasks).slice(0, 2).map((task) => `${task.title} · 进度 ${task.progress}`)
        : ['当前还没有进行中的真实项目。'],
      details: listOf(page.value.activeTasks).length
        ? listOf(page.value.activeTasks).map((task) => `${task.title}：${task.note}（当前进度 ${task.progress}）`)
        : ['当你确认任务后，进度和里程碑会在这里同步。'],
      route: buildModuleRoute('workspace', buildModuleContext('workspace'))
    },
    {
      id: 'records',
      title: '记录',
      description: '回看收入、周期和企业评分。',
      preview: listOf(page.value.acceptRecords).length
        ? listOf(page.value.acceptRecords).slice(0, 2).map((item) => `${item.title} · ${item.amountValue || '待确认'} · ${item.stage}`)
        : ['记录列表会保留金额、开始/结束时间和企业评级。'],
      details: listOf(page.value.acceptRecords).length
        ? listOf(page.value.acceptRecords).map((item) => `${item.title}：${item.counterpartName || '待同步'}，${item.rating?.value || '待评分'}，${item.updatedAt || '待同步'}`)
        : ['这里会继续沉淀每一单接单记录，并支持查看详情。'],
      route: buildModuleRoute('records', buildModuleContext('records'))
    }
  ];
});
const primaryModules = computed(() => modules.value.slice(0, 2));
const secondaryModules = computed(() => modules.value.slice(2));

function openModule(module) {
  activeModuleId.value = module?.id || '';
}

function closeModule() {
  activeModuleId.value = '';
}

const activeModule = computed(() =>
  modules.value.find((module) => module.id === activeModuleId.value) || null
);

async function loadPage() {
  page.value = await getTalentData();
}

function handleEscape(event) {
  if (event.key === 'Escape' && activeModuleId.value) {
    closeModule();
  }
}

onMounted(async () => {
  await loadPage();
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleEscape);
    stopBusinessLiveSync = startBusinessLiveSync({
      refresh: () => loadPage(),
      onStatusChange: handleLiveSyncStatus,
      onSyncError: handleLiveSyncError
    });
  }
});

onBeforeUnmount(() => {
  stopBusinessLiveSync?.();
  stopBusinessLiveSync = null;
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape);
  }
});
</script>
