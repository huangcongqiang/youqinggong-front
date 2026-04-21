<template>
  <section class="portal-register-shell">
    <header class="portal-register-topbar">
      <router-link class="portal-register-brand" to="/">
        <span class="portal-register-brand__mark">轻</span>
        <span class="portal-register-brand__text">有轻功</span>
      </router-link>

      <div class="portal-register-topbar__actions">
        <span class="portal-register-topbar__hint">已经有账号？</span>
        <button class="portal-register-link-button" type="button" @click="openLoginModal">去登录</button>
      </div>
    </header>

    <main class="portal-register-stage">
      <article class="portal-register-card">
        <div class="portal-register-card__eyebrow">账号创建</div>

        <div class="portal-register-stepper" role="tablist" aria-label="注册步骤">
          <button
            v-for="stepItem in registerSteps"
            :key="stepItem.id"
            type="button"
            class="portal-register-stepper__item"
            :class="registerStepClass(stepItem.id)"
            @click="jumpStep(stepItem.id)"
          >
            <span class="portal-register-stepper__index">{{ stepItem.id }}</span>
            <div>
              <strong>{{ stepItem.title }}</strong>
              <small>{{ stepItem.note }}</small>
            </div>
          </button>
        </div>

        <div class="portal-register-header">
          <div>
            <h1>{{ currentStepTitle }}</h1>
            <p>{{ currentStepLead }}</p>
          </div>
          <span class="portal-register-audience-pill">当前：{{ audience === 'talent' ? '人才' : '企业' }}</span>
        </div>

        <article v-if="authState.user" class="portal-register-current-account">
          <div class="portal-register-current-account__header">
            <div>
              <span class="portal-register-current-account__eyebrow">当前已登录</span>
              <h2>{{ authState.user.displayName }}</h2>
              <p>{{ currentAccountMeta }}</p>
            </div>
            <span class="portal-register-audience-pill">{{ continueLabel }}</span>
          </div>

          <AccountStatusPanel
            v-if="currentStatusModel.items.length"
            :model="currentStatusModel"
            eyebrow="注册后状态"
            @action="handleStatusAction"
          />

          <div class="portal-register-actions">
            <router-link class="button-primary" :to="continueRoute">进入当前账号</router-link>
            <button class="button-secondary" type="button" @click="handleLogout">退出登录</button>
          </div>
        </article>

        <template v-else>
          <section v-if="step === 1" class="portal-register-role-section">
            <div class="portal-register-role-grid">
              <button
                type="button"
                class="portal-register-role-card"
                :class="{ 'is-active': audience === 'enterprise' }"
                @click="setAudience('enterprise')"
              >
                <span class="portal-register-role-card__eyebrow">企业</span>
                <h3>企业端</h3>
                <p>发布任务、筛选人才、推进协作，并把验收和账单都留在同一条工作链上。</p>
                <strong>{{ audience === 'enterprise' ? '当前已选择' : '切换到企业端' }}</strong>
              </button>

              <button
                type="button"
                class="portal-register-role-card"
                :class="{ 'is-active': audience === 'talent' }"
                @click="setAudience('talent')"
              >
                <span class="portal-register-role-card__eyebrow">人才</span>
                <h3>人才端</h3>
                <p>找任务、提交申请、协作交付，并持续跟进收入、结算和后续合作。</p>
                <strong>{{ audience === 'talent' ? '当前已选择' : '切换到人才端' }}</strong>
              </button>
            </div>
          </section>

          <section v-else-if="step === 2" class="portal-register-form-section">
            <div class="portal-register-form-grid">
              <div class="portal-register-field portal-register-field--full">
                <label :for="audience === 'enterprise' ? 'register-name' : 'register-display-name'">
                  {{ audience === 'enterprise' ? '企业名称 / 品牌名称' : '显示名称' }}
                </label>
                <input
                  :id="audience === 'enterprise' ? 'register-name' : 'register-display-name'"
                  v-model="displayName"
                  class="portal-register-input"
                  :placeholder="audience === 'enterprise' ? '例如：星河智能' : '例如：陈一宁'"
                />
              </div>

              <div v-if="audience === 'talent'" class="portal-register-field portal-register-field--full">
                <label>主要专业方向</label>
                <div class="portal-register-skill-editor">
                  <div class="portal-register-skill-editor__group">
                    <div class="portal-register-skill-editor__head">
                      <strong>共享预置标签</strong>
                      <span>可多选，建议优先选择</span>
                    </div>
                    <div class="portal-register-skill-grid">
                      <button
                        v-for="skill in talentSkillOptions"
                        :key="skill"
                        type="button"
                        class="portal-register-skill-chip"
                        :class="{ 'is-active': selectedSkills.includes(skill) }"
                        @click="toggleSkill(skill)"
                      >
                        {{ skill }}
                      </button>
                    </div>
                  </div>

                  <div class="portal-register-skill-editor__group">
                    <div class="portal-register-skill-editor__head">
                      <strong>自定义补充标签</strong>
                      <span>用于补充更细的方向</span>
                    </div>
                    <div class="portal-register-custom-row">
                      <input
                        id="register-custom-skill"
                        v-model.trim="customSkillInput"
                        class="portal-register-input"
                        placeholder="例如：商业插画、品牌策划、短视频脚本"
                        @keydown.enter.prevent="addCustomSkill"
                      />
                      <button type="button" class="button-secondary" @click="addCustomSkill">添加</button>
                    </div>
                    <div v-if="customSkills.length" class="portal-register-custom-list">
                      <button
                        v-for="skill in customSkills"
                        :key="skill"
                        type="button"
                        class="portal-register-skill-chip portal-register-skill-chip--custom is-active"
                        @click="removeCustomSkill(skill)"
                      >
                        {{ skill }} <span>×</span>
                      </button>
                    </div>
                  </div>
                </div>
                <p class="portal-register-field__hint">建议先选 1 到 4 个共享标签，再补充 0 到 3 个自定义标签。</p>
              </div>

              <div class="portal-register-field">
                <label for="register-mobile">手机号</label>
                <input
                  id="register-mobile"
                  v-model="mobile"
                  class="portal-register-input"
                  inputmode="numeric"
                  autocomplete="tel"
                  placeholder="例如：13800000011"
                />
              </div>

              <div class="portal-register-field">
                <label for="register-password">密码</label>
                <input
                  id="register-password"
                  v-model="password"
                  type="password"
                  class="portal-register-input"
                  autocomplete="new-password"
                  placeholder="至少 6 位，建议使用字母和数字组合"
                />
              </div>
            </div>
          </section>

          <section v-else class="portal-register-review-section">
            <div class="portal-register-summary-list">
              <div class="portal-register-summary-row">
                <span>角色</span>
                <strong>{{ audience === 'talent' ? '人才' : '企业' }}</strong>
              </div>
              <div class="portal-register-summary-row">
                <span>{{ audience === 'talent' ? '显示名称' : '企业名称' }}</span>
                <strong>{{ displayName || '待填写' }}</strong>
              </div>
              <div class="portal-register-summary-row">
                <span>手机号</span>
                <strong>{{ mobile || '待填写' }}</strong>
              </div>
              <div v-if="audience === 'talent'" class="portal-register-summary-row">
                <span>专业方向</span>
                <strong>{{ headline || '待填写' }}</strong>
              </div>
            </div>

            <article class="portal-register-note-card">
              <span class="portal-register-note-card__eyebrow">接下来会发生什么</span>
              <p>
                {{ audience === 'talent'
                  ? '接下来会进入人才设置，继续补充技能、作品、可用时间和认证资料。'
                  : '接下来会进入企业设置，继续补充联系人、招聘偏好和企业资料。' }}
              </p>
            </article>

            <article
              v-if="resultMessage"
              class="portal-register-feedback"
              :class="{
                'is-error': resultTitle === '注册失败' || resultTitle === '账号已存在',
                'is-success': resultTitle === '账号已创建'
              }"
            >
              <span class="portal-register-feedback__eyebrow">当前状态</span>
              <h3>{{ resultTitle }}</h3>
              <p>{{ resultMessage }}</p>
              <div v-if="resultActionRoute" class="portal-register-actions">
                <router-link class="button-secondary" :to="resultActionRoute">{{ resultActionLabel }}</router-link>
              </div>
            </article>
          </section>

          <footer class="portal-register-actions portal-register-actions--footer">
            <button v-if="step > 1" class="button-secondary" type="button" @click="previousStep">返回</button>

            <button
              v-if="step < registerSteps.length"
              class="button-primary"
              type="button"
              :disabled="!isStepValid"
              @click="nextStep"
            >
              下一步
            </button>

            <router-link
              v-else-if="resultActionRoute"
              class="button-primary"
              :to="resultActionRoute"
            >
              {{ resultActionLabel }}
            </router-link>

            <button
              v-else
              class="button-primary"
              type="button"
              :disabled="!canSubmit || authState.loading"
              @click="handleRegister"
            >
              {{ authState.loading ? '创建中…' : '创建账号并继续' }}
            </button>
          </footer>
        </template>
      </article>
    </main>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AccountStatusPanel from '../components/AccountStatusPanel.vue';
