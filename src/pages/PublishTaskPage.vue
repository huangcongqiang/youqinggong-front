<template>
  <section class="publish-wizard-page office-publish-page">
    <div class="publish-wizard-shell">
      <header class="wizard-hero">
        <div class="wizard-hero-copy">
          <span class="trust-pill">PC 企业端发单页</span>
          <h1>先把需求讲清楚，再让系统帮你把任务发布稳。</h1>
          <p>
            这页按原来的发单节奏组织：先把需求讲明白，再补预算和合作方式，最后统一核对后发布。
          </p>
        </div>
        <aside class="wizard-account-card">
          <span class="eyebrow">当前发单账号</span>
          <strong>{{ accountLabel }}</strong>
          <p>任务发布后，推荐人才会作为自然下一步出现，不再占据主流程视觉中心。</p>
        </aside>
      </header>

      <section v-if="hasLaunchTalentContext" class="wizard-banner">
        <div>
          <span class="eyebrow">指定人才协作</span>
          <h2>这次会优先邀请 {{ launchTalentContext?.talentName || '当前人才' }}</h2>
          <p>发布成功后，系统会直接尝试把这位人才带入沟通，不再额外弹出重型推荐窗口。</p>
        </div>
        <span class="banner-tag">来源：{{ launchTalentContext?.entrySource || 'market' }}</span>
      </section>

      <section v-if="publishTradingBlocked" class="wizard-alert is-warning">
        <strong>当前账号暂不能发单</strong>
        <p>{{ publishRestrictionMessage }}</p>
      </section>

      <section v-else-if="selectionErrorNote" class="wizard-alert is-error">
        <strong>当前步骤还不能继续</strong>
        <p>{{ selectionErrorNote }}</p>
      </section>

      <section class="wizard-progress-card">
        <div class="wizard-progress-head">
          <div>
            <span class="eyebrow">发布进度</span>
            <h2>{{ currentStepMeta.title }}</h2>
            <p>{{ currentStepMeta.note }}</p>
          </div>
          <strong>{{ wizardProgress }}%</strong>
        </div>
        <div class="wizard-progress-track">
          <span class="wizard-progress-value" :style="{ width: `${wizardProgress}%` }"></span>
        </div>
        <ol class="wizard-step-list">
          <li
            v-for="step in steps"
            :key="step.id"
            class="wizard-step-chip"
            :class="stepClass(step.id)"
          >
            <button type="button" @click="jumpToStep(step.id)">
              <span>{{ step.id }}</span>
              <div>
                <strong>{{ step.title }}</strong>
                <small>{{ step.note }}</small>
              </div>
            </button>
          </li>
        </ol>
      </section>

      <div class="wizard-grid">
        <main class="wizard-main-column">
          <article v-if="currentStep === 1" class="wizard-surface wizard-question-card">
            <div class="question-header">
              <span class="question-index">01</span>
              <div>
                <h2>这份工作具体要做什么？</h2>
                <p>先选一个接近的任务模板，然后用企业自己的语言把交付结果说清楚。</p>
              </div>
            </div>

            <section class="section-stack">
              <div class="section-headline">
                <div>
                  <span class="eyebrow">任务模板</span>
                  <h3>从成熟场景开始，后面再做个性化调整</h3>
                </div>
                <span class="section-meta">{{ presets.length }} 个模板</span>
              </div>
              <div class="preset-grid">
                <button
                  v-for="preset in presets"
                  :key="preset.id"
                  type="button"
                  class="preset-card"
                  :class="{ 'is-selected': selectedPresetId === preset.id }"
                  @click="applyPreset(preset)"
                >
                  <div class="preset-card-head">
                    <div>
                      <strong>{{ preset.title }}</strong>
                      <p>{{ preset.isCustom ? '空白模板，适合自定义发布。' : preset.brief }}</p>
                    </div>
                    <span class="soft-badge">{{ preset.isCustom ? '自定义' : '推荐' }}</span>
                  </div>
                  <div class="preset-tag-row">
                    <span v-for="tag in presetPreviewTags(preset)" :key="tag" class="preset-tag">{{ tag }}</span>
                    <span v-if="countPresetTags(preset) > 2" class="preset-tag is-muted">+{{ countPresetTags(preset) - 2 }}</span>
                  </div>
                </button>
              </div>
            </section>

            <section class="section-stack">
              <div class="section-headline">
                <div>
                  <span class="eyebrow">任务描述</span>
                  <h3>像给 freelancer 发 brief 一样，先把标题和背景交代清楚</h3>
                </div>
                <span class="section-meta">当前模板：{{ selectedPreset?.title || '未选择' }}</span>
              </div>

              <div class="source-switcher">
                <button
                  type="button"
                  class="source-chip"
                  :class="{ 'is-active': publishForm.source === 'TEXT' }"
                  @click="setSource('TEXT')"
                >
                  文字需求
                </button>
                <button
                  type="button"
                  class="source-chip"
                  :class="{ 'is-active': publishForm.source === 'VOICE' }"
                  @click="setSource('VOICE')"
                >
                  语音转写
                </button>
              </div>

              <div class="field-grid two-columns">
                <label class="wizard-field field-full">
                  <span>任务标题</span>
                  <input
                    v-model="publishForm.title"
                    type="text"
                    maxlength="60"
                    placeholder="例如：新品包装升级，需要一位品牌视觉设计师"
                  />
                </label>

                <label v-if="publishForm.source === 'TEXT'" class="wizard-field field-full">
                  <span>需求描述</span>
                  <textarea
                    v-model="publishForm.brief"
                    rows="8"
                    maxlength="1500"
                    placeholder="说明业务背景、想解决的问题、交付预期，以及你已经有的素材或约束。"
                  ></textarea>
                </label>

                <label v-else class="wizard-field field-full">
                  <span>语音转写内容</span>
                  <textarea
                    v-model="publishForm.voiceTranscript"
                    rows="8"
                    maxlength="1500"
                    placeholder="粘贴转写文本，系统会按语音纪要来理解任务。"
                  ></textarea>
                </label>
              </div>

              <div class="support-strip">
                <div>
                  <span class="eyebrow">当前输入</span>
                  <strong>{{ briefCharacterCount }} 字</strong>
                </div>
                <p>
                  先把“想做成什么”说透。预算、合作方式、技能筛选会放到后续步骤里逐步问，不需要一次写完所有细节。
                </p>
              </div>
            </section>
          </article>

          <article v-else-if="currentStep === 2" class="wizard-surface wizard-question-card">
            <div class="question-header">
              <span class="question-index">02</span>
              <div>
                <h2>预算和合作方式怎么定？</h2>
                <p>这一段决定候选人的预期，也决定后面推荐和沟通的节奏。</p>
              </div>
            </div>

            <section class="section-stack">
              <div class="section-headline">
                <div>
                  <span class="eyebrow">预算</span>
                  <h3>先给一个可谈的预算范围</h3>
                </div>
              </div>

              <div class="field-grid two-columns">
                <label class="wizard-field">
                  <span>预算范围</span>
                  <input
                    v-model="publishForm.budget"
                    type="text"
                    maxlength="40"
                    placeholder="例如：8k-15k / 5000 元以内 / 面议"
                  />
                </label>
                <div class="wizard-field is-readonly">
                  <span>默认发单方式</span>
                  <strong>{{ selectedPreset?.isCustom ? '自定义任务' : '按模板引导' }}</strong>
                  <p>当前不会写回后端结构，只用于 review 阶段帮助企业内部确认。</p>
                </div>
              </div>
            </section>

            <section class="section-stack">
              <div class="section-headline">
                <div>
                  <span class="eyebrow">合作方式</span>
                  <h3>你更希望一次交付、分阶段推进，还是长期协作？</h3>
                </div>
              </div>
              <div class="choice-grid three-columns">
                <button
                  v-for="item in pricingModelOptions"
                  :key="item.id"
                  type="button"
                  class="choice-card"
                  :class="{ 'is-selected': engagementForm.pricingModel === item.id }"
                  @click="setPricingModel(item.id)"
                >
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.note }}</p>
                </button>
              </div>

              <div class="choice-grid three-columns compact-spacing">
                <button
                  v-for="item in collaborationModeOptions"
                  :key="item.id"
                  type="button"
                  class="choice-card subtle"
                  :class="{ 'is-selected': engagementForm.collaborationMode === item.id }"
                  @click="setCollaborationMode(item.id)"
                >
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.note }}</p>
                </button>
              </div>
            </section>

            <section class="section-stack split-section">
              <div>
                <div class="section-headline">
                  <div>
                    <span class="eyebrow">节奏</span>
                    <h3>这次是紧急项目，还是可以稳妥推进？</h3>
                  </div>
                </div>
                <div class="choice-grid three-columns compact-spacing">
                  <button
                    v-for="item in urgencyOptions"
                    :key="item.id"
                    type="button"
                    class="choice-card subtle"
                    :class="{ 'is-selected': engagementForm.urgency === item.id }"
                    @click="setUrgency(item.id)"
                  >
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.note }}</p>
                  </button>
                </div>
              </div>

              <label class="wizard-field">
                <span>期望交付窗口</span>
                <input
                  v-model="engagementForm.timeline"
                  type="text"
                  maxlength="40"
                  placeholder="例如：3 天内先出一版，2 周内完成"
                />
              </label>
            </section>
          </article>

          <article v-else-if="currentStep === 3" class="wizard-surface wizard-question-card">
            <div class="question-header">
              <span class="question-index">03</span>
              <div>
                <h2>范围、技能和附加筛选还有什么要求？</h2>
                <p>这些信息会进入最终 review，也会成为你后续挑选人才时的明确依据。</p>
              </div>
            </div>

            <section class="section-stack">
              <div class="section-headline">
                <div>
                  <span class="eyebrow">范围</span>
                  <h3>先定义这次发单的工作边界</h3>
                </div>
              </div>
              <div class="choice-grid three-columns">
                <button
                  v-for="item in scopeLevelOptions"
                  :key="item.id"
                  type="button"
                  class="choice-card"
                  :class="{ 'is-selected': scopeForm.scopeLevel === item.id }"
                  @click="setScopeLevel(item.id)"
                >
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.note }}</p>
                </button>
              </div>
            </section>

            <section class="section-stack split-section">
              <div>
                <div class="section-headline">
                  <div>
                    <span class="eyebrow">技能</span>
                    <h3>你希望优先筛到哪些能力标签？</h3>
                  </div>
                  <span class="section-meta">可多选</span>
                </div>
                <div class="chip-grid">
                  <button
                    v-for="skill in skillOptions"
                    :key="skill"
                    type="button"
                    class="filter-chip"
                    :class="{ 'is-selected': scopeForm.selectedSkills.includes(skill) }"
                    @click="toggleSkill(skill)"
                  >
                    {{ skill }}
                  </button>
                </div>
              </div>

              <div>
                <div class="section-headline">
                  <div>
                    <span class="eyebrow">附加筛选</span>
                    <h3>有没有必须满足的经验或响应要求？</h3>
                  </div>
                </div>
                <div class="chip-grid">
                  <button
                    v-for="filter in extraFilterOptions"
                    :key="filter"
                    type="button"
                    class="filter-chip muted"
                    :class="{ 'is-selected': scopeForm.extraFilters.includes(filter) }"
                    @click="toggleExtraFilter(filter)"
                  >
                    {{ filter }}
                  </button>
                </div>
              </div>
            </section>

            <label class="wizard-field">
              <span>补充说明</span>
              <textarea
                v-model="scopeForm.screeningNote"
                rows="5"
                maxlength="600"
                placeholder="例如：希望候选人具备 FMCG 包装经验，第一轮先给两个方向，沟通需要当天响应。"
              ></textarea>
            </label>
          </article>

          <article v-else class="wizard-surface wizard-review-card">
            <div class="question-header review-header">
              <span class="question-index">04</span>
              <div>
                <h2>最后确认一下，再正式发布</h2>
                <p>review 页里每一块都可以直接回改。AI 结果只作为辅助信息，不再主导页面视觉中心。</p>
              </div>
            </div>

            <div v-if="isAnalyzing" class="review-status-card is-loading">
              <div>
                <span class="eyebrow">AI 正在整理 review 草稿</span>
                <h3>把需求、预算和范围先收成一版结构化建议</h3>
              </div>
              <ul class="loading-list">
                <li v-for="item in analysisLoadingSteps" :key="item">{{ item }}</li>
              </ul>
            </div>

            <div v-else class="review-layout">
              <div class="review-main-column">
                <section class="review-block">
                  <div class="review-block-head">
                    <div>
                      <span class="eyebrow">任务描述</span>
                      <h3>{{ publishForm.title || '还没有填写任务标题' }}</h3>
                    </div>
                    <button type="button" class="text-link" @click="jumpToStep(1)">编辑</button>
                  </div>
                  <p class="review-copy">{{ reviewDescription }}</p>
                  <div class="review-tag-row">
                    <span class="review-badge">{{ publishForm.source === 'VOICE' ? '语音转写' : '文字需求' }}</span>
                    <span v-if="selectedPreset?.title" class="review-badge is-muted">{{ selectedPreset.title }}</span>
                  </div>
                </section>

                <section class="review-block">
                  <div class="review-block-head">
                    <div>
                      <span class="eyebrow">预算与合作方式</span>
                      <h3>{{ publishForm.budget || '预算待沟通' }}</h3>
                    </div>
                    <button type="button" class="text-link" @click="jumpToStep(2)">编辑</button>
                  </div>
                  <div class="review-list-grid two-columns">
                    <div>
                      <small>计价方式</small>
                      <strong>{{ selectedPricingModel.title }}</strong>
                    </div>
                    <div>
                      <small>合作方式</small>
                      <strong>{{ selectedCollaborationMode.title }}</strong>
                    </div>
                    <div>
                      <small>节奏要求</small>
                      <strong>{{ selectedUrgency.title }}</strong>
                    </div>
                    <div>
                      <small>期望交付窗口</small>
                      <strong>{{ engagementForm.timeline || '待补充' }}</strong>
                    </div>
                  </div>
                </section>

                <section class="review-block">
                  <div class="review-block-head">
                    <div>
                      <span class="eyebrow">范围、技能与筛选</span>
                      <h3>{{ selectedScopeLevel.title }}</h3>
                    </div>
                    <button type="button" class="text-link" @click="jumpToStep(3)">编辑</button>
                  </div>
                  <div class="review-list-grid two-columns">
                    <div>
                      <small>优先技能</small>
                      <strong>{{ selectedSkillsSummary }}</strong>
                    </div>
                    <div>
                      <small>附加筛选</small>
                      <strong>{{ extraFiltersSummary }}</strong>
                    </div>
                  </div>
                  <p class="review-note">
                    {{ scopeForm.screeningNote || '当前没有额外补充说明，发布后可以在和人才的沟通里继续细化。' }}
                  </p>
                </section>

                <section v-if="!hasAnalysis" class="review-status-card">
                  <div>
                    <span class="eyebrow">发布前检查</span>
                    <h3>先生成一版 review 草稿</h3>
                    <p>这一步会帮你把需求拆成模块、节奏和候选标签，但 AI 只是辅助，不会取代你的最终判断。</p>
                  </div>
                  <div class="review-action-row">
                    <button class="button-secondary" type="button" @click="jumpToStep(1)">回去补描述</button>
                    <button class="button-primary" type="button" :disabled="isAnalyzing" @click="proceedToAnalysis">
                      {{ isAnalyzing ? '正在整理...' : '生成 review 草稿' }}
                    </button>
                  </div>
                </section>

                <section v-else-if="!publishSucceeded" class="review-status-card is-ready">
                  <div>
                    <span class="eyebrow">准备发布</span>
                    <h3>AI 草稿已经准备好，确认后即可正式发布任务</h3>
                    <p>
                      当前 AI 给出 {{ analysisModules.length }} 个执行模块，建议周期 {{ aiScheduleSummary }}，风险提示：{{ aiRiskSummary }}。
                    </p>
                  </div>
                  <div class="review-action-row">
                    <button class="button-secondary" type="button" :disabled="isAnalyzing" @click="handleRegenerate">
                      重新生成草稿
                    </button>
                    <button class="button-primary" type="button" :disabled="isPublishing" @click="proceedToPublish">
                      {{ isPublishing ? '正在发布...' : '正式发布任务' }}
                    </button>
                  </div>
                </section>

                <section v-else class="review-status-card is-success">
                  <div>
                    <span class="eyebrow">任务已发布</span>
                    <h3>{{ publishResult?.title || publishForm.title }} 已进入发布状态</h3>
                    <p>
                      任务号 {{ publishResult?.taskId || currentTaskId }}
                      <span v-if="confirmResult?.status"> · 当前状态 {{ confirmResult.status }}</span>
                      <span v-if="confirmResult?.nextStep"> · {{ confirmResult.nextStep }}</span>
                    </p>
                  </div>
                  <div class="review-action-row">
                    <button class="button-secondary" type="button" @click="resetForm">继续发布下一份任务</button>
                    <button
                      v-if="assignmentResult?.nextRoute"
                      class="button-primary"
                      type="button"
                      @click="router.push(assignmentResult.nextRoute)"
                    >
                      直接进入沟通
                    </button>
                  </div>
                </section>

                <section v-if="publishSucceeded && analysisMatchingPreview.length" class="review-followup-block">
                  <div class="review-block-head">
                    <div>
                      <span class="eyebrow">发布后的自然下一步</span>
                      <h3>从推荐人才里先锁定 1 位，再进入沟通</h3>
                      <p>不再强制弹窗主导流程。你可以在这里继续选择，也可以直接去人才广场扩展筛选。</p>
                    </div>
                    <router-link class="button-secondary" to="/enterprise/talents">去人才广场筛选</router-link>
                  </div>

                  <div class="recommendation-selection-card" :class="{ 'is-empty': !selectedTalentPreview }">
                    <template v-if="selectedTalentPreview">
                      <div class="stack-xs">
                        <span class="eyebrow">当前选择</span>
                        <h4>{{ selectedTalentPreview.name }}</h4>
                        <p>{{ selectedTalentPreview.role }} · 评分 {{ previewTalentRating(selectedTalentPreview) }}</p>
                      </div>
                      <div class="tag-row">
                        <span v-for="tag in previewTalentTags(selectedTalentPreview)" :key="tag" class="tag-pill">{{ tag }}</span>
                      </div>
                      <p>{{ selectedTalentPreview.reason }}</p>
                      <div class="review-action-row compact-row">
                        <button class="button-secondary" type="button" @click="openTalentPreviewDetail(selectedTalentPreview)">查看详情</button>
                        <button
                          class="button-primary"
                          type="button"
                          :disabled="isSelectingTalent"
                          @click="continueWithSelectedTalent"
                        >
                          {{
                            isSelectingTalent
                              ? '正在进入沟通...'
                              : selectionUsesConfirmedRoom
                                ? '直接进入沟通'
                                : `继续和${selectedTalentPreview.name}沟通`
                          }}
                        </button>
                      </div>
                    </template>
                    <template v-else>
                      <div class="stack-xs">
                        <span class="eyebrow">还没选择人才</span>
                        <h4>先锁定 1 位最合适的推荐候选人</h4>
                        <p>这里不会自动预选。你需要明确点选一位人才，再继续进入沟通。</p>
                      </div>
                    </template>
                  </div>

                  <div class="recommendation-grid">
                    <article
                      v-for="talent in analysisMatchingPreview"
                      :key="candidateKeyOf(talent) || `${talent.name}-${talent.role}`"
                      class="recommendation-card"
                      :class="{
                        'is-selected': isSelectedTalent(talent),
                        'is-confirmed': isConfirmedTalent(talent)
                      }"
                    >
                      <div class="recommendation-card-head">
                        <div>
                          <h4>{{ talent.name }}</h4>
                          <p>{{ talent.role }}</p>
                        </div>
                        <div class="recommendation-card-pills">
                          <span v-if="isConfirmedTalent(talent)" class="soft-badge success">已在沟通中</span>
                          <span v-else-if="isSelectedTalent(talent)" class="soft-badge accent">已选中</span>
                          <span class="soft-badge">评分 {{ previewTalentRating(talent) }}</span>
                        </div>
                      </div>
                      <div class="tag-row">
                        <span v-for="tag in previewTalentTags(talent)" :key="tag" class="tag-pill">{{ tag }}</span>
                      </div>
                      <p class="recommendation-reason">{{ talent.reason }}</p>
                      <div class="recommendation-actions">
                        <button class="button-secondary" type="button" @click="openTalentPreviewDetail(talent)">查看详情</button>
                        <button
                          class="button-primary"
                          type="button"
                          :class="{ 'is-muted': isConfirmedTalent(talent) }"
                          :disabled="!canChooseTalent(talent)"
                          @click="chooseTalentPreview(talent)"
                        >
                          {{ talentActionLabel(talent) }}
                        </button>
                      </div>
                    </article>
                  </div>
                </section>
              </div>

              <aside class="review-side-column">
                <section class="review-aside-card">
                  <div class="review-block-head compact">
                    <div>
                      <span class="eyebrow">AI 辅助</span>
                      <h3>把 AI 放在辅助位，而不是主角</h3>
                    </div>
                  </div>
                  <template v-if="hasAnalysis">
                    <div class="review-list-grid">
                      <div>
                        <small>拆解模块</small>
                        <strong>{{ analysisModules.length }} 个</strong>
                      </div>
                      <div>
                        <small>建议周期</small>
                        <strong>{{ aiScheduleSummary }}</strong>
                      </div>
                    </div>
                    <p class="aside-note">风险提示：{{ aiRiskSummary }}</p>
                    <div v-if="analysisTags.length" class="tag-row wrap-top">
                      <span v-for="tag in analysisTags.slice(0, 6)" :key="tag" class="tag-pill is-light">{{ tag }}</span>
                    </div>
                    <div v-if="analysisRecommendations.length" class="aside-list">
                      <strong>AI 建议</strong>
                      <ul>
                        <li v-for="item in analysisRecommendations.slice(0, 4)" :key="item">{{ item }}</li>
                      </ul>
                    </div>
                  </template>
                  <template v-else>
                    <p class="aside-note">AI 会在你生成 review 草稿后提供模块拆解、节奏和筛选标签。发布决策仍由你自己控制。</p>
                  </template>
                </section>

                <section class="review-aside-card">
                  <div class="review-block-head compact">
                    <div>
                      <span class="eyebrow">当前草稿速览</span>
                      <h3>给企业内部 review 的最小摘要</h3>
                    </div>
                  </div>
                  <div class="aside-summary-list">
                    <div>
                      <small>标题</small>
                      <strong>{{ publishForm.title || '待填写' }}</strong>
                    </div>
                    <div>
                      <small>预算</small>
                      <strong>{{ publishForm.budget || '待填写' }}</strong>
                    </div>
                    <div>
                      <small>技能</small>
                      <strong>{{ selectedSkillsSummary }}</strong>
                    </div>
                    <div>
                      <small>附加筛选</small>
                      <strong>{{ extraFiltersSummary }}</strong>
                    </div>
                  </div>
                </section>

                <section class="review-aside-card" v-if="analysisHistory.length">
                  <div class="review-block-head compact">
                    <div>
                      <span class="eyebrow">最近草稿</span>
                      <h3>方便回看最近一次 AI 生成记录</h3>
                    </div>
                  </div>
                  <div class="history-list">
                    <article v-for="item in analysisHistory" :key="item.id" class="history-item">
                      <strong>{{ item.title }}</strong>
                      <p>{{ item.time }} · 周期 {{ item.total }} · 风险 {{ item.risk }}</p>
                    </article>
                  </div>
                </section>
              </aside>
            </div>
          </article>
        </main>

        <aside class="wizard-sidebar">
          <section class="wizard-sidebar-card sticky-card">
            <span class="eyebrow">当前步骤提示</span>
            <h3>{{ currentStepMeta.title }}</h3>
            <p>{{ currentStepMeta.note }}</p>
            <ul class="sidebar-checklist">
              <li v-for="item in sidebarChecklist" :key="item.label" :class="{ 'is-done': item.done }">
                <span>{{ item.done ? '✓' : '·' }}</span>
                <div>
                  <strong>{{ item.label }}</strong>
                  <small>{{ item.note }}</small>
                </div>
              </li>
            </ul>
          </section>
        </aside>
      </div>

      <footer class="wizard-footer">
        <div class="wizard-footer-copy">
          <strong>{{ currentStepMeta.title }}</strong>
          <p>{{ currentAnalysisError || '每一步都可以回改。review 页不会再被 AI 结果占满。' }}</p>
        </div>
        <div class="wizard-footer-actions">
          <button v-if="currentStep > 1" class="button-secondary" type="button" :disabled="isBusy" @click="prevStep">
            返回上一步
          </button>
          <button
            v-if="currentStep < 3"
            class="button-primary"
            type="button"
            :disabled="isBusy"
            @click="nextStep"
          >
            {{ currentStep === 1 ? '继续设置预算' : '继续补充范围' }}
          </button>
          <button
            v-else-if="currentStep === 3"
            class="button-primary"
            type="button"
            :disabled="isBusy"
            @click="proceedToAnalysis"
          >
            {{ isAnalyzing ? '正在整理...' : '进入 review' }}
          </button>
          <button
            v-else-if="currentStep === 4 && !publishSucceeded"
            class="button-primary"
            type="button"
            :disabled="isBusy"
            @click="hasAnalysis ? proceedToPublish() : proceedToAnalysis()"
          >
            {{
              isPublishing
                ? '正在发布...'
                : hasAnalysis
                  ? '正式发布任务'
                  : isAnalyzing
                    ? '正在整理...'
                    : '先生成 review 草稿'
            }}
          </button>
          <button
            v-else
            class="button-primary"
            type="button"
            :disabled="isBusy"
            @click="resetForm"
          >
            继续发布下一份任务
          </button>
        </div>
      </footer>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { roleRouteMap } from '../utils/roleRoutes';
