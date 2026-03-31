<template>
  <section class="page-stack workspace-page" v-if="page">
    <article class="hero-card workspace-hero workspace-hero--compact stack-sm">
      <div class="workspace-object-hero-head">
        <div class="stack-sm workspace-object-hero-main">
          <div class="stack-xs">
            <span class="eyebrow">{{ isEnterprise ? '企业端协作空间' : '人才端执行台' }}</span>
            <h1 class="dashboard-title">{{ workspaceHeroTitle }}</h1>
            <p class="hero-lead dashboard-lead workspace-object-hero-lead">{{ workspaceHeroLead }}</p>
          </div>

          <div v-if="workspaceEntryLabel || currentTaskLabel || currentNodeLabel" class="tag-row workspace-object-hero-tags">
            <span v-if="workspaceEntryLabel" class="soft-pill">{{ workspaceEntryLabel }}</span>
            <span v-if="currentTaskLabel" class="soft-pill">{{ currentTaskLabel }}</span>
            <span v-if="currentNodeLabel" class="soft-pill">{{ currentNodeLabel }}</span>
          </div>
        </div>

        <div v-if="workspaceBackRoute || !hasTask" class="dashboard-hero-actions workspace-object-hero-actions">
          <router-link v-if="workspaceBackRoute" class="button-secondary" :to="workspaceBackRoute">
            {{ workspaceBackLabel }}
          </router-link>
          <router-link
            v-if="!hasTask && isEnterprise"
            class="button-primary"
            :to="roleRouteMap.enterprise.publish"
          >
            去发布任务
          </router-link>
          <router-link
            v-else-if="!hasTask"
            class="button-primary"
            :to="roleRouteMap.talent.market"
          >
            查看任务广场
          </router-link>
        </div>
      </div>
    </article>

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

    <article v-if="page.requestError" class="result-card stack-sm">
      <span class="eyebrow">数据同步失败</span>
      <h3>当前任务数据不是最新</h3>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <section v-if="hasTask" class="workspace-layout" :class="{ 'workspace-layout--single': !taskOptions.length }">
      <aside v-if="taskOptions.length" class="workspace-column workspace-column-rail workspace-pane workspace-pane--rail">
        <WorkspaceTaskRail
          :task-options="taskOptions"
          :current-task-id="currentTaskId"
          :is-enterprise="isEnterprise"
          @select-task="selectTask"
        />
      </aside>

      <main class="workspace-column workspace-column-main workspace-pane workspace-pane--main stack-md workspace-workbench" :class="{ 'is-enterprise': isEnterprise, 'is-talent': !isEnterprise }">
        <article class="glass-panel stack-md workspace-main-card workspace-main-card-focus workspace-command-card">
          <div class="workspace-command-grid">
            <section class="stack-md workspace-command-primary">
              <div class="stack-sm workspace-command-verdict">
                <div class="panel-header workspace-section-header">
                  <div>
                    <span class="eyebrow">当前结论</span>
                    <h3>{{ workspaceDecisionTitle }}</h3>
                  </div>
                </div>

                <p class="muted workspace-command-copy">{{ workspaceDecisionBody }}</p>

                <div v-if="workspaceDecisionTags.length" class="tag-row workspace-command-tags">
                  <span v-for="item in workspaceDecisionTags" :key="item" class="soft-pill">{{ item }}</span>
                </div>
              </div>

              <article v-if="focusedNode" class="mini-card stack-sm workspace-command-node">
                <div class="panel-header workspace-section-header">
                  <div>
                    <span class="eyebrow">当前节点</span>
                    <h4>{{ focusedNode.title }}</h4>
                  </div>
                  <span class="soft-pill">
                    {{ focusedNode ? `第 ${focusedNodeIndex + 1} / ${normalizedNodes.length} 节点` : `${normalizedNodes.length} 个节点` }}
                  </span>
                </div>

                <p class="muted workspace-command-copy">{{ workspaceFocusedNodeSummary }}</p>

                <div v-if="workspaceFocusedNodeTags.length" class="tag-row workspace-command-tags">
                  <span v-for="item in workspaceFocusedNodeTags" :key="item" class="soft-pill">{{ item }}</span>
                </div>

                <div class="workspace-command-node-grid">
                  <article class="workspace-command-node-fact">
                    <span class="workspace-summary-label">计划交付</span>
                    <strong>{{ focusedNode.expectedDeliverables || '待补充' }}</strong>
                  </article>
                  <article class="workspace-command-node-fact">
                    <span class="workspace-summary-label">最近同步</span>
                    <strong>{{ focusedNode.updatedAt || '待更新' }}</strong>
                    <p class="muted">{{ focusedNode.attachments.length ? `${focusedNode.attachments.length} 个附件` : '暂无附件' }}</p>
                  </article>
                </div>
              </article>

              <p v-else class="muted">当前还没有节点信息，先回聊天或任务详情确认最新进展。</p>
            </section>

            <aside class="stack-md workspace-command-sidebar">
              <article class="mini-card stack-sm workspace-command-action-card">
                <span class="eyebrow">当前动作</span>
                <strong>{{ focusedNodeActionTitle }}</strong>
                <p class="muted">{{ focusedNodeActionBody }}</p>

                <div class="dashboard-module-actions workspace-command-actions">
                  <router-link
                    v-if="workspaceFlowAction?.kind === 'route'"
                    :class="workspaceFlowAction.tone"
                    :to="workspaceFlowAction.to"
                  >
                    {{ workspaceFlowAction.label }}
                  </router-link>
                  <button
                    v-else-if="workspaceFlowAction"
                    :class="workspaceFlowAction.tone"
                    type="button"
                    @click="openTaskFlowModal(workspaceFlowAction.action)"
                  >
                    {{ workspaceFlowAction.label }}
                  </button>

                  <router-link v-if="isEnterprise && !workspaceFlowAction" class="button-primary" :to="focusedNodeChatRoute">
                    去聊天同步
                  </router-link>
                  <button
                    v-if="!isEnterprise && !workspaceFlowAction"
                    class="button-primary"
                    type="button"
                    @click="scrollToProgressForm"
                  >
                    提交本轮进展
                  </button>

                  <router-link v-if="!isEnterprise || workspaceFlowAction" class="button-secondary" :to="focusedNodeChatRoute">
                    去聊天同步
                  </router-link>
                  <button v-if="focusedNode" class="button-secondary" type="button" @click="openNode(focusedNode)">
                    当前节点详情
                  </button>
                  <button class="button-secondary" type="button" @click="openTaskDetail">查看任务详情</button>
                </div>
              </article>

              <article class="mini-card stack-sm workspace-command-context-card">
                <span class="eyebrow">必要上下文</span>

                <div class="workspace-command-context-grid">
                  <article v-for="item in workspaceContextItems" :key="item.label" class="workspace-command-context-item">
                    <span class="workspace-summary-label">{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                    <p class="muted">{{ item.note }}</p>
                  </article>
                </div>

                <article v-if="upcomingNode" class="workspace-command-next">
                  <span class="eyebrow">下一步</span>
                  <strong>{{ upcomingNode.title }}</strong>
                  <p class="muted">
                    {{ upcomingNode.workdayLabel || upcomingNode.plannedDate || upcomingNode.status || '等待同步' }}
                  </p>
                </article>
              </article>
            </aside>
          </div>
        </article>

        <section class="workspace-main-primary stack-md">
          <article class="glass-panel stack-md workspace-main-card workspace-main-card-nodes">
            <div class="panel-header workspace-section-header">
              <div>
                <span class="eyebrow">执行路径</span>
                <h3>{{ isEnterprise ? '只看当前推进路径' : '当前节点之后怎么走' }}</h3>
              </div>
              <span class="soft-pill">{{ normalizedNodes.length }} 个节点</span>
            </div>

            <div class="workspace-node-timeline">
              <button
                v-for="(node, index) in normalizedNodes"
                :key="node.id"
                class="workspace-node-card"
                :class="{ 'is-current': node.id === focusedNode?.id }"
                type="button"
                :ref="(element) => setNodeCardRef(node.id, element)"
                @click="openNode(node)"
              >
                <span class="workspace-node-rail">
                  <span class="workspace-node-index">{{ String(index + 1).padStart(2, '0') }}</span>
                  <span class="workspace-node-line"></span>
                </span>
                <div class="workspace-node-main">
                  <div class="workspace-node-head">
                    <div>
                      <h4>{{ node.title }}</h4>
                      <p class="workspace-node-card-copy">
                        {{ compactText(node.summary, 88) || '当前还没有节点说明。' }}
                      </p>
                    </div>
                    <span class="soft-pill">{{ node.status }}</span>
                  </div>
                  <div class="tag-row">
                    <span class="soft-pill">{{ node.workdayLabel || '待排期' }}</span>
                    <span class="soft-pill">{{ node.plannedDate || '待排期' }}</span>
                    <span class="soft-pill">{{ node.stageType || '执行节点' }}</span>
                  </div>
                  <div class="workspace-node-meta">
                    <span>{{ node.progress || '待同步' }}</span>
                    <span>{{ node.updatedAt || '待更新' }}</span>
                    <span>{{ node.attachments.length ? `${node.attachments.length} 个附件` : '暂无附件' }}</span>
                  </div>
                  <p class="muted workspace-node-deliverable">
                    计划交付：{{ compactText(node.expectedDeliverables, 84) || '待补充' }}
                  </p>
                </div>
              </button>
            </div>
          </article>

          <article class="glass-panel stack-md workspace-main-card workspace-main-card-process">
            <div class="panel-header workspace-section-header">
              <div>
                <span class="eyebrow">流程动作</span>
                <h3>{{ isEnterprise ? '只在需要时处理收口动作' : '只在需要时处理提前完成或取消' }}</h3>
              </div>
            </div>

            <div class="workspace-process-grid">
              <article class="mini-card stack-sm workspace-process-card">
                <div class="panel-header">
                  <div>
                    <h4>提前完成</h4>
                    <p class="muted">{{ earlyCompletionStatusText }}</p>
                  </div>
                  <span class="soft-pill">{{ earlyCompletion.status || '未发起' }}</span>
                </div>

                <p class="muted">{{ earlyCompletionSummary }}</p>

                <div class="tag-row" v-if="earlyCompletion.aiReviewStatus || earlyCompletion.grade || earlyCompletion.payoutRatio">
                  <span v-if="earlyCompletion.aiReviewStatus" class="soft-pill">{{ earlyCompletion.aiReviewStatus }}</span>
                  <span v-if="earlyCompletion.grade" class="soft-pill">评级 {{ earlyCompletion.grade }}</span>
                  <span v-if="earlyCompletion.payoutRatio" class="soft-pill">结算 {{ earlyCompletion.payoutRatio }}</span>
                </div>

                <div class="dashboard-module-actions">
                  <button
                    v-if="canRequestEarlyCompletion"
                    class="button-primary"
                    type="button"
                    @click="openTaskFlowModal('early_request')"
                  >
                    发起提前完成
                  </button>
                  <router-link
                    v-if="canOpenAcceptance"
                    class="button-primary"
                    :to="acceptanceRoute"
                  >
                    {{ isEnterprise ? '去验收与评级' : '查看评级结果' }}
                  </router-link>
                  <button
                    v-if="canApproveEarlyCompletion"
                    class="button-primary"
                    type="button"
                    @click="openTaskFlowModal('early_approve')"
                  >
                    同意提前完成
                  </button>
                  <button
                    v-if="canRejectEarlyCompletion"
                    class="button-secondary"
                    type="button"
                    @click="openTaskFlowModal('early_reject')"
                  >
                    继续执行
                  </button>
                  <span v-if="isEnterpriseWaitingGrade" class="soft-pill is-warning">等待企业评级</span>
                </div>
              </article>

              <article class="mini-card stack-sm workspace-process-card">
                <div class="panel-header">
                  <div>
                    <h4>取消任务</h4>
                    <p class="muted">{{ cancellationStatusText }}</p>
                  </div>
                  <span class="soft-pill">{{ cancellationRequest.status || '未发起' }}</span>
                </div>

                <p class="muted">{{ cancellationSummary }}</p>

                <div class="dashboard-module-actions">
                  <button
                    v-if="canRequestCancellation"
                    class="button-secondary"
                    type="button"
                    @click="openTaskFlowModal('cancel_request')"
                  >
                    申请取消任务
                  </button>
                  <button
                    v-if="canApproveCancellation"
                    class="button-primary"
                    type="button"
                    @click="openTaskFlowModal('cancel_approve')"
                  >
                    同意取消
                  </button>
                  <button
                    v-if="canRejectCancellation"
                    class="button-secondary"
                    type="button"
                    @click="openTaskFlowModal('cancel_reject')"
                  >
                    继续执行
                  </button>
                  <span v-if="cancellationWaitingCounterpart" class="soft-pill is-warning">等待对方确认</span>
                </div>
              </article>
            </div>

            <p v-if="taskFlowResult" class="soft-pill">{{ taskFlowResult }}</p>
          </article>

          <article
            v-if="hasTask && !isEnterprise"
            ref="progressComposerCard"
            class="glass-panel stack-md workspace-main-card workspace-main-card-progress"
          >
            <div class="panel-header workspace-section-header">
              <div>
                <span class="eyebrow">同步这一轮</span>
                <h3>只补当前节点的结果、阻塞和附件</h3>
              </div>
            </div>

            <form class="workspace-progress-form" @submit.prevent="submitProgressForm">
              <label class="form-field">
                <span>阶段名称</span>
                <input v-model.trim="progressForm.stageName" type="text" placeholder="例如：首版页面交付" />
              </label>

              <div class="workspace-progress-grid">
                <label class="form-field">
                  <span>完成度</span>
                  <input v-model.trim="progressForm.completion" type="text" placeholder="例如：68%" />
                </label>
                <label class="form-field">
                  <span>需要的协助</span>
                  <select v-model="progressForm.supportNeeded">
                    <option value="">暂不需要</option>
                    <option v-for="option in page.supportOptions || []" :key="option" :value="option">{{ option }}</option>
                  </select>
                </label>
              </div>

              <label class="form-field">
                <span>进展说明</span>
                <textarea
                  v-model.trim="progressForm.progressSummary"
                  rows="4"
                  placeholder="只写这一轮已经完成了什么、交付了什么、下一步准备怎么推进。"
                ></textarea>
              </label>

              <label class="form-field">
                <span>上传进度附件</span>
                <input type="file" multiple @change="handleProgressFiles" />
              </label>

              <div v-if="progressFiles.length" class="tag-row">
                <span v-for="file in progressFiles" :key="file.name" class="tag-pill tag-pill-muted">
                  {{ file.name }}
                </span>
              </div>

              <div class="dashboard-module-actions">
                <button class="button-primary" type="submit" :disabled="submittingProgress">
                  {{ submittingProgress ? '提交中…' : '提交本轮进展' }}
                </button>
                <span v-if="progressResult" class="soft-pill">{{ progressResult }}</span>
              </div>
            </form>
          </article>

          <article v-if="hasTask && !isEnterprise" class="glass-panel stack-md workspace-main-card workspace-main-card-records">
            <div class="panel-header workspace-section-header">
              <div>
                <span class="eyebrow">最近记录</span>
                <h3>{{ isEnterprise ? '最近几轮进展与 AI 审核' : '最近几轮提交与审核结果' }}</h3>
              </div>
            </div>

            <div class="workspace-record-list">
              <article v-for="item in recordItems" :key="item.key" class="mini-card stack-sm workspace-record-card">
                <div class="panel-header">
                  <div>
                    <h4>{{ item.title }}</h4>
                    <p class="muted">{{ item.time }}</p>
                  </div>
                  <span class="soft-pill">{{ item.badge }}</span>
                </div>
                <p class="muted">{{ item.summary }}</p>
              </article>
            </div>
          </article>
        </section>
      </main>
    </section>

    <article v-if="!hasTask" class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">暂无协作任务</span>
          <h3>{{ isEnterprise ? '先发布任务，再进入协作空间' : '先接单，再在这里同步进展' }}</h3>
        </div>
      </div>

      <p class="muted">
        {{ isEnterprise ? '企业发布任务并选中人才后，多任务协作会自动出现在这里。' : '人才接单并确认任务后，执行进展、协助需求和附件都会沉淀在这里。' }}
      </p>

      <div class="dashboard-hero-actions">
        <router-link v-if="isEnterprise" class="button-primary" :to="roleRouteMap.enterprise.publish">去发布任务</router-link>
        <router-link v-else class="button-primary" :to="roleRouteMap.talent.market">查看任务广场</router-link>
      </div>
    </article>

    <div v-if="taskDetailVisible" class="dashboard-detail-modal" @click.self="closeTaskDetail">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">任务详情</span>
            <h3>{{ page.taskDetail.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeTaskDetail">关闭</button>
        </div>

        <p class="muted">{{ page.taskDetail.brief }}</p>

        <div class="dashboard-detail-dual">
          <div class="mini-card stack-sm">
            <h4>基础信息</h4>
            <ul class="dashboard-detail-list">
              <li>预算：{{ page.taskDetail.budget || '未填写预算' }}</li>
              <li>周期：{{ page.taskDetail.period || page.summary.range }}</li>
              <li>协作安排：{{ page.taskDetail.scheduleNote || '待补充' }}</li>
              <li>状态：{{ page.taskDetail.status }}</li>
              <li>{{ isEnterprise ? '人才' : '企业' }}：{{ isEnterprise ? page.summary.talent : page.summary.business }}</li>
            </ul>
          </div>

          <div class="mini-card stack-sm">
            <h4>交付件</h4>
            <ul class="dashboard-detail-list">
              <li v-for="item in listOf(page.taskDetail.deliverables)" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div v-if="page.taskDetail.calendarPreview?.headline || listOf(page.taskDetail.calendarPreview?.items).length" class="mini-card stack-sm">
          <h4>人才档期</h4>
          <p class="muted">{{ page.taskDetail.calendarPreview?.headline || '待同步' }}</p>
          <div class="tag-row" v-if="listOf(page.taskDetail.calendarPreview?.items).length">
            <span
              v-for="item in listOf(page.taskDetail.calendarPreview?.items)"
              :key="`${item.day}-${item.note}`"
              class="soft-pill"
            >
              {{ item.day }} · {{ item.note }}
            </span>
          </div>
        </div>

        <div class="mini-card stack-sm">
          <h4>AI 拆解模块</h4>
          <ul class="dashboard-detail-list">
            <li v-for="item in listOf(page.taskDetail.modules)" :key="item.name || item">{{ item.name || item }}</li>
          </ul>
        </div>
      </article>
    </div>

    <div v-if="activeNode" class="dashboard-detail-modal" @click.self="closeNode">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">阶段节点</span>
            <h3>{{ activeNode.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeNode">关闭</button>
        </div>

        <div class="dashboard-detail-dual workspace-node-modal-grid">
          <div class="mini-card stack-sm">
            <h4>计划信息</h4>
            <ul class="dashboard-detail-list">
              <li>工作日：{{ activeNode.workdayLabel || '待排期' }}</li>
              <li>计划日期：{{ activeNode.plannedDate || '待排期' }}</li>
              <li>节点类型：{{ activeNode.stageType || '执行节点' }}</li>
              <li>计划交付：{{ activeNode.expectedDeliverables || '待补充' }}</li>
            </ul>
          </div>

          <div class="mini-card stack-sm">
            <h4>{{ isEnterprise ? '人才提交' : '本轮提交' }}</h4>
            <p class="muted">{{ activeNode.submissionContent }}</p>
            <div class="tag-row" v-if="activeNode.attachments.length">
              <span v-for="item in activeNode.attachments" :key="item" class="tag-pill tag-pill-muted">{{ item }}</span>
            </div>
            <p class="muted" v-if="activeNode.supportNeeded">协助需求：{{ activeNode.supportNeeded }}</p>
            <p class="muted">{{ activeNode.submissionTime || activeNode.updatedAt }}</p>
          </div>

          <div class="mini-card stack-sm">
            <h4>AI 审核</h4>
            <p class="muted">{{ activeNode.aiReview.summary || '当前还没有 AI 审核摘要。' }}</p>
            <div class="tag-row">
              <span class="soft-pill">{{ activeNode.aiReview.status || '待生成' }}</span>
              <span class="soft-pill" v-if="activeNode.aiReview.score">评分 {{ activeNode.aiReview.score }}</span>
              <span class="soft-pill" v-if="activeNode.aiReview.focus">{{ activeNode.aiReview.focus }}</span>
            </div>
            <ul class="dashboard-detail-list" v-if="listOf(activeNode.aiReview.suggestions).length">
              <li v-for="item in listOf(activeNode.aiReview.suggestions)" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div class="mini-card stack-sm">
          <h4>{{ isEnterprise ? '企业改进建议' : '企业反馈与 AI 补充' }}</h4>
          <p class="muted">
            {{ activeNode.businessSuggestion.summary || (isEnterprise ? '当前还没有提交新的企业建议。' : '企业暂时还没有补充新的改进建议。') }}
          </p>
          <p class="muted" v-if="activeNode.businessSuggestion.aiSupplement">
            {{ activeNode.businessSuggestion.aiSupplement }}
          </p>
          <p class="muted" v-if="activeNode.businessSuggestion.updatedAt">最近更新：{{ activeNode.businessSuggestion.updatedAt }}</p>
        </div>

        <div class="dashboard-module-actions">
          <router-link class="button-secondary" :to="activeNodeChatRoute">
            去聊天同步这个节点
          </router-link>
        </div>

        <form v-if="isEnterprise" class="workspace-feedback-form stack-sm" @submit.prevent="submitNodeFeedback">
          <label class="form-field">
            <span>新增改进建议</span>
            <textarea
              v-model.trim="feedbackForm.summary"
              rows="4"
              placeholder="例如：请把本轮交付件按阶段拆开，并补一份给验收用的说明。"
            ></textarea>
          </label>
          <div class="dashboard-module-actions">
            <button class="button-primary" type="submit" :disabled="submittingFeedback">
              {{ submittingFeedback ? '保存中…' : '保存建议' }}
            </button>
            <span v-if="feedbackResult" class="soft-pill">{{ feedbackResult }}</span>
          </div>
        </form>
      </article>
    </div>

    <div v-if="taskFlowModalOpen" class="dashboard-detail-modal" @click.self="closeTaskFlowModal">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">任务动作</span>
            <h3>{{ taskFlowTitle }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeTaskFlowModal">关闭</button>
        </div>

        <p class="muted">{{ taskFlowDescription }}</p>

        <div class="dashboard-preview-list">
          <div class="dashboard-preview-item">
            <span class="status-dot"></span>
            <p class="muted">任务：{{ page.taskDetail.title }}</p>
          </div>
          <div class="dashboard-preview-item">
            <span class="status-dot"></span>
            <p class="muted">预算：{{ page.taskDetail.budget || '未填写预算' }}</p>
          </div>
          <div class="dashboard-preview-item">
            <span class="status-dot"></span>
            <p class="muted">当前状态：{{ page.taskDetail.status }}</p>
          </div>
        </div>

        <label class="form-field">
          <span>{{ taskFlowInputLabel }}</span>
          <textarea
            v-model.trim="taskFlowForm.note"
            rows="4"
            :placeholder="taskFlowPlaceholder"
          ></textarea>
        </label>

        <div v-if="taskFlowMode === 'early_grade'" class="form-field">
          <span>交付评级</span>
          <div class="tag-row">
            <button
              v-for="item in deliveryGradeOptions"
              :key="item.value"
              type="button"
              class="button-secondary"
              :class="{ 'is-active-tab': taskFlowForm.grade === item.value }"
              @click="taskFlowForm.grade = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <p v-if="taskFlowError" class="form-error">{{ taskFlowError }}</p>

        <div class="dashboard-module-actions">
          <button class="button-secondary" type="button" :disabled="submittingTaskFlow" @click="closeTaskFlowModal">
            取消
          </button>
          <button class="button-primary" type="button" :disabled="submittingTaskFlow" @click="submitTaskFlowAction">
            {{ submittingTaskFlow ? '提交中…' : taskFlowPrimaryLabel }}
          </button>
        </div>
      </article>
    </div>
  </section>

  <section v-else-if="loading" class="page-stack workspace-page">
    <article class="glass-panel workspace-loading-shell">
      <div class="workspace-loading-card stack-sm">
        <span class="eyebrow">协作空间加载中</span>
        <h3 class="dashboard-title">正在读取当前任务与协作节点</h3>
        <p class="muted">请稍等，页面会自动同步任务详情、进度和 AI 审核信息。</p>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LiveSyncStatusBar from '../components/LiveSyncStatusBar.vue';
import {
  getWorkspaceData,
  submitEarlyCompletion,
  submitTaskCancellation,
  submitTaskProgress,
  submitWorkspaceFeedback,
  uploadTaskAttachmentAsset
} from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream';
import WorkspaceTaskRail from '../components/workspace/WorkspaceTaskRail.vue';
import {
  buildCenterReturnQuery,
  buildChildObjectPageContext,
  labelForObjectPageSource,
  readObjectPageContext,
  resolveImmediateOriginContext
} from '../utils/objectPageContext.js';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();

const page = ref(null);
const loading = ref(false);
const taskDetailVisible = ref(false);
const activeNode = ref(null);
const progressFiles = ref([]);
const progressResult = ref('');
const feedbackResult = ref('');
const taskFlowResult = ref('');
const liveSyncStatus = ref(null);
const liveSyncError = ref('');
const submittingProgress = ref(false);
const submittingFeedback = ref(false);
const taskFlowModalOpen = ref(false);
const taskFlowMode = ref('');
const taskFlowError = ref('');
const submittingTaskFlow = ref(false);
const nodeCardRefs = ref({});
const progressComposerCard = ref(null);
let stopBusinessLiveSync = null;
let workspaceLoadToken = 0;

function handleLiveSyncStatus(snapshot) {
  liveSyncStatus.value = snapshot ? { ...snapshot } : null;
  if (snapshot?.state === 'open') {
    liveSyncError.value = '';
  }
}

function handleLiveSyncError() {
  liveSyncError.value = '最近一次实时同步出现波动，页面会自动重连或切到轮询。';
}

const progressForm = ref({
  stageName: '',
  completion: '',
  progressSummary: '',
  supportNeeded: ''
});

const feedbackForm = ref({
  summary: ''
});
const taskFlowForm = ref({
  note: '',
  grade: 'A'
});

const isEnterprise = computed(() => route.meta?.audience === 'enterprise');
const pageContext = computed(() =>
  readObjectPageContext(route.query, {
    taskId: page.value?.summary?.taskId
  })
);
const currentTaskId = computed(() => pageContext.value.taskId);
const currentRoomKey = computed(() => pageContext.value.room);
const currentRecordId = computed(() => pageContext.value.recordId);
const currentRecordTab = computed(() => pageContext.value.tab);
const currentNodeId = computed(() => pageContext.value.nodeId);
const workspaceEntrySource = computed(() => pageContext.value.source);
const originContext = computed(() =>
  resolveImmediateOriginContext({
    entrySource: workspaceEntrySource.value,
    query: route.query,
    defaults: {
      taskId: page.value?.summary?.taskId
    },
    allowedSources: ['approvals', 'notifications', 'messages', 'records', 'record-detail', 'acceptance', 'dashboard-enterprise', 'dashboard-talent']
  })
);
const hasTask = computed(() => Boolean(page.value?.taskDetail?.taskId));
const taskOptions = computed(() => listOf(page.value?.taskOptions));
const currentTaskLabel = computed(() => {
  const taskId = currentTaskId.value;
  const pageTaskId = String(page.value?.taskDetail?.taskId || '').trim();
  const title = String(page.value?.taskDetail?.title || '').trim();
  if (title && (!taskId || !pageTaskId || pageTaskId === taskId)) {
    return `当前任务 · ${title}`;
  }
  return taskId ? `任务 ${taskId}` : '';
});
const activeNodeChatRoute = computed(() => ({
  path: isEnterprise.value ? roleRouteMap.enterprise.messages : roleRouteMap.talent.messages,
  query: buildWorkspaceContextQuery({
    source: 'workspace',
    nodeId: activeNode.value?.id || currentNodeId.value || undefined
  })
}));
const acceptanceRoute = computed(() => ({
  path: isEnterprise.value ? roleRouteMap.enterprise.acceptance : roleRouteMap.talent.acceptance,
  query: buildWorkspaceContextQuery({
    source: 'workspace'
  })
}));
const workspaceEntryLabel = computed(() => {
  if (workspaceEntrySource.value === 'approvals') {
    return '来自审批中心';
  }
  if (workspaceEntrySource.value === 'notifications') {
    return '来自通知中心';
  }
  if (workspaceEntrySource.value === 'messages') {
    return '来自项目聊天';
  }
  if (workspaceEntrySource.value === 'records') {
    return '来自记录列表';
  }
  if (workspaceEntrySource.value === 'record-detail') {
    return '来自记录详情';
  }
  if (workspaceEntrySource.value === 'dashboard-enterprise') {
    return '来自企业工作台';
  }
  if (workspaceEntrySource.value === 'dashboard-talent') {
    return '来自人才工作台';
  }
  return '';
});

function routeForWorkspaceImmediateSource(source) {
  if (source === 'messages') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.messages : roleRouteMap.talent.messages,
      query: buildWorkspaceContextQuery({
        source: 'workspace'
      })
    };
  }

  if (source === 'acceptance') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.acceptance : roleRouteMap.talent.acceptance,
      query: buildWorkspaceContextQuery({
        source: 'acceptance',
        nodeId: undefined
      })
    };
  }

  if (source === 'approvals') {
    return {
      path: roleRouteMap.enterprise.approvals,
      query: buildCenterReturnQuery({
        current: pageContext.value,
        origin: originContext.value
      })
    };
  }

  if (source === 'notifications') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.notifications : roleRouteMap.talent.notifications,
      query: buildCenterReturnQuery({
        current: pageContext.value,
        origin: originContext.value
      })
    };
  }

  if (source === 'records') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.records : roleRouteMap.talent.records,
      query: currentRecordTab.value ? { tab: currentRecordTab.value } : {}
    };
  }

  if (source === 'record-detail' && currentRecordId.value) {
    return {
      path: isEnterprise.value
        ? roleRouteMap.enterprise.recordDetail(currentRecordId.value)
        : roleRouteMap.talent.recordDetail(currentRecordId.value),
      query: buildWorkspaceContextQuery({
        source: 'record-detail',
        nodeId: undefined
      })
    };
  }

  if (source === 'dashboard-enterprise') {
    return { path: roleRouteMap.enterprise.home };
  }

  if (source === 'dashboard-talent') {
    return { path: roleRouteMap.talent.home };
  }

  return null;
}

