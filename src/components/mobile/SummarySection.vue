<template>
  <section class="summary-section" :class="`is-${tone}`">
    <div class="summary-section-copy">
      <p v-if="eyebrow" class="summary-section-eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p v-if="description" class="summary-section-description">{{ description }}</p>
    </div>

    <div v-if="highlightLabel || highlightValue || $slots.aside" class="summary-section-side">
      <div v-if="highlightLabel || highlightValue" class="summary-section-highlight">
        <span v-if="highlightLabel">{{ highlightLabel }}</span>
        <strong v-if="highlightValue">{{ highlightValue }}</strong>
      </div>
      <slot name="aside" />
    </div>

    <div v-if="$slots.default" class="summary-section-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  highlightLabel: {
    type: String,
    default: ''
  },
  highlightValue: {
    type: String,
    default: ''
  },
  tone: {
    type: String,
    default: 'cool'
  }
});
</script>

<style scoped>
.summary-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(120, 190, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(10, 19, 35, 0.94), rgba(13, 24, 44, 0.96)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.06), transparent 38%);
  box-shadow: 0 10px 20px rgba(2, 8, 20, 0.18);
}

.summary-section.is-warm {
  border-color: rgba(246, 196, 83, 0.18);
  box-shadow: 0 18px 36px rgba(2, 8, 20, 0.32), inset 0 0 0 1px rgba(246, 196, 83, 0.04);
}

.summary-section.is-cool {
  border-color: rgba(57, 196, 255, 0.18);
  box-shadow: 0 18px 36px rgba(2, 8, 20, 0.32), inset 0 0 0 1px rgba(57, 196, 255, 0.04);
}

.summary-section-copy h2 {
  margin: 0;
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: 19px;
  line-height: 1.25;
  letter-spacing: -0.03em;
}

.summary-section-eyebrow,
.summary-section-description,
.summary-section-highlight span {
  margin: 0;
  color: var(--text-soft);
}

.summary-section-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-section-description {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.45;
}

.summary-section-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.summary-section-highlight {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.summary-section-highlight strong {
  color: var(--text-strong);
  font-size: 20px;
  line-height: 1;
}

.summary-section-body {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 640px) {
  .summary-section {
    grid-template-columns: 1fr;
  }

  .summary-section-side,
  .summary-section-highlight {
    align-items: flex-start;
  }
}
</style>
