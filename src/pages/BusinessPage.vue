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
        detail-description="候选人、合同和任务摘要继续放在次级层。"
        :detail-items="attentionHubDetails"
        toggle-label="更多"
        :primary-action="primaryWorkbenchAction"
        :secondary-action="secondaryWorkbenchAction"
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
        <p class="muted">首屏先处理待办和主入口，更多过程信息继续留在左侧导航和次级入口里。</p>
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
            进入审批中心
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
import { getBusinessData } from '../services/api';
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

function listFirst(value) {
  const items = listOf(value);
  return items.length ? items[0] : null;
}

function normalizeGroupKey(value) {
  const normalized = textOf(value).toLowerCase();
  if (!normalized) {
    return '';
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

function textOf(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      const normalized = String(value).trim();
      if (normalized) {
        return normalized;
      }
    }
  }

  return '';
}

function collectRouteQuery(...sources) {
  const query = {};
  const entries = sources.flatMap((source) => (Array.isArray(source) ? source : [source])).filter(Boolean);

  for (const entry of entries) {
    if (typeof entry !== 'object') {
      continue;
    }

    if (!query.taskId) {
      query.taskId = textOf(entry.taskId, entry.summary?.taskId, entry.taskDetail?.taskId);
    }
    if (!query.room) {
      query.room = textOf(entry.room, entry.roomKey, entry.roomId, entry.taskRoom?.roomKey);
    }
    if (!query.recordId) {
      query.recordId = textOf(entry.recordId, entry.record?.recordId, entry.record?.id);
    }
    if (!query.source) {
      query.source = textOf(entry.source, entry.origin, entry.from);
    }
  }

  Object.keys(query).forEach((key) => {
    if (!query[key]) {
      delete query[key];
    }
  });

  return query;
}

function createRouteLocation(routeLike, ...sources) {
  const baseRoute = typeof routeLike === 'string'
    ? { path: routeLike }
    : routeLike && typeof routeLike === 'object'
      ? { ...routeLike }
      : { path: roleRouteMap.enterprise.messages };
  const baseQuery = baseRoute.query && typeof baseRoute.query === 'object' ? { ...baseRoute.query } : {};
  const extraQuery = collectRouteQuery(...sources);
  if (!extraQuery.source) {
    extraQuery.source = 'dashboard-enterprise';
  }
  const query = { ...baseQuery, ...extraQuery };

  return Object.keys(query).length ? { ...baseRoute, query } : baseRoute;
}

function buildApprovalCenterRoute(preferredItem) {
  return buildCenterEntryRoute({
    path: roleRouteMap.enterprise.approvals,
    source: 'dashboard-enterprise',
    preferredItem
  });
}

function resolveModuleRoute(module) {
  if (!module || typeof module !== 'object') {
    return roleRouteMap.enterprise.messages;
  }

  const firstConversation = listFirst(page.value?.liveConversation);
  const firstTask = listFirst(page.value?.taskBoard);
  const firstRecord = listFirst(page.value?.publishRecords);
  const firstAttention = listFirst(page.value?.attentionItems);

  if (module.id === 'messages') {
    return createRouteLocation(roleRouteMap.enterprise.messages, firstConversation, firstAttention, page.value);
  }

  if (module.id === 'workspace') {
    return createRouteLocation(roleRouteMap.enterprise.workspace, firstTask, firstAttention, page.value);
  }

  if (module.id === 'records') {
    const recordId = textOf(
      firstRecord?.recordId,
      firstRecord?.record?.recordId,
      firstRecord?.record?.id,
      firstAttention?.recordId,
      firstAttention?.record?.recordId,
      firstAttention?.record?.id
    );

    if (recordId) {
      return createRouteLocation({ path: roleRouteMap.enterprise.recordDetail(recordId) }, firstRecord, firstAttention, page.value);
    }

    return createRouteLocation(roleRouteMap.enterprise.records, firstRecord, firstAttention, page.value);
  }

  return createRouteLocation(module.route || roleRouteMap.enterprise.messages, firstConversation, firstTask, firstRecord, firstAttention, page.value);
}

