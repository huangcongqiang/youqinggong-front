<template>
  <section class="mobile-page-scaffold">
    <header class="mobile-page-hero">
      <div class="mobile-page-headline">
        <button v-if="showBack" class="mobile-page-back" type="button" @click="$emit('back')">
          <span aria-hidden="true">‹</span>
          <span>{{ backLabel }}</span>
        </button>
        <span v-if="eyebrow" class="mobile-page-eyebrow">{{ eyebrow }}</span>
        <div class="mobile-page-copy">
          <h1>{{ title }}</h1>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div v-if="$slots.meta || $slots.actions" class="mobile-page-toolbar">
        <div v-if="$slots.meta" class="mobile-page-meta">
          <slot name="meta" />
        </div>
        <div v-if="$slots.actions" class="mobile-page-actions">
          <slot name="actions" />
        </div>
      </div>
    </header>

    <div class="mobile-page-body">
      <slot />
    </div>

    <slot name="sticky" />
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  eyebrow: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  backLabel: {
    type: String,
    default: '返回'
  }
});

defineEmits(['back']);
</script>

<style scoped>
.mobile-page-scaffold {
  --scaffold-paper: rgba(10, 20, 38, 0.92);
  --scaffold-paper-strong: rgba(14, 28, 52, 0.96);
  --scaffold-ink: var(--text-strong);
  --scaffold-muted: var(--text-soft);
  --scaffold-line: rgba(120, 190, 255, 0.16);
  --scaffold-accent: var(--accent);
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100%;
}

.mobile-page-hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(120, 190, 255, 0.12);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(9, 17, 31, 0.92), rgba(12, 22, 40, 0.96)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.05), transparent 42%);
  box-shadow: 0 10px 20px rgba(2, 8, 20, 0.16);
  backdrop-filter: blur(10px);
}

.mobile-page-headline {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-page-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  min-height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.72);
  color: var(--scaffold-ink);
  font-size: 12px;
}

.mobile-page-back span[aria-hidden='true'] {
  font-size: 20px;
  line-height: 1;
}

.mobile-page-eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(57, 196, 255, 0.1);
  color: var(--scaffold-accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.mobile-page-copy h1 {
  margin: 0;
  color: var(--scaffold-ink);
  font-family: var(--font-display);
  font-size: clamp(21px, 6vw, 26px);
  line-height: 1.16;
  letter-spacing: -0.04em;
}

.mobile-page-copy p {
  margin: 4px 0 0;
  color: var(--scaffold-muted);
  font-size: 12px;
  line-height: 1.45;
}

.mobile-page-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
}

.mobile-page-meta,
.mobile-page-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.mobile-page-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom));
}

@media (max-width: 640px) {
  .mobile-page-hero {
    margin: 0 -2px;
    padding: 10px 11px;
    border-radius: 14px;
  }
}
</style>
