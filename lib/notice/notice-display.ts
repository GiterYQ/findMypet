/**
 * Notice display labels
 * 作用：集中定义 notice 展示层的人类可读文案，避免页面直接渲染内部状态 key。
 * 联动：列表卡片、分享页、管理页、后续海报模板。
 * 层级：constants
 */
import { type PetProfile, type RiskFlags, type PublicNoticePayload } from "@/lib/notice/notice.types";

const businessStatusLabels: Record<PublicNoticePayload["businessStatus"], string> = {
  active: "寻找中",
  recovered: "已找回",
  closed: "停止扩散"
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

export function getBusinessStatusLabel(status: PublicNoticePayload["businessStatus"]) {
  return businessStatusLabels[status];
}

export function getActivityStateLabel(state: PublicNoticePayload["activityState"]) {
  return activityStateLabels[state];
}

export function getPetTypeLabel(type: PetProfile["type"]) {
  return petTypeLabels[type];
}

export function getRiskFlagLabels(riskFlags?: RiskFlags | null) {
  return Object.entries(riskFlags ?? {})
    .filter(([, enabled]) => enabled)
    .map(([key]) => riskFlagLabels[key as keyof RiskFlags]);
}

