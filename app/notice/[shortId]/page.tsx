/**
 * Notice share page
 * 作用：渲染稳定公开分享页，承载状态、风险、联系信息与举报入口。
 * 联动：notice service、report API、公开 payload mapper。
 * 层级：page
 */
import Link from "next/link";
import { ContactMethodsCard } from "@/components/notice/ContactMethodsCard";
import { LocationLinkCard } from "@/components/notice/LocationLinkCard";
import { NoticeReportForm } from "@/components/notice/NoticeReportForm";
import { getActivityStateLabel, getBusinessStatusLabel, getPetTypeLabel, getRiskFlagLabels } from "@/lib/notice/notice-display";
import { noticeService } from "@/lib/notice/notice.service";
import { type PublicNoticePayload } from "@/lib/notice/notice.types";

type PageProps = {
  params: Promise<{ shortId: string }>;
};

export default async function NoticeSharePage({ params }: PageProps) {
  const { shortId } = await params;
  const result = await noticeService.getNoticeByShortId(shortId);
  const notice = result.data as PublicNoticePayload;
  const location = notice.lostInfo.location;
  const riskTags = getRiskFlagLabels(notice.riskFlags);

  return (
    <main className="shell">
      <section className="hero">
        <h1>{String((notice.petProfile as { name: string }).name)}</h1>
        <p>分享页会始终显示最新版本，旧海报应引导查看这里的状态和更新时间。</p>
      </section>

      <div className="grid two-col">
        <section className="panel section">
          <span className={`status-pill ${notice.businessStatus === "active" ? "status-active" : notice.businessStatus === "recovered" ? "status-recovered" : "status-closed"}`}>
            {getBusinessStatusLabel(notice.businessStatus)}
          </span>
          <p className="mono">ID: {notice.shortId}</p>
          <p>宠物类型：{getPetTypeLabel(notice.petProfile.type)}</p>
          <p>更新时间：{new Date(notice.updatedAt).toLocaleString()}</p>
          <p>
            最近活跃：{new Date(notice.lastRefreshedAt).toLocaleString()} · {getActivityStateLabel(notice.activityState)}
          </p>
          <p>地点：{location.addressText}</p>
          <p>丢失时间：{notice.lostInfo.lostTime.displayText ?? "待补充"}</p>
          {riskTags.length > 0 ? (
            <div className="tag-list">
              {riskTags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="danger-box">防骗提示：未核实前，请勿提前支付任何费用。</div>
        </section>

        <section className="panel section">
          <ContactMethodsCard contactMethods={notice.contactMethods} />
          <NoticeReportForm shortId={shortId} />
          <div className="actions">
            <Link className="button button-secondary" href="/">
              返回首页
            </Link>
          </div>
        </section>
      </div>

      <section style={{ marginTop: 20 }}>
        <LocationLinkCard location={location} />
      </section>
    </main>
  );
}
