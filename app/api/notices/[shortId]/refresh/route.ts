/**
 * Notice refresh route
 * 作用：处理 owner refresh 动作，维护 lastRefreshedAt 和 activityState。
 * 联动：notice.service.ts、管理页后续刷新按钮。
 * 层级：route
 */
import { NextResponse } from "next/server";
import { AppError } from "@/lib/core/app-error";
import { noticeService } from "@/lib/notice/notice.service";

type RouteProps = {
  params: Promise<{ shortId: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { shortId } = await params;
    const token = new URL(request.url).searchParams.get("token") ?? undefined;
    const result = await noticeService.refreshNotice(shortId, token);
    return NextResponse.json({ item: result });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ error: { code: "UNKNOWN", message: "Unexpected error." } }, { status: 500 });
  }
}

