<template>
  <section class="page-stack" v-if="room">
    <article class="hero-card">
      <SectionTitle
        eyebrow="项目沟通"
        title="需求确认、阶段同步和修改反馈都在这里发生。"
        description="项目一旦开始协作，双方就围绕当前任务持续沟通。重要消息、文件和确认节点也会同步回项目记录。"
        tag="h1"
      />
      <div class="chip-row">
        <span class="tag-pill">当前项目：{{ room.taskId }}</span>
        <span class="tag-pill">{{ room.participants.length }} 位协作成员</span>
        <span class="tag-pill">支持文件与进度同步</span>
        <router-link class="button-secondary" :to="workspaceRoute">查看任务协作区</router-link>
      </div>
    </article>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="当前会话"
          title="当前协作成员"
          description="当合作双方完成需求和工期确认后，就会进入项目沟通页面，后续沟通内容会和任务进展一起留痕。"
        />

        <div class="tag-row">
          <span v-for="item in room.participants" :key="item" class="soft-pill">{{ item }}</span>
        </div>

        <div class="conversation-feed">
          <article
            v-for="message in room.messages"
            :key="`${message.author}-${message.text}`"
            class="message-bubble"
            :class="{ 'is-system': message.type === 'SYSTEM' }"
          >
            <div class="title-line">
              <span class="status-dot"></span>
              <div>
                <h4>{{ message.author }}</h4>
                <p class="muted">{{ message.type }}</p>
              </div>
            </div>
            <p class="muted">{{ message.text }}</p>
          </article>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="沟通约定"
          title="让沟通更快进入执行"
          description="好的项目沟通不是聊天越多越好，而是越快对齐交付目标、修改意见和下一步动作。"
        />

        <div class="stack-sm">
          <div class="mini-card stack-sm">
            <h4>先对齐目标</h4>
            <p class="muted">先确认需求范围、工期和阶段产出，避免项目开始后再反复回头调整。</p>
          </div>
          <div class="mini-card stack-sm">
            <h4>修改要留痕</h4>
            <p class="muted">重要修改意见和文件说明建议直接发在项目沟通里，方便后续追溯和确认。</p>
          </div>
          <div class="mini-card stack-sm">
            <h4>节点要确认</h4>
            <p class="muted">里程碑完成、工期变化和验收安排都应该在这里明确下来，再同步到协作空间。</p>
          </div>
        </div>

        <div class="toolbar">
          <router-link class="button-primary" :to="primaryRoute">{{ primaryLabel }}</router-link>
          <router-link class="button-secondary" :to="secondaryRoute">{{ secondaryLabel }}</router-link>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { getTaskRoom } from '../services/api';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const room = ref(null);
const audience = computed(() => resolveAudience(route));
const workspaceRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace
);
const primaryRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.market : roleRouteMap.enterprise.publish
);
const secondaryRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding
);
const primaryLabel = computed(() => (audience.value === 'talent' ? '去看任务广场' : '去发布任务'));
const secondaryLabel = computed(() => (audience.value === 'talent' ? '去做人才入驻' : '去做企业入驻'));

onMounted(async () => {
  room.value = await getTaskRoom();
});
</script>
