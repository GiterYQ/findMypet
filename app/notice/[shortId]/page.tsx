/**
 * Notice share page
 * 作用：渲染稳定公开分享页，承载状态、风险、联系信息与举报入口。
 * 联动：notice service、report API、公开 payload mapper。
 * 层级：page
 */
import Link from "next/link";
import { noticeService } from "@/lib/notice/notice.service";

type PageProps = {
  params: Promise<{ shortId: string }>;
};

export default async function NoticeSharePage({ params }: PageProps) {
  const { shortId } = await params;
  const result = await noticeService.getNoticeByShortId(shortId);
  const notice = result.data;

  return (
    <main className="shell">
      <section className="hero">
        <h1>{String((notice.petProfile as { name: string }).name)}</h1>
        <p>分享页会始终显示最新版本，旧海报应引导查看这里的状态和更新时间。</p>
      </section>

      <div className="grid two-col">
        <section className="panel section">
          <span className={`status-pill ${notice.businessStatus === "active" ? "status-active" : notice.businessStatus === "recovered" ? "status-recovered" : "status-closed"}`}>
            {notice.businessStatus}
          </span>
          <p className="mono">ID: {notice.shortId}</p>
          <p>更新时间：{new Date(notice.updatedAt).toLocaleString()}</p>
          <p>最近活跃：{new Date(notice.lastRefreshedAt).toLocaleString()}</p>
          <p>地点：{String((notice.lostInfo as { location: { addressText: string } }).location.addressText)}</p>
          <p>丢失时间：{String((notice.lostInfo as { lostTime: { displayText?: string } }).lostTime.displayText ?? "待补充")}</p>
          <div className="danger-box">防骗提示：未核实前，请勿提前支付任何费用。</div>
        </section>

        <section className="panel section">
          <h2>联系与举报</h2>
          <pre className="mono" style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(notice.contactMethods, null, 2)}
          </pre>
          <div className="actions">
            <Link className="button button-secondary" href={`/api/notices/${shortId}/report`}>
              举报入口（API）
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

