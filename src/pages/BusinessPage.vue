<template>
  <section class="page-stack business-dashboard office-dashboard-page" v-if="page">
    <article v-if="page.requestError" class="result-card stack-sm business-error-card">
      <strong>工作台数据暂时不可用</strong>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

    <section class="business-hero-card">
      <div class="business-hero-copy">
        <span class="business-hero-eyebrow">企业工作台</span>
        <h2>{{ heroTitle }}</h2>
        <p>{{ heroDescription }}</p>

        <div class="business-hero-actions">
          <router-link class="dashboard-link-button is-primary" :to="primaryWorkbenchAction.to">
            {{ primaryWorkbenchAction.label }}
          </router-link>
          <router-link class="dashboard-link-button is-secondary" :to="secondaryWorkbenchAction.to">
            {{ secondaryWorkbenchAction.label }}
          </router-link>
          <router-link class="dashboard-link-button is-ghost" :to="roleRouteMap.enterprise.market">
            人才广场
          </router-link>
        </div>
      </div>

      <div class="business-hero-metrics">
        <article v-for="item in headlineMetrics" :key="item.label" class="business-metric-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.note }}</p>
        </article>
      </div>
    </section>

    <section class="business-grid">
      <div class="business-main-column">
        <article class="business-panel">
          <div class="business-panel-header">
            <div>
              <span class="business-panel-eyebrow">待处理事项</span>
              <h3>先清这些动作</h3>
            </div>
            <router-link class="business-inline-link" :to="approvalCenterRoute">进入审批中心</router-link>
          </div>

          <div v-if="pendingItems.length" class="business-queue-list">
            <router-link
              v-for="item in pendingItems"
              :key="item.id"
              class="business-queue-item"
              :to="item.to"
            >
              <div class="business-queue-copy">
                <strong>{{ item.title }}</strong>
                <p>{{ item.note }}</p>
              </div>
              <div class="business-queue-meta">
                <span class="business-pill">{{ item.group }}</span>
                <strong>{{ item.count }}</strong>
              </div>
            </router-link>
          </div>
          <div v-else class="business-empty-state">
            <strong>当前没有阻塞项</strong>
            <p>可以直接去发布任务、继续沟通，或查看最近合作记录。</p>
          </div>
        </article>

        <article class="business-panel">
          <div class="business-panel-header">
            <div>
              <span class="business-panel-eyebrow">进行中合作</span>
              <h3>当前推进中的项目</h3>
            </div>
            <router-link class="business-inline-link" :to="roleRouteMap.enterprise.workspace">进入协作空间</router-link>
          </div>

          <div v-if="collaborationCards.length" class="business-collaboration-list">
            <router-link
              v-for="item in collaborationCards"
              :key="item.id"
              class="business-collaboration-card"
              :to="item.to"
            >
              <div class="business-collaboration-topline">
                <strong>{{ item.title }}</strong>
                <span class="business-status-pill">{{ item.status }}</span>
              </div>
              <p>{{ item.note }}</p>
              <div class="business-collaboration-meta">
                <span>{{ item.meta }}</span>
                <span>{{ item.updatedAt }}</span>
              </div>
            </router-link>
          </div>
          <div v-else class="business-empty-state">
            <strong>还没有进入执行中的合作</strong>
            <p>确认任务后，节点推进、进度和验收会在这里连续展示。</p>
          </div>
        </article>

        <article class="business-panel">
          <div class="business-panel-header">
            <div>
              <span class="business-panel-eyebrow">推荐动作</span>
              <h3>下一步建议</h3>
            </div>
          </div>

          <div class="business-action-grid">
            <router-link
              v-for="action in recommendedActions"
              :key="action.id"
              class="business-action-card"
              :class="`is-${action.tone}`"
              :to="action.to"
            >
              <span class="business-action-kicker">{{ action.kicker }}</span>
              <strong>{{ action.title }}</strong>
              <p>{{ action.note }}</p>
            </router-link>
          </div>

          <div v-if="recommendedTalentCards.length" class="business-talent-strip">
            <div class="business-strip-heading">
              <strong>推荐人才</strong>
              <router-link class="business-inline-link" :to="roleRouteMap.enterprise.market">查看全部</router-link>
            </div>
            <div class="business-talent-list">
              <router-link
                v-for="item in recommendedTalentCards"
                :key="item.id"
                class="business-talent-card"
                :to="item.to"
              >
                <strong>{{ item.name }}</strong>
                <p>{{ item.role }}</p>
                <span>{{ item.note }}</span>
              </router-link>
            </div>
          </div>
        </article>
      </div>

      <aside class="business-side-column">
        <article class="business-panel business-spend-panel">
          <div class="business-panel-header">
            <div>
              <span class="business-panel-eyebrow">支出概览</span>
              <h3>最近的资金流转</h3>
            </div>
            <router-link class="business-inline-link" :to="roleRouteMap.enterprise.records">查看记录</router-link>
          </div>

          <div class="business-spend-kpis">
            <article v-for="item in financeSummaryCards" :key="item.label" class="business-spend-kpi">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p>{{ item.note }}</p>
            </article>
          </div>

          <div v-if="recentExpenses.length" class="business-spend-list">
            <router-link
              v-for="item in recentExpenses"
              :key="item.id"
              class="business-spend-item"
              :to="item.to || roleRouteMap.enterprise.records"
            >
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.meta }}</p>
              </div>
              <div class="business-spend-item-aside">
                <strong>{{ item.amount }}</strong>
                <span>{{ item.time }}</span>
              </div>
            </router-link>
          </div>
          <div v-else class="business-empty-state is-compact">
            <strong>暂无最近支出明细</strong>
            <p>结算、争议和请款通过后，会在这里形成最近流水。</p>
          </div>
        </article>

        <article class="business-panel">
          <div class="business-panel-header">
            <div>
              <span class="business-panel-eyebrow">最近沟通</span>
              <h3>最新会话摘要</h3>
            </div>
            <router-link class="business-inline-link" :to="roleRouteMap.enterprise.messages">全部沟通</router-link>
          </div>

          <div v-if="recentConversations.length" class="business-conversation-list">
            <router-link
              v-for="item in recentConversations"
              :key="item.id"
              class="business-conversation-item"
              :to="item.to"
            >
              <div class="business-conversation-copy">
                <strong>{{ item.title }}</strong>
                <p>{{ item.preview }}</p>
              </div>
              <span>{{ item.time }}</span>
            </router-link>
          </div>
          <div v-else class="business-empty-state is-compact">
            <strong>最近还没有沟通记录</strong>
            <p>进入聊天后，这里会保留最新的任务对话和纪要入口。</p>
          </div>
        </article>

        <article class="business-panel">
          <div class="business-panel-header">
            <div>
              <span class="business-panel-eyebrow">最近任务</span>
              <h3>发单与留痕</h3>
            </div>
            <router-link class="business-inline-link" :to="roleRouteMap.enterprise.records">全部记录</router-link>
          </div>

          <div v-if="recentTasks.length" class="business-task-list">
            <router-link
              v-for="item in recentTasks"
              :key="item.id"
              class="business-task-item"
              :to="item.to"
            >
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.meta }}</p>
              </div>
              <span>{{ item.status }}</span>
            </router-link>
          </div>
          <div v-else class="business-empty-state is-compact">
            <strong>还没有最近任务</strong>
            <p>发布任务后，这里会沉淀最近一段时间的任务状态和金额明细。</p>
          </div>
        </article>
      </aside>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import LiveSyncStatusBar from '../components/LiveSyncStatusBar.vue';
