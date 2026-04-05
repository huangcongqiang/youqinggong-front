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
              title="上传真实材料"
              description="请上传真实审核材料，系统会保留上传结果供后台审核查看。"
            />

            <article class="mini-card stack-md onboarding-upload-box">
              <div class="panel-header">
                <div>
                  <span class="eyebrow">真实材料</span>
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
            {{ businessSubmitting ? '提交中...' : '提交企业入驻申请' }}
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

        <div v-if="submitResult || resultUploadedMaterials.length" class="result-card stack-sm">
          <span class="eyebrow">提交结果</span>
          <h3>{{ submitResult ? resultTitle : '已同步历史材料' }}</h3>
          <p class="muted">{{ submitResult ? resultNote : '已从当前账号同步最近一次提交的企业审核材料。' }}</p>
          <div v-if="submitResult" class="tag-row">
            <span v-for="(value, key) in resultSummary" :key="key" class="soft-pill">{{ key }}：{{ value }}</span>
          </div>
              <div v-if="resultUploadedMaterials.length" class="stack-sm">
                <span class="eyebrow">上传结果</span>
                <div class="stack-xs">
                  <div
                    v-for="file in resultUploadedMaterials"
                :key="`${file.name}-${file.downloadUrl || file.url}`"
                class="list-row"
              >
                <div class="title-line">
                  <span class="badge-number">✓</span>
                  <div>
                    <h4>{{ file.name }}</h4>
                    <p class="muted">{{ uploadedMaterialSummary(file) }}</p>
                    <p class="muted">原件链接：{{ file.url || file.downloadUrl || '后端暂未返回' }}</p>
                  </div>
                </div>
                <div class="tag-row">
                  <a
                    v-if="file.url || file.downloadUrl"
                    class="soft-pill"
                    :href="file.url || file.downloadUrl"
                    target="_blank"
                    rel="noreferrer"
                  >
                    打开原件
                  </a>
                  <a
                    v-if="file.downloadUrl || file.url"
                    class="soft-pill"
                    :href="file.downloadUrl || file.url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    下载入口
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="toolbar">
            <router-link class="button-primary" :to="resultActionRoute">
              {{ resultActionLabel }}
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
            <div class="onboarding-skill-grid">
              <button
                v-for="skill in talentSkillOptions"
                :key="skill"
                type="button"
                class="onboarding-skill-chip"
                :class="{ 'is-active': talentSelectedSkills.includes(skill) }"
                @click="toggleTalentSkill(skill)"
              >
                {{ skill }}
              </button>
              <button
                type="button"
                class="onboarding-skill-chip onboarding-skill-chip-custom"
                :class="{ 'is-active': talentCustomSkillEnabled }"
                @click="toggleTalentCustomSkill"
              >
                自定义补充
              </button>
            </div>
            <input
              v-if="talentCustomSkillEnabled"
              id="talent-skills"
              v-model="talentCustomSkill"
              class="text-input"
              placeholder="例如：脚本策划、硬件交互、广告设计"
            />
            <p class="muted onboarding-skill-note">
              已选 {{ parsedTalentSkills.length }} 项，建议保持 3 到 6 项，平台会优先按标准标签参与匹配。
            </p>
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
            <div class="onboarding-upload-panel">
              <div class="onboarding-upload-header">
                <div>
                  <span class="eyebrow">实名 / 作品附件</span>
                  <h4>至少上传 1 份真实审核材料</h4>
                </div>
                <button class="button-secondary" type="button" @click="openTalentFilePicker">
                  选择文件
                </button>
              </div>
              <input
                id="talent-files"
                ref="talentFileInput"
                class="sr-only"
                type="file"
                multiple
                @change="handleTalentFilesChange"
              />
              <div class="tag-row">
                <span class="soft-pill">
                  {{ talentSelectedFiles.length ? `已选 ${talentSelectedFiles.length} 个文件` : '暂未选择文件' }}
                </span>
              </div>
              <p class="muted onboarding-upload-note">建议上传身份证明、作品集 PDF、案例截图或交付证明。</p>
              <div v-if="talentSelectedFiles.length" class="onboarding-upload-list">
                <span v-for="file in talentSelectedFiles" :key="file.name" class="soft-pill">
                  {{ file.name }} · {{ formatFileSize(file.size) }}
                </span>
              </div>
            </div>
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

        <div v-if="submitResult || resultUploadedMaterials.length" class="result-card stack-sm">
          <span class="eyebrow">提交结果</span>
          <h3>{{ submitResult ? resultTitle : '已同步历史材料' }}</h3>
          <p class="muted">{{ submitResult ? resultNote : '已从当前账号同步最近一次提交的人才审核材料。' }}</p>
          <div v-if="submitResult" class="tag-row">
            <span v-for="(value, key) in resultSummary" :key="key" class="soft-pill">{{ key }}：{{ value }}</span>
          </div>
              <div v-if="resultUploadedMaterials.length" class="stack-sm">
                <span class="eyebrow">上传结果</span>
                <div class="stack-xs">
                  <div
                    v-for="file in resultUploadedMaterials"
                :key="`${file.name}-${file.downloadUrl || file.url}`"
                class="list-row"
              >
                <div class="title-line">
                  <span class="badge-number">✓</span>
                  <div>
                    <h4>{{ file.name }}</h4>
                    <p class="muted">{{ uploadedMaterialSummary(file) }}</p>
                    <p class="muted">原件链接：{{ file.url || file.downloadUrl || '后端暂未返回' }}</p>
                  </div>
                </div>
                <div class="tag-row">
                  <a
                    v-if="file.url || file.downloadUrl"
                    class="soft-pill"
                    :href="file.url || file.downloadUrl"
                    target="_blank"
                    rel="noreferrer"
                  >
                    打开原件
                  </a>
                  <a
                    v-if="file.downloadUrl || file.url"
                    class="soft-pill"
                    :href="file.downloadUrl || file.url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    下载入口
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="toolbar">
            <router-link class="button-primary" :to="resultActionRoute">
              {{ resultActionLabel }}
            </router-link>
          </div>
        </div>
      </article>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { resolveApiBase } from '../services/apiBase';
