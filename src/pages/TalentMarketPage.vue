<template>
  <section class="page-stack talent-market-page office-directory-page" v-if="page">
    <ActionErrorDialog title="发起合作暂时失败" :message="collaborationError" />

    <article v-if="page.requestError" class="office-directory-empty stack-sm">
      <strong>人才广场数据暂时不可用</strong>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <article v-if="collaborationRestrictionMessage" class="office-directory-empty office-directory-empty--warning stack-sm">
      <strong>当前账号还不能发起合作</strong>
      <p class="muted">{{ collaborationRestrictionMessage }}</p>
    </article>

    <section class="office-directory-hero">
      <div class="office-directory-hero-copy stack-md">
        <div class="stack-xs">
          <span class="eyebrow">企业端 / 人才广场</span>
          <h1>{{ page.summary?.title || '人才广场' }}</h1>
          <p class="muted office-directory-lead">
            {{ page.summary?.description || '左侧浏览候选人，右侧承接 profile、判断与合作入口。' }}
          </p>
        </div>

        <div class="office-directory-hero-stats">
          <article v-for="item in heroStats" :key="item.label" class="office-directory-hero-stat">
            <span class="office-directory-hero-stat__label">{{ item.label }}</span>
            <strong class="office-directory-hero-stat__value">{{ item.value }}</strong>
            <p class="office-directory-hero-stat__note muted">{{ item.note }}</p>
          </article>
        </div>
      </div>

      <div class="office-directory-hero-panel stack-md">
        <div class="stack-xs">
          <span class="eyebrow">搜索与筛选</span>
          <h3>先收窄，再决策</h3>
        </div>

        <label class="office-directory-search-field stack-xs">
          <span class="office-directory-search-label">搜索人才</span>
          <input
            v-model="searchText"
            class="office-directory-search-input"
            type="search"
            placeholder="搜索姓名、技能、服务、作品关键词"
          >
        </label>

        <div class="office-directory-filter-shell stack-xs">
          <div class="panel-header office-directory-filter-head">
            <div>
              <span class="eyebrow">筛选条件</span>
              <h3>快速收窄候选池</h3>
            </div>
            <span class="soft-pill">{{ filteredTalents.length }} 位</span>
          </div>

          <div class="office-directory-filter-row">
            <button
              v-for="filter in filterOptions"
              :key="filter"
              type="button"
              class="office-directory-filter-chip"
              :class="{ 'is-active': selectedFilter === filter }"
              @click="selectedFilter = filter"
            >
              {{ filter }}
            </button>
          </div>
        </div>

        <div class="toolbar office-directory-hero-actions">
          <router-link class="button-primary" :to="roleRouteMap.enterprise.publish">发布任务</router-link>
          <router-link class="button-secondary" :to="roleRouteMap.enterprise.home">返回工作台</router-link>
        </div>
      </div>
    </section>

    <section class="office-directory-layout">
      <section class="office-directory-list stack-md">
        <div class="office-directory-list-header">
          <div>
            <span class="eyebrow">搜索结果</span>
            <h2>{{ filteredTalents.length }} 位人才</h2>
          </div>
          <p class="muted">左侧点击候选人，右侧会固定承接完整 profile 和合作入口。</p>
        </div>

        <article v-if="filteredTalents.length === 0" class="office-directory-empty stack-sm">
          <div class="stack-xs">
            <span class="eyebrow">暂无匹配资源</span>
            <h3>换个关键词或筛选再看一次</h3>
          </div>
          <p class="muted">当前筛出来的资源为空。你可以切回“全部”，或换成更贴近业务方向的标签。</p>
          <div class="toolbar">
            <button class="button-secondary" type="button" @click="selectedFilter = '全部'">清空筛选</button>
            <button class="button-primary" type="button" @click="searchText = ''">清空搜索</button>
          </div>
        </article>

        <article
          v-for="(talent, index) in filteredTalents"
          :key="talent.slug"
          class="office-directory-row stack-md"
          :class="{ 'is-active': activeTalent?.slug === talent.slug }"
          tabindex="0"
          role="button"
          :aria-pressed="activeTalent?.slug === talent.slug"
          @click="selectTalent(talent)"
          @keyup.enter="selectTalent(talent)"
          @keyup.space.prevent="selectTalent(talent)"
        >
          <div class="office-directory-row-head">
            <div class="office-directory-row-rank">
              <span class="office-directory-row-index">{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
            <div class="stack-xs office-directory-row-identity">
              <h3>{{ talent.name }}</h3>
              <p class="muted">{{ talent.role }}</p>
            </div>
            <div v-if="talentMetaPills(talent).length" class="tag-row office-directory-row-meta">
              <span v-for="pill in talentMetaPills(talent)" :key="pill" class="soft-pill">{{ pill }}</span>
            </div>
          </div>

          <p class="muted office-directory-row-summary">{{ talentListSummary(talent) }}</p>

          <div v-if="previewTalentTags(talent.tags).length" class="stack-xs">
            <span class="eyebrow">核心标签</span>
            <div class="tag-row">
              <span v-for="tag in previewTalentTags(talent.tags)" :key="tag" class="soft-pill">{{ tag }}</span>
              <span v-if="countOf(talent.tags) > previewTalentTags(talent.tags).length" class="soft-pill">
                +{{ countOf(talent.tags) - previewTalentTags(talent.tags).length }}
              </span>
            </div>
          </div>

          <div v-if="previewTalentServices(talent.services).length" class="stack-xs">
            <span class="eyebrow">可承接服务</span>
            <div class="tag-row">
              <span v-for="item in previewTalentServices(talent.services)" :key="item" class="soft-pill">{{ item }}</span>
            </div>
          </div>

          <div class="office-directory-row-actions toolbar">
            <span class="muted">点击卡片查看完整 profile</span>
            <div class="toolbar">
              <router-link class="button-secondary" :to="detailRoute(talent.slug)" @click.stop>
                查看详情
              </router-link>
              <button class="button-primary" type="button" @click.stop="openCollaborationLauncher(talent)">
                发起合作
              </button>
            </div>
          </div>
        </article>
      </section>

      <aside class="office-directory-detail-rail">
        <article v-if="activeTalent" class="office-directory-detail-panel stack-lg">
          <div class="panel-header office-directory-detail-head">
            <div class="stack-xs">
              <span class="eyebrow">当前选中人才</span>
              <h2>{{ activeTalent.name }}</h2>
              <p class="muted">{{ activeTalent.role }}</p>
            </div>
            <div class="toolbar office-directory-detail-actions">
              <button class="button-primary" type="button" @click="openCollaborationLauncher(activeTalent)">
                发起合作并沟通
              </button>
              <router-link class="button-secondary" :to="detailRoute(activeTalent.slug)">
                查看完整详情
              </router-link>
            </div>
          </div>

          <div v-if="talentMetaPills(activeTalent).length" class="tag-row">
            <span v-for="pill in talentMetaPills(activeTalent)" :key="pill" class="soft-pill">{{ pill }}</span>
          </div>

          <section class="office-directory-detail-section stack-sm">
            <span class="eyebrow">合作判断</span>
            <strong>{{ activeTalentDecisionTitle }}</strong>
            <p class="muted">{{ activeTalentDecisionBody }}</p>
          </section>

          <div class="office-directory-detail-metrics">
            <article v-for="item in activeTalentFacts" :key="item.label" class="office-directory-detail-metric">
              <span class="office-directory-detail-metric__label">{{ item.label }}</span>
              <strong class="office-directory-detail-metric__value">{{ item.value }}</strong>
              <p class="office-directory-detail-metric__note muted">{{ item.note }}</p>
            </article>
          </div>

          <section class="office-directory-detail-section stack-sm">
            <div class="section-header">
              <div>
                <span class="eyebrow">简介</span>
                <h3>先看能不能直接进入合作沟通</h3>
              </div>
            </div>
            <p class="muted office-directory-detail-copy">{{ talentDetailSummary(activeTalent) }}</p>
          </section>

          <section class="office-directory-detail-section stack-sm">
            <div class="section-header">
              <div>
                <span class="eyebrow">技能</span>
                <h3>核心标签与能力方向</h3>
              </div>
            </div>
            <div v-if="previewTalentTags(activeTalent.tags).length" class="tag-row">
              <span v-for="tag in previewTalentTags(activeTalent.tags)" :key="tag" class="soft-pill">{{ tag }}</span>
              <span v-if="countOf(activeTalent.tags) > previewTalentTags(activeTalent.tags).length" class="soft-pill">
                +{{ countOf(activeTalent.tags) - previewTalentTags(activeTalent.tags).length }}
              </span>
            </div>
            <p v-else class="muted">当前没有更多技能标签。</p>
          </section>

          <section class="office-directory-detail-section stack-sm">
            <div class="section-header">
              <div>
                <span class="eyebrow">服务</span>
                <h3>可承接事项</h3>
              </div>
            </div>
            <div v-if="previewTalentServices(activeTalent.services).length" class="tag-row">
              <span v-for="item in previewTalentServices(activeTalent.services)" :key="item" class="soft-pill">{{ item }}</span>
            </div>
            <p v-else class="muted">当前没有可展示的服务项。</p>
          </section>

          <section class="office-directory-detail-section stack-sm">
            <div class="section-header">
              <div>
                <span class="eyebrow">作品</span>
                <h3>近期作品摘要</h3>
              </div>
            </div>
            <p class="muted">{{ talentPortfolioSummary(activeTalent) }}</p>
          </section>

          <section class="office-directory-detail-section stack-sm">
            <div class="section-header">
              <div>
                <span class="eyebrow">履历</span>
                <h3>必要时再展开完整经历</h3>
              </div>
            </div>
            <p class="muted">{{ compactSummary(activeTalent.summary, 160) }}</p>
          </section>

          <div class="toolbar office-directory-detail-actions">
            <router-link class="button-secondary" :to="detailRoute(activeTalent.slug)">
              进入人才详情页
            </router-link>
            <button class="button-primary" type="button" @click="openCollaborationLauncher(activeTalent)">
              直接发起合作
            </button>
          </div>
        </article>

        <article v-else class="office-directory-detail-placeholder stack-md">
          <div class="stack-xs">
            <span class="eyebrow">右侧详情区</span>
            <h3>从左侧选择一个人才</h3>
          </div>
          <p class="muted">这里会固定承接选中的人才信息，适合快速核对评分、响应速度、服务项和近期作品。</p>
        </article>
      </aside>
    </section>

    <CollaborationEntryModal
      :open="collaborationOpen"
      :mode="collaborationMode"
      :talent="collaborationTalentData"
      :candidates="collaborationCandidates"
      :loading="collaborationLoading"
      :error="collaborationError"
      :busy-task-id="collaborationBusyTaskId"
      @close="closeCollaborationLauncher"
      @load-existing="loadCollaborationCandidates"
      @choose-new="openNewTaskWithTalent"
      @back-to-chooser="collaborationMode = 'chooser'"
      @retry="loadCollaborationCandidates"
      @select-task="startExistingCollaboration"
    />
  </section>

  <section v-else class="page-stack talent-market-page office-directory-page">
    <article class="office-directory-empty stack-md">
      <span class="eyebrow">人才广场加载中</span>
      <h3>正在同步候选目录与右侧详情</h3>
      <p class="muted">请稍等，页面会先拉取可选资源，再固定右侧详情承接区。</p>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ActionErrorDialog from '../components/ActionErrorDialog.vue';
import CollaborationEntryModal from '../components/CollaborationEntryModal.vue';
import { getCollaborationCandidates, getTalentMarketplaceData, startTaskCollaboration } from '../services/api';
import { useAuthState } from '../stores/auth';
import { tradingRestrictionMessage } from '../utils/tradingAccess';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();
const page = ref(null);
const searchText = ref(String(route.query.q || '').trim());
const selectedFilter = ref(String(route.query.filter || '全部').trim() || '全部');
const activeTalentSlug = ref(null);
const collaborationOpen = ref(false);
const collaborationMode = ref('chooser');
const collaborationTalent = ref(null);
const collaborationCandidates = ref([]);
const collaborationLoading = ref(false);
const collaborationError = ref('');
const collaborationBusyTaskId = ref('');

const filterOptions = computed(() => {
  const values = Array.isArray(page.value?.filters) ? page.value.filters : [];
  const unique = [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))];
  return ['全部', ...unique];
});