import { getBusinessData } from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream';
import { roleRouteMap } from '../utils/roleRoutes';
import { buildCenterEntryRoute } from '../utils/attentionNavigation';

const page = ref(null);
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

function moneyText(value, fallback = '¥0') {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  const normalized = Number(value);
  if (Number.isFinite(normalized)) {
    return `¥${normalized.toLocaleString('zh-CN')}`;
  }
  return fallback;
}

function timeText(value) {
  if (!value) {
    return '待同步';
  }
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  return textOf(value, '待同步');
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

const financeSummary = computed(() => page.value?.financeSummary || {});
const financeSummaryCards = computed(() => [
  {
    label: '支出总额',
    value: moneyText(financeSummary.value.totalSpent),
    note: '当前账期累计支出'
  },
  {
    label: '待结算',
    value: moneyText(financeSummary.value.pendingPayable),
    note: '等待对账或付款执行'
  },
  {
    label: '争议金额',
    value: moneyText(financeSummary.value.disputedAmount),
    note: '需要人工确认的部分'
  }
]);

const recentExpenses = computed(() =>
  listOf(financeSummary.value.recentExpenses).map((item, index) => ({
    id: textOf(item?.expenseId, item?.id, `expense-${index}`),
    title: textOf(item?.title, item?.vendor, item?.category, '支出明细'),
    meta: textOf(item?.status, item?.category, item?.note, '支出记录'),
    amount: moneyText(item?.amount ?? item?.total ?? item?.value),
    time: timeText(item?.spentAt ?? item?.createdAt ?? item?.date),
    to: (() => {
      const recordId = textOf(item?.recordId, item?.record?.recordId, item?.record?.id, item?.taskId);
      if (recordId) {
        return createRouteLocation({ path: roleRouteMap.enterprise.recordDetail(recordId) }, item, financeSummary.value, page.value);
      }
      return createRouteLocation(roleRouteMap.enterprise.records, item, financeSummary.value, page.value);
    })()
  }))
);

const attentionItems = computed(() => listOf(page.value?.attentionItems));
const notificationItems = computed(() =>
  listOf(page.value?.notificationItems).filter((item) => normalizeGroupKey(item?.groupKey || item?.id || item?.label || item?.title) !== 'followup')
);
const hubSourceItems = computed(() => (notificationItems.value.length ? notificationItems.value : attentionItems.value));
const approvalCenterRoute = computed(() => buildApprovalCenterRoute(listFirst(hubSourceItems.value)));
const attentionTotal = computed(() => hubSourceItems.value.reduce((sum, item) => sum + (Number(item.count) || 0), 0));

const heroTitle = computed(() => (attentionTotal.value ? '先处理待办，再推进合作和验收。' : '当前没有阻塞项，可以直接推进工作。'));
const heroDescription = computed(() =>
  attentionTotal.value
    ? textOf(page.value?.attentionHeadline) || '确认、修改、评级和沟通入口已经按优先级排好，先把这些清掉。'
    : '当前工作台保留待办、合作、支出和最近沟通，方便先处理会真正推动交易的内容。'
);

const headlineMetrics = computed(() => [
  {
    label: '待处理事项',
    value: `${attentionTotal.value} 项`,
    note: '优先处理确认、修改和评级'
  },
  {
    label: '进行中合作',
    value: `${listOf(page.value?.taskBoard).length} 项`,
    note: '当前正在推进中的协作任务'
  },
  {
    label: '最近沟通',
    value: `${listOf(page.value?.liveConversation).length} 条`,
    note: '最近同步到工作台的会话摘要'
  },
  {
    label: '本期支出',
    value: moneyText(financeSummary.value.totalSpent),
    note: '按工作台已聚合的企业支出统计'
  }
]);

const primaryWorkbenchAction = computed(() => (
  attentionTotal.value
    ? { label: '去审批中心', to: approvalCenterRoute.value }
    : { label: '发布任务', to: roleRouteMap.enterprise.publish }
));

const secondaryWorkbenchAction = computed(() => (
  listOf(page.value?.liveConversation).length
    ? { label: '回到最近沟通', to: createRouteLocation(roleRouteMap.enterprise.messages, listFirst(page.value?.liveConversation), page.value) }
    : { label: '去聊天', to: roleRouteMap.enterprise.messages }
));

const pendingItems = computed(() =>
  hubSourceItems.value.slice(0, 6).map((item, index) => ({
    id: textOf(item?.itemId, item?.id, `pending-${index}`),
    title: textOf(item?.title, item?.label, '待处理事项'),
    note: textOf(item?.note, item?.summary, item?.description, '进入审批中心查看详情。'),
    count: Number(item?.count) || 0,
    group: textOf(item?.groupLabel, item?.groupKey, item?.status, '待处理'),
    to: buildApprovalCenterRoute(item)
  }))
);

const collaborationCards = computed(() =>
  listOf(page.value?.taskBoard).map((item, index) => ({
    id: textOf(item?.taskId, item?.id, `task-${index}`),
    title: textOf(item?.title, '进行中任务'),
    status: textOf(item?.status, '待同步'),
    note: textOf(item?.note, '进入协作空间查看节点推进。'),
    meta: [textOf(item?.talent, ''), textOf(item?.budget, ''), textOf(item?.completion, '')].filter(Boolean).join(' · ') || '等待同步协作详情',
    updatedAt: textOf(item?.lastSync, item?.updatedAt, '待同步'),
    to: createRouteLocation(roleRouteMap.enterprise.workspace, item, page.value)
  }))
);

const recommendedActions = computed(() => {
  const actions = [];
  if (attentionTotal.value) {
    actions.push({
      id: 'clear-pending',
      kicker: 'Priority 01',
      title: '先清审批中心里的待办',
      note: '确认、修改和评级会直接影响聊天、协作和收口页状态。',
      to: approvalCenterRoute.value,
      tone: 'accent'
    });
  }
  if (listOf(page.value?.recommendedTalents).length) {
    actions.push({
      id: 'review-talents',
      kicker: 'Priority 02',
      title: '去人才广场补充筛选',
      note: `当前已有 ${listOf(page.value?.recommendedTalents).length} 位推荐人才，适合继续推进邀约。`,
      to: roleRouteMap.enterprise.market,
      tone: 'neutral'
    });
  }
  if (listOf(page.value?.liveConversation).length) {
    actions.push({
      id: 'resume-chat',
      kicker: 'Priority 03',
      title: '继续最近沟通',
      note: '确认单修改、纪要和消息留痕已经集中在聊天页。',
      to: createRouteLocation(roleRouteMap.enterprise.messages, listFirst(page.value?.liveConversation), page.value),
      tone: 'neutral'
    });
  }
  actions.push({
    id: 'publish-task',
    kicker: attentionTotal.value ? 'Next' : 'Start here',
    title: '发布新的任务需求',
    note: '新的任务会自动进入 AI 拆解、选人和协作主链。',
    to: roleRouteMap.enterprise.publish,
    tone: 'ghost'
  });
  return actions.slice(0, 4);
});

const recommendedTalentCards = computed(() =>
  listOf(page.value?.recommendedTalents).slice(0, 3).map((item, index) => ({
    id: textOf(item?.platformUserId, item?.talentUserId, item?.slug, `talent-${index}`),
    name: textOf(item?.name, '未命名人才'),
    role: textOf(item?.role, '专业方向未公开'),
    note: textOf(item?.reason, item?.score, '进入人才广场继续查看'),
    to: item?.slug ? roleRouteMap.enterprise.talentDetail(item.slug) : roleRouteMap.enterprise.market
  }))
);

const recentConversations = computed(() =>
  listOf(page.value?.liveConversation).slice(0, 5).map((item, index) => ({
    id: textOf(item?.roomKey, item?.taskId, `conversation-${index}`),
    title: textOf(item?.taskTitle, item?.title, '任务沟通'),
    preview: textOf(item?.lastMessage, item?.focus, item?.summary, '进入聊天查看完整内容。'),
    time: textOf(item?.lastTime, item?.updatedAt, '待同步'),
    to: createRouteLocation(roleRouteMap.enterprise.messages, item, page.value)
  }))
);

const recentTasks = computed(() => {
  const records = listOf(page.value?.publishRecords);
  if (records.length) {
    return records.slice(0, 5).map((item, index) => ({
      id: textOf(item?.recordId, item?.taskId, `record-${index}`),
      title: textOf(item?.title, '发单记录'),
      meta: [textOf(item?.amountValue, ''), textOf(item?.counterpartName, ''), textOf(item?.updatedAt, '')].filter(Boolean).join(' · ') || '查看金额、评级和周期明细',
      status: textOf(item?.stage, item?.statusGroup, '待同步'),
      to: (() => {
        const recordId = textOf(item?.recordId, item?.record?.recordId, item?.record?.id, item?.taskId);
        if (recordId) {
          return createRouteLocation({ path: roleRouteMap.enterprise.recordDetail(recordId) }, item, page.value);
        }
        return createRouteLocation(roleRouteMap.enterprise.records, item, page.value);
      })()
    }));
  }

  return listOf(page.value?.taskBoard).slice(0, 5).map((item, index) => ({
    id: textOf(item?.taskId, item?.id, `taskboard-${index}`),
    title: textOf(item?.title, '最近任务'),
    meta: textOf(item?.note, '进入协作空间查看详情'),
    status: textOf(item?.status, '待同步'),
    to: createRouteLocation(roleRouteMap.enterprise.workspace, item, page.value)
  }));
});

async function loadPage() {
  page.value = await getBusinessData();
}

onMounted(async () => {
  await loadPage();
  if (typeof window !== 'undefined') {
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
});
</script>

<style scoped>
.business-dashboard {
  display: grid;
  gap: 18px;
  color: #1b2a1d;
}

.business-error-card {
  border-radius: 24px;
  background: #fff6f4;
}

.business-hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(340px, 0.8fr);
  gap: 18px;
  padding: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 30px;
  background:
    radial-gradient(circle at top left, rgba(16, 138, 0, 0.08), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 247, 0.98));
  box-shadow: 0 28px 72px rgba(28, 40, 30, 0.08);
}

