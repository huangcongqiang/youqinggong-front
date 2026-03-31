<template>
  <section class="page-stack talent-detail-page office-detail-page" v-if="page">
    <div class="talent-detail-shell office-detail-shell">
      <article class="glass-panel talent-detail-hero talent-decision-hero stack-lg">
        <div class="talent-decision-hero-top">
          <div class="talent-avatar-shell talent-detail-avatar-shell talent-decision-identity">
            <div class="talent-avatar">
              <img v-if="page.avatar" :src="page.avatar" :alt="`${page.name} 头像`" />
              <span v-else>{{ avatarMonogram }}</span>
            </div>

            <div class="stack-sm talent-detail-identity">
              <span class="eyebrow">合作决策页</span>
              <h1 class="talent-detail-name">{{ page.name }}</h1>
              <p class="talent-detail-role">{{ page.role }}</p>
              <div v-if="decisionTags.length" class="tag-row talent-decision-tags">
                <span v-for="tag in decisionTags" :key="tag" class="soft-pill">{{ tag }}</span>
              </div>
            </div>
          </div>

          <div class="talent-decision-panel stack-md">
            <div class="panel-header talent-decision-panel__header">
              <div>
                <span class="eyebrow">结论</span>
                <h3>{{ decision.headline }}</h3>
              </div>
              <span class="decision-badge" :class="`decision-badge--${decision.tone}`">{{ decision.badge }}</span>
            </div>

            <p class="talent-decision-summary">{{ decision.summary }}</p>

            <div class="talent-decision-strip">
              <article v-for="metric in decision.metrics" :key="metric.label" class="talent-decision-metric">
                <span class="talent-decision-metric-label">{{ metric.label }}</span>
                <strong class="talent-decision-metric-value">{{ metric.value }}</strong>
              </article>
            </div>

            <div class="talent-decision-next">
              <p class="muted">{{ decision.nextStep }}</p>
              <div class="talent-detail-hero-actions office-detail-actions">
                <router-link class="button-secondary" :to="backToMarket">{{ backLabel }}</router-link>
                <router-link class="button-primary" :to="conversationRoute">{{ conversationLabel }}</router-link>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div class="talent-detail-layout office-detail-layout">
        <main class="talent-detail-main office-detail-main stack-md">
          <article class="glass-panel stack-md">
            <div class="panel-header">
              <div>
                <span class="eyebrow">关键判断</span>
                <h3>只看三个继续推进信号</h3>
              </div>
            </div>

            <div class="talent-ability-grid talent-decision-grid">
              <article
                v-for="item in decisionSignals"
                :key="item.label"
                class="mini-card stack-sm talent-ability-card talent-decision-signal"
              >
                <h4>{{ item.label }}</h4>
                <strong class="talent-decision-signal-value">{{ item.value }}</strong>
                <p class="muted">{{ item.note }}</p>
              </article>
            </div>

          </article>

          <article class="glass-panel stack-md">
            <div class="panel-header talent-work-header">
              <div>
                <span class="eyebrow">作品证据</span>
                <h3>直接看产物，而不是看长履历</h3>
              </div>

              <div class="talent-work-header-meta">
                <span class="soft-pill" v-if="activePortfolio">{{ portfolioTypeLabel(activePortfolio) }}</span>
                <span class="muted">{{ portfolioCounter }}</span>
              </div>
            </div>

            <article v-if="activePortfolio" class="talent-work-stage stack-md">
              <button
                v-if="activePortfolio.type !== 'LINK'"
                class="talent-work-media"
                type="button"
                @click="openPreview(activePortfolio)"
              >
                <img
                  :src="activePortfolio.cover || activePortfolio.mediaUrl"
                  :alt="activePortfolio.title"
                  class="talent-work-media-image"
                />
                <span class="soft-pill talent-work-type">{{ portfolioTypeLabel(activePortfolio) }}</span>
                <span class="talent-work-preview-note">{{ previewLabel(activePortfolio) }}</span>
              </button>

              <div v-else class="talent-work-link-preview">
                <img
                  v-if="activePortfolio.cover"
                  :src="activePortfolio.cover"
                  :alt="activePortfolio.title"
                  class="talent-work-link-image"
                />
                <span class="soft-pill talent-work-type">{{ portfolioTypeLabel(activePortfolio) }}</span>
                <h4>{{ activePortfolio.title }}</h4>
                <p class="muted">{{ activePortfolio.desc }}</p>
                <button class="button-primary" type="button" @click="openExternalLink(activePortfolio.linkUrl)">
                  打开项目链接
                </button>
              </div>

              <div class="stack-sm">
                <div class="title-line">
                  <div>
                    <h3>{{ activePortfolio.title }}</h3>
                    <p class="muted">{{ activePortfolio.tag }}</p>
                  </div>
                </div>

                <p class="muted">{{ activePortfolio.desc }}</p>

                <div class="talent-work-actions">
                  <button class="button-secondary" type="button" @click="previousPortfolio">上一个</button>
                  <button class="button-secondary" type="button" @click="nextPortfolio">下一个</button>
                  <button
                    v-if="activePortfolio.type !== 'LINK'"
                    class="button-primary"
                    type="button"
                    @click="openPreview(activePortfolio)"
                  >
                    {{ previewLabel(activePortfolio) }}
                  </button>
                  <button
                    v-else
                    class="button-primary"
                    type="button"
                    @click="openExternalLink(activePortfolio.linkUrl)"
                  >
                    查看项目页面
                  </button>
                </div>
              </div>
            </article>

            <div class="talent-work-rail" v-if="portfolioItems.length">
              <button
                v-for="(item, index) in portfolioItems"
                :key="`${item.title}-${index}`"
                type="button"
                class="talent-work-thumb"
                :class="{ 'is-active': index === portfolioIndex }"
                @click="portfolioIndex = index"
              >
                <span class="soft-pill">{{ portfolioTypeLabel(item) }}</span>
                <strong>{{ item.title }}</strong>
                <small>{{ item.tag }}</small>
              </button>
            </div>
          </article>

          <article class="glass-panel stack-md">
            <div class="panel-header">
              <div>
                <span class="eyebrow">合作反馈</span>
                <h3>看沟通、交付和修改响应的真实反馈</h3>
              </div>
            </div>

            <div class="stack-sm">
              <article
                v-for="review in reviewItems"
                :key="`${review.author}-${review.content}`"
                class="mini-card stack-sm talent-review-card"
              >
                <div class="talent-review-head">
                  <div class="title-line">
                    <span class="status-dot"></span>
                    <div>
                      <h4>{{ review.author }}</h4>
                      <p class="muted">{{ review.role }}</p>
                    </div>
                  </div>
                  <strong class="talent-review-score">{{ review.score }}</strong>
                </div>
                <p class="muted">{{ review.content }}</p>
                <p class="talent-review-outcome">{{ review.outcome }}</p>
              </article>
            </div>
          </article>

          <article class="glass-panel stack-md">
            <details class="talent-background-details">
              <summary>
                <div>
                  <span class="eyebrow">履历背景</span>
                  <h3>需要时再展开看完整经历</h3>
                </div>
                <span class="muted">减少说明墙，只保留必要背景</span>
              </summary>

              <p class="muted">{{ page.resumeSummary }}</p>

              <div class="talent-timeline">
                <article
                  v-for="item in page.experience"
                  :key="`${item.period}-${item.title}`"
                  class="talent-timeline-item stack-sm"
                >
                  <div class="talent-timeline-meta">
                    <span class="talent-timeline-period">{{ item.period }}</span>
                    <span class="muted">{{ item.organization }}</span>
                  </div>
                  <h4>{{ item.title }}</h4>
                  <p class="muted">{{ item.summary }}</p>
                  <div class="tag-row">
                    <span v-for="tag in item.highlights" :key="tag" class="tag-pill tag-pill-muted">{{ tag }}</span>
                  </div>
                </article>
              </div>
            </details>
          </article>
        </main>

        <aside class="talent-detail-rail office-detail-side stack-md">
          <article class="glass-panel stack-md talent-action-card">
            <div class="panel-header">
              <div>
                <span class="eyebrow">推进提示</span>
                <h3>下一步先做一件事</h3>
              </div>
            </div>

            <p class="muted">{{ decision.nextStep }}</p>
            <span class="soft-pill">{{ decision.badge }}</span>
          </article>

          <article class="glass-panel stack-md">
            <div class="panel-header">
              <div>
                <span class="eyebrow">合作边界</span>
                <h3>先把节奏、范围和节拍说清楚</h3>
              </div>
            </div>

            <ul class="talent-summary-list">
              <li class="talent-summary-row">
                <span class="muted">当前档期</span>
                <strong>{{ page.availability[0] || '暂无档期说明' }}</strong>
              </li>
              <li class="talent-summary-row">
                <span class="muted">协作节拍</span>
                <strong>{{ page.process[0] || '暂无流程说明' }}</strong>
              </li>
              <li class="talent-summary-row">
                <span class="muted">适合场景</span>
                <strong>{{ page.services[0] || page.specialty }}</strong>
              </li>
            </ul>
          </article>

          <article class="glass-panel stack-md">
            <div class="panel-header">
              <div>
                <span class="eyebrow">决策备忘</span>
                <h3>只留合作时真正会用到的补充信息</h3>
              </div>
            </div>

            <div class="talent-summary-list">
              <div class="talent-summary-row">
                <span class="muted">合作节奏</span>
                <strong>{{ page.process[1] || page.process[0] || '暂无节奏说明' }}</strong>
              </div>
              <div class="talent-summary-row">
                <span class="muted">作品方向</span>
                <strong>{{ page.services[0] || page.specialty }}</strong>
              </div>
              <div class="talent-summary-row">
                <span class="muted">继续聊前先看</span>
                <strong>{{ page.platformResults?.highlights?.[0]?.title || '作品和反馈是否对得上' }}</strong>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </div>
  </section>

  <div v-if="previewItem" class="talent-media-modal" @click.self="closePreview">
    <article class="talent-media-card stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">作品预览</span>
          <h3>{{ previewItem.title }}</h3>
        </div>
        <button class="button-secondary" type="button" @click="closePreview">关闭</button>
      </div>

      <img
        v-if="previewItem.type === 'IMAGE'"
        :src="previewItem.mediaUrl || previewItem.cover"
        :alt="previewItem.title"
        class="talent-media-frame"
      />

      <video
        v-else-if="previewItem.type === 'VIDEO'"
        class="talent-media-frame talent-media-video"
        controls
        autoplay
        playsinline
        :poster="previewItem.cover"
        :src="previewItem.mediaUrl"
      ></video>

      <p class="muted">{{ previewItem.desc }}</p>
    </article>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getTalentDetail } from '../services/api';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const page = ref(null);
