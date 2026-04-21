<template>
  <div v-if="open && taskDetail" class="dashboard-detail-modal" @click.self="$emit('close')">
    <article class="dashboard-detail-card stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">{{ taskDetail.company || '合同详情' }}</span>
          <h3>{{ taskDetail.title }}</h3>
        </div>
        <button class="button-secondary" type="button" @click="$emit('close')">Close</button>
      </div>

      <div class="tag-row">
        <span class="soft-pill">{{ taskDetail.status || '待处理' }}</span>
        <span class="soft-pill">Budget {{ taskDetail.budget || 'Not set' }}</span>
        <span class="soft-pill">时间安排 {{ taskDetail.period || '待处理' }}</span>
      </div>

      <div class="dashboard-detail-section">
        <h4>合同摘要</h4>
        <p class="muted">{{ taskDetail.brief || 'The contract summary has not synced yet.' }}</p>
      </div>

      <div class="dashboard-detail-dual">
        <div class="mini-card stack-sm">
          <h4>Scope & timeline</h4>
          <ul class="dashboard-detail-list">
            <li>当前时间安排： {{ periodText }}</li>
            <li>Working arrangement：{{ scheduleText }}</li>
            <li v-if="calendarHeadline">Freelancer availability: {{ calendarHeadline }}</li>
          </ul>
        </div>
        <div class="mini-card stack-sm">
          <h4>Skills</h4>
          <div class="tag-row">
            <span v-for="tag in tags" :key="tag" class="soft-pill">{{ tag }}</span>
          </div>
        </div>
        <div class="mini-card stack-sm">
          <h4>Key deliverables</h4>
          <div class="tag-row">
            <span v-for="item in deliverables" :key="item" class="soft-pill">{{ item }}</span>
          </div>
        </div>
      </div>

      <div v-if="calendarItems.length" class="dashboard-detail-section">
        <h4>Upcoming availability</h4>
        <div class="tag-row">
          <span v-for="item in calendarItems" :key="item" class="soft-pill">{{ item }}</span>
        </div>
      </div>

      <div v-if="changeReview?.summary" class="dashboard-detail-section">
        <h4>Assistant change guidance</h4>
        <div class="tag-row" v-if="changeReview.status || changeReview.recommendedPeriod">
          <span v-if="changeReview.status" class="soft-pill">{{ changeReview.status }}</span>
          <span v-if="changeReview.recommendedPeriod" class="soft-pill">建议时间安排 {{ changeReview.recommendedPeriod }}</span>
        </div>
        <p v-if="changeReview.requestedChange" class="muted">人才备注： {{ changeReview.requestedChange }}</p>
        <p v-if="changeReview.updateNote" class="muted">企业备注： {{ changeReview.updateNote }}</p>
        <p class="muted">{{ changeReview.summary }}</p>
        <ul class="dashboard-detail-list" v-if="changeReviewSuggestions.length">
          <li v-for="item in changeReviewSuggestions" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div v-if="modules.length" class="dashboard-detail-section">
        <h4>Assistant breakdown</h4>
        <ul class="dashboard-detail-list">
          <li v-for="module in modules" :key="module.name || module">{{ module.name || module }}</li>
        </ul>
      </div>

      <div v-if="recommendations.length" class="dashboard-detail-section">
        <h4>Execution guidance</h4>
        <ul class="dashboard-detail-list">
          <li v-for="item in recommendations" :key="item">{{ item }}</li>
        </ul>
      </div>
    </article>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  taskDetail: { type: Object, default: null },
  periodText: { type: String, default: '' },
  scheduleText: { type: String, default: '' },
  calendarHeadline: { type: String, default: '' },
  calendarItems: { type: Array, default: () => [] },
  changeReview: { type: Object, default: null },
  changeReviewSuggestions: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  deliverables: { type: Array, default: () => [] },
  modules: { type: Array, default: () => [] },
  recommendations: { type: Array, default: () => [] }
});

defineEmits(['close']);
</script>
