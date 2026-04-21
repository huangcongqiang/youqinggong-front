export const SHARED_SKILL_GROUPS = [
  {
    key: 'strategy',
    title: '产品与策划',
    items: ['需求梳理', '产品策划', '项目管理', '品牌策划', '内容策划']
  },
  {
    key: 'design',
    title: '设计与视觉',
    items: ['UI 设计', '平面设计', '品牌设计', '插画设计', '三维设计']
  },
  {
    key: 'video',
    title: '视频与内容制作',
    items: ['短视频脚本', '视频拍摄', '视频剪辑', '后期包装', '直播内容']
  },
  {
    key: 'engineering',
    title: '技术与开发',
    items: ['前端开发', '后端开发', '全栈开发', '小程序开发', 'AI 应用开发']
  },
  {
    key: 'growth',
    title: '运营与增长',
    items: ['新媒体运营', '投流优化', '数据分析', '社群运营', '电商运营']
  }
];

export const SHARED_SKILL_OPTIONS = SHARED_SKILL_GROUPS.flatMap((group) => group.items);

const presetSkillMap = new Map(
  SHARED_SKILL_OPTIONS.map((item) => [buildSharedSkillKey(item), item])
);

const aliasSkillMap = new Map([
  ['ui/ux设计', 'UI 设计'],
  ['ui / ux 设计', 'UI 设计'],
  ['ui ux 设计', 'UI 设计'],
  ['ui设计', 'UI 设计'],
  ['ux设计', 'UI 设计'],
  ['交互设计', 'UI 设计'],
  ['界面设计', 'UI 设计'],
  ['视觉设计', '平面设计'],
  ['品牌视觉', '品牌设计'],
  ['三维', '三维设计'],
  ['3d设计', '三维设计'],
  ['文案', '内容策划'],
  ['内容创作', '内容策划'],
  ['脚本创作', '短视频脚本'],
  ['脚本策划', '短视频脚本'],
  ['拍摄', '视频拍摄'],
  ['剪辑', '视频剪辑'],
  ['视频后期', '后期包装'],
  ['直播', '直播内容'],
  ['全栈', '全栈开发'],
  ['full stack', '全栈开发'],
  ['full-stack', '全栈开发'],
  ['前端', '前端开发'],
  ['web前端', '前端开发'],
  ['后端', '后端开发'],
  ['服务端', '后端开发'],
  ['java后端', '后端开发'],
  ['小程序', '小程序开发'],
  ['ai开发', 'AI 应用开发'],
  ['ai agent工作流', 'AI 应用开发'],
  ['智能体工作流', 'AI 应用开发'],
  ['运营', '新媒体运营'],
  ['增长运营', '新媒体运营'],
  ['投流', '投流优化'],
  ['数据运营', '数据分析'],
  ['社群', '社群运营'],
  ['电商', '电商运营']
]);

export function normalizeSharedSkillText(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().replace(/\s+/g, ' ');
}

export function buildSharedSkillKey(value) {
  return normalizeSharedSkillText(value)
    .toLowerCase()
    .replace(/\s*[／/]\s*/g, '/')
    .replace(/\s*[+＋]\s*/g, '+')
    .replace(/\s+/g, ' ');
}

export function resolveSharedSkillLabel(value) {
  const normalized = normalizeSharedSkillText(value);
  if (!normalized) {
    return '';
  }
  const key = buildSharedSkillKey(normalized);
  return aliasSkillMap.get(key) || presetSkillMap.get(key) || normalized;
}

export function isPresetSharedSkill(value) {
  return presetSkillMap.has(buildSharedSkillKey(resolveSharedSkillLabel(value)));
}

export function buildSharedSkillSelection(selectedSkills = [], customSkills = []) {
  const skills = [];
  const normalizedCustomSkills = [];
  const seen = new Set();

  for (const item of Array.isArray(selectedSkills) ? selectedSkills : []) {
    const label = resolveSharedSkillLabel(item);
    const key = buildSharedSkillKey(label);
    if (!label || seen.has(key)) {
      continue;
    }
    if (isPresetSharedSkill(label)) {
      skills.push(label);
      seen.add(key);
    }
  }

  for (const item of Array.isArray(customSkills) ? customSkills : []) {
    const label = resolveSharedSkillLabel(item);
    const key = buildSharedSkillKey(label);
    if (!label || seen.has(key)) {
      continue;
    }
    if (isPresetSharedSkill(label)) {
      skills.push(label);
    } else {
      normalizedCustomSkills.push(label);
    }
    seen.add(key);
  }

  return {
    skills,
    customSkills: normalizedCustomSkills,
    allSkills: [...skills, ...normalizedCustomSkills]
  };
}