const workspaceBackRoute = computed(() => {
  const directRoute = routeForWorkspaceImmediateSource(workspaceEntrySource.value);
  if (directRoute) {
    return directRoute;
  }

  if (workspaceEntrySource.value === 'workspace') {
    const originRoute = routeForWorkspaceImmediateSource(originContext.value.source);
    if (originRoute) {
      return originRoute;
    }
  }

  return null;
});
const workspaceBackLabel = computed(() => {
  const source = workspaceEntrySource.value === 'workspace' ? originContext.value.source : workspaceEntrySource.value;
  return labelForObjectPageSource(source, '返回来源');
});

const enterpriseLead = '切换任务查看执行情况、节点交付、AI 审核和企业反馈。';
const talentLead = '集中查看任务计划、提交进展、补充协助需求和上传附件。';
const earlyCompletion = computed(() => page.value?.earlyCompletion || { status: '未发起' });
const cancellationRequest = computed(() => page.value?.cancellationRequest || { status: '未发起' });
const currentAudience = computed(() => (isEnterprise.value ? 'enterprise' : 'talent'));
const cancellationWaitingCounterpart = computed(() => cancellationRequest.value.status === '待对方确认取消');
const canRequestEarlyCompletion = computed(() =>
  isEnterprise.value &&
  hasTask.value &&
  !['待人才同意提前完成', '待企业评级', '已完成评级', '已取消'].includes(earlyCompletion.value.status || '') &&
  page.value?.taskDetail?.status !== '已取消'
);
const canApproveEarlyCompletion = computed(() =>
  !isEnterprise.value && earlyCompletion.value.status === '待人才同意提前完成'
);
const canRejectEarlyCompletion = canApproveEarlyCompletion;
const isEnterpriseWaitingGrade = computed(() => isEnterprise.value && earlyCompletion.value.status === '待企业评级');
const canOpenAcceptance = computed(() =>
  hasTask.value &&
  (
    earlyCompletion.value.status === '待企业评级' ||
    earlyCompletion.value.status === '已完成评级' ||
    page.value?.taskDetail?.status === '待双方评分闭环' ||
    page.value?.taskDetail?.status === '已提前完成'
  )
);
const canRequestCancellation = computed(() =>
  hasTask.value &&
  !['待对方确认取消', '已取消'].includes(cancellationRequest.value.status || '') &&
  !['已提前完成', '已取消'].includes(page.value?.taskDetail?.status || '')
);
const canApproveCancellation = computed(() =>
  cancellationWaitingCounterpart.value &&
  cancellationRequest.value.initiatorAudience &&
  cancellationRequest.value.initiatorAudience !== currentAudience.value
);
const canRejectCancellation = canApproveCancellation;
const deliveryGradeOptions = [
  { value: 'S', label: 'S · 100%' },
  { value: 'A', label: 'A · 80%' },
  { value: 'B', label: 'B · 30%' }
];

