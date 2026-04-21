<template>
  <section class="setup-flow-shell enterprise-onboarding-shell">
    <header class="setup-flow-hero">
      <span class="setup-flow-eyebrow">{{ flowEyebrow }}</span>
      <div class="setup-flow-hero-grid">
        <div>
          <h1>{{ currentStepMeta.title }}</h1>
          <p>{{ currentStepMeta.summary }}</p>
        </div>
        <p class="setup-flow-context">{{ flowContext }}</p>
      </div>
    </header>

    <ol class="onboarding-stepper">
      <li
        v-for="(step, index) in onboardingSteps"
        :key="step.id"
        class="onboarding-stepper__item"
        :class="stepClasses(index)"
      >
        <span class="onboarding-stepper__index">{{ index + 1 }}</span>
        <div>
          <strong>{{ step.title }}</strong>
          <small>{{ step.caption }}</small>
        </div>
      </li>
    </ol>

    <article v-if="submitResult" class="setup-flow-card setup-flow-result" :class="`is-${submitResult.tone}`">
      <span class="setup-flow-result__eyebrow">{{ submitResult.eyebrow }}</span>
      <h2>{{ submitResult.title }}</h2>
      <p>{{ submitResult.body }}</p>
      <div class="setup-flow-result__actions">
        <button type="button" class="button-secondary" @click="resetAfterResult">重新编辑</button>
        <button type="button" class="button-primary" @click="continueAfterResult">{{ submitResult.actionLabel }}</button>
      </div>
    </article>

    <article v-else class="setup-flow-card">
      <div v-if="isLoading" class="setup-flow-state">正在同步当前入驻清单…</div>
      <template v-else>
        <div v-if="requestError" class="setup-flow-alert is-error">{{ requestError }}</div>

        <template v-if="currentStepMeta.id === 'profile'">
          <div class="setup-flow-section-grid">
            <div class="setup-flow-field setup-flow-field--full">
              <label>{{ isTalent ? '展示名称' : '企业名称 / 品牌名称' }}</label>
              <input
                v-if="isTalent"
                v-model.trim="talentForm.displayName"
                class="setup-flow-input"
                type="text"
                placeholder="例如：林川 / 北辰设计工作室"
              />
              <input
                v-else
                v-model.trim="businessForm.organizationName"
                class="setup-flow-input"
                type="text"
                placeholder="例如：大王传媒 / 有轻功科技"
              />
            </div>

            <div class="setup-flow-field setup-flow-field--full">
              <label>{{ isTalent ? '一句话简介' : '你准备发布什么类型的任务？' }}</label>
              <textarea
                v-if="isTalent"
                v-model.trim="talentForm.headline"
                class="setup-flow-textarea"
                rows="5"
                placeholder="用一句话说明你的专长、擅长合作的项目类型，以及你想接什么样的任务。"
              ></textarea>
              <div v-else class="setup-flow-choice-grid setup-flow-choice-grid--single">
                <button
                  v-for="option in businessTrackOptions"
                  :key="option.value"
                  type="button"
                  class="setup-flow-choice"
                  :class="{ 'is-selected': businessForm.businessTrack === option.value }"
                  @click="businessForm.businessTrack = option.value"
                >
                  <span class="setup-flow-choice__eyebrow">{{ option.eyebrow }}</span>
                  <strong>{{ option.title }}</strong>
                  <p>{{ option.note }}</p>
                </button>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="currentStepMeta.id === 'contact'">
          <div v-if="isTalent" class="setup-flow-section-grid">
            <div class="setup-flow-field setup-flow-field--full">
              <label>擅长方向</label>
              <div class="setup-flow-tag-editor">
                <div class="setup-flow-field__hint" style="margin-bottom: 10px;">共享预置标签</div>
                <div class="setup-flow-chip-list">
                  <button
                    v-for="skill in sharedTalentSkills"
                    :key="skill"
                    type="button"
                    class="setup-flow-chip"
                    :class="{ 'is-filled': talentForm.skills.includes(skill) }"
                    @click="toggleTalentSkill(skill)"
                  >
                    {{ skill }}
                  </button>
                </div>

                <div class="setup-flow-field__hint" style="margin: 16px 0 10px;">自定义补充标签</div>
                <div class="setup-flow-inline-input">
                    <input
                      v-model.trim="talentSkillInput"
                      class="setup-flow-input"
                      type="text"
                      placeholder="例如：短视频脚本、品牌策划、商业插画"
                      @keydown.enter.prevent="addTalentSkill"
                    />
                  <button type="button" class="button-secondary" @click="addTalentSkill">添加</button>
                </div>
                <div v-if="talentForm.customSkills.length" class="setup-flow-chip-list" style="margin-top: 12px;">
                  <button
                    v-for="skill in talentForm.customSkills"
                    :key="skill"
                    type="button"
                    class="setup-flow-chip is-filled"
                    @click="removeTalentCustomSkill(skill)"
                  >
                    {{ skill }} <span>×</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="setup-flow-field setup-flow-field--full">
              <label>作品链接</label>
              <div class="setup-flow-list-editor">
                <div class="setup-flow-inline-input">
                  <input
                    v-model.trim="portfolioInput"
                    class="setup-flow-input"
                    type="url"
                    placeholder="https://portfolio.example.com/case"
                    @keydown.enter.prevent="addPortfolioUrl"
                  />
                  <button type="button" class="button-secondary" @click="addPortfolioUrl">添加</button>
                </div>
                <div class="setup-flow-list">
                  <div
                    v-for="(item, index) in talentForm.portfolioUrls"
                    :key="`${item}-${index}`"
                    class="setup-flow-list__item"
                  >
                    <span>{{ item }}</span>
                    <button type="button" class="button-link-lite" @click="removePortfolioUrl(index)">移除</button>
                  </div>
                </div>
              </div>
            </div>

            <label class="setup-flow-checkbox-card">
              <input v-model="talentForm.applyVirtualCompany" type="checkbox" />
              <div>
                <strong>同时申请虚拟企业合作身份</strong>
                <p>适合需要以项目团队、工作室或联合署名方式承接合作的情况。</p>
              </div>
            </label>
          </div>

          <div v-else class="setup-flow-section-grid">
            <div class="setup-flow-field">
              <label>联系人姓名</label>
              <input
                v-model.trim="businessForm.contactName"
                class="setup-flow-input"
                type="text"
                placeholder="例如：王晨 / 张楠"
              />
            </div>

            <div class="setup-flow-field">
              <label>联系人手机号</label>
              <input
                v-model.trim="businessForm.contactMobile"
                class="setup-flow-input"
                type="tel"
                placeholder="例如：13800000000"
              />
            </div>

            <div class="setup-flow-field setup-flow-field--full">
              <label>你希望先怎么合作？</label>
              <div class="setup-flow-choice-grid">
                <button
                  v-for="option in collaborationPreferenceOptions"
                  :key="option.value"
                  type="button"
                  class="setup-flow-choice"
                  :class="{ 'is-selected': businessForm.collaborationPreferences.includes(option.value) }"
                  @click="toggleBusinessPreference(option.value)"
                >
                  <span class="setup-flow-choice__eyebrow">{{ option.eyebrow }}</span>
                  <strong>{{ option.title }}</strong>
                  <p>{{ option.note }}</p>
                </button>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="currentStepMeta.id === 'review'">
          <div class="setup-flow-review-list">
            <div v-for="item in reviewRows" :key="item.label" class="setup-flow-review-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>

          <div class="setup-flow-helper-card">
            <span class="setup-flow-helper-card__eyebrow">接下来会继续做什么</span>
            <p>{{ nextStepNote }}</p>
            <ul>
              <li v-for="item in checklistItems" :key="item">{{ item }}</li>
            </ul>
          </div>
        </template>

        <template v-else>
          <div class="setup-flow-upload-panel">
            <div class="setup-flow-helper-card">
              <span class="setup-flow-helper-card__eyebrow">上传资料</span>
              <p>{{ uploadLead }}</p>
            </div>

            <label class="setup-flow-upload-box">
              <input :key="materialInputKey" class="setup-flow-file-input" type="file" multiple :disabled="isUploadingMaterials" @change="handleMaterialChange" />
              <strong>{{ isUploadingMaterials ? '正在上传材料…' : '选择并上传文件' }}</strong>
              <p>选择文件后会立即上传；上传完成后系统会自动带上有效地址继续提交。单个文件建议不超过 200MB。</p>
            </label>

            <div v-if="materialNames.length" class="setup-flow-file-list">
              <div
                v-for="(item, index) in currentMaterialFiles"
                :key="`${item.name || 'material'}-${index}`"
                class="setup-flow-file-list__item"
              >
                <span>{{ item.name }}</span>
                <div class="setup-flow-file-list__meta">
                  <small>已上传</small>
                  <button type="button" class="button-link-lite" @click="removeMaterial(index)">移除</button>
                </div>
              </div>
            </div>

            <label class="setup-flow-checkbox-card">
              <input v-model="deferMaterials" type="checkbox" />
              <div>
                <strong>稍后再补资料</strong>
                <p>先保存当前设置，后续再继续补充材料并进入审核。</p>
              </div>
            </label>
          </div>
        </template>
      </template>
    </article>

    <footer v-if="!submitResult" class="setup-flow-actions">
      <button type="button" class="button-secondary" @click="goBack">{{ currentStepIndex === 0 ? '返回工作台' : '返回' }}</button>
      <button type="button" class="button-primary" :disabled="isLoading || isSubmitting || isUploadingMaterials" @click="goNext">
        {{ isSubmitting ? '正在提交…' : currentStepIndex === onboardingSteps.length - 1 ? '提交并继续' : '继续' }}
      </button>
    </footer>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOnboardingChecklists, submitBusinessOnboarding, submitTalentOnboarding, uploadStandaloneAttachmentAsset } from '../services/api';
