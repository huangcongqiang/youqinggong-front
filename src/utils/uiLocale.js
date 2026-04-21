const TRANSLATION_PAIRS = [
  ['YouQingGong', '有轻功'],
  ['AI Talent Collaboration Market', 'AI 人才协作市场'],
  ['Home', '首页'],
  ['Log in', '登录'],
  ['Dashboard', '工作台'],
  ['Sign in', '登录'],
  ['Sign up', '注册'],
  ['Log out', '退出登录'],
  ['Sign out', '退出登录'],
  ['Client log in', '企业登录'],
  ['Freelancer log in', '人才登录'],
  ['Client signup', '企业注册'],
  ['Freelancer signup', '人才注册'],
  ['Switch account', '切换账号'],
  ['Current page', '当前页面'],
  ['Default dashboard return', '默认返回工作台'],
  ['Post-signup status', '注册后状态'],
  ['Signup failed', '注册失败'],
  ['Create account', '创建账号'],
  ['Email verification', '邮箱验证'],
  ['Phone verification', '手机验证'],
  ['Billing status', '账单状态'],
  ['Email on file', '已提供邮箱'],
  ['No email on file yet', '还没有邮箱信息'],
  ['Phone on file', '手机号已存在'],
  ['No phone number on file yet', '还没有手机号'],
  ['This account does not have an email on file yet.', '当前账号还没有可用邮箱字段。'],
  ['This account does not have a phone number on file yet.', '当前账号还没有可用手机号字段。'],
  ['Complete setup', '完成设置'],
  ['Billing still needs review', '账单状态待确认'],
  ['View billing status', '查看账单状态'],
  ['Open billing to review the current status and available next steps.', '打开账单页查看当前状态和可执行的下一步。'],
  ['Billing is blocked', '当前账单受限'],
  ['Billing is ready', '账单状态已就绪'],
  ['Billing is ready. Return to the workspace to keep moving.', '当前账号已经具备继续处理账单的条件，可回到工作台继续推进。'],
  ['Billing is still blocked. Return to setup to continue.', '当前账单仍受限制，请先回到入驻页继续处理。'],
  ['View billing status', '查看账单状态'],
  ['Back to workspace', '回到工作台继续'],
  ['Return to setup to continue', '回到入驻页继续'],
  ['This account is ready to continue.', '当前账号可以继续进入工作区。'],
  ['The required checks are complete, so you can continue to the next page.', '激活前置条件已满足，当前可以继续进入对应页面。'],
  ['This account still has setup blockers.', '当前账号还有前置条件没有满足。'],
  ['Core account details are ready, but one entry still needs review.', '当前账号基础信息已就绪，但还有待确认的入口。'],
  ['Sign in to review verification, billing, and restriction status.', '先登录，再看认证、账单和限制状态。'],
  ['You are still at the entry step. Sign in to reveal the account checks for the selected role.', '当前还是入口态，登录后会按企业 / 人才端展示具体检查结果。'],
  ['Client dashboard', '企业工作台'],
  ['Freelancer dashboard', '人才工作台'],
  ['Signed-in client dashboard', '已登录企业工作台'],
  ['Signed-in freelancer dashboard', '已登录人才工作台'],
  ['Dashboard preview', '工作台预览'],
  ['Dashboard access', '工作台入口'],
  ['Public site', '公开站点'],
  ['Contract', '合同'],
  ['Acceptance', '验收'],
  ['Review', '审核'],
  ['History', '历史'],
  ['Settlement', '结算'],
  ['Assistant', '助手'],
  ['Messages', '消息'],
  ['Message', '消息'],
  ['Notifications', '通知'],
  ['Contracts', '合同'],
  ['Reports', '报表'],
  ['Billing', '账单'],
  ['Search talent', '搜索人才'],
  ['Talent profile', '人才档案'],
  ['Job details', '工作详情'],
  ['Submit application', '提交申请'],
  ['Profile', '个人资料'],
  ['History & earnings', '历史与收入'],
  ['Approval Center', '审批中心'],
  ['Notification Center', '通知中心'],
  ['Enterprise onboarding', '企业入驻'],
  ['Talent onboarding', '人才入驻'],
  ['Publish job', '发布工作'],
  ['Settlement handoff', '结算交接'],
  ['Acceptance action', '验收动作'],
  ['Acceptance note', '验收备注'],
  ['Acceptance result', '验收结果'],
  ['Acceptance history', '验收历史'],
  ['Acceptance log and feedback history', '验收记录与反馈历史'],
  ['Acceptance snapshot', '验收概览'],
  ['Record note', '记录备注'],
  ['Latest update', '最新更新'],
  ['Assistant recap', '助手回顾'],
  ['Review feedback', '审核反馈'],
  ['Claim', '请款'],
  ['Invoice', '发票'],
  ['Reconciliation', '对账'],
  ['Payout', '结算'],
  ['Settlement result', '结算结果'],
  ['Settlement can be executed after reconciliation is complete.', '对账完成后即可执行结算。'],
  ['Dispute handling', '争议处理'],
  ['Claim request', '请款申请'],
  ['Invoice request', '开票申请'],
  ['Payout execution', '付款执行'],
  ['Dispute and risk', '争议与风险'],
  ['Amount', '金额'],
  ['Submitted', '提交于'],
  ['Ratio', '比例'],
  ['Type', '类型'],
  ['Updated', '更新于'],
  ['Paid', '支付于'],
  ['Opened', '发起于'],
  ['Ticket', '工单'],
  ['Current dispute status:', '当前争议状态：'],
  ['You can submit a claim after review is complete.', '审核完成后可以发起请款。'],
  ['You can submit an invoice after the claim is approved.', '请款通过后可以提交发票。'],
  ['Reconciliation opens after the invoice is submitted.', '提交发票后即可进入对账。'],
  ['Payout becomes available after reconciliation is complete.', '对账完成后即可进入付款。'],
  ['If reconciliation is disputed, the platform opens a dispute and risk ticket.', '如果对账出现争议，平台会开启争议与风险工单。'],
  ['Continue after review', '审核后继续'],
  ['Continue after acceptance', '验收后继续'],
  ['Continue in settlement after acceptance', '验收后在结算中继续'],
  ['Settlement opens after acceptance is complete', '验收完成后即可打开结算'],
  ['Continue in settlement after review', '审核后在结算中继续'],
  ['Open settlement', '打开结算'],
  ['Open contract history', '打开合同历史'],
  ['Open the application page when you are ready to apply.', '准备好申请时，请打开申请页面。'],
  ['This application already became a contract. Continue in the contract page.', '这份申请已经转为合同，请前往合同页面继续。'],
  ['Application activity', '申请动态'],
  ['Back to results', '返回结果'],
  ['Back to messages', '返回消息'],
  ['Back to overview', '返回概览'],
  ['Back to contract', '返回合同'],
  ['Back to history detail', '返回历史详情'],
  ['Back to history', '返回历史'],
  ['Back to review', '返回审核页'],
  ['Back to review & payouts', '返回审核'],
  ['Back to notifications', '返回通知中心'],
  ['Back to approvals', '返回审批中心'],
  ['Back to client dashboard', '返回企业工作台'],
  ['Back to freelancer dashboard', '返回人才工作台'],
  ['View job', '查看工作'],
  ['Open application', '打开申请'],
  ['Open record', '打开记录'],
  ['Open handoff', '打开交接'],
  ['Open contract', '打开合同'],
  ['Open workspace', '打开协作空间'],
  ['Resolve the highest-priority decision first, then return to hiring, contracts, and messages.', '先处理最需要你回复的决定，再回到招聘、合同和消息。'],
  ['Review applications, invites, and replies before opening new work.', '先处理申请、邀约和回复，再开启新的工作。'],
  ['Keep current contracts moving before you open new work.', '先把当前合同推进下去，再开启新的工作。'],
  ['Post the next job, review hiring signals, and keep current contracts moving from one place.', '在一个地方发布下一份工作、查看招聘信号，并持续推进当前合同。'],
  ['Settlement', '结算'],
  ['Quick fit', '快速匹配'],
  ['Next step', '下一步'],
  ['Application', '申请'],
  ['Application summary', '申请摘要'],
  ['Readiness', '完成度'],
  ['Current draft', '当前草稿'],
  ['Ready to submit', '可以提交'],
  ['Keep submission readiness in view', '随时查看提交准备度'],
  ['Application checklist', '申请清单'],
  ['Key job details', '关键工作信息'],
  ['Finish your application', '完成申请'],
  ['Rate or bid', '报价或费率'],
  ['Work samples', '作品样本'],
  ['Application unavailable', '申请暂不可用'],
  ['Loading application', '正在加载申请'],
  ['Application failed to load', '申请加载失败'],
  ['Search jobs', '搜索工作'],
  ['Search', '搜索'],
  ['Global search', '全局搜索'],
  ['Search results', '搜索结果'],
  ['Search talent', '搜索人才'],
  ['Find work', '找工作'],
  ['Current application status', '当前申请状态'],
  ['Application status', '申请状态'],
  ['Current steps', '当前步骤'],
  ['Keep settlement moving', '推进结算流程'],
  ['Settlement summary', '结算摘要'],
  ['Settlement timeline', '结算时间线'],
  ['Settlement activity', '结算动态'],
  ['Settlement focus', '结算焦点'],
  ['Settlement update', '结算更新'],
  ['Settlement execution', '结算执行'],
  ['Contract stream', '合同动态流'],
  ['Contract history', '合同历史'],
  ['Browse contract history by status and keywords', '按状态和关键词浏览合同历史'],
  ['Latest matching record', '最新匹配记录'],
  ['Open settlement to submit claim', '打开结算以提交索赔'],
  ['Open settlement to execute payout', '打开结算以执行付款'],
  ['Settlement becomes available after reconciliation is complete.', '对账完成后即可进入结算。'],
  ['Settlement activity will appear here once finance steps begin.', '财务流程开始后，结算动态会显示在这里。'],
  ['Settlement is ready when you want to continue', '需要继续时可进入结算'],
  ['Continue in settlement', '在结算中继续'],
  ['Continue the current settlement step', '继续当前结算步骤'],
  ['Continue settlement steps once acceptance is complete.', '验收完成后继续处理结算步骤。'],
  ['Keep settlement steps moving here after acceptance is complete.', '在验收完成后，继续在这里推进结算步骤。'],
  ['Acceptance stays on the acceptance page. Settlement is where claims, invoices, reconciliation, settlement, and disputes continue.', '验收留在验收页中进行。请款、开票、对账、结算和争议会在结算页继续。'],
  ['History keeps the current stage here. Open settlement to continue the matching claim, invoice, reconciliation, settlement, or dispute step.', '历史会把当前阶段保留在这里。打开结算以继续对应的请款、开票、对账、结算或争议步骤。'],
  ['Continue in settlement so review can stay focused here.', '在结算中继续，让审核页面保持聚焦。'],
  ['Claims, invoices, reconciliation, disputes, and settlement actions now continue in settlement, not in review.', '请款、开票、对账、争议和结算动作现在都在结算中继续，不再放在审核里。'],
  ['Execute settlement', '执行结算'],
  ['Realtime messaging service is not ready', '实时消息服务尚未就绪'],
  ['Realtime messaging', '实时消息'],
  ['Realtime messaging is not configured in this environment.', '当前环境还没有接入实时消息配置。'],
  ['Use synced history until the live messaging configuration is ready.', '在实时消息配置完成前，先使用已同步的历史消息。'],
  ['The settlement record is missing, so execution cannot continue.', '当前缺少结算记录，暂时无法继续执行。'],
  ['Only the client can execute settlement from this screen.', '只有企业可以在这个页面执行结算。'],
  ['Execute settlement for this contract.', '为这份合同执行结算。'],
  ['Settlement submitted', '结算已提交'],
  ['The settlement execution was submitted.', '结算执行已提交。'],
  ['The settlement record is missing, so a failed settlement cannot be recorded.', '当前缺少结算记录，暂时无法记录失败结算。'],
  ['Only the client can mark settlement as failed from this screen.', '只有企业可以在这个页面标记结算失败。'],
  ['The settlement failed and needs follow-up.', '当前结算失败，需要继续跟进。'],
  ['Failed settlement submitted', '失败结算已提交'],
  ['The failed settlement status was submitted.', '失败结算状态已提交。'],
  ['Overview', '概览'],
  ['Action needed', '待处理'],
  ['Action needed now', '当前待处理'],
  ['Action queue', '待处理队列'],
  ['Current queue', '当前队列'],
  ['Current item', '当前项目'],
  ['Available actions', '可执行操作'],
  ['Approval center', '审批中心'],
  ['Approval queue', '审批队列'],
  ['Action history', '操作记录'],
  ['Source & context', '来源与上下文'],
  ['No action needed right now', '当前没有待处理事项'],
  ['All', '全部'],
  ['Applications & invites', '申请与邀请'],
  ['To confirm', '待确认'],
  ['Needs changes', '待修改'],
  ['Hiring', '招聘'],
  ['Contract overview unavailable', '合同概览暂不可用'],
  ['Other contracts', '其他合同'],
  ['Contract history & filters', '合同历史与筛选'],
  ['Browse action types', '浏览操作类型'],
  ['Spending snapshot', '支出快照'],
  ['Keep applications, invites, and offers moving', '持续推进申请、邀请与邀约'],
  ['Keep applications, invites, and replies moving', '持续推进申请、邀请与回复'],
  ['Scan applications, invites, and replies', '浏览申请、邀请与回复'],
  ['Active contracts', '进行中的合同'],
  ['Earnings', '收入'],
  ['Next up', '接下来'],
  ['Open messages', '打开消息'],
  ['Open assistant', '打开助手'],
  ['Open profile', '打开档案'],
  ['Invite to job', '邀请加入工作'],
  ['Client operations', '客户运营'],
  ['Page status', '页面状态'],
  ['View mode', '查看模式'],
  ['This operations page could not sync right now', '运营页面暂时无法同步'],
  ['Keep spend, transactions, and filtered views in one place.', '在同一处查看支出、交易和筛选视图。'],
  ['Execution, communication, and review continue in the contract and review pages. This page focuses on contract objects, transaction states, and billing summaries.', '执行、沟通和审核继续在合同页与审核页中进行。此页聚焦合同对象、交易状态和账单摘要。'],
  ['This page gathers contract objects, contract state, and review routes so you can handle the most important work first.', '此页汇总合同对象、合同状态和审核入口，方便你优先处理最重要的事项。'],
  ['Stay on this page', '留在当前页'],
  ['Pending sync', '待同步'],
  ['Pending acceptance', '待验收'],
  ['Pending rating', '待评分'],
  ['Pending acceptance', '待验收'],
  ['Pending approval', '待审批'],
  ['Claim pending', '待请款'],
  ['Invoice pending', '待开票'],
  ['Reconciliation pending', '待对账'],
  ['Pending settlement', '待结算'],
  ['Not started', '未发起'],
  ['Not started', '待开始'],
  ['In progress', '进行中'],
  ['In progress', '执行中'],
  ['Completed', '已完成'],
  ['Completed', '完成'],
  ['Settled', '已结算'],
  ['Approved', '已通过'],
  ['Rejected', '已驳回'],
  ['Paid', '已付款'],
  ['Processing', '处理中'],
  ['Dispute in review', '争议处理中'],
  ['Needs talent confirmation', '待人才确认'],
  ['Needs client revision', '待企业修改'],
  ['Revised', '已修改'],
  ['Confirmed', '已确认'],
  ['Accepted', '已验收'],
  ['A draft was loaded into this acceptance step. Check it before you submit.', '已把草稿带入当前验收步骤，提交前请先检查。'],
  ['The acceptance result has been updated.', '验收结果已更新。'],
  ['Settlement steps will appear here after acceptance, rating, and mutual feedback are complete.', '验收、评分和双方反馈完成后，结算步骤会显示在这里。'],
  ['Track acceptance decisions, ratings, and feedback history together.', '在这里统一查看验收决定、评分和反馈历史。'],
  ['No acceptance history yet', '还没有验收历史'],
  ['Key milestones will appear here after acceptance, rating, and feedback are complete.', '验收、评分和反馈完成后，关键节点会显示在这里。'],
  ['Keep acceptance, history, and settlement at a glance', '让验收、历史和结算一目了然'],
  ['Review the current acceptance result, rating, settlement status, and feedback.', '查看当前验收结果、评分、结算状态和反馈。'],
  ['Acceptance is complete and is waiting on the client rating', '验收已完成，正等待企业评分'],
  ['Acceptance is confirmed and is waiting on rating or settlement steps', '验收已确认，正等待评分或结算步骤'],
  ['The client has confirmed acceptance and the final rating is still pending', '企业已确认验收，最终评分仍待完成'],
  ['The client needs to confirm acceptance first', '需要企业先确认验收'],
  ['Waiting for the client to confirm acceptance', '正等待企业确认验收'],
  ['The current acceptance result will appear here once the contract context syncs.', '合同上下文同步后，当前验收结果会显示在这里。'],
  ['Confirm whether this delivery should be accepted', '确认这次交付是否应被验收'],
  ['No additional action is needed right now. Review the current acceptance result here.', '当前没有额外动作，先在这里查看当前验收结果。'],
  ['Confirm the acceptance result before settlement actions open', '先确认验收结果，再打开结算动作'],
  ['Finish the current acceptance confirmation first. Settlement actions appear after the delivery is accepted and the contract moves into rating or settlement steps.', '先完成当前验收确认。交付被验收后，合同才会继续进入评分或结算步骤。'],
  ['Finish the remaining collaboration feedback first. Settlement actions stay downstream so the current acceptance decision remains the only primary task on this page.', '先完成剩余协作反馈。结算动作会继续留在下游，让当前页只聚焦验收决定。'],
  ['Your current acceptance task may already be done, but settlement stays closed until both sides finish the feedback stage.', '你当前的验收任务也许已经完成，但结算仍会保持关闭，直到双方完成反馈阶段。'],
  ['Settlement opens after acceptance is complete.', '验收完成后即可打开结算。'],
  ['No settlement activity yet', '暂无结算动态'],
  ['How it works', '如何运作'],
  ['One entry, one hiring workflow', '一个入口，一条招聘主线'],
  ['Keep the brief, talent, and delivery in one line of work.', '把需求、人才和交付放进同一条工作主线。'],
  ['Job posting, applications, messages, delivery, review, settlement, and history all start from the same front door.', '发布工作、处理申请、消息协作、交付、审核、结算和历史都从同一个入口开始。'],
  ['Define the work, hire the right person, then move the contract forward.', '先定义工作，再找到合适的人，然后继续推进合同。'],
  ['Clarify the scope and the role first, then move into the workflow.', '先明确范围和角色，再进入协作流程。'],
  ['Choose your entry', '选择你的入口'],
  ['Pick your role first, then move into the right starting point.', '先选角色，再进入正确的起点。'],
  ['Examples', '案例'],
  ['Contact', '联系'],
  ['Case snapshots', '案例快照'],
  ['See how real engagements land.', '看看真实合作是怎样落地的。'],
  ['Clients focus on delivery. Freelancers focus on collaboration and earnings.', '企业更关注交付，人才更关注协作和收入。'],
  ['How clients post faster, hire better, and move delivery forward.', '看看企业如何更快发帖、更稳招人，并把交付继续推进。'],
  ['How freelancers build proof, earnings, and long-term work.', '看看人才如何沉淀证明、收入和长期合作。'],
  ['Previous', '上一个'],
  ['Next', '下一个'],
  ['Client', '企业'],
  ['Freelancer', '人才'],
  ['What happens next', '接下来会发生什么'],
  ['Get started', '开始使用'],
  ['Open dashboard', '打开工作台'],
  ['Back to home', '返回首页'],
  ['Workspace navigation', '工作台导航'],
  ['Open next step', '打开下一步'],
  ['Keep moving', '继续推进'],
  ['Work marketplace', '协作市场'],
  ['Search jobs, clients, or skills', '搜索工作、客户或技能'],
  ['Search talent, skills, or jobs', '搜索人才、技能或工作'],
  ['Setup', '设置'],
  ['Complete client setup', '完成企业设置'],
  ['Complete freelancer setup', '完成人才设置'],
  ['Finish verification and billing access before you start hiring.', '在开始招聘前完成认证与账单权限设置。'],
  ['Finish profile and verification before you start applying.', '在开始申请前完成档案和认证。'],
  ['Write the job post', '撰写工作发布'],
  ['Write the job post before you move on.', '继续前请先完成工作发布。'],
  ['Set the title, scope, budget, and screening questions in one draft.', '在一份草稿中设置标题、范围、预算和筛选问题。'],
  ['Set scope, budget, and screening questions before you post.', '发布前先设置范围、预算和筛选问题。'],
  ['Review the talent profile', '查看人才档案'],
  ['Check fit, proof, and the next step before you invite.', '在发出邀请前检查匹配度、证明材料和下一步。'],
  ['Browse talent and decide fast', '快速浏览人才并做出判断'],
  ['Compare fit, trust signals, and next steps in one view.', '在同一视图中比较匹配度、信任信号和下一步。'],
  ['Resolve pending approvals', '处理待审批事项'],
  ['Work through shortlist, review, and contract follow-ups in priority order.', '按优先级处理候选名单、审核和合同后续事项。'],
  ['Review high-priority changes and jump back into the right page.', '查看高优先级变化并返回正确页面。'],
  ['Messages with context', '带上下文的消息'],
  ['Keep conversation and contract context together.', '让对话和合同上下文保持一致。'],
  ['Active contract', '进行中的合同'],
  ['Track progress, files, review, history, and assistant in one contract view.', '在同一合同视图中跟踪进度、文件、审核、历史和助手。'],
  ['Review the contract', '审核合同'],
  ['Handle review, rating, and settlement handoff in one place.', '在同一处处理审核、评分和结算交接。'],
  ['Continue settlement steps', '继续结算步骤'],
  ['Continue settlement', '继续结算'],
  ['Latest sync', '最新同步'],
  ['View all contracts', '查看全部合同'],
  ['View billing details', '查看账单详情'],
  ['Hiring inbox', '招聘收件箱'],
  ['Hiring summary', '招聘摘要'],
  ['Recommended talent', '推荐人才'],
  ['Spend summary', '支出摘要'],
  ['Suggested profiles worth reviewing next.', '下一批值得优先查看的推荐人才。'],
  ['Recent spend totals and billing snapshots.', '最近的支出汇总和账单快照。'],
  ['No recommendations yet', '暂时还没有推荐人才'],
  ['Recommended candidates from search and current hiring signals will surface here.', '搜索结果和当前招聘信号里的推荐候选人会显示在这里。'],
  ['Open applications, invitations, and reply signals waiting for your reply.', '打开等待你处理的申请、邀请和回复信号。'],
  ['Keep claims, invoices, reconciliation, and settlement steps moving here.', '在这里持续推进请款、开票、对账和结算步骤。'],
  ['Review the contract stream, files, and settlement summary.', '查看合同动态流、文件和结算摘要。'],
  ['Browse contracts, outcomes, and settlement summaries.', '浏览合同、结果和结算摘要。'],
  ['Review contract objects and open the linked contract when you need more detail.', '查看合同对象，并在需要更多细节时打开关联合同。'],
  ['Review transaction history and contract outcomes in one place.', '在同一处查看交易历史和合同结果。'],
  ['Review readiness, limits, and billing context in one place.', '在同一处查看准备情况、限制和账单上下文。'],
  ['Assistant in context', '上下文助手'],
  ['Draft, search, and summarize while you stay in the current workflow.', '在当前流程中完成起草、搜索和总结。'],
  ['Draft, review, and summarize while you stay in the current workflow.', '在当前流程中完成起草、审核和总结。'],
  ['Open work', '打开工作'],
  ['Focus on jobs, contracts, messages, and spend.', '聚焦工作、合同、消息和支出。'],
  ['Finish your application', '完成申请'],
  ['Write the application, answer screening questions, and submit when ready.', '撰写申请、回答筛选问题，并在准备好时提交。'],
  ['Review the job post', '查看工作发布'],
  ['Read the brief, trust signals, and next step before you apply.', '在申请前阅读简介、信任信号和下一步。'],
  ['Find jobs', '查找工作'],
  ['Browse jobs, compare fit, and decide.', '浏览工作、比较匹配度并做出决定。'],
  ['Review your profile', '查看你的档案'],
  ['Check the profile, proof, and signals clients will see.', '查看企业会看到的档案、证明材料和信号。'],
  ['History and earnings', '历史与收入'],
  ['Review contracts, feedback, earnings, and settlement summaries.', '查看合同、反馈、收入和结算摘要。'],
  ['Focus on jobs, messages, and earnings.', '聚焦工作、消息和收入。'],
  ['Complete verification before using the full dashboard.', '使用完整工作台前请先完成认证。'],
  ['Finish setup', '完成设置'],
  ['Jobs, messages, reports', '工作、消息与报表'],
  ['Dashboard, jobs, earnings', '工作台、工作与收入'],
  ['Post a job', '发布工作'],
  ['Reports', '报表'],
  ['Messages', '消息'],
  ['Role entry', '角色入口'],
  ['Case snapshots', '案例快照'],
  ['Current state', '当前状态'],
  ['Redirect context', '跳转上下文'],
  ['3-step setup', '三步设置'],
  ['Create your account', '创建你的账号'],
  ['Sign in to continue', '登录后继续'],
  ['Choose your role', '选择你的角色'],
  ['官网首页', 'Home'],
  ['账号登录', 'Sign in'],
  ['账号注册', 'Create account'],
  ['企业入驻', 'Enterprise onboarding'],
  ['发布工作', 'Publish job'],
  ['搜索人才', 'Search talent'],
  ['审批中心', 'Approval Center'],
  ['通知中心', 'Notification Center'],
  ['消息', 'Messages'],
  ['找工作', 'Search jobs'],
  ['人才入驻', 'Talent onboarding'],
  ['企业工作台', 'Client dashboard'],
  ['人才工作台', 'Freelancer dashboard'],
  ['待同步', 'Pending sync'],
  ['待评分', 'Pending rating'],
  ['待评级', 'Pending rating'],
  ['当前还没有同步真实档期', 'Live availability has not synced yet'],
  ['本地草稿', 'Local draft'],
  ['继续编辑', 'Continue editing'],
  ['Preferred talent', '优先人才'],
  ['Invite after publish', '发布后邀请'],
  ['Local draft on this device', '当前设备上的本地草稿'],
  ['Review and settlement snapshot', '审核与结算快照'],
  ['History browser', '历史浏览'],
  ['AI system message', 'AI 系统消息'],
  ['Please try again later.', '请稍后再试。'],
  ['Please try again later', '请稍后再试'],
  ['系统消息', 'System message'],
  ['[暂不支持的消息内容]', '[Unsupported message content]'],
  ['实时消息暂时发送失败，当前仍可查看已同步的历史消息。', 'Realtime messaging is temporarily unavailable. Synced history is still available.'],
  ['失败原因：请检查实时消息群组与账号配置。', 'Reason: check the realtime messaging room and account configuration.'],
  ['当前暂时无法继续发送实时消息。', 'Realtime messaging is temporarily unavailable right now.'],
  ['实时消息暂时不可用，请稍后再试。', 'Realtime messaging is temporarily unavailable. Please try again later.'],
  ['实时消息连接失败，当前仅展示已同步的历史消息。', 'Realtime messaging could not connect. Only synced history is available right now.'],
  ['失败原因：请检查用户签名、群组 ID 和实时消息配置。', 'Reason: check the user signature, room ID, and realtime messaging configuration.'],
  ['Service is currently unavailable.', '当前服务不可用。'],
  ['Service is currently unavailable', '当前服务不可用'],
  ['Unable to continue right now', '当前暂时无法继续'],
  ['Unable to submit right now', '当前暂时无法提交'],
  ['Unable to sync right now', '当前暂时无法同步'],
  ['Unable to load right now', '当前暂时无法读取'],
  ['Unable to create right now', '当前暂时无法创建'],
  ['Unable to open right now', '当前暂时无法打开'],
  ['Unable to process right now', '当前暂时无法处理'],
  ['Unable to confirm right now', '当前暂时无法确认'],
  ['Unable to review right now', '当前暂时无法审核'],
  ['Unable to approve right now', '当前暂时无法审批'],
  ['Unable to publish right now', '当前暂时无法发布'],
  ['Unable to save right now', '当前暂时无法保存'],
  ['Unable to download right now', '当前暂时无法下载'],
  ['Unable to start collaboration right now', '当前暂时无法启动合作'],
  ['Unable to submit claim right now', '当前暂时无法发起请款'],
  ['Unable to submit invoice right now', '当前暂时无法提交开票'],
  ['Unable to process reconciliation right now', '当前暂时无法处理对账'],
  ['Unable to execute settlement right now', '当前暂时无法执行结算'],
  ['Unable to submit progress right now', '当前暂时无法提交进度'],
  ['Unable to submit acceptance right now', '当前暂时无法提交验收'],
  ['Unable to submit rating right now', '当前暂时无法提交评分'],
  ['Unable to build a chat room right now', '当前暂时无法建立聊天房间'],
  ['Please choose a task or contact before opening chat.', '请先选择任务或明确沟通对象，再进入聊天。'],
]

