/**
 * Notice reopen route
 * 作用：显式恢复 closed/recovered notice，防止 refresh 直接绕开业务状态。
 * 联动：notice.service.ts、管理页。
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
    const result = await noticeService.reopenNotice(shortId, token);
    return NextResponse.json({ item: result });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ error: { code: "UNKNOWN", message: "Unexpected error." } }, { status: 500 });
  }
}

