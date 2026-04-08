/**
 * Map link helpers
 * 作用：根据结构化地点信息生成可点击地图链接，并为后续扩展更多地图供应商留出统一入口。
 * 联动：notice share page、manage console、PetLocation 结构。
 * 层级：service
 */
import { type PetLocation } from "@/lib/notice/notice.types";

function buildQuery(location: PetLocation) {
  const baseText = location.placeName ? `${location.placeName} ${location.addressText}` : location.addressText;
  return encodeURIComponent(baseText.trim());
}

function isMainlandRegion(regionCode?: string) {
  return regionCode?.toUpperCase() === "CN";
}

export function getMapLink(location: PetLocation) {
  const query = buildQuery(location);

  if (location.lat !== undefined && location.lng !== undefined) {
    if (isMainlandRegion(location.regionCode)) {
      return {
        provider: "Amap",
        href: `https://uri.amap.com/marker?position=${location.lng},${location.lat}&name=${query}`
      };
    }

    return {
      provider: "Google Maps",
      href: `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
    };
  }

  if (isMainlandRegion(location.regionCode)) {
    return {
      provider: "Amap",
      href: `https://uri.amap.com/search?keyword=${query}`
    };
  }

  return {
    provider: "Google Maps",
    href: `https://www.google.com/maps/search/?api=1&query=${query}`
  };
}

