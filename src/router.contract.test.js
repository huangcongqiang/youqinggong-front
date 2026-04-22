import fs from 'node:fs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const routerSource = fs.readFileSync(new URL('./router.js', import.meta.url), 'utf8');

assert(
  routerSource.includes('function redirectWithQuery(target) {'),
  'router should define redirectWithQuery for legacy route compatibility.'
);
assert(
  routerSource.includes('query: to.query') && routerSource.includes('hash: to.hash'),
  'redirectWithQuery should preserve query and hash when redirecting.'
);
assert(
  routerSource.includes("redirect: redirectWithQuery('/enterprise')")
    && routerSource.includes("redirect: redirectWithQuery('/enterprise/onboarding')")
    && routerSource.includes("redirect: redirectWithQuery('/enterprise/publish')")
    && routerSource.includes("redirect: redirectWithQuery('/enterprise/talents')")
    && routerSource.includes("redirect: redirectWithQuery('/talent/tasks')")
    && routerSource.includes("redirect: redirectWithQuery('/enterprise/contracts')")
    && routerSource.includes("redirect: redirectWithQuery('/enterprise/reports')")
    && routerSource.includes("redirect: redirectWithQuery('/enterprise/billing')"),
  'legacy redirects should go through redirectWithQuery for the main IA entry points.'
);
assert(
  routerSource.includes("redirect: redirectWithQuery((to) => `/enterprise/talents/${encodeURIComponent(String(to.params.slug || ''))}`)")
    && routerSource.includes("return `${base}/${encodeURIComponent(String(to.params.recordId || ''))}`;")
    && routerSource.includes("return `${base}/${encodeURIComponent(String(to.params.recordId || ''))}/settlement`;"),
  'param-based redirects should preserve params while routing into the new IA.'
);
assert(
  routerSource.includes("redirect: redirectByAudience('/enterprise/chat', '/talent/chat')")
    && routerSource.includes("redirect: redirectByAudience('/enterprise/workspace', '/talent/workspace')")
    && routerSource.includes("redirect: redirectByAudience('/enterprise/acceptance', '/talent/acceptance')"),
  'audience-aware redirects should continue to route through redirectByAudience.'
);
assert(
  routerSource.includes("const AcceptanceListPage = () => import('./pages/AcceptanceListPage.vue')")
    && routerSource.includes("path: '/enterprise/acceptance', component: AcceptanceListPage")
    && routerSource.includes("path: '/enterprise/acceptance/:taskId', component: AcceptancePage")
    && routerSource.includes("path: '/talent/acceptance', component: AcceptanceListPage")
    && routerSource.includes("path: '/talent/acceptance/:taskId', component: AcceptancePage")
    && routerSource.includes("path: '/acceptance/:taskId'"),
  'acceptance base routes should render the acceptance list, while task-specific routes render acceptance detail.'
);
assert(
  routerSource.includes("title: '提交报名'"),
  'task apply route meta title should use localized application vocabulary.'
);
