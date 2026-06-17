/**
 * Pet type labels tests
 * 作用：锁定宠物类型展示文案，避免内部 other 枚举直接展示成含糊的“其他”。
 * 联动：lib/notice/notice-display.ts、components/notice/NoticeFilters.tsx、NoticeForm。
 * 层级：test
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("notice-display renders other pet type as exotic pets", async () => {
  const source = await readFile(new URL("../lib/notice/notice-display.ts", import.meta.url), "utf8");

  assert.match(source, /other: "异宠"/);
  assert.doesNotMatch(source, /other: "其他"/);
});

test("NoticeFilters uses exotic pet copy for other pet type", async () => {
  const source = await readFile(new URL("../components/notice/NoticeFilters.tsx", import.meta.url), "utf8");

  assert.match(source, /value: "other", label: "异宠"/);
  assert.doesNotMatch(source, /value: "other", label: "其他"/);
});
