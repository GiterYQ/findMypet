/**
 * README project docs tests
 * 作用：锁定项目交接文档必须包含结构、部署、开源协作和微信公众号接入方向。
 * 联动：README.md、ROADMAP.md、progress.md。
 * 层级：test
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("README documents project structure production checklist and WeChat direction", async () => {
  const source = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(source, /## 目录结构/);
  assert.match(source, /## 开源协作/);
  assert.match(source, /ROADMAP\.md/);
  assert.match(source, /CONTRIBUTING\.md/);
  assert.match(source, /SECURITY\.md/);
  assert.match(source, /LICENSE/);
  assert.match(source, /## 生产部署清单/);
  assert.match(source, /## 微信公众号接入方向/);
  assert.match(source, /PostgreSQL/);
  assert.match(source, /对象存储/);
  assert.match(source, /HTTPS/);
  assert.match(source, /匿名管理链接/);
  assert.match(source, /REVERSE_GEOCODE_ENDPOINT/);
  assert.match(source, /reverse geocode/);
});
