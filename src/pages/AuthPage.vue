<template>
  <section class="portal-auth-shell">
    <header class="portal-auth-topbar">
      <router-link class="portal-auth-brand" to="/">
        <span class="portal-auth-brand__mark">轻</span>
        <span class="portal-auth-brand__text">有轻功</span>
      </router-link>

      <div class="portal-auth-topbar__actions">
        <span class="portal-auth-topbar__hint">还没有账号？</span>
        <router-link class="portal-auth-link" :to="registerRoute">创建账号</router-link>
      </div>
    </header>

    <main class="portal-auth-stage">
      <article class="portal-auth-card">
        <div class="portal-auth-card__eyebrow">账号登录</div>

        <div class="portal-auth-audience-switch" role="tablist" aria-label="切换登录角色">
          <button
            type="button"
            class="portal-auth-audience-switch__item"
            :class="{ 'is-active': audience === 'enterprise' }"
            @click="setAudience('enterprise')"
          >
            企业
          </button>
          <button
            type="button"
            class="portal-auth-audience-switch__item"
            :class="{ 'is-active': audience === 'talent' }"
            @click="setAudience('talent')"
          >
            人才
          </button>
        </div>

        <div class="portal-auth-card__header">
          <h1>{{ audienceTitle }}</h1>
          <p>{{ audienceLead }}</p>
        </div>

        <article v-if="authState.user" class="portal-auth-current-account">
          <div class="portal-auth-current-account__header">
            <div>
              <span class="portal-auth-current-account__eyebrow">当前账号</span>
              <h2>{{ authState.user.displayName }}</h2>
              <p>{{ currentAccountMeta }}</p>
            </div>
            <span class="portal-auth-route-pill">{{ continueLabel }}</span>
          </div>

          <p class="portal-auth-current-account__summary">{{ currentAccountSummary }}</p>

          <div class="portal-auth-chip-row">
            <span v-for="item in audienceHighlights" :key="item" class="portal-auth-chip">{{ item }}</span>
          </div>

          <div class="portal-auth-actions">
            <button class="button-primary" type="button" @click="continueWithCurrent">{{ continueLabel }}</button>
            <button class="button-secondary" type="button" @click="handleLogout">退出登录</button>
          </div>
        </article>

        <form v-else class="portal-auth-form" @submit.prevent="handleLogin">
          <div class="portal-auth-field">
            <label for="auth-mobile">手机号</label>
            <input
              id="auth-mobile"
              v-model="mobile"
              class="portal-auth-input"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="请输入手机号"
            />
          </div>

          <div class="portal-auth-field">
            <label for="auth-password">密码</label>
            <input
              id="auth-password"
              v-model="password"
              type="password"
              class="portal-auth-input"
              autocomplete="current-password"
              placeholder="请输入密码"
            />
          </div>

          <div class="portal-auth-actions">
            <button class="button-primary portal-auth-submit" type="submit" :disabled="authState.loading">
              {{ authState.loading ? '登录中…' : '登录并继续' }}
            </button>
          </div>
        </form>

        <article
          v-if="resultMessage"
          class="portal-auth-feedback"
          :class="{
            'is-error': resultTone === 'error',
            'is-success': resultTone === 'success',
            'is-note': resultTone === 'note'
          }"
        >
          <span class="portal-auth-feedback__eyebrow">登录状态</span>
          <h3>{{ resultTitle }}</h3>
          <p>{{ resultMessage }}</p>
        </article>

        <footer class="portal-auth-footer">
          <router-link class="portal-auth-link" :to="registerRoute">创建新账号</router-link>
          <router-link class="portal-auth-link" to="/">返回首页</router-link>
        </footer>
      </article>
    </main>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loginWithAccount, signOut, useAuthState } from '../stores/auth';
import { buildUpworkFirstAccountStatus } from '../utils/upworkFirstAccountStatus';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();

const audience = ref(route.query.audience === 'talent' ? 'talent' : 'enterprise');
const mobile = ref('');
const password = ref('');
const resultTitle = ref('');
const resultMessage = ref('');
const resultTone = ref('note');