const filteredTalents = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : [];
  const activeFilter = selectedFilter.value;
  const keyword = String(searchText.value || '').trim().toLowerCase();

  return items.filter((talent) => {
    if (activeFilter !== '全部' && !matchesTalentFilter(talent, activeFilter)) {
      return false;
    }
    if (keyword && !matchesTalentSearch(talent, keyword)) {
      return false;
    }
    return true;
  });
});

const activeTalent = computed(() => {
  const items = filteredTalents.value;
  if (!items.length) {
    return null;
  }
  return items.find((talent) => talent.slug === activeTalentSlug.value) || items[0];
});

const activeTalentDecisionTitle = computed(() => {
  if (!activeTalent.value) {
    return '先从左侧选择一位候选人';
  }
  const pills = talentMetaPills(activeTalent.value);
  if (pills.length) {
    return pills.join(' · ');
  }
  return '先看职业方向、标签与简介，再决定是否推进合作';
});

const activeTalentDecisionBody = computed(() => {
  if (!activeTalent.value) {
    return '右侧会承接当前候选人的决策摘要、专长标签和下一步动作。';
  }
  const tags = previewTalentTags(activeTalent.value.tags).join('、');
  const services = previewTalentServices(activeTalent.value.services).join(' / ');
  if (tags && services) {
    return `这位人才的公开方向集中在 ${tags}，当前可承接服务包括 ${services}。适合先快速核对，再决定是否立即发起合作。`;
  }
  if (tags) {
    return `这位人才当前最值得先看的，是 ${tags} 这组标签对应的实际能力与近期作品。`;
  }
  if (services) {
    return `当前公开可承接服务包括 ${services}。建议先核对服务范围，再进入完整详情页继续判断。`;
  }
  return '当前公开信息较少，建议先进入完整详情页核对履历与作品，再决定是否推进合作。';
});