.business-hero-copy {
  display: grid;
  gap: 14px;
}

.business-hero-eyebrow,
.business-panel-eyebrow {
  color: #6a786d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.business-hero-copy h2,
.business-panel-header h3 {
  margin: 0;
  font-family: 'Fraunces', 'Georgia', serif;
  letter-spacing: -0.04em;
}

.business-hero-copy h2 {
  font-size: clamp(32px, 4vw, 48px);
  line-height: 0.98;
}

.business-hero-copy p,
.business-panel-header p,
.business-empty-state p,
.business-queue-item p,
.business-collaboration-card p,
.business-action-card p,
.business-talent-card p,
.business-spend-item p,
.business-conversation-item p,
.business-task-item p {
  margin: 0;
  color: #667567;
  line-height: 1.6;
}

.business-hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.dashboard-link-button,
.business-inline-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #ffffff;
  color: #1b2a1d;
  font-weight: 600;
}

.dashboard-link-button.is-primary {
  border-color: transparent;
  background: #108a00;
  color: #ffffff;
}

.dashboard-link-button.is-secondary {
  border-color: rgba(16, 138, 0, 0.18);
  background: rgba(16, 138, 0, 0.08);
  color: #0d6a02;
}

.dashboard-link-button.is-ghost,
.business-inline-link {
  background: #f6f8f5;
}