const ZH_LOOKUP = new Map()
const EN_LOOKUP = new Map()

for (const [left, right] of TRANSLATION_PAIRS) {
  if (!ZH_LOOKUP.has(left)) ZH_LOOKUP.set(left, right)
  if (!EN_LOOKUP.has(right)) EN_LOOKUP.set(right, left)
}

const ATTRIBUTE_NAMES = ['placeholder', 'title', 'aria-label']
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE'])
const ACTION_NOUNS = {
  claim: { zh: '索赔', en: 'claim' },
  invoice: { zh: '发票', en: 'invoice' },
  reconciliation: { zh: '对账', en: 'reconciliation' },
  payout: { zh: '付款', en: 'payout' },
  dispute: { zh: '争议', en: 'dispute' },
  '索赔': { zh: '索赔', en: 'claim' },
  '发票': { zh: '发票', en: 'invoice' },
  '对账': { zh: '对账', en: 'reconciliation' },
  '付款': { zh: '付款', en: 'payout' },
  '争议': { zh: '争议', en: 'dispute' },
}

function readNavigatorLocale(navigatorLike = typeof navigator !== 'undefined' ? navigator : null) {
  if (!navigatorLike) return 'zh-CN'
  return navigatorLike.languages?.find(Boolean) || navigatorLike.language || 'zh-CN'
}

