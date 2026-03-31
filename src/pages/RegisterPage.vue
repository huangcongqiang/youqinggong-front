<template>
  <section class="page-stack register-page">
    <article class="hero-card register-hero register-hero-compact">
      <div class="register-hero-head">
        <SectionTitle
          eyebrow="账号注册"
          title="先创建账号。"
          description="只创建账号，资料后补。"
          tag="h1"
        />
        <button class="button-secondary register-login-trigger" type="button" @click="openLoginModal">去登录</button>
      </div>

      <div v-if="authState.user" class="result-card stack-sm">
        <span class="eyebrow">当前已登录</span>
        <h3>{{ authState.user.displayName }}</h3>
        <p class="muted">{{ authState.user.audience === 'talent' ? '人才端账号' : '企业端账号' }} · {{ authState.user.mobile }}</p>
        <div class="toolbar">
          <router-link class="button-primary" :to="continueRoute">继续进入当前账号</router-link>
          <button class="button-secondary" type="button" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </article>

    <article class="glass-panel stack-md register-shell register-shell-compact">
      <div class="register-shell-head">
        <div class="stack-xs">
          <span class="eyebrow">3 步完成</span>
          <p class="muted">先选身份，再建账号。</p>
        </div>
        <span class="register-current-audience">当前：{{ audience === 'talent' ? '人才端' : '企业端' }}</span>
      </div>

      <div class="publish-stepper register-stepper register-progress-strip">
        <button
          v-for="step in registerSteps"
          :key="step.id"
          type="button"
          class="publish-stepper-item register-progress-chip"
          :class="registerStepClass(step.id)"
          @click="jumpStep(step.id)"
        >
          <span class="publish-stepper-index">{{ step.id }}</span>
          <strong>{{ step.title }}</strong>
        </button>
      </div>

      <article class="mini-card stack-md onboarding-step-panel register-step-panel">
        <template v-if="step === 1">
          <SectionTitle
            eyebrow="第 1 步"
            title="先选身份"
            description="企业发任务，人才接任务。"
          />

          <div class="register-role-grid">
            <button
              type="button"
              class="register-role-card"
              :class="{ 'is-active-tab': audience === 'enterprise' }"
              @click="setAudience('enterprise')"
            >
              <div class="register-role-topline">
                <span class="eyebrow">企业端</span>
                <span class="muted">发任务</span>
              </div>
              <h3>企业端</h3>
              <p class="muted">发布任务，推进协作与验收。</p>
            </button>

            <button
              type="button"
              class="register-role-card"
              :class="{ 'is-active-tab': audience === 'talent' }"
              @click="setAudience('talent')"
            >
              <div class="register-role-topline">
                <span class="eyebrow">人才端</span>
                <span class="muted">接任务</span>
              </div>
              <h3>人才端</h3>
              <p class="muted">接单协作，沉淀收入与评价。</p>
            </button>
          </div>
        </template>

        <template v-else-if="step === 2">
          <SectionTitle
            eyebrow="第 2 步"
            title="创建你的账号"
            description="只录基础账号信息。"
          />

          <div class="form-grid">
            <div class="form-field full">
              <label :for="audience === 'enterprise' ? 'register-name' : 'register-display-name'">
                {{ audience === 'enterprise' ? '企业名称 / 品牌名称' : '姓名 / 对外名称' }}
              </label>
              <input
                :id="audience === 'enterprise' ? 'register-name' : 'register-display-name'"
                v-model="displayName"
                class="text-input"
                :placeholder="audience === 'enterprise' ? '例如：星河智能' : '例如：陈一宁'"
              />
            </div>

            <div v-if="audience === 'talent'" class="form-field full">
              <label for="register-headline">当前专业方向</label>
              <input
                id="register-headline"
                v-model="headline"
                class="text-input"
                placeholder="例如：AI 产品设计 + 全栈开发"
              />
            </div>

            <div class="form-field">
              <label for="register-mobile">手机号</label>
              <input id="register-mobile" v-model="mobile" class="text-input" placeholder="例如：13800000011" />
            </div>

            <div class="form-field">
              <label for="register-password">密码</label>
              <input id="register-password" v-model="password" type="password" class="text-input" placeholder="建议先满足本地测试需要" />
            </div>
          </div>
        </template>

        <template v-else>
          <SectionTitle
            eyebrow="第 3 步"
            title="确认信息并创建账号"
            description="创建后会自动进入对应入驻流程。"
          />

          <div class="onboarding-summary-list">
            <div class="onboarding-summary-row">
              <span>注册角色</span>
              <strong>{{ audience === 'talent' ? '人才端' : '企业端' }}</strong>
            </div>
            <div class="onboarding-summary-row">
              <span>{{ audience === 'talent' ? '对外名称' : '企业名称' }}</span>
              <strong>{{ displayName || '待填写' }}</strong>
            </div>
            <div class="onboarding-summary-row">
              <span>手机号</span>
              <strong>{{ mobile || '待填写' }}</strong>
            </div>
            <div v-if="audience === 'talent'" class="onboarding-summary-row">
              <span>专业方向</span>
              <strong>{{ headline || '待填写' }}</strong>
            </div>
          </div>

          <article class="result-card stack-sm">
            <span class="eyebrow">注册后下一步</span>
            <p class="muted">
              {{ audience === 'talent'
                ? '系统会带你进入人才端入驻页，继续补充技能、作品、档期和实名信息。'
                : '系统会带你进入企业端入驻页，继续补充联系人、合作偏好和企业资料。' }}
            </p>
          </article>

          <div v-if="resultMessage" class="result-card stack-sm">
            <span class="eyebrow">当前反馈</span>
            <h3>{{ resultTitle }}</h3>
            <p class="muted">{{ resultMessage }}</p>
          </div>
        </template>
      </article>

      <div class="publish-step-actions">
        <button v-if="step > 1" class="button-secondary" type="button" @click="previousStep">上一步</button>

        <button v-if="step < registerSteps.length" class="button-primary" type="button" :disabled="!isStepValid" @click="nextStep">
          下一步
        </button>

        <button v-else class="button-primary" type="button" :disabled="!canSubmit || authState.loading" @click="handleRegister">
          {{ authState.loading ? '创建中...' : '创建账号并继续' }}
        </button>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { registerWithAccount, signOut, useAuthState } from '../stores/auth';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();