import { getOnboardingChecklists, submitBusinessOnboarding, submitTalentOnboarding } from '../services/api';
import { uploadStandaloneAttachmentRuntime } from '../services/uploadWorkflow.js';
import { refreshAuthSession, useAuthState } from '../stores/auth';
import { buildRegisterSkills, talentSkillOptions } from '../utils/registerSkills';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const authState = useAuthState();
const onboardingUploadRuntime = {
  apiBase: resolveApiBase(import.meta.env),
  getToken: () => authState.token
};
const mode = ref('business');
const checklists = ref(null);
const submitResult = ref(null);
const businessStep = ref(1);
const businessDeferredMaterials = ref(false);
const businessSelectedFiles = ref([]);
const businessSubmitting = ref(false);
const businessFileInput = ref(null);
const talentSelectedFiles = ref([]);
const talentSubmitting = ref(false);
const talentFileInput = ref(null);

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
const talentSelectedSkills = ref([]);
const talentCustomSkillEnabled = ref(false);
const talentCustomSkill = ref('');
const talentPortfolioInput = ref('');

const checklistItems = computed(() => (mode.value === 'business' ? checklists.value.business : checklists.value.talent));

function isSubmitFailed(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
}

const resultTitle = computed(() => {
  if (isSubmitFailed(submitResult.value)) {
    return mode.value === 'business' ? '企业入驻提交失败' : '人才入驻提交失败';
  }
  if (mode.value === 'business') {
    return submitResult.value?.deferMaterials ? '企业基础信息已提交' : '企业入驻申请已提交';
  }
  return '人才入驻申请已提交';
});

const resultActionRoute = computed(() => (
  isSubmitFailed(submitResult.value)
    ? { path: route.path, query: route.query }
    : mode.value === 'business'
      ? roleRouteMap.enterprise.home
      : roleRouteMap.talent.home
));

const resultActionLabel = computed(() => {
  if (isSubmitFailed(submitResult.value)) {
    return '继续修改后重试';
  }
  if (mode.value === 'business') {
    return submitResult.value?.deferMaterials ? '去企业工作台补交' : '去企业工作台查看状态';
  }
  return '继续完善资料';
});

