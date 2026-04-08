/**
 * ManageConsole
 * 作用：提供 owner 管理操作台，封装刷新、改状态和重新开启动作。
 * 联动：manage 页面、status/refresh/reopen API、NoticeForm 编辑模式。
 * 层级：component
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocationLinkCard } from "@/components/notice/LocationLinkCard";
import { getActivityStateLabel, getBusinessStatusLabel } from "@/lib/notice/notice-display";
import { type PetLocation } from "@/lib/notice/notice.types";

type ManageConsoleProps = {
  shortId: string;
  manageToken: string;
  businessStatus: "active" | "recovered" | "closed";
  activityState: "fresh" | "stale" | "archived";
  publicShareUrl: string;
  manageUrl: string;
  location: PetLocation;
};

export function ManageConsole({
  shortId,
  manageToken,
  businessStatus,
  activityState,
  publicShareUrl,
  manageUrl,
  location
}: ManageConsoleProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function runAction(action: "refresh" | "reopen" | "status", statusValue?: "recovered" | "closed") {
    setPendingAction(action);
    setMessage(null);

    try {
      const endpoint =
        action === "refresh"
          ? `/api/notices/${shortId}/refresh?token=${encodeURIComponent(manageToken)}`
          : action === "reopen"
            ? `/api/notices/${shortId}/reopen?token=${encodeURIComponent(manageToken)}`
            : `/api/notices/${shortId}/status?token=${encodeURIComponent(manageToken)}`;

      const response = await fetch(endpoint, {
        method: action === "status" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: action === "status" ? JSON.stringify({ businessStatus: statusValue }) : undefined
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message ?? "Action failed.");
      }

      setMessage("操作已完成，页面将刷新为最新状态。");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败。");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="panel section">
      <h2>管理操作台</h2>
      <p className="mono">公开页：{publicShareUrl}</p>
      <p className="mono">管理页：{manageUrl}</p>
      <p>
        当前状态：{getBusinessStatusLabel(businessStatus)} / {getActivityStateLabel(activityState)}
      </p>
      <p className="hint">刷新活跃度只更新最近活跃时间；状态变更和重开会更新版本与业务状态。</p>
      <div className="actions">
        <button className="button button-secondary" disabled={pendingAction !== null || businessStatus !== "active"} onClick={() => runAction("refresh")} type="button">
          刷新活跃度
        </button>
        <button className="button button-secondary" disabled={pendingAction !== null || businessStatus !== "active"} onClick={() => runAction("status", "recovered")} type="button">
          标记已找回
        </button>
        <button className="button button-secondary" disabled={pendingAction !== null || businessStatus !== "active"} onClick={() => runAction("status", "closed")} type="button">
          停止扩散
        </button>
        <button className="button button-primary" disabled={pendingAction !== null || businessStatus === "active"} onClick={() => runAction("reopen")} type="button">
          重新开启
        </button>
      </div>
      {message ? <p className="hint">{message}</p> : null}
      <div style={{ marginTop: 16 }}>
        <LocationLinkCard location={location} />
      </div>
    </div>
  );
}
