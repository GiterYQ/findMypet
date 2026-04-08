/**
 * NoticeForm
 * 作用：提供首版 notice 创建与编辑表单，保持结构化字段与 API schema 对齐。
 * 联动：app/page.tsx、manage 页面、notice.schema.ts、API routes。
 * 层级：component
 */
"use client";

import { useState } from "react";

type NoticeFormProps = {
  initialValue?: Record<string, unknown>;
};

const defaultNotice = {
  locale: "zh-CN",
  petProfile: {
    name: "",
    type: "cat",
    breed: "",
    color: [],
    gender: "unknown",
    ageText: "",
    bodySize: "medium",
    neutered: "unknown",
    collar: "",
    leash: false,
    distinctiveFeatures: [],
    healthNotes: "",
    description: ""
  },
  lostInfo: {
    lostTime: {
      precision: "approx",
      startAt: new Date().toISOString(),
      displayText: "",
      timezone: "Asia/Shanghai"
    },
    location: {
      addressText: "",
      placeName: "",
      regionCode: "",
      privacyLevel: "approximate"
    }
  },
  contactMethods: [
    {
      type: "phone",
      value: "",
      visibility: "public",
      isPrimary: true
    }
  ],
  rewards: {
    clue: {
      enabled: false,
      amountMinor: 0,
      currency: "CNY",
      note: ""
    },
    recovery: {
      enabled: false,
      amountMinor: 0,
      currency: "CNY",
      note: ""
    }
  },
  photos: [
    {
      url: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
      isPrimary: true
    }
  ],
  riskFlags: {
    criticalCondition: false,
    needsMedication: false,
    infectiousDisease: false,
    blindOrDeaf: false,
    disabledMobility: false,
    seniorPet: false,
    youngPet: false,
    inTrafficDangerZone: false,
    inExtremeWeather: false
  },
  ownerNotificationEmail: ""
};

const riskOptions = [
  { key: "criticalCondition", label: "病危" },
  { key: "needsMedication", label: "需喂药" },
  { key: "infectiousDisease", label: "传染病" },
  { key: "blindOrDeaf", label: "失明/听障" },
  { key: "disabledMobility", label: "行动障碍" },
  { key: "seniorPet", label: "老年宠物" },
  { key: "youngPet", label: "幼宠" },
  { key: "inTrafficDangerZone", label: "高速路/高车流" },
  { key: "inExtremeWeather", label: "极端天气" }
] as const;

export function NoticeForm({ initialValue }: NoticeFormProps) {
  const [payload, setPayload] = useState(() => ({ ...defaultNotice, ...initialValue }));
  const [result, setResult] = useState<{ publicShareUrl: string; manageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message ?? "Create failed.");
      }

      setResult({
        publicShareUrl: data.publicShareUrl,
        manageUrl: data.manageUrl
      });
      localStorage.setItem("findMypet.latestManageUrl", data.manageUrl);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Create failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid">
      <div className="panel section">
        <h2>创建寻宠启事</h2>
        <div className="grid two-col">
          <div>
            <div className="field">
              <label htmlFor="petName">宠物名称</label>
              <input
                id="petName"
                value={String(payload.petProfile.name)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    petProfile: {
                      ...current.petProfile,
                      name: event.target.value
                    }
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="petType">宠物类型</label>
              <select
                id="petType"
                value={String(payload.petProfile.type)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    petProfile: {
                      ...current.petProfile,
                      type: event.target.value
                    }
                  }))
                }
              >
                <option value="cat">猫</option>
                <option value="dog">狗</option>
                <option value="bird">鸟</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="photoUrl">主图 URL</label>
              <input
                id="photoUrl"
                value={String(payload.photos[0].url)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    photos: [
                      {
                        ...current.photos[0],
                        url: event.target.value,
                        isPrimary: true
                      }
                    ]
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="location">丢失地点</label>
              <input
                id="location"
                value={String(payload.lostInfo.location.addressText)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    lostInfo: {
                      ...current.lostInfo,
                      location: {
                        ...current.lostInfo.location,
                        addressText: event.target.value
                      }
                    }
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="lostDisplay">丢失时间说明</label>
              <input
                id="lostDisplay"
                placeholder="例如：昨晚 8 点左右"
                value={String(payload.lostInfo.lostTime.displayText)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    lostInfo: {
                      ...current.lostInfo,
                      lostTime: {
                        ...current.lostInfo.lostTime,
                        displayText: event.target.value
                      }
                    }
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="contact">主联系方式</label>
              <input
                id="contact"
                value={String(payload.contactMethods[0].value)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    contactMethods: [
                      {
                        ...current.contactMethods[0],
                        value: event.target.value
                      }
                    ]
                  }))
                }
              />
            </div>
          </div>

          <div>
            <div className="field">
              <label htmlFor="ownerEmail">管理链接邮箱</label>
              <input
                id="ownerEmail"
                type="email"
                value={String(payload.ownerNotificationEmail)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    ownerNotificationEmail: event.target.value
                  }))
                }
              />
              <div className="hint">仅用于接收管理链接，不自动公开展示。</div>
            </div>

            <div className="field">
              <label htmlFor="description">补充描述</label>
              <textarea
                id="description"
                value={String(payload.petProfile.description)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    petProfile: {
                      ...current.petProfile,
                      description: event.target.value
                    }
                  }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="rewardRecovery">找回奖励（分）</label>
              <input
                id="rewardRecovery"
                type="number"
                value={Number(payload.rewards.recovery.amountMinor)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    rewards: {
                      ...current.rewards,
                      recovery: {
                        ...current.rewards.recovery,
                        enabled: Number(event.target.value) > 0,
                        amountMinor: Number(event.target.value)
                      }
                    }
                  }))
                }
              />
            </div>

            <div className="field">
              <label>紧急风险标签</label>
              <div className="tag-list">
                {riskOptions.map((risk) => (
                  <button
                    className={`button ${payload.riskFlags[risk.key] ? "button-primary" : "button-secondary"}`}
                    key={risk.key}
                    onClick={() =>
                      setPayload((current) => ({
                        ...current,
                        riskFlags: {
                          ...current.riskFlags,
                          [risk.key]: !current.riskFlags[risk.key]
                        }
                      }))
                    }
                    type="button"
                  >
                    {risk.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="danger-box">
              防骗提示：未核实前，请勿提前支付任何费用。高风险标签会影响公开列表排序，请如实填写。
            </div>
          </div>
        </div>

        <div className="actions" style={{ marginTop: 20 }}>
          <button className="button button-primary" disabled={pending} onClick={handleSubmit} type="button">
            {pending ? "生成中..." : "生成海报与分享页"}
          </button>
        </div>

        {error ? <p className="danger-box">{error}</p> : null}
        {result ? (
          <div className="panel section" style={{ marginTop: 20 }}>
            <h3>已生成</h3>
            <p className="mono">公开页：{result.publicShareUrl}</p>
            <p className="mono">管理页：{result.manageUrl}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

