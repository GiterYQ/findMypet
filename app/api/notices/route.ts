/**
 * Notices route
 * 作用：处理 notice 创建与公开列表读取。
 * 联动：notice.service.ts、notice.schema.ts、首页和表单组件。
 * 层级：route
 */
import { NextResponse } from "next/server";
import { AppError } from "@/lib/core/app-error";
import { noticeService } from "@/lib/notice/notice.service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const regionCode = url.searchParams.get("regionCode") ?? undefined;
  const petTypeParam = url.searchParams.get("petType") ?? undefined;
  const petType = petTypeParam && ["cat", "dog", "bird", "other"].includes(petTypeParam) ? (petTypeParam as "cat" | "dog" | "bird" | "other") : undefined;
  const notices = await noticeService.listVisibleNoticesWithFilters({ regionCode, petType });
  return NextResponse.json({ items: notices });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await noticeService.createNotice(payload);

    return NextResponse.json({
      item: result.notice.id,
      publicShareUrl: result.publicShareUrl,
      manageUrl: result.manageUrl
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ error: { code: "UNKNOWN", message: "Unexpected error." } }, { status: 500 });
  }
}
