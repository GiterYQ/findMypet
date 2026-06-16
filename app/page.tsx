/**
 * Home page
 * 作用：作为首版入口页，承载创建表单和默认公开列表。
 * 联动：components/notice/NoticeForm.tsx、components/notice/NoticeCard.tsx、GET/POST notices API。
 * 层级：page
 */
import { NoticeCard } from "@/components/notice/NoticeCard";
import { NoticeFilters } from "@/components/notice/NoticeFilters";
import { NoticeForm } from "@/components/notice/NoticeForm";
import { noticeService } from "@/lib/notice/notice.service";
import { t } from "@/lib/i18n/t";
import Link from "next/link";

type HomePageProps = {
  searchParams: Promise<{ regionCode?: string; petType?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const regionCode = params.regionCode?.trim() || undefined;
  const petType = params.petType && ["cat", "dog", "bird", "other"].includes(params.petType) ? (params.petType as "cat" | "dog" | "bird" | "other") : undefined;
  const [notices, filterOptions] = await Promise.all([
    noticeService.listVisibleNoticesWithFilters({ regionCode, petType }),
    noticeService.listVisibleFilterOptions()
  ]);

  return (
    <main className="shell app-shell">
      <header className="mobile-app-bar" aria-label="手机端顶部导航">
        <div>
          <span>findMypet</span>
          <strong>发寻宠启事</strong>
        </div>
        <Link className="mobile-app-chip" href="/mine">
          我的
        </Link>
      </header>

      <section className="hero">
        <h1>{t("notice.create.title", "快速生成寻宠启事")}</h1>
        <p>{t("notice.create.subtitle", "上传照片、填写信息、生成海报与分享页。")}</p>
        <div className="actions">
          <Link className="button button-secondary" href="/mine">
            我的启事
          </Link>
        </div>
      </section>

      <section id="create-notice">
        <NoticeForm />
      </section>

      <section className="section notice-filter-section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <NoticeFilters regionOptions={filterOptions.regionOptions} selectedPetType={petType} selectedRegionCode={regionCode} />
      </section>

      <section className="section public-list-section" id="public-list" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="section-heading">
          <div>
            <span>附近动态</span>
            <h2>公开列表</h2>
          </div>
          <span className="hint">默认只展示 active + fresh + visible 的启事</span>
        </div>
        <div className="notice-grid">
          {notices.length === 0 ? <div className="panel section">暂无可公开展示的寻宠信息。</div> : null}
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      </section>

      <nav className="mobile-bottom-tabs" aria-label="手机端快捷导航">
        <a href="#create-notice">
          <span>+</span>
          发布
        </a>
        <a href="#public-list">
          <span>2</span>
          列表
        </a>
        <Link href="/mine">
          <span>3</span>
          我的
        </Link>
      </nav>
    </main>
  );
}
