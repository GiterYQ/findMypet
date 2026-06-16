/**
 * Poster template tests
 * 作用：验证海报模板参数归一化，保证 URL 模板切换稳定。
 * 联动：lib/notice/poster-template.ts、app/poster/[shortId]/page.tsx。
 * 层级：test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { getPosterTemplateHref, posterTemplateOptions, normalizePosterTemplate } from "../lib/notice/poster-template.ts";

test("normalizePosterTemplate accepts known poster templates", () => {
  assert.equal(normalizePosterTemplate("classic"), "classic");
  assert.equal(normalizePosterTemplate("alert"), "alert");
  assert.equal(normalizePosterTemplate("square"), "square");
});

test("normalizePosterTemplate falls back to classic for unknown values", () => {
  assert.equal(normalizePosterTemplate(undefined), "classic");
  assert.equal(normalizePosterTemplate("random"), "classic");
});

test("posterTemplateOptions exposes user-facing metadata for each template", () => {
  assert.deepEqual(
    posterTemplateOptions.map((template) => template.id),
    ["classic", "alert", "square"]
  );
  assert.ok(posterTemplateOptions.every((template) => template.label && template.useCase && template.aspectLabel));
});

test("getPosterTemplateHref keeps classic URL clean and adds query for other templates", () => {
  assert.equal(getPosterTemplateHref("abc123", "classic"), "/poster/abc123");
  assert.equal(getPosterTemplateHref("abc123", "alert"), "/poster/abc123?template=alert");
  assert.equal(getPosterTemplateHref("abc123", "square"), "/poster/abc123?template=square");
});
