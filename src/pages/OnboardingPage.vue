<template>
  <section class="page-stack onboarding-page" v-if="checklists">
    <article class="hero-card">
      <SectionTitle
        eyebrow="入驻办理"
        title="先入驻，再协作。"
        description="企业和人才共用办理流。"
        tag="h1"
      />
      <div class="chip-row">
        <router-link
          class="button-secondary"
          :class="{ 'is-active-tab': mode === 'business' }"
          to="/enterprise/onboarding"
        >
          企业 / 虚拟企业
        </router-link>
        <router-link
          class="button-secondary"
          :class="{ 'is-active-tab': mode === 'talent' }"
          to="/talent/onboarding"
        >
          人才入驻
        </router-link>
      </div>

      <div class="onboarding-flow-banner">
        <div class="stack-sm">
          <span class="eyebrow">当前步骤</span>
          <h2 class="onboarding-flow-title">{{ flowStepTitle }}</h2>
          <div class="tag-row">
            <span class="soft-pill">{{ flowModeLabel }}</span>
            <span class="soft-pill">{{ flowStepProgress }}</span>
          </div>
        </div>

        <button
          class="button-primary onboarding-flow-primary"
          type="button"
          :disabled="flowActionDisabled"
          @click="handlePrimaryFlowAction"
        >
          {{ flowActionLabel }}
        </button>
      </div>
    </article>

    <template v-if="mode === 'business'">
      <article class="glass-panel stack-md onboarding-shell">
        <div class="panel-header panel-header-top">
          <div class="stack-xs">
            <span class="eyebrow">办理步骤</span>
            <h2 class="page-hero-title">先填主体</h2>
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
            <div>
              <strong>{{ step.title }}</strong>
            </div>
          </button>
        </div>

        <article class="mini-card stack-md onboarding-step-panel">
          <template v-if="businessStep === 1">
            <SectionTitle
              eyebrow="第 1 步"
              title="确认主体"
            />

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
              <label for="org-type">入驻类型</label>
              <select id="org-type" v-model="businessForm.virtualCompany" class="select-input">
                <option :value="false">企业入驻</option>
                <option :value="true">个人申请虚拟企业</option>
              </select>
            </div>

            <div class="form-field">
              <label for="project-focus">你主要会发布什么类型的任务</label>
              <textarea
                id="project-focus"
                v-model="businessForm.projectFocus"
                class="textarea onboarding-textarea"
                placeholder="例如：AI 产品 MVP、品牌官网改版、中后台重构、自动化方案设计"
              ></textarea>
            </div>
          </template>

          <template v-else-if="businessStep === 2">
            <SectionTitle
              eyebrow="第 2 步"
              title="补充联系人"
              description="填写后续联系和合作偏好。"
            />

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
              <label for="contact-mobile">联系电话</label>
              <input
                id="contact-mobile"
                v-model="businessForm.contactMobile"
                class="text-input"
                placeholder="例如：13800000001"
              />
            </div>

            <div class="form-field">
              <label for="contact-role">联系人身份</label>
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
              <p class="muted">至少选择 1 项，后续平台会按这些偏好进行匹配与协作提示。</p>
            </div>
          </template>

          <template v-else-if="businessStep === 3">
            <SectionTitle
              eyebrow="第 3 步"
              title="确认信息"
              description="确认当前填写内容无误。"
            />

            <div class="onboarding-summary-list">
              <div class="onboarding-summary-row">
                <span>企业名称</span>
                <strong>{{ businessForm.organizationName || '待填写' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>入驻类型</span>
                <strong>{{ businessForm.virtualCompany ? '虚拟企业' : '企业入驻' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>联系人</span>
                <strong>{{ businessForm.contactName || '待填写' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>联系电话</span>
                <strong>{{ businessForm.contactMobile || '待填写' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>联系人身份</span>
                <strong>{{ businessForm.contactRole || '待填写' }}</strong>
              </div>
              <div class="onboarding-summary-row">
                <span>合作偏好</span>
                <strong>{{ businessPreferenceSummary }}</strong>
              </div>
            </div>

            <article class="result-card stack-sm">
              <span class="eyebrow">拟提交资料</span>
              <div class="tag-row">
                <span v-for="item in businessMaterialChecklist" :key="item" class="soft-pill">{{ item }}</span>
              </div>
              <div class="tag-row">
                <span
                  v-for="item in businessForm.collaborationPreferences"
                  :key="item"
                  class="soft-pill"
                >
                  {{ item }}
                </span>
              </div>
            </article>
          </template>

          <template v-else>
            <SectionTitle
              eyebrow="第 4 步"
              title="选择提交方式"
              description="可现在上传，也可稍后补交。"
            />

            <article class="mini-card stack-md onboarding-upload-box">
              <div class="panel-header">
                <div>
                  <span class="eyebrow">建议上传</span>
                  <h4>上传清单</h4>
                </div>
                <span class="soft-pill">{{ businessForm.virtualCompany ? '虚拟企业路径' : '企业路径' }}</span>
              </div>

              <ul class="dashboard-detail-list">
                <li v-for="item in businessMaterialChecklist" :key="item">{{ item }}</li>
              </ul>

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
                  选择资料文件
                </button>
                <span class="soft-pill">
                  {{ businessSelectedFiles.length ? `已选 ${businessSelectedFiles.length} 个文件` : '暂未选择文件' }}
                </span>
              </div>
              <p class="muted onboarding-upload-note">可上传图片、PDF、扫描件等常见资料。</p>

              <div v-if="businessSelectedFiles.length" class="onboarding-upload-list">
                <span v-for="file in businessSelectedFiles" :key="file.name" class="soft-pill">
                  {{ file.name }} · {{ formatFileSize(file.size) }}
                </span>
              </div>
            </article>

            <article class="result-card stack-sm onboarding-defer-card">
              <span class="eyebrow">可选路径</span>
              <h3>先提交基础信息，后续在工作台补交。</h3>

              <label class="onboarding-inline-check">
                <input :checked="businessDeferredMaterials" type="checkbox" @change="handleDeferredToggle($event.target.checked)" />
                <span>这次先不上传文件，后续在企业工作台补交材料</span>
              </label>
            </article>
          </template>
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
            {{ businessSubmitting ? '提交中...' : businessDeferredMaterials ? '提交基础信息，稍后补交材料' : '提交企业入驻申请' }}
          </button>

          <button class="button-secondary" type="button" @click="resetBusinessForm">重新填写</button>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="资料清单"
          title="审核会查看这些内容。"
        />

        <div v-if="authState.user" class="result-card stack-sm">
          <span class="eyebrow">当前账号</span>
          <h3>{{ authState.user.displayName }}</h3>
          <p class="muted">{{ authState.user.mobile }} · 企业端账号</p>
          <div class="tag-row">
            <span class="soft-pill">资料状态：{{ onboardingStatusText(authState.user.onboardingStatus) }}</span>
            <span class="soft-pill">审核状态：{{ approvalStatusText(authState.user.approvalStatus) }}</span>
          </div>
        </div>

        <div class="stack-sm">
          <div v-for="(item, index) in businessMaterialChecklist" :key="item" class="list-row">
            <div class="title-line">
              <span class="badge-number">{{ index + 1 }}</span>
              <div>
                <h4>{{ item }}</h4>
              </div>
            </div>
          </div>
        </div>

        <div v-if="submitResult" class="result-card stack-sm">
          <span class="eyebrow">提交结果</span>
          <h3>{{ resultTitle }}</h3>
          <p class="muted">{{ submitResult.nextStep }}</p>
          <div class="tag-row">
            <span v-for="(value, key) in resultSummary" :key="key" class="soft-pill">{{ key }}：{{ value }}</span>
          </div>
          <div class="toolbar">
            <router-link
              v-if="submitResult.deferMaterials"
              class="button-primary"
              :to="resultActionRoute"
            >
              去企业工作台补交
            </router-link>
            <router-link
              v-else
              class="button-primary"
              :to="resultActionRoute"
            >
              去企业工作台查看状态
            </router-link>
          </div>
        </div>
      </article>
    </template>

    <template v-else>
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="人才端入驻"
          title="先补基础资料，再进入接单和推荐。"
          description="完成基础资料后，再进入任务与协作。"
        />

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
          </div>
          <div class="form-field">
            <label for="portfolio-urls">作品链接</label>
            <textarea
              id="portfolio-urls"
              v-model="talentPortfolioInput"
              class="textarea onboarding-textarea"
              placeholder="每行一个作品链接或作品说明"
            ></textarea>
          </div>
          <div class="form-field">
            <label for="virtual-company">虚拟企业申请</label>
            <select id="virtual-company" v-model="talentForm.applyVirtualCompany" class="select-input">
              <option :value="false">否</option>
              <option :value="true">是</option>
            </select>
          </div>
          <div class="toolbar">
            <button class="button-primary" type="submit">提交人才入驻</button>
            <button class="button-secondary" type="button" @click="resetTalentForm">重置</button>
          </div>
        </form>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="资料清单"
          title="审核会重点看这些内容。"
        />

        <div v-if="authState.user" class="result-card stack-sm">
          <span class="eyebrow">当前账号</span>
          <h3>{{ authState.user.displayName }}</h3>
          <p class="muted">{{ authState.user.mobile }} · 人才端账号</p>
          <div class="tag-row">
            <span class="soft-pill">资料状态：{{ onboardingStatusText(authState.user.onboardingStatus) }}</span>
            <span class="soft-pill">审核状态：{{ approvalStatusText(authState.user.approvalStatus) }}</span>
          </div>
        </div>

        <div class="stack-sm">
          <div v-for="(item, index) in checklistItems" :key="item" class="list-row">
            <div class="title-line">
              <span class="badge-number">{{ index + 1 }}</span>
              <div>
                <h4>{{ item }}</h4>
              </div>
            </div>
          </div>
        </div>

        <div v-if="submitResult" class="result-card stack-sm">
          <span class="eyebrow">提交结果</span>
          <h3>{{ resultTitle }}</h3>
          <p class="muted">{{ submitResult.nextStep }}</p>
          <div class="tag-row">
            <span v-for="(value, key) in resultSummary" :key="key" class="soft-pill">{{ key }}：{{ value }}</span>
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
import { getOnboardingChecklists, submitBusinessOnboarding, submitTalentOnboarding } from '../services/api';
import { refreshAuthSession, useAuthState } from '../stores/auth';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();
const mode = ref('business');
const checklists = ref(null);
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
  { id: 1, title: '企业身份', note: '先确认企业名称与入驻类型' },
  { id: 2, title: '联系人', note: '补充沟通方式与合作偏好' },
  { id: 3, title: '确认信息', note: '确认当前入驻内容无误' },
  { id: 4, title: '资料上传', note: '最后决定现在上传还是稍后补交' }
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
  headline: '',
  applyVirtualCompany: false
});
const talentSkillsInput = ref('');
const talentPortfolioInput = ref('');

const checklistItems = computed(() => (mode.value === 'business' ? checklists.value.business : checklists.value.talent));

const resultTitle = computed(() => {
  if (mode.value === 'business') {
    return submitResult.value?.deferMaterials ? '企业基础信息已提交' : '企业入驻申请已提交';
  }
  return '人才入驻申请已提交';
});

const resultActionRoute = computed(() =>
  mode.value === 'business' ? roleRouteMap.enterprise.home : roleRouteMap.talent.home
);

const resultSummary = computed(() => {
  if (!submitResult.value) {
    return {};
  }
  if (mode.value === 'business') {
    return {
      企业: submitResult.value.organizationName,
      联系人: submitResult.value.contactName,
      状态: onboardingResultStatusText(submitResult.value.status),
      资料: materialStatusText(submitResult.value.materialStatus)
    };
  }
  return {
    人才: submitResult.value.displayName,
    方向: submitResult.value.headline,
    状态: onboardingResultStatusText(submitResult.value.status)
  };
});

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
const flowModeLabel = computed(() => (mode.value === 'business' ? '企业 / 虚拟企业' : '人才入驻'));
const flowStepTitle = computed(() => {
  if (mode.value === 'business') {
    return businessSteps[businessStep.value - 1]?.title || '办理中';
  }
  return '填写人才基础资料';
});
const flowStepProgress = computed(() =>
  mode.value === 'business' ? `${businessStep.value} / ${businessSteps.length}` : '单页办理'
);
const flowActionLabel = computed(() => {
  if (mode.value === 'business') {
    if (businessStep.value < businessSteps.length) {
      return '继续下一步';
    }
    return businessDeferredMaterials.value ? '提交基础信息' : '提交企业入驻申请';
  }
  return '提交人才入驻';
});
const flowActionDisabled = computed(() => {
  if (mode.value === 'business') {
    return businessSubmitting.value || !isBusinessStepValid.value;
  }
  return !talentForm.value.displayName.trim() || !talentForm.value.headline.trim();
});

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

function onboardingStatusText(status) {
  switch (status) {
    case 'SUBMITTED':
      return '已提交';
    case 'MATERIALS_PENDING':
      return '待补材料';
    case 'NOT_SUBMITTED':
    case '':
    case null:
    case undefined:
      return '未提交';
    default:
      return '处理中';
  }
}

function approvalStatusText(status) {
  switch (status) {
    case 'APPROVED':
      return '已通过';
    case 'PENDING_REVIEW':
      return '审核中';
    case 'WAITING_MATERIALS':
      return '待补材料';
    case 'REJECTED':
      return '未通过';
    case 'UNREVIEWED':
    case '':
    case null:
    case undefined:
      return '未开始';
    default:
      return '处理中';
  }
}

function onboardingResultStatusText(status) {
  switch (status) {
    case 'PENDING_REVIEW':
      return '已提交，待审核';
    case 'PENDING_MATERIALS':
      return '已提交，待补材料';
    case 'APPROVED':
      return '已通过';
    default:
      return '处理中';
  }
}

function materialStatusText(status) {
  switch (status) {
    case 'UPLOADED':
      return '已上传';
    case 'WAITING_UPLOAD':
      return '待上传';
    case 'NOT_PROVIDED':
    case '':
    case null:
    case undefined:
      return '未提供';
    default:
      return '处理中';
  }
}

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
    headline: user.headline || '',
    applyVirtualCompany: false
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
    headline: '',
    applyVirtualCompany: false
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

async function handlePrimaryFlowAction() {
  if (mode.value === 'business') {
    if (businessStep.value < businessSteps.length) {
      nextBusinessStep();
      return;
    }
    await handleBusinessSubmit();
    return;
  }

  await handleTalentSubmit();
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
  await refreshAuthSession();
}

onMounted(async () => {
  syncModeFromRoute();
  checklists.value = await getOnboardingChecklists();
});

watch(() => route.meta.onboardingMode, syncModeFromRoute);
watch(() => authState.user, prefillFormFromUser, { deep: true });
</script>

<style scoped>
.onboarding-flow-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(106, 166, 255, 0.16);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(106, 166, 255, 0.1), rgba(255, 255, 255, 0.04));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.onboarding-page .hero-card {
  padding: 18px;
}

.onboarding-page .section-title h1 {
  max-width: 10ch;
  font-size: clamp(24px, 2.8vw, 34px);
}

.onboarding-page .section-title p {
  max-width: 42ch;
}

.onboarding-flow-title {
  margin: 0;
  font-size: clamp(0.95rem, 1.02vw, 1.02rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.onboarding-flow-primary {
  min-width: 116px;
}

.onboarding-page .onboarding-shell {
  padding: 16px;
}

.onboarding-page .onboarding-stepper {
  gap: 3px;
}

.onboarding-page .publish-stepper-item {
  padding: 6px 8px;
  border-radius: 10px;
  gap: 5px;
}

.onboarding-page .publish-stepper-item strong {
  font-size: 12px;
  line-height: 1.2;
}

.onboarding-page .page-hero-title {
  font-size: clamp(20px, 2vw, 28px);
}

.onboarding-page .onboarding-step-panel {
  padding: 14px;
}

@media (max-width: 860px) {
  .onboarding-flow-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .onboarding-flow-primary {
    width: 100%;
  }
}
</style>
