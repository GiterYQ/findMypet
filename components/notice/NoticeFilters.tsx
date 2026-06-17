/**
 * NoticeFilters
 * 作用：提供首页最小筛选表单，使用 URL query 驱动公开列表筛选。
 * 联动：app/page.tsx、notice service 列表过滤。
 * 层级：component
 */
import Link from "next/link";
import { type RegionFilterOption } from "@/lib/notice/notice.types";

type NoticeFiltersProps = {
  selectedRegionCode?: string;
  selectedPetType?: string;
  regionOptions: RegionFilterOption[];
};

const petTypeOptions = [
  { value: "", label: "全部宠物" },
  { value: "cat", label: "猫" },
  { value: "dog", label: "狗" },
  { value: "bird", label: "鸟" },
  { value: "other", label: "异宠" }
] as const;

export function NoticeFilters({ selectedRegionCode, selectedPetType, regionOptions }: NoticeFiltersProps) {
  return (
    <form className="panel section" method="GET">
      <div className="notice-filter-intro">
        筛选本站已发布的公开启事，不是抓取外部平台帖子。
      </div>
      <div className="grid two-col">
        <div className="field">
          <label htmlFor="regionCode">地区</label>
          <select defaultValue={selectedRegionCode ?? ""} id="regionCode" name="regionCode">
            <option value="">全部地区</option>
            {regionOptions.map((regionOption) => (
              <option key={regionOption.code} value={regionOption.code}>
                {regionOption.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="petType">宠物类型</label>
          <select defaultValue={selectedPetType ?? ""} id="petType" name="petType">
            {petTypeOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="actions">
        <button className="button button-secondary" type="submit">
          应用筛选
        </button>
        <Link className="button button-secondary" href="/">
          清空
        </Link>
      </div>
    </form>
  );
}
