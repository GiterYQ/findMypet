/**
 * Activity maintenance tests
 * 作用：验证 fresh/stale/archived 自动推进规则，避免旧启事长期占用首页。
 * 联动：lib/notice/activity-maintenance.ts、notice.service.ts、cron route。
 * 层级：test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { getNextActivityStateForMaintenance } from "../lib/notice/activity-maintenance.ts";

const now = new Date("2026-06-15T12:00:00.000Z");

function hoursAgo(hours: number) {
  return new Date(now.getTime() - hours * 3_600_000);
}

test("getNextActivityStateForMaintenance moves old fresh notices to stale", () => {
  assert.equal(getNextActivityStateForMaintenance("FRESH", hoursAgo(73), now), "STALE");
});

test("getNextActivityStateForMaintenance archives very old active notices", () => {
  assert.equal(getNextActivityStateForMaintenance("STALE", hoursAgo(337), now), "ARCHIVED");
});

test("getNextActivityStateForMaintenance keeps recent fresh notices unchanged", () => {
  assert.equal(getNextActivityStateForMaintenance("FRESH", hoursAgo(12), now), null);
});