import { buildRegisterHeadline, buildRegisterSkillPayload, splitCustomSkillInput, talentSkillOptions } from '../utils/registerSkills';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const isSubmitting = ref(false);
const isUploadingMaterials = ref(false);
const requestError = ref('');
const currentStepIndex = ref(0);
const submitResult = ref(null);
const checklists = ref({ business: [], talent: [] });
const materialInputKey = ref(0);
const talentSkillInput = ref('');
const portfolioInput = ref('');

const businessTrackOptions = [
  { value: 'post', eyebrow: '默认路径', title: '先发布新任务', note: '适合先把需求整理好，再开始筛人和邀请。' },
  { value: 'match', eyebrow: '次级路径', title: '先明确合作偏好', note: '适合内部已有项目，只差把联系人和偏好梳理清楚。' },
];

const collaborationPreferenceOptions = [
  { value: 'direct-hire', eyebrow: '合作方式', title: '先找可以直接开工的人才', note: '更适合短平快需求与固定交付。' },
  { value: 'long-cycle', eyebrow: '合作方式', title: '先找长期合作对象', note: '更适合需要分阶段推进的项目。' },
  { value: 'trial-first', eyebrow: '合作方式', title: '先试跑一段小任务', note: '先小范围试合作，再决定是否扩大范围。' },
  { value: 'ai-assisted', eyebrow: '合作方式', title: '先让 AI 帮忙拆需求', note: '适合老板先给一句话，再由系统补齐任务结构。' },
];

