<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card">
      <SectionTitle
        eyebrow="验收评分"
        title="工作完成之后，把结果、反馈和信用沉淀下来。"
        :description="`${page.summary.title} 已在 ${page.summary.acceptedAt} 进入验收阶段，当前状态为 ${page.summary.status}。这一页承接任务交付后的最后一步：验收确认、评分和评语。`"
        tag="h1"
      />
      <div class="chip-row">
        <span class="tag-pill">验收确认</span>
        <span class="tag-pill">互评沉淀</span>
        <span class="tag-pill">信用画像</span>
      </div>
    </article>

    <section class="metric-grid">
      <article v-for="item in page.metrics" :key="item.label" class="metric-card">
        <p class="eyebrow">{{ item.label }}</p>
        <div class="metric-value">{{ item.value }}</div>
        <p>{{ item.note }}</p>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="验收确认"
          title="先确认交付完成"
          description="通常由 B 端完成验收确认，也可以在后续做多角色验收流。"
        />

        <div class="timeline">
          <div v-for="item in page.timeline" :key="item.title" class="timeline-item">
            <div class="progress-head">
              <div>
                <h4>{{ item.title }}</h4>
                <p class="muted">{{ item.time }} · {{ item.status }}</p>
              </div>
            </div>
            <p class="muted">{{ item.note }}</p>
          </div>
        </div>

        <form class="form-grid" @submit.prevent="handleAcceptance">
          <div class="form-field">
            <label for="accepter-user-id">验收人 ID</label>
            <input id="accepter-user-id" v-model="acceptanceForm.accepterUserId" class="text-input" />
          </div>
          <div class="form-field full">
            <label for="acceptance-note">验收说明</label>
            <textarea id="acceptance-note" v-model="acceptanceForm.acceptanceNote" class="textarea"></textarea>
          </div>
          <div class="form-field full">
            <div class="toolbar">
              <button class="button-primary" type="submit">确认验收</button>
              <router-link class="button-secondary" :to="workspaceRoute">返回协作空间</router-link>
            </div>
          </div>
        </form>

        <div v-if="acceptanceResult" class="result-card">
          <span class="eyebrow">验收结果</span>
          <h3>{{ acceptanceResult.status }}</h3>
          <p class="muted">{{ acceptanceResult.nextStep }}</p>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="评分"
          title="把交付感受沉淀成平台信用"
          description="评分会参与后续推荐策略，同时也帮助平台识别高质量合作关系。"
        />

        <div class="stack-sm">
          <div v-for="item in page.reviewSummary" :key="item" class="list-row list-row-tight">
            <p class="muted">{{ item }}</p>
          </div>
        </div>

        <form class="form-grid" @submit.prevent="handleReview">
          <div class="form-field">
            <label for="reviewer-user-id">评分人 ID</label>
            <input id="reviewer-user-id" v-model="reviewForm.reviewerUserId" class="text-input" />
          </div>
          <div class="form-field">
            <label for="reviewee-user-id">被评人 ID</label>
            <input id="reviewee-user-id" v-model="reviewForm.revieweeUserId" class="text-input" />
          </div>
          <div class="form-field">
            <label for="rating">评分</label>
            <select id="rating" v-model="reviewForm.rating" class="select-input">
              <option value="5">5 分</option>
              <option value="4">4 分</option>
              <option value="3">3 分</option>
              <option value="2">2 分</option>
              <option value="1">1 分</option>
            </select>
          </div>
          <div class="form-field full">
            <label for="review-content">评语</label>
            <textarea id="review-content" v-model="reviewForm.reviewContent" class="textarea"></textarea>
          </div>
          <div class="form-field full">
            <div class="toolbar">
              <button class="button-primary" type="submit">提交评分</button>
            </div>
          </div>
        </form>

        <div v-if="reviewResult" class="result-card">
          <span class="eyebrow">评分结果</span>
          <h3>{{ reviewResult.status }}</h3>
          <p class="muted">{{ reviewResult.nextStep }}</p>
          <div class="tag-row">
            <span class="soft-pill">评分：{{ reviewResult.rating }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="评分历史"
          title="把这次合作的真实反馈保留下来。"
          description="历史评分不是为了装饰，而是为了让后续匹配和合作判断更有依据。"
        />

        <div class="stack-sm">
          <div v-for="item in page.reviewHistory" :key="`${item.reviewer}-${item.time}`" class="list-card stack-sm">
            <div class="panel-header">
              <div>
                <h4>{{ item.reviewer }}</h4>
                <p class="muted">{{ item.role }} · {{ item.time }}</p>
              </div>
              <span class="score-pill">{{ item.rating }}</span>
            </div>
            <p class="muted">{{ item.content }}</p>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="信用影响"
          title="验收结束后，平台会怎么用这些结果。"
          description="这部分决定后续推荐、风控和合作体验，所以需要让用户能看懂结果流向。"
        />

        <div class="stack-sm">
          <div v-for="item in page.creditImpact" :key="item.title" class="mini-card stack-sm">
            <h4>{{ item.title }}</h4>
            <p class="muted">{{ item.note }}</p>
          </div>
        </div>

        <div class="result-card">
          <span class="eyebrow">下一步</span>
          <h3>{{ page.summary.status }}</h3>
          <p class="muted">{{ page.summary.nextStep }}</p>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { getTaskClosureData, submitAcceptance, submitReview } from '../services/api';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const page = ref(null);
const audience = computed(() => resolveAudience(route));
const workspaceRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace
);

const acceptanceForm = ref({
  accepterUserId: '1',
  acceptanceNote: '验收完成，首版已满足展示和继续开发需要。'
});

const reviewForm = ref({
  reviewerUserId: '1',
  revieweeUserId: '2',
  rating: '5',
  reviewContent: '沟通清晰，交付节奏稳定，文档和实现都比较完整。'
});

const acceptanceResult = ref(null);
const reviewResult = ref(null);

async function handleAcceptance() {
  acceptanceResult.value = await submitAcceptance('task-001', acceptanceForm.value);
}

async function handleReview() {
  reviewResult.value = await submitReview('task-001', reviewForm.value);
}

onMounted(async () => {
  page.value = await getTaskClosureData('task-001');
});
</script>
