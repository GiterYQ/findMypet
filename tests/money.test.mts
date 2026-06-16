/**
 * Money tests
 * 作用：验证金额输入展示与内部最小货币单位之间的转换，避免悬赏金额错存。
 * 联动：lib/notice/money.ts、components/notice/NoticeForm.tsx。
 * 层级：test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { formatAmountMinorForDisplay, majorAmountInputToMinor, minorAmountToMajorInput } from "../lib/notice/money.ts";

test("majorAmountInputToMinor stores yuan input as cents", () => {
  assert.equal(majorAmountInputToMinor("500"), 50_000);
  assert.equal(majorAmountInputToMinor("88.88"), 8_888);
  assert.equal(majorAmountInputToMinor(""), 0);
  assert.equal(majorAmountInputToMinor("-1"), 0);
});

test("minorAmountToMajorInput displays stored cents as yuan input", () => {
  assert.equal(minorAmountToMajorInput(50_000), "500");
  assert.equal(minorAmountToMajorInput(8_888), "88.88");
  assert.equal(minorAmountToMajorInput(0), "");
});

test("formatAmountMinorForDisplay formats review copy", () => {
  assert.equal(formatAmountMinorForDisplay(50_000, "CNY"), "¥500");
  assert.equal(formatAmountMinorForDisplay(0, "CNY"), "未设置");
});