const resultNote = computed(() => submitResult.value?.requestError || submitResult.value?.nextStep || '');

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

const resultUploadedMaterials = computed(() => {
  if (Array.isArray(submitResult.value?.uploadedMaterials) && submitResult.value.uploadedMaterials.length) {
    return submitResult.value.uploadedMaterials;
  }
  if (Array.isArray(authState.user?.materialFiles) && authState.user.materialFiles.length) {
    return authState.user.materialFiles.map(normalizeUploadedMaterial);
  }
  return [];
});

const businessMaterialChecklist = computed(() => {
  if (businessForm.value.virtualCompany) {
    return ['身份证正反面', '实名手持证件照', '虚拟企业申请说明', '个人品牌或业务证明'];
  }
  return ['营业执照或企业证明', '联系人名片或授权说明', '品牌介绍或业务范围说明', '合作偏好勾选结果'];
});

const businessUploadedNames = computed(() => businessSelectedFiles.value.map((file) => file.name).filter(Boolean));
const talentUploadedNames = computed(() => talentSelectedFiles.value.map((file) => file.name).filter(Boolean));
const parsedTalentSkills = computed(() =>
  buildRegisterSkills(talentSelectedSkills.value, talentCustomSkill.value, talentCustomSkillEnabled.value)
);
const parsedTalentPortfolioUrls = computed(() => talentPortfolioInput.value
  .split('\n')
  .map((item) => item.trim())
  .filter(Boolean));
const isTalentFormValid = computed(() => Boolean(
  talentForm.value.displayName.trim()
  && talentForm.value.headline.trim()
  && parsedTalentSkills.value.length >= 3
  && parsedTalentSkills.value.length <= 6
  && parsedTalentPortfolioUrls.value.length
  && talentUploadedNames.value.length
));
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
    return '提交企业入驻申请';
  }
  return '提交人才入驻';
});
const flowActionDisabled = computed(() => {
  if (mode.value === 'business') {
    return businessSubmitting.value || !isBusinessStepValid.value;
  }
  return talentSubmitting.value || !isTalentFormValid.value;
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
  return businessUploadedNames.value.length > 0;
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
    case 'FAILED':
      return '提交失败';
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
    const currentForm = businessForm.value || {};
    businessForm.value = {
      organizationName: String(currentForm.organizationName || '').trim() || user.organizationName || user.displayName || '',
      contactName: String(currentForm.contactName || '').trim() || user.contactName || '',
      contactMobile: String(currentForm.contactMobile || '').trim() || user.contactMobile || user.mobile || '',
      virtualCompany: Boolean(currentForm.virtualCompany),
      contactRole: String(currentForm.contactRole || '').trim() || user.contactRole || '',
      projectFocus: String(currentForm.projectFocus || '').trim() || user.projectFocus || '',
      collaborationPreferences: Array.isArray(currentForm.collaborationPreferences) && currentForm.collaborationPreferences.length
        ? currentForm.collaborationPreferences
        : collaborationPreferences
    };
    return;
  }

  const currentTalentForm = talentForm.value || {};
  talentForm.value = {
    displayName: String(currentTalentForm.displayName || '').trim() || user.displayName || '',
    headline: String(currentTalentForm.headline || '').trim() || user.headline || '',
    applyVirtualCompany: Boolean(currentTalentForm.applyVirtualCompany)
  };
  if (!talentSelectedSkills.value.length && !String(talentCustomSkill.value || '').trim()) {
    applyTalentSkills(user.skills);
  }
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
  talentSelectedSkills.value = [];
  talentCustomSkillEnabled.value = false;
  talentCustomSkill.value = '';
  talentPortfolioInput.value = '';
  talentSelectedFiles.value = [];
  if (talentFileInput.value) {
    talentFileInput.value.value = '';
  }
}

function applyTalentSkills(rawSkills) {
  const normalized = buildRegisterSkills(Array.isArray(rawSkills) ? rawSkills : []);
  talentSelectedSkills.value = normalized.filter((skill) => talentSkillOptions.includes(skill));
  const customSkills = normalized.filter((skill) => !talentSkillOptions.includes(skill));
  talentCustomSkillEnabled.value = customSkills.length > 0;
  talentCustomSkill.value = customSkills.join(' / ');
}

