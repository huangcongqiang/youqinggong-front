<template>
  <div class="app-shell">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>
    <div class="ambient ambient-grid"></div>
    <div class="ambient ambient-orbit ambient-orbit-left"></div>
    <div class="ambient ambient-orbit ambient-orbit-right"></div>
    <AppHeader />
    <main class="page-shell">
      <router-view />
    </main>
    <MobileDock />
    <LoginModal
      :open="loginModalOpen"
      :initial-audience="loginAudience"
      :redirect="loginRedirect"
      @close="closeLoginModal"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import LoginModal from './components/LoginModal.vue';
import MobileDock from './components/MobileDock.vue';
import { hydrateAuthSession } from './stores/auth';

const route = useRoute();
const router = useRouter();

const loginModalOpen = computed(() => route.query.login === '1');
const loginAudience = computed(() => (route.query.audience === 'talent' ? 'talent' : 'enterprise'));
const loginRedirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : ''));

function closeLoginModal() {
  const nextQuery = { ...route.query };
  delete nextQuery.login;
  delete nextQuery.redirect;
  router.replace({
    path: route.path,
    query: nextQuery,
    hash: route.hash
  });
}

onMounted(() => {
  hydrateAuthSession();
});
</script>
