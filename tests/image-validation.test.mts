/**
 * Image validation tests
 * 作用：验证服务端图片魔数识别，避免匿名上传接口被伪装 MIME 滥用。
 * 联动：lib/media/image-validation.ts、app/api/uploads/images/route.ts。
 * 层级：test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { detectImageMimeType } from "../lib/media/image-validation.ts";

test("detectImageMimeType detects jpeg png and webp signatures", () => {
  assert.equal(detectImageMimeType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(detectImageMimeType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
  assert.equal(detectImageMimeType(Buffer.from("RIFFxxxxWEBP", "ascii")), "image/webp");
});

test("detectImageMimeType rejects svg or html content disguised as image upload", () => {
  assert.equal(detectImageMimeType(Buffer.from("<svg><script>alert(1)</script></svg>")), null);
  assert.equal(detectImageMimeType(Buffer.from("<!doctype html><html></html>")), null);
});
