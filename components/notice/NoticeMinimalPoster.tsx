/**
 * NoticeMinimalPoster
 * 作用：渲染社区简洁风格海报模板，适合物业群、社区群和公告栏低压传播。
 * 联动：poster 页面、poster-template.ts、notice-display.ts。
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
  getTimeFieldLabel
} from "@/lib/notice/notice-display";
import { type PublicNoticePayload } from "@/lib/notice/notice.types";

type NoticeMinimalPosterProps = {
  notice: PublicNoticePayload;
  id?: string;
  className?: string;
};

export function NoticeMinimalPoster({ notice, id, className }: NoticeMinimalPosterProps) {
  const primaryContact = notice.contactMethods.find((item) => item.isPrimary) ?? notice.contactMethods[0];
  const statusLabel = getBusinessStatusLabel(notice.businessStatus, notice.noticeCategory);

  return (
    <article className={className ? `poster-minimal ${className}` : "poster-minimal"} id={id}>
      <header className="poster-minimal-header">
        <span>{getNoticeCategoryLabel(notice.noticeCategory)}</span>
        <strong>{statusLabel}</strong>
      </header>

      <section className="poster-minimal-title">
        <p>请帮忙留意</p>
        <h1>{notice.petProfile.name}</h1>
        <span>{getPetTypeLabel(notice.petProfile.type)}</span>
      </section>

      <section className="poster-minimal-card">
        <div className="poster-minimal-photo">
          {notice.primaryPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={notice.petProfile.name} src={notice.primaryPhotoUrl} />
          ) : (
            <span>暂无照片</span>
          )}
        </div>

        <dl className="poster-minimal-facts">
          <div>
            <dt>{getLocationFieldLabel(notice.noticeCategory)}</dt>
            <dd>{notice.lostInfo.location.addressText}</dd>
          </div>
          <div>
            <dt>{getTimeFieldLabel(notice.noticeCategory)}</dt>
            <dd>{notice.lostInfo.lostTime.displayText ?? "待确认"}</dd>
          </div>
          <div>
            <dt>补充说明</dt>
            <dd>{notice.petProfile.description || "如有线索，请联系发布人确认。"}</dd>
          </div>
        </dl>
      </section>

      {primaryContact ? (
        <footer className="poster-minimal-contact">
          <span>{getPrimaryContactPrompt(notice.noticeCategory)}</span>
          <strong>
            {getContactTypeLabel(primaryContact.type)} · {getContactDisplayValue(primaryContact)}
          </strong>
        </footer>
      ) : null}
    </article>
  );
}
