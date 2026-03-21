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
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue';
import MobileDock from './components/MobileDock.vue';
</script>
