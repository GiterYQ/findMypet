/**
 * PosterActions
 * 作用：提供海报页的一键打印和 PNG 导出能力，作为首版成品导出的最小闭环。
 * 联动：poster 页面、html-to-image。
 * 层级：component
 */
"use client";

import { useState } from "react";
import { toPng } from "html-to-image";

type PosterActionsProps = {
  targetId: string;
  downloadFileName: string;
};

export function PosterActions({ targetId, downloadFileName }: PosterActionsProps) {
  const [pending, setPending] = useState(false);

  async function handleDownload() {
    const element = document.getElementById(targetId);

    if (!element) {
      return;
    }

    setPending(true);

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2
      });
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = downloadFileName;
      anchor.click();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="actions" style={{ marginBottom: 20 }}>
      <button className="button button-secondary" disabled={pending} onClick={handleDownload} type="button">
        {pending ? "生成中..." : "保存为 PNG"}
      </button>
      <button
        className="button button-primary"
        onClick={() => {
          window.print();
        }}
        type="button"
      >
        打印 / 保存为 PDF
      </button>
    </div>
  );
}
