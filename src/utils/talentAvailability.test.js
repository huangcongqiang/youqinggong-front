import assert from 'node:assert';
import { formatTalentAvailability } from './talentAvailability.js';

assert.equal(
  formatTalentAvailability(['本周档期已基本排满', '当前有 1 个进行中合作', '可配合在线沟通、阶段验收和文档化交付']),
  '本周档期已基本排满 / 当前有 1 个进行中合作 / 可配合在线沟通、阶段验收和文档化交付',
  'formatTalentAvailability should join array availability values into a readable label.'
);

assert.equal(
  formatTalentAvailability('可立即开始'),
  '可立即开始',
  'formatTalentAvailability should keep plain string availability unchanged.'
);

assert.equal(
  formatTalentAvailability('["本周档期已基本排满","当前有 1 个进行中合作"]'),
  '本周档期已基本排满 / 当前有 1 个进行中合作',
  'formatTalentAvailability should parse JSON array strings from APIs before rendering.'
);