import {
  analyzeTaskBrief,
  confirmTaskAnalysis,
  getAiPublishPresets,
  getTaskCollaborationRequests,
  publishTask,
  selectTaskAssignment,
  startTaskCollaboration
} from '../services/api';
import { useAuthState } from '../stores/auth';
import { tradingRestrictionMessage } from '../utils/tradingAccess';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();

const steps = [
  { id: 1, title: '任务描述', note: '用企业自己的语言把这份工作讲清楚。' },
  { id: 2, title: '预算与合作方式', note: '把预算、节奏和合作预期先定下来。' },
  { id: 3, title: '范围与筛选', note: '补齐技能要求和附加筛选条件。' },
  { id: 4, title: '最终 review', note: '统一确认内容后再正式发布。' }
];

const pricingModelOptions = [
  { id: 'fixed', title: '固定总价', note: '适合交付物明确的项目。' },
  { id: 'milestone', title: '按里程碑推进', note: '每一段都可单独确认与结算。' },
  { id: 'retainer', title: '长期合作', note: '适合持续迭代和陪跑型需求。' }
];

const collaborationModeOptions = [
  { id: 'one_off', title: '一次性交付', note: '发布后尽快完成这次任务。' },
  { id: 'iterative', title: '分轮迭代', note: '适合需要 review、修改和多轮交付的项目。' },
  { id: 'discovery', title: '先沟通后细化', note: '先锁定人才，再在沟通里补清边界。' }
];

