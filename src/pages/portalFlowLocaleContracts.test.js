import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

function read(relPath) {
  return fs.readFileSync(path.join(projectRoot, relPath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const homePage = read('frontend/src/pages/HomePage.vue');
const registerPage = read('frontend/src/pages/RegisterPage.vue');
const authPage = read('frontend/src/pages/AuthPage.vue');
const styleSheet = read('frontend/src/style.css');
const onboardingPage = read('frontend/src/pages/OnboardingPage.vue');
const messagesPage = read('frontend/src/pages/MessagesPage.vue');
const recordDetailPage = read('frontend/src/pages/RecordDetailPage.vue');
const recordDetailViewModel = read('frontend/src/pages/recordDetailViewModel.js');
const publishTaskPage = read('frontend/src/pages/PublishTaskPage.vue');
const assistantPage = read('frontend/src/pages/AssistantPage.vue');

assert(
  homePage.includes("{ label: '商务合作', note: '适合企业入驻、渠道合作、方案咨询。' }"),
  '首页联系卡应使用固定中文说明'
);
assert(
  registerPage.includes("result?.requestError || result?.message || '请检查填写信息后重试。'"),
  '注册页应优先显示后端真实错误'
);
assert(
  registerPage.includes('portal-register-shell')
    && registerPage.includes('portal-register-card')
    && registerPage.includes('portal-register-stepper')
    && registerPage.includes('portal-register-role-card')
    && registerPage.includes('portal-register-input')
    && registerPage.includes('创建账号并继续')
    && !registerPage.includes('register-hero')
    && !registerPage.includes('publish-stepper register-stepper'),
  'RegisterPage 应切到 Upwork 式单卡注册结构，而不是继续使用旧的 hero + glass-panel + publish-stepper 混搭。'
);
assert(
  authPage.includes('portal-auth-shell')
    && authPage.includes('portal-auth-card')
    && authPage.includes('登录企业账号')
    && authPage.includes('登录人才账号')
    && authPage.includes('登录并继续')
    && authPage.includes('创建新账号')
    && !authPage.includes('auth-hero')
    && !authPage.includes('auth-proof-grid'),
  'AuthPage 应切到 Upwork 式中央单卡登录结构，而不是继续使用旧的 hero + 双栏壳层。'
);
assert(
  styleSheet.includes('codex portal light-theme final override'),
  'portal 页面应有最终浅色主题覆盖样式'
);
assert(
  styleSheet.includes('--field-dark-text: #eef4ff;')
    && styleSheet.includes('--field-dark-placeholder: rgba(208, 220, 236, 0.54);')
    && styleSheet.includes('.text-input:-webkit-autofill')
    && styleSheet.includes('-webkit-text-fill-color: var(--field-dark-text);')
    && styleSheet.includes('.room-search-input,')
    && styleSheet.includes('.message-input {')
    && styleSheet.includes('caret-color: var(--field-dark-text);'),
  '深色输入框应使用独立的浅色文字变量，并覆盖 autofill 文本颜色，避免在浅色全局主题下出现黑底黑字。'
);
assert(
  styleSheet.includes('.app-shell--portal .portal-contact-card {')
    && styleSheet.includes('grid-template-columns: minmax(0, 1fr) minmax(240px, auto);')
    && styleSheet.includes('.app-shell--portal .portal-contact-card .contact-card-main > div {')
    && styleSheet.includes('display: grid;')
    && styleSheet.includes('gap: 10px;')
    && styleSheet.includes('.app-shell--portal .portal-contact-card h4 {')
    && styleSheet.includes('line-height: 1.08;')
    && styleSheet.includes('.app-shell--portal .portal-contact-card p {')
    && styleSheet.includes('line-height: 1.6;'),
  '首页联系卡应有独立的 grid 布局和标题/说明排版层级，避免标题和说明文字继续挤在一起。'
);
assert(
  onboardingPage.includes('setup-flow-shell')
    && onboardingPage.includes('Enterprise onboarding')
    && onboardingPage.includes('Talent onboarding')
    && onboardingPage.includes('企业资料')
    && onboardingPage.includes('上传材料')
    && !onboardingPage.includes('Loading your onboarding checklist.')
    && !onboardingPage.includes('Submit freelancer onboarding'),
  'OnboardingPage 应切到新的单列 setup flow，并清掉旧的英文 loading / submit 文案。'
);
assert(
  !messagesPage.includes('Contract messages'),
  'MessagesPage 不应保留英文合同消息文案'
);
assert(
  !recordDetailPage.includes('Finance follow-up'),
  'RecordDetailPage 不应保留英文财务跟进文案'
);
assert(
  !recordDetailPage.includes('合作记录 unavailable')
    && !recordDetailPage.includes('Timeline {{ viewModel.dateRangeLabel }}')
    && !recordDetailPage.includes('验收 notes, work updates, and milestones will collect here over time.')
    && !recordDetailPage.includes('Next step')
    && !recordDetailPage.includes('记录 keeps finance follow-up secondary here.')
    && !recordDetailPage.includes('合作记录 is unavailable')
    && !recordDetailPage.includes('confirmation记录')
    && recordDetailPage.includes('合作记录暂时不可用')
    && recordDetailPage.includes('时间线 {{ viewModel.dateRangeLabel }}')
    && recordDetailPage.includes('验收记录、工作更新和里程碑会继续沉淀在这里。')
    && recordDetailPage.includes('当前财务步骤'),
  'RecordDetailPage 应使用中文记录文案，并且读取真实的 confirmationHistory 字段。'
);
assert(
  !recordDetailViewModel.includes('Contract value')
    && recordDetailViewModel.includes("amountNote: '合同金额'"),
  'recordDetailViewModel 不应保留英文合同金额兜底。'
);
assert(
  !publishTaskPage.includes('This action did not complete. Try again.'),
  'PublishTaskPage 不应保留英文失败提示'
);
assert(
  publishTaskPage.includes('publish-upwork-shell')
    && publishTaskPage.includes('发布任务 / 第 {{ publishStep + 1 }} 步')
    && publishTaskPage.includes('让 AI 帮我起草')
    && publishTaskPage.includes('用 AI 拆分任务')
    && publishTaskPage.includes('选择发布方式')
    && publishTaskPage.includes('发布职位'),
  'PublishTaskPage 应切到新的 Upwork 式五步发布流，并保留嵌入式 AI 辅助。'
);
assert(
  !assistantPage.includes('Choose context'),
  'AssistantPage 不应保留英文上下文标题'
);
assert(
  !assistantPage.includes('Attach Assistant to'),
  'AssistantPage 不应保留英文附着描述'
);
assert(
  assistantPage.includes("source: surfaceMode.value ? surfaceMode.value.toUpperCase() : 'TEXT'"),
  'AssistantPage 分析请求应使用稳定的 surfaceMode source 字段'
);

console.log('portalFlowLocaleContracts: ok');
