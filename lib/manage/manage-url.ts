/**
 * Manage URL
 * 作用：解析匿名管理链接，供本地管理记录、邮箱回链和管理页自保存复用。
 * 联动：components/notice/ManageHistory.tsx、components/notice/ManageConsole.tsx、tests/manage-url.test.ts。
 * 层级：utility
 */
export type ParsedManageUrl = {
  shortId: string;
  manageToken: string;
  manageUrl: string;
};

const MANAGE_PATH_PREFIX = "manage";

export function parseManageUrl(rawValue: string, origin = "http://localhost:3000"): ParsedManageUrl | null {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(trimmedValue, origin);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const shortId = decodeURIComponent(pathSegments[1] ?? "").trim();
    const manageToken = url.searchParams.get("token")?.trim();

    // 管理链接必须是 /manage/:shortId?token=xxx，公开分享页不能获得编辑权限。
    if (pathSegments.length !== 2 || pathSegments[0] !== MANAGE_PATH_PREFIX || !shortId || !manageToken) {
      return null;
    }

    return {
      shortId,
      manageToken,
      manageUrl: `${url.origin}/manage/${encodeURIComponent(shortId)}?token=${encodeURIComponent(manageToken)}`
    };
  } catch {
    return null;
  }
}
