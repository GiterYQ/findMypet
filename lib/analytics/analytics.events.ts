/**
 * Analytics events
 * 作用：集中定义埋点事件名，避免页面和服务层各自发明命名。
 * 联动：页面提交、API 成功回调、后续 analytics provider。
 * 层级：constants
 */
export const analyticsEvents = {
  noticeCreateSubmitted: "notice_create_submitted",
  noticeCreated: "notice_created",
  noticeRefreshTriggered: "notice_refresh_triggered",
  noticeStatusUpdated: "notice_status_updated"
} as const;