const registerSteps = [
  { id: 1, title: '选择身份', note: '先确认企业端或人才端' },
  { id: 2, title: '填写账号', note: '只收基础账号信息' },
  { id: 3, title: '确认创建', note: '创建后进入对应入驻流程' }
];

const step = ref(1);
const audience = ref(route.query.audience === 'talent' ? 'talent' : 'enterprise');
const displayName = ref('');
const headline = ref('');
const mobile = ref('');
const password = ref('');
const resultTitle = ref('');
const resultMessage = ref('');

const continueRoute = computed(() => {
  const user = authState.user;
  if (!user) {
    return '/';
  }
  return user.approvalStatus === 'APPROVED'
    ? user.homeRoute || (user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home)
    : user.onboardingRoute || (user.audience === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding);
});

const isStepValid = computed(() => {
  if (step.value === 1) {
    return Boolean(audience.value);
  }
  if (step.value === 2) {
    return Boolean(displayName.value && mobile.value && password.value);
  }
  return true;
});

const canSubmit = computed(() => Boolean(displayName.value && mobile.value && password.value));

function setAudience(nextAudience) {
  audience.value = nextAudience;
  router.replace({
    path: '/register',
    query: {
      ...route.query,
      audience: nextAudience
    }
  });
}

function registerStepClass(id) {
  return {
    'is-active': step.value === id,
    'is-complete': step.value > id
  };
}

function jumpStep(targetStep) {
  if (targetStep <= step.value) {
    step.value = targetStep;
    return;
  }

  if (isStepValid.value) {
    step.value = targetStep;
  }
}

function nextStep() {
  if (!isStepValid.value || step.value >= registerSteps.length) {
    return;
  }
  step.value += 1;
}

function previousStep() {
  if (step.value <= 1) {
    return;
  }
  step.value -= 1;
}

function openLoginModal() {
  router.replace({
    path: '/register',
    query: {
      ...route.query,
      audience: audience.value,
      login: '1'
    }
  });
}

async function handleLogout() {
  await signOut();
  resultTitle.value = '已退出登录';
  resultMessage.value = '你可以继续注册新账号，或直接登录已有账号。';
}

async function handleRegister() {
  const result = await registerWithAccount({
    audience: audience.value,
    displayName: displayName.value,
    organizationName: audience.value === 'enterprise' ? displayName.value : '',
    headline: audience.value === 'talent' ? headline.value : '',
    mobile: mobile.value,
    password: password.value
  });

  if (!result?.success) {
    resultTitle.value = '注册失败';
    resultMessage.value = result?.message || '请检查输入后重试。';
    return;
  }

  resultTitle.value = '账号已创建';
  resultMessage.value = result.nextStep || '可以继续进入对应角色的入驻流程。';
  await router.replace(
    result.user?.onboardingRoute
      || (audience.value === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding)
  );
}
</script>