const urgencyOptions = [
  { id: 'fast', title: '尽快启动', note: '希望 24-48 小时内就能开始。' },
  { id: 'normal', title: '稳妥推进', note: '按正常节奏挑选和沟通。' },
  { id: 'flexible', title: '可以先看匹配度', note: '更重视合适人选，不急于马上开始。' }
];

const scopeLevelOptions = [
  { id: 'focused', title: '单一交付物', note: '例如一页官网、一套包装、一支脚本。' },
  { id: 'standard', title: '标准项目范围', note: '希望一个人能承接完整主任务。' },
  { id: 'expanded', title: '包含延展需求', note: '除了主交付，还希望对接延伸内容。' }
];

const extraFilterOptions = [
  '有行业项目经验',
  '48 小时内可响应',
  '愿意先给 1 版方向',
  '可承接后续长期合作',
  '有成熟流程文档',
  '支持周会同步'
];

const presets = ref([]);
const selectedPresetId = ref('');
const currentStep = ref(1);
const analysis = ref({ modules: [], tags: [], schedule: {}, recommendations: [], matchingPreview: [] });
const analysisHistory = ref([]);
const publishResult = ref(null);
const confirmResult = ref(null);
const assignmentResult = ref(null);
const isAnalyzing = ref(false);
const isPublishing = ref(false);
const isSelectingTalent = ref(false);
const selectedTalentUserId = ref('');
const pendingTalentUserId = ref('');
const selectionErrorNote = ref('');
const launchTalentContext = ref(readLaunchTalentContext());
const revisionForm = ref({
  title: '',
  brief: ''
});