const businessForm = reactive({
  organizationName: '',
  contactName: '',
  contactMobile: '',
  businessTrack: 'post',
  collaborationPreferences: [],
  materialFiles: [],
  deferMaterials: false,
});

const talentForm = reactive({
  displayName: '',
  headline: '',
  skills: [],
  customSkills: [],
  portfolioUrls: [],
  materialFiles: [],
  applyVirtualCompany: false,
});

const isTalent = computed(() => route.meta?.onboardingMode === 'talent' || route.path.startsWith('/talent'));
const audienceHome = computed(() => (isTalent.value ? roleRouteMap.talent.home : roleRouteMap.enterprise.home));
const flowEyebrow = computed(() => (isTalent.value ? 'Talent onboarding' : 'Enterprise onboarding'));
const flowContext = computed(() => (
  isTalent.value
    ? '沿着注册后的设置节奏继续，只保留当前步骤需要填写的内容。'
    : '沿着企业端注册后的设置节奏继续，只保留当前步骤需要填写的内容。'
));

const onboardingSteps = computed(() => (
  isTalent.value
    ? [
        { id: 'profile', title: '基本资料', caption: '先写清楚你是谁' },
        { id: 'contact', title: '专长与作品', caption: '补技能和作品链接' },
        { id: 'review', title: '核对信息', caption: '确认对外展示信息' },
        { id: 'materials', title: '上传材料', caption: '最后补实名与作品材料' },
      ]
    : [
        { id: 'profile', title: '企业资料', caption: '先定义当前企业入口' },
        { id: 'contact', title: '联系人与合作偏好', caption: '确定对接人与协作方式' },
        { id: 'review', title: '核对信息', caption: '确认这次设置摘要' },
        { id: 'materials', title: '上传材料', caption: '最后补企业证明材料' },
      ]
));

