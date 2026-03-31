<template>
  <section class="mobile-stepper-header">
    <div class="mobile-stepper-copy">
      <span class="mobile-stepper-badge">第 {{ current }} / {{ total }} 步</span>
      <h2>{{ title }}</h2>
      <p v-if="caption">{{ caption }}</p>
    </div>

    <div class="mobile-stepper-progress">
      <span class="mobile-stepper-progress-track">
        <span class="mobile-stepper-progress-fill" :style="{ width: `${progress}%` }"></span>
      </span>
      <div v-if="steps.length" class="mobile-stepper-tags">
        <span
          v-for="(item, index) in steps"
          :key="`${item}-${index}`"
          class="mobile-stepper-tag"
          :class="{ 'is-active': index + 1 === current, 'is-complete': index + 1 < current }"
        >
          {{ item }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  current: {
    type: Number,
    default: 1
  },
  total: {
    type: Number,
    default: 1
  },
  title: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    default: ''
  },
  steps: {
    type: Array,
    default: () => []
  }
});

const progress = computed(() => {
  if (props.total <= 1) {
    return 100;
  }
  return Math.min(100, Math.max(0, ((props.current - 1) / (props.total - 1)) * 100));
});
</script>

<style scoped>
.mobile-stepper-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(120, 190, 255, 0.16);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(10, 20, 38, 0.94), rgba(14, 28, 52, 0.96)),
    radial-gradient(circle at top left, rgba(57, 196, 255, 0.12), transparent 34%);
  box-shadow: 0 18px 38px rgba(2, 8, 20, 0.36);
}

.mobile-stepper-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  width: fit-content;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.78);
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.mobile-stepper-copy h2 {
  margin: 10px 0 0;
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: 28px;
  line-height: 1.12;
  letter-spacing: -0.03em;
}

.mobile-stepper-copy p {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 14px;
  line-height: 1.55;
}

.mobile-stepper-progress {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-stepper-progress-track {
  position: relative;
  display: block;
  height: 8px;
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.86);
  overflow: hidden;
}

.mobile-stepper-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent-deep), var(--accent));
}

.mobile-stepper-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mobile-stepper-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.7);
  color: var(--text-soft);
  font-size: 12px;
}

.mobile-stepper-tag.is-active {
  background: rgba(57, 196, 255, 0.14);
  color: var(--text-strong);
}

.mobile-stepper-tag.is-complete {
  background: rgba(40, 211, 155, 0.14);
  color: #dbfff4;
}
</style>
