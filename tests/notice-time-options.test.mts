/**
 * Notice time options tests
 * 作用：验证第三步时间说明使用预设选择项，避免用户手打时间描述。
 * 联动：lib/notice/notice-time-options.ts、components/notice/NoticeForm.tsx。
 * 层级：test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { getHalfHourTimeOptions, getNoticeTimeDisplayOptions } from "../lib/notice/notice-time-options.ts";

test("lost-pet time display options provide picker-friendly presets", () => {
  const values = getNoticeTimeDisplayOptions("lost-pet").map((option) => option.value);

  assert.ok(values.includes("今天上午"));
  assert.ok(values.includes("今天下午"));
  assert.ok(values.includes("昨晚"));
  assert.ok(values.includes("不确定"));
});

test("found-owner time display options use found-scene wording", () => {
  const values = getNoticeTimeDisplayOptions("found-owner").map((option) => option.value);

  assert.ok(values.includes("刚刚"));
  assert.ok(values.includes("今天下午"));
  assert.ok(values.includes("不确定"));
  assert.ok(!values.includes("昨晚"));
});

test("getHalfHourTimeOptions covers 24 hours in 30 minute steps", () => {
  const values = getHalfHourTimeOptions().map((option) => option.value);

  assert.equal(values.length, 48);
  assert.equal(values[0], "00:00");
  assert.equal(values[1], "00:30");
  assert.equal(values[24], "12:00");
  assert.equal(values[47], "23:30");
});
