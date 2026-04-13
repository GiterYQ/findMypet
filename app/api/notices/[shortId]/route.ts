/**
 * Notice detail route
 * 作用：区分 public/admin 读取视图，并允许 owner 编辑可写业务字段。
 * 联动：notice.service.ts、notice.schema.ts、share/manage 页面。
 * 层级：route
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/core/app-error";
import { noticeService } from "@/lib/notice/notice.service";

type RouteProps = {
  params: Promise<{ shortId: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const { shortId } = await params;
    const token = new URL(request.url).searchParams.get("token") ?? undefined;
    const result = await noticeService.getNoticeByShortId(shortId, token);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 404 });
    }

    return NextResponse.json({ error: { code: "UNKNOWN", message: "Unexpected error." } }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteProps) {
  try {
    const { shortId } = await params;
    const token = new URL(request.url).searchParams.get("token") ?? undefined;
    const payload = await request.json();
    const result = await noticeService.updateNotice(shortId, payload, token);
    return NextResponse.json({ item: result });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      const path = firstIssue?.path.join(".") || "";
      const message = path ? `${path}: ${firstIssue.message}` : firstIssue?.message ?? "验证失败";
      return NextResponse.json({ error: { code: "VALIDATION", message } }, { status: 400 });
    }

    if (error instanceof AppError) {
      return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: 400 });
    }

    return NextResponse.json({ error: { code: "UNKNOWN", message: "Unexpected error." } }, { status: 500 });
  }
}

