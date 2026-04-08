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
    <main className="shell">
      <section className="hero">
        <h1>{t("notice.create.title", "快速生成寻宠启事")}</h1>
        <p>{t("notice.create.subtitle", "上传照片、填写信息、生成海报与分享页。")}</p>
      </section>

      <NoticeForm />

      <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <NoticeFilters regionOptions={filterOptions.regionOptions} selectedPetType={petType} selectedRegionCode={regionCode} />
      </section>

      <section className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="actions" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>公开列表</h2>
          <span className="hint">默认只展示 active + fresh + visible 的启事</span>
        </div>
        <div className="notice-grid">
          {notices.length === 0 ? <div className="panel section">暂无可公开展示的寻宠信息。</div> : null}
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      </section>
    </main>
  );
}
