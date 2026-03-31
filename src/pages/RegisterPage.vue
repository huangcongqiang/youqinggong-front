<template>
  <section class="register-entry-page">
    <div class="register-entry-shell">
      <header class="register-entry-head">
        <span class="register-entry-mark">有轻工</span>
        <div class="register-entry-copy stack-xs">
          <span class="entry-kicker">{{ audience === 'talent' ? '人才入口' : '企业入口' }}</span>
          <h1 class="register-entry-title">{{ entryTitle }}</h1>
          <p class="muted">{{ entryLead }}</p>
        </div>
      </header>

      <article class="glass-panel register-entry-card stack-lg">
        <div class="register-progress">
          <span
            v-for="item in registerSteps"
            :key="item.id"
            class="register-progress-item"
            :class="{ 'is-active': step === item.id, 'is-done': step > item.id }"
          >
            <span class="register-progress-index">0{{ item.id }}</span>
            <span class="register-progress-label">{{ item.title }}</span>
          </span>
        </div>

        <div class="register-stage stack-lg">
          <template v-if="step === 1">
            <div class="register-role-grid">
              <button
                type="button"
                class="register-role-card"
                :class="{ 'is-active': audience === 'enterprise' }"
                @click="setAudience('enterprise')"
              >
                <div class="register-role-topline">
                  <span class="register-role-chip">企业</span>
                  <span class="register-role-meta">发布任务</span>
                </div>
                <div class="stack-xs">
                  <h3>企业端</h3>
                  <p class="muted">快速推进交付。</p>
                </div>
              </button>

              <button
                type="button"
                class="register-role-card"
                :class="{ 'is-active': audience === 'talent' }"
                @click="setAudience('talent')"
              >
                <div class="register-role-topline">
                  <span class="register-role-chip">人才</span>
                  <span class="register-role-meta">接任务</span>
                </div>
                <div class="stack-xs">
                  <h3>人才端</h3>
                  <p class="muted">沉淀作品与收入。</p>
                </div>
              </button>
            </div>
          </template>

          <template v-else-if="step === 2">
            <div class="register-stage-lead stack-xs">
              <strong>{{ audience === 'enterprise' ? '填写企业账号' : '填写人才账号' }}</strong>
              <p class="muted">先录基础信息，资料后补。</p>
            </div>

            <div class="register-audience-row">
              <span class="soft-pill is-info">{{ audience === 'talent' ? '人才端' : '企业端' }}</span>
              <span v-if="audience === 'talent' && talentHeadline" class="soft-pill">{{ talentHeadline }}</span>
            </div>

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
                <label>当前专业方向</label>
                <div class="register-skill-grid">
                  <button
                    v-for="skill in talentSkillOptions"
                    :key="skill"
                    type="button"
                    class="register-skill-chip"
                    :class="{ 'is-active': selectedSkills.includes(skill) }"
                    @click="toggleSkill(skill)"
                  >
                    {{ skill }}
                  </button>
                  <button
                    type="button"
                    class="register-skill-chip register-skill-chip-custom"
                    :class="{ 'is-active': customSkillEnabled }"
                    @click="toggleCustomSkill"
                  >
                    自定义专业
                  </button>
                </div>
                <input
                  v-if="customSkillEnabled"
                  id="register-custom-skill"
                  v-model="customSkill"
                  class="text-input"
                  placeholder="填写你的专业方向"
                />
              </div>

              <div class="form-field">
                <label for="register-mobile">手机号</label>
                <input id="register-mobile" v-model="mobile" class="text-input" placeholder="请输入手机号" />
              </div>

              <div class="form-field">
                <label for="register-password">密码</label>
                <input id="register-password" v-model="password" type="password" class="text-input" placeholder="请输入密码" />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="register-stage-lead stack-xs">
              <strong>确认创建</strong>
              <p class="muted">创建后直接进入对应角色的入驻流程。</p>
            </div>

            <div class="register-summary-card">
              <div class="register-summary-row">
                <span>注册角色</span>
                <strong>{{ audience === 'talent' ? '人才端' : '企业端' }}</strong>
              </div>
              <div class="register-summary-row">
                <span>{{ audience === 'talent' ? '对外名称' : '企业名称' }}</span>
                <strong>{{ displayName || '待填写' }}</strong>
              </div>
              <div class="register-summary-row">
                <span>手机号</span>
                <strong>{{ mobile || '待填写' }}</strong>
              </div>
              <div v-if="audience === 'talent'" class="register-summary-row">
                <span>专业方向</span>
                <strong>{{ talentHeadline || '待填写' }}</strong>
              </div>
            </div>
          </template>

          <div v-if="resultMessage" class="result-card register-feedback">
            <strong>{{ resultTitle }}</strong>
            <p class="muted">{{ resultMessage }}</p>
          </div>
        </div>

        <div class="register-actions">
          <button v-if="step > 1" class="button-secondary register-actions-secondary" type="button" @click="previousStep">
            返回
          </button>
          <button
            v-if="step < registerSteps.length"
            class="button-primary"
            type="button"
            :disabled="!isStepValid"
            @click="nextStep"
          >
            下一步
          </button>
          <button
            v-else
            class="button-primary"
            type="button"
            :disabled="!canSubmit || authState.loading"
            @click="handleRegister"
          >
            {{ authState.loading ? '创建中...' : '创建账号并继续' }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { registerWithAccount, useAuthState } from '../stores/auth';
import { buildRegisterHeadline, buildRegisterSkills, talentSkillOptions } from '../utils/registerSkills';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();

const registerSteps = [
  { id: 1, title: '选择角色', note: '先确认身份' },
  { id: 2, title: '填写账号', note: '只录基础信息' },
  { id: 3, title: '确认创建', note: '创建后进入入驻' }
];

const step = ref(1);
const audience = ref(route.query.audience === 'talent' ? 'talent' : 'enterprise');
const displayName = ref('');
const selectedSkills = ref([]);
const customSkillEnabled = ref(false);
const customSkill = ref('');
const mobile = ref('');
const password = ref('');
const resultTitle = ref('');
const resultMessage = ref('');

const talentRegisterSkills = computed(() =>
  buildRegisterSkills(selectedSkills.value, customSkill.value, customSkillEnabled.value)
);
const talentHeadline = computed(() => buildRegisterHeadline(talentRegisterSkills.value));
const currentStep = computed(() => registerSteps[step.value - 1] || registerSteps[0]);

const entryTitle = computed(() => {
  if (step.value === 1) {
    return '创建账号';
  }
  if (step.value === 2) {
    return '填写基础信息';
  }
  return '确认并继续';
});

const entryLead = computed(() => {
  if (step.value === 1) {
    return '先做一个身份选择。';
  }
  if (step.value === 2) {
    return '只录基础信息，资料后补。';
  }
  return '确认无误后创建账号。';
});

const isStepValid = computed(() => {
  if (step.value === 1) {
    return Boolean(audience.value);
  }
  if (step.value === 2) {
    return Boolean(
      displayName.value
      && mobile.value
      && password.value
      && (audience.value === 'enterprise' || talentRegisterSkills.value.length)
    );
  }
  return true;
});

const canSubmit = computed(() => Boolean(
  displayName.value
  && mobile.value
  && password.value
  && (audience.value === 'enterprise' || talentRegisterSkills.value.length)
));

watch(
  () => route.query.audience,
  (nextAudience) => {
    audience.value = nextAudience === 'talent' ? 'talent' : 'enterprise';
  }
);

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

function toggleSkill(skill) {
  if (selectedSkills.value.includes(skill)) {
    selectedSkills.value = selectedSkills.value.filter((item) => item !== skill);
    return;
  }
  selectedSkills.value = [...selectedSkills.value, skill];
}

function toggleCustomSkill() {
  customSkillEnabled.value = !customSkillEnabled.value;
  if (!customSkillEnabled.value) {
    customSkill.value = '';
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

async function handleRegister() {
  const result = await registerWithAccount({
    audience: audience.value,
    displayName: displayName.value,
    organizationName: audience.value === 'enterprise' ? displayName.value : '',
    headline: audience.value === 'talent' ? talentHeadline.value : '',
    skills: audience.value === 'talent' ? talentRegisterSkills.value : [],
    mobile: mobile.value,
    password: password.value
  });

  if (!result?.success) {
    resultTitle.value = '注册失败';
    resultMessage.value = result?.requestError || result?.message || '请检查输入后重试。';
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

<style scoped>
.register-entry-page {
  min-height: calc(100vh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
}

.register-entry-shell {
  width: min(440px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 12px;
  padding-top: clamp(24px, 8vh, 56px);
}

.register-entry-head {
  display: grid;
  gap: 8px;
}

.register-entry-mark {
  color: var(--text-strong);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.05em;
}

.register-entry-title {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(30px, 9vw, 40px);
  line-height: 0.98;
  letter-spacing: -0.06em;
}

.register-entry-card {
  padding: 16px;
  border-radius: 26px;
}

.register-progress {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.register-progress-item {
  display: grid;
  gap: 3px;
  padding: 9px 10px;
  border-radius: 14px;
  border: 1px solid rgba(120, 190, 255, 0.12);
  background: rgba(8, 15, 28, 0.58);
  color: var(--text-soft);
}

.register-progress-item.is-active {
  border-color: rgba(57, 196, 255, 0.28);
  background: linear-gradient(180deg, rgba(16, 42, 86, 0.92), rgba(9, 19, 35, 0.92));
  color: var(--text-strong);
}

.register-progress-item.is-done {
  border-color: rgba(40, 211, 155, 0.22);
  background: rgba(10, 28, 28, 0.62);
}

.register-progress-index {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.register-progress-label {
  font-size: 11px;
  font-weight: 600;
}

.register-stage-lead strong {
  color: var(--text-strong);
  font-size: 18px;
  line-height: 1.2;
}

.register-role-grid {
  display: grid;
  gap: 8px;
}

.register-role-card {
  display: grid;
  justify-items: start;
  gap: 7px;
  width: 100%;
  min-height: 88px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  background: rgba(8, 15, 28, 0.7);
  color: inherit;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.register-role-card:hover {
  transform: translateY(-1px);
}

.register-role-card.is-active {
  border-color: rgba(57, 196, 255, 0.32);
  background: linear-gradient(180deg, rgba(14, 42, 86, 0.92), rgba(9, 19, 35, 0.94));
}

.register-role-chip {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.72);
  border: 1px solid rgba(120, 190, 255, 0.12);
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.register-role-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.register-role-meta {
  color: var(--text-faint);
  font-size: 11px;
  font-weight: 600;
}

.register-role-card h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 17px;
  line-height: 1.1;
}

.register-role-card p {
  margin: 0;
  line-height: 1.45;
}

.register-audience-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.register-skill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.register-skill-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid var(--line-soft);
  background: rgba(8, 15, 28, 0.72);
  color: var(--text-main);
  font-size: 13px;
  font-weight: 600;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.register-skill-chip:hover {
  transform: translateY(-1px);
}

.register-skill-chip.is-active {
  border-color: rgba(86, 226, 255, 0.36);
  background: linear-gradient(180deg, rgba(13, 46, 88, 0.92), rgba(9, 22, 42, 0.96));
  color: var(--text-strong);
}

.register-skill-chip-custom {
  border-style: dashed;
}

#register-custom-skill {
  margin-top: 10px;
}

.register-summary-card {
  display: grid;
  padding: 4px 16px;
  border-radius: 20px;
  border: 1px solid rgba(120, 190, 255, 0.12);
  background: rgba(8, 15, 28, 0.56);
}

.register-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line-soft);
}

.register-summary-row:last-child {
  border-bottom: none;
}

.register-summary-row span {
  color: var(--text-soft);
}

.register-summary-row strong {
  color: var(--text-strong);
  text-align: right;
  line-height: 1.5;
}

.register-feedback {
  gap: 6px;
}

.register-actions {
  display: flex;
  gap: 10px;
}

.register-actions > * {
  flex: 1 1 0;
}

.register-actions-secondary {
  max-width: 112px;
}

@media (max-width: 640px) {
  .register-entry-page {
    min-height: auto;
  }

  .register-entry-shell {
    width: 100%;
    padding-top: clamp(18px, 7vh, 32px);
  }

  .register-progress {
    grid-template-columns: 1fr;
  }

  .register-actions {
    flex-direction: column;
  }

  .register-actions-secondary {
    max-width: none;
  }
}
</style>