const normalizedNodes = computed(() => listOf(page.value?.collaborationNodes).map(normalizeNode));
const currentNode = computed(() =>
  normalizedNodes.value.find((node) => node.id === currentNodeId.value) || null
);
const focusedNode = computed(() => {
  if (currentNode.value) {
    return currentNode.value;
  }
  if (!normalizedNodes.value.length) {
    return null;
  }
  return normalizedNodes.value.find((node) => !['已完成', '已取消'].includes(node.status || '')) || normalizedNodes.value[0];
});
const focusedNodeIndex = computed(() =>
  focusedNode.value ? normalizedNodes.value.findIndex((node) => node.id === focusedNode.value.id) : -1
);
const upcomingNode = computed(() => {
  if (!focusedNode.value || focusedNodeIndex.value < 0) {
    return null;
  }
  return normalizedNodes.value[focusedNodeIndex.value + 1] || null;
});
const currentNodeLabel = computed(() => {
  if (!currentNodeId.value) {
    return '';
  }
  return currentNode.value?.title ? `当前节点 · ${currentNode.value.title}` : `节点 ${currentNodeId.value}`;
});
const focusedNodeChatRoute = computed(() => ({
  path: isEnterprise.value ? roleRouteMap.enterprise.messages : roleRouteMap.talent.messages,
  query: buildWorkspaceContextQuery({
    source: 'workspace',
    nodeId: focusedNode.value?.id || currentNodeId.value || undefined
  })
}));
const workspaceCounterpartLabel = computed(() => (isEnterprise.value ? '协作人才' : '合作企业'));
const workspaceCounterpartValue = computed(() =>
  isEnterprise.value ? page.value?.summary?.talent || '待同步' : page.value?.summary?.business || '待同步'
);
const workspaceDecisionTags = computed(() =>
  [
    page.value?.taskDetail?.status,
    earlyCompletion.value.status !== '未发起' ? earlyCompletion.value.status : '',
    cancellationRequest.value.status !== '未发起' ? cancellationRequest.value.status : ''
  ].filter(Boolean)
);
const workspaceFocusedNodeTags = computed(() =>
  [
    focusedNode.value?.status,
    focusedNode.value?.progress,
    focusedNode.value?.workdayLabel || '待排期',
    focusedNode.value?.plannedDate || '待排期'
  ].filter(Boolean)
);
const workspaceFocusedNodeSummary = computed(() =>
  compactText(focusedNode.value?.summary, 72) || '当前还没有更多节点说明。'
);
const workspaceContextItems = computed(() => [
  {
    label: workspaceCounterpartLabel.value,
    value: workspaceCounterpartValue.value,
    note: isEnterprise.value ? '当前合作人才' : '当前合作企业'
  },
  {
    label: '预算',
    value: page.value?.taskDetail?.budget || '未填写预算',
    note: '当前任务预算'
  },
  {
    label: '周期',
    value: page.value?.taskDetail?.period || page.value?.summary?.range || '待确认',
    note: '当前计划周期'
  },
  {
    label: '当前节点',
    value: focusedNode.value?.title || '等待节点同步',
    note: focusedNode.value?.status || '等待同步'
  }
]);
const workspaceHeroTitle = computed(() => {
  if (!hasTask.value) {
    return isEnterprise.value ? '等待协作开始' : '等待开始执行';
  }
  return page.value?.taskDetail?.title || (isEnterprise.value ? '协作执行台' : '执行工作台');
});
const workspaceHeroLead = computed(() => {
  if (!hasTask.value) {
    return isEnterprise.value ? '先发布任务并选中人才，再回这里盯当前节点。' : '先确认任务，再回这里同步结果和附件。';
  }
  if (canOpenAcceptance.value) {
    return isEnterprise.value ? '当前结果已接近验收，首屏只保留节点、动作和必要上下文。' : '当前结果已进入验收闭环，先看结论再决定下一步。';
  }
  return isEnterprise.value
    ? '只看当前任务、关键节点和最新同步。'
    : '只看当前节点、本轮结果和需要同步的内容。';
});
const workspaceDecisionTitle = computed(() => {
  if (!hasTask.value) {
    return isEnterprise.value ? '先完成发布和选人' : '先确认一单任务';
  }
  if (page.value?.taskDetail?.status === '已取消') {
    return '任务已取消，当前只保留历史上下文';
  }
  if (canOpenAcceptance.value) {
    return isEnterprise.value ? '当前可以进入验收与评级' : '当前结果已进入验收闭环';
  }
  if (cancellationWaitingCounterpart.value) {
    return '取消流程正在等待对方确认';
  }
  if (canApproveEarlyCompletion.value) {
    return '当前需要先确认是否接受提前完成';
  }
  if (isEnterpriseWaitingGrade.value) {
    return '当前只差企业完成最终评级';
  }
  if (canRequestEarlyCompletion.value) {
    return '当前交付已接近验收，可决定是否提前完成';
  }
  if (!isEnterprise.value && latestProgress.value) {
    return '这一轮结果已提交，等待企业反馈或继续推进';
  }
  return isEnterprise.value ? '先处理当前节点，再决定是否触发流程动作' : '先推进当前节点，再补这一轮同步';
});
const workspaceDecisionBody = computed(() => {
  if (!hasTask.value) {
    return isEnterprise.value ? '协作空间只承接已经进入合作的任务。' : '执行台只承接已经确认的任务。';
  }
  if (canOpenAcceptance.value) {
    return '验收页会接住评级和结算，这里只保留当前节点与动作。';
  }
  if (cancellationWaitingCounterpart.value) {
    return compactText(cancellationSummary.value, 72);
  }
  if (canApproveEarlyCompletion.value || isEnterpriseWaitingGrade.value || canRequestEarlyCompletion.value) {
    return compactText(earlyCompletionSummary.value, 72);
  }
  return compactText(
    focusedNode.value?.summary || page.value?.taskDetail?.brief || (isEnterprise.value ? enterpriseLead : talentLead),
    88
  );
});
const focusedNodeActionTitle = computed(() => {
  if (!focusedNode.value) {
    return '等待节点同步';
  }
  if (!isEnterprise.value) {
    return '提交这一轮结果，并说明是否需要协助';
  }
  if (canOpenAcceptance.value) {
    return '这轮结果已足够进入验收与评级';
  }
  return '先判断这轮提交是否可以继续推进';
});
const focusedNodeActionBody = computed(() => {
  if (!focusedNode.value) {
    return '节点同步后，这里会给出当前动作建议。';
  }
  if (!isEnterprise.value) {
    return '只补这一轮完成度、说明和附件，其它历史留给右侧上下文。';
  }
  if (canOpenAcceptance.value) {
    return '如果已满足范围，就直接进入验收页处理后续评级。';
  }
  return '如果还不够进入验收，就在节点详情里给出补充建议。';
});
const workspaceFlowAction = computed(() => {
  if (!hasTask.value) {
    return null;
  }
  if (canOpenAcceptance.value) {
      return {
      kind: 'route',
      label: isEnterprise.value ? '去验收与评级' : '查看评级结果',
      to: acceptanceRoute.value,
      tone: 'button-primary'
    };
  }
  if (canApproveEarlyCompletion.value) {
    return {
      kind: 'modal',
      label: '同意提前完成',
      action: 'early_approve',
      tone: 'button-primary'
    };
  }
  if (canRequestEarlyCompletion.value) {
    return {
      kind: 'modal',
      label: '发起提前完成',
      action: 'early_request',
      tone: 'button-primary'
    };
  }
  return null;
});

