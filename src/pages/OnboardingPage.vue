<template>
  <section class="page-stack onboarding-page">
    <article class="glass-panel stack-sm onboarding-shell onboarding-shell-hero">
      <SectionTitle eyebrow="入驻" :title="mode === 'business' ? '企业入驻' : '人才入驻'" tag="h1" />
      <div class="chip-row">
        <router-link
          class="button-secondary"
          :class="{ 'is-active-tab': mode === 'business' }"
          to="/enterprise/onboarding"
        >
          企业入驻
        </router-link>
        <router-link
          class="button-secondary"
          :class="{ 'is-active-tab': mode === 'talent' }"
          to="/talent/onboarding"
        >
          人才入驻
        </router-link>
      </div>
    </article>

    <template v-if="mode === 'business'">
      <article class="glass-panel stack-md onboarding-shell">
        <div class="panel-header panel-header-top">
          <div>
            <span class="eyebrow">第 {{ businessStep }} 步</span>
            <h2>{{ activeBusinessStep.title }}</h2>
          </div>
        </div>

        <div class="publish-stepper onboarding-stepper">
          <button
            v-for="step in businessSteps"
            :key="step.id"
            type="button"
            class="publish-stepper-item"
            :class="businessStepClass(step.id)"
            @click="jumpBusinessStep(step.id)"
          >
            <span class="publish-stepper-index">{{ step.id }}</span>
            <strong>{{ step.title }}</strong>
          </button>
        </div>

        <article class="mini-card stack-sm onboarding-step-summary">
          <div class="title-line">
            <div>
              <span class="eyebrow">当前办理</span>
              <h3>{{ activeBusinessStep.title }}</h3>
            </div>
            <span class="soft-pill">{{ businessStep }} / {{ businessSteps.length }}</span>
          </div>
          <p class="muted">{{ activeBusinessStep.note }}</p>
        </article>

        <article class="mini-card stack-md onboarding-step-panel">
          <template v-if="businessStep === 1">
            <SectionTitle eyebrow="第 1 步" title="基本信息" />

            <div class="form-field">
              <label for="org-name">企业名称</label>
              <input
                id="org-name"
                v-model="businessForm.organizationName"
                class="text-input"
                placeholder="例如：星河智能"
              />
            </div>

            <div class="form-field">
              <label for="org-type">类型</label>
              <select id="org-type" v-model="businessForm.virtualCompany" class="select-input">
                <option :value="false">企业入驻</option>
                <option :value="true">个人经营者 / 虚拟企业</option>
              </select>
            </div>

            <div class="form-field">
              <label for="project-focus">任务方向</label>
              <textarea
                id="project-focus"
                v-model="businessForm.projectFocus"
                class="textarea onboarding-textarea"
                placeholder="例如：AI 产品 MVP、品牌官网改版、中后台重构、自动化方案设计"
              ></textarea>
            </div>
          </template>

          <template v-else-if="businessStep === 2">
            <SectionTitle eyebrow="第 2 步" title="联系人与偏好" />

            <div class="form-field">
              <label for="contact-name">联系人</label>
              <input
                id="contact-name"
                v-model="businessForm.contactName"
                class="text-input"
                placeholder="例如：王晴"
              />
            </div>

            <div class="form-field">
              <label for="contact-mobile">手机号</label>
              <input
                id="contact-mobile"
                v-model="businessForm.contactMobile"
                class="text-input"
                placeholder="例如：13800000001"
              />
            </div>

            <div class="form-field">
              <label for="contact-role">职位</label>
              <input
                id="contact-role"
                v-model="businessForm.contactRole"
                class="text-input"
                placeholder="例如：创始人 / 项目负责人 / 品牌主理人"
              />
            </div>

            <div class="form-field">
              <label>合作偏好</label>
              <div class="onboarding-option-grid">
                <button
                  v-for="option in businessPreferenceOptions"
                  :key="option"
                  type="button"
                  class="onboarding-option-chip"
                  :class="{ 'is-active-tab': businessForm.collaborationPreferences.includes(option) }"
                  @click="toggleBusinessPreference(option)"
                >
                  {{ option }}
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="businessStep === 3">
            <SectionTitle eyebrow="第 3 步" title="确认信息" />

            <div class="onboarding-summary-list">
              <div class="onboarding-summary-row">
                <span>企业名称</span>
                <strong>{{ businessForm.organizationName || '待填写' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>类型</span>
                <strong>{{ businessForm.virtualCompany ? '虚拟企业' : '企业入驻' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>联系人</span>
                <strong>{{ businessForm.contactName || '待填写' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>手机号</span>
                <strong>{{ businessForm.contactMobile || '待填写' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>职位</span>
                <strong>{{ businessForm.contactRole || '待填写' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>合作偏好</span>
                <strong>{{ businessPreferenceSummary }}</strong>
              </div>
            </div>
          </template>

          <template v-else>
            <SectionTitle eyebrow="第 4 步" title="资料上传" />

            <article class="mini-card stack-md onboarding-upload-box">
              <input
                ref="businessFileInput"
                id="business-files"
                class="onboarding-file-input"
                type="file"
                multiple
                @change="handleBusinessFilesChange"
              />

              <div class="toolbar onboarding-upload-toolbar">
                <button class="button-secondary" type="button" @click="openBusinessFilePicker">
                  选择文件
                </button>
                <span class="soft-pill">
                  {{ businessSelectedFiles.length ? `已选 ${businessSelectedFiles.length} 个文件` : '暂未选择文件' }}
                </span>
              </div>

              <div v-if="businessSelectedFiles.length" class="onboarding-upload-list">
                <span v-for="file in businessSelectedFiles" :key="file.name" class="soft-pill">
                  {{ file.name }} · {{ formatFileSize(file.size) }}
                </span>
              </div>

              <label class="onboarding-inline-check">
                <input :checked="businessDeferredMaterials" type="checkbox" @change="handleDeferredToggle($event.target.checked)" />
                <span>这次先不上传，后续在工作台补交</span>
              </label>
            </article>
          </template>
        </article>

        <article v-if="submitResult" class="result-card stack-sm">
          <h3>{{ resultTitle }}</h3>
          <p class="muted">{{ submitResult.requestError || submitResult.nextStep }}</p>
          <div v-if="!isFailedResult(submitResult)" class="toolbar">
            <router-link class="button-primary" :to="resultActionRoute">
              {{ submitResult.deferMaterials ? '补交材料' : '去工作台' }}
            </router-link>
          </div>
        </article>

        <div class="publish-step-actions">
          <button class="button-secondary" type="button" @click="previousBusinessStep" :disabled="businessStep === 1">
            上一步
          </button>

          <button
            v-if="businessStep < businessSteps.length"
            class="button-primary"
            type="button"
            :disabled="!isBusinessStepValid"
            @click="nextBusinessStep"
          >
            下一步
          </button>

          <button
            v-else
            class="button-primary"
            type="button"
            :disabled="!canSubmitBusiness || businessSubmitting"
            @click="handleBusinessSubmit"
          >
            {{ businessSubmitting ? '提交中...' : businessDeferredMaterials ? '先提交，后补' : '提交' }}
          </button>

          <button class="button-secondary" type="button" @click="resetBusinessForm">重置</button>
        </div>
      </article>
    </template>

    <template v-else>
      <article class="glass-panel stack-md onboarding-shell">
        <article class="mini-card stack-sm onboarding-talent-hero">
          <span class="eyebrow">当前办理</span>
          <h3>先填身份、技能和作品。</h3>
          <p class="muted">只保留会影响审核和匹配的关键信息。</p>
        </article>

        <form class="stack-md" @submit.prevent="handleTalentSubmit">
          <div class="form-field">
            <label for="talent-name">姓名 / 品牌名</label>
            <input id="talent-name" v-model="talentForm.displayName" class="text-input" placeholder="例如：陈一宁" />
          </div>
          <div class="form-field">
            <label for="talent-headline">擅长方向</label>
            <input id="talent-headline" v-model="talentForm.headline" class="text-input" placeholder="例如：AI 产品设计 + 全栈开发" />
          </div>
          <div class="form-field">
            <label for="talent-skills">技能标签</label>
            <textarea
              id="talent-skills"
              v-model="talentSkillsInput"
              class="textarea onboarding-textarea"
              placeholder="用逗号分隔，例如：Vue 3, Java, MySQL, AI Agent"
            ></textarea>
            <p class="muted onboarding-field-note">只填最能影响匹配的 3 到 6 个关键词即可。</p>
          </div>
          <div class="form-field">
            <label for="portfolio-urls">作品链接</label>
            <textarea
              id="portfolio-urls"
              v-model="talentPortfolioInput"
              class="textarea onboarding-textarea"
              placeholder="每行一个作品链接或作品说明"
            ></textarea>
            <p class="muted onboarding-field-note">可以先放链接或一句作品说明，后续再补完整材料。</p>
          </div>
          <div class="toolbar onboarding-form-actions">
            <button class="button-primary" type="submit">提交</button>
            <button class="button-secondary" type="button" @click="resetTalentForm">重置</button>
          </div>
        </form>

        <div v-if="submitResult" class="result-card stack-sm">
          <h3>{{ resultTitle }}</h3>
          <p class="muted">{{ submitResult.requestError || submitResult.nextStep }}</p>
          <div v-if="!isFailedResult(submitResult)" class="toolbar">
            <router-link class="button-primary" :to="resultActionRoute">
              去工作台
            </router-link>
          </div>
        </div>
      </article>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { submitBusinessOnboarding, submitTalentOnboarding } from '../services/api';
import { refreshAuthSession, useAuthState } from '../stores/auth';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();
const mode = ref('business');
const submitResult = ref(null);
const businessStep = ref(1);
const businessDeferredMaterials = ref(false);
const businessSelectedFiles = ref([]);
const businessSubmitting = ref(false);
const businessFileInput = ref(null);

const businessPreferenceOptions = [
  '优先看 AI 推荐候选人',
  '接受平台自动匹配',
  '希望先小单试合作',
  '偏好远程协作',
  '需要固定周会同步',
  '需要保密协议支持'
];

const businessSteps = [
  { id: 1, title: '基本信息', note: '先确认企业名称、类型和方向。' },
  { id: 2, title: '联系人', note: '补齐联系人和合作偏好。' },
  { id: 3, title: '确认信息', note: '再看一遍核心内容。' },
  { id: 4, title: '资料上传', note: '材料可现在上传，也可后补。' }
];

const businessForm = ref({
  organizationName: '',
  contactName: '',
  contactMobile: '',
  virtualCompany: false,
  contactRole: '',
  projectFocus: '',
  collaborationPreferences: []
});

const talentForm = ref({
  displayName: '',
  headline: ''
});
const talentSkillsInput = ref('');
const talentPortfolioInput = ref('');

const activeBusinessStep = computed(() => businessSteps.find((step) => step.id === businessStep.value) || businessSteps[0]);

const resultTitle = computed(() => {
  if (!submitResult.value) {
    return '';
  }
  if (isFailedResult(submitResult.value)) {
    return '提交失败';
  }
  if (mode.value === 'business') {
    return submitResult.value?.deferMaterials ? '基础信息已提交' : '入驻申请已提交';
  }
  return '入驻申请已提交';
});

const resultActionRoute = computed(() =>
  mode.value === 'business' ? roleRouteMap.enterprise.home : roleRouteMap.talent.home
);

const businessMaterialChecklist = computed(() => {
  if (businessForm.value.virtualCompany) {
    return ['身份证正反面', '实名手持证件照', '虚拟企业申请说明', '个人品牌或业务证明'];
  }
  return ['营业执照或企业证明', '联系人名片或授权说明', '品牌介绍或业务范围说明', '合作偏好勾选结果'];
});

const businessUploadedNames = computed(() => businessSelectedFiles.value.map((file) => file.name).filter(Boolean));
const businessPreferenceSummary = computed(() =>
  businessForm.value.collaborationPreferences.length
    ? businessForm.value.collaborationPreferences.join(' / ')
    : '未选择'
);

const isBusinessStepValid = computed(() => {
  if (businessStep.value === 1) {
    return Boolean(businessForm.value.organizationName.trim());
  }
  if (businessStep.value === 2) {
    return Boolean(
      businessForm.value.contactName.trim()
      && businessForm.value.contactMobile.trim()
      && businessForm.value.collaborationPreferences.length
    );
  }
  if (businessStep.value === 3) {
    return true;
  }
  return businessDeferredMaterials.value || businessUploadedNames.value.length > 0;
});

const canSubmitBusiness = computed(() => isBusinessStepValid.value);

function syncModeFromRoute() {
  mode.value = route.meta.onboardingMode || 'business';
  submitResult.value = null;
  if (mode.value === 'business') {
    businessStep.value = 1;
  }
  prefillFormFromUser();
}

function prefillFormFromUser() {
  const user = authState.user;
  if (!user) {
    return;
  }

  const collaborationPreferences = Array.isArray(user.collaborationPreferences)
    ? user.collaborationPreferences
    : typeof user.collaborationPreference === 'string' && user.collaborationPreference.trim()
      ? [user.collaborationPreference.trim()]
      : [];

  if (mode.value === 'business') {
    businessForm.value = {
      organizationName: user.organizationName || user.displayName || '',
      contactName: user.contactName || '',
      contactMobile: user.contactMobile || user.mobile || '',
      virtualCompany: false,
      contactRole: user.contactRole || '',
      projectFocus: user.projectFocus || '',
      collaborationPreferences
    };
    return;
  }

  talentForm.value = {
    displayName: user.displayName || '',
    headline: user.headline || ''
  };
}

function resetBusinessForm() {
  businessForm.value = {
    organizationName: '',
    contactName: '',
    contactMobile: '',
    virtualCompany: false,
    contactRole: '',
    projectFocus: '',
    collaborationPreferences: []
  };
  businessStep.value = 1;
  businessDeferredMaterials.value = false;
  businessSelectedFiles.value = [];
  if (businessFileInput.value) {
    businessFileInput.value.value = '';
  }
}

function resetTalentForm() {
  talentForm.value = {
    displayName: '',
    headline: ''
  };
  talentSkillsInput.value = '';
  talentPortfolioInput.value = '';
}

function businessStepClass(stepId) {
  return {
    'is-active': stepId === businessStep.value,
    'is-complete': stepId < businessStep.value
  };
}

function jumpBusinessStep(stepId) {
  if (stepId <= businessStep.value) {
    businessStep.value = stepId;
  }
}

function nextBusinessStep() {
  if (!isBusinessStepValid.value || businessStep.value >= businessSteps.length) {
    return;
  }
  businessStep.value += 1;
}

function previousBusinessStep() {
  if (businessStep.value <= 1) {
    return;
  }
  businessStep.value -= 1;
}

function handleBusinessFilesChange(event) {
  const files = Array.from(event?.target?.files || []);
  businessSelectedFiles.value = files;
  if (files.length > 0) {
    businessDeferredMaterials.value = false;
  }
}

function openBusinessFilePicker() {
  businessFileInput.value?.click();
}

function handleDeferredToggle(checked) {
  businessDeferredMaterials.value = checked;
  if (checked) {
    businessSelectedFiles.value = [];
    if (businessFileInput.value) {
      businessFileInput.value.value = '';
    }
  }
}

function toggleBusinessPreference(option) {
  const selected = businessForm.value.collaborationPreferences;
  if (selected.includes(option)) {
    businessForm.value.collaborationPreferences = selected.filter((item) => item !== option);
    return;
  }
  businessForm.value.collaborationPreferences = [...selected, option];
}

function formatFileSize(size) {
  if (!size) {
    return '0 B';
  }
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${size} B`;
}

function isFailedResult(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
}

async function handleBusinessSubmit() {
  if (businessSubmitting.value) {
    return;
  }

  businessSubmitting.value = true;
  try {
    submitResult.value = await submitBusinessOnboarding({
      ...businessForm.value,
      materials: businessMaterialChecklist.value,
      deferMaterials: businessDeferredMaterials.value,
      collaborationPreferencesCsv: businessForm.value.collaborationPreferences.join('、'),
      materialNamesCsv: businessUploadedNames.value.join('、'),
      materialFiles: businessSelectedFiles.value.map((file) => ({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size || 0
      }))
    });
    if (isFailedResult(submitResult.value)) {
      return;
    }
    await refreshAuthSession();
    await router.push(submitResult.value?.nextRoute || roleRouteMap.enterprise.home);
  } finally {
    businessSubmitting.value = false;
  }
}

async function handleTalentSubmit() {
  submitResult.value = await submitTalentOnboarding({
    ...talentForm.value,
    skills: talentSkillsInput.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    portfolioUrls: talentPortfolioInput.value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  });
  if (isFailedResult(submitResult.value)) {
    return;
  }
  await refreshAuthSession();
}

onMounted(() => {
  syncModeFromRoute();
});

watch(() => route.meta.onboardingMode, syncModeFromRoute);
watch(() => authState.user, prefillFormFromUser, { deep: true });
</script>

<style scoped>
.onboarding-page {
  gap: 12px;
}

.onboarding-shell-hero {
  padding: 14px;
}

.onboarding-step-summary,
.onboarding-talent-hero {
  border: 1px solid rgba(120, 190, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(9, 18, 33, 0.88), rgba(9, 17, 30, 0.94)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.08), transparent 34%);
}

.onboarding-step-summary h3,
.onboarding-talent-hero h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 16px;
  line-height: 1.18;
  letter-spacing: -0.03em;
}

.onboarding-talent-hero .muted {
  margin: 0;
  font-size: 12px;
}

.onboarding-field-note {
  margin: 0;
  font-size: 11px;
}

.onboarding-form-actions {
  gap: 10px;
}
</style>
