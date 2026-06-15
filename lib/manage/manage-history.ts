/**
 * Manage history
 * 作用：在浏览器本地保存匿名创建后的管理入口，降低用户丢失 manageUrl 的概率。
 * 联动：NoticeForm、ManageHistory、/mine 页面。
 * 层级：service
 */
export type ManagedNoticeEntry = {
  shortId: string;
  petName: string;
  noticeCategory: "lost-pet" | "found-owner";
  publicShareUrl: string;
  manageUrl: string;
  createdAt: string;
};

const STORAGE_KEY = "findMypet.managedNotices";
const MAX_ENTRIES = 20;

export function readManagedNotices(): ManagedNoticeEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveManagedNotice(entry: ManagedNoticeEntry) {
  if (typeof window === "undefined") {
    return false;
  }

  const current = readManagedNotices();
  const deduped = current.filter((item) => item.shortId !== entry.shortId);
  const nextEntries = [entry, ...deduped].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
    return true;
  } catch {
    return false;
  }
}

export function removeManagedNotice(shortId: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const nextEntries = readManagedNotices().filter((item) => item.shortId !== shortId);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
    return true;
  } catch {
    return false;
  }
}
