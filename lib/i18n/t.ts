/**
 * t
 * 作用：提供统一的本地化文案读取入口，避免 UI 直接拼接字符串。
 * 联动：lib/i18n/i18n.constants.ts、app 页面、错误模板。
 * 层级：service
 */
import { messages, type MessageKey } from "@/lib/i18n/i18n.constants";

export type AppLocale = "zh-CN" | "en";

export function t(key: MessageKey, fallback: string, locale: AppLocale = "zh-CN") {
  return messages[key]?.[locale] ?? fallback;
}

