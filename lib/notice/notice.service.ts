/**
 * Notice service
 * 作用：实现 notice 的创建、编辑、刷新、状态流转、排序评分和 payload 读取规则。
 * 联动：notice.schema.ts、notice.repository.ts、notice.mapper.ts、API routes。
 * 层级：service
 */
import crypto from "node:crypto";
import { nanoid } from "nanoid";
import { AppError } from "@/lib/core/app-error";
import { sendManageLinkEmail } from "@/lib/notice/notice-email.service";
import { ARCHIVE_WINDOW_HOURS, FRESH_WINDOW_HOURS, REFRESH_COOLDOWN_HOURS, riskWeights } from "@/lib/notice/notice.constants";
import { toAdminNoticePayload, toPublicNoticePayload } from "@/lib/notice/notice.mapper";
import { noticeRepository } from "@/lib/notice/notice.repository";
import { noticeCreateSchema, noticeUpdateSchema, statusUpdateSchema, type NoticeCreateInput, type NoticeUpdateInput } from "@/lib/notice/notice.schema";
import { type NoticeListFilters, type RiskFlags } from "@/lib/notice/notice.types";
import { type ActivityState, type BusinessStatus, type PetNotice } from "@prisma/client";

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function computeRiskLevel(riskFlags?: RiskFlags) {
  if (!riskFlags) {
    return 0;
  }

  return Object.entries(riskFlags).reduce((total, [key, enabled]) => {
    if (!enabled) {
      return total;
    }

    return total + riskWeights[key as keyof typeof riskWeights];
  }, 0);
}

function computeRewardScore(input: NoticeCreateInput | NoticeUpdateInput) {
  const amounts = [input.rewards?.clue?.amountMinor ?? 0, input.rewards?.recovery?.amountMinor ?? 0];
  const highestReward = Math.max(...amounts);

  // 悬赏只作为次级因子参与排序，避免高悬赏压过高风险内容。
  return Math.min(Math.floor(highestReward / 1000), 80);
}

function computeLostTimeScore(lostStartAt?: string) {
  if (!lostStartAt) {
    return 10;
  }

  const hoursAgo = Math.max((Date.now() - new Date(lostStartAt).getTime()) / 3_600_000, 0);
  return Math.max(180 - Math.floor(hoursAgo), 0);
}

function deriveActivityState(lastRefreshedAt: Date): ActivityState {
  const elapsedHours = (Date.now() - lastRefreshedAt.getTime()) / 3_600_000;

  if (elapsedHours > ARCHIVE_WINDOW_HOURS) {
    return "ARCHIVED";
  }

  if (elapsedHours > FRESH_WINDOW_HOURS) {
    return "STALE";
  }

  return "FRESH";
}

function buildDerivedFields(input: NoticeCreateInput | NoticeUpdateInput) {
  const photos = input.photos ?? [];
  const primaryPhoto = photos.find((photo) => photo.isPrimary) ?? photos[0];
  const lostAtStart = input.lostInfo.lostTime.startAt ? new Date(input.lostInfo.lostTime.startAt) : undefined;
  const riskLevel = computeRiskLevel(input.riskFlags);
  const rewardScore = computeRewardScore(input);
  const lostTimeScore = computeLostTimeScore(input.lostInfo.lostTime.startAt);

  return {
    lostAtStart,
    regionCode: input.lostInfo.location.regionCode,
    locationPrivacy: input.lostInfo.location.privacyLevel === "exact" ? "EXACT" : "APPROXIMATE",
    primaryPhotoUrl: primaryPhoto?.url,
    riskLevel,
    priorityScore: riskLevel + rewardScore + lostTimeScore
  };
}

function verifyOwnerToken(notice: Pick<PetNotice, "ownerTokenHash">, rawToken?: string) {
  if (!rawToken || hashToken(rawToken) !== notice.ownerTokenHash) {
    throw new AppError("UNAUTHORIZED", "Invalid manage token.");
  }
}

