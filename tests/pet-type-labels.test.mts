/**
 * Pet type labels tests
 * 作用：锁定宠物类型展示文案，避免内部 other 枚举直接展示成含糊的“其他”。
 * 联动：lib/notice/notice-display.ts、components/notice/NoticeFilters.tsx、NoticeForm。
 * 层级：test
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getPetTypeDisplayName } from "../lib/notice/notice-display.ts";

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

test("pet type display prefers custom type for exotic pets", () => {
  assert.equal(getPetTypeDisplayName({ type: "other", customType: "兔子" }), "兔子");
  assert.equal(getPetTypeDisplayName({ type: "other" }), "异宠");
  assert.equal(getPetTypeDisplayName({ type: "cat", customType: "兔子" }), "猫");
});

test("NoticeForm asks for custom pet type when other is selected", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /customType/);
  assert.match(source, /具体宠物类型/);
  assert.match(source, /例如：兔子、仓鼠、乌龟、蜥蜴/);
});

test("NoticeFilters explains filters apply to this site's public notices", async () => {
  const source = await readFile(new URL("../components/notice/NoticeFilters.tsx", import.meta.url), "utf8");

  assert.match(source, /筛选本站已发布的公开启事/);
  assert.match(source, /不是抓取外部平台帖子/);
});

test("NoticeFilters displays readable region labels while submitting region codes", async () => {
  const source = await readFile(new URL("../components/notice/NoticeFilters.tsx", import.meta.url), "utf8");

  assert.match(source, /RegionFilterOption/);
  assert.match(source, /regionOption\.code/);
  assert.match(source, /regionOption\.label/);
});
