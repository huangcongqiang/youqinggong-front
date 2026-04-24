import test from "node:test";
import assert from "node:assert/strict";
import { resolveRecruitingSuccessRoute } from "./enterpriseRecruitingRoute.js";

test("returns workspace route after confirm cooperation succeeds", () => {
  const route = resolveRecruitingSuccessRoute("confirm-application-1", {
    nextRoute: "/enterprise/workspace?taskId=task-066&room=group_task_066&roomKey=group_task_066"
  });

  assert.equal(route, "/enterprise/workspace?taskId=task-066&room=group_task_066&roomKey=group_task_066");
});

test("does not redirect generic recruiting mutations without an explicit route", () => {
  const route = resolveRecruitingSuccessRoute("invite-application-1", {
    nextStep: "面试邀约已发送。"
  });

  assert.equal(route, "");
});
