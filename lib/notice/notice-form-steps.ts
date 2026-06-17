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
  goal: string;
  estimate: string;
  fields: NoticeFormStepField[];
  requiredFields: NoticeFormStepField[];
  skippable: boolean;
  tone: "ember" | "leaf" | "sky" | "gold" | "ink";
};

const noticeFormStepFieldLabels: Record<NoticeFormStepField, string> = {
  noticeCategory: "发布类型",
  petName: "宠物名称",
  petType: "宠物类型",
  addressText: "位置",
  nearbyLandmark: "标志物",
  contact: "联系方式",
  photoUpload: "照片",
  description: "描述",
  lostDate: "日期",
  timePrecision: "时间精度",
  lostDisplay: "时间说明",
  riskFlags: "风险标签",
  rewardRecovery: "悬赏",
  ownerEmail: "邮箱",
  antiScam: "防骗提示",
  submit: "提交"
};

export const noticeFormSteps = [
  {
    id: "essentials",
    title: "必要信息",
    summary: "先填能生成启事的最低信息。",
    goal: "填位置和联系方式，先把启事发得出去。",
    estimate: "约 1 分钟",
    fields: ["noticeCategory", "addressText", "nearbyLandmark", "contact", "petName", "petType"],
    requiredFields: ["addressText", "contact"],
    skippable: false,
    tone: "ember"
  },
  {
    id: "photo",
    title: "照片与描述",
    summary: "上传照片，补充可识别特征。",
    goal: "让看到的人一眼认出宠物，不上传也能继续。",
    estimate: "约 1 分钟",
    fields: ["photoUpload", "description"],
    requiredFields: [],
    skippable: true,
    tone: "leaf"
  },
  {
    id: "time-risk",
    title: "时间与紧急程度",
    summary: "补充时间和风险标签，影响排序。",
    goal: "说明什么时候丢失、是否有病危或交通危险。",
    estimate: "约 30 秒",
    fields: ["lostDate", "timePrecision", "lostDisplay", "riskFlags"],
    requiredFields: [],
    skippable: true,
    tone: "sky"
  },
  {
    id: "reward-extra",
    title: "悬赏与找回",
    summary: "设置悬赏和管理链接邮箱。",
    goal: "补充悬赏和邮箱，方便之后找回管理链接。",
    estimate: "约 30 秒",
    fields: ["rewardRecovery", "ownerEmail", "antiScam"],
    requiredFields: [],
    skippable: true,
    tone: "gold"
  },
  {
    id: "review",
    title: "预览生成",
    summary: "确认信息后生成分享页和海报。",
    goal: "最后确认一次，生成可转发的链接和海报。",
    estimate: "立即生成",
    fields: ["submit"],
    requiredFields: [],
    skippable: false,
    tone: "ink"
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

export function isNoticeFormFieldRequired(stepId: NoticeFormStepId, field: NoticeFormStepField) {
  const requiredFields: readonly NoticeFormStepField[] = getNoticeFormStepById(stepId).requiredFields;
  return requiredFields.includes(field);
}

export function getNoticeFormRequiredSummary(stepId: NoticeFormStepId) {
  const requiredFields: readonly NoticeFormStepField[] = getNoticeFormStepById(stepId).requiredFields;

  if (requiredFields.length === 0) {
    return "可选信息，可直接下一步";
  }

  return `必填：${requiredFields.map((field) => noticeFormStepFieldLabels[field]).join("、")}`;
}

export function getNoticeFormNextButtonLabel(stepId: NoticeFormStepId) {
  return getNoticeFormStepById(stepId).id === "review" ? "生成" : "下一步";
}
