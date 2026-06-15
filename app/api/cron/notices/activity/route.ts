/**
 * Notice activity cron route
 * 作用：提供受密钥保护的后台维护入口，定时推进 fresh/stale/archived。
 * 联动：notice.service.ts、activity-maintenance.ts、部署平台 cron 配置。
 * 层级：route
 */
import { NextResponse } from "next/server";
import { noticeService } from "@/lib/notice/notice.service";

function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const url = new URL(request.url);
  return request.headers.get("authorization") === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
}

async function handleActivityMaintenance(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid cron secret." } }, { status: 401 });
  }

  const result = await noticeService.advanceActivityStates();
  return NextResponse.json({ ok: true, result });
}

export async function GET(request: Request) {
  return handleActivityMaintenance(request);
}

export async function POST(request: Request) {
  return handleActivityMaintenance(request);
}
