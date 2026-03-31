<template>
  <div class="app-shell">
    <div class="app-shell-wash app-shell-wash-left"></div>
    <div class="app-shell-wash app-shell-wash-right"></div>
    <div class="app-shell-grain"></div>
    <AppHeader v-if="showHeader" />
    <main class="page-shell" :class="{ 'is-auth-layout': isAuthLayout }">
      <router-view />
    </main>
    <MobileDock v-if="showDock" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import MobileDock from './components/MobileDock.vue';
import { hydrateAuthSession } from './stores/auth';

const route = useRoute();
const isAuthLayout = computed(() => route.meta?.layout === 'auth');
const showHeader = computed(() => !route.meta?.hideHeader);
const showDock = computed(() => !route.meta?.hideDock);

onMounted(() => {
  hydrateAuthSession();
});
</script>

<style scoped>
.page-shell.is-auth-layout {
  max-width: 1120px;
  padding-top: calc(18px + env(safe-area-inset-top));
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
}

@media (max-width: 640px) {
  .page-shell.is-auth-layout {
    padding-left: 14px;
    padding-right: 14px;
  }
}
</style>
