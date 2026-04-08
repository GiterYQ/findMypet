/**
 * Notice display labels
 * 作用：集中定义 notice 展示层的人类可读文案，避免页面直接渲染内部状态 key。
 * 联动：列表卡片、分享页、管理页、后续海报模板。
 * 层级：constants
 */
import { type ContactMethod, type NoticeCategory, type PetProfile, type RiskFlags, type PublicNoticePayload } from "@/lib/notice/notice.types";

const businessStatusLabels: Record<NoticeCategory, Record<PublicNoticePayload["businessStatus"], string>> = {
  "lost-pet": {
    active: "寻找中",
    recovered: "已找回",
    closed: "停止扩散"
  },
  "found-owner": {
    active: "寻找主人",
    recovered: "已找到主人",
    closed: "停止扩散"
  }
};

const activityStateLabels: Record<PublicNoticePayload["activityState"], string> = {
  fresh: "最新活跃",
  stale: "待刷新",
  archived: "已归档"
};

const petTypeLabels: Record<PetProfile["type"], string> = {
  cat: "猫",
  dog: "狗",
  bird: "鸟",
  other: "其他"
};

const noticeCategoryLabels: Record<NoticeCategory, string> = {
  "lost-pet": "寻宠",
  "found-owner": "寻主"
};

const riskFlagLabels: Record<keyof RiskFlags, string> = {
  criticalCondition: "病危",
  needsMedication: "需喂药",
  infectiousDisease: "传染病",
  blindOrDeaf: "失明/听障",
  disabledMobility: "行动障碍",
  seniorPet: "老年宠物",
  youngPet: "幼宠",
  inTrafficDangerZone: "高速路/高车流",
  inExtremeWeather: "极端天气"
};

const contactTypeLabels: Record<ContactMethod["type"], string> = {
  phone: "电话",
  sms: "短信",
  whatsapp: "WhatsApp",
  wechat: "微信",
  telegram: "Telegram",
  email: "邮箱",
  other: "其他联系方式"
};

export function getBusinessStatusLabel(status: PublicNoticePayload["businessStatus"], category: NoticeCategory = "lost-pet") {
  return businessStatusLabels[category][status];
}

export function getActivityStateLabel(state: PublicNoticePayload["activityState"]) {
  return activityStateLabels[state];
}

export function getPetTypeLabel(type: PetProfile["type"]) {
  return petTypeLabels[type];
}

export function getNoticeCategoryLabel(category: NoticeCategory) {
  return noticeCategoryLabels[category];
}

export function getTimeFieldLabel(category: NoticeCategory) {
  return category === "found-owner" ? "拾获时间" : "丢失时间";
}

export function getLocationFieldLabel(category: NoticeCategory) {
  return category === "found-owner" ? "拾获地点" : "丢失地点";
}

export function getPrimaryContactPrompt(category: NoticeCategory) {
  return category === "found-owner" ? "请联系确认主人" : "请帮忙联系";
}

export function getRiskFlagLabels(riskFlags?: RiskFlags | null) {
  return Object.entries(riskFlags ?? {})
    .filter(([, enabled]) => enabled)
    .map(([key]) => riskFlagLabels[key as keyof RiskFlags]);
}

export function getContactTypeLabel(type: ContactMethod["type"]) {
  return contactTypeLabels[type];
}

export function getContactDisplayValue(contact: ContactMethod) {
  if (contact.visibility !== "masked") {
    return contact.value;
  }

  if (contact.type === "email") {
    const [localPart = "", domain = ""] = contact.value.split("@");
    if (!domain) {
      return contact.value;
    }

    const visibleLocal = localPart.slice(0, 2);
    return `${visibleLocal}${"*".repeat(Math.max(localPart.length - 2, 2))}@${domain}`;
  }

  const visiblePrefix = contact.value.slice(0, 3);
  const visibleSuffix = contact.value.slice(-2);
  return `${visiblePrefix}${"*".repeat(Math.max(contact.value.length - 5, 4))}${visibleSuffix}`;
}

export function getContactHref(contact: ContactMethod) {
  switch (contact.type) {
    case "phone":
    case "sms":
      return `tel:${contact.value}`;
    case "email":
      return `mailto:${contact.value}`;
    default:
      return null;
  }
}