const latestProgress = computed(() => {
  const items = listOf(page.value?.progressFeed);
  return items.length ? items[items.length - 1] : null;
});

const recordItems = computed(() => {
  const progress = listOf(page.value?.progressFeed).slice(0, 2).map((item, index) => ({
    key: `progress-${index}`,
    title: item.stage || '最新进展',
    time: item.time || item.submittedAt || '刚刚更新',
    badge: item.completion || '进展',
    summary: item.summary || '当前还没有更多进展说明。'
  }));

  const reviews = listOf(page.value?.aiReviewHistory).slice(0, 2).map((item, index) => ({
    key: `review-${index}`,
    title: item.title || 'AI 巡检',
    time: item.focus || 'AI 审核',
    badge: item.status || '已生成',
    summary: item.summary || '当前还没有 AI 建议。'
  }));

  return [...progress, ...reviews];
});

const earlyCompletionStatusText = computed(() => {
  if (earlyCompletion.value.status === '待人才同意提前完成') {
    return 'AI 已审核通过，等待人才确认是否接受提前完成。';
  }
  if (earlyCompletion.value.status === '待企业评级') {
    return '人才已同意提前完成，企业现在需要完成 S / A / B 评级。';
  }
  if (earlyCompletion.value.status === '已完成评级') {
    return `已完成 ${earlyCompletion.value.grade || ''} 级评级，当前按 ${earlyCompletion.value.payoutRatio || '待确认'} 结算。`;
  }
  if (earlyCompletion.value.status === 'AI未通过') {
    return 'AI 暂未通过提前完成，建议继续补充交付与质量说明。';
  }
  if (earlyCompletion.value.status === '人才已驳回') {
    return '人才暂不同意提前完成，任务继续执行。';
  }
  return '只有企业可以发起提前完成，AI 会先审核当前进度和交付质量。';
});

