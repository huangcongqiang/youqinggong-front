<template>
  <section class="auth-entry-page">
    <div class="auth-entry-shell">
      <header class="auth-entry-head auth-entry-head-compact">
        <div class="auth-entry-copy stack-xs">
          <span class="auth-entry-mark">有轻工</span>
          <span class="entry-kicker">{{ audience === 'talent' ? '人才入口' : '企业入口' }}</span>
          <h1 class="auth-entry-title">登录继续</h1>
          <p class="muted">先确认角色，再进入对应工作台。</p>
        </div>
      </header>

      <article class="glass-panel auth-entry-card stack-md">
        <div class="auth-entry-role-row">
          <button
            type="button"
            class="auth-entry-role"
            :class="{ 'is-active': audience === 'enterprise' }"
            @click="audience = 'enterprise'"
          >
            <span>企业端</span>
          </button>
          <button
            type="button"
            class="auth-entry-role"
            :class="{ 'is-active': audience === 'talent' }"
            @click="audience = 'talent'"
          >
            <span>人才端</span>
          </button>
        </div>

        <div class="stack-sm auth-entry-focus">
          <p class="muted auth-entry-focus-note">{{ audienceFocusNote }}</p>
          <div class="tag-row auth-entry-focus-tags">
            <span v-for="item in audienceFocusTags" :key="item" class="soft-pill">{{ item }}</span>
          </div>
        </div>

        <form class="stack-md" @submit.prevent="handleLogin">
          <div class="form-field">
            <label for="auth-mobile">手机号</label>
            <input id="auth-mobile" v-model="mobile" class="text-input" placeholder="请输入手机号" />
          </div>

          <div class="form-field">
            <label for="auth-password">密码</label>
            <input id="auth-password" v-model="password" type="password" class="text-input" placeholder="请输入密码" />
          </div>

          <div class="toolbar auth-entry-actions">
            <button class="button-primary" type="submit" :disabled="authState.loading">
              {{ authState.loading ? '登录中...' : '登录并进入' }}
            </button>
          </div>
        </form>

        <div class="auth-entry-footer">
          <span class="muted">还没有账号？</span>
          <router-link class="auth-entry-footer-link" :to="registerRoute">去注册</router-link>
        </div>

        <div v-if="resultMessage" class="result-card stack-sm">
          <span class="eyebrow">当前反馈</span>
          <h3>{{ resultTitle }}</h3>
          <p class="muted">{{ resultMessage }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loginWithAccount, useAuthState } from '../stores/auth';
import { resolveUserEntryRoute, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();

const audience = ref(route.query.audience === 'talent' ? 'talent' : 'enterprise');
const mobile = ref('');
const password = ref('');
const resultTitle = ref('');
const resultMessage = ref('');

const registerRoute = computed(() => roleRouteMap.portal.register(audience.value));
const audienceFocusNote = computed(() =>
  audience.value === 'talent'
    ? '登录后先处理待确认任务，再回到最近沟通继续推进。'
    : '登录后先处理待办，再进入聊天或继续发布任务。'
);
const audienceFocusTags = computed(() =>
  audience.value === 'talent' ? ['接任务', '回聊天'] : ['发任务', '回待办']
);

watch(
  () => route.query.audience,
  (nextAudience) => {
    audience.value = nextAudience === 'talent' ? 'talent' : 'enterprise';
  }
);

function resolveTargetRoute(user) {
  if (typeof route.query.redirect === 'string' && route.query.redirect) {
    return route.query.redirect;
  }
  return resolveUserEntryRoute(user);
}

async function handleLogin() {
  const result = await loginWithAccount({
    audience: audience.value,
    mobile: mobile.value,
    password: password.value
  });

  if (!result?.success) {
    resultTitle.value = '登录失败';
    resultMessage.value = result?.requestError || result?.message || '请确认账号、角色入口和密码是否一致。';
    return;
  }

  resultTitle.value = '登录成功';
  resultMessage.value = result.nextStep || '已识别当前账号。';
  await router.replace(resolveTargetRoute(result.user));
}
</script>

<style scoped>
.auth-entry-page {
  min-height: calc(100vh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
}

.auth-entry-shell {
  width: min(420px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: clamp(32px, 9vh, 72px);
}

.auth-entry-head {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
  text-align: left;
}

.auth-entry-head-compact {
  align-items: flex-start;
}

.auth-entry-mark {
  color: var(--text-strong);
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.auth-entry-card {
  padding: 18px;
  gap: 14px;
}

.auth-entry-copy {
  align-items: flex-start;
}

.auth-entry-title {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(28px, 7vw, 34px);
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.auth-entry-role-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.auth-entry-focus {
  gap: 8px;
}

.auth-entry-focus-note {
  margin: 0;
}

.auth-entry-focus-tags {
  gap: 8px;
}

.auth-entry-role {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border-radius: 18px;
  border: 1px solid var(--line-soft);
  background: rgba(8, 15, 28, 0.76);
  color: inherit;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.auth-entry-role:hover {
  transform: translateY(-1px);
  border-color: var(--line-strong);
}

.auth-entry-role.is-active {
  border-color: rgba(57, 196, 255, 0.34);
  background: linear-gradient(180deg, rgba(16, 42, 86, 0.9), rgba(9, 19, 35, 0.9));
  box-shadow: inset 0 0 0 1px rgba(57, 196, 255, 0.14);
}

.auth-entry-role span {
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 700;
}

.auth-entry-actions > * {
  flex: 1 1 180px;
}

.auth-entry-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.auth-entry-footer-link {
  color: var(--text-strong);
  font-weight: 700;
}

@media (max-width: 640px) {
  .auth-entry-page {
    min-height: auto;
  }

  .auth-entry-shell {
    width: 100%;
    padding-top: clamp(24px, 7vh, 40px);
  }

  .auth-entry-card {
    padding: 18px;
  }

  .auth-entry-head {
    gap: 10px;
  }
}
</style>
