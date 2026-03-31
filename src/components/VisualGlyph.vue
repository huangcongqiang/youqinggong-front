<template>
  <svg
    class="visual-glyph"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <template v-if="name === 'tower'">
      <path d="M7 20V9l5-4 5 4v11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 20v-4h4v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 9h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'talent'">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8" />
      <path d="M5.8 19.2c1.8-3.3 4-4.8 6.2-4.8s4.4 1.5 6.2 4.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M4.5 12.5h2.4M17.1 12.5h2.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'brief'">
      <rect x="4.5" y="6" width="15" height="12.5" rx="2.6" stroke="currentColor" stroke-width="1.8" />
      <path d="M9 6.2V4.8h6v1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8 11.3h8M8 14.8h5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'spark'">
      <path d="M12 3.8l1.6 4.1 4.1 1.6-4.1 1.6-1.6 4.1-1.6-4.1-4.1-1.6 4.1-1.6L12 3.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M18.2 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'network'">
      <circle cx="6.5" cy="8" r="2.2" stroke="currentColor" stroke-width="1.8" />
      <circle cx="17.5" cy="7" r="2.2" stroke="currentColor" stroke-width="1.8" />
      <circle cx="12" cy="17" r="2.2" stroke="currentColor" stroke-width="1.8" />
      <path d="M8.5 8.6 10.5 14M15.6 8.7 13.4 14M8.8 8.1h6.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'layers'">
      <path d="M12 5 19 9l-7 4-7-4 7-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M5.5 12.6 12 16l6.5-3.4M5.5 16.2 12 19.5l6.5-3.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'medal'">
      <circle cx="12" cy="9.5" r="3.8" stroke="currentColor" stroke-width="1.8" />
      <path d="M9.3 13.1 7.2 19l4.8-2.1L16.8 19l-2.1-5.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'check'">
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="1.8" />
      <path d="M8.7 12.1 11 14.4l4.5-4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.8" />
      <path d="M12 8v4l2.6 2.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    default: 'spark'
  }
});
</script>
