<template>
  <section class="chat-layout">
    <header class="chat-layout-header">
      <div class="chat-layout-copy">
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.meta" class="chat-layout-meta">
        <slot name="meta" />
      </div>
    </header>

    <div class="chat-layout-feed">
      <slot name="feed-before" />
      <div v-if="messages.length" class="chat-layout-messages">
        <slot
          v-for="message in messages"
          name="message"
          :message="message"
        >
          <article :key="message.id || `${message.author}-${message.time}-${message.text}`" class="chat-layout-message">
            <div class="chat-layout-message-meta">
              <strong>{{ message.author || '协作成员' }}</strong>
              <span>{{ message.time || '刚刚' }}</span>
            </div>
            <p v-if="message.text" class="chat-layout-message-text">{{ message.text }}</p>
          </article>
        </slot>
      </div>
      <div v-else class="chat-layout-empty">
        <strong>{{ emptyTitle }}</strong>
        <p>{{ emptyNote }}</p>
      </div>
      <slot name="feed-after" />
    </div>

    <footer class="chat-layout-composer">
      <slot name="composer-tools" />
      <div class="chat-layout-composer-row">
        <textarea
          class="chat-layout-input"
          :value="modelValue"
          :placeholder="composerPlaceholder"
          rows="1"
          @input="$emit('update:modelValue', $event.target.value)"
          @keydown.enter.exact.prevent="handleSend"
        ></textarea>
        <button
          class="chat-layout-send"
          type="button"
          :disabled="sending || !canSend"
          @click="handleSend"
        >
          {{ sending ? sendingLabel : sendLabel }}
        </button>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  messages: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  },
  composerPlaceholder: {
    type: String,
    default: '输入消息'
  },
  sendLabel: {
    type: String,
    default: '发送'
  },
  sendingLabel: {
    type: String,
    default: '发送中...'
  },
  sending: {
    type: Boolean,
    default: false
  },
  emptyTitle: {
    type: String,
    default: '还没有消息'
  },
  emptyNote: {
    type: String,
    default: '开始第一轮沟通后，这里会沉淀完整对话。'
  }
});

const emit = defineEmits(['update:modelValue', 'send']);

const canSend = computed(() => String(props.modelValue || '').trim().length > 0);

function handleSend() {
  if (!canSend.value || props.sending) {
    return;
  }
  emit('send');
}
</script>

<style scoped>
.chat-layout {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100%;
}

.chat-layout-header,
.chat-layout-feed,
.chat-layout-composer {
  border: 1px solid rgba(120, 190, 255, 0.16);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(10, 20, 38, 0.94), rgba(14, 28, 52, 0.96)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.08), transparent 36%);
  box-shadow: 0 16px 34px rgba(2, 8, 20, 0.32);
}

.chat-layout-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
}

.chat-layout-copy h2 {
  margin: 0;
  color: var(--text-strong);
  font-family: var(--font-display);
  font-size: 24px;
  letter-spacing: -0.03em;
}

.chat-layout-copy p {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 14px;
  line-height: 1.55;
}

.chat-layout-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 360px;
  padding: 16px;
}

.chat-layout-messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-layout-message {
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(8, 15, 28, 0.74);
  border: 1px solid rgba(120, 190, 255, 0.12);
}

.chat-layout-message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--text-soft);
  font-size: 12px;
}

.chat-layout-message-meta strong {
  color: var(--text-strong);
}

.chat-layout-message-text {
  margin: 8px 0 0;
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.6;
}

.chat-layout-empty {
  display: grid;
  place-items: center;
  flex: 1;
  padding: 24px;
  text-align: center;
  color: var(--text-soft);
}

.chat-layout-empty strong {
  color: var(--text-strong);
}

.chat-layout-composer {
  position: sticky;
  bottom: calc(10px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  box-shadow: 0 18px 38px rgba(2, 8, 20, 0.4);
}

.chat-layout-composer-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.chat-layout-input {
  min-height: 52px;
  padding: 14px 16px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  border-radius: 18px;
  background: rgba(8, 15, 28, 0.82);
  color: var(--text-strong);
  resize: none;
}

.chat-layout-send {
  min-width: 92px;
  min-height: 52px;
  border: 0;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--accent-deep), var(--accent));
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 12px 22px rgba(29, 125, 255, 0.24);
}

.chat-layout-send:disabled {
  opacity: 0.58;
}

@media (max-width: 640px) {
  .chat-layout-composer-row {
    grid-template-columns: 1fr;
  }
}
</style>
