/**
 * Notice schema
 * 作用：校验 notice 的输入输出结构，并锁死首版可编辑字段边界。
 * 联动：notice.types.ts、notice.service.ts、API routes、表单页面。
 * 层级：schema
 */
import { z } from "zod";

export const localeSchema = z.enum(["zh-CN", "en"]);
export const noticeCategorySchema = z.enum(["lost-pet", "found-owner"]);
export const businessStatusSchema = z.enum(["active", "recovered", "closed"]);
export const activityStateSchema = z.enum(["fresh", "stale", "archived"]);

export const petProfileSchema = z.object({
  name: z.string().min(1).max(30),
  type: z.enum(["dog", "cat", "bird", "other"]),
  customType: z.string().max(30).optional(),
  breed: z.string().max(30).optional(),
  breedConfidence: z.number().min(0).max(1).optional(),
  color: z.array(z.string().max(20)).max(5).optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  ageText: z.string().max(20).optional(),
  bodySize: z.enum(["small", "medium", "large"]).optional(),
  neutered: z.enum(["yes", "no", "unknown"]).optional(),
  collar: z.string().max(50).optional(),
  leash: z.boolean().optional(),
  distinctiveFeatures: z.array(z.string().max(50)).max(10).optional(),
  healthNotes: z.string().max(200).optional(),
  description: z.string().max(500).optional()
});

export const petLostTimeSchema = z.object({
  precision: z.enum(["exact", "day", "range", "approx"]),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  displayText: z.string().max(100).optional(),
  timezone: z.string().min(1).max(50)
});

export const petLocationSchema = z.object({
  province: z.string().max(20).optional(),
  city: z.string().max(20).optional(),
  district: z.string().max(20).optional(),
  street: z.string().max(50).optional(),
  addressText: z.string().min(1).max(200),
  nearbyLandmark: z.string().max(100).optional(),
  placeName: z.string().max(100).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  regionCode: z.string().max(20).optional(),
  privacyLevel: z.enum(["approximate", "exact"])
});

export const contactMethodSchema = z.object({
  type: z.enum(["phone", "sms", "whatsapp", "wechat", "telegram", "email", "other"]),
  value: z.string().min(1).max(100),
  label: z.string().max(30).optional(),
  isPrimary: z.boolean().optional(),
  visibility: z.enum(["public", "masked"])
});

export const rewardsSchema = z
  .object({
    clue: z
      .object({
        enabled: z.boolean(),
        amountMinor: z.number().int().nonnegative().max(10_000_000).optional(),
        currency: z.string().max(5).optional(),
        note: z.string().max(100).optional()
      })
      .optional(),
    recovery: z
      .object({
        enabled: z.boolean(),
        amountMinor: z.number().int().nonnegative().max(10_000_000).optional(),
        currency: z.string().max(5).optional(),
        note: z.string().max(100).optional()
      })
      .optional()
  })
  .optional();

export const photoSchema = z.object({
  url: z.string().min(1),
  width: z.number().optional(),
  height: z.number().optional(),
  sizeBytes: z.number().optional(),
  blurHash: z.string().optional(),
  isPrimary: z.boolean().optional()
});

export const riskFlagsSchema = z
  .object({
    criticalCondition: z.boolean().optional(),
    needsMedication: z.boolean().optional(),
    infectiousDisease: z.boolean().optional(),
    blindOrDeaf: z.boolean().optional(),
    disabledMobility: z.boolean().optional(),
    seniorPet: z.boolean().optional(),
    youngPet: z.boolean().optional(),
    inTrafficDangerZone: z.boolean().optional(),
    inExtremeWeather: z.boolean().optional()
  })
  .optional();

export const noticeCreateSchema = z.object({
  locale: localeSchema.default("zh-CN"),
  noticeCategory: noticeCategorySchema.default("lost-pet"),
  petProfile: petProfileSchema,
  lostInfo: z.object({
    lostTime: petLostTimeSchema,
    location: petLocationSchema
  }),
  contactMethods: z.array(contactMethodSchema).min(1),
  rewards: rewardsSchema,
  photos: z.array(photoSchema).max(3).default([]),
  riskFlags: riskFlagsSchema,
  ownerNotificationEmail: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().email().optional()
  )
});

export const noticeUpdateSchema = noticeCreateSchema.pick({
  locale: true,
  noticeCategory: true,
  petProfile: true,
  lostInfo: true,
  contactMethods: true,
  rewards: true,
  photos: true,
  riskFlags: true
});

export const statusUpdateSchema = z.object({
  businessStatus: businessStatusSchema
});

export const reportCreateSchema = z.object({
  reason: z.enum(["SCAM", "IMAGE_VIOLATION", "IRRELEVANT", "OTHER"])
});

export type NoticeCreateInput = z.infer<typeof noticeCreateSchema>;
export type NoticeUpdateInput = z.infer<typeof noticeUpdateSchema>;