const collaborationRestrictionMessage = computed(() => tradingRestrictionMessage(authState.user, 'enterprise'));
const collaborationBlocked = computed(() => Boolean(collaborationRestrictionMessage.value));
const collaborationTalentData = computed(() => collaborationTalent.value || activeTalent.value || null);

const heroStats = computed(() => [
  {
    label: '候选人才',
    value: `${filteredTalents.value.length}`,
    note: '当前可浏览的匹配结果'
  },
  {
    label: '筛选标签',
    value: `${Math.max(filterOptions.value.length - 1, 0)}`,
    note: '来自目录的公开标签'
  },
  {
    label: '当前选中',
    value: activeTalent.value ? activeTalent.value.name : '未选择',
    note: activeTalent.value ? activeTalent.value.role : '从左侧点击查看'
  },
  {
    label: '合作入口',
    value: collaborationBlocked.value ? '受限' : '可发起',
    note: collaborationBlocked.value ? '当前账号限制' : '可直接发起合作'
  }
]);

const activeTalentFacts = computed(() => {
  const portfolioCount = Array.isArray(activeTalent.value?.portfolio) ? activeTalent.value.portfolio.length : (activeTalent.value?.portfolio ? 1 : 0);
  return [
    { label: '评分', value: String(activeTalent.value?.score || '暂无'), note: '平台综合表现' },
    { label: '响应', value: String(activeTalent.value?.responseTime || '暂无'), note: '沟通反馈速度' },
    { label: '地点', value: String(activeTalent.value?.location || '未公开'), note: '当前公开位置' },
    { label: '作品', value: `${portfolioCount} 个`, note: '可继续查看样本' }
  ];
});

