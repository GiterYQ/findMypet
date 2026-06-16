/**
 * Notice form steps tests
 * 作用：验证创建流程分步配置，降低表单拆分时的顺序漂移风险。
 * 联动：lib/notice/notice-form-steps.ts、components/notice/NoticeForm.tsx。
 * 层级：test
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  getNoticeFormRequiredSummary,
  getNoticeFormNextButtonLabel,
  getNoticeFormStep,
  getNoticeFormStepById,
  isNoticeFormFieldRequired,
  isNoticeFormStepField,
  noticeFormSteps
} from "../lib/notice/notice-form-steps.ts";

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

test("essentials step only requires location and contact", () => {
  const step = getNoticeFormStepById("essentials");

  assert.deepEqual(step.requiredFields, ["addressText", "contact"]);
});

test("isNoticeFormFieldRequired identifies required fields per step", () => {
  assert.equal(isNoticeFormFieldRequired("essentials", "addressText"), true);
  assert.equal(isNoticeFormFieldRequired("essentials", "contact"), true);
  assert.equal(isNoticeFormFieldRequired("essentials", "petName"), false);
  assert.equal(isNoticeFormFieldRequired("photo", "photoUpload"), false);
});

test("getNoticeFormRequiredSummary makes required scope obvious", () => {
  assert.equal(getNoticeFormRequiredSummary("essentials"), "必填：位置、联系方式");
  assert.equal(getNoticeFormRequiredSummary("photo"), "可选信息，可直接下一步");
});

test("isNoticeFormStepField matches field ids to their owning step", () => {
  assert.equal(isNoticeFormStepField("essentials", "contact"), true);
  assert.equal(isNoticeFormStepField("essentials", "photoUpload"), false);
  assert.equal(isNoticeFormStepField("photo", "description"), true);
  assert.equal(isNoticeFormStepField("review", "submit"), true);
});

test("detail steps are skippable after required essentials", () => {
  const skippableStepIds = noticeFormSteps.filter((step) => step.skippable).map((step) => step.id);

  assert.deepEqual(skippableStepIds, ["photo", "time-risk", "reward-extra"]);
});

test("skippable detail steps still use next as the primary action label", () => {
  assert.equal(getNoticeFormNextButtonLabel("essentials"), "下一步");
  assert.equal(getNoticeFormNextButtonLabel("photo"), "下一步");
  assert.equal(getNoticeFormNextButtonLabel("reward-extra"), "下一步");
});

test("noticeFormSteps gives every step a distinct visual tone", () => {
  const tones = noticeFormSteps.map((step) => step.tone);

  assert.equal(new Set(tones).size, noticeFormSteps.length);
});
