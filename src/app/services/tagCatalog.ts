export const DEFAULT_SKILL_TAGS = [
  "AI 产品设计",
  "全栈开发",
  "前端开发",
  "后端开发",
  "UI / UX 设计",
  "品牌设计",
  "内容创作",
  "视频剪辑",
  "增长运营",
  "AI Agent 工作流"
];

export const DEFAULT_BUSINESS_TAGS = [
  "官网建设",
  "电商零售",
  "医疗问诊",
  "教育培训",
  "审批后台",
  "财务结算",
  "企业协作",
  "内容营销",
  "数据运营",
  "客户服务"
];

export const DEFAULT_DELIVERABLE_TAGS = [
  "H5 页面",
  "后台管理系统",
  "品牌视觉",
  "数据看板",
  "小程序",
  "自动化流程",
  "API 接口",
  "落地页",
  "运营素材",
  "产品原型"
];

export type TagCatalog = {
  skills: string[];
  businessTags: string[];
  deliverableTags: string[];
  customTags: string[];
};

export function normalizeCatalog(raw: any): TagCatalog {
  return {
    skills: normalizeTags(raw?.skills, DEFAULT_SKILL_TAGS),
    businessTags: normalizeTags(raw?.businessTags, DEFAULT_BUSINESS_TAGS),
    deliverableTags: normalizeTags(raw?.deliverableTags, DEFAULT_DELIVERABLE_TAGS),
    customTags: normalizeTags(
      Array.isArray(raw?.customTags)
        ? raw.customTags.map((item: any) => item?.name || item).filter(Boolean)
        : [],
      []
    )
  };
}

export function normalizeTags(raw: unknown, fallback: string[] = []) {
  const values = Array.isArray(raw) ? raw : fallback;
  return Array.from(new Set(values.map((item) => String(item).trim()).filter(Boolean)));
}

export function mergeTags(...groups: unknown[]) {
  return Array.from(new Set(groups.flatMap((group) => normalizeTags(group))));
}

export function toggleTag(values: string[], tag: string, max = 99) {
  if (values.includes(tag)) {
    return values.filter((item) => item !== tag);
  }
  if (values.length >= max) {
    return values;
  }
  return [...values, tag];
}

export function classifyTags(raw: unknown): TagCatalog {
  const tags = normalizeTags(raw);
  const skills: string[] = [];
  const businessTags: string[] = [];
  const deliverableTags: string[] = [];
  const customTags: string[] = [];

  for (const tag of tags) {
    if (DEFAULT_SKILL_TAGS.includes(tag)) {
      skills.push(tag);
    } else if (DEFAULT_BUSINESS_TAGS.includes(tag)) {
      businessTags.push(tag);
    } else if (DEFAULT_DELIVERABLE_TAGS.includes(tag)) {
      deliverableTags.push(tag);
    } else {
      customTags.push(tag);
    }
  }

  return {
    skills: normalizeTags(skills),
    businessTags: normalizeTags(businessTags),
    deliverableTags: normalizeTags(deliverableTags),
    customTags: normalizeTags(customTags)
  };
}