async function openCollaborationLauncher(talent = activeTalent.value) {
  if (!talent) {
    return;
  }
  collaborationTalent.value = talent;
  collaborationOpen.value = true;
  collaborationMode.value = 'existing';
  collaborationCandidates.value = [];
  collaborationError.value = '';
  collaborationLoading.value = false;
  collaborationBusyTaskId.value = '';
  if (collaborationBlocked.value) {
    collaborationMode.value = 'blocked';
    collaborationError.value = collaborationRestrictionMessage.value || '当前账号暂时还不能发起合作。';
    return;
  }
  if (!collaborationTalentData.value?.talentUserId) {
    collaborationMode.value = 'blocked';
    collaborationError.value = '当前人才标识还没准备好，请刷新页面后重试。';
    return;
  }
  await loadCollaborationCandidates();
}

function closeCollaborationLauncher() {
  collaborationOpen.value = false;
  collaborationMode.value = 'chooser';
  collaborationCandidates.value = [];
  collaborationError.value = '';
  collaborationLoading.value = false;
  collaborationBusyTaskId.value = '';
}

function openNewTaskWithTalent() {
  if (!collaborationTalentData.value) {
    collaborationError.value = '当前人才标识还没准备好，暂时无法新建任务。';
    return;
  }
  const targetRoute = roleRouteMap.enterprise.publishWithTalent(collaborationTalentData.value, 'enterprise-market');
  closeCollaborationLauncher();
  router.push(targetRoute).catch((error) => {
    collaborationOpen.value = true;
    collaborationMode.value = 'chooser';
    collaborationError.value = error instanceof Error ? error.message : '当前暂时无法进入发布任务页。';
  });
}

