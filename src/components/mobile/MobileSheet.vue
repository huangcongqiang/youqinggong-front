<template>
  <div v-if="open" class="mobile-sheet-shell" @click.self="closeSheet">
    <section class="mobile-sheet" :class="sheetClass">
      <header class="mobile-sheet-header">
        <div class="mobile-sheet-handle"></div>
        <div class="mobile-sheet-copy">
          <h3>{{ title }}</h3>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
        <button v-if="dismissible" class="mobile-sheet-close" type="button" @click="closeSheet">
          关闭
        </button>
      </header>

      <div class="mobile-sheet-body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="mobile-sheet-footer">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'medium'
  }
});

const emit = defineEmits(['close']);

const sheetClass = computed(() => `mobile-sheet-${props.size}`);

function closeSheet() {
  if (!props.dismissible) {
    return;
  }
  emit('close');
}
</script>

<style scoped>
.mobile-sheet-shell {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 0 env(safe-area-inset-bottom);
  background: rgba(3, 8, 16, 0.7);
  backdrop-filter: blur(14px);
}

.mobile-sheet {
  width: min(100%, 720px);
  max-height: min(88vh, 920px);
  display: flex;
  flex-direction: column;
  border-radius: 28px 28px 0 0;
  background:
    linear-gradient(180deg, rgba(10, 20, 38, 0.98), rgba(14, 28, 52, 0.98)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.12), transparent 34%);
  border: 1px solid rgba(120, 190, 255, 0.16);
  box-shadow: 0 -18px 48px rgba(2, 8, 20, 0.58);
}

.mobile-sheet-small {
  min-height: 280px;
}

.mobile-sheet-medium {
  min-height: 420px;
}

.mobile-sheet-large {
  min-height: 70vh;
}

.mobile-sheet-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 18px 0;
}

.mobile-sheet-handle {
  width: 46px;
  height: 4px;
  margin: 0 auto;
  border-radius: 999px;
  background: rgba(120, 190, 255, 0.24);
}

.mobile-sheet-copy h3 {
  margin: 0;
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: 24px;
}

.mobile-sheet-copy p {
  margin: 6px 0 0;
  color: var(--text-soft);
  font-size: 14px;
  line-height: 1.55;
}

.mobile-sheet-close {
  align-self: flex-end;
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.82);
  color: var(--text-strong);
  border: 1px solid rgba(120, 190, 255, 0.14);
}

.mobile-sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 18px;
}

.mobile-sheet-footer {
  padding: 0 18px calc(18px + env(safe-area-inset-bottom));
}
</style>