const engagementForm = ref({
  pricingModel: 'fixed',
  collaborationMode: 'one_off',
  urgency: 'normal',
  timeline: '7-14 天内完成首轮交付'
});

const scopeForm = ref({
  scopeLevel: 'focused',
  selectedSkills: [],
  extraFilters: [],
  screeningNote: ''
});

const analysisLoadingSteps = [
  '正在理解需求目标与交付边界',
  '正在估算节奏、风险与推荐合作方式',
  '正在补足推荐人才与技能标签'
];

const publishForm = ref({
  publisherUserId: '1',
  organizationId: '1',
  title: '',
  brief: '',
  budget: '',
  source: 'TEXT',
  voiceTranscript: ''
});

function readLaunchTalentContext() {
  if (typeof window === 'undefined') {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const talentUserId = String(params.get('talentUserId') || '').trim();
  if (!talentUserId) {
    return null;
  }
  return {
    talentUserId,
    talentSlug: String(params.get('talentSlug') || '').trim(),
    talentName: String(params.get('talentName') || '').trim(),
    entrySource: String(params.get('entrySource') || 'market').trim() || 'market'
  };
}

const selectedPreset = computed(() =>
  presets.value.find((item) => item.id === selectedPresetId.value) || presets.value[0] || null
);

const existingTaskId = computed(() => (typeof route.query.taskId === 'string' ? route.query.taskId.trim() : ''));
const currentTaskId = computed(() => publishResult.value?.taskId || confirmResult.value?.taskId || '');
const hasLaunchTalentContext = computed(() => Boolean(launchTalentContext.value?.talentUserId));
const currentStepMeta = computed(() => steps.find((item) => item.id === currentStep.value) || steps[0]);
const isBusy = computed(() => isAnalyzing.value || isPublishing.value || isSelectingTalent.value);
const confirmedTalentKey = computed(() => candidateKeyOf(assignmentResult.value?.selectedTalent || assignmentResult.value));
const publishRestrictionMessage = computed(() => tradingRestrictionMessage(authState.user, 'enterprise'));
const publishTradingBlocked = computed(() => Boolean(publishRestrictionMessage.value));
const accountLabel = computed(() => {
  const user = authState.user;
  if (!user) {
    return '当前账号未识别';
  }
  const primaryName = user.organizationName || user.displayName || '未命名账号';
  return `${primaryName} · ${user.mobile}`;
});

const wizardProgress = computed(() => Math.round((currentStep.value / steps.length) * 100));
const briefCharacterCount = computed(() => effectiveBrief().trim().length);
const analysisModules = computed(() => (Array.isArray(analysis.value?.modules) ? analysis.value.modules : []));
const analysisTags = computed(() =>
  (Array.isArray(analysis.value?.tags) ? analysis.value.tags : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
);
const analysisRecommendations = computed(() =>
  (Array.isArray(analysis.value?.recommendations) ? analysis.value.recommendations : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
);
const analysisMatchingPreview = computed(() => (Array.isArray(analysis.value?.matchingPreview) ? analysis.value.matchingPreview : []));
const hasAnalysis = computed(() => analysisModules.value.length > 0 && !isFailedResult(analysis.value));
const publishSucceeded = computed(
  () => Boolean(publishResult.value?.taskId) && !isFailedResult(publishResult.value) && !isFailedResult(confirmResult.value)
);
const selectedTalentPreview = computed(
  () => analysisMatchingPreview.value.find((item) => candidateKeyOf(item) === selectedTalentUserId.value) || null
);
const selectionUsesConfirmedRoom = computed(
  () => Boolean(selectedTalentPreview.value && confirmedTalentKey.value && confirmedTalentKey.value === selectedTalentUserId.value)
);
const currentAnalysisError = computed(() => {
  if (isAnalyzing.value) {
    return '';
  }
  if (analysis.value?.requestError) {
    return String(analysis.value.requestError).trim();
  }
  if (selectionErrorNote.value) {
    return String(selectionErrorNote.value).trim();
  }
  return '';
});

const selectedPricingModel = computed(
  () => pricingModelOptions.find((item) => item.id === engagementForm.value.pricingModel) || pricingModelOptions[0]
);
const selectedCollaborationMode = computed(
  () => collaborationModeOptions.find((item) => item.id === engagementForm.value.collaborationMode) || collaborationModeOptions[0]
);
const selectedUrgency = computed(
  () => urgencyOptions.find((item) => item.id === engagementForm.value.urgency) || urgencyOptions[1]
);
const selectedScopeLevel = computed(
  () => scopeLevelOptions.find((item) => item.id === scopeForm.value.scopeLevel) || scopeLevelOptions[0]
);
const selectedSkillsSummary = computed(() =>
  scopeForm.value.selectedSkills.length ? scopeForm.value.selectedSkills.join(' · ') : '未额外指定'
);
const extraFiltersSummary = computed(() =>
  scopeForm.value.extraFilters.length ? scopeForm.value.extraFilters.join(' · ') : '未额外设置'
);
const reviewDescription = computed(() => effectiveBrief() || '还没有填写任务描述。');
const aiScheduleSummary = computed(
  () => analysis.value?.schedule?.total || analysis.value?.schedule?.delivery || '待 AI 生成建议'
);
const aiRiskSummary = computed(() => analysis.value?.schedule?.risk || 'AI 会在生成后补充风险提醒');
const skillOptions = computed(() => {
  const base = ['品牌策略', '视觉设计', '包装设计', '官网搭建', '内容策划', '短视频脚本'];
  const merged = [
    ...base,
    ...(Array.isArray(selectedPreset.value?.tags) ? selectedPreset.value.tags : []),
    ...analysisTags.value,
    ...analysisModules.value.map((item) => item?.title || item?.name || '')
  ]
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return [...new Set(merged)].slice(0, 12);
});

const sidebarChecklist = computed(() => {
  const basicReady = Boolean(publishForm.value.title?.trim() && effectiveBrief()?.trim());
  const budgetReady = Boolean(publishForm.value.budget?.trim());
  const scopeReady = Boolean(scopeForm.value.selectedSkills.length || scopeForm.value.extraFilters.length || scopeForm.value.screeningNote.trim());

  return [
    {
      label: '任务标题与描述',
      note: basicReady ? '描述已经可以进入 review。' : '先把任务标题和需求背景讲清楚。',
      done: basicReady
    },
    {
      label: '预算与合作方式',
      note: budgetReady ? '预算已写入当前草稿。' : '建议至少给一个可谈范围。',
      done: budgetReady
    },
    {
      label: '范围与筛选偏好',
      note: scopeReady ? '筛选条件已补充。' : '没有也能发布，但推荐人才会更泛。',
      done: scopeReady
    },
    {
      label: 'AI review 草稿',
      note: hasAnalysis.value ? '已生成，可直接发布。' : '进入 review 后再统一生成。',
      done: hasAnalysis.value
    }
  ];
});

const BASIC_TASK_INFO_ERROR = '请先填写任务标题和需求内容。';

function currentPublisherUserId() {
  return authState.user?.platformUserId || '1';
}

function currentOrganizationId() {
  return authState.user?.organizationId || '1';
}

function effectiveBrief() {
  if (publishForm.value.source === 'VOICE' && publishForm.value.voiceTranscript) {
    return publishForm.value.voiceTranscript;
  }
  return publishForm.value.brief;
}

function candidateKeyOf(talent) {
  if (!talent || typeof talent !== 'object') {
    return '';
  }
  return [
    talent.talentUserId,
    talent.platformUserId,
    talent.slug,
    talent.id,
    talent.userId,
    talent.name && talent.role ? `${talent.name}-${talent.role}` : talent.name
  ].find((item) => typeof item === 'string' && item.trim()) || '';
}

function isSelectedTalent(talent) {
  const key = candidateKeyOf(talent);
  return Boolean(key && key === selectedTalentUserId.value);
}

function isConfirmedTalent(talent) {
  const key = candidateKeyOf(talent);
  return Boolean(key && key === confirmedTalentKey.value);
}

function hasBasicTaskInfo(options = {}) {
  const shouldSetError = options?.silent !== true;
  const missingTitle = !publishForm.value.title?.trim();
  const missingBrief = !effectiveBrief()?.trim();
  if (!missingTitle && !missingBrief) {
    return true;
  }
  if (shouldSetError) {
    selectionErrorNote.value = BASIC_TASK_INFO_ERROR;
  }
  return false;
}

function stepClass(stepId) {
  return {
    'is-active': currentStep.value === stepId,
    'is-complete': currentStep.value > stepId
  };
}

function setSource(source) {
  if (isBusy.value) {
    return;
  }
  publishForm.value.source = source;
}

function setPricingModel(modelId) {
  engagementForm.value.pricingModel = modelId;
}

function setCollaborationMode(modeId) {
  engagementForm.value.collaborationMode = modeId;
}

function setUrgency(urgencyId) {
  engagementForm.value.urgency = urgencyId;
}

function setScopeLevel(scopeId) {
  scopeForm.value.scopeLevel = scopeId;
}

function toggleSkill(skill) {
  if (!skill) {
    return;
  }
  if (scopeForm.value.selectedSkills.includes(skill)) {
    scopeForm.value.selectedSkills = scopeForm.value.selectedSkills.filter((item) => item !== skill);
    return;
  }
  scopeForm.value.selectedSkills = [...scopeForm.value.selectedSkills, skill].slice(0, 6);
}

function toggleExtraFilter(filter) {
  if (!filter) {
    return;
  }
  if (scopeForm.value.extraFilters.includes(filter)) {
    scopeForm.value.extraFilters = scopeForm.value.extraFilters.filter((item) => item !== filter);
    return;
  }
  scopeForm.value.extraFilters = [...scopeForm.value.extraFilters, filter].slice(0, 4);
}

function jumpToStep(stepId) {
  if (isBusy.value) {
    return;
  }

  if (stepId <= currentStep.value) {
    currentStep.value = stepId;
    return;
  }

  if (stepId === 2) {
    if (!hasBasicTaskInfo()) {
      return;
    }
    currentStep.value = 2;
    return;
  }

  if (stepId === 3) {
    if (!hasBasicTaskInfo()) {
      return;
    }
    currentStep.value = 3;
    return;
  }

  if (stepId === 4) {
    if (!hasBasicTaskInfo()) {
      return;
    }
    currentStep.value = 4;
    if (!hasAnalysis.value && !publishSucceeded.value) {
      selectionErrorNote.value = '先生成一版 review 草稿，再统一确认并发布。';
    }
  }
}

function nextStep() {
  if (isBusy.value) {
    return;
  }
  if (currentStep.value === 1 && !hasBasicTaskInfo()) {
    return;
  }
  if (currentStep.value === 2) {
    currentStep.value = 3;
    return;
  }
  if (currentStep.value === 3) {
    void proceedToAnalysis();
  }
}

function prevStep() {
  if (isBusy.value) {
    return;
  }
  if (currentStep.value > 1) {
    currentStep.value -= 1;
  }
}

function applyPreset(preset) {
  if (isBusy.value) {
    return;
  }
  selectedPresetId.value = preset.id;
  publishForm.value = {
    publisherUserId: currentPublisherUserId(),
    organizationId: currentOrganizationId(),
    title: preset.isCustom ? '' : preset.title,
    brief: preset.isCustom ? '' : preset.brief,
    budget: '',
    source: preset.source || 'TEXT',
    voiceTranscript: preset.voiceTranscript || ''
  };
  revisionForm.value = {
    title: preset.isCustom ? '' : preset.title,
    brief: preset.isCustom ? '' : preset.brief
  };
  engagementForm.value = {
    pricingModel: 'fixed',
    collaborationMode: 'one_off',
    urgency: 'normal',
    timeline: '7-14 天内完成首轮交付'
  };
  scopeForm.value = {
    scopeLevel: 'focused',
    selectedSkills: Array.isArray(preset?.tags) ? preset.tags.slice(0, 2) : [],
    extraFilters: [],
    screeningNote: ''
  };
  publishResult.value = null;
  confirmResult.value = null;
  assignmentResult.value = null;
  selectedTalentUserId.value = '';
  pendingTalentUserId.value = '';
  selectionErrorNote.value = '';
  analysis.value = { modules: [], tags: [], schedule: {}, recommendations: [], matchingPreview: [] };
}

function presetPreviewTags(preset) {
  return Array.isArray(preset?.tags) ? preset.tags.slice(0, 2) : [];
}

function countPresetTags(preset) {
  return Array.isArray(preset?.tags) ? preset.tags.length : 0;
}

async function handleAnalyze() {
  analysis.value = await analyzeTaskBrief({
    title: publishForm.value.title,
    brief: effectiveBrief(),
    source: publishForm.value.source,
    presetId: selectedPreset.value?.id || '',
    presetTitle: selectedPreset.value?.title || '',
    presetTags: Array.isArray(selectedPreset.value?.tags) ? selectedPreset.value.tags : []
  });
  revisionForm.value = {
    title: publishForm.value.title,
    brief: effectiveBrief()
  };
  publishResult.value = null;
  confirmResult.value = null;
  assignmentResult.value = null;
  selectedTalentUserId.value = '';
  pendingTalentUserId.value = '';
  if (isFailedResult(analysis.value) || !analysisModules.value.length) {
    selectionErrorNote.value = analysis.value?.requestError || analysis.value?.message || '当前暂时无法生成 AI 拆解，请稍后再试。';
    return;
  }
  selectionErrorNote.value = '';
  analysisHistory.value = [
    {
      id: `${Date.now()}-${analysisHistory.value.length}`,
      title: publishForm.value.title || '未命名任务',
      time: '刚刚',
      total: analysis.value.schedule?.total || '待确认',
      risk: analysis.value.schedule?.risk || '待确认'
    },
    ...analysisHistory.value
  ].slice(0, 5);
}

async function handlePublish() {
  if (publishTradingBlocked.value) {
    selectionErrorNote.value = publishRestrictionMessage.value;
    return;
  }
  selectionErrorNote.value = '';
  publishResult.value = await publishTask({
    ...publishForm.value,
    publisherUserId: currentPublisherUserId(),
    organizationId: currentOrganizationId(),
    brief: effectiveBrief()
  });
  if (isFailedResult(publishResult.value)) {
    selectionErrorNote.value = publishResult.value?.requestError || publishResult.value?.message || '当前暂时无法发布任务，请稍后再试。';
    return;
  }
  if (!publishResult.value?.taskId) {
    selectionErrorNote.value = '任务已提交，但后端没有返回 taskId，暂时无法继续后续协作。';
    return;
  }

  confirmResult.value = await confirmTaskAnalysis(publishResult.value.taskId);
  if (isFailedResult(confirmResult.value)) {
    selectionErrorNote.value = confirmResult.value?.requestError || confirmResult.value?.message || '当前暂时无法确认 AI 分析结果。';
    return;
  }

  if (hasLaunchTalentContext.value) {
    const launchTalent = launchTalentContext.value || {};
    const collaborationResult = await startTaskCollaboration(
      publishResult.value.taskId,
      launchTalent.talentUserId
    );
    assignmentResult.value = collaborationResult;
    if (isFailedResult(collaborationResult)) {
      selectionErrorNote.value = collaborationResult?.requestError || collaborationResult?.nextStep || '当前暂时无法把这位人才带入沟通，请稍后重试。';
      return;
    }
    await router.push(collaborationResult?.nextRoute || buildNegotiationRoute(collaborationResult?.roomKey || ''));
    return;
  }
}

async function proceedToAnalysis() {
  if (publishTradingBlocked.value) {
    selectionErrorNote.value = publishRestrictionMessage.value;
    return;
  }
  selectionErrorNote.value = '';
  if (!hasBasicTaskInfo()) {
    return;
  }
  currentStep.value = 4;
  isAnalyzing.value = true;
  try {
    await handleAnalyze();
  } finally {
    isAnalyzing.value = false;
  }
}

async function proceedToPublish() {
  if (publishTradingBlocked.value) {
    selectionErrorNote.value = publishRestrictionMessage.value;
    return;
  }
  selectionErrorNote.value = '';
  if (!hasBasicTaskInfo()) {
    currentStep.value = Math.min(currentStep.value, 1);
    return;
  }
  if (!hasAnalysis.value) {
    currentStep.value = 4;
    isAnalyzing.value = true;
    try {
      await handleAnalyze();
    } finally {
      isAnalyzing.value = false;
    }
    if (isFailedResult(analysis.value) || !hasAnalysis.value) {
      return;
    }
  }
  isPublishing.value = true;
  try {
    await handlePublish();
  } finally {
    isPublishing.value = false;
  }
}

function isFailedResult(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
}

function buildNegotiationRoute(roomKey = '') {
  return {
    path: roleRouteMap.enterprise.messages,
    query: {
      ...(roomKey ? { room: roomKey } : {}),
      ...(currentTaskId.value ? { taskId: currentTaskId.value } : {}),
      source: 'publish'
    }
  };
}

function chooseTalentPreview(talent) {
  const talentKey = candidateKeyOf(talent);
  if (!talentKey) {
    selectionErrorNote.value = '当前候选缺少可用标识，暂时不能继续沟通。';
    return;
  }
  selectionErrorNote.value = '';
  if (selectedTalentUserId.value === talentKey) {
    selectedTalentUserId.value = '';
    return;
  }
  selectedTalentUserId.value = talentKey;
}

async function handleRegenerate() {
  if (!hasBasicTaskInfo()) {
    currentStep.value = 1;
    return;
  }
  publishForm.value = {
    ...publishForm.value,
    title: revisionForm.value.title,
    brief: revisionForm.value.brief
  };
  currentStep.value = 4;
  isAnalyzing.value = true;
  try {
    await handleAnalyze();
  } finally {
    isAnalyzing.value = false;
  }
}

function talentActionLabel(talent) {
  if (isSelectingTalent.value && pendingTalentUserId.value === candidateKeyOf(talent)) {
    return '正在准备...';
  }
  if (isConfirmedTalent(talent)) {
    return '已在沟通中';
  }
  if (isSelectedTalent(talent)) {
    return '取消选择';
  }
  return confirmedTalentKey.value ? '改选这位' : '选择这位';
}

function previewTalentTags(talent) {
  const tags = Array.isArray(talent?.tags) && talent.tags.length
    ? talent.tags
    : (Array.isArray(talent?.services) ? talent.services : []);
  return tags
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 4);
}

function previewTalentRating(talent) {
  return String(talent?.score || '暂无');
}

async function openTalentPreviewDetail(talent) {
  const slug = String(talent?.slug || '').trim();
  if (!slug) {
    selectionErrorNote.value = '当前人才资料还没同步完整，暂时不能查看详情。';
    return;
  }
  selectionErrorNote.value = '';
  await router.push({
    path: roleRouteMap.enterprise.detail(slug),
    query: {
      source: 'publish',
      from: 'recommendation'
    }
  });
}

function canChooseTalent(talent) {
  if (!candidateKeyOf(talent)) {
    return false;
  }
  if (!currentTaskId.value) {
    return false;
  }
  if (isConfirmedTalent(talent)) {
    return false;
  }
  return true;
}

async function handleSelectTalent(talent = selectedTalentPreview.value) {
  const talentKey = candidateKeyOf(talent);
  if (!currentTaskId.value || !talentKey) {
    selectionErrorNote.value = '当前任务标识还没准备好，暂时不能进入沟通。';
    return false;
  }

  selectionErrorNote.value = '';
  pendingTalentUserId.value = talentKey;
  isSelectingTalent.value = true;
  try {
    const response = await selectTaskAssignment(currentTaskId.value, talent.talentUserId || talent.platformUserId || talentKey);
    assignmentResult.value = {
      ...response,
      talentUserId: response?.talentUserId || talent.talentUserId || talent.platformUserId || talentKey,
      selectedTalent: response?.selectedTalent || {
        talentUserId: talent.talentUserId || talent.platformUserId || talentKey,
        slug: talent.slug || '',
        name: talent.name || '',
        role: talent.role || '',
        reason: talent.reason || ''
      },
      nextRoute: response?.nextRoute || buildNegotiationRoute(response?.roomKey || '')
    };
    selectedTalentUserId.value = candidateKeyOf(assignmentResult.value?.selectedTalent || talent);
    if (isFailedResult(assignmentResult.value)) {
      selectionErrorNote.value = assignmentResult.value?.requestError || assignmentResult.value?.nextStep || '当前暂时无法创建沟通房间，请稍后重试。';
      return false;
    }
    if (!assignmentResult.value?.nextRoute) {
      selectionErrorNote.value = '沟通房间还没准备好，请稍后再试一次。';
      return false;
    }
    return true;
  } finally {
    isSelectingTalent.value = false;
    pendingTalentUserId.value = '';
  }
}

async function continueWithSelectedTalent() {
  if (!currentTaskId.value) {
    selectionErrorNote.value = '当前任务标识还没准备好，暂时不能进入沟通。';
    return;
  }
  if (!selectedTalentPreview.value && assignmentResult.value?.nextRoute) {
    await router.push(assignmentResult.value.nextRoute);
    return;
  }
  if (!selectedTalentPreview.value) {
    selectionErrorNote.value = '请先选择一位推荐人才，再继续进入沟通。';
    return;
  }
  const needsNewSelection = !assignmentResult.value?.nextRoute || candidateKeyOf(selectedTalentPreview.value) !== confirmedTalentKey.value;
  if (needsNewSelection) {
    const selectSucceeded = await handleSelectTalent(selectedTalentPreview.value);
    if (!selectSucceeded) {
      return;
    }
  }
  if (isFailedResult(assignmentResult.value) || !assignmentResult.value?.nextRoute) {
    selectionErrorNote.value = assignmentResult.value?.requestError || '沟通房间还没准备好，请稍后再试。';
    return;
  }
  await router.push(assignmentResult.value?.nextRoute || buildNegotiationRoute(assignmentResult.value?.roomKey || ''));
}

function resetForm() {
  selectionErrorNote.value = '';
  if (selectedPreset.value) {
    applyPreset(selectedPreset.value);
  } else if (presets.value.length) {
    applyPreset(presets.value[0]);
  }
  currentStep.value = 1;
}

async function loadExistingTaskContext(taskId) {
  const payload = await getTaskCollaborationRequests(taskId);
  publishForm.value = {
    ...publishForm.value,
    title: payload?.title || publishForm.value.title,
    brief: payload?.brief || publishForm.value.brief,
    budget: payload?.budget || publishForm.value.budget
  };
  publishResult.value = {
    taskId: payload?.taskId || taskId,
    title: payload?.title || '',
    brief: payload?.brief || '',
    budget: payload?.budget || '',
    status: payload?.status || 'MATCHING',
    nextStep: payload?.nextStep || ''
  };
  confirmResult.value = {
    taskId: payload?.taskId || taskId,
    status: payload?.status || 'MATCHING',
    nextStep: payload?.nextStep || ''
  };
  analysis.value = {
    ...analysis.value,
    matchingPreview: Array.isArray(payload?.matchingPreview) ? payload.matchingPreview : []
  };
  assignmentResult.value = payload?.assignmentResult || null;
  selectedTalentUserId.value = candidateKeyOf(payload?.assignmentResult?.selectedTalent) || '';
  selectionErrorNote.value = analysisMatchingPreview.value.length || assignmentResult.value?.nextRoute
    ? ''
    : payload?.requestError || payload?.nextStep || '当前任务还没有新的合作申请，可继续去人才广场邀请。';
  currentStep.value = 4;
}

onMounted(async () => {
  const payload = await getAiPublishPresets();
  presets.value = payload.items || [];
  publishForm.value.publisherUserId = authState.user?.platformUserId || payload.defaultPublisherUserId || '1';
  publishForm.value.organizationId = authState.user?.organizationId || payload.defaultOrganizationId || '1';

  if (presets.value.length) {
    applyPreset(presets.value[0]);
  }
  if (existingTaskId.value) {
    await loadExistingTaskContext(existingTaskId.value);
  }
});
</script>

<style scoped>
.publish-wizard-page {
  min-height: 100%;
  padding: 32px 0 48px;
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.07), transparent 28%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 26%),
    linear-gradient(180deg, #f5f7fb 0%, #eef3f9 100%);
  color: #162033;
}

.publish-wizard-shell {
  width: min(1180px, calc(100vw - 64px));
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.wizard-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
  gap: 20px;
  align-items: stretch;
}

.wizard-hero-copy,
.wizard-account-card,
.wizard-banner,
.wizard-progress-card,
.wizard-surface,
.wizard-sidebar-card,
.wizard-alert {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
}

.wizard-hero-copy,
.wizard-account-card,
.wizard-banner,
.wizard-progress-card,
.wizard-surface,
.wizard-sidebar-card,
.wizard-alert,
.wizard-footer {
  border-radius: 28px;
}

.wizard-hero-copy {
  padding: 32px;
  display: grid;
  gap: 14px;
}

.wizard-hero-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.wizard-hero-copy p,
.wizard-account-card p,
.wizard-banner p,
.wizard-alert p,
.question-header p,
.section-headline p,
.review-copy,
.review-note,
.aside-note,
.history-item p,
.wizard-footer-copy p {
  margin: 0;
  color: #4c5b72;
  line-height: 1.7;
}

.trust-pill,
.banner-tag,
.soft-badge,
.review-badge,
.tag-pill,
.preset-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

.trust-pill {
  width: fit-content;
  padding: 9px 12px;
  border: 1px solid rgba(37, 99, 235, 0.16);
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  font-weight: 700;
}

.wizard-account-card {
  padding: 24px;
  display: grid;
  gap: 12px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.wizard-account-card strong,
.wizard-banner h2,
.review-block h3,
.review-status-card h3,
.review-aside-card h3,
.review-followup-block h3,
.question-header h2,
.section-headline h3,
.recommendation-card h4,
.recommendation-selection-card h4,
.preset-card strong {
  margin: 0;
  color: #0f172a;
}

.wizard-banner {
  padding: 22px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.banner-tag {
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  font-weight: 600;
}

.wizard-alert {
  padding: 18px 22px;
  display: grid;
  gap: 8px;
}

.wizard-alert strong {
  font-size: 15px;
}

.wizard-alert.is-warning {
  border-color: rgba(245, 158, 11, 0.22);
  background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 247, 237, 0.94));
}

.wizard-alert.is-error {
  border-color: rgba(239, 68, 68, 0.18);
  background: linear-gradient(180deg, rgba(254, 242, 242, 0.98), rgba(255, 247, 247, 0.94));
}

.wizard-progress-card {
  padding: 24px;
  display: grid;
  gap: 18px;
}

.wizard-progress-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.wizard-progress-head h2 {
  margin: 4px 0 6px;
  font-size: 1.4rem;
}

.wizard-progress-head strong {
  font-size: 1.5rem;
  color: #0f172a;
}

.wizard-progress-track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.wizard-progress-value {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #2563eb, #14b8a6);
}

.wizard-step-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.wizard-step-chip button {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 20px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.wizard-step-chip button:hover {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.26);
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.08);
}

