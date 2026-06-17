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

test("NoticeForm lets users jump between form steps from the stepper", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /notice-step-pill/);
  assert.match(source, /type="button"/);
  assert.match(source, /onClick=\{\(\) => setActiveStepIndex\(index\)\}/);
  assert.match(source, /aria-label=\{`跳转到第 \$\{index \+ 1\} 步/);
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

test("NoticeForm keeps stepper header copy in a stable row structure", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /notice-stepper-title-row/);
  assert.match(source, /notice-stepper-summary/);
  assert.match(source, /notice-step-required-summary/);
  assert.match(source, /<strong>\{activeStep\.title\}<\/strong>[\s\S]*<span className="notice-stepper-summary">\{activeStep\.summary\}<\/span>/);
  assert.doesNotMatch(source, /activeStep\.skippable \? <p>/);
  assert.doesNotMatch(source, /这一步可不填，直接点下一步。/);
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

test("NoticeForm places pet name and type in one desktop row", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /notice-pet-identity-grid/);
  assert.match(source, /isFieldVisible\("petName"\) \|\| isFieldVisible\("petType"\)/);
  assert.match(source, /isFieldVisible\("petName"\)[\s\S]*isFieldVisible\("petType"\)/);
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
  assert.match(source, /手动选择位置/);
  assert.match(source, /setShowManualLocationFields\(true\)/);
  assert.match(source, /<select[\s\S]*id="province"/);
  assert.match(source, /<select[\s\S]*id="city"/);
  assert.match(source, /<select[\s\S]*id="district"/);
  assert.match(source, /loadChinaDivisionOptions/);
  assert.match(source, /level: "streets"/);
  assert.match(source, /位置识别失败，请手动输入位置。/);
  assert.match(source, /aria-label="选择省份"/);
  assert.match(source, /aria-label="选择城市"/);
  assert.match(source, /aria-label="选择区县"/);
  assert.match(source, /aria-label="填写街道或乡镇"/);
  assert.doesNotMatch(source, /已获取坐标/);
  assert.doesNotMatch(source, /无法获取当前位置/);
  assert.doesNotMatch(source, /当前浏览器不支持定位/);
  assert.doesNotMatch(source, /renderFieldLabel\("addressText", "省\/直辖市"/);
  assert.doesNotMatch(source, /renderFieldLabel\("addressText", "市"/);
  assert.doesNotMatch(source, /renderFieldLabel\("addressText", "区\/县"/);
  assert.match(source, /notice-location-choice-row/);
  assert.match(source, /notice-manual-location-panel/);
  assert.doesNotMatch(source, /省市区街道使用本地公开行政区划数据/);
});

test("NoticeForm collapses nearby landmark behind an add button", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /showNearbyLandmark/);
  assert.match(source, /notice-landmark-toggle/);
  assert.match(source, /添加附近标志物/);
  assert.match(source, /取消附近标志物/);
  assert.match(source, /setShowNearbyLandmark\(false\)/);
  assert.match(source, /nearbyLandmark: ""/);
});

test("NoticeForm renders a live poster preview while editing", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /notice-live-preview/);
  assert.match(source, /实时预览/);
  assert.match(source, /previewLocationText/);
  assert.match(source, /notice-live-preview-media/);
  assert.match(source, /notice-preview-skeleton/);
  assert.match(source, /notice-live-preview-title-row/);
  assert.match(source, /notice-live-preview-location/);
  assert.match(source, /notice-live-preview-contact-label/);
});

test("NoticeForm keeps uploaded photo previews as small thumbnails", async () => {
  const formSource = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");
  const styleSource = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(formSource, /notice-upload-preview-grid/);
  assert.match(formSource, /className="notice-upload-preview-photo"/);
  assert.doesNotMatch(formSource, /className="notice-photo"/);
  assert.match(styleSource, /\.notice-upload-preview-grid\s*{/);
  assert.match(styleSource, /\.notice-upload-preview-grid\s*{[^}]*grid-template-columns:\s*repeat\(auto-fit,\s*96px\)/s);
  assert.match(styleSource, /\.notice-upload-preview-photo\s*{[^}]*height:\s*96px/s);
  assert.match(styleSource, /\.notice-upload-preview-photo\s*{[^}]*width:\s*96px/s);
  assert.match(styleSource, /\.notice-upload-preview-photo\s*{[^}]*object-fit:\s*cover/s);
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

test("globals.css fixes current task context height across all steps", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-step-context\s*{[^}]*min-height:\s*64px/s);
  assert.match(source, /\.notice-step-context > div:first-child\s*{[^}]*min-width:\s*0/s);
  assert.match(source, /\.notice-step-context strong\s*{[^}]*overflow:\s*hidden/s);
  assert.match(source, /\.notice-step-context strong\s*{[^}]*text-overflow:\s*ellipsis/s);
  assert.match(source, /\.notice-step-context strong\s*{[^}]*white-space:\s*nowrap/s);
  assert.match(source, /\.notice-step-context-meter\s*{[^}]*min-height:\s*26px/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-step-context\s*{[^}]*min-height:\s*96px/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-step-context strong\s*{[^}]*white-space:\s*nowrap/s);
});

test("globals.css fixes stepper header height and inline title copy", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-stepper-header\s*{[^}]*align-items:\s*center/s);
  assert.match(source, /\.notice-stepper-header\s*{[^}]*min-height:\s*56px/s);
  assert.match(source, /\.notice-stepper-title-row\s*{[^}]*align-items:\s*baseline/s);
  assert.match(source, /\.notice-stepper-title-row\s*{[^}]*grid-template-columns:\s*auto minmax\(0,\s*1fr\)/s);
  assert.match(source, /\.notice-stepper-summary\s*{[^}]*color:\s*var\(--muted\)/s);
  assert.match(source, /\.notice-stepper-summary\s*{[^}]*white-space:\s*nowrap/s);
  assert.match(source, /\.notice-step-required-summary\s*{[^}]*min-height:\s*20px/s);
});

test("globals.css styles location geolocation action", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-location-choice-row\s*{/);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-location-choice-row\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(source, /\.notice-location-tools\s*{/);
  assert.match(source, /\.notice-location-button\s*{/);
  assert.match(source, /\.notice-location-status\s*{/);
  assert.match(source, /\.notice-manual-location-toggle\s*{/);
  assert.match(source, /\.notice-manual-location-panel\s*{/);
  assert.match(source, /\.notice-manual-location-panel-open\s*{/);
  assert.match(source, /\.notice-manual-location-grid\s*{/);
  assert.match(source, /\.notice-manual-location-grid\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(source, /@media \(min-width: 761px\) and \(max-width: 980px\)[\s\S]*\.notice-manual-location-grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(source, /\.notice-landmark-toggle\s*{/);
  assert.match(source, /\.notice-live-preview\s*{/);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-location-tools\s*{/);
});

test("globals.css keeps desktop form preview wide enough for web review", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /scrollbar-gutter:\s*stable/);
  assert.match(source, /\.app-shell\s*{[^}]*width:\s*min\(1760px,\s*calc\(100% - 32px\)\)/s);
  assert.match(source, /\.notice-step-grid-with-preview\s*{[^}]*grid-template-columns:\s*minmax\(560px,\s*0\.92fr\) minmax\(0,\s*1fr\)/s);
  assert.match(source, /\.notice-live-preview\s*{[^}]*width:\s*100%/s);
  assert.match(source, /\.notice-live-preview-card\s*{[^}]*width:\s*100%/s);
  assert.doesNotMatch(source, /\.notice-live-preview\s*{[^}]*width:\s*320px/s);
  assert.doesNotMatch(source, /\.notice-live-preview-card\s*{[^}]*width:\s*320px/s);
});

test("globals.css keeps live preview large and skeletonized on desktop", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-live-preview-card\s*{[^}]*min-height:\s*540px/s);
  assert.match(source, /\.notice-live-preview-card\s*{[^}]*max-height:\s*580px/s);
  assert.match(source, /\.notice-live-preview-media\s*{/);
  assert.match(source, /\.notice-preview-skeleton\s*{/);
  assert.match(source, /\.notice-preview-skeleton-line\s*{/);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview-card\s*{[^}]*min-height:\s*320px/s);
});

test("globals.css fixes live preview size to prevent layout jumping while typing", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-live-preview\s*{[^}]*width:\s*100%/s);
  assert.match(source, /\.notice-live-preview\s*{[^}]*justify-self:\s*start/s);
  assert.match(source, /\.notice-live-preview-card\s*{[^}]*height:\s*560px/s);
  assert.match(source, /\.notice-live-preview-card\s*{[^}]*width:\s*100%/s);
  assert.match(source, /\.notice-live-preview-card\s*{[^}]*grid-template-rows:\s*286px 146px 8px 54px/s);
  assert.match(source, /\.notice-live-preview-content\s*{[^}]*overflow:\s*hidden/s);
  assert.match(source, /\.notice-live-preview-title-row\s*{/);
  assert.match(source, /\.notice-live-preview-location\s*{/);
  assert.match(source, /\.notice-live-preview-card strong\s*{[^}]*-webkit-line-clamp:\s*1/s);
  assert.match(source, /\.notice-live-preview-location\s*{[^}]*-webkit-line-clamp:\s*3/s);
  assert.match(source, /\.notice-live-preview-contact\s*{[^}]*height:\s*54px/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview\s*{[^}]*width:\s*100%/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview-card\s*{[^}]*height:\s*340px/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview-card\s*{[^}]*width:\s*100%/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview-card\s*{[^}]*grid-template-rows:\s*140px 110px 5px 40px/s);
});

test("globals.css keeps live preview before form columns on desktop and mobile", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-step-grid-with-preview\s*{[^}]*grid-template-columns:\s*minmax\(560px,\s*0\.92fr\) minmax\(0,\s*1fr\)/s);
  assert.match(source, /\.notice-step-grid-form-column\s*{[^}]*grid-column:\s*2/s);
  assert.match(source, /\.notice-live-preview\s*{[^}]*grid-column:\s*1/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-live-preview\s*{[^}]*order:\s*-1/s);
});

test("globals.css places pet identity fields in one row on desktop", async () => {
  const source = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.notice-pet-identity-grid\s*{/);
  assert.match(source, /\.notice-pet-identity-grid\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) minmax\(180px,\s*0\.72fr\)/s);
  assert.match(source, /@media \(max-width: 760px\)[\s\S]*\.notice-pet-identity-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
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
