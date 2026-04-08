/**
 * NoticeReportForm
 * 作用：为公开分享页提供真正可提交的举报交互，替代原先的 API 占位链接。
 * 联动：分享页、report API、moderation 状态流。
 * 层级：component
 */
"use client";

import { useState } from "react";

type NoticeReportFormProps = {
  shortId: string;
};

const reportReasons = [
  { value: "SCAM", label: "诈骗/虚假" },
  { value: "IMAGE_VIOLATION", label: "图片违规" },
  { value: "IRRELEVANT", label: "内容无关" },
  { value: "OTHER", label: "其他" }
] as const;

export function NoticeReportForm({ shortId }: NoticeReportFormProps) {
  const [reason, setReason] = useState<(typeof reportReasons)[number]["value"]>("SCAM");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/notices/${shortId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message ?? "举报失败。");
      }

      setMessage("举报已提交。若达到阈值，该内容会被降权或隐藏。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "举报失败。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="field">
        <label htmlFor="reportReason">举报原因</label>
        <select id="reportReason" onChange={(event) => setReason(event.target.value as (typeof reportReasons)[number]["value"])} value={reason}>
          {reportReasons.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="actions">
        <button className="button button-secondary" disabled={pending} onClick={handleSubmit} type="button">
          {pending ? "提交中..." : "提交举报"}
        </button>
      </div>

      {message ? <p className="hint">{message}</p> : null}
    </div>
  );
}

