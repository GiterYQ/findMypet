/**
 * Notice email service tests
 * 作用：验证管理链接邮件发送失败不会拖垮启事创建链路。
 * 联动：lib/notice/notice-email.service.ts、notice.service.ts。
 * 层级：test
 */
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { sendManageLinkEmail } from "../lib/notice/notice-email.service.ts";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.RESEND_API_KEY;
const originalFromEmail = process.env.RESEND_FROM_EMAIL;
const originalWarn = console.warn;

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.RESEND_API_KEY = originalApiKey;
  process.env.RESEND_FROM_EMAIL = originalFromEmail;
  console.warn = originalWarn;
});

test("sendManageLinkEmail returns FAILED instead of throwing when provider request rejects", async () => {
  process.env.RESEND_API_KEY = "test-api-key";
  process.env.RESEND_FROM_EMAIL = "Find My Pet <notice@example.com>";
  globalThis.fetch = (() => Promise.reject(new Error("network unavailable"))) as typeof fetch;
  console.warn = (() => undefined) as typeof console.warn;

  const result = await sendManageLinkEmail({
    email: "owner@example.com",
    shortId: "PA-7K3M2",
    manageUrl: "https://find.example/manage/PA-7K3M2?token=abc",
    publicShareUrl: "https://find.example/notice/PA-7K3M2"
  });

  assert.equal(result.status, "FAILED");
});