const portfolioIndex = ref(0);
const previewItem = ref(null);

const audience = computed(() => resolveAudience(route));
const backToMarket = computed(() => {
  if (audience.value === 'talent') {
    return roleRouteMap.talent.home;
  }
  const query = {};
  if (route.query.from) {
    query.from = String(route.query.from);
  }
  if (route.query.filter) {
    query.filter = String(route.query.filter);
  }
  return {
    path: roleRouteMap.enterprise.market,
    query
  };
});
const backLabel = computed(() =>
  audience.value === 'talent' ? '返回人才端首页' : '返回人才广场'
);
const conversationRoute = computed(() => {
  const base = audience.value === 'talent' ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages;
  if (audience.value === 'talent') {
    return base;
  }
  return {
    path: base,
    query: {
      counterpartPlatformUserId: page.value?.platformUserId || '',
      counterpartName: page.value?.name || '',
      talentSlug: page.value?.slug || '',
      from: 'talent-detail'
    }
  };
});
const conversationLabel = computed(() =>
  audience.value === 'talent' ? '查看聊天' : '发起聊天'
);
const avatarMonogram = computed(() => {
  const name = page.value?.name || '';
  return name.slice(0, 2) || 'AI';
});
const decisionTags = computed(() => (page.value?.headlineTags || []).slice(0, 3));
const reviewItems = computed(() => (page.value?.reviews || []).slice(0, 2));
const portfolioItems = computed(() => page.value?.portfolio || []);
const activePortfolio = computed(() => portfolioItems.value[portfolioIndex.value] || null);
const portfolioCounter = computed(() =>
  portfolioItems.value.length ? `${portfolioIndex.value + 1} / ${portfolioItems.value.length}` : '暂无作品'
);
const decision = computed(() => {
  const score = Number.parseFloat(String(page.value?.score || '').replace(/[^\d.]/g, '')) || 0;
  const completion = Number.parseFloat(String(page.value?.completionRate || '').replace(/[^\d.]/g, '')) || 0;
  const response = Number.parseFloat(String(page.value?.responseTime || '').replace(/[^\d.]/g, '')) || 0;
  const highConfidence = score >= 4.9 && completion >= 96 && response <= 12;
  const strongMatch = score >= 4.8 && completion >= 94;

  let tone = 'caution';
  let badge = '建议补充验证';
  let headline = '先补齐关键信号，再决定是否推进';
  let summary = '当前信息更适合做初筛，建议先补一轮作品、协作边界或试做结果。';
  let nextStep = audience.value === 'talent'
    ? '先继续查看聊天，把这位合作对象纳入候选沟通。'
    : '先发起聊天，确认需求边界和排期，再决定是否推进。';

  if (highConfidence) {
    tone = 'positive';
    badge = '建议优先推进';
    headline = '适合尽快进入合作沟通';
    summary = '评分、完工率和响应速度都比较稳，适合直接进入需求确认和排期沟通。';
    nextStep = audience.value === 'talent'
      ? '可以继续把它放进优先沟通列表，先确认合作范围。'
      : '可以直接发起聊天，先确认需求范围和时间表。';
  } else if (strongMatch) {
    tone = 'neutral';
    badge = '可以进入下一轮';
    headline = '基础表现不错，适合继续沟通';
    summary = '整体表现是稳的，但最好先把合作范围、里程碑和协作节奏再确认一次。';
    nextStep = audience.value === 'talent'
      ? '继续查看聊天，优先确认版本边界和节奏。'
      : '先进入聊天，把交付边界和排期对齐。';
  }

  return {
    tone,
    badge,
    headline,
    summary,
    nextStep,
    note: page.value?.platformResults?.summary || page.value?.resumeSummary || '用评分、完工率、响应速度和作品样本一起判断是否推进。',
    metrics: [
      { label: '评分', value: page.value?.score || '暂无' },
      { label: '完工率', value: page.value?.completionRate || '暂无' },
      { label: '响应', value: page.value?.responseTime || '暂无' }
    ]
  };
});
const decisionSignals = computed(() => {
  const platformMetrics = page.value?.platformResults?.metrics || [];
  const platformHighlights = page.value?.platformResults?.highlights || [];

  return [
    {
      label: '交付稳定性',
      value: `${page.value?.score || '暂无'} / ${page.value?.completionRate || '暂无'}`,
      note: platformMetrics[0]?.note || '优先看真实交付与验收完成情况。'
    },
    {
      label: '协作响应',
      value: page.value?.responseTime || '暂无',
      note: platformHighlights[0]?.note || '快节奏沟通会更容易推进下一步。'
    },
    {
      label: '适配场景',
      value: page.value?.services?.[0] || page.value?.specialty || '暂无',
      note: page.value?.resumeSummary || '先看是否匹配当前合作类型。'
    }
  ];
});

