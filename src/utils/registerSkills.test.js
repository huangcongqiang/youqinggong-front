import { buildRegisterHeadline, buildRegisterSkills } from './registerSkills.js';

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}\nexpected: ${JSON.stringify(expected)}\nactual: ${JSON.stringify(actual)}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nexpected: ${expected}\nactual: ${actual}`);
  }
}

assertDeepEqual(
  buildRegisterSkills(['AI 产品设计', '全栈开发', 'AI 产品设计'], '  智能硬件  ', true),
  ['AI 产品设计', '全栈开发', '智能硬件'],
  'buildRegisterSkills should merge selected tags with a unique custom tag'
);

assertDeepEqual(
  buildRegisterSkills(['增长运营', '设计系统'], '设计系统', true),
  ['增长运营', '设计系统'],
  'buildRegisterSkills should ignore duplicate custom tags'
);

assertDeepEqual(
  buildRegisterSkills(['品牌设计'], ' UI/UX ', true),
  ['品牌设计', 'UI / UX 设计'],
  'buildRegisterSkills should map custom values onto an existing preset label before deciding whether to add a new tag'
);

assertDeepEqual(
  buildRegisterSkills(['增长运营', '设计系统'], '内容创作', false),
  ['增长运营', '设计系统'],
  'buildRegisterSkills should ignore disabled custom tags'
);

assertEqual(
  buildRegisterHeadline(['AI 产品设计', '全栈开发', '智能硬件']),
  'AI 产品设计 / 全栈开发 / 智能硬件',
  'buildRegisterHeadline should join normalized tags'
);