.wizard-step-chip span {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.16);
  color: #334155;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wizard-step-chip strong {
  display: block;
  margin-bottom: 4px;
  color: #0f172a;
}

.wizard-step-chip small {
  display: block;
  color: #64748b;
  line-height: 1.5;
}

.wizard-step-chip.is-active button,
.wizard-step-chip.is-complete button {
  border-color: rgba(37, 99, 235, 0.24);
}

.wizard-step-chip.is-active span {
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: #fff;
}

.wizard-step-chip.is-complete span {
  background: rgba(14, 165, 233, 0.14);
  color: #0f172a;
}

.wizard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;
}

.wizard-main-column,
.review-main-column {
  display: grid;
  gap: 20px;
}

.stack-xs {
  display: grid;
  gap: 4px;
}

.wizard-surface {
  padding: 28px;
}

.question-header {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 28px;
}

.question-index {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  background: linear-gradient(135deg, #1d4ed8, #14b8a6);
  color: #fff;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-stack {
  display: grid;
  gap: 18px;
}

.section-stack + .section-stack {
  margin-top: 28px;
}

.section-headline {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
}

.section-meta {
  color: #64748b;
  font-size: 13px;
}

.preset-grid,
.choice-grid,
.recommendation-grid {
  display: grid;
  gap: 14px;
}

.preset-grid,
.choice-grid.three-columns,
.recommendation-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.choice-grid.compact-spacing {
  gap: 12px;
}

.preset-card,
.choice-card,
.source-chip,
.filter-chip,
.recommendation-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #fff;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.preset-card,
.choice-card,
.recommendation-card {
  border-radius: 22px;
  padding: 18px;
}

.preset-card:hover,
.choice-card:hover,
.recommendation-card:hover,
.filter-chip:hover,
.source-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.26);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
}

