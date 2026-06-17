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

test("noticeFormSteps uses the approved short guidance copy", () => {
  assert.deepEqual(
    noticeFormSteps.map((step) => `${step.title}：${step.summary}`),
    [
      "必要信息：发布类型、位置、联系方式、宠物类型",
      "照片与描述：补充可识别特征",
      "时间与紧急程度：补充时间和风险标签，将影响排序",
      "悬赏与找回：设置悬赏和管理链接邮箱",
      "预览生成：确认信息后生成分享页和海报"
    ]
  );
});

test("getNoticeFormStep clamps invalid indexes", () => {
  assert.equal(getNoticeFormStep(-1).id, "essentials");
  assert.equal(getNoticeFormStep(99).id, "review");
});

test("essentials step stays within the first-screen field budget", () => {
  const step = getNoticeFormStepById("essentials");

  assert.equal(step.fields.length, 7);
  assert.deepEqual(step.fields, ["noticeCategory", "photoUpload", "addressText", "nearbyLandmark", "contact", "petName", "petType"]);
});

test("photo step keeps description only because image upload is available in essentials", () => {
  const step = getNoticeFormStepById("photo");

  assert.deepEqual(step.fields, ["description"]);
});

test("essentials step requires publishing type location contact and pet type", () => {
  const step = getNoticeFormStepById("essentials");

  assert.deepEqual(step.requiredFields, ["noticeCategory", "addressText", "contact", "petType"]);
});

test("isNoticeFormFieldRequired identifies required fields per step", () => {
  assert.equal(isNoticeFormFieldRequired("essentials", "noticeCategory"), true);
  assert.equal(isNoticeFormFieldRequired("essentials", "addressText"), true);
  assert.equal(isNoticeFormFieldRequired("essentials", "contact"), true);
  assert.equal(isNoticeFormFieldRequired("essentials", "petType"), true);
  assert.equal(isNoticeFormFieldRequired("essentials", "petName"), false);
  assert.equal(isNoticeFormFieldRequired("photo", "photoUpload"), false);
});

test("getNoticeFormRequiredSummary makes required scope obvious", () => {
  assert.equal(getNoticeFormRequiredSummary("essentials"), "必填：发布类型、位置、联系方式、宠物类型");
  assert.equal(getNoticeFormRequiredSummary("photo"), "可选信息，可直接下一步");
});

test("isNoticeFormStepField matches field ids to their owning step", () => {
  assert.equal(isNoticeFormStepField("essentials", "contact"), true);
  assert.equal(isNoticeFormStepField("essentials", "photoUpload"), true);
  assert.equal(isNoticeFormStepField("photo", "photoUpload"), false);
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

test("noticeFormSteps exposes mobile context copy for each step", () => {
  for (const step of noticeFormSteps) {
    assert.equal(typeof step.goal, "string");
    assert.notEqual(step.goal.trim(), "");
    assert.equal(typeof step.estimate, "string");
    assert.match(step.estimate, /分钟|秒|立即/);
  }
});
