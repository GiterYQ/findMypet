/**
 * NoticeCard
 * 作用：渲染公开列表卡片，集中展示主图、状态、地点、风险与更新时间。
 * 联动：app/page.tsx、notice public payload。
 * 层级：component
 */
import Link from "next/link";
import { getBusinessStatusLabel, getNoticeCategoryLabel, getPetTypeDisplayName, getRiskFlagLabels } from "@/lib/notice/notice-display";
import { type PublicNoticePayload } from "@/lib/notice/notice.types";

type NoticeCardProps = {
  notice: PublicNoticePayload;
};

function formatReward(amountMinor?: number, currency?: string) {
  if (!amountMinor || !currency) {
    return null;
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency
  }).format(amountMinor / 100);
}

function statusClassName(businessStatus: string) {
  switch (businessStatus) {
    case "recovered":
      return "status-pill status-recovered";
    case "closed":
      return "status-pill status-closed";
    default:
      return "status-pill status-active";
  }
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const rewardLabel =
    formatReward(notice.rewards?.recovery?.amountMinor, notice.rewards?.recovery?.currency) ??
    formatReward(notice.rewards?.clue?.amountMinor, notice.rewards?.clue?.currency);

  const riskTags = getRiskFlagLabels(notice.riskFlags).slice(0, 3);

  return (
    <Link className="panel notice-card" href={`/notice/${notice.shortId}`}>
      <div className="notice-card-photo-frame">
        {notice.primaryPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={notice.petProfile.name} className="notice-card-photo" src={notice.primaryPhotoUrl} />
        ) : (
          <div aria-hidden="true" className="notice-card-photo notice-card-photo-placeholder" />
        )}
      </div>

      <div className="notice-card-body">
        <div className="notice-card-status-row">
          <span className={statusClassName(notice.businessStatus)}>
            {getBusinessStatusLabel(notice.businessStatus, notice.noticeCategory)}
          </span>
          <span className="notice-card-reward">{rewardLabel ? `悬赏 ${rewardLabel}` : "无悬赏"}</span>
        </div>

        <div>
          <h3>{notice.petProfile.name}</h3>
          <div className="meta">
            {getNoticeCategoryLabel(notice.noticeCategory)} · {getPetTypeDisplayName(notice.petProfile)} · {notice.lostInfo.location.addressText}
          </div>
          <div className="meta">{notice.lostInfo.lostTime.displayText ?? "时间待确认"}</div>
        </div>

        {riskTags.length > 0 ? (
          <div className="tag-list">
            {riskTags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="notice-card-footer">
          <span className="meta">更新于 {new Date(notice.updatedAt).toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
