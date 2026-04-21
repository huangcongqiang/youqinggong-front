<template>
  <section v-if="profileLoading" class="talent-profile-workspace stack-xl">
    <article class="result-card stack-sm">
      <span class="eyebrow">档案同步中</span>
      <h3>正在同步这份人才档案</h3>
      <p class="muted">先同步公开档案、作品和可复用任务，再继续判断是否邀请。</p>
    </article>
  </section>

  <section v-else-if="!profile" class="talent-profile-workspace stack-xl">
    <article class="result-card stack-sm">
      <span class="eyebrow">档案暂不可用</span>
      <h3>当前人才档案暂时不可用</h3>
      <p class="muted">{{ errorMessage || '请稍后再试，或先返回人才搜索继续查看其他候选人。' }}</p>
      <div class="toolbar">
        <router-link
          class="button-secondary"
          :to="isEnterpriseAudience ? roleRouteMap.enterprise.market : roleRouteMap.talent.market"
        >
          {{ isEnterpriseAudience ? '返回人才搜索' : '返回任务广场' }}
        </router-link>
      </div>
    </article>
  </section>

  <section v-else class="talent-profile-workspace stack-xl">
    <section class="talent-profile-hero panel">
      <div class="stack-xs">
        <span class="eyebrow">{{ isEnterpriseAudience ? '邀请前判断' : '公开档案' }}</span>
        <h1>{{ profile.name }}</h1>
        <p class="talent-profile-hero__role">{{ profile.role || '角色暂未公开' }}</p>
      </div>

      <div class="talent-profile-hero__signals">
        <span>{{ profile.score || '暂无评分' }}</span>
        <span>{{ profile.location || '地点暂未公开' }}</span>
        <span>{{ profile.responseTime || '响应速度暂未公开' }}</span>
        <span>{{ profile.availability || '可用时间暂未公开' }}</span>
      </div>

      <p class="talent-profile-hero__summary">{{ profile.intro || profile.summary || '先看评分、响应速度、可用时间和所在地，再决定是否邀请。' }}</p>
    </section>

    <section class="talent-profile-layout">
      <div class="talent-profile-main stack-lg">
        <article class="panel talent-profile-section stack-md">
          <div class="section-head">
            <div class="stack-xs">
              <span class="eyebrow">核心优势</span>
              <h2>核心优势</h2>
            </div>
          </div>
          <div v-if="profileStandardSkills.length || profileCustomSkills.length" class="talent-profile-chip-groups">
            <div v-if="profileStandardSkills.length" class="stack-xs">
              <span class="talent-profile-label">标准标签</span>
              <div class="talent-profile-chip-row">
                <span v-for="item in profileStandardSkills" :key="`standard-${item}`" class="talent-profile-chip is-standard">{{ item }}</span>
              </div>
            </div>
            <div v-if="profileCustomSkills.length" class="stack-xs">
              <span class="talent-profile-label">自定义标签</span>
              <div class="talent-profile-chip-row">
                <span v-for="item in profileCustomSkills" :key="`custom-${item}`" class="talent-profile-chip is-custom">{{ item }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state talent-profile-empty-state is-compact">
            <strong>这位人才还没有公开更多优势标签</strong>
            <p>先看标题和简介，再决定是否继续深入查看。</p>
          </div>
        </article>

        <article class="panel talent-profile-section stack-md">
          <div class="section-head">
            <div class="stack-xs">
              <span class="eyebrow">服务方向</span>
              <h2>服务方向</h2>
            </div>
          </div>
          <div v-if="profile.services.length" class="talent-profile-service-list">
            <article v-for="item in profile.services" :key="item" class="talent-profile-service-card">
              <strong>{{ item }}</strong>
              <p>先用这些服务方向判断是否要发任务、发起沟通，或继续查看。</p>
            </article>
          </div>
          <div v-else class="empty-state talent-profile-empty-state is-compact">
            <strong>暂时还没有公开服务清单</strong>
            <p>先结合档案简介和近期作品继续判断匹配度。</p>
          </div>
        </article>

        <article class="panel talent-profile-section stack-md">
          <div class="section-head">
            <div class="stack-xs">
              <span class="eyebrow">最近作品</span>
              <h2>最近作品与反馈</h2>
            </div>
          </div>
          <div v-if="profile.portfolio.length || profile.reviews.length" class="talent-profile-two-col">
            <div class="stack-sm">
              <strong>作品样本</strong>
              <div v-if="profile.portfolio.length" class="talent-profile-portfolio-list">
                <article v-for="item in profile.portfolio" :key="item.title || item.name" class="talent-profile-portfolio-card">
                  <strong>{{ item.title || item.name || '作品样本' }}</strong>
                  <p>{{ item.description || item.summary || '打开完整档案后，可以继续看更多合作上下文。' }}</p>
                </article>
              </div>
              <div v-else class="empty-state talent-profile-empty-state is-compact">
                <strong>暂时还没有公开作品样本</strong>
                <p>先结合简介、服务方向和反馈继续判断。</p>
              </div>
            </div>
            <div class="stack-sm">
              <strong>反馈</strong>
              <div v-if="profile.reviews.length" class="talent-profile-review-list">
                <article v-for="item in profile.reviews" :key="item.time || item.title || item.content" class="talent-profile-review-card">
                  <strong>{{ item.title || item.reviewer || '反馈记录' }}</strong>
                  <p>{{ item.content || item.summary || '这条反馈暂时还没有更多公开细节。' }}</p>
                </article>
              </div>
              <div v-else class="empty-state talent-profile-empty-state is-compact">
                <strong>暂时还没有公开反馈</strong>
                <p>合作完成后，双方反馈和信任信号会继续同步到这里。</p>
              </div>
            </div>
          </div>
        </article>

        <article class="panel talent-profile-section stack-md">
          <div class="section-head">
            <div class="stack-xs">
              <span class="eyebrow">档案概览</span>
              <h2>公开档案摘要</h2>
            </div>
          </div>
          <p class="talent-profile-notes">
            {{ profile.summary || profile.intro || '这里会继续沉淀更完整的公开档案、合作方式和反馈记录。' }}
          </p>
        </article>
      </div>

      <aside class="talent-profile-side stack-lg">
        <article class="panel talent-profile-sidecard stack-md">
          <div class="stack-xs">
            <span class="eyebrow">信任信号</span>
            <h3>{{ isEnterpriseAudience ? '先看评分、响应速度和可用时间，再决定是否邀请' : '这是企业先看到的公开档案' }}</h3>
          </div>

          <template v-if="isEnterpriseAudience">
            <div class="talent-profile-decision-grid">
              <article v-for="signal in decisionSignals" :key="signal.label" class="talent-profile-decision-card">
                <span>{{ signal.label }}</span>
                <strong>{{ signal.value }}</strong>
              </article>
            </div>

            <p class="talent-profile-side-note">
              先看评分、响应速度、所在地和可用时间，再决定现在邀请还是回到已有任务继续推进。
            </p>

            <div class="talent-profile-side-actions">
              <router-link
                class="button-primary"
                :to="roleRouteMap.enterprise.publishWithTalent({ talentUserId: profile.talentUserId, slug: profile.slug, name: profile.name })"
              >
                邀请到任务
              </router-link>
              <router-link class="button-secondary" :to="roleRouteMap.enterprise.market">返回人才搜索</router-link>
            </div>

            <div class="stack-sm">
              <span class="eyebrow">使用已有任务</span>
              <div v-if="candidateLoading" class="muted">正在加载可复用任务…</div>
              <article v-else-if="candidateErrorMessage" class="result-card stack-sm talent-profile-candidate-unavailable">
                <span class="eyebrow">可复用任务暂时不可用</span>
                <p class="muted">{{ candidateErrorMessage }}</p>
                <p class="muted">先回到人才搜索，或稍后再回来继续从已有任务发起沟通。</p>
                <router-link
                  class="button-link"
                  :to="roleRouteMap.enterprise.publishWithTalent({ talentUserId: profile.talentUserId, slug: profile.slug, name: profile.name })"
                >
                  先发布任务
                </router-link>
              </article>
              <div v-else-if="collaborationCandidates.length" class="talent-profile-candidate-list">
                <button
                  v-for="task in collaborationCandidates"
                  :key="task.taskId"
                  class="talent-profile-candidate-card"
                  :disabled="!task.canStart || collaborationStarting"
                  type="button"
                  @click="startCollaboration(task.taskId)"
                >
                  <div class="stack-xs">
                    <strong>{{ task.title }}</strong>
                    <p>{{ task.status }}</p>
                  </div>
                  <span>{{ task.canStart ? '用这份任务继续' : task.blockedReason || '当前不可用' }}</span>
                </button>
              </div>
              <div v-else class="empty-state talent-profile-empty-state is-compact">
                <strong>还没有可复用任务</strong>
                <p>先发布一份任务，再从那份任务里继续发起沟通。</p>
                <router-link
                  class="button-link"
                  :to="roleRouteMap.enterprise.publishWithTalent({ talentUserId: profile.talentUserId, slug: profile.slug, name: profile.name })"
                >
                  先发布任务
                </router-link>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="talent-profile-side-actions">
              <router-link class="button-primary" :to="roleRouteMap.talent.market">找任务</router-link>
              <router-link class="button-secondary" :to="roleRouteMap.talent.records">查看记录</router-link>
            </div>
            <div class="talent-profile-side-metrics">
              <article class="talent-profile-side-metric">
                <span>评分</span>
                <strong>{{ profile.score || '--' }}</strong>
              </article>
              <article class="talent-profile-side-metric">
                <span>响应速度</span>
                <strong>{{ profile.responseTime || '暂未公开' }}</strong>
              </article>
              <article class="talent-profile-side-metric">
                <span>地点</span>
                <strong>{{ profile.location || '暂未公开' }}</strong>
              </article>
            </div>
            <p class="muted">这是你的公开档案，企业会先在这里判断是否继续沟通。</p>
          </template>
        </article>
      </aside>
    </section>

    <ActionErrorDialog :message="collaborationErrorMessage" title="当前暂时不能发起邀请" eyebrow="邀请" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ActionErrorDialog from '../components/ActionErrorDialog.vue';
import { getStoredAuthUser } from '../services/authSession';
import { getCollaborationCandidates, getTalentDetail, startTaskCollaboration } from '../services/api';
import { resolveRequestedTalentSlug } from '../utils/talentProfileSlug';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const profile = ref(null);
const profileLoading = ref(true);
const collaborationCandidates = ref([]);
const candidateLoading = ref(false);
const collaborationStarting = ref(false);
const errorMessage = ref('');
const candidateErrorMessage = ref('');
const collaborationErrorMessage = ref('');

const isEnterpriseAudience = computed(() => route.path.startsWith('/enterprise/'));
const profileStandardSkills = computed(() => {
  const strengths = Array.isArray(profile.value?.strengths) ? profile.value.strengths : [];
  const services = Array.isArray(profile.value?.services) ? profile.value.services : [];
  const skills = Array.isArray(profile.value?.skills) ? profile.value.skills : [];
  return [...new Set([...skills, ...strengths, ...services])].slice(0, 10);
});
const profileCustomSkills = computed(() =>
  Array.isArray(profile.value?.customSkills) ? [...new Set(profile.value.customSkills)].slice(0, 6) : []
);

const decisionSignals = computed(() => [
  { label: '评分', value: profile.value?.score || '暂无评分' },
  { label: '响应速度', value: profile.value?.responseTime || '暂未公开' },
  { label: '地点', value: profile.value?.location || '暂未公开' },
  { label: '可用时间', value: profile.value?.availability || '暂未公开' },
]);

async function loadCandidates() {
  collaborationCandidates.value = [];
  candidateErrorMessage.value = '';
  if (!isEnterpriseAudience.value || !profile.value?.talentUserId) {
    return;
  }
  candidateLoading.value = true;
  try {
    const payload = await getCollaborationCandidates(profile.value.talentUserId);
    if (payload?.requestError) {
      candidateErrorMessage.value = payload.requestError;
      collaborationCandidates.value = [];
      return;
    }
    collaborationCandidates.value = Array.isArray(payload?.items) ? payload.items : [];
  } catch (error) {
    candidateErrorMessage.value = error?.message || '可复用任务暂时不可用，请稍后再试。';
    collaborationCandidates.value = [];
  } finally {
    candidateLoading.value = false;
  }
}

async function startCollaboration(taskId) {
  if (!profile.value?.talentUserId || !taskId) {
    collaborationErrorMessage.value = '当前档案缺少必要标识，暂时不能继续发起邀请。';
    return;
  }
  collaborationStarting.value = true;
  collaborationErrorMessage.value = '';
  try {
    const payload = await startTaskCollaboration(taskId, profile.value.talentUserId);
    if (payload?.requestError || payload?.status === 'FAILED') {
      collaborationErrorMessage.value = payload?.requestError || payload?.nextStep || '当前暂时不能从这个档案直接发起合作。';
      return;
    }
    if (payload?.nextRoute) {
      router.push(payload.nextRoute);
      return;
    }
    const roomKey = String(payload?.roomKey || payload?.room?.roomKey || payload?.room?.key || '').trim();
    if (roomKey) {
      router.push(roleRouteMap.enterprise.messageRoom(roomKey, {
        taskId,
        roomKey,
        source: 'messages',
        surface: 'messages',
        originSource: 'profile',
        originTaskId: taskId,
      }));
      return;
    }
    collaborationErrorMessage.value = '协作已经创建，但消息入口还没同步好，请稍后再试。';
  } finally {
    collaborationStarting.value = false;
  }
}

async function loadProfile() {
  profileLoading.value = true;
  errorMessage.value = '';
  candidateErrorMessage.value = '';
  collaborationErrorMessage.value = '';
  collaborationCandidates.value = [];
  try {
    const requestedSlug = String(route.params.slug || '').trim();
    const resolvedSlug = resolveRequestedTalentSlug(requestedSlug, getStoredAuthUser());
    if (!resolvedSlug) {
      errorMessage.value = '当前人才档案缺少可用标识，请稍后再试。';
      profile.value = null;
      collaborationCandidates.value = [];
      return;
    }
    const payload = await getTalentDetail(resolvedSlug);
    if (payload?.requestError) {
      errorMessage.value = payload.requestError;
      profile.value = null;
      collaborationCandidates.value = [];
      return;
    }
    profile.value = {
      ...payload,
      strengths: Array.isArray(payload?.strengths) ? payload.strengths : [],
      services: Array.isArray(payload?.services) ? payload.services : [],
      portfolio: Array.isArray(payload?.portfolio) ? payload.portfolio : [],
      reviews: Array.isArray(payload?.reviews) ? payload.reviews : []
    };
    if (!isEnterpriseAudience.value && requestedSlug !== resolvedSlug) {
      router.replace(roleRouteMap.talent.profile(encodeURIComponent(resolvedSlug)));
    }
    await loadCandidates();
  } catch (error) {
    errorMessage.value = error?.message || '当前人才档案暂时不可用，请稍后再试。';
    profile.value = null;
    collaborationCandidates.value = [];
  } finally {
    profileLoading.value = false;
  }
}

onMounted(loadProfile);

watch(
  () => String(route.params.slug || '').trim(),
  (nextSlug, previousSlug) => {
    if (!nextSlug || nextSlug === String(previousSlug || '').trim()) {
      return;
    }
    loadProfile();
  }
);
</script>

<style scoped>
.talent-profile-workspace {
  display: grid;
  gap: 24px;
}

.talent-profile-hero {
  display: grid;
  gap: 18px;
  padding: 30px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(30, 128, 66, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #fbfaf5 100%);
}

.talent-profile-hero h1 {
  margin: 0;
  color: #121212;
  font-size: clamp(2.15rem, 4vw, 3.8rem);
  line-height: 0.96;
  letter-spacing: -0.07em;
}

.talent-profile-hero__role {
  margin: 0;
  color: #5f5d54;
  font-size: 1.05rem;
}

.talent-profile-hero__summary {
  margin: 0;
  color: #5f5d54;
  line-height: 1.8;
  max-width: 70ch;
}

.talent-profile-hero__signals {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.talent-profile-hero__signals span,
.talent-profile-chip,
.talent-profile-side-metric strong {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eff7ee;
  color: #187236;
  font-weight: 700;
}

.talent-profile-chip.is-standard {
  background: #edf7ea;
  color: #1f6a3c;
}

.talent-profile-chip.is-custom {
  background: #fff3e8;
  color: #9a5b20;
}

.talent-profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
  gap: 24px;
}

.talent-profile-section,
.talent-profile-sidecard {
  border-radius: 28px;
  padding: 26px;
  background: rgba(255, 255, 255, 0.96);
}

.talent-profile-sidecard {
  position: sticky;
  top: 124px;
  align-self: start;
}

.section-head,
.talent-profile-section__header,
.talent-profile-side-actions,
.talent-profile-candidate-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-head h2,
.talent-profile-sidecard h3 {
  margin: 4px 0 0;
  color: #121212;
  font-size: 1.65rem;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.talent-profile-chip-row,
.talent-profile-service-list,
.talent-profile-portfolio-list,
.talent-profile-review-list,
.talent-profile-candidate-list,
.talent-profile-side-metrics {
  display: grid;
  gap: 14px;
}

.talent-profile-chip-groups {
  display: grid;
  gap: 14px;
}

.talent-profile-label {
  color: #6f7b70;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.talent-profile-service-card,
.talent-profile-portfolio-card,
.talent-profile-review-card,
.talent-profile-candidate-card,
.talent-profile-side-metric {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #ffffff;
}

.talent-profile-service-card p,
.talent-profile-portfolio-card p,
.talent-profile-review-card p,
.talent-profile-candidate-card p,
.talent-profile-notes {
  margin: 0;
  color: #606059;
  line-height: 1.72;
}

.talent-profile-two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.talent-profile-empty-state.is-compact {
  min-height: 132px;
}

.talent-profile-side-actions {
  flex-wrap: wrap;
}

.talent-profile-decision-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.talent-profile-decision-card {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #fffdf8;
}

.talent-profile-decision-card span {
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.talent-profile-decision-card strong {
  color: #111827;
  font-size: 1.05rem;
}

.talent-profile-side-note {
  margin: 0;
  color: #52606d;
  line-height: 1.7;
}

.talent-profile-side-metric strong {
  justify-content: flex-start;
  width: fit-content;
}

.empty-state {
  border-radius: 22px;
  border: 1px dashed rgba(18, 18, 18, 0.14);
  background: #fffef8;
  color: #5f5d54;
}

@media (max-width: 1280px) {
  .talent-profile-layout,
  .talent-profile-two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .talent-profile-section,
  .talent-profile-sidecard,
  .talent-profile-hero {
    padding: 20px;
    border-radius: 24px;
  }

  .section-head,
  .talent-profile-candidate-card,
  .talent-profile-side-actions {
    flex-direction: column;
  }
}
</style>
