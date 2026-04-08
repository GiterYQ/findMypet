/**
 * LocationLinkCard
 * 作用：统一渲染地点信息与地图跳转入口，避免页面层散落 map provider 逻辑。
 * 联动：map-link.ts、分享页、管理页。
 * 层级：component
 */
import { getMapLink } from "@/lib/location/map-link";
import { type PetLocation } from "@/lib/notice/notice.types";

type LocationLinkCardProps = {
  location: PetLocation;
};

export function LocationLinkCard({ location }: LocationLinkCardProps) {
  const mapLink = getMapLink(location);

  return (
    <div className="panel section">
      <h3>地点与地图</h3>
      <p>{location.addressText}</p>
      {location.placeName ? <p className="hint">地标：{location.placeName}</p> : null}
      <p className="hint">隐私级别：{location.privacyLevel === "exact" ? "精确位置" : "模糊区域"}</p>
      <div className="actions">
        <a className="button button-secondary" href={mapLink.href} rel="noreferrer" target="_blank">
          用 {mapLink.provider} 打开
        </a>
      </div>
    </div>
  );
}