function portfolioTypeLabel(item) {
  if (!item?.type) {
    return '作品';
  }

  const map = {
    IMAGE: '图片作品',
    VIDEO: '视频作品',
    LINK: '项目链接'
  };

  return map[item.type] || item.type;
}

function previewLabel(item) {
  return item?.type === 'VIDEO' ? '播放演示视频' : '查看大图';
}

function previousPortfolio() {
  if (!portfolioItems.value.length) {
    return;
  }
  portfolioIndex.value =
    (portfolioIndex.value - 1 + portfolioItems.value.length) % portfolioItems.value.length;
}

function nextPortfolio() {
  if (!portfolioItems.value.length) {
    return;
  }
  portfolioIndex.value = (portfolioIndex.value + 1) % portfolioItems.value.length;
}

function openExternalLink(url) {
  if (!url || typeof window === 'undefined') {
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

function openPreview(item) {
  if (!item) {
    return;
  }

  if (item.type === 'LINK') {
    openExternalLink(item.linkUrl);
    return;
  }

  previewItem.value = item;
}

function closePreview() {
  previewItem.value = null;
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closePreview();
  }

  if (!portfolioItems.value.length || previewItem.value) {
    return;
  }

  if (event.key === 'ArrowLeft') {
    previousPortfolio();
  }

  if (event.key === 'ArrowRight') {
    nextPortfolio();
  }
}

async function loadTalent() {
  page.value = await getTalentDetail(route.params.slug);
  portfolioIndex.value = 0;
  closePreview();
}

onMounted(() => {
  loadTalent();
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }
});