const earlyCompletionSummary = computed(() =>
  earlyCompletion.value.aiReviewSummary ||
  earlyCompletion.value.gradeNote ||
  earlyCompletion.value.talentDecisionNote ||
  earlyCompletion.value.requestNote ||
  '当任务接近完成时，企业可以发起提前完成，AI 会先核对质量与进度。'
);

const cancellationStatusText = computed(() => {
  if (cancellationRequest.value.status === '待对方确认取消') {
    return '当前已经发起取消申请，等待对方确认。';
  }
  if (cancellationRequest.value.status === '已取消') {
    return '任务已取消，历史聊天与协作记录会继续保留。';
  }
  if (cancellationRequest.value.status === '对方已拒绝取消') {
    return '上一条取消申请已被拒绝，任务恢复执行中。';
  }
  return '人才或企业都可以提出取消任务，但必须经过对方确认。';
});

const cancellationSummary = computed(() =>
  cancellationRequest.value.counterpartyDecisionNote ||
  cancellationRequest.value.reason ||
  '如果任务范围、预算或合作基础发生重大变化，可以发起取消流程。'
);

const taskFlowTitle = computed(() => {
  switch (taskFlowMode.value) {
    case 'early_request':
      return '发起提前完成';
    case 'early_approve':
      return '确认提前完成';
    case 'early_reject':
      return '继续执行任务';
    case 'early_grade':
      return '完成交付评级';
    case 'cancel_request':
      return '申请取消任务';
    case 'cancel_approve':
      return '同意取消任务';
    case 'cancel_reject':
      return '拒绝取消任务';
    default:
      return '处理任务动作';
  }
});