import { registerWithAccount, signOut, useAuthState } from '../stores/auth';
import { buildRegisterHeadline, buildRegisterSkillPayload, splitCustomSkillInput, talentSkillOptions } from '../utils/registerSkills';
import { roleRouteMap } from '../utils/roleRoutes';
import { buildUpworkFirstAccountStatus } from '../utils/upworkFirstAccountStatus';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();

const registerSteps = [
  { id: 1, title: '选择角色', note: '先确定企业或人才身份' },
  { id: 2, title: '填写账号', note: '录入创建账号所需的核心信息' },
  { id: 3, title: '确认创建', note: '创建后继续进入对应设置流程' }
];

const step = ref(1);
const audience = ref(route.query.audience === 'talent' ? 'talent' : 'enterprise');
const displayName = ref('');
const selectedSkills = ref([]);
const customSkills = ref([]);
const customSkillInput = ref('');
const mobile = ref('');
const password = ref('');
const resultTitle = ref('');
const resultMessage = ref('');
const resultActionLabel = ref('');
const resultActionRoute = ref('');
const currentStatusModel = computed(() =>
  buildUpworkFirstAccountStatus(authState.user, authState.user?.audience || audience.value)
);
const talentSkillPayload = computed(() => buildRegisterSkillPayload(selectedSkills.value, customSkills.value));
const headline = computed(() => buildRegisterHeadline(talentSkillPayload.value.skills, talentSkillPayload.value.customSkills));
const hasTalentSkills = computed(() => (
  talentSkillPayload.value.skills.length + talentSkillPayload.value.customSkills.length > 0
));
const continueRoute = computed(() => {
  const user = authState.user;
  if (!user) {
    return '/';
  }
  return user.approvalStatus === 'APPROVED'
    ? user.homeRoute || (user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home)
    : user.onboardingRoute || (user.audience === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding);
});
const continueLabel = computed(() =>
  authState.user?.approvalStatus === 'APPROVED' ? '进入工作台' : '继续完善设置'
);
const currentAccountMeta = computed(() => {
  const user = authState.user;
  if (!user) {
    return '';
  }
  return `${user.audience === 'talent' ? '人才账号' : '企业账号'} · ${user.mobile || '未填写手机号'}`;
});
const currentStepTitle = computed(() => {
  if (step.value === 1) return '先选择角色';
  if (step.value === 2) return '基础账号信息';
  return '确认信息并创建账号';
});
const currentStepLead = computed(() => {
  if (step.value === 1) {
    return '先决定你是以企业身份发布任务，还是以人才身份找任务和协作。';
  }
  if (step.value === 2) {
    return '填写创建账号所需的基础信息';
  }
  return '创建完成后，会直接进入匹配的角色设置流程。';
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
      && (audience.value === 'enterprise' || hasTalentSkills.value)
    );
  }
  return true;
});

