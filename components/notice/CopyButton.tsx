/**
 * CopyButton
 * 作用：封装复制公开页/管理页链接的浏览器交互，提供 Clipboard API 与旧浏览器兜底。
 * 联动：NoticeForm、ManageConsole、ManageHistory。
 * 层级：component
 */
"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label: string;
  copiedLabel?: string;
  className?: string;
  makeAbsolute?: boolean;
};

function getCopyText(text: string, makeAbsolute?: boolean) {
  if (!makeAbsolute) {
    return text;
  }

  try {
    return new URL(text, window.location.origin).toString();
  } catch {
    return text;
  }
}

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}

export function CopyButton({ text, label, copiedLabel = "已复制", className = "button button-secondary", makeAbsolute }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const copyText = getCopyText(text, makeAbsolute);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText);
      } else if (!fallbackCopy(copyText)) {
        throw new Error("Copy failed.");
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className={className} onClick={handleCopy} type="button">
      {copied ? copiedLabel : label}
    </button>
  );
}
