/**
 * Manage page
 * 作用：提供 owner 管理视图入口，展示管理 token 语义并支持后续接入编辑动作。
 * 联动：notice service、manage token 查询参数、PATCH/refresh/reopen/status API。
 * 层级：page
 */
import { ManageConsole } from "@/components/notice/ManageConsole";
import { NoticeForm } from "@/components/notice/NoticeForm";
import { type NoticeCreateInput } from "@/lib/notice/notice.schema";
import { noticeService } from "@/lib/notice/notice.service";
import { type AdminNoticePayload } from "@/lib/notice/notice.types";

type PageProps = {
  params: Promise<{ shortId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ManagePage({ params, searchParams }: PageProps) {
  const { shortId } = await params;
  const { token } = await searchParams;
  const result = await noticeService.getNoticeByShortId(shortId, token);
  const notice = result.data as AdminNoticePayload;
  const editablePayload: Partial<NoticeCreateInput> = {
    locale: notice.locale,
    petProfile: notice.petProfile,
    lostInfo: notice.lostInfo,
    contactMethods: notice.contactMethods,
    rewards: notice.rewards ?? undefined,
    photos: notice.photos,
    riskFlags: notice.riskFlags ?? undefined,
    ownerNotificationEmail: notice.ownerNotificationEmail ?? undefined
  };
  const publicShareUrl = `/notice/${notice.shortId}`;
  const manageUrl = `/manage/${notice.shortId}?token=${token ?? ""}`;

  return (
    <main className="shell">
      <section className="hero">
        <h1>管理寻宠启事</h1>
        <p>这个页面只在持有管理链接时可访问。编辑、刷新和状态变更都从这里发起。</p>
      </section>

      <div className="grid two-col">
        <ManageConsole
          activityState={notice.activityState}
          businessStatus={notice.businessStatus}
          location={notice.lostInfo.location}
          manageToken={token ?? ""}
          manageUrl={manageUrl}
          publicShareUrl={publicShareUrl}
          shortId={notice.shortId}
        />
        <section>
          <NoticeForm initialValue={editablePayload} manageToken={token} mode="edit" shortId={shortId} />
        </section>
      </div>
    </main>
  );
}
