/**
 * Reverse geocode tests
 * 作用：验证坐标反查地址的字段归一化，避免不同地图返回结构污染表单字段。
 * 联动：lib/location/reverse-geocode.ts、app/api/location/reverse-geocode/route.ts、NoticeForm。
 * 层级：test
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { mapNominatimReverseGeocode } from "../lib/location/reverse-geocode.ts";

test("mapNominatimReverseGeocode maps address parts into pet location fields", () => {
  const mapped = mapNominatimReverseGeocode({
    display_name: "望京SOHO, 望京街道, 朝阳区, 北京市, 中国",
    name: "望京SOHO",
    address: {
      amenity: "望京SOHO",
      road: "望京街道",
      city: "北京市",
      city_district: "朝阳区",
      state: "北京市",
      country_code: "cn"
    }
  });

  assert.deepEqual(mapped, {
    province: "北京市",
    city: "北京市",
    district: "朝阳区",
    street: "望京街道",
    addressText: "望京SOHO望京街道",
    placeName: "望京SOHO",
    regionCode: "CN"
  });
});

test("reverse geocode API route keeps provider behind the backend", async () => {
  const routeSource = await readFile(new URL("../app/api/location/reverse-geocode/route.ts", import.meta.url), "utf8");

  assert.match(routeSource, /export async function POST/);
  assert.match(routeSource, /reverseGeocodeCoordinates/);
  assert.match(routeSource, /INVALID_LOCATION/);
});
