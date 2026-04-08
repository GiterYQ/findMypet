/**
 * Notice schema
 * 作用：校验 notice 的输入输出结构，并锁死首版可编辑字段边界。
 * 联动：notice.types.ts、notice.service.ts、API routes、表单页面。
 * 层级：schema
 */
import { z } from "zod";

export const localeSchema = z.enum(["zh-CN", "en"]);
export const businessStatusSchema = z.enum(["active", "recovered", "closed"]);
export const activityStateSchema = z.enum(["fresh", "stale", "archived"]);

export const petProfileSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["dog", "cat", "bird", "other"]),
  breed: z.string().optional(),
  breedConfidence: z.number().min(0).max(1).optional(),
  color: z.array(z.string()).optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  ageText: z.string().optional(),
  bodySize: z.enum(["small", "medium", "large"]).optional(),
  neutered: z.enum(["yes", "no", "unknown"]).optional(),
  collar: z.string().optional(),
  leash: z.boolean().optional(),
  distinctiveFeatures: z.array(z.string()).optional(),
  healthNotes: z.string().optional(),
  description: z.string().optional()
});

export const petLostTimeSchema = z.object({
  precision: z.enum(["exact", "day", "range", "approx"]),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  displayText: z.string().optional(),
  timezone: z.string().min(1)
});

export const petLocationSchema = z.object({
  addressText: z.string().min(1),
  placeName: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  regionCode: z.string().optional(),
  privacyLevel: z.enum(["approximate", "exact"])
});

export const contactMethodSchema = z.object({
  type: z.enum(["phone", "sms", "whatsapp", "wechat", "telegram", "email", "other"]),
  value: z.string().min(1),
  label: z.string().optional(),
  isPrimary: z.boolean().optional(),
  visibility: z.enum(["public", "masked"])
});

export const rewardsSchema = z
  .object({
    clue: z
      .object({
        enabled: z.boolean(),
        amountMinor: z.number().int().nonnegative().optional(),
        currency: z.string().optional(),
        note: z.string().optional()
      })
      .optional(),
    recovery: z
      .object({
        enabled: z.boolean(),
        amountMinor: z.number().int().nonnegative().optional(),
        currency: z.string().optional(),
        note: z.string().optional()
      })
      .optional()
  })
  .optional();

export const photoSchema = z.object({
  url: z.string().url(),
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
  petProfile: petProfileSchema,
  lostInfo: z.object({
    lostTime: petLostTimeSchema,
    location: petLocationSchema
  }),
  contactMethods: z.array(contactMethodSchema).min(1),
  rewards: rewardsSchema,
  photos: z.array(photoSchema).min(1).max(3),
  riskFlags: riskFlagsSchema,
  ownerNotificationEmail: z.string().email().optional()
});

export const noticeUpdateSchema = noticeCreateSchema.pick({
  locale: true,
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

