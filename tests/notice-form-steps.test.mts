/**
 * Notice form steps tests
 * 作用：验证创建流程分步配置，降低表单拆分时的顺序漂移风险。
 * 联动：lib/notice/notice-form-steps.ts、components/notice/NoticeForm.tsx。
 * 层级：test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { getNoticeFormStep, getNoticeFormStepById, isNoticeFormStepField, noticeFormSteps } from "../lib/notice/notice-form-steps.ts";

test("noticeFormSteps keeps the create flow short and ordered", () => {
  assert.deepEqual(
    noticeFormSteps.map((step) => step.id),
    ["essentials", "photo", "time-risk", "reward-extra", "review"]
  );
});

test("getNoticeFormStep clamps invalid indexes", () => {
  assert.equal(getNoticeFormStep(-1).id, "essentials");
  assert.equal(getNoticeFormStep(99).id, "review");
});

test("essentials step stays within the first-screen field budget", () => {
  const step = getNoticeFormStepById("essentials");

  assert.equal(step.fields.length, 6);
  assert.deepEqual(step.fields, ["noticeCategory", "petName", "petType", "addressText", "nearbyLandmark", "contact"]);
});

test("isNoticeFormStepField matches field ids to their owning step", () => {
  assert.equal(isNoticeFormStepField("essentials", "contact"), true);
  assert.equal(isNoticeFormStepField("essentials", "photoUpload"), false);
  assert.equal(isNoticeFormStepField("photo", "description"), true);
  assert.equal(isNoticeFormStepField("review", "submit"), true);
});
