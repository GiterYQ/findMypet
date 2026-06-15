/**
 * Poster template
 * 作用：定义海报模板 ID 与 URL 参数归一化规则。
 * 联动：poster 页面、NoticePoster、NoticeAlertPoster、tests/poster-template.test.mts。
 * 层级：utility
 */
export const posterTemplateIds = ["classic", "alert"] as const;

export type PosterTemplateId = (typeof posterTemplateIds)[number];

export function normalizePosterTemplate(value?: string | null): PosterTemplateId {
  return posterTemplateIds.includes(value as PosterTemplateId) ? (value as PosterTemplateId) : "classic";
}
