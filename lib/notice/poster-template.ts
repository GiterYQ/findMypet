/**
 * Poster template
 * 作用：定义海报模板 ID 与 URL 参数归一化规则。
 * 联动：poster 页面、NoticePoster、NoticeAlertPoster、NoticeSquarePoster、tests/poster-template.test.mts。
 * 层级：utility
 */
export const posterTemplateIds = ["classic", "alert", "square"] as const;

export type PosterTemplateId = (typeof posterTemplateIds)[number];

export type PosterTemplateOption = {
  id: PosterTemplateId;
  label: string;
  useCase: string;
  aspectLabel: string;
};

export type PosterTemplateHref = `/poster/${string}` | `/poster/${string}?template=${Exclude<PosterTemplateId, "classic">}`;

export const posterTemplateOptions: PosterTemplateOption[] = [
  {
    id: "classic",
    label: "经典模板",
    useCase: "适合打印、张贴和普通社区群转发",
    aspectLabel: "通用竖版"
  },
  {
    id: "alert",
    label: "警示模板",
    useCase: "适合紧急扩散、强提醒、需要一眼看到重点",
    aspectLabel: "强告示版"
  },
  {
    id: "square",
    label: "方图模板",
    useCase: "适合微信聊天、朋友圈、公众号文章配图",
    aspectLabel: "1:1 方图"
  }
];

export function normalizePosterTemplate(value?: string | null): PosterTemplateId {
  return posterTemplateIds.includes(value as PosterTemplateId) ? (value as PosterTemplateId) : "classic";
}

export function getPosterTemplateHref(shortId: string, templateId: PosterTemplateId): PosterTemplateHref {
  const encodedShortId = encodeURIComponent(shortId);

  if (templateId === "classic") {
    return `/poster/${encodedShortId}`;
  }

  return `/poster/${encodedShortId}?template=${templateId}`;
}