async function loadCollaborationCandidates() {
  collaborationMode.value = 'existing';
  if (!collaborationTalentData.value?.talentUserId) {
    collaborationError.value = '当前人才标识还没准备好，暂时无法读取可合作任务。';
    collaborationCandidates.value = [];
    return;
  }
  collaborationLoading.value = true;
  collaborationError.value = '';
  try {
    const payload = await getCollaborationCandidates(collaborationTalentData.value.talentUserId);
    collaborationCandidates.value = Array.isArray(payload?.items) ? payload.items : [];
    collaborationError.value = payload?.requestError || '';
  } catch (error) {
    collaborationError.value = error instanceof Error ? error.message : '当前暂时无法读取可合作任务。';
    collaborationCandidates.value = [];
  } finally {
    collaborationLoading.value = false;
  }
}

async function startExistingCollaboration(task) {
  if (!task?.taskId || !collaborationTalentData.value?.talentUserId) {
    collaborationError.value = '当前任务或人才标识不完整，暂时无法开始合作。';
    return;
  }
  collaborationBusyTaskId.value = task.taskId;
  collaborationError.value = '';
  try {
    const result = await startTaskCollaboration(task.taskId, collaborationTalentData.value.talentUserId);
    if (result?.requestError || result?.status === 'FAILED') {
      collaborationError.value = result?.requestError || result?.nextStep || '当前暂时无法开始合作。';
      return;
    }
    const normalizedTaskId = String(result?.taskId || task.taskId || '');
    const normalizedRoomKey = String(result?.roomKey || '');
    if (normalizedTaskId !== task.taskId) {
      collaborationError.value = '协作结果的任务标识不一致，请稍后重试。';
      return;
    }
    if (!normalizedRoomKey) {
      collaborationError.value = result?.nextStep || '企业已确认合作，但聊天房间编号暂未返回，请稍后从会话列表进入。';
      return;
    }
    closeCollaborationLauncher();
    await router.push(result?.nextRoute || roleRouteMap.enterprise.messageRoom(normalizedRoomKey, {
      taskId: task.taskId,
      source: 'market'
    }));
  } finally {
    collaborationBusyTaskId.value = '';
  }
}

