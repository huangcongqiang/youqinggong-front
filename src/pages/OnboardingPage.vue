<template>
  <section class="page-stack" v-if="checklists">
    <article class="hero-card">
      <SectionTitle
        eyebrow="入驻申请"
        title="先把身份和材料整理清楚，再开始连接任务和人才。"
        description="企业、个人品牌方和人才都从这里进入平台。为了让后续匹配、沟通和交付更顺，这一页会先把资料结构化。"
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
    </article>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="提交资料"
          :title="mode === 'business' ? '招聘端入驻表单' : '人才端入驻表单'"
          :description="mode === 'business'
            ? '企业上传资质，个人品牌方可按虚拟企业路径提交实名材料。'
            : '人才提交简介、技能、作品和可选的虚拟企业申请信息。'"
        />

        <form v-if="mode === 'business'" class="form-grid" @submit.prevent="handleBusinessSubmit">
          <div class="form-field">
            <label for="org-name">企业名称</label>
            <input id="org-name" v-model="businessForm.organizationName" class="text-input" placeholder="例如：星河智能" />
          </div>
          <div class="form-field">
            <label for="contact-name">联系人</label>
            <input id="contact-name" v-model="businessForm.contactName" class="text-input" placeholder="例如：王晴" />
          </div>
          <div class="form-field">
            <label for="contact-mobile">联系电话</label>
            <input id="contact-mobile" v-model="businessForm.contactMobile" class="text-input" placeholder="例如：13800000001" />
          </div>
          <div class="form-field">
            <label for="org-type">入驻类型</label>
            <select id="org-type" v-model="businessForm.virtualCompany" class="select-input">
              <option :value="false">企业</option>
              <option :value="true">个人申请虚拟企业</option>
            </select>
          </div>
          <div class="form-field full">
            <label for="materials">材料清单</label>
            <textarea
              id="materials"
              v-model="businessMaterialsInput"
              class="textarea"
              placeholder="每行一项，例如：营业执照&#10;法人身份证&#10;品牌介绍"
            ></textarea>
          </div>
          <div class="form-field full">
            <div class="toolbar">
              <button class="button-primary" type="submit">提交招聘端入驻</button>
              <button class="button-secondary" type="button" @click="resetBusinessForm">重置</button>
            </div>
          </div>
        </form>

        <form v-else class="form-grid" @submit.prevent="handleTalentSubmit">
          <div class="form-field">
            <label for="talent-name">姓名 / 品牌名</label>
            <input id="talent-name" v-model="talentForm.displayName" class="text-input" placeholder="例如：陈一宁" />
          </div>
          <div class="form-field">
            <label for="talent-headline">擅长方向</label>
            <input id="talent-headline" v-model="talentForm.headline" class="text-input" placeholder="例如：AI 产品设计 + 全栈开发" />
          </div>
          <div class="form-field full">
            <label for="talent-skills">技能标签</label>
            <textarea
              id="talent-skills"
              v-model="talentSkillsInput"
              class="textarea"
              placeholder="用逗号分隔，例如：Vue 3, Java, MySQL, AI Agent"
            ></textarea>
          </div>
          <div class="form-field full">
            <label for="portfolio-urls">作品链接</label>
            <textarea
              id="portfolio-urls"
              v-model="talentPortfolioInput"
              class="textarea"
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
          <div class="form-field full">
            <div class="toolbar">
              <button class="button-primary" type="submit">提交人才入驻</button>
              <button class="button-secondary" type="button" @click="resetTalentForm">重置</button>
            </div>
          </div>
        </form>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="准备清单"
          title="平台会先审材料，再开权限。"
          description="这一步决定了后续是否能发布任务、聊天和被系统正常匹配，所以资料建议一次准备齐。"
        />

        <div class="stack-sm">
          <div v-for="(item, index) in checklistItems" :key="item" class="list-row">
            <div class="title-line">
              <span class="badge-number">{{ index + 1 }}</span>
              <div>
                <h4>{{ item }}</h4>
                <p class="muted">通过审核后，平台会放开对应的业务权限。</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="submitResult" class="result-card">
          <span class="eyebrow">提交结果</span>
          <h3>{{ resultTitle }}</h3>
          <p class="muted">{{ submitResult.nextStep }}</p>
          <div class="tag-row">
            <span v-for="(value, key) in resultSummary" :key="key" class="soft-pill">{{ key }}：{{ value }}</span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { getOnboardingChecklists, submitBusinessOnboarding, submitTalentOnboarding } from '../services/api';

const route = useRoute();
const mode = ref('business');
const checklists = ref(null);
const submitResult = ref(null);

const businessForm = ref({
  organizationName: '',
  contactName: '',
  contactMobile: '',
  virtualCompany: false
});
const businessMaterialsInput = ref('');

const talentForm = ref({
  displayName: '',
  headline: '',
  applyVirtualCompany: false
});
const talentSkillsInput = ref('');
const talentPortfolioInput = ref('');

const checklistItems = computed(() => (mode.value === 'business' ? checklists.value.business : checklists.value.talent));

const resultTitle = computed(() => (mode.value === 'business' ? '招聘端入驻申请已提交' : '人才入驻申请已提交'));

const resultSummary = computed(() => {
  if (!submitResult.value) {
    return {};
  }
  if (mode.value === 'business') {
    return {
      企业: submitResult.value.organizationName,
      联系人: submitResult.value.contactName,
      状态: submitResult.value.status
    };
  }
  return {
    人才: submitResult.value.displayName,
    方向: submitResult.value.headline,
    状态: submitResult.value.status
  };
});

function syncModeFromRoute() {
  mode.value = route.meta.onboardingMode || 'business';
  submitResult.value = null;
}

function resetBusinessForm() {
  businessForm.value = {
    organizationName: '',
    contactName: '',
    contactMobile: '',
    virtualCompany: false
  };
  businessMaterialsInput.value = '';
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

async function handleBusinessSubmit() {
  submitResult.value = await submitBusinessOnboarding({
    ...businessForm.value,
    materials: businessMaterialsInput.value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  });
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
}

onMounted(async () => {
  syncModeFromRoute();
  checklists.value = await getOnboardingChecklists();
});

watch(() => route.meta.onboardingMode, syncModeFromRoute);
</script>
