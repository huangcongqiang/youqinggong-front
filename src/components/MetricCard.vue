<template>
  <article class="metric-card">
    <span class="eyebrow">{{ label }}</span>
    <div class="metric-value">{{ value }}</div>
    <p>{{ note }}</p>
  </article>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: true
  }
});
</script>