.preset-card.is-selected,
.choice-card.is-selected,
.filter-chip.is-selected,
.source-chip.is-active,
.recommendation-card.is-selected {
  border-color: rgba(37, 99, 235, 0.4);
  box-shadow: 0 18px 32px rgba(37, 99, 235, 0.12);
}

.preset-card-head,
.recommendation-card-head,
.review-block-head,
.review-action-row,
.recommendation-actions,
.recommendation-card-pills,
.review-layout,
.wizard-footer,
.wizard-footer-actions,
.review-list-grid,
.aside-summary-list,
.tag-row,
.recommendation-selection-card,
.split-section,
.field-grid,
.compact-row {
  display: flex;
  gap: 12px;
}

.preset-card-head,
.recommendation-card-head,
.review-block-head,
.review-action-row,
.recommendation-actions,
.review-layout,
.wizard-footer,
.wizard-footer-actions,
.split-section {
  justify-content: space-between;
}

.preset-card-head,
.recommendation-card-head,
.review-block-head,
.review-action-row,
.recommendation-actions,
.wizard-footer,
.wizard-footer-actions,
.compact-row {
  align-items: center;
}

.preset-card p,
.choice-card p,
.recommendation-card p,
.recommendation-selection-card p,
.review-status-card p {
  margin: 0;
  color: #56657c;
  line-height: 1.65;
}

