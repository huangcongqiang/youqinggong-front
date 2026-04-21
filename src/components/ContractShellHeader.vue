<template>
  <section class="contract-shell-header">
    <header class="contract-shell-header__hero">
      <div class="contract-shell-header__copy">
        <p class="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p class="contract-shell-header__lead">{{ lead }}</p>
      </div>

      <div v-if="visiblePills.length" class="contract-shell-header__pills">
        <span
          v-for="pill in visiblePills"
          :key="pill"
          class="contract-shell-header__pill"
        >
          {{ pill }}
        </span>
      </div>

      <p v-if="supportCopy" class="contract-shell-header__support">
        {{ supportCopy }}
      </p>
    </header>

    <nav v-if="visibleTabs.length" class="contract-shell-header__tabs" aria-label="Contract navigation">
      <template v-for="tab in visibleTabs" :key="tab.label">
        <span
          v-if="tab.current"
          class="contract-shell-header__tab is-active"
          aria-current="page"
        >
          {{ tab.label }}
        </span>
        <router-link
          v-else
          class="contract-shell-header__tab"
          :to="tab.to"
        >
          {{ tab.label }}
        </router-link>
      </template>
    </nav>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  lead: {
    type: String,
    default: '',
  },
  supportCopy: {
    type: String,
    default: '',
  },
  pills: {
    type: Array,
    default: () => [],
  },
  tabs: {
    type: Array,
    default: () => [],
  },
})

const visiblePills = computed(() => props.pills.map((item) => String(item || '').trim()).filter(Boolean))
const visibleTabs = computed(() => props.tabs.filter((item) => item && item.label && (item.current || item.to)))
</script>

<style scoped>
.contract-shell-header {
  display: grid;
  gap: 16px;
}

.contract-shell-header__hero {
  display: grid;
  gap: 18px;
  padding: 26px 28px;
  border-radius: 28px;
  border: 1px solid rgba(27, 41, 20, 0.08);
  background:
    radial-gradient(circle at top right, rgba(118, 190, 82, 0.16), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 244, 0.94));
  box-shadow: 0 18px 44px rgba(18, 32, 12, 0.06);
}

.contract-shell-header__copy {
  display: grid;
  gap: 8px;
}

.contract-shell-header__copy h1 {
  margin: 0;
  color: #1d2618;
  font-size: clamp(28px, 3.4vw, 40px);
  line-height: 1.1;
}

.contract-shell-header__lead {
  margin: 0;
  color: #465440;
  font-size: 15px;
  line-height: 1.75;
}

.contract-shell-header__support {
  margin: 0;
  color: #607059;
  font-size: 14px;
  line-height: 1.7;
}

.contract-shell-header__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.contract-shell-header__pill {
  display: inline-flex;
  align-items: center;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid rgba(45, 66, 34, 0.1);
  background: rgba(255, 255, 255, 0.86);
  color: #2f4126;
  font-size: 13px;
  font-weight: 700;
}

.contract-shell-header__tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  padding: 12px;
  border-radius: 22px;
  border: 1px solid rgba(27, 41, 20, 0.08);
  background: rgba(249, 251, 247, 0.94);
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x proximity;
}

.contract-shell-header__tabs::-webkit-scrollbar {
  display: none;
}

.contract-shell-header__tab {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  color: #4d5d45;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  scroll-snap-align: start;
  transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.contract-shell-header__tab:hover {
  background: rgba(76, 148, 39, 0.08);
  color: #213019;
}

.contract-shell-header__tab.is-active {
  background: #1f7a1f;
  color: #fff;
}

@media (max-width: 820px) {
  .contract-shell-header__hero {
    padding: 22px 18px;
    border-radius: 22px;
  }

  .contract-shell-header__tabs {
    padding: 10px;
    border-radius: 18px;
  }
}
</style>