const currentStepMeta = computed(() => onboardingSteps.value[currentStepIndex.value] || onboardingSteps.value[0]);
const checklistItems = computed(() => (isTalent.value ? checklists.value.talent : checklists.value.business) || []);
const materialNames = computed(() => (isTalent.value ? talentForm.materialFiles : businessForm.materialFiles).map((file) => file.name).filter(Boolean));
const currentMaterialFiles = computed(() => (isTalent.value ? talentForm.materialFiles : businessForm.materialFiles));
const sharedTalentSkills = computed(() => talentSkillOptions);
const talentSkillPayload = computed(() => buildRegisterSkillPayload(talentForm.skills, talentForm.customSkills));
const deferMaterials = computed({
  get: () => (isTalent.value ? false : businessForm.deferMaterials),
  set: (value) => {
    if (!isTalent.value) {
      businessForm.deferMaterials = Boolean(value);
    }
  },
});

const reviewRows = computed(() => {
  if (isTalent.value) {
    return [
      { label: '展示名称', value: talentForm.displayName || '待补充' },
      { label: '一句话简介', value: talentForm.headline || '待补充' },
      { label: '擅长方向', value: buildRegisterHeadline(talentSkillPayload.value.skills, talentSkillPayload.value.customSkills) || '待补充' },
      { label: '作品链接', value: talentForm.portfolioUrls.length ? `${talentForm.portfolioUrls.length} 条` : '暂未添加' },
    ];
  }
  return [
    { label: '企业名称', value: businessForm.organizationName || '待补充' },
    { label: '对接联系人', value: businessForm.contactName || '待补充' },
    { label: '手机号', value: businessForm.contactMobile || '待补充' },
    { label: '合作偏好', value: businessForm.collaborationPreferences.length ? businessForm.collaborationPreferences.join(' / ') : '待补充' },
  ];
});

const nextStepNote = computed(() => (
  isTalent.value
    ? '保存后会继续进入作品材料与实名补充流程，再决定是否开始接单。'
    : '保存后会继续进入企业审核与账单权限流程，再决定何时正式发布任务。'
));

const uploadLead = computed(() => (
  isTalent.value
    ? '把作品文件、身份证明或合作佐证放在最后一步统一上传。'
    : '把营业执照、企业证明或当前合作所需材料放在最后一步统一上传。'
));

function stepClasses(index) {
  return {
    'is-current': index === currentStepIndex.value,
    'is-complete': index < currentStepIndex.value,
  };
}