watch(() => route.params.slug, loadTalent);
</script>

<style scoped>
.talent-detail-page {
  gap: 20px;
  padding-bottom: 24px;
}

.talent-detail-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.talent-detail-hero {
  padding: 24px;
}

.talent-decision-hero-top {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 16px;
  align-items: start;
}

.talent-detail-avatar-shell {
  align-items: flex-start;
}

.talent-detail-avatar-shell .talent-avatar {
  width: 92px;
  height: 92px;
  border-radius: 24px;
}

.talent-decision-identity {
  gap: 12px;
}

.talent-detail-identity {
  min-width: 0;
}

.talent-detail-name {
  margin: 0;
  font-size: clamp(1.9rem, 2.3vw, 3rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.talent-detail-role {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.talent-decision-panel {
  min-width: 0;
  padding: 18px;
  border: 1px solid rgba(106, 166, 255, 0.18);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(106, 166, 255, 0.1), rgba(255, 255, 255, 0.04));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.talent-decision-panel__header {
  align-items: flex-start;
}

.decision-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.decision-badge--positive {
  color: #b9f0d7;
  background: rgba(79, 214, 151, 0.14);
  border: 1px solid rgba(79, 214, 151, 0.28);
}

.decision-badge--neutral {
  color: #d5e2ff;
  background: rgba(106, 166, 255, 0.14);
  border: 1px solid rgba(106, 166, 255, 0.3);
}

.decision-badge--caution {
  color: #ffd8a8;
  background: rgba(255, 177, 74, 0.14);
  border: 1px solid rgba(255, 177, 74, 0.3);
}

.talent-decision-summary {
  margin: 0;
  max-width: 56ch;
  font-size: 0.98rem;
  line-height: 1.6;
}

.talent-decision-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.talent-decision-metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

.talent-decision-metric-label {
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(215, 223, 240, 0.7);
}

.talent-decision-metric-value {
  font-size: 1rem;
  line-height: 1.35;
}

.talent-decision-next {
  display: grid;
  gap: 10px;
}

.talent-decision-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.talent-decision-signal {
  min-height: 100%;
}

.talent-decision-signal-value {
  font-size: 1.02rem;
  line-height: 1.4;
}

.talent-background-details {
  display: grid;
  gap: 16px;
}

.talent-background-details summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
  list-style: none;
}

.talent-background-details summary::-webkit-details-marker {
  display: none;
}

.talent-detail-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.talent-detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 340px);
  gap: 20px;
  align-items: start;
}