function matchesTalentFilter(talent, filter) {
  const normalizedFilter = String(filter || '').trim();
  if (!normalizedFilter) {
    return true;
  }

  if (normalizedFilter === '高评分') {
    return Number(talent?.score) >= 4.9;
  }

  if (normalizedFilter === '近期可接单') {
    const responseText = String(talent?.responseTime || '');
    const minutes = Number(responseText.replace(/[^\d]/g, ''));
    return Number.isFinite(minutes) && minutes <= 15;
  }

  const searchPool = [
    talent?.name,
    talent?.role,
    talent?.summary,
    talent?.intro,
    talent?.portfolio,
    talent?.location,
    talent?.score,
    talent?.responseTime,
    ...(Array.isArray(talent?.tags) ? talent.tags : []),
    ...(Array.isArray(talent?.services) ? talent.services : [])
  ]
    .map((item) => String(item || '').toLowerCase())
    .join(' ');

  return searchPool.includes(normalizedFilter.toLowerCase());
}

function matchesTalentSearch(talent, keyword) {
  const searchPool = [
    talent?.name,
    talent?.role,
    talent?.summary,
    talent?.intro,
    talent?.location,
    talent?.score,
    talent?.responseTime,
    talent?.portfolio,
    ...(Array.isArray(talent?.tags) ? talent.tags : []),
    ...(Array.isArray(talent?.services) ? talent.services : [])
  ]
    .map((item) => String(item || '').toLowerCase())
    .join(' ');
  return searchPool.includes(keyword);
}

function countOf(items) {
  return Array.isArray(items) ? items.length : 0;
}

function previewTalentTags(items) {
  return (Array.isArray(items) ? items : []).slice(0, 2);
}

function previewTalentServices(items) {
  return (Array.isArray(items) ? items : []).slice(0, 2);
}

function talentMetaPills(talent) {
  const pills = [];
  const location = String(talent?.location || '').trim();
  const score = String(talent?.score || '').trim();
  const responseTime = String(talent?.responseTime || '').trim();
  if (location) {
    pills.push(location);
  }
  if (score) {
    pills.push(`评分 ${score}`);
  }
  if (responseTime) {
    pills.push(`响应 ${responseTime}`);
  }
  return pills;
}

function talentListSummary(talent) {
  return compactSummary(talent?.summary || talent?.intro || '', 82);
}

function talentDetailSummary(talent) {
  return compactSummary(talent?.intro || talent?.summary || '', 120);
}

function talentPortfolioSummary(talent) {
  const portfolio = Array.isArray(talent?.portfolio)
    ? talent.portfolio.map((item) => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object') {
        return String(item.title || item.name || item.desc || '').trim();
      }
      return '';
    }).filter(Boolean).join(' / ')
    : String(talent?.portfolio || '').trim();
  return compactSummary(portfolio, 110);
}