const canSubmit = computed(() => Boolean(
  displayName.value
  && mobile.value
  && password.value
  && (audience.value === 'enterprise' || hasTalentSkills.value)
));

function setAudience(nextAudience) {
  audience.value = nextAudience;
  if (nextAudience === 'enterprise') {
    selectedSkills.value = [];
    customSkills.value = [];
    customSkillInput.value = '';
  }
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

function addCustomSkill() {
  const nextSelection = buildRegisterSkillPayload(
    selectedSkills.value,
    [...customSkills.value, ...splitCustomSkillInput(customSkillInput.value)]
  );
  selectedSkills.value = nextSelection.skills;
  customSkills.value = nextSelection.customSkills;
  customSkillInput.value = '';
}

function removeCustomSkill(skill) {
  customSkills.value = customSkills.value.filter((item) => item !== skill);
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
  router.push(roleRouteMap.portal.login(audience.value, typeof route.query.redirect === 'string' ? route.query.redirect : ''));
}

async function handleLogout() {
  await signOut();
  resultTitle.value = '已退出登录';
  resultMessage.value = '你可以继续创建新账号，或重新登录已有账号。';
  resultActionLabel.value = '';
  resultActionRoute.value = '';
}

async function handleRegister() {
  resultTitle.value = '';
  resultMessage.value = '';
  resultActionLabel.value = '';
  resultActionRoute.value = '';
  const result = await registerWithAccount({
    audience: audience.value,
    displayName: displayName.value,
    organizationName: audience.value === 'enterprise' ? displayName.value : '',
    headline: audience.value === 'talent' ? headline.value : '',
    skills: audience.value === 'talent' ? talentSkillPayload.value.skills : [],
    customSkills: audience.value === 'talent' ? talentSkillPayload.value.customSkills : [],
    mobile: mobile.value,
    password: password.value
  });

  if (!result?.success) {
    const message = result?.requestError || result?.message || '请检查填写信息后重试。';
    if (message.includes('已存在') || message.includes('直接登录')) {
      resultTitle.value = '账号已存在';
      resultMessage.value = message;
      resultActionLabel.value = '去登录当前账号';
      resultActionRoute.value = roleRouteMap.portal.login(
        audience.value,
        typeof route.query.redirect === 'string' ? route.query.redirect : ''
      );
      return;
    }
    resultTitle.value = '注册失败';
    resultMessage.value = message;
    return;
  }

  resultTitle.value = '账号已创建';
  resultMessage.value = result.nextStep || '接下来可以继续进入对应角色的设置流程。';
  resultActionLabel.value = audience.value === 'talent' ? '继续进入人才设置' : '继续进入企业设置';
  resultActionRoute.value = result.user?.onboardingRoute
    || (audience.value === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding);
}

async function handleStatusAction(item) {
  if (!item?.actionTo || item.disabled) {
    return;
  }
  await router.push(item.actionTo);
}
</script>

<style scoped>
.portal-register-shell {
  min-height: 100vh;
  padding: 28px 24px 56px;
  background:
    radial-gradient(circle at top left, rgba(20, 168, 0, 0.12), transparent 32%),
    linear-gradient(180deg, #f7f8f4 0%, #fdfdf9 34%, #f5f6f2 100%);
}

.portal-register-topbar {
  width: min(1120px, 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 6px 0 28px;
}

.portal-register-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #181818;
  text-decoration: none;
  font-weight: 700;
}

.portal-register-brand__mark {
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

.portal-register-brand__text {
  font-size: 18px;
  letter-spacing: -0.02em;
}

.portal-register-topbar__actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #5e6b5a;
  font-size: 14px;
}

.portal-register-topbar__hint {
  color: #6b7564;
}

.portal-register-link-button {
  border: 0;
  background: transparent;
  padding: 0;
  color: #108a00;
  font-weight: 700;
  cursor: pointer;
}

.portal-register-link-button:hover {
  text-decoration: underline;
}

.portal-register-stage {
  width: min(1120px, 100%);
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.portal-register-card {
  width: min(760px, 100%);
  padding: 38px 40px 34px;
  border-radius: 24px;
  border: 1px solid rgba(20, 24, 18, 0.08);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 48px rgba(16, 24, 40, 0.08);
  display: grid;
  gap: 22px;
}

.portal-register-card__eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #657160;
}

.portal-register-stepper {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.portal-register-stepper__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(20, 24, 18, 0.08);
  background: #f7f8f4;
  text-align: left;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.portal-register-stepper__item.is-active {
  border-color: rgba(16, 138, 0, 0.18);
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.portal-register-stepper__item.is-complete {
  background: #f2f8eb;
}

.portal-register-stepper__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #e8efe0;
  color: #4a5547;
  font-size: 13px;
  font-weight: 800;
}

.portal-register-stepper__item.is-active .portal-register-stepper__index,
.portal-register-stepper__item.is-complete .portal-register-stepper__index {
  background: #108a00;
  color: #ffffff;
}

.portal-register-stepper__item strong {
  display: block;
  color: #1b231a;
  font-size: 15px;
  margin-bottom: 4px;
}

.portal-register-stepper__item small {
  display: block;
  color: #6a7565;
  font-size: 12px;
  line-height: 1.45;
}

.portal-register-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 18px;
}

.portal-register-header h1 {
  margin: 0 0 10px;
  font-size: clamp(38px, 5vw, 54px);
  line-height: 0.98;
  letter-spacing: -0.06em;
  color: #182018;
}

.portal-register-header p {
  margin: 0;
  max-width: 540px;
  font-size: 16px;
  line-height: 1.7;
  color: #5f695c;
}

.portal-register-audience-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  padding: 9px 14px;
  border-radius: 999px;
  background: #eef4e6;
  color: #41513e;
  font-size: 13px;
  font-weight: 700;
}

.portal-register-current-account,
.portal-register-note-card,
.portal-register-feedback {
  display: grid;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 20px;
  border: 1px solid rgba(20, 24, 18, 0.08);
  background: linear-gradient(180deg, #f8faf4 0%, #ffffff 100%);
}

.portal-register-current-account__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}

.portal-register-current-account__eyebrow,
.portal-register-note-card__eyebrow,
.portal-register-feedback__eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6f7969;
}

