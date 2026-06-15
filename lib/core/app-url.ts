/**
 * App URL
 * 作用：统一选择站点 base URL，兼容生产公开域名与本地手机局域网试用。
 * 联动：app/api/notices/route.ts、notice.service.ts、tests/app-url.test.mts。
 * 层级：utility
 */
type ResolveAppBaseUrlInput = {
  requestOrigin?: string;
  configuredBaseUrl?: string;
  nodeEnv?: string;
};

function normalizeOrigin(value?: string) {
  if (!value?.trim()) {
    return undefined;
  }

  try {
    return new URL(value.trim()).origin;
  } catch {
    return undefined;
  }
}

function isLocalhostOrigin(origin?: string) {
  if (!origin) {
    return false;
  }

  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

export function resolveAppBaseUrl({ requestOrigin, configuredBaseUrl, nodeEnv = process.env.NODE_ENV }: ResolveAppBaseUrlInput) {
  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);
  const normalizedConfiguredBaseUrl = normalizeOrigin(configuredBaseUrl);

  // 本地手机试用时，浏览器请求来自局域网 IP；继续使用 localhost 会让手机打不开分享/管理链接。
  if (nodeEnv !== "production" && normalizedRequestOrigin && isLocalhostOrigin(normalizedConfiguredBaseUrl)) {
    return normalizedRequestOrigin;
  }

  return normalizedConfiguredBaseUrl ?? normalizedRequestOrigin ?? "http://localhost:3000";
}
