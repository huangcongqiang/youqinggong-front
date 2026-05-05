import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const loginSource = readFileSync(resolve(currentDir, "Login.tsx"), "utf8");
const apiSource = readFileSync(resolve(currentDir, "../services/api.ts"), "utf8");

assert.match(
  apiSource,
  /export function requestPasswordResetCode[\s\S]*\/auth\/password-reset\/request/,
  "api.ts should expose the password reset code request endpoint."
);

assert.match(
  apiSource,
  /export function resetPassword[\s\S]*\/auth\/password-reset\/confirm/,
  "api.ts should expose the password reset confirmation endpoint."
);

assert.match(
  loginSource,
  /requestPasswordResetCode[\s\S]*resetPassword/,
  "Login page should call both reset request and confirm APIs."
);

assert.doesNotMatch(
  loginSource,
  /href="#"[^>]*>忘记密码？/,
  "Forgot-password entry should not be a dead hash link."
);

assert.match(
  loginSource,
  /role="dialog"[\s\S]*aria-modal="true"[\s\S]*重置登录密码/,
  "Forgot-password flow should open an accessible reset dialog."
);

assert.match(
  loginSource,
  /企业账号[\s\S]*人才账号[\s\S]*请输入注册手机号/,
  "Reset dialog should require the user to choose the account role and mobile."
);

assert.match(
  loginSource,
  /请输入验证码[\s\S]*请输入新密码[\s\S]*请再次输入新密码/,
  "Reset confirmation should collect code, new password, and confirmation password."
);

console.log("loginPasswordReset contracts passed");
