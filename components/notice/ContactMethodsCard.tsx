/**
 * ContactMethodsCard
 * 作用：以正式 UI 展示结构化联系方式，统一处理标签、掩码和可点击行为。
 * 联动：notice-display.ts、分享页、后续海报/详情页展示。
 * 层级：component
 */
import { getContactDisplayValue, getContactHref, getContactTypeLabel } from "@/lib/notice/notice-display";
import { type ContactMethod } from "@/lib/notice/notice.types";

type ContactMethodsCardProps = {
  contactMethods: ContactMethod[];
};

export function ContactMethodsCard({ contactMethods }: ContactMethodsCardProps) {
  if (contactMethods.length === 0) {
    return (
      <div className="panel section">
        <h2>联系方式</h2>
        <p className="hint">暂未提供联系方式。</p>
      </div>
    );
  }

  return (
    <div className="panel section">
      <h2>联系方式</h2>
      <div className="grid" style={{ gap: 12 }}>
        {contactMethods.map((contact, index) => {
          const href = getContactHref(contact);
          const label = contact.label?.trim() ? `${getContactTypeLabel(contact.type)} · ${contact.label}` : getContactTypeLabel(contact.type);
          const displayValue = getContactDisplayValue(contact);

          return (
            <div key={`${contact.type}-${contact.value}-${index}`} style={{ border: "1px solid var(--line)", borderRadius: 16, padding: 14, background: "rgba(255,255,255,0.72)" }}>
              <div className="actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <strong>{label}</strong>
                {contact.isPrimary ? <span className="tag">主联系方式</span> : null}
              </div>
              {href ? (
                <a className="mono" href={href}>
                  {displayValue}
                </a>
              ) : (
                <div className="mono">{displayValue}</div>
              )}
              {contact.visibility === "masked" ? <div className="hint">当前为掩码展示，如需进一步联系请谨慎核实身份。</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