.portal-register-current-account__header h2,
.portal-register-feedback h3 {
  margin: 6px 0 0;
  color: #182018;
}

.portal-register-current-account__header p,
.portal-register-note-card p,
.portal-register-feedback p {
  margin: 0;
  color: #5d6657;
  font-size: 14px;
  line-height: 1.65;
}

.portal-register-role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.portal-register-role-card {
  display: grid;
  gap: 14px;
  padding: 24px;
  position: relative;
  border-radius: 22px;
  border: 1px solid rgba(20, 24, 18, 0.08);
  background: linear-gradient(180deg, #fbfcf9 0%, #ffffff 100%);
  text-align: left;
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease, background 0.18s ease;
}

.portal-register-role-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.portal-register-role-card.is-active {
  transform: translateY(-1px);
  border-color: rgba(16, 138, 0, 0.32);
  background: linear-gradient(180deg, #f3fbef 0%, #ffffff 100%);
  box-shadow: 0 18px 34px rgba(16, 138, 0, 0.12);
}

.portal-register-role-card.is-active::after {
  content: '已选';
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #108a00;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.portal-register-role-card__eyebrow {
  font-size: 12px;
  font-weight: 700;
  color: #6f7969;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.portal-register-role-card.is-active .portal-register-role-card__eyebrow {
  color: #108a00;
}

.portal-register-role-card h3 {
  margin: 0;
  font-size: 28px;
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: #182018;
}

.portal-register-role-card.is-active h3 {
  color: #0f5132;
}

.portal-register-role-card p,
.portal-register-role-card strong {
  margin: 0;
}

.portal-register-role-card p {
  color: #5e6959;
  line-height: 1.7;
}

.portal-register-role-card strong {
  color: #6a7566;
  font-weight: 800;
}

.portal-register-role-card.is-active strong {
  color: #108a00;
}

.portal-register-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.portal-register-field {
  display: grid;
  gap: 10px;
}

.portal-register-field--full {
  grid-column: 1 / -1;
}

.portal-register-field label {
  font-size: 14px;
  font-weight: 700;
  color: #1f2a1d;
}

.portal-register-input {
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid rgba(20, 24, 18, 0.12);
  background: #ffffff;
  color: #182018;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.portal-register-input::placeholder {
  color: #9ba498;
}

.portal-register-input:focus {
  outline: none;
  border-color: #108a00;
  box-shadow: 0 0 0 4px rgba(16, 138, 0, 0.12);
}

.portal-register-field__hint {
  margin: 0;
  color: #6b7564;
  font-size: 12px;
}

.portal-register-skill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.portal-register-skill-chip {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(16, 138, 0, 0.14);
  background: #f7fbf2;
  color: #31402f;
  font-weight: 700;
  transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.portal-register-skill-chip.is-active {
  border-color: rgba(16, 138, 0, 0.28);
  background: #eaf6df;
  color: #108a00;
}

.portal-register-summary-list {
  display: grid;
  gap: 0;
  border: 1px solid rgba(20, 24, 18, 0.08);
  border-radius: 20px;
  overflow: hidden;
}

.portal-register-summary-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 18px;
  background: #ffffff;
  border-bottom: 1px solid rgba(20, 24, 18, 0.06);
}

.portal-register-summary-row:last-child {
  border-bottom: 0;
}

.portal-register-summary-row span {
  color: #677264;
}

.portal-register-summary-row strong {
  color: #1a2218;
  text-align: right;
}

.portal-register-feedback.is-error {
  background: #fff7f5;
  border-color: rgba(199, 14, 5, 0.14);
}

.portal-register-feedback.is-success {
  background: #f3fbef;
  border-color: rgba(16, 138, 0, 0.14);
}

.portal-register-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.portal-register-actions--footer {
  padding-top: 4px;
}

@media (max-width: 820px) {
  .portal-register-stepper,
  .portal-register-role-grid,
  .portal-register-form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .portal-register-shell {
    padding: 18px 16px 40px;
  }

  .portal-register-topbar {
    flex-direction: column;
    align-items: flex-start;
    padding-bottom: 20px;
  }

  .portal-register-card {
    padding: 28px 22px 24px;
  }

  .portal-register-header h1 {
    font-size: 38px;
  }
}
  .portal-register-skill-editor {
    display: grid;
    gap: 18px;
  }

  .portal-register-skill-editor__group {
    display: grid;
    gap: 12px;
  }

  .portal-register-skill-editor__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 14px;
  }

  .portal-register-skill-editor__head strong {
    font-size: 14px;
    color: #1b2317;
  }

  .portal-register-skill-editor__head span {
    color: #6b7567;
    font-size: 12px;
  }

  .portal-register-custom-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .portal-register-custom-row .portal-register-input {
    flex: 1 1 auto;
    min-width: 0;
  }

  .portal-register-custom-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
</style>
