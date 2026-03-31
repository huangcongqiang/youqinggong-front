<template>
  <div class="mobile-sticky-action-bar">
    <p v-if="note" class="mobile-sticky-note">{{ note }}</p>
    <div class="mobile-sticky-actions">
      <button
        v-if="secondaryLabel"
        class="mobile-sticky-button mobile-sticky-button-secondary"
        type="button"
        :disabled="secondaryDisabled || secondaryLoading"
        @click="$emit('secondary')"
      >
        {{ secondaryLoading ? secondaryLoadingLabel : secondaryLabel }}
      </button>
      <button
        class="mobile-sticky-button mobile-sticky-button-primary"
        type="button"
        :disabled="primaryDisabled || primaryLoading"
        @click="$emit('primary')"
      >
        {{ primaryLoading ? primaryLoadingLabel : primaryLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  note: {
    type: String,
    default: ''
  },
  primaryLabel: {
    type: String,
    default: '确认'
  },
  secondaryLabel: {
    type: String,
    default: ''
  },
  primaryDisabled: {
    type: Boolean,
    default: false
  },
  secondaryDisabled: {
    type: Boolean,
    default: false
  },
  primaryLoading: {
    type: Boolean,
    default: false
  },
  secondaryLoading: {
    type: Boolean,
    default: false
  },
  primaryLoadingLabel: {
    type: String,
    default: '处理中...'
  },
  secondaryLoadingLabel: {
    type: String,
    default: '处理中...'
  }
});

defineEmits(['primary', 'secondary']);
</script>

<style scoped>
.mobile-sticky-action-bar {
  position: sticky;
  bottom: calc(10px + env(safe-area-inset-bottom));
  z-index: 8;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(24, 36, 50, 0.08);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 253, 248, 0.96), rgba(248, 241, 231, 0.96)),
    radial-gradient(circle at top left, rgba(216, 92, 53, 0.1), transparent 38%);
  box-shadow: 0 20px 44px rgba(77, 58, 39, 0.12);
  backdrop-filter: blur(20px);
}

.mobile-sticky-note {
  margin: 0;
  color: #5c6773;
  font-size: 12px;
  line-height: 1.5;
}

.mobile-sticky-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mobile-sticky-button {
  min-height: 50px;
  border-radius: 18px;
  border: 0;
  font-size: 15px;
  font-weight: 700;
}

.mobile-sticky-button-primary {
  background: linear-gradient(135deg, #1e2c3d, #2b4660);
  color: #fffaf3;
  box-shadow: 0 12px 24px rgba(24, 36, 50, 0.22);
}

.mobile-sticky-button-secondary {
  background: rgba(24, 36, 50, 0.06);
  color: #1a2735;
}

.mobile-sticky-button:disabled {
  opacity: 0.56;
}

@media (max-width: 560px) {
  .mobile-sticky-actions {
    grid-template-columns: 1fr;
  }
}
</style>
