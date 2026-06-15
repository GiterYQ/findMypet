/**
 * Manage URL tests
 * 作用：验证匿名管理链接解析规则，保障“我的启事”手动导入不会保存无效凭证。
 * 联动：lib/manage/manage-url.ts、components/notice/ManageHistory.tsx。
 * 层级：test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { parseManageUrl } from "../lib/manage/manage-url.ts";

test("parseManageUrl extracts shortId and token from a full manage URL", () => {
  const parsed = parseManageUrl(" https://find.example/manage/PA-7K3M2?token=abc123&from=email ");

  assert.deepEqual(parsed, {
    shortId: "PA-7K3M2",
    manageToken: "abc123",
    manageUrl: "https://find.example/manage/PA-7K3M2?token=abc123"
  });
});

test("parseManageUrl accepts relative manage URLs with a caller-provided origin", () => {
  const parsed = parseManageUrl("/manage/PA-9Q2W1?token=token-value", "https://find.example");

  assert.deepEqual(parsed, {
    shortId: "PA-9Q2W1",
    manageToken: "token-value",
    manageUrl: "https://find.example/manage/PA-9Q2W1?token=token-value"
  });
});

test("parseManageUrl rejects public URLs and manage URLs without token", () => {
  assert.equal(parseManageUrl("https://find.example/notice/PA-7K3M2"), null);
  assert.equal(parseManageUrl("https://find.example/manage/PA-7K3M2"), null);
});