function readDocumentLocale(documentLike = typeof document !== 'undefined' ? document : null) {
  if (!documentLike?.documentElement) return ''
  return (
    documentLike.documentElement.getAttribute?.('data-ui-locale')
    || documentLike.documentElement.lang
    || ''
  )
}

export function readPreferredUiLocale({
  documentLike = typeof document !== 'undefined' ? document : null,
  navigatorLike = typeof navigator !== 'undefined' ? navigator : null,
} = {}) {
  return normalizeUiLocale(readDocumentLocale(documentLike) || readNavigatorLocale(navigatorLike))
}

export function normalizeUiLocale(raw = '') {
  return String(raw || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

let currentUiLocale = readPreferredUiLocale()
let translateQueued = false
let translating = false

function nounLabel(value, locale) {
  const item = ACTION_NOUNS[String(value || '').trim()]
  if (!item) return String(value || '').trim()
  return locale === 'zh' ? item.zh : item.en
}

function translatePattern(text, locale) {
  let match = text.match(/^(\d+)\s*\/\s*(\d+) questions answered$/i)
  if (match) {
    return locale === 'zh' ? `${match[1]} / ${match[2]} 个问题已回答` : `${match[1]} / ${match[2]} questions answered`
  }
  match = text.match(/^(\d+)\s*\/\s*(\d+) 个问题已回答$/)
  if (match) {
    return locale === 'zh' ? `${match[1]} / ${match[2]} 个问题已回答` : `${match[1]} / ${match[2]} questions answered`
  }
  match = text.match(/^(\d+)% complete$/i)
  if (match) {
    return locale === 'zh' ? `已完成 ${match[1]}%` : `${match[1]}% complete`
  }
  match = text.match(/^已完成\s*(\d+)%$/)
  if (match) {
    return locale === 'zh' ? `已完成 ${match[1]}%` : `${match[1]}% complete`
  }
  match = text.match(/^Open settlement for (claim|invoice|reconciliation|payout|dispute)$/i)
  if (match) {
    return locale === 'zh' ? `打开结算以处理${nounLabel(match[1], 'zh')}` : `Open settlement for ${nounLabel(match[1], 'en')}`
  }
  match = text.match(/^打开结算以处理(索赔|发票|对账|付款|争议)$/)
  if (match) {
    return locale === 'zh' ? `打开结算以处理${nounLabel(match[1], 'zh')}` : `Open settlement for ${nounLabel(match[1], 'en')}`
  }
  match = text.match(/^Continue (claim|invoice|reconciliation|payout|dispute) in settlement$/i)
  if (match) {
    return locale === 'zh' ? `在结算中继续处理${nounLabel(match[1], 'zh')}` : `Continue ${nounLabel(match[1], 'en')} in settlement`
  }
  match = text.match(/^在结算中继续处理(索赔|发票|对账|付款|争议)$/)
  if (match) {
    return locale === 'zh' ? `在结算中继续处理${nounLabel(match[1], 'zh')}` : `Continue ${nounLabel(match[1], 'en')} in settlement`
  }
  return ''
}

function preserveWhitespace(original, translated) {
  const leading = original.match(/^\s*/)?.[0] || ''
  const trailing = original.match(/\s*$/)?.[0] || ''
  return `${leading}${translated}${trailing}`
}

function translateByFragments(text, locale) {
  const lookup = locale === 'zh' ? ZH_LOOKUP : EN_LOOKUP
  let translated = text
  let changed = false
  const entries = Array.from(lookup.entries()).sort((left, right) => right[0].length - left[0].length)

  for (const [source, target] of entries) {
    if (!source || source === target || !translated.includes(source)) {
      continue
    }
    translated = translated.split(source).join(target)
    changed = true
  }

  return changed ? translated : ''
}

function normalizePunctuation(text, locale) {
  if (!text) return text
  if (locale !== 'en') return text
  return text
    .replace(/，/g, ', ')
    .replace(/。/g, '.')
    .replace(/：/g, ': ')
    .replace(/；/g, '; ')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/、/g, ', ')
    .replace(/\s{2,}/g, ' ')
}

const PORTAL_LOCALE_FALLBACKS = [
  ['Enterprise onboarding', '企业入驻'],
  ['freelancer signup', '人才注册'],
  ['platform guidance', '平台说明'],
  ['Choose the role, create the account, then continue into setup.', '先选择角色，再创建账号，然后继续进入对应设置。'],
  ['post work', '发布需求'],
  ['submit applications', '提交报名'],
  ['and deliver', '并推进交付'],
  ['rating summary', '评分摘要']
]

function applyLocaleFallbackPhrases(text, locale) {
  if (!text || locale !== 'zh') return text
  let translated = text
  for (const [from, to] of PORTAL_LOCALE_FALLBACKS) {
    translated = translated.split(from).join(to)
  }
  return translated
}

function translateCore(text, locale) {
  if (!text) return text
  const lookup = locale === 'zh' ? ZH_LOOKUP : EN_LOOKUP
  return normalizePunctuation(
    applyLocaleFallbackPhrases(
      lookup.get(text) || translatePattern(text, locale) || translateByFragments(text, locale) || text,
      locale
    ),
    locale
  )
}

export function translateText(value, locale = currentUiLocale) {
  if (value == null) return ''
  const original = String(value)
  const core = original.trim()
  if (!core) return original
  return preserveWhitespace(original, translateCore(core, locale))
}

export function getUiLocale() {
  return currentUiLocale
}

export function getIntlLocale(locale = currentUiLocale) {
  return locale === 'zh' ? 'zh-CN' : 'en-US'
}

export function setUiLocale(locale) {
  currentUiLocale = normalizeUiLocale(locale)
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentUiLocale === 'zh' ? 'zh-CN' : 'en'
    document.documentElement.setAttribute('data-ui-locale', currentUiLocale)
  }
  return currentUiLocale
}

