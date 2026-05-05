import assert from "node:assert/strict";
import fs from "node:fs";

const apiSource = fs.readFileSync(new URL("../services/api.ts", import.meta.url), "utf8");
const routesSource = fs.readFileSync(new URL("../routes.tsx", import.meta.url), "utf8");
const layoutSource = fs.readFileSync(new URL("../Layout.tsx", import.meta.url), "utf8");
const pageSource = fs.readFileSync(new URL("./TalentWithdrawals.tsx", import.meta.url), "utf8");
const dashboardSource = fs.readFileSync(new URL("./TalentDashboard.tsx", import.meta.url), "utf8");

assert.match(apiSource, /export function createTalentWithdrawal/, "api.ts should expose talent withdrawal submission.");
assert.ok(apiSource.includes('writeJson("/talent/withdrawals"'), "talent withdrawal submission should call POST /talent/withdrawals.");
assert.ok(routesSource.includes('path: "withdrawals", element: <TalentWithdrawals />'), "router should expose /talent/withdrawals.");
assert.ok(layoutSource.includes('path: "/talent/withdrawals", label: "提现"'), "talent navigation should include a withdrawal entry.");
assert.match(pageSource, /getTalentWithdrawalData/, "withdrawal page should load wallet and withdrawal records.");
assert.match(pageSource, /createTalentWithdrawal/, "withdrawal page should submit withdrawal applications.");
assert.ok(dashboardSource.includes('to="/talent/withdrawals"'), "talent dashboard should link the wallet card to withdrawal page.");
