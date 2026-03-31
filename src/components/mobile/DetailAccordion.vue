<template>
  <section class="detail-accordion">
    <article
      v-for="item in normalizedItems"
      :key="item.key"
      class="detail-accordion-item"
      :class="{ 'is-open': openKeys.includes(item.key) }"
    >
      <button class="detail-accordion-trigger" type="button" @click="toggle(item.key)">
        <div class="detail-accordion-copy">
          <p v-if="item.badge" class="detail-accordion-badge">{{ item.badge }}</p>
          <h3>{{ item.title }}</h3>
          <p v-if="item.summary">{{ item.summary }}</p>
        </div>
        <span class="detail-accordion-icon">{{ openKeys.includes(item.key) ? '−' : '+' }}</span>
      </button>

      <div v-if="openKeys.includes(item.key)" class="detail-accordion-panel">
        <p v-if="item.body" class="detail-accordion-body">{{ item.body }}</p>
        <ul v-if="item.list.length" class="detail-accordion-list">
          <li v-for="entry in item.list" :key="entry">{{ entry }}</li>
        </ul>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  defaultOpenKeys: {
    type: Array,
    default: () => []
  }
});

const openKeys = ref([...props.defaultOpenKeys]);

const normalizedItems = computed(() =>
  (Array.isArray(props.items) ? props.items : []).map((item, index) => ({
    key: item?.key || `detail-${index}`,
    title: item?.title || '',
    summary: item?.summary || '',
    badge: item?.badge || '',
    body: item?.body || '',
    list: Array.isArray(item?.list) ? item.list : []
  }))
);

function toggle(key) {
  if (openKeys.value.includes(key)) {
    openKeys.value = openKeys.value.filter((item) => item !== key);
    return;
  }
  openKeys.value = [...openKeys.value, key];
}
</script>

<style scoped>
.detail-accordion {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-accordion-item {
  border: 1px solid rgba(120, 190, 255, 0.16);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(10, 20, 38, 0.94), rgba(14, 28, 52, 0.96));
  overflow: hidden;
}

.detail-accordion-trigger {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border: 0;
  background: transparent;
  text-align: left;
}

.detail-accordion-copy h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 17px;
}

.detail-accordion-copy p {
  margin: 7px 0 0;
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.55;
}

.detail-accordion-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-accordion-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.76);
  color: var(--text-strong);
  font-size: 18px;
}

.detail-accordion-panel {
  padding: 0 16px 16px;
}

.detail-accordion-body {
  margin: 0;
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.65;
}

.detail-accordion-list {
  margin: 12px 0 0;
  padding-left: 18px;
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.65;
}
</style>
