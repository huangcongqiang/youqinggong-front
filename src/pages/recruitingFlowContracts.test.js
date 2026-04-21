import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'assert'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')

function read(relPath) {
  return fs.readFileSync(path.resolve(root, relPath), 'utf8')
}

const router = read('router.js')
const routes = read('utils/roleRoutes.js')
const recruitingPage = read('pages/RecruitingPage.vue')
const talentMarketPage = read('pages/TalentMarketPage.vue')
const api = read('services/api.js')

assert(router.includes("path: '/enterprise/recruiting'"), 'router should expose the independent enterprise recruiting page route.')
assert(routes.includes("recruiting: '/enterprise/recruiting'"), 'roleRoutes should expose the enterprise recruiting route.')

assert(recruitingPage.includes('任务 -> 申请人 -> 动作'), 'RecruitingPage should stay focused on task -> applicant -> action.')
assert(recruitingPage.includes('查看人才详情'), 'RecruitingPage should route enterprise users directly into talent detail pages from applicant cards.')
assert(recruitingPage.includes('v-if="app.detailRoute"'), 'RecruitingPage should only show the talent detail action when a real detail route exists.')
assert(recruitingPage.includes('约面试'), 'RecruitingPage should expose interview invite action.')
assert(recruitingPage.includes('拒绝申请'), 'RecruitingPage should expose reject application action.')
assert(recruitingPage.includes('继续沟通'), 'RecruitingPage should expose continue chat action.')
assert(recruitingPage.includes('面试未通过'), 'RecruitingPage should expose failed interview action.')
assert(recruitingPage.includes('通过面试并确认合作'), 'RecruitingPage should expose pass-and-confirm action.')
assert(recruitingPage.includes('先填写面试时间。'), 'RecruitingPage should validate interview time before sending invite.')
assert(recruitingPage.includes('先填写腾讯会议号。'), 'RecruitingPage should validate Tencent meeting code before sending invite.')
assert(recruitingPage.includes('const activeTaskId = computed(() => {'), 'RecruitingPage should derive an active task id from loaded task data when the route query is missing.')
assert(recruitingPage.includes('task.taskId || task.id ||'), 'RecruitingPage should fall back to the loaded recruiting task id for write actions.')

assert(!talentMarketPage.includes('matchingMode'), 'TalentMarketPage should no longer carry matching-mode recruiting behavior.')
assert(!talentMarketPage.includes('activeMatchingTaskId'), 'TalentMarketPage should no longer depend on active matching task ids.')
assert(!talentMarketPage.includes('确认合作并开启沟通'), 'TalentMarketPage should not keep recruiting confirmation CTA text.')

assert(api.includes('getRecruitingWorkspaceData'), 'api.js should export recruiting workspace loader.')
assert(api.includes('sendRecruitingInterviewInvite'), 'api.js should export interview invite submitter.')
assert(api.includes('respondRecruitingInterviewInvite'), 'api.js should export talent interview response action.')
assert(api.includes('recordRecruitingInterviewOutcome'), 'api.js should export interview outcome recorder.')
assert(api.includes('confirmRecruitingCooperation'), 'api.js should export recruiting confirmation action.')
