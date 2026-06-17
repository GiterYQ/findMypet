/**
 * China divisions API
 * 作用：按层级返回中国省/市/区/街道选项，避免把完整街道数据打进首页 JS。
 * 联动：china-divisions.ts、NoticeForm、data/china-divisions。
 * 层级：api
 */
import { NextResponse } from "next/server";
import { listChinaAreas, listChinaCities, listChinaProvinces, listChinaStreets } from "@/lib/location/china-divisions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level") ?? "provinces";

  if (level === "provinces") {
    return NextResponse.json({ options: await listChinaProvinces() });
  }

  if (level === "cities") {
    const provinceCode = searchParams.get("provinceCode");
    if (!provinceCode) {
      return NextResponse.json({ error: "provinceCode is required" }, { status: 400 });
    }

    return NextResponse.json({ options: await listChinaCities(provinceCode) });
  }

  if (level === "areas") {
    const cityCode = searchParams.get("cityCode");
    if (!cityCode) {
      return NextResponse.json({ error: "cityCode is required" }, { status: 400 });
    }

    return NextResponse.json({ options: await listChinaAreas(cityCode) });
  }

  if (level === "streets") {
    const areaCode = searchParams.get("areaCode");
    if (!areaCode) {
      return NextResponse.json({ error: "areaCode is required" }, { status: 400 });
    }

    return NextResponse.json({ options: await listChinaStreets(areaCode) });
  }

  return NextResponse.json({ error: "Unsupported level" }, { status: 400 });
}