const registerRoute = computed(() => roleRouteMap.portal.register(audience.value));
const redirectTarget = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : ''));
const currentStatusModel = computed(() =>
  buildUpworkFirstAccountStatus(authState.user, authState.user?.audience || audience.value)
);
const continueRoute = computed(() => {
  const user = authState.user;
  if (!user) {
    return '/';
  }
  if (currentStatusModel.value.hasBlockingItems || !currentStatusModel.value.approved) {
    return user.onboardingRoute || (user.audience === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding);
  }
  if (redirectTarget.value) {
    return redirectTarget.value;
  }
  return user.homeRoute || (user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home);
});
const continueLabel = computed(() =>
  currentStatusModel.value.hasBlockingItems || !currentStatusModel.value.approved ? '继续完善设置' : '进入工作台'
);
const audienceTitle = computed(() => (audience.value === 'talent' ? '登录人才账号' : '登录企业账号'));
const audienceLead = computed(() =>
  audience.value === 'talent'
    ? '先确认账号状态，再回到找任务、消息或当前合作页面。'
    : '先确认账号状态，再回到企业工作台、发布任务或当前入口。'
);
const audienceHighlights = computed(() =>
  audience.value === 'talent'
    ? ['资料完整度', '消息协作', '找任务']
    : ['验证状态', '账单设置', '任务发布']
);
const currentAccountMeta = computed(() => {
  const user = authState.user;
  if (!user) {
    return '';
  }
  return `${user.audience === 'talent' ? '人才账号' : '企业账号'} · ${user.mobile || '未填写手机号'}`;
});
const currentAccountSummary = computed(() => {
  const user = authState.user;
  if (!user) {
    return '';
  }
  if (currentStatusModel.value.hasBlockingItems || !currentStatusModel.value.approved) {
    return user.audience === 'talent'
      ? '当前账号还需要先补齐资料或验证信息，继续后会先进入人才设置。'
      : '当前账号还需要先补齐企业资料、联系人或账单设置，继续后会先进入企业设置。';
  }
  if (redirectTarget.value) {
    return '当前账号已经可以继续，下一步会直接回到你刚才打开的页面。';
  }
  return user.audience === 'talent'
    ? '当前账号已经可以继续，下一步会进入人才工作台。'
    : '当前账号已经可以继续，下一步会进入企业工作台。';
});

watch(
  () => route.query.audience,
  (nextAudience) => {
    audience.value = nextAudience === 'talent' ? 'talent' : 'enterprise';
  }
);

function setAudience(nextAudience) {
  audience.value = nextAudience;
  router.replace(roleRouteMap.portal.login(nextAudience, redirectTarget.value));
}

function resolveTargetRoute(user) {
  if (!user) {
    return '/';
  }
  const status = buildUpworkFirstAccountStatus(user, user.audience || audience.value);
  if (!status.hasBlockingItems && status.approved) {
    return redirectTarget.value
      || user.homeRoute
      || (user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home);
  }
  return user.onboardingRoute || (user.audience === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding);
}

async function continueWithCurrent() {
  await router.replace(continueRoute.value);
}

async function handleLogout() {
  await signOut();
  resultTone.value = 'note';
  resultTitle.value = '已退出登录';
  resultMessage.value = '你可以继续登录其他账号，或先创建一个新账号。';
}

async function handleLogin() {
  const result = await loginWithAccount({
    audience: audience.value,
    mobile: mobile.value,
    password: password.value
  });

  if (!result?.success) {
    resultTone.value = 'error';
    resultTitle.value = '登录失败';
    resultMessage.value = result?.requestError || result?.message || '请检查账号、角色入口和密码后再试。';
    return;
  }

  resultTone.value = 'success';
  resultTitle.value = '已登录';
  resultMessage.value = result.nextStep || '当前账号已识别，正在进入对应页面。';
  const nextStatus = buildUpworkFirstAccountStatus(result.user, result.user?.audience || audience.value);
  if (!nextStatus.hasBlockingItems && nextStatus.approved) {
    await router.replace(resolveTargetRoute(result.user));
  }
}
</script>

<style scoped>
.portal-auth-shell {
  min-height: 100vh;
  padding: 28px 24px 56px;
  background:
    radial-gradient(circle at top left, rgba(20, 168, 0, 0.12), transparent 32%),
    linear-gradient(180deg, #f7f8f4 0%, #fdfdf9 34%, #f5f6f2 100%);
}

.portal-auth-topbar {
  width: min(1120px, 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 6px 0 28px;
}

.portal-auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #181818;
  text-decoration: none;
  font-weight: 700;
}

.portal-auth-brand__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #108a00;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.portal-auth-brand__text {
  font-size: 18px;
  letter-spacing: -0.02em;
}