export function refreshUiLocale() {
  currentUiLocale = readPreferredUiLocale()
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentUiLocale === 'zh' ? 'zh-CN' : 'en'
    document.documentElement.setAttribute('data-ui-locale', currentUiLocale)
  }
  return currentUiLocale
}

function shouldSkipTextNode(node) {
  const parent = node?.parentElement
  return !parent || SKIP_TAGS.has(parent.tagName)
}

function translateTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    if (!shouldSkipTextNode(node)) {
      const translated = translateText(node.nodeValue)
      if (translated !== node.nodeValue) {
        node.nodeValue = translated
      }
    }
    node = walker.nextNode()
  }
}

function translateAttributes(root) {
  const candidates = []
  if (root.nodeType === Node.ELEMENT_NODE) {
    candidates.push(root)
  }
  if (root.querySelectorAll) {
    candidates.push(...root.querySelectorAll('[placeholder], [title], [aria-label]'))
  }
  for (const element of candidates) {
    for (const name of ATTRIBUTE_NAMES) {
      const current = element.getAttribute?.(name)
      if (!current) continue
      const translated = translateText(current)
      if (translated !== current) {
        element.setAttribute(name, translated)
      }
    }
  }
}

export function localizeDom(root = typeof document !== 'undefined' ? document.body : null) {
  if (typeof document === 'undefined' || !root || translating) return
  translating = true
  try {
    translateTextNodes(root)
    translateAttributes(root)
  } finally {
    translating = false
  }
}

function scheduleLocalization(root) {
  if (typeof window === 'undefined' || translateQueued) return
  translateQueued = true
  window.requestAnimationFrame(() => {
    translateQueued = false
    localizeDom(root)
  })
}

export function localizePageTitle(title) {
  const fallback = currentUiLocale === 'zh' ? 'AI 人才协作市场' : 'AI Talent Collaboration Market'
  const brand = currentUiLocale === 'zh' ? '有轻功' : 'YouQingGong'
  return `${brand} | ${translateText(title || fallback)}`
}

export function installUiLocale(router) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const applyDocumentLocale = () => {
    refreshUiLocale()
    document.documentElement.classList.add('notranslate')
    document.body?.setAttribute('translate', 'no')
    document.body?.classList.add('notranslate')
  }

  applyDocumentLocale()

  window.addEventListener('languagechange', () => {
    applyDocumentLocale()
  })

  if (router?.afterEach) {
    router.afterEach(() => {
      applyDocumentLocale()
    })
  }
}