function toggleBusinessPreference(value) {
  if (businessForm.collaborationPreferences.includes(value)) {
    businessForm.collaborationPreferences = businessForm.collaborationPreferences.filter((item) => item !== value);
    return;
  }
  businessForm.collaborationPreferences = [...businessForm.collaborationPreferences, value];
}

function toggleTalentSkill(skill) {
  if (talentForm.skills.includes(skill)) {
    talentForm.skills = talentForm.skills.filter((item) => item !== skill);
    return;
  }
  talentForm.skills = [...talentForm.skills, skill];
}

function addTalentSkill() {
  const values = splitCustomSkillInput(talentSkillInput.value);
  if (!values.length) {
    talentSkillInput.value = '';
    return;
  }
  const nextSelection = buildRegisterSkillPayload(
    talentForm.skills,
    [...talentForm.customSkills, ...values]
  );
  talentForm.skills = nextSelection.skills;
  talentForm.customSkills = nextSelection.customSkills;
  talentSkillInput.value = '';
}

function removeTalentCustomSkill(value) {
  talentForm.customSkills = talentForm.customSkills.filter((item) => item !== value);
}

function addPortfolioUrl() {
  const value = portfolioInput.value.trim();
  if (!value || talentForm.portfolioUrls.includes(value)) {
    portfolioInput.value = '';
    return;
  }
  talentForm.portfolioUrls = [...talentForm.portfolioUrls, value];
  portfolioInput.value = '';
}

function removePortfolioUrl(index) {
  talentForm.portfolioUrls = talentForm.portfolioUrls.filter((_, itemIndex) => itemIndex !== index);
}

async function handleMaterialChange(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) {
    materialInputKey.value += 1;
    return;
  }
  isUploadingMaterials.value = true;
  requestError.value = '';
  try {
    const uploadedFiles = await Promise.all(files.map((file) => uploadStandaloneAttachmentAsset(file, {
      scene: 'ONBOARDING_MATERIAL',
      source: 'ONBOARDING_MATERIAL'
    })));
    if (isTalent.value) {
      talentForm.materialFiles = [...talentForm.materialFiles, ...uploadedFiles];
    } else {
      businessForm.materialFiles = [...businessForm.materialFiles, ...uploadedFiles];
    }
  } catch (error) {
    requestError.value = error instanceof Error ? error.message : '当前暂时无法上传材料，请稍后再试。';
  } finally {
    isUploadingMaterials.value = false;
    materialInputKey.value += 1;
  }
}

function removeMaterial(index) {
  if (isTalent.value) {
    talentForm.materialFiles = talentForm.materialFiles.filter((_, itemIndex) => itemIndex !== index);
  } else {
    businessForm.materialFiles = businessForm.materialFiles.filter((_, itemIndex) => itemIndex !== index);
  }
}

function buildSubmittedMaterialUrls(items) {
  return items
    .map((file) => file.url || file.downloadUrl || '')
    .filter(Boolean);
}

function buildSubmittedMaterialFiles(items) {
  return items.map((file) => ({
    name: file.name || '审核材料',
    type: file.mimeType || file.type || 'application/octet-stream',
    size: Number(file.size || 0),
    url: file.url || file.downloadUrl || '',
    uploadId: file.uploadId || '',
    objectKey: file.objectKey || '',
  }));
}