const taskFlowDescription = computed(() => {
  switch (taskFlowMode.value) {
    case 'early_request':
      return '提交给 AI 的说明越清楚，越容易快速判断当前任务是否适合提前完成。';
    case 'early_approve':
      return '如果你认为当前交付质量已经足够进入完结与评级，可以直接同意。';
    case 'early_reject':
      return '如果还有关键交付未完成，可以说明原因，任务会继续保持执行中。';
    case 'early_grade':
      return '企业按 S / A / B 给出最终交付评级，并决定 100% / 80% / 30% 结算比例。';
    case 'cancel_request':
      return '取消任务需要对方同意，建议把取消原因写清楚，减少来回确认。';
    case 'cancel_approve':
      return '确认后任务会进入已取消状态，但历史记录会继续保留。';
    case 'cancel_reject':
      return '如果你希望继续执行，可以说明理由，任务会恢复执行中。';
    default:
      return '围绕当前任务继续处理关键动作。';
  }
});

const taskFlowInputLabel = computed(() => (taskFlowMode.value === 'early_grade' ? '评级说明' : '补充说明'));
const taskFlowPlaceholder = computed(() => {
  switch (taskFlowMode.value) {
    case 'early_request':
      return '例如：当前页面、附件和 AI 审核记录已经足够支撑验收，希望提前完成。';
    case 'early_reject':
      return '例如：还差一轮关键附件和交付说明，希望继续执行。';
    case 'cancel_request':
      return '例如：任务目标变化较大，当前预算与周期已不再适合继续推进。';
    case 'cancel_reject':
      return '例如：当前任务已经接近完成，建议继续执行并走正常验收。';
    case 'early_grade':
      return '例如：交付完整、质量高、沟通顺畅，给出 S 级评级。';
    default:
      return '可补充你对当前动作的说明。';
  }
});

