<template>
  <section v-if="page" class="page-stack talent-detail-page">
    <article class="glass-panel talent-detail-hero stack-md">
      <div class="talent-detail-hero-head">
        <div class="talent-detail-identity">
          <div class="talent-avatar talent-detail-avatar">
            <img v-if="page.avatar" :src="page.avatar" :alt="`${page.name} 头像`" />
            <span v-else>{{ avatarMonogram }}</span>
          </div>

          <div class="stack-xs talent-detail-title-block">
            <span class="eyebrow">合作对象</span>
            <h1>{{ page.name }}</h1>
            <p class="talent-detail-role">{{ page.role }}</p>
          </div>
        </div>

        <span class="soft-pill talent-detail-location">
          {{ page.location || '支持远程协作' }}
        </span>
      </div>

      <article class="talent-detail-decision stack-sm">
        <span class="eyebrow">单焦点结论</span>
        <h2>{{ decisionTitle }}</h2>
        <p class="muted">{{ decisionBody }}</p>
      </article>

      <div class="talent-detail-actions">
        <router-link class="button-primary" :to="conversationRoute">
          {{ conversationLabel }}
        </router-link>
        <router-link class="button-secondary" :to="backToMarket">
          {{ backLabel }}
        </router-link>
      </div>

      <div class="talent-detail-compact-meta">
        <div class="tag-row talent-detail-signals">
          <span v-for="signal in heroSignals" :key="signal" class="soft-pill">{{ signal }}</span>
        </div>

        <div v-if="heroTags.length" class="tag-row talent-detail-tags">
          <span v-for="tag in heroTags" :key="tag" class="tag-pill">{{ tag }}</span>
        </div>
      </div>
    </article>

    <article class="glass-panel stack-md talent-detail-evidence">
      <div class="panel-header">
        <div>
          <span class="eyebrow">必要依据</span>
          <h3>只保留会影响判断的证据</h3>
        </div>
      </div>

      <div class="talent-detail-evidence-grid">
        <article
          v-for="item in evidenceCards"
          :key="item.label"
          class="mini-card stack-sm talent-detail-evidence-card"
        >
          <span class="eyebrow">{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p class="muted">{{ item.note }}</p>
        </article>
      </div>
    </article>

    <article v-if="activePortfolio" class="glass-panel stack-md talent-detail-portfolio">
      <div class="panel-header">
        <div>
          <span class="eyebrow">作品样本</span>
          <h3>再看一个能直接说明交付能力的样本</h3>
        </div>

        <span class="soft-pill">{{ portfolioCounter }}</span>
      </div>

      <article class="mini-card stack-md talent-detail-portfolio-card">
        <div class="talent-detail-portfolio-media">
          <button
            v-if="activePortfolio.type !== 'LINK'"
            class="talent-detail-preview-button"
            type="button"
            @click="openPreview(activePortfolio)"
          >
            <img
              :src="activePortfolio.cover || activePortfolio.mediaUrl"
              :alt="activePortfolio.title"
              class="talent-detail-preview-image"
            />
            <span class="soft-pill talent-detail-preview-type">{{ portfolioTypeLabel(activePortfolio) }}</span>
            <span class="talent-detail-preview-hint">{{ previewLabel(activePortfolio) }}</span>
          </button>

          <div v-else class="talent-detail-link-preview">
            <img
              v-if="activePortfolio.cover"
              :src="activePortfolio.cover"
              :alt="activePortfolio.title"
              class="talent-detail-link-image"
            />
            <span class="soft-pill">{{ portfolioTypeLabel(activePortfolio) }}</span>
            <h4>{{ activePortfolio.title }}</h4>
            <p class="muted">{{ compactText(activePortfolio.desc, 96) }}</p>
            <button class="button-primary" type="button" @click="openExternalLink(activePortfolio.linkUrl)">
              打开项目链接
            </button>
          </div>
        </div>

        <div class="stack-sm">
          <div class="title-line">
            <div>
              <h4>{{ activePortfolio.title }}</h4>
              <p class="muted">{{ activePortfolio.tag }}</p>
            </div>
          </div>

          <p class="muted">{{ compactText(activePortfolio.desc, 128) }}</p>

          <div class="talent-detail-portfolio-actions">
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
    </article>
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
const backToMarket = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.market
);
const backLabel = computed(() =>
  audience.value === 'talent' ? '返回人才端首页' : '返回人才广场'
);
const platformResults = computed(() => page.value?.platformResults || { summary: '', metrics: [], highlights: [] });
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
      talentSlug: page.value?.slug || ''
    }
  };
});
const conversationLabel = computed(() => '去沟通');
const avatarMonogram = computed(() => {
  const name = page.value?.name || '';
  return name.slice(0, 2) || 'AI';
});
const portfolioItems = computed(() => (Array.isArray(page.value?.portfolio) ? page.value.portfolio : []));
const activePortfolio = computed(() => portfolioItems.value[portfolioIndex.value] || null);
const portfolioCounter = computed(() =>
  portfolioItems.value.length ? `${portfolioIndex.value + 1} / ${portfolioItems.value.length}` : '暂无作品'
);
const servicePreview = computed(() => previewList(page.value?.services, 3));
const heroSignals = computed(() => [
  hasValue(page.value?.score) ? `平台评分 ${page.value.score}` : '平台评分待同步',
  hasValue(page.value?.responseTime) ? `平均响应 ${page.value.responseTime}` : '响应待同步'
]);
const heroTags = computed(() => {
  const tags = previewList(page.value?.headlineTags, 2);
  return tags.length ? tags : servicePreview.value;
});
const decisionTitle = computed(() => {
  if (servicePreview.value.length) {
    return `优先围绕「${servicePreview.value[0]}」聊`;
  }

  if (platformResults.value.summary) {
    return '先看平台结果再沟通';
  }

  return '先看作品，再决定';
});
const decisionBody = computed(() => {
  const signals = heroSignals.value.filter((item) => !item.includes('待同步'));
  const summarySource = platformResults.value.summary || page.value?.intro || page.value?.resumeSummary || '';
  const summary = compactText(summarySource, 64);

  if (signals.length && summary) {
    return `${signals[0]}。${summary}`;
  }

  if (summary) {
    return summary;
  }

  return '先看证据，再决定。';
});
const evidenceCards = computed(() => {
  const serviceText = servicePreview.value.join(' / ') || '暂无明确服务方向';
  const strengthText = previewList(page.value?.strengths, 2).join(' · ') || '暂无平台协作优势';
  const platformText = compactText(platformResults.value.summary || '结果待同步', 44);
  const availabilityText =
    [previewList(page.value?.availability, 2).join(' · '), previewList(page.value?.process, 1).join(' · ')]
      .filter(Boolean)
      .join(' / ') || '档期与协作偏好待补充';

  return [
    {
      label: '适合承接',
      value: serviceText,
      note: '先看切口'
    },
    {
      label: '平台表现',
      value: platformText,
      note: strengthText
    },
    {
      label: '协作方式',
      value: availabilityText,
      note: '先看节奏'
    }
  ];
});

