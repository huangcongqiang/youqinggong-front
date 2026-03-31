<template>
  <component
    :is="tagName"
    class="unified-list-card"
    :class="{ 'is-clickable': clickable }"
    :type="tagName === 'button' ? 'button' : undefined"
    @click="handleSelect"
  >
    <div class="unified-list-card-top">
      <div class="unified-list-card-copy">
        <p v-if="eyebrow" class="unified-list-card-eyebrow">{{ eyebrow }}</p>
        <h3>{{ title }}</h3>
        <p v-if="subtitle" class="unified-list-card-subtitle">{{ subtitle }}</p>
      </div>
      <div class="unified-list-card-side">
        <span v-if="status" class="unified-list-card-status" :class="`is-${statusTone}`">{{ status }}</span>
        <slot name="aside" />
      </div>
    </div>

    <div v-if="$slots.default" class="unified-list-card-body">
      <slot />
    </div>

    <div v-if="meta || tags.length || $slots.footer" class="unified-list-card-footer">
      <p v-if="meta" class="unified-list-card-meta">{{ meta }}</p>
      <div v-if="tags.length" class="unified-list-card-tags">
        <span v-for="item in tags" :key="item" class="unified-list-card-tag">{{ item }}</span>
      </div>
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  eyebrow: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  meta: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  statusTone: {
    type: String,
    default: 'neutral'
  },
  tags: {
    type: Array,
    default: () => []
  },
  clickable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select']);

const tagName = computed(() => (props.clickable ? 'button' : 'article'));

function handleSelect() {
  if (!props.clickable) {
    return;
  }
  emit('select');
}
</script>

<style scoped>
.unified-list-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(10, 19, 35, 0.94), rgba(13, 24, 44, 0.96)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.05), transparent 36%);
  box-shadow: 0 10px 18px rgba(2, 8, 20, 0.18);
  text-align: left;
}

.unified-list-card.is-clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.unified-list-card.is-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(2, 8, 20, 0.42);
}

.unified-list-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.unified-list-card-copy h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 16px;
  line-height: 1.25;
}

.unified-list-card-eyebrow,
.unified-list-card-subtitle,
.unified-list-card-meta {
  margin: 0;
  color: var(--text-soft);
}

.unified-list-card-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.unified-list-card-subtitle {
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.4;
}

.unified-list-card-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.unified-list-card-status,
.unified-list-card-tag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.unified-list-card-status.is-neutral {
  background: rgba(8, 15, 28, 0.76);
  color: var(--text-soft);
}

.unified-list-card-status.is-warning {
  background: rgba(246, 196, 83, 0.14);
  color: #fff1bf;
}

.unified-list-card-status.is-success {
  background: rgba(40, 211, 155, 0.14);
  color: #dbfff4;
}

.unified-list-card-status.is-info {
  background: rgba(57, 196, 255, 0.14);
  color: #def6ff;
}

.unified-list-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unified-list-card-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.unified-list-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.unified-list-card-tag {
  background: rgba(8, 15, 28, 0.72);
  color: var(--text-soft);
  font-weight: 600;
}
</style>
