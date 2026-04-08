/**
 * Manage page
 * 作用：提供 owner 管理视图入口，展示管理 token 语义并支持后续接入编辑动作。
 * 联动：notice service、manage token 查询参数、PATCH/refresh/reopen/status API。
 * 层级：page
 */
import { noticeService } from "@/lib/notice/notice.service";

type PageProps = {
  params: Promise<{ shortId: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ManagePage({ params, searchParams }: PageProps) {
  const { shortId } = await params;
  const { token } = await searchParams;
  const result = await noticeService.getNoticeByShortId(shortId, token);
  const notice = result.data;

  return (
    <main className="shell">
      <section className="hero">
        <h1>管理寻宠启事</h1>
        <p>这个页面只在持有管理链接时可访问。后续编辑、刷新和状态变更都应从这里发起。</p>
      </section>

      <div className="grid two-col">
        <section className="panel section">
          <h2>当前管理视图</h2>
          <p className="mono">shortId: {notice.shortId}</p>
          <p className="mono">ownerNotificationEmail: {String((notice as { ownerNotificationEmail?: string | null }).ownerNotificationEmail ?? "未填写")}</p>
          <p>报告数量：{String((notice as { reportCount?: number }).reportCount ?? 0)}</p>
          <p>业务状态：{notice.businessStatus}</p>
          <p>活跃状态：{notice.activityState}</p>
          <p>版本：{notice.posterVersion}</p>
        </section>

        <section className="panel section">
          <h2>后续操作</h2>
          <p className="hint">当前实现已打通管理读取与服务层逻辑，下一步可直接在这里接表单编辑、刷新和状态按钮。</p>
          <pre className="mono" style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(notice, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}