function validateCurrentStep() {
  requestError.value = '';

  if (currentStepMeta.value.id === 'profile') {
    if (isTalent.value) {
      if (!talentForm.displayName.trim()) {
        requestError.value = '先补展示名称。';
        return false;
      }
      if (!talentForm.headline.trim()) {
        requestError.value = '先补一句话简介。';
        return false;
      }
      return true;
    }
    if (!businessForm.organizationName.trim()) {
      requestError.value = '先补企业名称。';
      return false;
    }
    return true;
  }

  if (currentStepMeta.value.id === 'contact') {
    if (isTalent.value) {
      if (portfolioInput.value.trim()) {
        addPortfolioUrl();
      }
      const totalSkills = talentSkillPayload.value.skills.length + talentSkillPayload.value.customSkills.length;
      if (!totalSkills) {
        requestError.value = '先补至少两个擅长方向。';
        return false;
      }
      if (totalSkills < 2 || totalSkills > 6) {
        requestError.value = '请保持 2 到 6 个擅长方向。';
        return false;
      }
      if (!talentForm.portfolioUrls.length) {
        requestError.value = '先补至少一条作品链接。';
        return false;
      }
      return true;
    }
    if (!businessForm.contactName.trim()) {
      requestError.value = '先补联系人姓名。';
      return false;
    }
    if (!businessForm.contactMobile.trim()) {
      requestError.value = '先补联系人手机号。';
      return false;
    }
    return true;
  }

  if (currentStepMeta.value.id === 'materials' && !deferMaterials.value && !materialNames.value.length) {
    requestError.value = isTalent.value ? '先上传至少一份材料，或者勾选稍后补充。' : '先上传至少一份企业材料，或者勾选稍后补充。';
    return false;
  }

  return true;
}

function goBack() {
  requestError.value = '';
  if (currentStepIndex.value === 0) {
    router.push(audienceHome.value);
    return;
  }
  currentStepIndex.value -= 1;
}

async function goNext() {
  if (isLoading.value || isSubmitting.value) {
    return;
  }
  if (isUploadingMaterials.value) {
    requestError.value = '材料还在上传中，上传完成后再继续提交。';
    return;
  }
  if (!validateCurrentStep()) {
    return;
  }
  if (currentStepIndex.value < onboardingSteps.value.length - 1) {
    currentStepIndex.value += 1;
    return;
  }
  await submitCurrentFlow();
}

async function submitCurrentFlow() {
  isSubmitting.value = true;
  requestError.value = '';
  submitResult.value = null;
  try {
    const payload = isTalent.value
      ? {
          displayName: talentForm.displayName,
          headline: talentForm.headline,
          skills: talentSkillPayload.value.skills,
          customSkills: talentSkillPayload.value.customSkills,
          portfolioUrls: talentForm.portfolioUrls,
          applyVirtualCompany: talentForm.applyVirtualCompany,
          materials: buildSubmittedMaterialUrls(talentForm.materialFiles),
          materialFiles: buildSubmittedMaterialFiles(talentForm.materialFiles),
        }
      : {
          organizationName: businessForm.organizationName,
          contactName: businessForm.contactName,
          contactMobile: businessForm.contactMobile,
          collaborationPreferences: businessForm.collaborationPreferences,
          deferMaterials: businessForm.deferMaterials,
          materials: buildSubmittedMaterialUrls(businessForm.materialFiles),
          materialFiles: buildSubmittedMaterialFiles(businessForm.materialFiles),
        };

    const response = isTalent.value
      ? await submitTalentOnboarding(payload)
      : await submitBusinessOnboarding(payload);

    const failed = Boolean(response?.requestError || response?.status === 'FAILED' || response?.success === false);
    if (failed) {
      const normalizedError = response?.requestError === 'portfolioUrls 不能为空'
        ? '先补至少一条作品链接。'
        : response?.requestError === '请保持 2 到 6 个技能标签后再提交审核。'
          ? '请保持 2 到 6 个擅长方向。'
          : response?.requestError;
      submitResult.value = {
        tone: 'error',
        eyebrow: '当前状态',
        title: isTalent.value ? '人才设置提交失败' : '企业设置提交失败',
        body: normalizedError || response?.nextStep || '当前暂时无法提交，请稍后重试。',
        actionLabel: '返回继续修改',
        nextRoute: '',
      };
      return;
    }

    submitResult.value = {
      tone: 'success',
      eyebrow: '当前状态',
      title: isTalent.value ? '人才设置已保存' : '企业设置已保存',
      body: response?.nextStep || (isTalent.value ? '下一步继续补齐作品材料和实名信息。' : '下一步继续补齐企业材料并等待审核。'),
      actionLabel: isTalent.value ? '继续进入人才工作台' : '继续进入企业工作台',
      nextRoute: response?.nextRoute || audienceHome.value,
    };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : '';
    const friendlyMessage = rawMessage.includes('portfolioUrls')
      ? '先补至少一条作品链接。'
      : rawMessage.includes('请保持 2 到 6 个技能标签后再提交审核')
        ? '请保持 2 到 6 个擅长方向。'
      : rawMessage;
    submitResult.value = {
      tone: 'error',
      eyebrow: '当前状态',
      title: isTalent.value ? '人才设置提交失败' : '企业设置提交失败',
      body: friendlyMessage || '当前暂时无法提交，请稍后重试。',
      actionLabel: '返回继续修改',
      nextRoute: '',
    };
  } finally {
    isSubmitting.value = false;
  }
}

