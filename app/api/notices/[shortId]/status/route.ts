/**
 * Notice status route
 * 作用：隔离业务状态更新，避免通用 PATCH 绕过状态机规则。
 * 联动：notice.service.ts、manage 页面。
 * 层级：route
 */
import { NextResponse } from "next/server";
import { AppError } from "@/lib/core/app-error";
import { noticeService } from "@/lib/notice/notice.service";

type RouteProps = {
  params: Promise<{ shortId: string }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { shortId } = await params;
    const token = new URL(request.url).searchParams.get("token") ?? undefined;
    const payload = await request.json();
    const result = await noticeService.updateStatus(shortId, payload, token);
    return NextResponse.json({ item: result });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ error: { code: "UNKNOWN", message: "Unexpected error." } }, { status: 500 });
  }
}

