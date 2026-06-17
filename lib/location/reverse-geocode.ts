/**
 * Reverse geocode service
 * 作用：将浏览器定位坐标反查为表单可用的省/市/区/街道/地址字段。
 * 联动：app/api/location/reverse-geocode/route.ts、NoticeForm、PetLocation schema。
 * 层级：service
 */
export type ReverseGeocodeLocation = {
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  addressText?: string;
  placeName?: string;
  regionCode?: string;
};

type NominatimAddress = {
  amenity?: string;
  attraction?: string;
  building?: string;
  city?: string;
  city_district?: string;
  country_code?: string;
  county?: string;
  house_number?: string;
  municipality?: string;
  neighbourhood?: string;
  province?: string;
  road?: string;
  shop?: string;
  state?: string;
  state_district?: string;
  suburb?: string;
  town?: string;
  village?: string;
};

type NominatimReversePayload = {
  address?: NominatimAddress;
  display_name?: string;
  name?: string;
};

function compactParts(parts: Array<string | undefined>) {
  return parts.filter((part): part is string => Boolean(part?.trim())).map((part) => part.trim());
}

function buildAddressText(address: NominatimAddress, displayName?: string) {
  const placeName = address.amenity ?? address.shop ?? address.attraction ?? address.building;
  const street = address.road ?? address.neighbourhood ?? address.suburb;
  const houseNumber = address.house_number;
  const parts = compactParts([placeName, street, houseNumber]);

  if (parts.length > 0) {
    return parts.join("");
  }

  return displayName?.split(",").slice(0, 3).join(",").trim();
}

export function mapNominatimReverseGeocode(payload: NominatimReversePayload): ReverseGeocodeLocation {
  const address = payload.address ?? {};
  const province = address.state ?? address.province;
  const city = address.city ?? address.town ?? address.village ?? address.municipality;
  const district = address.city_district ?? address.county ?? address.state_district ?? address.suburb;
  const street = address.road ?? address.neighbourhood ?? address.suburb;
  const placeName = payload.name ?? address.amenity ?? address.shop ?? address.attraction ?? address.building;
  const addressText = buildAddressText(address, payload.display_name);
  const regionCode = address.country_code?.toUpperCase();

  return {
    province,
    city,
    district,
    street,
    addressText,
    placeName,
    regionCode
  };
}

export async function reverseGeocodeCoordinates({
  lat,
  lng,
  language
}: {
  lat: number;
  lng: number;
  language?: string;
}): Promise<ReverseGeocodeLocation | null> {
  const endpoint = process.env.REVERSE_GEOCODE_ENDPOINT || "https://nominatim.openstreetmap.org/reverse";
  const url = new URL(endpoint);

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "18");
  if (language) {
    url.searchParams.set("accept-language", language);
  }
  if (process.env.REVERSE_GEOCODE_EMAIL) {
    url.searchParams.set("email", process.env.REVERSE_GEOCODE_EMAIL);
  }

  const response = await fetch(url, {
    headers: {
      "Accept-Language": language ?? "zh-CN,zh;q=0.9,en;q=0.6",
      "User-Agent": `findMypet/0.1 (${process.env.APP_BASE_URL ?? "local"})`
    }
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as NominatimReversePayload;
  return mapNominatimReverseGeocode(payload);
}
