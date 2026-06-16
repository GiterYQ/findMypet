/**
 * Notice card thumbnail tests
 * 作用：锁定公开列表卡片的图片必须使用独立缩略图样式，避免复用大图样式导致列表占位过大。
 * 联动：components/notice/NoticeCard.tsx、app/globals.css。
 * 层级：test
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("NoticeCard uses dedicated thumbnail classes instead of generic large photo styles", async () => {
  const source = await readFile(new URL("../components/notice/NoticeCard.tsx", import.meta.url), "utf8");

  assert.match(source, /className="notice-card-photo-frame"/);
  assert.match(source, /className="notice-card-photo"/);
  assert.doesNotMatch(source, /className="notice-photo"/);
});

test("globals.css keeps public list thumbnails compact", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-card-photo-frame\s*{[^}]*width:\s*88px/s);
  assert.match(source, /\.notice-card-photo-frame\s*{[^}]*aspect-ratio:\s*1 \/ 1/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-card-photo-frame\s*{[^}]*width:\s*76px/s);
});