function resolveModuleNotificationRoute(module) {
  const firstConversation = listFirst(page.value?.liveConversation);
  const firstTask = listFirst(page.value?.taskBoard);
  const firstRecord = listFirst(page.value?.publishRecords);
  const firstAttention = listFirst(hubSourceItems.value);
  const moduleId = typeof module === 'string' ? module : module?.id;
  const preferredAttention = pickPreferredAttentionItem(hubSourceItems.value, moduleId, {
    excludeGroupsByModule: {
      workspace: ['matching']
    },
    preferredGroupsByModule: {
      publish: ['matching']
    }
  });

  if (!module || typeof module !== 'object') {
    return buildApprovalCenterRoute(preferredAttention || page.value || firstConversation || firstTask || firstRecord);
  }

  return buildApprovalCenterRoute(preferredAttention || page.value || firstConversation || firstTask || firstRecord);
}

const attentionItems = computed(() => listOf(page.value?.attentionItems));
const notificationItems = computed(() =>
  listOf(page.value?.notificationItems).filter((item) => normalizeGroupKey(item?.groupKey || item?.id || item?.label || item?.title) !== 'followup')
);
const notificationGroups = computed(() => listOf(page.value?.notificationGroups));
const hubSourceItems = computed(() => (notificationItems.value.length ? notificationItems.value : attentionItems.value));
const approvalCenterRoute = computed(() => buildApprovalCenterRoute(listFirst(hubSourceItems.value)));
const attentionTotal = computed(
  () => hubSourceItems.value.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
);
const attentionSummaryValue = computed(() => `${attentionTotal.value} 项`);
const attentionSummaryDisplay = computed(() => (attentionTotal.value ? `${attentionTotal.value} 项` : '已清空'));
const dashboardSummaryLabel = computed(() => (attentionTotal.value ? '待处理事项' : '当前状态'));
const dashboardHubEyebrow = computed(() => (attentionTotal.value ? '优先处理' : '当前状态'));
const dashboardHubTitle = computed(() => (attentionTotal.value ? '先清待办' : '当前没有优先事项'));
const dashboardHubDescription = computed(() =>
  attentionTotal.value
    ? textOf(page.value?.attentionHeadline) || '先把确认、修改和评级处理掉。'
    : '直接进入聊天或发布任务即可。'
);
const dashboardSummaryNote = computed(() =>
  attentionTotal.value ? '先清确认、修改、评级。' : '当前没有阻断项，首屏只保留最常用入口。'
);
function groupCount(groupKey) {
  const group = notificationGroups.value.find((item) => normalizeGroupKey(item?.key || item?.id || item?.label || item?.name) === groupKey);
  if (group) {
    return Number(group.count) || 0;
  }
  return notificationItems.value
    .filter((item) => normalizeGroupKey(item?.groupKey || item?.id || item?.label || item?.title) === groupKey)
    .reduce((sum, item) => sum + (Number(item.count) || 0), 0);
}
const attentionHubItems = computed(() =>
  hubSourceItems.value.slice(0, 4).map((item) => ({
    ...item,
    to: buildApprovalCenterRoute(item),
    note: textOf(item.note, item.description, item.summary) || '先进入审批中心，再落到当前事项'
  }))
);
const attentionHubStats = computed(() => {
  if (!attentionTotal.value) {
    return [];
  }

  return [
    {
      label: '待确认',
      value: String(groupCount('confirmations') || 0),
      note: '先确认范围、工期与版本。'
    },
    {
      label: '待修改',
      value: String(groupCount('changes') || 0),
      note: '集中处理人才提出的修改。'
    },
    {
      label: '待评级 / 验收',
      value: String(groupCount('reviews') || 0),
      note: '完工后尽快完成评级与复盘。'
    }
  ].filter((item) => Number(item.value) > 0);
});
const attentionHubDetails = computed(() => [
  { label: '待处理事项', value: attentionSummaryValue.value },
  { label: '通知分组', value: `${notificationGroups.value.length || 0} 组` },
  { label: '资料待完善', value: `${listOf(page.value?.onboardingChecklist).length} 项` },
  { label: '推荐人才', value: `${listOf(page.value?.recommendedTalents).length} 位待查看` },
  { label: '合同与任务摘要', value: `${listOf(page.value?.contractSummary).length} 条` },
  { label: '当前概览', value: summaryHighlights.value.join(' / ') || '待同步' }
]);

const summaryHighlights = computed(() => {
  if (!page.value) {
    return [];
  }

  return [
    `聊天 ${listOf(page.value.liveConversation).length} 条`,
    `推荐人才 ${listOf(page.value.recommendedTalents).length} 位`,
    `协作 ${listOf(page.value.taskBoard).length} 项`
  ];
});

