<template>
  <div v-if="open" class="auth-modal" @click.self="handleClose">
    <article class="auth-modal-card stack-md">
      <div class="panel-header panel-header-top">
        <div class="stack-sm">
          <span class="eyebrow">登录</span>
          <h3>先登录，再继续回到当前工作台。</h3>
          <p class="muted">我们会带你回到正确的工作台，并保留当前角色上下文。</p>
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
          企业
        </button>
        <button
          type="button"
          class="button-secondary"
          :class="{ 'is-active-tab': audience === 'talent' }"
          @click="audience = 'talent'"
        >
          人才
        </button>
      </div>

      <div class="result-card stack-sm">
        <span class="eyebrow">登录提示</span>
        <p class="muted">请使用真实账号继续。登录失败时，会直接显示真实错误原因。</p>
      </div>

      <div v-if="authState.user" class="result-card stack-sm">
        <span class="eyebrow">已登录</span>
        <h3>{{ authState.user.displayName }}</h3>
        <p class="muted">{{ authState.user.audience === 'talent' ? '人才账号' : '企业账号' }} · {{ authState.user.mobile }}</p>
        <AccountStatusPanel
          v-if="currentStatusModel.items.length"
          :model="currentStatusModel"
          eyebrow="工作台状态"
          @action="handleStatusAction"
        />
        <div class="toolbar">
          <button class="button-primary" type="button" @click="continueWithCurrent">{{ continueLabel }}</button>
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
            {{ authState.loading ? '登录中...' : '登录并继续' }}
          </button>
        </div>
      </form>

      <div v-if="resultMessage" class="result-card stack-sm">
        <span class="eyebrow">当前状态</span>
        <h3>{{ resultTitle }}</h3>
        <p class="muted">{{ resultMessage }}</p>
      </div>

      <div class="panel-header">
        <div>
          <span class="eyebrow">还没有账号？</span>
          <p class="muted">先注册，再进入对应角色的后续设置流程。</p>
        </div>
        <button class="button-secondary" type="button" @click="goToRegister">去注册</button>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AccountStatusPanel from './AccountStatusPanel.vue';
import { loginWithAccount, signOut, useAuthState } from '../stores/auth';
import { roleRouteMap } from '../utils/roleRoutes';
import { buildUpworkFirstAccountStatus } from '../utils/upworkFirstAccountStatus';

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
const currentStatusModel = computed(() =>
  buildUpworkFirstAccountStatus(authState.user, authState.user?.audience || audience.value)
);
const continueLabel = computed(() =>
  currentStatusModel.value.hasBlockingItems || !currentStatusModel.value.approved ? '继续完善账号' : '回到工作台'
);

const continueRoute = computed(() => {
  const user = authState.user;
  if (!user) {
    return '/';
  }
  return currentStatusModel.value.hasBlockingItems || !currentStatusModel.value.approved
    ? user.onboardingRoute || (user.audience === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding)
    : user.homeRoute || (user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home);
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
  resultMessage.value = '你可以登录其他账号，或先创建一个新账号。';
}

async function handleLogin() {
  const result = await loginWithAccount({
    audience: audience.value,
    mobile: mobile.value,
    password: password.value
  });

  if (!result?.success) {
    resultTitle.value = '登录失败';
    resultMessage.value = result?.message || '请检查账号、目标页面和密码后再试。';
    return;
  }

  resultTitle.value = '已登录';
  resultMessage.value = result.nextStep || '当前账号已识别，正在进入对应页面。';
  const nextStatus = buildUpworkFirstAccountStatus(result.user, result.user?.audience || audience.value);
  if (nextStatus.hasBlockingItems || !nextStatus.approved) {
    return;
  }
  await router.replace(targetRoute(result.user));
}

async function goToRegister() {
  await router.push(roleRouteMap.portal.register(audience.value));
}

async function handleStatusAction(item) {
  if (!item?.actionTo || item.disabled) {
    return;
  }
  await router.push(item.actionTo);
}
</script>

<style scoped>
</style>
