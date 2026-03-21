<template>
  <div class="section-title">
    <div>
      <span class="eyebrow">{{ eyebrow }}</span>
      <component :is="tag">{{ title }}</component>
    </div>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tag: {
    type: String,
    default: 'h2'
  }
});
</script>
