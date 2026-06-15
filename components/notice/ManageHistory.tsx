/**
 * ManageHistory
 * 作用：展示与恢复当前浏览器保存过的匿名启事管理入口。
 * 联动：lib/manage/manage-history.ts、lib/manage/manage-url.ts、/mine 页面、NoticeForm 创建成功记录。
 * 层级：component
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/notice/CopyButton";
import { type ManagedNoticeEntry, readManagedNotices, removeManagedNotice, saveManagedNotice } from "@/lib/manage/manage-history";
import { parseManageUrl } from "@/lib/manage/manage-url";
import { getNoticeCategoryLabel } from "@/lib/notice/notice-display";

export function ManageHistory() {
  const [items, setItems] = useState<ManagedNoticeEntry[]>([]);
  const [manualManageUrl, setManualManageUrl] = useState("");
  const [manualPetName, setManualPetName] = useState("");
  const [manualCategory, setManualCategory] = useState<ManagedNoticeEntry["noticeCategory"]>("lost-pet");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setItems(readManagedNotices());
  }, []);

  function handleRemove(shortId: string) {
    removeManagedNotice(shortId);
    setItems(readManagedNotices());
  }

  function handleImport() {
    const parsed = parseManageUrl(manualManageUrl, window.location.origin);

    if (!parsed) {
      setMessage("请输入有效的管理链接，格式应包含 /manage/启事ID?token=管理凭证。");
      return;
    }

    const publicShareUrl = new URL(`/notice/${encodeURIComponent(parsed.shortId)}`, parsed.manageUrl).toString();
    const saved = saveManagedNotice({
      shortId: parsed.shortId,
      petName: manualPetName.trim() || "未命名启事",
      noticeCategory: manualCategory,
      publicShareUrl,
      manageUrl: parsed.manageUrl,
      createdAt: new Date().toISOString()
    });

    try {
      window.localStorage.setItem("findMypet.latestManageUrl", parsed.manageUrl);
    } catch {
      // 这只是快速入口缓存，失败时不影响主列表导入结果提示。
    }

    if (!saved) {
      setMessage("本地保存失败，请手动收藏管理链接。");
      return;
    }

    setItems(readManagedNotices());
    setManualManageUrl("");
    setManualPetName("");
    setMessage("管理入口已保存到当前浏览器。");
  }

  return (
    <section className="section">
      <div className="actions" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>我的启事</h2>
        <Link className="button button-secondary" href="/">
          返回首页
        </Link>
      </div>

      <div className="panel section" style={{ marginBottom: 20 }}>
        <h3>从管理链接恢复</h3>
        <p className="hint">如果你从邮箱或聊天记录找回了管理链接，可以粘贴到这里保存到当前浏览器。</p>
        <div className="grid two-col">
          <div className="field">
            <label htmlFor="manualManageUrl">管理链接</label>
            <input
              id="manualManageUrl"
              placeholder="https://.../manage/PA-7K3M2?token=..."
              value={manualManageUrl}
              onChange={(event) => setManualManageUrl(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="manualPetName">备注名称</label>
            <input
              id="manualPetName"
              maxLength={30}
              placeholder="例如：小橘"
              value={manualPetName}
              onChange={(event) => setManualPetName(event.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="manualCategory">启事类型</label>
          <select id="manualCategory" value={manualCategory} onChange={(event) => setManualCategory(event.target.value as ManagedNoticeEntry["noticeCategory"])}>
            <option value="lost-pet">寻宠</option>
            <option value="found-owner">寻主</option>
          </select>
        </div>
        <div className="actions">
          <button className="button button-primary" onClick={handleImport} type="button">
            保存到我的启事
          </button>
        </div>
        {message ? <p className="hint">{message}</p> : null}
      </div>

      {items.length === 0 ? (
        <div className="panel section">
          <p>当前浏览器还没有保存管理入口。</p>
          <p className="hint">创建启事后，这里会自动保存公开页和管理页入口。清理浏览器数据会移除这些记录。</p>
        </div>
      ) : null}

      <div className="notice-grid">
        {items.map((item) => (
          <article className="panel notice-card" key={item.shortId}>
            <span className="tag">{getNoticeCategoryLabel(item.noticeCategory)}</span>
            <div>
              <h3>{item.petName}</h3>
              <p className="meta">ID {item.shortId}</p>
              <p className="meta">保存于 {new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <div className="actions">
              <a className="button button-primary" href={item.manageUrl}>
                打开管理页
              </a>
              <a className="button button-secondary" href={item.publicShareUrl}>
                查看分享页
              </a>
              <CopyButton label="复制管理链接" text={item.manageUrl} />
              <button className="button button-secondary" onClick={() => handleRemove(item.shortId)} type="button">
                移除记录
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
