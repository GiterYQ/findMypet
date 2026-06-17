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

test("NoticeForm exposes browser geolocation action for location fields", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /handleUseCurrentLocation/);
  assert.match(source, /navigator\.geolocation/);
  assert.match(source, /handleReverseGeocodeLocation/);
  assert.match(source, /\/api\/location\/reverse-geocode/);
  assert.match(source, /notice-location-tools/);
  assert.match(source, /notice-location-status/);
  assert.match(source, /privacyLevel:\s*"approximate"/);
});

test("NoticeForm offers manual structured address fallback when geocoding cannot resolve text", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /showManualLocationFields/);
  assert.match(source, /手动选择省市区街道/);
  assert.match(source, /setShowManualLocationFields\(true\)/);
  assert.match(source, /<select[\s\S]*id="province"/);
  assert.match(source, /<select[\s\S]*id="city"/);
  assert.match(source, /<select[\s\S]*id="district"/);
  assert.match(source, /loadChinaDivisionOptions/);
  assert.match(source, /level: "streets"/);
});

test("NoticeForm collapses nearby landmark behind an add button", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /showNearbyLandmark/);
  assert.match(source, /notice-landmark-toggle/);
  assert.match(source, /添加附近标志物/);
});

test("NoticeForm renders a live poster preview while editing", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /notice-live-preview/);
  assert.match(source, /实时预览/);
  assert.match(source, /previewLocationText/);
  assert.match(source, /notice-live-preview-media/);
  assert.match(source, /notice-preview-skeleton/);
});

test("NoticeForm labels exotic pets for the other pet type", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /<option value="other">异宠<\/option>/);
  assert.doesNotMatch(source, /<option value="other">其他<\/option>/);
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

test("globals.css styles location geolocation action", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-location-tools\s*{/);
  assert.match(source, /\.notice-location-button\s*{/);
  assert.match(source, /\.notice-location-status\s*{/);
  assert.match(source, /\.notice-manual-location-toggle\s*{/);
  assert.match(source, /\.notice-manual-location-grid\s*{/);
  assert.match(source, /\.notice-landmark-toggle\s*{/);
  assert.match(source, /\.notice-live-preview\s*{/);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-location-tools\s*{/);
});

test("globals.css keeps live preview compact and skeletonized", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-live-preview-card\s*{[^}]*min-height:\s*260px/s);
  assert.match(source, /\.notice-live-preview-card\s*{[^}]*max-height:\s*320px/s);
  assert.match(source, /\.notice-live-preview-media\s*{/);
  assert.match(source, /\.notice-preview-skeleton\s*{/);
  assert.match(source, /\.notice-preview-skeleton-line\s*{/);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview-card\s*{[^}]*min-height:\s*220px/s);
});

test("globals.css fixes live preview size to prevent layout jumping while typing", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-live-preview-card\s*{[^}]*height:\s*300px/s);
  assert.match(source, /\.notice-live-preview-card\s*{[^}]*grid-template-rows:\s*118px 86px 8px 42px/s);
  assert.match(source, /\.notice-live-preview-content\s*{[^}]*overflow:\s*hidden/s);
  assert.match(source, /\.notice-live-preview-card strong\s*{[^}]*-webkit-line-clamp:\s*1/s);
  assert.match(source, /\.notice-live-preview-card p\s*{[^}]*-webkit-line-clamp:\s*2/s);
  assert.match(source, /\.notice-live-preview-contact\s*{[^}]*height:\s*42px/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview-card\s*{[^}]*height:\s*248px/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview-card\s*{[^}]*grid-template-rows:\s*84px 70px 7px 38px/s);
});

test("globals.css keeps live preview before form columns on desktop and mobile", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-step-grid-with-preview\s*{[^}]*grid-template-columns:\s*minmax\(240px,\s*0\.68fr\) minmax\(0,\s*1fr\)/s);
  assert.match(source, /\.notice-step-grid-form-column\s*{[^}]*grid-column:\s*2/s);
  assert.match(source, /\.notice-live-preview\s*{[^}]*grid-column:\s*1/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview\s*{[^}]*order:\s*-1/s);
});

test("mine page uses compact mobile header instead of tall hero", async () => {
  const source = await readFile(new URL("../app/mine/page.tsx", import.meta.url), "utf8");

  assert.match(source, /compact-page-header/);
  assert.doesNotMatch(source, /className="hero"/);
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
