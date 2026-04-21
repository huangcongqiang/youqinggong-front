<template>
  <teleport to="body">
    <div v-if="visible && normalizedMessage" class="action-error-dialog-backdrop" @click.self="visible = false">
      <article class="action-error-dialog-card stack-md" role="alertdialog" aria-modal="true">
        <div class="panel-header panel-header-top">
          <div class="stack-xs">
            <span class="eyebrow">{{ eyebrow }}</span>
            <h3>{{ title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="visible = false">关闭</button>
        </div>
        <p class="muted">{{ normalizedMessage }}</p>
      </article>
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: '操作需要处理'
  },
  eyebrow: {
    type: String,
    default: '待处理'
  }
});

const visible = ref(false);
const normalizedMessage = computed(() => String(props.message || '').trim());

watch(
  normalizedMessage,
  (value, previous) => {
    if (value && value !== previous) {
      visible.value = true;
    }
    if (!value) {
      visible.value = false;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.action-error-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(8px);
}

.action-error-dialog-card {
  width: min(460px, 100%);
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(220, 38, 38, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(253, 245, 245, 0.98) 100%);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

.action-error-dialog-card h3 {
  margin: 0;
  color: #111827;
}

.action-error-dialog-card .muted {
  color: rgba(71, 85, 105, 0.9);
  line-height: 1.7;
}
</style>
