/**
 * PosterActions
 * 作用：提供海报页的一键打印操作，作为首版导出能力的最小闭环。
 * 联动：poster 页面。
 * 层级：component
 */
"use client";

export function PosterActions() {
  return (
    <div className="actions" style={{ marginBottom: 20 }}>
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

