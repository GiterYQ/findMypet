/**
 * Poster page
 * 作用：渲染首版海报成品页，供用户打印或保存为 PDF。
 * 联动：NoticePoster、分享页、管理页。
 * 层级：page
 */
import Link from "next/link";
import { NoticeAlertPoster } from "@/components/notice/NoticeAlertPoster";
import { NoticeMinimalPoster } from "@/components/notice/NoticeMinimalPoster";
import { NoticePoster } from "@/components/notice/NoticePoster";
import { NoticeSquarePoster } from "@/components/notice/NoticeSquarePoster";
import { NoticeUrgentPoster } from "@/components/notice/NoticeUrgentPoster";
import { PosterActions } from "@/components/notice/PosterActions";
import { getPosterTemplateHref, normalizePosterTemplate, posterTemplateOptions } from "@/lib/notice/poster-template";
import { noticeService } from "@/lib/notice/notice.service";
import { type PublicNoticePayload } from "@/lib/notice/notice.types";

type PageProps = {
  params: Promise<{ shortId: string }>;
  searchParams: Promise<{ template?: string }>;
};

export default async function PosterPage({ params, searchParams }: PageProps) {
  const { shortId } = await params;
  const { template: templateParam } = await searchParams;
  const template = normalizePosterTemplate(templateParam);
  const result = await noticeService.getNoticeByShortId(shortId);
  const notice = result.data as PublicNoticePayload;
  const posterElementId = `notice-poster-${shortId}`;

  return (
    <main className="shell">
      <section className="hero">
        <h1>寻宠海报</h1>
        <p>这是首版海报成品页。可以下载 PNG，也可以直接打印或保存为 PDF。</p>
      </section>

      <section className="poster-template-picker" aria-label="选择海报模板">
        {posterTemplateOptions.map((option) => (
          <Link
            className={template === option.id ? "poster-template-option poster-template-option-active" : "poster-template-option"}
            href={getPosterTemplateHref(shortId, option.id)}
            key={option.id}
          >
            <span>{option.aspectLabel}</span>
            <strong>{option.label}</strong>
            <small>{option.useCase}</small>
          </Link>
        ))}
      </section>

      <PosterActions downloadFileName={`findMypet-${shortId}-${template}.png`} targetId={posterElementId} />
      {template === "square" ? (
        <NoticeSquarePoster className="poster-capture" id={posterElementId} notice={notice} />
      ) : template === "alert" ? (
        <NoticeAlertPoster className="poster-capture" id={posterElementId} notice={notice} />
      ) : template === "minimal" ? (
        <NoticeMinimalPoster className="poster-capture" id={posterElementId} notice={notice} />
      ) : template === "urgent" ? (
        <NoticeUrgentPoster className="poster-capture" id={posterElementId} notice={notice} />
      ) : (
        <NoticePoster className="poster-capture" id={posterElementId} notice={notice} />
      )}

      <div className="actions" style={{ marginTop: 20 }}>
        <Link className="button button-secondary" href={`/notice/${shortId}`}>
          返回分享页
        </Link>
      </div>
    </main>
  );
}
