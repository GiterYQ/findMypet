/**
 * Notice report route
 * 作用：接收举报并推进 moderationState 的下沉/隐藏。
 * 联动：notice.service.ts、分享页举报入口。
 * 层级：route
 */
import { NextResponse } from "next/server";
import { AppError } from "@/lib/core/app-error";
import { reportCreateSchema } from "@/lib/notice/notice.schema";
import { noticeService } from "@/lib/notice/notice.service";

type RouteProps = {
  params: Promise<{ shortId: string }>;
};

export async function GET() {
  return NextResponse.json({
    message: "POST with { reason } to report this notice."
  });
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { shortId } = await params;
    const payload = reportCreateSchema.parse(await request.json());
    const result = await noticeService.reportNotice(shortId, payload.reason);
    return NextResponse.json({ item: result });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ error: { code: "UNKNOWN", message: "Unexpected error." } }, { status: 500 });
  }
}

