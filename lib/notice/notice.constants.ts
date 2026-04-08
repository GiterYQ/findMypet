/**
 * Notice constants
 * 作用：集中定义时效阈值、refresh 冷却和排序风险权重。
 * 联动：notice.service.ts、定时任务、列表查询。
 * 层级：constants
 */
export const FRESH_WINDOW_HOURS = 72;
export const ARCHIVE_WINDOW_HOURS = 336;
export const REFRESH_COOLDOWN_HOURS = 12;

export const riskWeights = {
  criticalCondition: 120,
  needsMedication: 100,
  infectiousDisease: 60,
  blindOrDeaf: 50,
  disabledMobility: 50,
  seniorPet: 30,
  youngPet: 30,
  inTrafficDangerZone: 110,
  inExtremeWeather: 70
} as const;

