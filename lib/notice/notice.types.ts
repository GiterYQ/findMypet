/**
 * Notice types
 * 作用：定义首版 notice 领域模型和 JSONB 合约，保证 schema 与页面共享同一语义。
 * 联动：prisma/schema.prisma、notice.schema.ts、notice.service.ts、UI 页面。
 * 层级：types
 */
export type AppLocale = "zh-CN" | "en";

export type PetProfile = {
  name: string;
  type: "dog" | "cat" | "bird" | "other";
  breed?: string;
  breedConfidence?: number;
  color?: string[];
  gender?: "male" | "female" | "unknown";
  ageText?: string;
  bodySize?: "small" | "medium" | "large";
  neutered?: "yes" | "no" | "unknown";
  collar?: string;
  leash?: boolean;
  distinctiveFeatures?: string[];
  healthNotes?: string;
  description?: string;
};

export type PetLostTime = {
  precision: "exact" | "day" | "range" | "approx";
  startAt?: string;
  endAt?: string;
  displayText?: string;
  timezone: string;
};

export type PetLocation = {
  addressText: string;
  placeName?: string;
  lat?: number;
  lng?: number;
  regionCode?: string;
  privacyLevel: "approximate" | "exact";
};

export type PetLostInfo = {
  lostTime: PetLostTime;
  location: PetLocation;
};

export type ContactMethod = {
  type: "phone" | "sms" | "whatsapp" | "wechat" | "telegram" | "email" | "other";
  value: string;
  label?: string;
  isPrimary?: boolean;
  visibility: "public" | "masked";
};

export type RewardItem = {
  enabled: boolean;
  amountMinor?: number;
  currency?: string;
  note?: string;
};

export type PetReward = {
  clue?: RewardItem;
  recovery?: RewardItem;
};

export type PetPhoto = {
  url: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  blurHash?: string;
  isPrimary?: boolean;
};

export type RiskFlags = {
  criticalCondition?: boolean;
  needsMedication?: boolean;
  infectiousDisease?: boolean;
  blindOrDeaf?: boolean;
  disabledMobility?: boolean;
  seniorPet?: boolean;
  youngPet?: boolean;
  inTrafficDangerZone?: boolean;
  inExtremeWeather?: boolean;
};

export type PublicNoticePayload = {
  id: string;
  shortId: string;
  locale: AppLocale;
  businessStatus: "active" | "recovered" | "closed";
  activityState: "fresh" | "stale" | "archived";
  moderationState: "visible" | "downranked" | "hidden";
  petProfile: PetProfile;
  lostInfo: PetLostInfo;
  contactMethods: ContactMethod[];
  rewards?: PetReward | null;
  photos: PetPhoto[];
  riskFlags?: RiskFlags | null;
  primaryPhotoUrl?: string | null;
  priorityScore: number;
  riskLevel: number;
  posterVersion: number;
  createdAt: string;
  updatedAt: string;
  lastRefreshedAt: string;
};

export type AdminNoticePayload = PublicNoticePayload & {
  ownerNotificationEmail?: string | null;
  reportCount: number;
  lastReportedAt?: string | null;
  archivedAt?: string | null;
  reopenedAt?: string | null;
};

export type NoticeListFilters = {
  regionCode?: string;
  petType?: PetProfile["type"];
};
