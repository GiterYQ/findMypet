/**
 * NoticeSquarePoster
 * 作用：渲染适合手机转发和朋友圈分享的 1:1 方图海报模板。
 * 联动：poster 页面、notice-display.ts、poster-template.ts。
 * 层级：component
 */
import {
  getBusinessStatusLabel,
  getContactDisplayValue,
  getContactTypeLabel,
  getLocationFieldLabel,
  getNoticeCategoryLabel,
  getPetTypeLabel,
  getPrimaryContactPrompt,
  getRiskFlagLabels,
  getTimeFieldLabel
} from "@/lib/notice/notice-display";
import { type PublicNoticePayload } from "@/lib/notice/notice.types";

type NoticeSquarePosterProps = {
  notice: PublicNoticePayload;
  id?: string;
  className?: string;
};

function formatReward(amountMinor?: number, currency?: string) {
  if (!amountMinor || !currency) {
    return "看到请联系";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountMinor / 100);
}

export function NoticeSquarePoster({ notice, id, className }: NoticeSquarePosterProps) {
  const primaryContact = notice.contactMethods.find((item) => item.isPrimary) ?? notice.contactMethods[0];
  const riskTags = getRiskFlagLabels(notice.riskFlags).slice(0, 3);
  const rewardLabel =
    formatReward(notice.rewards?.recovery?.amountMinor, notice.rewards?.recovery?.currency) ||
    formatReward(notice.rewards?.clue?.amountMinor, notice.rewards?.clue?.currency);
  const statusLabel = getBusinessStatusLabel(notice.businessStatus, notice.noticeCategory);

  return (
    <article className={className ? `poster-square ${className}` : "poster-square"} id={id}>
      <header className="poster-square-top">
        <span>{getNoticeCategoryLabel(notice.noticeCategory)}</span>
        <strong>{statusLabel}</strong>
      </header>

      <section className="poster-square-photo">
        {notice.primaryPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={notice.petProfile.name} src={notice.primaryPhotoUrl} />
        ) : (
          <div>
            <strong>{getPetTypeLabel(notice.petProfile.type)}</strong>
            <span>暂无照片</span>
          </div>
        )}
      </section>

      <section className="poster-square-body">
        <div>
          <p>{getPetTypeLabel(notice.petProfile.type)}</p>
          <h1>{notice.petProfile.name}</h1>
        </div>
        <div className="poster-square-reward">
          <span>悬赏/线索</span>
          <strong>{rewardLabel}</strong>
        </div>
      </section>

      <section className="poster-square-info">
        <div>
          <span>{getLocationFieldLabel(notice.noticeCategory)}</span>
          <strong>{notice.lostInfo.location.addressText}</strong>
        </div>
        <div>
          <span>{getTimeFieldLabel(notice.noticeCategory)}</span>
          <strong>{notice.lostInfo.lostTime.displayText ?? "待确认"}</strong>
        </div>
      </section>

      {riskTags.length > 0 ? (
        <div className="poster-square-tags">
          {riskTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      {primaryContact ? (
        <footer className="poster-square-contact">
          <span>{getPrimaryContactPrompt(notice.noticeCategory)}</span>
          <strong>
            {getContactTypeLabel(primaryContact.type)} · {getContactDisplayValue(primaryContact)}
          </strong>
        </footer>
      ) : null}
    </article>
  );
}
