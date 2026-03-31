export const talentSkillOptions = [
  'AI 产品设计',
  '全栈开发',
  '前端开发',
  '后端开发',
  'UI / UX 设计',
  '品牌设计',
  '内容创作',
  '视频剪辑',
  '增长运营',
  'AI Agent 工作流'
];

const presetSkillMap = new Map(
  talentSkillOptions.map((skill) => [buildRegisterSkillKey(skill), skill])
);
const skillAliasMap = new Map([
  [buildRegisterSkillKey('ui / ux'), 'UI / UX 设计'],
  [buildRegisterSkillKey('ui/ux'), 'UI / UX 设计'],
  [buildRegisterSkillKey('ui ux'), 'UI / UX 设计'],
  [buildRegisterSkillKey('ai agent'), 'AI Agent 工作流'],
  [buildRegisterSkillKey('agent workflow'), 'AI Agent 工作流'],
  [buildRegisterSkillKey('prompt / agent'), 'AI Agent 工作流'],
  [buildRegisterSkillKey('prompt/agent'), 'AI Agent 工作流']
]);

export function normalizeRegisterSkill(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().replace(/\s+/g, ' ');
}

function buildRegisterSkillKey(value) {
  return normalizeRegisterSkill(value)
    .toLowerCase()
    .replace(/\s*[／/]\s*/g, '/')
    .replace(/\s*[+＋]\s*/g, '+')
    .replace(/\s+/g, ' ');
}

function resolveRegisterSkillLabel(value) {
  const normalizedValue = normalizeRegisterSkill(value);
  if (!normalizedValue) {
    return '';
  }
  const skillKey = buildRegisterSkillKey(normalizedValue);
  return skillAliasMap.get(skillKey) || presetSkillMap.get(skillKey) || normalizedValue;
}

export function buildRegisterSkills(selectedSkills, customSkill = '', includeCustomSkill = false) {
  const merged = [];
  const mergedKeys = new Set();
  const normalizedCustomSkill = includeCustomSkill ? resolveRegisterSkillLabel(customSkill) : '';

  for (const skill of Array.isArray(selectedSkills) ? selectedSkills : []) {
    const normalizedSkill = resolveRegisterSkillLabel(skill);
    const normalizedKey = buildRegisterSkillKey(normalizedSkill);
    if (normalizedSkill && !mergedKeys.has(normalizedKey)) {
      merged.push(normalizedSkill);
      mergedKeys.add(normalizedKey);
    }
  }

  if (normalizedCustomSkill && !mergedKeys.has(buildRegisterSkillKey(normalizedCustomSkill))) {
    merged.push(normalizedCustomSkill);
  }

  return merged;
}

export function buildRegisterHeadline(skills) {
  return buildRegisterSkills(skills).join(' / ');
}
