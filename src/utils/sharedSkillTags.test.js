import assert from 'assert';
import {
  SHARED_SKILL_OPTIONS,
  buildSharedSkillKey,
  buildSharedSkillSelection,
  isPresetSharedSkill,
  normalizeSharedSkillText,
  resolveSharedSkillLabel,
} from './sharedSkillTags.js';

assert.equal(normalizeSharedSkillText('  前端  开发  '), '前端 开发');
assert.equal(buildSharedSkillKey('UI / UX 设计'), 'ui/ux 设计');

assert.equal(resolveSharedSkillLabel('ui设计'), 'UI 设计');
assert.equal(resolveSharedSkillLabel('全栈'), '全栈开发');
assert.equal(resolveSharedSkillLabel('品牌策划'), '品牌策划');

assert.ok(SHARED_SKILL_OPTIONS.includes('前端开发'));
assert.equal(isPresetSharedSkill('前端'), true);
assert.equal(isPresetSharedSkill('品牌策划'), true);

assert.deepEqual(
  buildSharedSkillSelection(['前端开发', 'UI 设计'], ['前端', '品牌策划', 'ui设计']),
  {
    skills: ['前端开发', 'UI 设计', '品牌策划'],
    customSkills: [],
    allSkills: ['前端开发', 'UI 设计', '品牌策划'],
  }
);

console.log('sharedSkillTags tests passed');
