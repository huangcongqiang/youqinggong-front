import fs from 'node:fs';

const source = fs.readFileSync(new URL('./OnboardingPage.vue', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const removedCopy = [
  '完成基础入驻后，再进入后续业务流程。',
  '企业端步骤引导',
  '资料清单',
  '审核会查看这些内容。',
  '平台会重点查看这些内容。',
  '当前账号',
  '建议上传',
  '可选路径'
];

removedCopy.forEach((copy) => {
  assert(!source.includes(copy), `OnboardingPage should not render explanatory module copy: ${copy}`);
});

assert(!source.includes('getOnboardingChecklists'), 'OnboardingPage should not depend on onboarding checklist panels');
assert(source.includes('提交人才入驻'), 'OnboardingPage should still keep the talent submit action');
assert(source.includes('提交企业入驻申请'), 'OnboardingPage should still keep the enterprise submit action');
