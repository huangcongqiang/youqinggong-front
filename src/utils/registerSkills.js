import {
  SHARED_SKILL_OPTIONS,
  buildSharedSkillSelection,
  normalizeSharedSkillText,
} from './sharedSkillTags';

export const talentSkillOptions = SHARED_SKILL_OPTIONS;

export function normalizeRegisterSkill(value) {
  return normalizeSharedSkillText(value);
}

function splitCustomSkillInput(value) {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/[,\n，；;、]+/g)
    .map((item) => normalizeSharedSkillText(item))
    .filter(Boolean);
}

export { splitCustomSkillInput };

function resolveSkillSelection(selectedSkills, customSkills) {
  const normalizedSelected = Array.isArray(selectedSkills) ? selectedSkills : [];
  const normalizedCustom = Array.isArray(customSkills) ? customSkills : [];
  return buildSharedSkillSelection(normalizedSelected, normalizedCustom);
}

export function buildRegisterSkills(selectedSkills, customSkill = '', includeCustomSkill = false) {
  const customSkills = includeCustomSkill ? splitCustomSkillInput(customSkill) : [];
  const { skills, customSkills: normalizedCustomSkills } = resolveSkillSelection(selectedSkills, customSkills);
  return [...skills, ...normalizedCustomSkills];
}

export function buildRegisterSkillPayload(selectedSkills, customSkills = []) {
  return resolveSkillSelection(selectedSkills, customSkills);
}

export function buildRegisterHeadline(skills, customSkills = []) {
  return buildRegisterSkillPayload(skills, customSkills).allSkills.join(' / ');
}