.soft-badge,
.review-badge,
.tag-pill,
.preset-tag,
.source-chip,
.filter-chip {
  padding: 10px 14px;
  font-weight: 600;
}

.soft-badge,
.review-badge,
.tag-pill,
.preset-tag {
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
}

.soft-badge.accent {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}

.soft-badge.success {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.preset-tag.is-muted,
.review-badge.is-muted {
  background: rgba(148, 163, 184, 0.12);
}

.source-switcher,
.tag-row,
.preset-tag-row,
.chip-grid,
.review-tag-row,
.recommendation-card-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.wrap-top {
  align-items: flex-start;
}

.source-chip,
.filter-chip {
  border-radius: 999px;
}

.filter-chip {
  font-size: 13px;
}

.filter-chip.muted {
  background: rgba(248, 250, 252, 0.92);
}

.field-grid {
  flex-wrap: wrap;
}

.field-grid.two-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field-full {
  grid-column: 1 / -1;
}

.wizard-field {
  display: grid;
  gap: 10px;
}

.wizard-field span {
  font-weight: 600;
  color: #1e293b;
}

.wizard-field input,
.wizard-field textarea {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 18px;
  padding: 15px 16px;
  background: rgba(255, 255, 255, 0.98);
  color: #0f172a;
  font: inherit;
  line-height: 1.6;
}

.wizard-field input:focus,
.wizard-field textarea:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.4);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
}