.talent-detail-main,
.talent-detail-rail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.talent-detail-rail {
  position: sticky;
  top: 20px;
}

.talent-ability-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.talent-ability-card {
  min-height: 100%;
}

.talent-ability-card--wide {
  grid-column: 1 / -1;
}

.talent-result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.talent-result-row {
  display: flex;
  min-height: 116px;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

.talent-result-value {
  font-size: clamp(1.3rem, 2vw, 1.8rem);
}

.talent-platform-highlights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.talent-work-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(240px, 0.9fr);
  gap: 18px;
  align-items: start;
}

.talent-work-media,
.talent-work-link-preview {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.talent-work-media {
  cursor: pointer;
}

.talent-work-media-image,
.talent-work-link-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 22px 50px rgba(10, 18, 40, 0.3);
}

.talent-work-preview-note {
  position: absolute;
  right: 16px;
  bottom: 16px;
}

.talent-work-type {
  width: fit-content;
}

.talent-work-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.talent-work-rail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.talent-work-thumb {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 14px;
  text-align: left;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: inherit;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.talent-work-thumb:hover {
  transform: translateY(-1px);
  border-color: rgba(106, 166, 255, 0.35);
}

.talent-work-thumb.is-active {
  border-color: rgba(106, 166, 255, 0.8);
  background: rgba(106, 166, 255, 0.12);
}

.talent-review-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.talent-review-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.talent-review-score {
  font-size: 1.05rem;
}

.talent-review-outcome {
  margin: 0;
  font-weight: 700;
}

.talent-timeline {
  display: grid;
  gap: 12px;
}

.talent-timeline-item {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.talent-summary-list {
  display: grid;
  gap: 10px;
}

.talent-summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.talent-summary-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.talent-action-card {
  border: 1px solid rgba(106, 166, 255, 0.22);
  background: linear-gradient(180deg, rgba(106, 166, 255, 0.12), rgba(255, 255, 255, 0.03));
}

.talent-media-modal {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(3, 8, 20, 0.72);
  backdrop-filter: blur(10px);
}

.talent-media-card {
  width: min(980px, 100%);
  max-height: min(90vh, 920px);
  overflow: auto;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(10, 14, 28, 0.96);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.42);
}

.talent-media-frame {
  width: 100%;
  max-height: 68vh;
  object-fit: contain;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.02);
}

.talent-media-video {
  background: #000;
}

@media (max-width: 1180px) {
  .talent-decision-hero-top,
  .talent-detail-layout,
  .talent-work-stage {
    grid-template-columns: 1fr;
  }

  .talent-detail-rail {
    position: static;
  }
}

@media (max-width: 860px) {
  .talent-detail-hero,
  .talent-media-card {
    padding: 20px;
  }

  .talent-decision-strip,
  .talent-decision-grid,
  .talent-ability-grid,
  .talent-result-grid,
  .talent-platform-highlights {
    grid-template-columns: 1fr;
  }

  .talent-work-actions,
  .talent-detail-hero-actions,
  .talent-background-details summary {
    flex-direction: column;
  }

  .talent-summary-row {
    flex-direction: column;
  }

  .talent-decision-panel {
    padding: 18px;
  }
}
</style>
