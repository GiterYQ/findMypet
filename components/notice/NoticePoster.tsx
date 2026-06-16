/**
 * NoticePoster
 * 作用：渲染首版可打印海报版式，集中展示主图、状态、地点、时间、风险、联系方式与防骗提示。
 * 联动：poster 页面、notice-display.ts、ContactMethodsCard 的展示规则。
 * 层级：component
 */
import {
  getActivityStateLabel,
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

type NoticePosterProps = {
  notice: PublicNoticePayload;
  id?: string;
  className?: string;
};

export function NoticePoster({ notice, id, className }: NoticePosterProps) {
  const riskTags = getRiskFlagLabels(notice.riskFlags);
  const primaryContact = notice.contactMethods.find((item) => item.isPrimary) ?? notice.contactMethods[0];

  return (
    <article className={className ? `poster-shell ${className}` : "poster-shell"} id={id}>
      <header className="poster-header">
        <div>
          <div className="poster-kicker">{getBusinessStatusLabel(notice.businessStatus)}</div>
          <h1>{notice.petProfile.name}</h1>
          <p>
            {getNoticeCategoryLabel(notice.noticeCategory)} · {getPetTypeLabel(notice.petProfile.type)} · {notice.lostInfo.location.addressText}
          </p>
        </div>
      </header>

      <section className="poster-grid">
        <div className="poster-photo-wrap">
          {notice.primaryPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={notice.petProfile.name} className="poster-photo" src={notice.primaryPhotoUrl} />
          ) : (
            <div className="poster-photo poster-photo-placeholder">暂无图片</div>
          )}
        </div>

        <div className="poster-main">
          <div className="poster-section">
            <h2>关键信息</h2>
            <dl className="poster-facts">
              <div>
                <dt>{getTimeFieldLabel(notice.noticeCategory)}</dt>
                <dd>{notice.lostInfo.lostTime.displayText ?? "待补充"}</dd>
              </div>
              <div>
                <dt>{getLocationFieldLabel(notice.noticeCategory)}</dt>
                <dd>{notice.lostInfo.location.addressText}</dd>
              </div>
              <div>
                <dt>最近活跃</dt>
                <dd>{getActivityStateLabel(notice.activityState)}</dd>
              </div>
              <div>
                <dt>更新时间</dt>
                <dd>{new Date(notice.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          {riskTags.length > 0 ? (
            <div className="poster-section">
              <h2>紧急标签</h2>
              <div className="tag-list">
                {riskTags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {primaryContact ? (
            <div className="poster-contact">
              <div className="poster-contact-label">{getPrimaryContactPrompt(notice.noticeCategory)}</div>
              <div className="poster-contact-value">
                {getContactTypeLabel(primaryContact.type)} · {getContactDisplayValue(primaryContact)}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <footer className="poster-footer">
        <div className="danger-box">
          防骗提示：未核实前，请勿提前支付任何费用。请优先以分享页中的最新状态为准。
        </div>
      </footer>
    </article>
  );
}
