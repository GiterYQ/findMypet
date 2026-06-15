/**
 * App URL tests
 * 作用：验证本地手机试用与生产环境下的站点 base URL 选择规则。
 * 联动：lib/core/app-url.ts、app/api/notices/route.ts、notice.service.ts。
 * 层级：test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { resolveAppBaseUrl } from "../lib/core/app-url.ts";

test("resolveAppBaseUrl prefers request origin for mobile LAN testing in development", () => {
  const result = resolveAppBaseUrl({
    requestOrigin: "http://192.168.1.8:3000",
    configuredBaseUrl: "http://localhost:3000",
    nodeEnv: "development"
  });

  assert.equal(result, "http://192.168.1.8:3000");
});

test("resolveAppBaseUrl keeps configured public URL in production", () => {
  const result = resolveAppBaseUrl({
    requestOrigin: "http://10.0.0.2:3000",
    configuredBaseUrl: "https://find.example.com/",
    nodeEnv: "production"
  });

  assert.equal(result, "https://find.example.com");
});

test("resolveAppBaseUrl falls back to localhost when no input is available", () => {
  assert.equal(resolveAppBaseUrl({}), "http://localhost:3000");
});
