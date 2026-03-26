<template>
  <section class="page-stack talent-resume-page" v-if="page">
    <article class="glass-panel talent-resume-hero stack-md">
      <div class="talent-avatar-shell">
        <div class="talent-avatar">
          <img v-if="page.avatar" :src="page.avatar" :alt="`${page.name} 头像`" />
          <span v-else>{{ avatarMonogram }}</span>
        </div>

        <div class="stack-sm">
          <span class="eyebrow">人才简历</span>
          <h1 class="talent-resume-name">{{ page.name }}</h1>
          <p class="talent-resume-role">{{ page.role }}</p>
          <p class="muted talent-resume-specialty">{{ page.specialty }}</p>
        </div>
      </div>

      <p class="muted talent-resume-intro">{{ page.intro }}</p>

      <div class="chip-row">
        <span class="tag-pill">{{ page.location }}</span>
        <span class="tag-pill">平台评分 {{ page.score }}</span>
        <span class="tag-pill">完工率 {{ page.completionRate }}</span>
        <span class="tag-pill">平均响应 {{ page.responseTime }}</span>
      </div>

      <div class="tag-row">
        <span v-for="tag in page.headlineTags" :key="tag" class="soft-pill">{{ tag }}</span>
      </div>

      <div class="talent-resume-actions">
        <router-link class="button-secondary" :to="backToMarket">{{ backLabel }}</router-link>
        <router-link class="button-primary" :to="conversationRoute">{{ conversationLabel }}</router-link>
      </div>
    </article>

    <article class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">专业档案</span>
          <h3>擅长方向与合作方式</h3>
        </div>
      </div>

      <p class="muted">{{ page.resumeSummary }}</p>

      <div class="stack-sm">
        <article class="mini-card stack-sm">
          <h4>适合承接的项目</h4>
          <div class="tag-row">
            <span v-for="service in page.services" :key="service" class="soft-pill">{{ service }}</span>
          </div>
        </article>

        <article class="mini-card stack-sm">
          <h4>协作优势</h4>
          <ul class="talent-bullet-list">
            <li v-for="item in page.strengths" :key="item">{{ item }}</li>
          </ul>
        </article>

        <article class="mini-card stack-sm">
          <h4>当前档期与协作偏好</h4>
          <ul class="talent-bullet-list">
            <li v-for="item in page.availability" :key="item">{{ item }}</li>
            <li v-for="item in page.process" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </article>

    <article class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">履历</span>
          <h3>从经历看这位人才更擅长什么</h3>
        </div>
      </div>

      <div class="talent-timeline">
        <article v-for="item in page.experience" :key="`${item.period}-${item.title}`" class="talent-timeline-item stack-sm">
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
    </article>

    <article class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">平台工作结果</span>
          <h3>重点看这位人才在平台上的交付表现</h3>
        </div>
      </div>

      <p class="muted">{{ page.platformResults.summary }}</p>

      <div class="talent-result-list">
        <article
          v-for="item in page.platformResults.metrics"
          :key="item.label"
          class="talent-result-row"
        >
          <div class="stack-xs">
            <h4>{{ item.label }}</h4>
            <p class="muted">{{ item.note }}</p>
          </div>
          <strong class="talent-result-value">{{ item.value }}</strong>
        </article>
      </div>

      <div class="stack-sm">
        <article
          v-for="item in page.platformResults.highlights"
          :key="item.title"
          class="mini-card stack-sm"
        >
          <h4>{{ item.title }}</h4>
          <p class="muted">{{ item.note }}</p>
        </article>
      </div>
    </article>

    <article class="glass-panel stack-md">
      <div class="panel-header talent-work-header">
        <div>
          <span class="eyebrow">作品展示</span>
          <h3>用作品和交付物判断是否匹配</h3>
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
          <span class="eyebrow">合作评价</span>
          <h3>项目结果与评价会持续沉淀到平台画像</h3>
        </div>
      </div>

      <div class="stack-sm">
        <article
          v-for="review in page.reviews"
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
const conversationLabel = computed(() =>
  audience.value === 'talent' ? '查看聊天' : '发起聊天'
);
const avatarMonogram = computed(() => {
  const name = page.value?.name || '';
  return name.slice(0, 2) || 'AI';
});
const portfolioItems = computed(() => page.value?.portfolio || []);
const activePortfolio = computed(() => portfolioItems.value[portfolioIndex.value] || null);
const portfolioCounter = computed(() =>
  portfolioItems.value.length ? `${portfolioIndex.value + 1} / ${portfolioItems.value.length}` : '暂无作品'
);

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
