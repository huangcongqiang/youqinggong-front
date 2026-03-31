<template>
  <div v-if="open" class="auth-modal" @click.self="handleClose">
    <article class="auth-modal-card stack-md">
      <div class="panel-header panel-header-top">
        <div class="stack-sm">
          <span class="eyebrow">账号登录</span>
          <h3>先登录，再进入对应业务端。</h3>
          <p class="muted">登录后会带上当前账号进入企业端或人才端，不再重复选择固定演示身份。</p>
        </div>
        <button class="button-secondary" type="button" @click="handleClose">关闭</button>
      </div>

      <div class="chip-row">
        <button
          type="button"
          class="button-secondary"
          :class="{ 'is-active-tab': audience === 'enterprise' }"
          @click="audience = 'enterprise'"
        >
          企业端
        </button>
        <button
          type="button"
          class="button-secondary"
          :class="{ 'is-active-tab': audience === 'talent' }"
          @click="audience = 'talent'"
        >
          人才端
        </button>
      </div>

      <div v-if="authState.user" class="result-card stack-sm">
        <span class="eyebrow">当前登录中</span>
        <h3>{{ authState.user.displayName }}</h3>
        <p class="muted">{{ authState.user.audience === 'talent' ? '人才端账号' : '企业端账号' }} · {{ authState.user.mobile }}</p>
        <div class="toolbar">
          <button class="button-primary" type="button" @click="continueWithCurrent">继续进入当前账号</button>
          <button class="button-secondary" type="button" @click="handleLogout">退出登录</button>
        </div>
      </div>

      <form class="stack-md" @submit.prevent="handleLogin">
        <div class="form-field">
          <label for="login-mobile">手机号</label>
          <input id="login-mobile" v-model="mobile" class="text-input" placeholder="例如：13800000001" />
        </div>

        <div class="form-field">
          <label for="login-password">密码</label>
          <input id="login-password" v-model="password" type="password" class="text-input" placeholder="请输入密码" />
        </div>

        <div class="toolbar">
          <button class="button-primary" type="submit" :disabled="authState.loading">
            {{ authState.loading ? '登录中...' : '登录并进入' }}
          </button>
        </div>
      </form>

      <div v-if="resultMessage" class="result-card stack-sm">
        <span class="eyebrow">当前反馈</span>
        <h3>{{ resultTitle }}</h3>
        <p class="muted">{{ resultMessage }}</p>
      </div>

      <div class="panel-header">
        <div>
          <span class="eyebrow">还没有账号</span>
          <p class="muted">注册会进入新的步骤式引导页，先创建账号，再进入对应入驻流程。</p>
        </div>
        <button class="button-secondary" type="button" @click="goToRegister">去注册</button>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { loginWithAccount, signOut, useAuthState } from '../stores/auth';
import { roleRouteMap } from '../utils/roleRoutes';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  initialAudience: {
    type: String,
    default: 'enterprise'
  },
  redirect: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const router = useRouter();
const authState = useAuthState();

const audience = ref(props.initialAudience === 'talent' ? 'talent' : 'enterprise');
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

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      audience.value = props.initialAudience === 'talent' ? 'talent' : 'enterprise';
      resultTitle.value = '';
      resultMessage.value = '';
    }
  }
);

watch(
  () => props.initialAudience,
  (nextAudience) => {
    if (props.open) {
      audience.value = nextAudience === 'talent' ? 'talent' : 'enterprise';
    }
  }
);

function targetRoute(user) {
  if (props.redirect) {
    return props.redirect;
  }
  if (!user) {
    return '/';
  }
  return user.approvalStatus === 'APPROVED'
    ? user.homeRoute || (user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home)
    : user.onboardingRoute || (user.audience === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding);
}

function handleClose() {
  resultTitle.value = '';
  resultMessage.value = '';
  emit('close');
}

async function continueWithCurrent() {
  await router.replace(continueRoute.value);
}

async function handleLogout() {
  await signOut();
  resultTitle.value = '已退出登录';
  resultMessage.value = '你可以重新登录其他账号，或先去注册新账号。';
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
  await router.replace(targetRoute(result.user));
}

async function goToRegister() {
  await router.push({
    path: '/register',
    query: {
      audience: audience.value
    }
  });
}
</script>
