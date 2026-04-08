/**
 * Notice mapper
 * 作用：统一将数据库实体映射为 public/admin payload，防止敏感字段泄漏。
 * 联动：notice.repository.ts、notice.service.ts、GET API routes。
 * 层级：mapper
 */
import { type AdminNoticePayload, type PublicNoticePayload } from "@/lib/notice/notice.types";
import { type PetNotice } from "@prisma/client";

function normalizeEnumValue(value: string) {
  return value.toLowerCase();
}

function normalizeLocaleValue(value: string): PublicNoticePayload["locale"] {
  return value === "zh_CN" ? "zh-CN" : "en";
}

function normalizeBusinessStatus(value: string): PublicNoticePayload["businessStatus"] {
  return normalizeEnumValue(value) as PublicNoticePayload["businessStatus"];
}

function normalizeActivityState(value: string): PublicNoticePayload["activityState"] {
  return normalizeEnumValue(value) as PublicNoticePayload["activityState"];
}

function normalizeModerationState(value: string): PublicNoticePayload["moderationState"] {
  return normalizeEnumValue(value) as PublicNoticePayload["moderationState"];
}

export function toPublicNoticePayload(notice: PetNotice): PublicNoticePayload {
  return {
    id: notice.id,
    shortId: notice.shortId,
    locale: normalizeLocaleValue(notice.locale),
    businessStatus: normalizeBusinessStatus(notice.businessStatus),
    activityState: normalizeActivityState(notice.activityState),
    moderationState: normalizeModerationState(notice.moderationState),
    petProfile: notice.petProfile as PublicNoticePayload["petProfile"],
    lostInfo: notice.lostInfo as PublicNoticePayload["lostInfo"],
    contactMethods: notice.contactMethods as PublicNoticePayload["contactMethods"],
    rewards: notice.rewards as PublicNoticePayload["rewards"],
    photos: notice.photos as PublicNoticePayload["photos"],
    riskFlags: notice.riskFlags as PublicNoticePayload["riskFlags"],
    primaryPhotoUrl: notice.primaryPhotoUrl,
    priorityScore: notice.priorityScore,
    riskLevel: notice.riskLevel,
    posterVersion: notice.posterVersion,
    createdAt: notice.createdAt.toISOString(),
    updatedAt: notice.updatedAt.toISOString(),
    lastRefreshedAt: notice.lastRefreshedAt.toISOString()
  };
}

export function toAdminNoticePayload(notice: PetNotice): AdminNoticePayload {
  return {
    ...toPublicNoticePayload(notice),
    ownerNotificationEmail: notice.ownerNotificationEmail,
    reportCount: notice.reportCount,
    lastReportedAt: notice.lastReportedAt?.toISOString() ?? null,
    archivedAt: notice.archivedAt?.toISOString() ?? null,
    reopenedAt: notice.reopenedAt?.toISOString() ?? null
  };
}