.business-hero-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.business-metric-card {
  display: grid;
  gap: 6px;
  padding: 18px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.84);
}

.business-metric-card span,
.business-spend-kpi span {
  color: #6a786d;
  font-size: 12px;
}

.business-metric-card strong,
.business-spend-kpi strong {
  font-size: 28px;
  letter-spacing: -0.04em;
}

.business-metric-card p,
.business-spend-kpi p {
  margin: 0;
  color: #6f7f70;
  font-size: 12px;
  line-height: 1.55;
}

.business-dashboard {
  color: #e6edf6;
  position: relative;
  isolation: isolate;
}

.business-dashboard::before {
  content: '';
  position: absolute;
  inset: -18px -18px auto;
  height: 300px;
  border-radius: 32px;
  background:
    radial-gradient(circle at 20% 20%, rgba(16, 138, 0, 0.22), transparent 34%),
    radial-gradient(circle at 86% 18%, rgba(37, 99, 235, 0.2), transparent 32%),
    linear-gradient(180deg, rgba(9, 14, 24, 0.98), rgba(14, 20, 34, 0.92));
  pointer-events: none;
  z-index: -1;
}

.business-dashboard :is(.business-hero-card, .business-panel, .business-metric-card, .business-empty-state, .business-queue-item, .business-collaboration-card, .business-action-card, .business-talent-card, .business-spend-item, .business-conversation-item, .business-task-item) {
  background: rgba(10, 16, 28, 0.82);
  border-color: rgba(148, 163, 184, 0.14);
  box-shadow: 0 24px 54px rgba(4, 10, 20, 0.34);
}