const snapshotItems = computed(() => {
  if (!page.value) {
    return [];
  }

  return [
    {
      label: '推荐人才',
      raw: listOf(page.value.recommendedTalents).length,
      value: `${listOf(page.value.recommendedTalents).length} 位`,
      copy: '候选人继续放在人才广场回看。'
    },
    {
      label: '进行中',
      raw: listOf(page.value.taskBoard).length,
      value: `${listOf(page.value.taskBoard).length} 项`,
      copy: '节点和验收继续在协作空间推进。'
    },
    {
      label: '留痕记录',
      raw: listOf(page.value.publishRecords).length,
      value: `${listOf(page.value.publishRecords).length} 条`,
      copy: '金额、周期和评级继续留在记录页。'
    },
    {
      label: '待回复',
      raw: listOf(page.value.liveConversation).length,
      value: `${listOf(page.value.liveConversation).length} 条`,
      copy: '确认和修改都在这里处理。'
    }
  ].filter((item) => item.raw > 0);
});
const showOverviewRail = computed(() => snapshotItems.value.length > 0);
const overviewTitle = computed(() => (showOverviewRail.value ? '右侧只保留有效摘要' : '补充信息'));
const primaryWorkbenchAction = computed(() => (
  attentionTotal.value
    ? { label: '审批中心', to: approvalCenterRoute.value }
    : { label: '发布任务', to: roleRouteMap.enterprise.publish }
));
const secondaryWorkbenchAction = computed(() => (
  attentionTotal.value
    ? { label: '发布任务', to: roleRouteMap.enterprise.publish }
    : { label: '去聊天', to: roleRouteMap.enterprise.messages }
));

const modules = computed(() => {
  if (!page.value) {
    return [];
  }

  return [
    {
      id: 'messages',
      title: '聊天',
      description: '确认范围、工期和交付。',
      preview: listOf(page.value.liveConversation).length
        ? listOf(page.value.liveConversation).slice(0, 2).map((line) => `${line.author}：${line.text}`)
        : ['当前还没有聊天记录。'],
      details: listOf(page.value.liveConversation).length
        ? listOf(page.value.liveConversation).map((line) => `${line.time} · ${line.author}：${line.text}`)
        : ['项目聊天会展示真实沟通、确认和留痕。'],
      route: resolveModuleRoute({ id: 'messages' })
    },
    {
      id: 'publish',
      title: '发布',
      description: '输入需求，进入发布流程。',
      preview: listOf(page.value.contractSummary).length
        ? [
            page.value.sampleBrief ? `最近需求：${page.value.sampleBrief.slice(0, 34)}...` : '最近还没有已发布任务',
            listOf(page.value.contractSummary)[1] ? `里程碑：${listOf(page.value.contractSummary)[1]}` : '会同步生成里程碑和工期摘要'
          ]
        : ['发布后这里会保留需求摘要', 'AI 会同步生成里程碑和工期建议'],
      details: listOf(page.value.contractSummary).length
        ? ['发布任务时先输入需求，AI 会先拆解模块、工期和风险。', ...listOf(page.value.contractSummary)]
        : ['当前还没有已发布任务。', '去发布任务后，这里会显示真实任务的工期、风险和技能标签。'],
      route: roleRouteMap.enterprise.publish,
      allowDirectRoute: true
    },
    {
      id: 'workspace',
      title: '协作',
      description: '查看节点、进度和验收。',
      preview: listOf(page.value.taskBoard).length
        ? listOf(page.value.taskBoard).slice(0, 2).map((item) => `${item.title} · ${item.status}`)
        : ['当前还没有执行中的项目，确认任务后会出现在这里。'],
      details: listOf(page.value.taskBoard).length
        ? listOf(page.value.taskBoard).map((item) => `${item.title}：${item.note}`)
        : ['协作空间会展示真实项目的里程碑、进度、附件和验收节点。'],
      route: resolveModuleRoute({ id: 'workspace' })
    },
    {
      id: 'records',
      title: '记录',
      description: '回看金额、周期和评级。',
      preview: listOf(page.value.publishRecords).length
        ? listOf(page.value.publishRecords).slice(0, 2).map((item) => `${item.title} · ${item.amountValue || '待确认'} · ${item.stage}`)
        : ['记录列表会保留金额、开始/结束时间和我的评级。'],
      details: listOf(page.value.publishRecords).length
        ? listOf(page.value.publishRecords).map((item) => `${item.title}：${item.counterpartName || '待匹配'}，${item.rating?.value || '待评级'}，${item.updatedAt || '待同步'}`)
        : ['这里会继续沉淀每一单发单记录，并支持查看详情。'],
      route: resolveModuleRoute({ id: 'records' })
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
  page.value = await getBusinessData();
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
