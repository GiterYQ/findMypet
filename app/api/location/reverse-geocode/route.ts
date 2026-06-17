/**
 * Reverse geocode route
 * 作用：接收浏览器定位坐标并由后端反查结构化地址，避免前端直接暴露地图服务细节。
 * 联动：reverse-geocode.ts、NoticeForm、PetLocation schema。
 * 层级：route
 */
import { NextResponse } from "next/server";
import { reverseGeocodeCoordinates } from "@/lib/location/reverse-geocode";

export const runtime = "nodejs";

function parseCoordinates(lat: unknown, lng: unknown) {
  if (typeof lat !== "number" || typeof lng !== "number" || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { lat?: unknown; lng?: unknown; language?: unknown };

    const coordinates = parseCoordinates(body.lat, body.lng);

    if (!coordinates) {
      return NextResponse.json({ error: { code: "INVALID_LOCATION", message: "Invalid coordinates." } }, { status: 400 });
    }

    const location = await reverseGeocodeCoordinates({
      lat: coordinates.lat,
      lng: coordinates.lng,
      language: typeof body.language === "string" ? body.language : "zh-CN"
    });

    return NextResponse.json({ location });
  } catch {
    return NextResponse.json({ error: { code: "REVERSE_GEOCODE_FAILED", message: "Unable to resolve location." } }, { status: 502 });
  }
}
