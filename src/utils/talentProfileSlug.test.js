import assert from 'assert'
import { resolveRequestedTalentSlug, resolveTalentProfileSlug } from './talentProfileSlug.js'

assert.equal(
  resolveTalentProfileSlug({ displayName: '陈一宁', platformUserId: '2' }),
  'chen-yining'
)

assert.equal(
  resolveTalentProfileSlug({ displayName: '新人才', platformUserId: '18' }),
  'user-18'
)

assert.equal(
  resolveRequestedTalentSlug('me', { displayName: '陈一宁', platformUserId: '2' }),
  'chen-yining'
)

assert.equal(
  resolveRequestedTalentSlug('lin-zhao', { displayName: '陈一宁', platformUserId: '2' }),
  'lin-zhao'
)