.wizard-field.is-readonly {
  padding: 16px 18px;
  border: 1px dashed rgba(148, 163, 184, 0.26);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.9);
}

.wizard-field.is-readonly strong {
  font-size: 1.05rem;
}

.support-strip,
.review-status-card,
.recommendation-selection-card,
.review-aside-card,
.wizard-sidebar-card {
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(248, 250, 252, 0.92);
}

.support-strip {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.review-layout {
  align-items: flex-start;
}

.review-main-column {
  flex: 1 1 auto;
  min-width: 0;
}

.review-side-column {
  width: 320px;
  display: grid;
  gap: 16px;
}

.review-block,
.review-followup-block {
  padding: 22px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #fff;
}

.review-followup-block {
  display: grid;
  gap: 18px;
}

.review-block-head {
  margin-bottom: 16px;
}

.review-block-head.compact {
  margin-bottom: 12px;
}

.text-link {
  border: none;
  background: transparent;
  color: #1d4ed8;
  font-weight: 600;
  cursor: pointer;
}

.review-copy {
  margin-bottom: 14px;
}

.review-list-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.review-list-grid small,
.aside-summary-list small {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
}

.review-list-grid strong,
.aside-summary-list strong {
  line-height: 1.55;
}

.review-note {
  margin-top: 14px;
}

.review-status-card {
  display: grid;
  gap: 16px;
}

.review-status-card.is-loading {
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.96), rgba(248, 250, 252, 0.92));
}

.review-status-card.is-ready {
  background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(240, 249, 255, 0.9));
}

.review-status-card.is-success {
  background: linear-gradient(180deg, rgba(236, 253, 245, 0.96), rgba(248, 250, 252, 0.92));
}

.loading-list,
.aside-list ul,
.sidebar-checklist {
  margin: 0;
  padding: 0;
  list-style: none;
}

.loading-list,
.aside-list ul {
  display: grid;
  gap: 10px;
}

.loading-list li,
.aside-list li {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  color: #334155;
}

.recommendation-selection-card {
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.recommendation-selection-card.is-empty {
  border-style: dashed;
}

.recommendation-card {
  display: grid;
  gap: 14px;
}

.recommendation-card.is-confirmed {
  border-color: rgba(16, 185, 129, 0.34);
  background: rgba(236, 253, 245, 0.7);
}

.recommendation-card-head {
  align-items: flex-start;
}

.recommendation-card h4 {
  font-size: 1rem;
}

.recommendation-reason {
  min-height: 84px;
}

.recommendation-actions {
  justify-content: space-between;
}

.review-aside-card {
  display: grid;
  gap: 14px;
}

.aside-summary-list,
.history-list {
  display: grid;
  gap: 12px;
}

.history-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.wizard-sidebar {
  display: block;
}

.sticky-card {
  position: sticky;
  top: 24px;
  display: grid;
  gap: 16px;
  padding: 22px;
}

.sidebar-checklist {
  display: grid;
  gap: 12px;
}

.sidebar-checklist li {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 12px;
  align-items: start;
  color: #64748b;
}

.sidebar-checklist li span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  color: #475569;
  font-size: 12px;
}

.sidebar-checklist li strong {
  display: block;
  margin-bottom: 2px;
  color: #1e293b;
}

.sidebar-checklist li small {
  display: block;
  line-height: 1.55;
}

.sidebar-checklist li.is-done span {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.wizard-footer {
  padding: 18px 24px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.wizard-footer-copy strong {
  display: block;
  margin-bottom: 4px;
}

.wizard-footer-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 1180px) {
  .wizard-hero,
  .wizard-grid,
  .review-layout,
  .split-section {
    grid-template-columns: 1fr;
    display: grid;
  }

  .review-side-column,
  .wizard-sidebar {
    width: 100%;
  }

  .sticky-card {
    position: static;
  }

  .wizard-step-list,
  .preset-grid,
  .choice-grid.three-columns,
  .recommendation-grid,
  .field-grid.two-columns,
  .review-list-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .publish-wizard-shell {
    width: min(100vw - 28px, 100%);
  }

  .wizard-step-list,
  .preset-grid,
  .choice-grid.three-columns,
  .recommendation-grid,
  .field-grid.two-columns,
  .review-list-grid {
    grid-template-columns: 1fr;
  }

  .wizard-progress-head,
  .support-strip,
  .wizard-banner,
  .wizard-footer,
  .wizard-footer-actions,
  .review-block-head,
  .recommendation-actions,
  .review-action-row,
  .recommendation-card-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .wizard-surface,
  .wizard-progress-card,
  .wizard-account-card,
  .wizard-hero-copy,
  .wizard-sidebar-card,
  .wizard-alert,
  .wizard-footer {
    padding: 22px;
    border-radius: 24px;
  }
}

.publish-wizard-page {
  color: #e6edf6;
  background:
    radial-gradient(circle at 15% 10%, rgba(16, 138, 0, 0.18), transparent 30%),
    radial-gradient(circle at 84% 14%, rgba(37, 99, 235, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(9, 14, 24, 0.98), rgba(10, 16, 28, 0.96));
  position: relative;
  isolation: isolate;
}

.publish-wizard-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 88px 88px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 72%);
  z-index: 0;
}

.publish-wizard-shell {
  position: relative;
  z-index: 1;
}

.publish-wizard-page :is(.wizard-hero, .wizard-account-card, .wizard-banner, .wizard-progress-card, .wizard-surface, .wizard-sidebar-card, .wizard-alert, .wizard-footer, .preset-card, .choice-card, .source-chip, .filter-chip, .recommendation-card, .wizard-field) {
  background: rgba(10, 16, 28, 0.82);
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 24px 54px rgba(4, 10, 20, 0.34);
}

.publish-wizard-page .wizard-hero-copy h1,
.publish-wizard-page .wizard-account-card strong,
.publish-wizard-page .wizard-banner h2,
.publish-wizard-page .section-headline h3,
.publish-wizard-page .question-header h2,
.publish-wizard-page .wizard-progress-head h2,
.publish-wizard-page .preset-card strong,
.publish-wizard-page .choice-card strong,
.publish-wizard-page .recommendation-card h4,
.publish-wizard-page .wizard-field span,
.publish-wizard-page .wizard-field strong {
  color: #f5f8fd;
}

.publish-wizard-page :is(.wizard-hero-copy p, .wizard-account-card p, .wizard-banner p, .wizard-alert p, .section-headline p, .support-strip p, .wizard-field p, .preset-card p, .choice-card p, .recommendation-card p, .wizard-progress-head p, .question-header p) {
  color: #9fb0c1;
}

.publish-wizard-page :is(.source-chip, .filter-chip, .preset-card, .choice-card, .recommendation-card) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(6, 10, 18, 0.72);
}

.publish-wizard-page :is(.source-chip.is-active, .filter-chip.is-selected, .preset-card.is-selected, .choice-card.is-selected, .recommendation-card.is-selected) {
  border-color: rgba(16, 138, 0, 0.4);
  background: rgba(16, 138, 0, 0.12);
}

.publish-wizard-page :is(input, textarea, select) {
  background: rgba(5, 9, 16, 0.84);
  border-color: rgba(148, 163, 184, 0.2);
  color: #f5f8fd;
}

.publish-wizard-page input::placeholder,
.publish-wizard-page textarea::placeholder {
  color: #8293a5;
}

.publish-wizard-page .button-primary {
  background: #108a00;
  color: #ffffff;
}

.publish-wizard-page .button-secondary {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(148, 163, 184, 0.16);
  color: #e5edf7;
}

.publish-wizard-page .soft-badge,
.publish-wizard-page .banner-tag,
.publish-wizard-page .soft-pill,
.publish-wizard-page .preset-tag,
.publish-wizard-page .tag-pill {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(148, 163, 184, 0.14);
  color: #e6edf6;
}
</style>
