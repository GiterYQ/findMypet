/**
 * Notice form steps
 * 作用：定义创建 notice 的分步填写流程，避免步骤顺序和文案散落在组件里。
 * 联动：components/notice/NoticeForm.tsx、tests/notice-form-steps.test.mts。
 * 层级：constants
 */
export type NoticeFormStepField =
  | "noticeCategory"
  | "petName"
  | "petType"
  | "addressText"
  | "nearbyLandmark"
  | "contact"
  | "photoUpload"
  | "description"
  | "lostDate"
  | "timePrecision"
  | "lostDisplay"
  | "riskFlags"
  | "rewardRecovery"
  | "ownerEmail"
  | "antiScam"
  | "submit";

type NoticeFormStep = {
  id: "essentials" | "photo" | "time-risk" | "reward-extra" | "review";
  title: string;
  summary: string;
  fields: NoticeFormStepField[];
  skippable: boolean;
};

export const noticeFormSteps = [
  {
    id: "essentials",
    title: "必要信息",
    summary: "先填能生成启事的最低信息。",
    fields: ["noticeCategory", "petName", "petType", "addressText", "nearbyLandmark", "contact"],
    skippable: false
  },
  {
    id: "photo",
    title: "照片与描述",
    summary: "上传照片，补充可识别特征。",
    fields: ["photoUpload", "description"],
    skippable: true
  },
  {
    id: "time-risk",
    title: "时间与紧急程度",
    summary: "补充时间和风险标签，影响排序。",
    fields: ["lostDate", "timePrecision", "lostDisplay", "riskFlags"],
    skippable: true
  },
  {
    id: "reward-extra",
    title: "悬赏与找回",
    summary: "设置悬赏和管理链接邮箱。",
    fields: ["rewardRecovery", "ownerEmail", "antiScam"],
    skippable: true
  },
  {
    id: "review",
    title: "预览生成",
    summary: "确认信息后生成分享页和海报。",
    fields: ["submit"],
    skippable: false
  }
] as const satisfies NoticeFormStep[];

export type NoticeFormStepId = (typeof noticeFormSteps)[number]["id"];

export function getNoticeFormStep(index: number) {
  const safeIndex = Math.min(Math.max(index, 0), noticeFormSteps.length - 1);
  return noticeFormSteps[safeIndex];
}

export function getNoticeFormStepById(stepId: NoticeFormStepId) {
  return noticeFormSteps.find((step) => step.id === stepId) ?? noticeFormSteps[0];
}

export function isNoticeFormStepField(stepId: NoticeFormStepId, field: NoticeFormStepField) {
  const fields: readonly NoticeFormStepField[] = getNoticeFormStepById(stepId).fields;
  return fields.includes(field);
}

export function getNoticeFormNextButtonLabel(stepId: NoticeFormStepId) {
  return getNoticeFormStepById(stepId).id === "review" ? "生成" : "下一步";
}
