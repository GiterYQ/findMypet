/**
 * NoticeAlertPoster
 * 作用：渲染强告示风格海报模板，突出当前状态、地点、悬赏、联系方式和行动指令。
 * 联动：poster 页面、notice-display.ts、poster-template.ts。
 * 层级：component
 */
import {
  getBusinessStatusLabel,
  getContactDisplayValue,
  getContactTypeLabel,
  getNoticeCategoryLabel,
  getPetTypeDisplayName,
  getPosterAddressLine,
  getRiskFlagLabels,
  getTimeFieldLabel
} from "@/lib/notice/notice-display";
import { type PublicNoticePayload } from "@/lib/notice/notice.types";

type NoticeAlertPosterProps = {
  notice: PublicNoticePayload;
  id?: string;
  className?: string;
};

function formatReward(amountMinor?: number, currency?: string) {
  if (!amountMinor || !currency) {
    return "无悬赏";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountMinor / 100);
}

function getRewardLine(notice: PublicNoticePayload) {
  const clueReward = formatReward(notice.rewards?.clue?.amountMinor, notice.rewards?.clue?.currency);
  const recoveryReward = formatReward(notice.rewards?.recovery?.amountMinor, notice.rewards?.recovery?.currency);

  if (clueReward === "无悬赏" && recoveryReward === "无悬赏") {
    return "提供线索请尽快联系";
  }

  if (clueReward !== "无悬赏" && recoveryReward !== "无悬赏") {
    return `线索 ${clueReward} / 找回 ${recoveryReward}`;
  }

  return recoveryReward !== "无悬赏" ? `找回奖励 ${recoveryReward}` : `线索奖励 ${clueReward}`;
}

export function NoticeAlertPoster({ notice, id, className }: NoticeAlertPosterProps) {
  const riskTags = getRiskFlagLabels(notice.riskFlags);
  const primaryContact = notice.contactMethods.find((item) => item.isPrimary) ?? notice.contactMethods[0];
  const statusLabel = getBusinessStatusLabel(notice.businessStatus, notice.noticeCategory);
  const commandLine = notice.noticeCategory === "found-owner" ? "见过主人请立即联系" : "见到或有线索请立即联系";
  const petTypeDisplayName = getPetTypeDisplayName(notice.petProfile);
  const detailLine = notice.petProfile.description || `${petTypeDisplayName}，${statusLabel}，请扩散。`;
  const posterAddressLine = getPosterAddressLine(notice.lostInfo.location);

  return (
    <article className={className ? `poster-alert ${className}` : "poster-alert"} id={id}>
      <header className="poster-alert-header">
        <div className="poster-alert-title">警示</div>
        <div className="poster-alert-side">
          <span>{getNoticeCategoryLabel(notice.noticeCategory)}</span>
          <span>{statusLabel}</span>
        </div>
      </header>

      <section className="poster-alert-identity">
        <div>
          <p>目标</p>
          <h1>{notice.petProfile.name}</h1>
        </div>
        <div>
          <p>类型</p>
          <strong>{petTypeDisplayName}</strong>
        </div>
      </section>

      <section className="poster-alert-statement">
        <span>{getTimeFieldLabel(notice.noticeCategory)}：{notice.lostInfo.lostTime.displayText ?? "待确认"}</span>
        <strong>{posterAddressLine}</strong>
        <b>{getRewardLine(notice)}</b>
      </section>

      <section className="poster-alert-media">
        <div className="poster-alert-blue">
          <strong>{commandLine}</strong>
          <span>{detailLine}</span>
          {riskTags.length > 0 ? <em>{riskTags.slice(0, 4).join(" / ")}</em> : <em>以分享页最新状态为准</em>}
        </div>

        <div className="poster-alert-photo">
          {notice.primaryPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={notice.petProfile.name} src={notice.primaryPhotoUrl} />
          ) : (
            <span>宠物照片</span>
          )}
        </div>
      </section>

      {primaryContact ? (
        <section className="poster-alert-contact">
          <span>{getContactTypeLabel(primaryContact.type)}</span>
          <strong>{getContactDisplayValue(primaryContact)}</strong>
        </section>
      ) : null}

      <footer className="poster-alert-footer">
        <strong>请勿提前转账，先核实宠物或主人信息。</strong>
        <span>请以分享页最新状态为准 · 更新于 {new Date(notice.updatedAt).toLocaleString()}</span>
      </footer>
    </article>
  );
}