.portal-auth-topbar__actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #5e6b5a;
  font-size: 14px;
}

.portal-auth-topbar__hint {
  color: #6b7564;
}

.portal-auth-link {
  color: #108a00;
  font-weight: 700;
  text-decoration: none;
}

.portal-auth-link:hover {
  text-decoration: underline;
}

.portal-auth-stage {
  width: min(1120px, 100%);
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.portal-auth-card {
  width: min(560px, 100%);
  padding: 38px 40px 34px;
  border-radius: 24px;
  border: 1px solid rgba(20, 24, 18, 0.08);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 48px rgba(16, 24, 40, 0.08);
  display: grid;
  gap: 22px;
}

.portal-auth-card__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #657160;
}

.portal-auth-audience-switch {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 4px;
  border-radius: 999px;
  background: #f2f4ee;
  border: 1px solid rgba(20, 24, 18, 0.06);
}

.portal-auth-audience-switch__item {
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #485246;
  font-size: 15px;
  font-weight: 700;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.portal-auth-audience-switch__item.is-active {
  background: #ffffff;
  color: #108a00;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
}

.portal-auth-card__header {
  display: grid;
  gap: 10px;
}

.portal-auth-card__header h1 {
  margin: 0;
  font-size: clamp(38px, 5vw, 54px);
  line-height: 0.98;
  letter-spacing: -0.06em;
  color: #182018;
}

.portal-auth-card__header p {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: #5f695c;
}

.portal-auth-route-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: #eef4e6;
  color: #41513e;
  font-size: 12px;
  font-weight: 700;
}

.portal-auth-form,
.portal-auth-current-account {
  display: grid;
  gap: 18px;
}

.portal-auth-field {
  display: grid;
  gap: 10px;
}

.portal-auth-field label {
  font-size: 14px;
  font-weight: 700;
  color: #1f2a1d;
}

.portal-auth-input {
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid rgba(20, 24, 18, 0.12);
  background: #ffffff;
  color: #182018;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.portal-auth-input::placeholder {
  color: #9ba498;
}

.portal-auth-input:focus {
  outline: none;
  border-color: #108a00;
  box-shadow: 0 0 0 4px rgba(16, 138, 0, 0.12);
}

.portal-auth-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.portal-auth-submit {
  width: 100%;
  justify-content: center;
}

.portal-auth-current-account {
  padding: 20px;
  border-radius: 20px;
  background: linear-gradient(180deg, #f8faf4 0%, #ffffff 100%);
  border: 1px solid rgba(20, 24, 18, 0.08);
}

.portal-auth-current-account__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}

.portal-auth-current-account__eyebrow {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f7969;
}

.portal-auth-current-account__header h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.06;
  color: #182018;
}

.portal-auth-current-account__header p {
  margin: 6px 0 0;
  font-size: 14px;
  color: #657160;
}

.portal-auth-current-account__summary {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #52604f;
}

.portal-auth-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.portal-auth-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(20, 24, 18, 0.08);
  color: #435240;
  font-size: 13px;
  font-weight: 700;
}

.portal-auth-feedback {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(20, 24, 18, 0.08);
  background: #f8faf4;
}

.portal-auth-feedback.is-error {
  background: #fff7f5;
  border-color: rgba(199, 14, 5, 0.14);
}

.portal-auth-feedback.is-success {
  background: #f3fbef;
  border-color: rgba(16, 138, 0, 0.14);
}

.portal-auth-feedback__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f7969;
}

.portal-auth-feedback h3,
.portal-auth-feedback p {
  margin: 0;
}

.portal-auth-feedback h3 {
  font-size: 20px;
  color: #182018;
}

.portal-auth-feedback p {
  font-size: 14px;
  line-height: 1.6;
  color: #5d6657;
}

.portal-auth-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding-top: 4px;
}

@media (max-width: 720px) {
  .portal-auth-shell {
    padding: 18px 16px 40px;
  }

  .portal-auth-topbar {
    flex-direction: column;
    align-items: flex-start;
    padding-bottom: 20px;
  }

  .portal-auth-card {
    padding: 28px 22px 24px;
  }

  .portal-auth-card__header h1 {
    font-size: 38px;
  }

  .portal-auth-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