.business-dashboard .business-hero-card {
  background:
    radial-gradient(circle at top left, rgba(16, 138, 0, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(14, 21, 34, 0.98), rgba(9, 14, 24, 0.98));
}

.business-dashboard .business-hero-copy h2,
.business-dashboard .business-panel-header h3,
.business-dashboard .business-panel strong,
.business-dashboard .business-metric-card strong,
.business-dashboard .business-spend-kpi strong {
  color: #f5f8fd;
}

.business-dashboard .business-hero-eyebrow,
.business-dashboard .business-panel-eyebrow,
.business-dashboard .business-inline-link,
.business-dashboard .business-metric-card span,
.business-dashboard .business-spend-kpi span,
.business-dashboard .business-empty-state p,
.business-dashboard .business-queue-item p,
.business-dashboard .business-collaboration-card p,
.business-dashboard .business-action-card p,
.business-dashboard .business-talent-card p,
.business-dashboard .business-spend-item p,
.business-dashboard .business-conversation-item p,
.business-dashboard .business-task-item p,
.business-dashboard .business-hero-copy p,
.business-dashboard .business-panel-header p {
  color: #9fb0c1;
}

.business-dashboard .dashboard-link-button,
.business-dashboard .business-inline-link {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(148, 163, 184, 0.16);
  color: #e5edf7;
}

.business-dashboard .dashboard-link-button.is-primary {
  background: #108a00;
  border-color: transparent;
  color: #ffffff;
}

.business-dashboard .dashboard-link-button.is-secondary {
  background: rgba(16, 138, 0, 0.16);
  border-color: rgba(16, 138, 0, 0.24);
  color: #d8ffe0;
}

.business-dashboard .business-action-card.is-accent {
  background: linear-gradient(180deg, rgba(16, 138, 0, 0.2), rgba(10, 16, 28, 0.84));
}

.business-dashboard .business-action-card.is-neutral,
.business-dashboard .business-action-card.is-ghost {
  background: rgba(10, 16, 28, 0.82);
}

.business-dashboard .business-status-pill,
.business-dashboard .business-pill,
.business-dashboard .soft-pill {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(148, 163, 184, 0.14);
  color: #e6edf6;
}

.business-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) 380px;
  gap: 18px;
  align-items: start;
}