function resetAfterResult() {
  submitResult.value = null;
}

function continueAfterResult() {
  const nextRoute = submitResult.value?.nextRoute || audienceHome.value;
  router.push(nextRoute);
}

onMounted(async () => {
  try {
    const payload = await getOnboardingChecklists();
    checklists.value = {
      business: Array.isArray(payload?.business) ? payload.business : [],
      talent: Array.isArray(payload?.talent) ? payload.talent : [],
    };
  } catch (error) {
    requestError.value = error instanceof Error ? error.message : '当前暂时无法读取入驻清单。';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.setup-flow-shell {
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px;
  border-radius: 32px;
  background: linear-gradient(180deg, #ffffff 0%, #fafbf7 100%);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 24px;
}

.setup-flow-hero {
  display: grid;
  gap: 18px;
}

.setup-flow-eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  width: fit-content;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #f5f8ee;
  color: #6c7767;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.setup-flow-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 28px;
  align-items: end;
}

.setup-flow-hero-grid h1 {
  margin: 0;
  font-size: clamp(44px, 5.8vw, 76px);
  line-height: 0.94;
  letter-spacing: -0.06em;
}

.setup-flow-hero-grid p {
  margin: 10px 0 0;
  font-size: 20px;
  line-height: 1.55;
  color: #6a7667;
}

.setup-flow-context {
  align-self: end;
  margin: 0;
  color: #6a7667;
}

.onboarding-stepper {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.onboarding-stepper__item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 16px 18px;
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: #f7f8f3;
}

.onboarding-stepper__item strong,
.onboarding-stepper__item small {
  display: block;
}

.onboarding-stepper__item strong {
  font-size: 17px;
  line-height: 1.2;
}

.onboarding-stepper__item small {
  margin-top: 6px;
  color: #748072;
  line-height: 1.45;
}

.onboarding-stepper__index {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  background: #e9ecf6;
  color: #28417a;
}

.onboarding-stepper__item.is-current {
  border-color: rgba(16, 138, 0, 0.3);
  background: #f3fbef;
}

.onboarding-stepper__item.is-current .onboarding-stepper__index,
.onboarding-stepper__item.is-complete .onboarding-stepper__index {
  background: #108a00;
  color: #fff;
}

.setup-flow-card {
  padding: 32px;
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
  display: grid;
  gap: 24px;
}

.setup-flow-state,
.setup-flow-alert {
  padding: 18px 20px;
  border-radius: 18px;
  background: #f7f8f3;
  color: #536152;
}

.setup-flow-alert.is-error {
  background: #fff3f1;
  color: #a03a22;
}

.setup-flow-section-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.setup-flow-field {
  display: grid;
  gap: 8px;
}

.setup-flow-field--full {
  grid-column: 1 / -1;
}

.setup-flow-field label {
  font-size: 15px;
  font-weight: 600;
  color: #576453;
}

.setup-flow-input,
.setup-flow-textarea {
  width: 100%;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #ffffff;
  color: #1c271c;
  border-radius: 18px;
  padding: 16px 18px;
  font: inherit;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.setup-flow-input:focus,
.setup-flow-textarea:focus {
  border-color: rgba(16, 138, 0, 0.48);
  box-shadow: 0 0 0 4px rgba(16, 138, 0, 0.12);
}

.setup-flow-textarea {
  resize: vertical;
  min-height: 140px;
}

.setup-flow-choice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.setup-flow-choice-grid--single {
  grid-template-columns: 1fr;
}

.setup-flow-choice {
  text-align: left;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: linear-gradient(180deg, #ffffff 0%, #fafcf8 100%);
  cursor: pointer;
}

.setup-flow-choice.is-selected {
  border-color: rgba(16, 138, 0, 0.35);
  background: linear-gradient(180deg, #f5fbf1 0%, #eff9ea 100%);
  box-shadow: 0 18px 30px rgba(16, 138, 0, 0.08);
}

.setup-flow-choice__eyebrow,
.setup-flow-helper-card__eyebrow,
.setup-flow-result__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f3f5ee;
  border: 1px solid rgba(17, 24, 39, 0.08);
  color: #738070;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.setup-flow-choice strong {
  display: block;
  margin-top: 12px;
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.setup-flow-choice p,
.setup-flow-helper-card p,
.setup-flow-result p {
  margin: 10px 0 0;
  color: #667262;
  line-height: 1.65;
}

.setup-flow-tag-editor,
.setup-flow-list-editor,
.setup-flow-upload-panel {
  display: grid;
  gap: 14px;
}

.setup-flow-inline-input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.setup-flow-chip-list,
.setup-flow-list,
.setup-flow-file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.setup-flow-chip,
.setup-flow-file-list__item,
.setup-flow-list__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: #f7f8f3;
}

.setup-flow-chip.is-filled {
  background: #edf7e8;
  border-color: rgba(16, 138, 0, 0.22);
  cursor: pointer;
}

.setup-flow-checkbox-card {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fbfbf8;
}

.setup-flow-checkbox-card strong {
  display: block;
  font-size: 18px;
}

.setup-flow-checkbox-card p {
  margin: 8px 0 0;
  color: #6b7667;
}

.setup-flow-review-list {
  display: grid;
  gap: 12px;
}

.setup-flow-review-row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}

.setup-flow-review-row:last-child {
  border-bottom: none;
}

.setup-flow-review-row span {
  color: #6f7a6c;
}

.setup-flow-review-row strong {
  text-align: right;
}

.setup-flow-helper-card {
  padding: 22px;
  border-radius: 24px;
  background: #f7f8f2;
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.setup-flow-helper-card ul {
  margin: 14px 0 0;
  padding-left: 18px;
  color: #667262;
  line-height: 1.7;
}

.setup-flow-upload-box {
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 160px;
  border-radius: 24px;
  border: 1px dashed rgba(17, 24, 39, 0.18);
  background: linear-gradient(180deg, #fbfcf8 0%, #f7f8f2 100%);
  cursor: pointer;
  text-align: center;
  padding: 20px;
}

.setup-flow-file-input {
  display: none;
}

.setup-flow-result {
  background: #fff;
}

.setup-flow-result.is-success {
  border-color: rgba(16, 138, 0, 0.2);
  background: linear-gradient(180deg, #f5fbf1 0%, #ffffff 100%);
}

.setup-flow-result.is-error {
  border-color: rgba(204, 75, 49, 0.18);
  background: linear-gradient(180deg, #fff4f1 0%, #ffffff 100%);
}

.setup-flow-result h2 {
  margin: 0;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.setup-flow-result__actions,
.setup-flow-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

@media (max-width: 980px) {
  .setup-flow-shell {
    padding: 24px;
  }

  .setup-flow-hero-grid,
  .onboarding-stepper,
  .setup-flow-section-grid {
    grid-template-columns: 1fr;
  }

  .setup-flow-inline-input,
  .setup-flow-actions,
  .setup-flow-result__actions,
  .setup-flow-review-row {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
