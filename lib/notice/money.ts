/**
 * Money utilities
 * 作用：统一处理展示金额与内部最小货币单位之间的转换，避免悬赏金额错存。
 * 联动：NoticeForm、海报模板、tests/money.test.mts。
 * 层级：utility
 */
const maxRewardAmountMinor = 10_000_000;

export function majorAmountInputToMinor(input: string) {
  const amountMajor = Number(input.trim());

  if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
    return 0;
  }

  return Math.min(Math.round(amountMajor * 100), maxRewardAmountMinor);
}

export function minorAmountToMajorInput(amountMinor?: number) {
  if (!amountMinor || amountMinor <= 0) {
    return "";
  }

  return (amountMinor / 100).toFixed(2).replace(/\.00$/, "");
}

export function formatAmountMinorForDisplay(amountMinor?: number, currency = "CNY") {
  if (!amountMinor || amountMinor <= 0) {
    return "未设置";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: amountMinor % 100 === 0 ? 0 : 2
  }).format(amountMinor / 100);
}
