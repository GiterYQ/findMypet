/**
 * Notice form required UI tests
 * 作用：锁定创建表单必须把“必填/可选”明确展示出来，降低首步填写压力。
 * 联动：components/notice/NoticeForm.tsx、app/globals.css、notice-form-steps.ts。
 * 层级：test
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("NoticeForm renders step required summary and field requirement badges", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /getNoticeFormRequiredSummary/);
  assert.match(source, /notice-field-badge/);
  assert.match(source, /isNoticeFormFieldRequired/);
});

test("NoticeForm renders mobile step context summary", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /notice-step-context/);
  assert.match(source, /notice-step-context-meter/);
  assert.match(source, /notice-step-context-stat/);
  assert.match(source, /notice-optional-divider/);
  assert.match(source, /activeStep\.goal/);
  assert.match(source, /activeStep\.estimate/);
});

test("NoticeForm renders required essentials before optional pet details", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");
  const addressIndex = source.indexOf('isFieldVisible("addressText")');
  const contactIndex = source.indexOf('isFieldVisible("contact")');
  const petNameIndex = source.indexOf('isFieldVisible("petName")');
  const petTypeIndex = source.indexOf('isFieldVisible("petType")');

  assert.notEqual(addressIndex, -1);
  assert.notEqual(contactIndex, -1);
  assert.notEqual(petNameIndex, -1);
  assert.notEqual(petTypeIndex, -1);
  assert.ok(addressIndex < petNameIndex);
  assert.ok(contactIndex < petNameIndex);
  assert.ok(contactIndex < petTypeIndex);
});

test("globals.css styles field requirement badges", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-field-label\s*{/);
  assert.match(source, /\.notice-field-badge\s*{/);
  assert.match(source, /\.notice-field-badge-required\s*{/);
  assert.match(source, /\.notice-field-badge-optional\s*{/);
});

test("globals.css styles mobile step context summary", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-step-context\s*{/);
  assert.match(source, /\.notice-step-context-meter\s*{/);
  assert.match(source, /\.notice-step-context-stat\s*{/);
  assert.match(source, /\.notice-optional-divider\s*{/);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-step-context\s*{/);
});

test("home page exposes mobile app chrome classes", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(source, /className="shell app-shell"/);
  assert.match(source, /className="mobile-app-bar"/);
  assert.match(source, /className="mobile-bottom-tabs"/);
});

test("globals.css has mobile-only app chrome styles", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.mobile-app-bar\s*{/);
  assert.match(source, /\.mobile-bottom-tabs\s*{/);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.mobile-app-bar\s*{[^}]*display:\s*flex/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.hero\s*{[^}]*display:\s*none/s);
});

test("globals.css covers compact standard large and Pro Max landscape iPhone viewports", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /@media \(max-width: 360px\)/);
  assert.match(source, /@media \(min-width: 361px\) and \(max-width: 430px\)/);
  assert.match(source, /@media \(min-width: 431px\) and \(max-width: 760px\)/);
  assert.match(source, /@media \(max-width: 760px\) and \(max-height: 700px\)/);
  assert.match(source, /@media \(max-width: 960px\) and \(orientation: landscape\)/);
});

test("globals.css keeps tiny iPhones from being covered by stacked fixed controls", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /@media \(max-width: 360px\)[\s\S]*\.notice-step-actions\s*{[^}]*position:\s*static/s);
  assert.match(source, /@media \(max-width: 760px\) and \(max-height: 700px\)[\s\S]*\.notice-step-actions\s*{[^}]*position:\s*static/s);
  assert.match(source, /@media \(max-width: 960px\) and \(orientation: landscape\)[\s\S]*\.mobile-bottom-tabs\s*{[^}]*display:\s*none/s);
});
