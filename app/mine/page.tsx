/**
 * Mine page
 * 作用：提供匿名用户的本地管理入口列表，帮助找回同设备创建过的启事。
 * 联动：ManageHistory、NoticeForm、localStorage。
 * 层级：page
 */
import { ManageHistory } from "@/components/notice/ManageHistory";

export default function MinePage() {
  return (
    <main className="shell">
      <section className="hero">
        <h1>我的启事</h1>
        <p>这里显示当前浏览器保存过的管理入口。</p>
      </section>
      <ManageHistory />
    </main>
  );
}