function getBaseUrl() {
  return process.env.APP_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export const noticeService = {
  async createNotice(rawInput: unknown) {
    const input = noticeCreateSchema.parse(rawInput);
    const rawToken = crypto.randomBytes(32).toString("hex");
    const derivedFields = buildDerivedFields(input);
    const shortId = nanoid(8);
    const createdAt = new Date();

    const notice = await noticeRepository.create({
      shortId,
      locale: input.locale === "zh-CN" ? "zh_CN" : "en_US",
      noticeCategory: input.noticeCategory === "found-owner" ? "FOUND_OWNER" : "LOST_PET",
      petProfile: input.petProfile,
      lostInfo: input.lostInfo,
      contactMethods: input.contactMethods,
      rewards: input.rewards ?? undefined,
      photos: input.photos,
      riskFlags: input.riskFlags ?? undefined,
      ownerTokenHash: hashToken(rawToken),
      ownerNotificationEmail: input.ownerNotificationEmail,
      lostAtStart: derivedFields.lostAtStart,
      regionCode: derivedFields.regionCode,
      locationPrivacy: derivedFields.locationPrivacy as "APPROXIMATE" | "EXACT",
      primaryPhotoUrl: derivedFields.primaryPhotoUrl,
      priorityScore: derivedFields.priorityScore,
      riskLevel: derivedFields.riskLevel,
      updatedAt: createdAt,
      lastRefreshedAt: createdAt
    });

    await noticeRepository.createAudit({
      notice: { connect: { id: notice.id } },
      action: "CREATE",
      toBusiness: notice.businessStatus,
      toActivity: notice.activityState
    });

    const publicShareUrl = `${getBaseUrl()}/notice/${notice.shortId}`;
    const manageUrl = `${getBaseUrl()}/manage/${notice.shortId}?token=${rawToken}`;

    if (input.ownerNotificationEmail) {
      const delivery = await sendManageLinkEmail({
        email: input.ownerNotificationEmail,
        shortId: notice.shortId,
        manageUrl,
        publicShareUrl
      });

      await noticeRepository.createEmailLog({
        notice: { connect: { id: notice.id } },
        email: input.ownerNotificationEmail,
        purpose: "MANAGE_LINK",
        status: delivery.status,
        providerId: delivery.providerId
      });
    }

    return {
      notice,
      rawToken,
      publicShareUrl,
      manageUrl
    };
  },

  async listVisibleNotices() {
    const notices = await noticeRepository.findVisibleFreshList();
    return notices.map(toPublicNoticePayload);
  },

  async listVisibleNoticesWithFilters(filters: NoticeListFilters = {}) {
    const notices = await noticeRepository.findVisibleFreshList(filters.regionCode);
    const mapped = notices.map(toPublicNoticePayload);

    if (!filters.petType) {
      return mapped;
    }

    return mapped.filter((notice) => notice.petProfile.type === filters.petType);
  },

  async listVisibleFilterOptions() {
    const notices = await noticeRepository.findVisibleFreshList();
    const regionOptions = Array.from(new Set(notices.map((notice) => notice.regionCode).filter((value): value is string => Boolean(value)))).sort();

    return {
      regionOptions
    };
  },

  async getNoticeByShortId(shortId: string, manageToken?: string) {
    const notice = await noticeRepository.findByShortId(shortId);

    if (!notice || notice.deletedAt) {
      throw new AppError("NOT_FOUND", "Notice not found.");
    }

    if (manageToken) {
      verifyOwnerToken(notice, manageToken);
      return {
        view: "admin",
        data: toAdminNoticePayload(notice)
      };
    }

    return {
      view: "public",
      data: toPublicNoticePayload(notice)
    };
  },

  async updateNotice(shortId: string, rawInput: unknown, manageToken?: string) {
    const input = noticeUpdateSchema.parse(rawInput);
    const notice = await noticeRepository.findByShortId(shortId);

    if (!notice) {
      throw new AppError("NOT_FOUND", "Notice not found.");
    }

    verifyOwnerToken(notice, manageToken);

    const derivedFields = buildDerivedFields(input);
    const updatedAt = new Date();

    const updatedNotice = await noticeRepository.updateByShortId(shortId, {
      locale: input.locale === "zh-CN" ? "zh_CN" : "en_US",
      noticeCategory: input.noticeCategory === "found-owner" ? "FOUND_OWNER" : "LOST_PET",
      petProfile: input.petProfile,
      lostInfo: input.lostInfo,
      contactMethods: input.contactMethods,
      rewards: input.rewards ?? undefined,
      photos: input.photos,
      riskFlags: input.riskFlags ?? undefined,
      lostAtStart: derivedFields.lostAtStart,
      regionCode: derivedFields.regionCode,
      locationPrivacy: derivedFields.locationPrivacy as "APPROXIMATE" | "EXACT",
      primaryPhotoUrl: derivedFields.primaryPhotoUrl,
      priorityScore: derivedFields.priorityScore,
      riskLevel: derivedFields.riskLevel,
      posterVersion: { increment: 1 },
      updatedAt
    });

    await noticeRepository.createAudit({
      notice: { connect: { id: updatedNotice.id } },
      action: "EDIT",
      fromBusiness: notice.businessStatus,
      toBusiness: updatedNotice.businessStatus,
      fromActivity: notice.activityState,
      toActivity: updatedNotice.activityState
    });

    return toAdminNoticePayload(updatedNotice);
  },

  async updateStatus(shortId: string, rawInput: unknown, manageToken?: string) {
    const input = statusUpdateSchema.parse(rawInput);
    const notice = await noticeRepository.findByShortId(shortId);

    if (!notice) {
      throw new AppError("NOT_FOUND", "Notice not found.");
    }

    verifyOwnerToken(notice, manageToken);

    const nextBusinessStatus = input.businessStatus.toUpperCase() as BusinessStatus;
    const updatedAt = new Date();

    const updatedNotice = await noticeRepository.updateByShortId(shortId, {
      businessStatus: nextBusinessStatus,
      updatedAt,
      posterVersion: { increment: 1 },
      recoveredAt: nextBusinessStatus === "RECOVERED" ? updatedAt : notice.recoveredAt,
      closedAt: nextBusinessStatus === "CLOSED" ? updatedAt : notice.closedAt
    });

    await noticeRepository.createAudit({
      notice: { connect: { id: updatedNotice.id } },
      action: "STATUS_CHANGE",
      fromBusiness: notice.businessStatus,
      toBusiness: updatedNotice.businessStatus,
      fromActivity: notice.activityState,
      toActivity: updatedNotice.activityState
    });

    return toAdminNoticePayload(updatedNotice);
  },

  async refreshNotice(shortId: string, manageToken?: string) {
    const notice = await noticeRepository.findByShortId(shortId);

    if (!notice) {
      throw new AppError("NOT_FOUND", "Notice not found.");
    }

    verifyOwnerToken(notice, manageToken);

    if (notice.businessStatus !== "ACTIVE") {
      throw new AppError("INVALID_INPUT", "Only active notices can be refreshed.");
    }

    const now = new Date();
    const hoursSinceLastRefresh = (now.getTime() - notice.lastRefreshedAt.getTime()) / 3_600_000;

    if (hoursSinceLastRefresh < REFRESH_COOLDOWN_HOURS) {
      throw new AppError("REFRESH_TOO_SOON", "Refresh cooldown has not elapsed.");
    }

    const nextActivityState = deriveActivityState(now);
    const updatedNotice = await noticeRepository.updateByShortId(shortId, {
      lastRefreshedAt: now,
      activityState: nextActivityState
    });

    await noticeRepository.createAudit({
      notice: { connect: { id: updatedNotice.id } },
      action: "REFRESH",
      fromBusiness: notice.businessStatus,
      toBusiness: updatedNotice.businessStatus,
      fromActivity: notice.activityState,
      toActivity: updatedNotice.activityState
    });

    return toAdminNoticePayload(updatedNotice);
  },

  async reopenNotice(shortId: string, manageToken?: string) {
    const notice = await noticeRepository.findByShortId(shortId);

    if (!notice) {
      throw new AppError("NOT_FOUND", "Notice not found.");
    }

    verifyOwnerToken(notice, manageToken);

    const now = new Date();
    const activityState = deriveActivityState(now);

    const updatedNotice = await noticeRepository.updateByShortId(shortId, {
      businessStatus: "ACTIVE",
      activityState,
      updatedAt: now,
      reopenedAt: now,
      posterVersion: { increment: 1 }
    });

    await noticeRepository.createAudit({
      notice: { connect: { id: updatedNotice.id } },
      action: "REOPEN",
      fromBusiness: notice.businessStatus,
      toBusiness: updatedNotice.businessStatus,
      fromActivity: notice.activityState,
      toActivity: updatedNotice.activityState
    });

    return toAdminNoticePayload(updatedNotice);
  },

  async reportNotice(shortId: string, reason: "SCAM" | "IMAGE_VIOLATION" | "IRRELEVANT" | "OTHER") {
    const notice = await noticeRepository.findByShortId(shortId);

    if (!notice) {
      throw new AppError("NOT_FOUND", "Notice not found.");
    }

    await noticeRepository.createReport({
      notice: { connect: { id: notice.id } },
      reason
    });

    const nextReportCount = notice.reportCount + 1;
    const nextModerationState = nextReportCount >= 5 ? "HIDDEN" : nextReportCount >= 3 ? "DOWNRANKED" : notice.moderationState;
    const updatedNotice = await noticeRepository.updateByShortId(shortId, {
      reportCount: nextReportCount,
      lastReportedAt: new Date(),
      moderationState: nextModerationState
    });

    if (nextModerationState !== notice.moderationState) {
      await noticeRepository.createAudit({
        notice: { connect: { id: updatedNotice.id } },
        action: nextModerationState === "HIDDEN" ? "MODERATION_HIDE" : "MODERATION_DOWNRANK",
        fromBusiness: updatedNotice.businessStatus,
        toBusiness: updatedNotice.businessStatus,
        fromActivity: updatedNotice.activityState,
        toActivity: updatedNotice.activityState
      });
    }

    return toPublicNoticePayload(updatedNotice);
  }
};
