/**
 * Activity maintenance
 * 作用：集中计算 notice 活跃状态的自动推进规则。
 * 联动：notice.constants.ts、notice.service.ts、cron activity route、tests/activity-maintenance.test.mts。
 * 层级：domain utility
 */
import { ARCHIVE_WINDOW_HOURS, FRESH_WINDOW_HOURS } from "./notice.constants.ts";

export type PersistedActivityState = "FRESH" | "STALE" | "ARCHIVED";

export function getNextActivityStateForMaintenance(currentState: PersistedActivityState, lastRefreshedAt: Date, now = new Date()): PersistedActivityState | null {
  const elapsedHours = (now.getTime() - lastRefreshedAt.getTime()) / 3_600_000;

  if (elapsedHours > ARCHIVE_WINDOW_HOURS && currentState !== "ARCHIVED") {
    return "ARCHIVED";
  }

  if (elapsedHours > FRESH_WINDOW_HOURS && currentState === "FRESH") {
    return "STALE";
  }

  return null;
}

export function getActivityMaintenanceCutoffs(now = new Date()) {
  return {
    staleBefore: new Date(now.getTime() - FRESH_WINDOW_HOURS * 3_600_000),
    archiveBefore: new Date(now.getTime() - ARCHIVE_WINDOW_HOURS * 3_600_000)
  };
}