function toggleTalentSkill(skill) {
  if (talentSelectedSkills.value.includes(skill)) {
    talentSelectedSkills.value = talentSelectedSkills.value.filter((item) => item !== skill);
    return;
  }
  talentSelectedSkills.value = [...talentSelectedSkills.value, skill];
}

function toggleTalentCustomSkill() {
  talentCustomSkillEnabled.value = !talentCustomSkillEnabled.value;
  if (!talentCustomSkillEnabled.value) {
    talentCustomSkill.value = '';
  }
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

function handleTalentFilesChange(event) {
  talentSelectedFiles.value = Array.from(event?.target?.files || []);
}

function openTalentFilePicker() {
  talentFileInput.value?.click();
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

function normalizeUploadedMaterial(file) {
  return {
    name: file.name || '审核材料',
    url: file.url || file.downloadUrl || '',
    downloadUrl: file.downloadUrl || file.url || '',
    size: file.size || 0,
    uploadId: file.uploadId || '',
    objectKey: file.objectKey || ''
  };
}

function uploadedMaterialSummary(file) {
  const parts = [
    file?.size ? formatFileSize(file.size) : '0 B',
    file?.uploadId ? `上传ID ${file.uploadId}` : '无上传ID',
    file?.objectKey ? '已生成对象键' : '未返回对象键'
  ];
  return parts.join(' · ');
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
    const submissionForm = {
      ...businessForm.value,
      organizationName: String(businessForm.value.organizationName || '').trim(),
      contactName: String(businessForm.value.contactName || '').trim(),
      contactMobile: String(businessForm.value.contactMobile || '').trim(),
      contactRole: String(businessForm.value.contactRole || '').trim(),
      projectFocus: String(businessForm.value.projectFocus || '').trim(),
      collaborationPreferences: Array.isArray(businessForm.value.collaborationPreferences)
        ? businessForm.value.collaborationPreferences
        : []
    };
    businessForm.value = submissionForm;
    if (!submissionForm.contactName) {
      submitResult.value = {
        status: 'FAILED',
        requestError: '请先填写联系人姓名，再提交企业入驻申请。',
        nextStep: '请返回联系人步骤，确认联系人姓名已经填写并保留。'
      };
      return;
    }
    if (!submissionForm.contactMobile) {
      submitResult.value = {
        status: 'FAILED',
        requestError: '请先填写联系人手机号，再提交企业入驻申请。',
        nextStep: '请返回联系人步骤，确认联系人手机号已经填写并保留。'
      };
      return;
    }
    if (!businessSelectedFiles.value.length) {
      submitResult.value = {
        status: 'FAILED',
        requestError: '请先上传企业审核材料，再提交入驻申请。',
        nextStep: '请先上传营业执照、授权或业务证明等真实材料。'
      };
      return;
    }
    const uploadedMaterials = [];
    for (const file of businessSelectedFiles.value) {
      uploadedMaterials.push(await uploadStandaloneAttachmentRuntime(onboardingUploadRuntime, {
        file,
        scene: submissionForm.virtualCompany ? 'BUSINESS_ONBOARDING_VIRTUAL' : 'BUSINESS_ONBOARDING',
        source: 'ONBOARDING_MATERIAL'
      }));
    }
    const uploadedMaterialRecords = uploadedMaterials.map(normalizeUploadedMaterial);
    submitResult.value = {
      ...(await submitBusinessOnboarding({
        ...submissionForm,
        materials: uploadedMaterials.map((item) => item.downloadUrl).filter(Boolean),
        materialObjects: uploadedMaterialRecords,
        deferMaterials: false,
        collaborationPreferencesCsv: submissionForm.collaborationPreferences.join('、'),
        materialNamesCsv: uploadedMaterials.map((item) => item.name).join('、'),
        materialFiles: uploadedMaterials.map((file) => ({
          name: file.name,
          type: file.mimeType || file.type || 'application/octet-stream',
          size: file.size || 0,
          url: file.downloadUrl || '',
          uploadId: file.uploadId || '',
          objectKey: file.objectKey || ''
        }))
      })),
      uploadedMaterials: uploadedMaterialRecords
    };
    if (isSubmitFailed(submitResult.value)) {
      return;
    }
    await refreshAuthSession();
  } finally {
    businessSubmitting.value = false;
  }
}

async function handleTalentSubmit() {
  if (talentSubmitting.value) {
    return;
  }
  talentSubmitting.value = true;
  try {
    if (parsedTalentSkills.value.length < 3 || parsedTalentSkills.value.length > 6) {
      submitResult.value = {
        status: 'FAILED',
        requestError: '请先选择 3 到 6 个技能标签，再提交人才入驻。',
        nextStep: '技能标签会直接影响任务匹配和审核判断。'
      };
      return;
    }
    if (!parsedTalentPortfolioUrls.value.length) {
      submitResult.value = {
        status: 'FAILED',
        requestError: '请先补充至少 1 条作品链接或作品说明，再提交人才入驻。',
        nextStep: '审核需要先看到代表作品或案例说明。'
      };
      return;
    }
    if (!talentSelectedFiles.value.length) {
      submitResult.value = {
        status: 'FAILED',
        requestError: '请先上传实名或作品审核材料，再提交人才入驻。',
        nextStep: '建议上传身份证明、作品集 PDF、案例截图或交付证明。'
      };
      return;
    }

    const uploadedMaterials = [];
    for (const file of talentSelectedFiles.value) {
      uploadedMaterials.push(await uploadStandaloneAttachmentRuntime(onboardingUploadRuntime, {
        file,
        scene: 'TALENT_ONBOARDING',
        source: 'ONBOARDING_MATERIAL'
      }));
    }

    const uploadedMaterialRecords = uploadedMaterials.map(normalizeUploadedMaterial);
    submitResult.value = {
      ...(await submitTalentOnboarding({
        ...talentForm.value,
        skills: parsedTalentSkills.value,
        portfolioUrls: parsedTalentPortfolioUrls.value,
        materials: uploadedMaterials.map((item) => item.downloadUrl).filter(Boolean),
        materialObjects: uploadedMaterialRecords,
        materialFiles: uploadedMaterials.map((file) => ({
          name: file.name,
          type: file.mimeType || file.type || 'application/octet-stream',
          size: file.size || 0,
          url: file.downloadUrl || '',
          uploadId: file.uploadId || '',
          objectKey: file.objectKey || ''
        }))
      })),
      uploadedMaterials: uploadedMaterialRecords
    };
    if (isSubmitFailed(submitResult.value)) {
      return;
    }
    await refreshAuthSession();
  } finally {
    talentSubmitting.value = false;
  }
}

onMounted(async () => {
  syncModeFromRoute();
  checklists.value = await getOnboardingChecklists();
});

watch(() => route.meta.onboardingMode, syncModeFromRoute);
watch(
  () => [
    authState.user?.id,
    authState.user?.audience,
    authState.user?.organizationName,
    authState.user?.displayName,
    authState.user?.contactName,
    authState.user?.contactMobile,
    authState.user?.mobile,
    authState.user?.contactRole,
    authState.user?.projectFocus,
    authState.user?.headline,
    Array.isArray(authState.user?.skills) ? authState.user.skills.join('|') : '',
    Array.isArray(authState.user?.collaborationPreferences)
      ? authState.user.collaborationPreferences.join('|')
      : authState.user?.collaborationPreference || ''
  ],
  prefillFormFromUser
);
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

.onboarding-skill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.onboarding-skill-chip {
  border: 1px solid rgba(140, 166, 255, 0.18);
  background: rgba(10, 18, 31, 0.9);
  color: var(--text-muted);
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.onboarding-skill-chip:hover {
  border-color: rgba(140, 166, 255, 0.32);
  color: var(--text-strong);
  transform: translateY(-1px);
}

.onboarding-skill-chip.is-active {
  border-color: rgba(116, 145, 255, 0.42);
  background: linear-gradient(135deg, rgba(97, 120, 255, 0.22), rgba(67, 196, 255, 0.16));
  color: var(--text-strong);
}

.onboarding-skill-note {
  margin: 10px 0 0;
  font-size: 12px;
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
