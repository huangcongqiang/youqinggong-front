<template>
  <MobileSheet
    :open="open && Boolean(taskDetail)"
    :title="taskDetail?.company || '任务详情'"
    :subtitle="taskDetail?.title || '当前任务'"
    size="large"
    @close="$emit('close')"
  >
    <div v-if="taskDetail" class="stack-md">
      <div class="tag-row">
        <span class="soft-pill">{{ taskDetail.status || '待处理' }}</span>
        <span class="soft-pill">预算 {{ taskDetail.budget || '未填写预算' }}</span>
        <span class="soft-pill">工期 {{ taskDetail.period || '待确认' }}</span>
      </div>

      <div class="dashboard-detail-section">
        <h4>任务说明</h4>
        <p class="muted">{{ taskDetail.brief || '待补充' }}</p>
      </div>

      <div class="dashboard-detail-dual">
        <div class="mini-card stack-sm">
          <h4>任务与工期</h4>
          <ul class="dashboard-detail-list">
            <li>当前确认工期：{{ periodText }}</li>
            <li>协作安排：{{ scheduleText }}</li>
            <li v-if="calendarHeadline">人才档期：{{ calendarHeadline }}</li>
          </ul>
        </div>
        <div class="mini-card stack-sm">
          <h4>技能标签</h4>
          <div class="tag-row">
            <span v-for="tag in tags" :key="tag" class="soft-pill">{{ tag }}</span>
          </div>
        </div>
        <div class="mini-card stack-sm">
          <h4>核心交付件</h4>
          <div class="tag-row">
            <span v-for="item in deliverables" :key="item" class="soft-pill">{{ item }}</span>
          </div>
        </div>
      </div>

      <div v-if="calendarItems.length" class="dashboard-detail-section">
        <h4>近期档期</h4>
        <div class="tag-row">
          <span v-for="item in calendarItems" :key="item" class="soft-pill">{{ item }}</span>
        </div>
      </div>

      <div v-if="changeReview?.summary" class="dashboard-detail-section">
        <h4>AI 修改建议</h4>
        <div class="tag-row" v-if="changeReview.status || changeReview.recommendedPeriod">
          <span v-if="changeReview.status" class="soft-pill">{{ changeReview.status }}</span>
          <span v-if="changeReview.recommendedPeriod" class="soft-pill">建议工期 {{ changeReview.recommendedPeriod }}</span>
        </div>
        <p v-if="changeReview.requestedChange" class="muted">人才反馈：{{ changeReview.requestedChange }}</p>
        <p v-if="changeReview.updateNote" class="muted">企业补充：{{ changeReview.updateNote }}</p>
        <p class="muted">{{ changeReview.summary }}</p>
        <ul class="dashboard-detail-list" v-if="changeReviewSuggestions.length">
          <li v-for="item in changeReviewSuggestions" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div v-if="modules.length" class="dashboard-detail-section">
        <h4>AI 拆解模块</h4>
        <ul class="dashboard-detail-list">
          <li v-for="module in modules" :key="module.name || module">{{ module.name || module }}</li>
        </ul>
      </div>

      <div v-if="recommendations.length" class="dashboard-detail-section">
        <h4>执行建议</h4>
        <ul class="dashboard-detail-list">
          <li v-for="item in recommendations" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </MobileSheet>
</template>

<script setup>
import MobileSheet from '../mobile/MobileSheet.vue';

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