function compactSummary(value, limit = 56) {
  const text = String(value || '').trim();
  if (!text) {
    return '当前还没有更多摘要信息。';
  }
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).trim()}...`;
}

function selectTalent(talent) {
  activeTalentSlug.value = talent?.slug || null;
}

function detailRoute(slug) {
  const query = { from: 'market' };
  if (selectedFilter.value && selectedFilter.value !== '全部') {
    query.filter = selectedFilter.value;
  }
  return {
    path: roleRouteMap.enterprise.detail(slug),
    query
  };
}

watch(
  filterOptions,
  (options) => {
    if (!options.length) {
      return;
    }
    if (!options.includes(selectedFilter.value)) {
      selectedFilter.value = '全部';
    }
  },
  { immediate: true }
);

watch(
  () => route.query.filter,
  (value) => {
    const next = String(value || '全部');
    const allowed = filterOptions.value;
    selectedFilter.value = allowed.length ? (allowed.includes(next) ? next : '全部') : next;
  }
);

watch(
  filteredTalents,
  (items) => {
    if (!items.length) {
      activeTalentSlug.value = null;
      return;
    }

    if (!items.some((talent) => talent.slug === activeTalentSlug.value)) {
      activeTalentSlug.value = items[0].slug;
    }
  },
  { immediate: true }
);

watch(selectedFilter, (value) => {
  if (!page.value) {
    return;
  }
  const nextQuery = { ...route.query };
  if (!value || value === '全部') {
    delete nextQuery.filter;
  } else {
    nextQuery.filter = value;
  }
  router.replace({ query: nextQuery });
});

onMounted(async () => {
  page.value = await getTalentMarketplaceData();
});
</script>

<style scoped>
.talent-market-page {
  display: grid;
  gap: 20px;
  color: #dbe4f0;
}

.office-directory-empty,
.office-directory-hero,
.office-directory-detail-panel,
.office-directory-detail-placeholder {
  border: 1px solid rgba(121, 155, 255, 0.1);
  background:
    linear-gradient(180deg, rgba(8, 16, 29, 0.96), rgba(6, 11, 21, 0.98)),
    radial-gradient(circle at top right, rgba(76, 201, 255, 0.06), transparent 32%);
  box-shadow: 0 20px 42px rgba(1, 6, 18, 0.16);
}

.office-directory-empty {
  display: grid;
  gap: 8px;
  padding: 20px 22px;
  border-radius: 24px;
}

.office-directory-empty--warning {
  border-color: rgba(255, 193, 7, 0.24);
  background:
    linear-gradient(180deg, rgba(44, 34, 6, 0.94), rgba(23, 18, 5, 0.98)),
    radial-gradient(circle at top right, rgba(255, 193, 7, 0.12), transparent 32%);
}

.office-directory-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  gap: 20px;
  padding: 28px;
  border-radius: 30px;
}

.office-directory-hero-copy,
.office-directory-hero-panel,
.office-directory-detail-panel,
.office-directory-detail-placeholder {
  display: grid;
  gap: 14px;
}

.office-directory-hero-copy h1 {
  margin: 8px 0 0;
  font-size: clamp(36px, 4vw, 52px);
  letter-spacing: -0.05em;
}

.office-directory-lead,
.office-directory-row-summary,
.office-directory-detail-copy,
.office-directory-detail-placeholder p {
  line-height: 1.8;
  margin: 0;
}

.office-directory-hero-stats,
.office-directory-detail-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.office-directory-hero-stat,
.office-directory-detail-metric {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(121, 155, 255, 0.08);
  background: rgba(4, 9, 17, 0.72);
}

.office-directory-hero-stat__label,
.office-directory-detail-metric__label {
  color: #91a2b8;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.office-directory-hero-stat__value,
.office-directory-detail-metric__value {
  font-size: 18px;
  letter-spacing: -0.03em;
  color: #f2f7fd;
}

.office-directory-hero-stat__note,
.office-directory-detail-metric__note {
  margin: 0;
  font-size: 12px;
}

.office-directory-search-field {
  display: grid;
  gap: 6px;
}

.office-directory-search-label {
  font-size: 13px;
  color: #91a2b8;
}

.office-directory-search-input {
  min-height: 48px;
  padding: 0 16px;
  border-radius: 16px;
  border: 1px solid rgba(121, 155, 255, 0.18);
  background: rgba(5, 9, 16, 0.84);
  color: #f2f7fd;
}

.office-directory-filter-shell {
  padding: 16px;
  border-radius: 24px;
  border: 1px solid rgba(121, 155, 255, 0.1);
  background: rgba(5, 10, 18, 0.84);
}

.office-directory-filter-head {
  align-items: flex-start;
}

.office-directory-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.office-directory-filter-chip {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(121, 155, 255, 0.16);
  background: rgba(8, 14, 24, 0.9);
  color: #dbe4f0;
}

.office-directory-filter-chip.is-active {
  border-color: rgba(96, 150, 255, 0.34);
  background: rgba(22, 42, 86, 0.88);
  color: #f2f7fd;
  box-shadow: inset 0 0 0 1px rgba(96, 150, 255, 0.14);
}

.office-directory-hero-actions {
  gap: 10px;
  flex-wrap: wrap;
}

.office-directory-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
  gap: 20px;
  align-items: start;
}

.office-directory-list,
.office-directory-detail-rail {
  min-width: 0;
}

.office-directory-detail-rail {
  position: sticky;
  top: 96px;
}

.office-directory-list-header,
.office-directory-row-head,
.office-directory-row-actions,
.office-directory-detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.office-directory-row {
  display: grid;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 28px;
  border: 1px solid rgba(121, 155, 255, 0.1);
  background:
    linear-gradient(180deg, rgba(8, 16, 29, 0.92), rgba(6, 11, 21, 0.96)),
    radial-gradient(circle at top right, rgba(76, 201, 255, 0.06), transparent 32%);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  cursor: pointer;
}

.office-directory-row:hover {
  transform: translateY(-1px);
  border-color: rgba(76, 201, 255, 0.22);
  box-shadow: 0 16px 30px rgba(1, 6, 18, 0.18);
}

.office-directory-row:focus-visible {
  outline: 2px solid rgba(96, 150, 255, 0.74);
  outline-offset: 3px;
  border-color: rgba(96, 150, 255, 0.3);
}

.office-directory-row.is-active {
  border-color: rgba(96, 150, 255, 0.28);
  box-shadow: inset 0 0 0 1px rgba(96, 150, 255, 0.18);
}

.office-directory-row-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(96, 150, 255, 0.12);
  color: #f2f7fd;
  font-weight: 700;
}

.office-directory-row-identity h3,
.office-directory-detail-panel h2,
.office-directory-empty h3 {
  margin: 0;
  color: #f2f7fd;
}

.office-directory-row-summary {
  color: #91a2b8;
}

.office-directory-row-actions {
  align-items: center;
}

.office-directory-detail-panel,
.office-directory-detail-placeholder {
  padding: 24px;
  border-radius: 28px;
}

.office-directory-detail-panel {
  position: sticky;
  top: 96px;
}

.office-directory-detail-section {
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(121, 155, 255, 0.08);
  background: rgba(4, 9, 17, 0.7);
}

.office-directory-detail-actions {
  justify-content: flex-end;
}

@media (max-width: 1180px) {
  .office-directory-hero,
  .office-directory-layout {
    grid-template-columns: 1fr;
  }

  .office-directory-detail-rail {
    position: static;
  }
}

@media (max-width: 720px) {
  .office-directory-hero-stats,
  .office-directory-detail-metrics {
    grid-template-columns: 1fr;
  }

  .office-directory-row-head,
  .office-directory-row-actions,
  .office-directory-detail-head,
  .office-directory-list-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .office-directory-row,
  .office-directory-hero,
  .office-directory-detail-panel,
  .office-directory-detail-placeholder,
  .office-directory-empty,
  .office-directory-detail-section {
    padding: 16px;
  }

  .office-directory-hero-actions,
  .office-directory-row-actions {
    align-items: stretch;
  }
}
</style>
