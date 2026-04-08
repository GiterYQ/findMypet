/**
 * I18n constants
 * 作用：集中管理首版稳定文案 key 和默认文案回退值。
 * 联动：lib/i18n/t.ts、app 页面、notice mapper 与错误模板。
 * 层级：constants
 */
export const messages = {
  "app.title": {
    "zh-CN": "findMypet 寻宠工具",
    en: "findMypet"
  },
  "notice.create.title": {
    "zh-CN": "快速生成寻宠启事",
    en: "Create a lost pet notice fast"
  },
  "notice.create.subtitle": {
    "zh-CN": "上传照片、填写信息、生成海报与分享页。",
    en: "Upload photos, fill details, and generate a poster plus hosted page."
  },
  "notice.poster.antiScam": {
    "zh-CN": "防骗提示：未核实前，请勿提前支付任何费用。",
    en: "Safety tip: never send money before the pet is verified."
  }
} as const;

export type MessageKey = keyof typeof messages;

