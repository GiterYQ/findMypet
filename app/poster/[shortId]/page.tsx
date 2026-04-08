/**
 * Poster page
 * 作用：渲染首版海报成品页，供用户打印或保存为 PDF。
 * 联动：NoticePoster、分享页、管理页。
 * 层级：page
 */
import Link from "next/link";
import { NoticePoster } from "@/components/notice/NoticePoster";
import { PosterActions } from "@/components/notice/PosterActions";
import { noticeService } from "@/lib/notice/notice.service";
import { type PublicNoticePayload } from "@/lib/notice/notice.types";

type PageProps = {
  params: Promise<{ shortId: string }>;
};

export default async function PosterPage({ params }: PageProps) {
  const { shortId } = await params;
  const result = await noticeService.getNoticeByShortId(shortId);
  const notice = result.data as PublicNoticePayload;
  const posterElementId = `notice-poster-${shortId}`;

  return (
    <main className="shell">
      <section className="hero">
        <h1>寻宠海报</h1>
        <p>这是首版海报成品页。可以下载 PNG，也可以直接打印或保存为 PDF。</p>
      </section>

      <PosterActions downloadFileName={`findMypet-${shortId}.png`} targetId={posterElementId} />
      <NoticePoster className="poster-capture" id={posterElementId} notice={notice} />

      <div className="actions" style={{ marginTop: 20 }}>
        <Link className="button button-secondary" href={`/notice/${shortId}`}>
          返回分享页
        </Link>
      </div>
    </main>
  );
}