const taskFlowPrimaryLabel = computed(() => {
  switch (taskFlowMode.value) {
    case 'early_request':
      return '提交 AI 审核';
    case 'early_approve':
      return '确认提前完成';
    case 'early_reject':
      return '继续执行';
    case 'early_grade':
      return '提交评级';
    case 'cancel_request':
      return '发起取消申请';
    case 'cancel_approve':
      return '确认取消';
    case 'cancel_reject':
      return '拒绝取消';
    default:
      return '提交';
  }
});

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function compactText(value, limit = 96) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, Math.max(0, limit - 3)).trim()}...`;
}

function isFailedResult(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
}

function buildWorkspaceContextQuery(overrides = {}) {
  return buildChildObjectPageContext({
    current: pageContext.value,
    origin: originContext.value,
    overrides
  });
}

function normalizeNode(node) {
  const aiReview = node?.aiReview && typeof node.aiReview === 'object' ? node.aiReview : {};
  const businessSuggestionObject =
    node?.businessSuggestion && typeof node.businessSuggestion === 'object'
      ? node.businessSuggestion
      : null;
  const enterpriseFeedback =
    node?.enterpriseFeedback && typeof node.enterpriseFeedback === 'object' ? node.enterpriseFeedback : null;

  return {
    id: node?.nodeId || node?.id || '',
    title: node?.title || '未命名节点',
    status: node?.status || '待开始',
    progress: node?.completion || node?.progress || '',
    updatedAt: node?.time || node?.updatedAt || '',
    summary: node?.summary || node?.talentSubmission?.content || '当前还没有节点说明。',
    workdayLabel: node?.workdayLabel || '',
    plannedDate: node?.plannedDate || '',
    expectedDeliverables: node?.expectedDeliverables || '',
    stageType: node?.stageType || '',
    supportNeeded: node?.supportNeeded || '',
    attachments: listOf(node?.attachments).length ? listOf(node.attachments) : listOf(node?.talentSubmission?.attachments),
    submissionTime: node?.talentSubmission?.time || node?.time || '',
    submissionContent: node?.talentSubmission?.content || node?.summary || '',
    aiReview,
    businessSuggestion: {
      summary:
        businessSuggestionObject?.summary ||
        enterpriseFeedback?.text ||
        node?.enterpriseSuggestion ||
        '',
      aiSupplement:
        businessSuggestionObject?.aiSupplement ||
        enterpriseFeedback?.aiInterpretation ||
        node?.aiInterpretation ||
        '',
      updatedAt: businessSuggestionObject?.updatedAt || enterpriseFeedback?.updatedAt || '',
      author: businessSuggestionObject?.author || ''
    }
  };
}

async function loadPage(options = {}) {
  const silent = Boolean(options.silent);
  const requestToken = ++workspaceLoadToken;
  const requestedTaskId = currentTaskId.value;
  if (!silent) {
    loading.value = true;
  }
  try {
    const nextPage = await getWorkspaceData(requestedTaskId);
    if (requestToken !== workspaceLoadToken) {
      return;
    }
    if (requestedTaskId && currentTaskId.value && requestedTaskId !== currentTaskId.value) {
      return;
    }
    page.value = nextPage;
  } finally {
    if (!silent && requestToken === workspaceLoadToken) {
      loading.value = false;
    }
  }
}

function selectTask(taskId) {
  const nextTaskId = String(taskId || '').trim();
  if (!nextTaskId || nextTaskId === currentTaskId.value) {
    return;
  }

  activeNode.value = null;
  feedbackForm.value.summary = '';
  feedbackResult.value = '';

  router.replace({
    path: route.path,
    query: buildWorkspaceContextQuery({
      taskId: nextTaskId,
      room: undefined,
      recordId: undefined,
      nodeId: undefined,
      source: undefined,
      itemId: undefined,
      group: undefined,
      originSource: undefined,
      originItemId: undefined,
      originGroup: undefined,
      originTaskId: undefined,
      originRecordId: undefined,
      originRoom: undefined,
      tab: undefined
    })
  });
}

function openTaskDetail() {
  taskDetailVisible.value = true;
}

function closeTaskDetail() {
  taskDetailVisible.value = false;
}

function openNode(node) {
  activeNode.value = normalizeNode(node);
  feedbackForm.value.summary = '';
  feedbackResult.value = '';
  router.replace({
    path: route.path,
    query: buildWorkspaceContextQuery({
      nodeId: activeNode.value.id
    })
  });
}

function closeNode() {
  activeNode.value = null;
  feedbackForm.value.summary = '';
  feedbackResult.value = '';
  router.replace({
    path: route.path,
    query: buildWorkspaceContextQuery({
      nodeId: undefined
    })
  });
}

function setNodeCardRef(nodeId, element) {
  if (!nodeId) {
    return;
  }
  if (element) {
    nodeCardRefs.value[nodeId] = element;
    return;
  }
  delete nodeCardRefs.value[nodeId];
}

async function scrollCurrentNodeIntoView() {
  if (!focusedNode.value?.id) {
    return;
  }
  await nextTick();
  const target = nodeCardRefs.value[focusedNode.value.id];
  if (target && typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth'
    });
  }
}

async function scrollToProgressForm() {
  if (!progressComposerCard.value) {
    return;
  }
  await nextTick();
  progressComposerCard.value.scrollIntoView({
    block: 'start',
    behavior: 'smooth'
  });
}

function openTaskFlowModal(mode) {
  taskFlowMode.value = mode;
  taskFlowError.value = '';
  taskFlowResult.value = '';
  taskFlowForm.value = {
    note: '',
    grade: earlyCompletion.value.grade || 'A'
  };
  taskFlowModalOpen.value = true;
}

function closeTaskFlowModal() {
  taskFlowModalOpen.value = false;
  taskFlowMode.value = '';
  taskFlowError.value = '';
}

function handleProgressFiles(event) {
  progressFiles.value = Array.from(event.target.files || []);
}

async function submitProgressForm() {
  if (!page.value?.summary?.taskId) {
    return;
  }

  submittingProgress.value = true;
  progressResult.value = '';

  let attachmentFiles = [];
  try {
    attachmentFiles = await Promise.all(
      progressFiles.value.map((file) =>
        uploadTaskAttachmentAsset(page.value.summary.taskId, file, {
          scene: 'TASK_PROGRESS',
          source: 'TASK_PROGRESS'
        })
      )
    );
  } catch (error) {
    progressResult.value = error?.requestError || error?.message || '本轮附件上传失败，请稍后再试。';
    submittingProgress.value = false;
    return;
  }

  const result = await submitTaskProgress(page.value.summary.taskId, {
    submitterUserId: page.value.summary.talentUserId || page.value.summary.businessUserId || '',
    stage: progressForm.value.stageName,
    progressText: progressForm.value.progressSummary,
    supportNeeded: progressForm.value.supportNeeded,
    completionPercent: progressForm.value.completion,
    attachmentFiles
  });

  if (isFailedResult(result)) {
    progressResult.value = result?.requestError || result?.nextStep || '本轮进展提交失败，请稍后再试。';
    submittingProgress.value = false;
    return;
  }

  progressResult.value = result?.nextStep || '本轮进展已提交。';
  progressForm.value = {
    stageName: '',
    completion: '',
    progressSummary: '',
    supportNeeded: ''
  };
  progressFiles.value = [];
  await loadPage();
  submittingProgress.value = false;
}

async function submitNodeFeedback() {
  if (!activeNode.value?.id || !page.value?.summary?.taskId) {
    return;
  }

  submittingFeedback.value = true;
  feedbackResult.value = '';

  const result = await submitWorkspaceFeedback(page.value.summary.taskId, {
    nodeId: activeNode.value.id,
    summary: feedbackForm.value.summary
  });

  if (isFailedResult(result)) {
    feedbackResult.value = result?.requestError || result?.nextStep || '企业建议保存失败，请稍后再试。';
    submittingFeedback.value = false;
    return;
  }

  feedbackResult.value = result?.nextStep || '企业建议已记录。';

  if (result?.businessSuggestion) {
    activeNode.value = {
      ...activeNode.value,
      businessSuggestion: {
        summary: result.businessSuggestion.summary || '',
        aiSupplement: result.businessSuggestion.aiSupplement || '',
        updatedAt: result.businessSuggestion.updatedAt || '',
        author: result.businessSuggestion.author || ''
      }
    };
  }

  await loadPage();
  submittingFeedback.value = false;
}

async function submitTaskFlowAction() {
  if (!page.value?.summary?.taskId || !taskFlowMode.value) {
    return;
  }

  submittingTaskFlow.value = true;
  taskFlowError.value = '';

  try {
    let result = null;

    if (taskFlowMode.value.startsWith('early_')) {
      const action = taskFlowMode.value.replace('early_', '');
      result = await submitEarlyCompletion(page.value.summary.taskId, {
        action,
        note: taskFlowForm.value.note,
        grade: taskFlowForm.value.grade
      });
    } else if (taskFlowMode.value.startsWith('cancel_')) {
      const action = taskFlowMode.value.replace('cancel_', '');
      result = await submitTaskCancellation(page.value.summary.taskId, {
        action,
        reason: taskFlowForm.value.note
      });
    }

    if (result?.actionBlocked) {
      taskFlowError.value = result.actionMessage || '当前动作暂时不可执行。';
      return;
    }

    if (isFailedResult(result)) {
      taskFlowError.value = result?.requestError || result?.nextStep || '任务动作提交失败，请稍后再试。';
      return;
    }

    taskFlowResult.value = result?.nextStep || '任务状态已更新。';
    closeTaskFlowModal();
    await loadPage();
  } finally {
    submittingTaskFlow.value = false;
  }
}

watch(
  () => [route.query.taskId, route.meta?.audience],
  async () => {
    await loadPage();
  }
);

watch(
  () => [currentNodeId.value, normalizedNodes.value],
  async () => {
    if (!currentNodeId.value) {
      activeNode.value = null;
      return;
    }
    if (!currentNode.value) {
      activeNode.value = null;
      return;
    }
    activeNode.value = currentNode.value;
    await scrollCurrentNodeIntoView();
  },
  { immediate: true }
);

onMounted(async () => {
  await loadPage();
  stopBusinessLiveSync = startBusinessLiveSync({
    refresh: () => loadPage({ silent: true }),
    acceptsEvent(event) {
      const taskId = String(currentTaskId.value || '').trim();
      return !taskId || !event?.taskId || event.taskId === taskId;
    },
    shouldPause() {
      return submittingProgress.value || submittingFeedback.value || submittingTaskFlow.value;
    },
    onStatusChange: handleLiveSyncStatus,
    onSyncError: handleLiveSyncError
  });
});

onBeforeUnmount(() => {
  stopBusinessLiveSync?.();
  stopBusinessLiveSync = null;
});
</script>

<style scoped>
.workspace-workbench {
  min-width: 0;
}

.workspace-action-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.workspace-summary-item {
  display: grid;
  gap: 0.25rem;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--glass-bg, rgba(255, 255, 255, 0.7)) 72%, rgba(23, 34, 57, 0.06));
  border: 1px solid color-mix(in srgb, var(--glass-border, rgba(255, 255, 255, 0.36)) 82%, rgba(23, 34, 57, 0.08));
}

.workspace-summary-label {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted, rgba(80, 91, 112, 0.82));
}

.workspace-summary-item strong {
  font-size: 0.98rem;
  line-height: 1.35;
  color: var(--text-strong, #14213d);
}

.workspace-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.8fr);
  gap: 1rem;
  align-items: start;
}

.workspace-main-primary,
.workspace-main-secondary {
  min-width: 0;
}

.workspace-main-secondary {
  position: sticky;
  top: 1.25rem;
  align-self: start;
}

.workspace-main-card {
  min-width: 0;
}

.workspace-node-timeline {
  display: grid;
  gap: 0.85rem;
}

.workspace-node-card {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 0.9rem;
  align-items: start;
  width: 100%;
  text-align: left;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.workspace-node-card.is-current {
  transform: translateX(2px);
}

.workspace-node-card.is-current .workspace-node-index {
  color: var(--text-strong, #14213d);
}

.workspace-node-card.is-current .workspace-node-line {
  background: linear-gradient(180deg, rgba(76, 201, 255, 0.92), rgba(118, 102, 255, 0.72));
}

.workspace-node-card.is-current .workspace-node-main {
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, rgba(76, 201, 255, 0.28) 82%, rgba(23, 34, 57, 0.08));
  background: color-mix(in srgb, rgba(76, 201, 255, 0.08) 72%, rgba(255, 255, 255, 0.92));
  box-shadow: 0 18px 32px rgba(12, 25, 47, 0.08);
}

.workspace-node-rail {
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  padding-top: 0.15rem;
}

.workspace-node-index {
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: var(--muted, rgba(80, 91, 112, 0.82));
}

.workspace-node-line {
  width: 2px;
  min-height: 100%;
  background: linear-gradient(180deg, rgba(88, 116, 255, 0.45), rgba(88, 116, 255, 0.05));
  border-radius: 999px;
}

.workspace-node-main {
  min-width: 0;
  display: grid;
  gap: 0.65rem;
}

.workspace-node-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.workspace-node-head h4,
.workspace-node-head p {
  margin: 0;
}

.workspace-node-head p {
  margin-top: 0.25rem;
  color: var(--muted, rgba(80, 91, 112, 0.82));
}

.workspace-node-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 0.8rem;
  color: var(--muted, rgba(80, 91, 112, 0.82));
  font-size: 0.86rem;
}

.workspace-node-deliverable {
  margin: 0;
}

.workspace-record-list {
  display: grid;
  gap: 0.75rem;
}

.workspace-record-card {
  padding: 0.95rem 1rem;
}

.workspace-record-card h4,
.workspace-record-card p {
  margin: 0;
}

.workspace-record-card .panel-header {
  align-items: flex-start;
}

.workspace-record-card .panel-header p {
  margin-top: 0.2rem;
}

@media (max-width: 1180px) {
  .workspace-action-summary,
  .workspace-main-grid {
    grid-template-columns: 1fr;
  }

  .workspace-main-secondary {
    position: static;
    top: auto;
  }
}

@media (max-width: 860px) {
  .workspace-node-card {
    grid-template-columns: 1fr;
  }

  .workspace-node-rail {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0;
  }

  .workspace-node-line {
    width: 100%;
    min-height: 2px;
    height: 2px;
  }

  .workspace-node-head {
    flex-direction: column;
  }
}
</style>