.business-main-column,
.business-side-column {
  display: grid;
  gap: 18px;
}

.business-panel {
  display: grid;
  gap: 16px;
  padding: 22px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 22px 56px rgba(28, 40, 30, 0.06);
}

.business-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.business-queue-list,
.business-collaboration-list,
.business-conversation-list,
.business-task-list,
.business-spend-list,
.business-talent-list {
  display: grid;
  gap: 10px;
}

.business-queue-item,
.business-collaboration-card,
.business-conversation-item,
.business-task-item,
.business-spend-item,
.business-talent-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 20px;
  background: #fbfcfa;
}

.business-queue-item:hover,
.business-collaboration-card:hover,
.business-conversation-item:hover,
.business-task-item:hover,
.business-spend-item:hover,
.business-talent-card:hover,
.business-action-card:hover {
  border-color: rgba(16, 138, 0, 0.16);
  background: #ffffff;
}

.business-queue-copy,
.business-conversation-copy {
  display: grid;
  gap: 4px;
}

.business-queue-meta,
.business-spend-item-aside {
  display: grid;
  gap: 6px;
  justify-items: end;
  text-align: right;
}

.business-pill,
.business-status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(16, 138, 0, 0.08);
  color: #0d6a02;
  font-size: 11px;
  font-weight: 700;
}

.business-collaboration-card {
  display: grid;
  gap: 10px;
}

.business-collaboration-topline,
.business-strip-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.business-collaboration-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  color: #6b796d;
  font-size: 12px;
}

.business-action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.business-action-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 22px;
  background: #f8faf7;
}

.business-action-card.is-accent {
  background: linear-gradient(180deg, rgba(16, 138, 0, 0.12), rgba(255, 255, 255, 0.92));
}

.business-action-kicker {
  color: #6a786d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.business-talent-strip {
  display: grid;
  gap: 12px;
  padding-top: 6px;
}

.business-talent-card {
  display: grid;
  gap: 4px;
}

.business-talent-card span {
  color: #6b796d;
  font-size: 12px;
}

.business-spend-panel {
  gap: 14px;
}

.business-spend-kpis {
  display: grid;
  gap: 10px;
}

.business-spend-kpi {
  display: grid;
  gap: 6px;
  padding: 16px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(16, 138, 0, 0.06), rgba(255, 255, 255, 0.96));
}

.business-empty-state {
  display: grid;
  gap: 6px;
  padding: 18px;
  border: 1px dashed rgba(17, 24, 39, 0.14);
  border-radius: 20px;
  background: #fafbf9;
}

.business-empty-state.is-compact {
  padding: 16px;
}

@media (max-width: 1180px) {
  .business-hero-card,
  .business-grid {
    grid-template-columns: 1fr;
  }

  .business-panel-header,
  .business-strip-heading {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 760px) {
  .business-hero-card,
  .business-panel {
    padding: 18px;
    border-radius: 24px;
  }

  .business-hero-metrics,
  .business-action-grid {
    grid-template-columns: 1fr;
  }

  .business-hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .business-queue-item,
  .business-conversation-item,
  .business-task-item,
  .business-spend-item {
    flex-direction: column;
  }

  .business-queue-meta,
  .business-spend-item-aside {
    justify-items: start;
    text-align: left;
  }
}
</style>