function previewList(items, limit = 3) {
  return (Array.isArray(items) ? items : [])
    .slice(0, limit)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function compactText(value, limit = 72) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).trim()}...`;
}

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
  if (item?.type === 'VIDEO') {
    return '播放演示视频';
  }

  if (item?.type === 'LINK') {
    return '打开链接';
  }

  return '查看大图';
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
  position: relative;
  padding-bottom: 24px;
}

.talent-detail-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(89, 129, 255, 0.2), transparent 30%),
    radial-gradient(circle at top right, rgba(255, 176, 117, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(6, 11, 24, 0.12), rgba(6, 11, 24, 0.38));
  opacity: 0.9;
}

.talent-detail-hero,
.talent-detail-evidence,
.talent-detail-portfolio {
  position: relative;
  z-index: 1;
}

.talent-detail-hero {
  overflow: hidden;
  border-color: rgba(117, 156, 255, 0.18);
  background:
    linear-gradient(180deg, rgba(11, 19, 34, 0.96), rgba(7, 12, 24, 0.92)),
    radial-gradient(circle at top right, rgba(102, 149, 255, 0.18), transparent 42%);
}

.talent-detail-hero::after {
  content: '';
  position: absolute;
  inset: auto -20% -45% auto;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(127, 176, 255, 0.18), transparent 70%);
  pointer-events: none;
}

.talent-detail-hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.talent-detail-identity {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.talent-detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  overflow: hidden;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, rgba(105, 155, 255, 0.38), rgba(18, 30, 51, 0.92));
  border: 1px solid rgba(150, 188, 255, 0.22);
  color: #f7fbff;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  box-shadow: 0 18px 34px rgba(5, 9, 18, 0.22);
}

.talent-detail-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.talent-detail-title-block {
  min-width: 0;
}

.talent-detail-title-block h1,
.talent-detail-decision h2,
.talent-detail-evidence-card strong,
.talent-detail-portfolio-card h4,
.talent-detail-link-preview h4 {
  margin: 0;
}

.talent-detail-title-block h1 {
  font-size: clamp(22px, 3.8vw, 30px);
  line-height: 1.06;
  letter-spacing: -0.05em;
}

.talent-detail-role {
  margin: 0;
  color: rgba(222, 229, 240, 0.72);
  font-size: 12px;
  line-height: 1.4;
}

.talent-detail-location {
  flex: none;
  max-width: 34%;
}

.talent-detail-decision {
  border-color: rgba(132, 168, 255, 0.2);
  background: linear-gradient(180deg, rgba(17, 26, 42, 0.94), rgba(11, 17, 29, 0.94));
}

.talent-detail-decision h2 {
  font-size: 0.98rem;
  line-height: 1.18;
}

.talent-detail-actions {
  display: flex;
  gap: 8px;
}

.talent-detail-actions > * {
  flex: 1 1 0;
  min-width: 0;
}

.talent-detail-signals,
.talent-detail-tags {
  row-gap: 6px;
}

.talent-detail-compact-meta {
  display: grid;
  gap: 6px;
}

.talent-detail-evidence-grid {
  display: grid;
  gap: 8px;
}

.talent-detail-evidence-card strong {
  display: block;
  line-height: 1.35;
  font-size: 14px;
}

.talent-detail-evidence-card p {
  line-height: 1.45;
}

.talent-detail-portfolio-card {
  border-color: rgba(132, 168, 255, 0.16);
}

.talent-detail-portfolio-media {
  display: grid;
  gap: 8px;
}

.talent-detail-preview-button {
  position: relative;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: 20px;
  overflow: hidden;
  background: transparent;
  color: inherit;
  text-align: left;
}

.talent-detail-preview-image,
.talent-detail-link-image {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
}

.talent-detail-preview-button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(180deg, transparent 50%, rgba(3, 8, 17, 0.72));
  pointer-events: none;
}

.talent-detail-preview-type,
.talent-detail-preview-hint {
  position: absolute;
  z-index: 1;
  left: 12px;
}

.talent-detail-preview-type {
  top: 12px;
}

.talent-detail-preview-hint {
  bottom: 12px;
  color: #fff;
  font-size: 0.92rem;
  font-weight: 600;
}

.talent-detail-link-preview {
  display: grid;
  gap: 6px;
}

.talent-detail-portfolio-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.talent-detail-portfolio-actions > * {
  flex: 1 1 calc(50% - 10px);
}

@media (min-width: 640px) {
  .talent-detail-hero {
    padding: 22px;
  }

  .talent-detail-evidence-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .talent-detail-hero-head {
    flex-direction: column;
  }

  .talent-detail-location {
    max-width: 100%;
  }

  .talent-detail-actions {
    flex-direction: column;
  }

  .talent-detail-portfolio-actions {
    flex-direction: column;
  }
}
</style>
