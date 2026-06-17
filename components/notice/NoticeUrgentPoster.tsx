/**
 * NoticeUrgentPoster
 * 作用：渲染危急大字海报模板，突出病危、需喂药、失明、交通危险等立即行动信息。
 * 联动：poster 页面、poster-template.ts、notice-display.ts。
 * 层级：component
 */
import {
  getContactDisplayValue,
  getContactTypeLabel,
  getNoticeCategoryLabel,
  getPetTypeLabel,
  getPosterAddressLine,
  getRiskFlagLabels,
  getTimeFieldLabel
} from "@/lib/notice/notice-display";
import { type PublicNoticePayload } from "@/lib/notice/notice.types";

type NoticeUrgentPosterProps = {
  notice: PublicNoticePayload;
  id?: string;
  className?: string;
};

function formatReward(amountMinor?: number, currency?: string) {
  if (!amountMinor || !currency) {
    return null;
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountMinor / 100);
}

export function NoticeUrgentPoster({ notice, id, className }: NoticeUrgentPosterProps) {
  const primaryContact = notice.contactMethods.find((item) => item.isPrimary) ?? notice.contactMethods[0];
  const riskTags = getRiskFlagLabels(notice.riskFlags);
  const rewardLabel =
    formatReward(notice.rewards?.recovery?.amountMinor, notice.rewards?.recovery?.currency) ||
    formatReward(notice.rewards?.clue?.amountMinor, notice.rewards?.clue?.currency) ||
    "有线索请立即联系";
  const riskLine = riskTags.length > 0 ? riskTags.slice(0, 5).join(" / ") : "情况紧急，请帮忙扩散";
  const posterAddressLine = getPosterAddressLine(notice.lostInfo.location);

  return (
    <article className={className ? `poster-urgent ${className}` : "poster-urgent"} id={id}>
      <header className="poster-urgent-header">
        <span>紧急</span>
        <div>
          <strong>{getNoticeCategoryLabel(notice.noticeCategory)}</strong>
        </div>
      </header>

      <section className="poster-urgent-hero">
        <div>
          <p>{getPetTypeLabel(notice.petProfile.type)}</p>
          <h1>{notice.petProfile.name}</h1>
          <strong>{riskLine}</strong>
        </div>
        <div className="poster-urgent-photo">
          {notice.primaryPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={notice.petProfile.name} src={notice.primaryPhotoUrl} />
          ) : (
            <span>照片待补</span>
          )}
        </div>
      </section>

      <section className="poster-urgent-facts">
        <div>
          <span>地址</span>
          <strong>{posterAddressLine}</strong>
        </div>
        <div>
          <span>{getTimeFieldLabel(notice.noticeCategory)}</span>
          <strong>{notice.lostInfo.lostTime.displayText ?? "待确认"}</strong>
        </div>
        <div>
          <span>悬赏/行动</span>
          <strong>{rewardLabel}</strong>
        </div>
      </section>

      {primaryContact ? (
        <footer className="poster-urgent-contact">
          <span>{getContactTypeLabel(primaryContact.type)}</span>
          <strong>{getContactDisplayValue(primaryContact)}</strong>
        </footer>
      ) : null}
    </article>
  );
}
