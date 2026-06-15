/**
 * NoticeForm
 * 作用：提供首版 notice 创建与编辑表单，保持结构化字段与 API schema 对齐。
 * 联动：app/page.tsx、manage 页面、notice.schema.ts、API routes。
 * 层级：component
 */
"use client";

import { type ChangeEvent, useState } from "react";
import { CopyButton } from "@/components/notice/CopyButton";
import { compressImageFile, uploadCompressedImage } from "@/lib/media/client-image";
import { type NoticeCreateInput } from "@/lib/notice/notice.schema";
import { getLocationFieldLabel, getNoticeCategoryLabel, getTimeFieldLabel } from "@/lib/notice/notice-display";
import { saveManagedNotice } from "@/lib/manage/manage-history";

type NoticeFormProps = {
  initialValue?: Partial<NoticeCreateInput>;
  manageToken?: string;
  mode?: "create" | "edit";
  shortId?: string;
};

const defaultNotice: NoticeCreateInput = {
  locale: "zh-CN",
  noticeCategory: "lost-pet",
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
      province: "",
      city: "",
      district: "",
      street: "",
      addressText: "",
      nearbyLandmark: "",
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
      url: "",
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

function toLocalDateString(isoString: string): string {
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

export function NoticeForm({ initialValue, manageToken, mode = "create", shortId }: NoticeFormProps) {
  const [payload, setPayload] = useState<NoticeCreateInput>(() => ({ ...defaultNotice, ...initialValue }));
  const [result, setResult] = useState<{ publicShareUrl: string; manageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const isEditMode = mode === "edit";
  const locationFieldLabel = getLocationFieldLabel(payload.noticeCategory);
  const timeFieldLabel = getTimeFieldLabel(payload.noticeCategory);
  const categoryLabel = getNoticeCategoryLabel(payload.noticeCategory);

  function handleCategoryChange(category: NoticeCreateInput["noticeCategory"]) {
    setPayload((current) => ({
      ...current,
      noticeCategory: category,
      petProfile: {
        ...current.petProfile,
        name: category === "found-owner" && !current.petProfile.name.trim() ? "未知" : current.petProfile.name
      }
    }));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 3);

    if (files.length === 0) {
      return;
    }

    setUploadingImages(true);
    setError(null);

    try {
      const compressedPhotos = await Promise.all(
        files.map(async (file, index) => {
          const compressed = await compressImageFile(file, index === 0);
          const uploaded = await uploadCompressedImage(compressed.blob, file.name || `pet-${index + 1}.jpg`);

          return {
            ...compressed.photo,
            url: uploaded.url
          };
        })
      );
      setPayload((current) => ({
        ...current,
        photos: compressedPhotos
      }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "图片处理失败。");
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  }

  function validateForm(): string | null {
    if (!payload.petProfile.name.trim() && payload.noticeCategory !== "found-owner") return "请填写宠物名称";
    if (payload.petProfile.name.length > 30) return "宠物名称不能超过 30 个字符";
    if (!payload.lostInfo.location.addressText.trim()) return `请填写${locationFieldLabel}详细地址`;
    if (payload.lostInfo.location.addressText.length > 200) return "详细地址不能超过 200 个字符";
    if (!payload.contactMethods[0]?.value.trim()) return "请填写联系方式";
    if (payload.contactMethods[0].value.length > 100) return "联系方式不能超过 100 个字符";
    if (payload.petProfile.description && payload.petProfile.description.length > 500) return "补充描述不能超过 500 个字符";
    return null;
  }

  function cleanPayload() {
    return {
      ...payload,
      photos: payload.photos.filter((p) => p.url),
      ownerNotificationEmail: payload.ownerNotificationEmail?.trim() || undefined,
      petProfile: {
        ...payload.petProfile,
        name: payload.petProfile.name.trim() || (payload.noticeCategory === "found-owner" ? "未知" : ""),
        description: payload.petProfile.description || undefined
      },
      lostInfo: {
        ...payload.lostInfo,
        location: {
          ...payload.lostInfo.location,
          province: payload.lostInfo.location.province?.trim() || undefined,
          city: payload.lostInfo.location.city?.trim() || undefined,
          district: payload.lostInfo.location.district?.trim() || undefined,
          street: payload.lostInfo.location.street?.trim() || undefined,
          nearbyLandmark: payload.lostInfo.location.nearbyLandmark?.trim() || undefined,
          addressText: payload.lostInfo.location.addressText.trim()
        }
      }
    };
  }

  async function handleSubmit() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    setError(null);

    try {
      const cleaned = cleanPayload();
      const endpoint = isEditMode ? `/api/notices/${shortId}?token=${encodeURIComponent(manageToken ?? "")}` : "/api/notices";
      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(cleaned)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message ?? "Create failed.");
      }

      if (isEditMode) {
        setResult(null);
      } else {
        setResult({
          publicShareUrl: data.publicShareUrl,
          manageUrl: data.manageUrl
        });
        localStorage.setItem("findMypet.latestManageUrl", data.manageUrl);
        saveManagedNotice({
          shortId: data.shortId,
          petName: cleaned.petProfile.name,
          noticeCategory: cleaned.noticeCategory,
          publicShareUrl: data.publicShareUrl,
          manageUrl: data.manageUrl,
          createdAt: new Date().toISOString()
        });
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : isEditMode ? "Update failed." : "Create failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid">
      <div className="panel section">
        <h2>{isEditMode ? `编辑${categoryLabel}启事` : `创建${categoryLabel}启事`}</h2>
        <div className="grid two-col">
          <div>
            <div className="field">
              <label>发布类型</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    checked={payload.noticeCategory === "lost-pet"}
                    name="noticeCategory"
                    onChange={() => handleCategoryChange("lost-pet")}
                    type="radio"
                    value="lost-pet"
                  />
                  寻宠（我丢了宠物）
                </label>
                <label className="radio-label">
                  <input
                    checked={payload.noticeCategory === "found-owner"}
                    name="noticeCategory"
                    onChange={() => handleCategoryChange("found-owner")}
                    type="radio"
                    value="found-owner"
                  />
                  寻主（我捡到了宠物）
                </label>
              </div>
            </div>

            <div className="field">
              <label htmlFor="petName">宠物名称</label>
              <input
                id="petName"
                maxLength={30}
                placeholder={payload.noticeCategory === "found-owner" ? '不知道可填"未知"' : "例如：小橘、豆豆"}
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
              {payload.noticeCategory === "found-owner" && !payload.petProfile.name.trim() ? (
                <div className="hint">寻主启事不知道名字可留空，将自动填为&ldquo;未知&rdquo;</div>
              ) : null}
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
                      type: event.target.value as NoticeCreateInput["petProfile"]["type"]
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
              <label htmlFor="photoUpload">宠物照片</label>
              <input accept="image/*" id="photoUpload" multiple onChange={handleImageChange} type="file" />
              <div className="hint">支持最多 3 张图片，浏览器会先压缩后再提交。</div>
              <div className="tag-list">
                {payload.photos.filter((photo) => photo.url).map((photo, index) => (
                  <button
                    className={`button ${photo.isPrimary ? "button-primary" : "button-secondary"}`}
                    key={`${photo.url}-${index}`}
                    onClick={() =>
                      setPayload((current) => ({
                        ...current,
                        photos: current.photos.map((item, itemIndex) => ({
                          ...item,
                          isPrimary: itemIndex === index
                        }))
                      }))
                    }
                    type="button"
                  >
                    {photo.isPrimary ? `主图 ${index + 1}` : `设为主图 ${index + 1}`}
                  </button>
                ))}
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", marginTop: 12 }}>
                {payload.photos.filter((photo) => photo.url).map((photo, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`宠物照片 ${index + 1}`}
                    className="notice-photo"
                    key={`${photo.url}-preview-${index}`}
                    src={photo.url}
                    style={{ aspectRatio: "1 / 1", minHeight: 120 }}
                  />
                ))}
              </div>
            </div>

            <fieldset className="field" style={{ border: "1px solid var(--color-border, #ddd)", borderRadius: 6, padding: 16 }}>
              <legend>{locationFieldLabel}</legend>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="province">省/直辖市</label>
                  <input
                    id="province"
                    maxLength={20}
                    placeholder="例如：北京市"
                    value={String(payload.lostInfo.location.province ?? "")}
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        lostInfo: {
                          ...current.lostInfo,
                          location: { ...current.lostInfo.location, province: event.target.value }
                        }
                      }))
                    }
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="city">市</label>
                  <input
                    id="city"
                    maxLength={20}
                    placeholder="例如：北京市"
                    value={String(payload.lostInfo.location.city ?? "")}
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        lostInfo: {
                          ...current.lostInfo,
                          location: { ...current.lostInfo.location, city: event.target.value }
                        }
                      }))
                    }
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="district">区/县</label>
                  <input
                    id="district"
                    maxLength={20}
                    placeholder="例如：朝阳区"
                    value={String(payload.lostInfo.location.district ?? "")}
                    onChange={(event) =>
                      setPayload((current) => ({
                        ...current,
                        lostInfo: {
                          ...current.lostInfo,
                          location: { ...current.lostInfo.location, district: event.target.value }
                        }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 8 }}>
                <label htmlFor="street">街道/乡镇</label>
                <input
                  id="street"
                  maxLength={50}
                  placeholder="例如：望京街道"
                  value={String(payload.lostInfo.location.street ?? "")}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      lostInfo: {
                        ...current.lostInfo,
                        location: { ...current.lostInfo.location, street: event.target.value }
                      }
                    }))
                  }
                />
              </div>

              <div className="field" style={{ marginBottom: 8 }}>
                <label htmlFor="addressText">详细地址</label>
                <input
                  id="addressText"
                  maxLength={200}
                  placeholder="例如：望京SOHO北门"
                  value={String(payload.lostInfo.location.addressText)}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      lostInfo: {
                        ...current.lostInfo,
                        location: { ...current.lostInfo.location, addressText: event.target.value }
                      }
                    }))
                  }
                />
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="nearbyLandmark">附近标志物</label>
                <input
                  id="nearbyLandmark"
                  maxLength={100}
                  placeholder="例如：地铁14号线望京站C口旁"
                  value={String(payload.lostInfo.location.nearbyLandmark ?? "")}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      lostInfo: {
                        ...current.lostInfo,
                        location: { ...current.lostInfo.location, nearbyLandmark: event.target.value }
                      }
                    }))
                  }
                />
              </div>
            </fieldset>

            <fieldset className="field" style={{ border: "1px solid var(--color-border, #ddd)", borderRadius: 6, padding: 16 }}>
              <legend>{timeFieldLabel}</legend>

              <div className="field" style={{ marginBottom: 8 }}>
                <label htmlFor="lostDate">日期</label>
                <input
                  id="lostDate"
                  type="date"
                  value={payload.lostInfo.lostTime.startAt ? toLocalDateString(payload.lostInfo.lostTime.startAt) : ""}
                  onChange={(event) => {
                    const dateValue = event.target.value;
                    setPayload((current) => ({
                      ...current,
                      lostInfo: {
                        ...current.lostInfo,
                        lostTime: {
                          ...current.lostInfo.lostTime,
                          startAt: dateValue ? new Date(`${dateValue}T12:00:00`).toISOString() : undefined
                        }
                      }
                    }));
                  }}
                />
              </div>

              <div className="field" style={{ marginBottom: 8 }}>
                <label>时间精度</label>
                <div className="radio-group">
                  {([
                    { value: "exact", label: "精确时间" },
                    { value: "day", label: "当天" },
                    { value: "approx", label: "大约" }
                  ] as const).map((opt) => (
                    <label className="radio-label" key={opt.value}>
                      <input
                        checked={payload.lostInfo.lostTime.precision === opt.value}
                        name="timePrecision"
                        onChange={() =>
                          setPayload((current) => ({
                            ...current,
                            lostInfo: {
                              ...current.lostInfo,
                              lostTime: { ...current.lostInfo.lostTime, precision: opt.value }
                            }
                          }))
                        }
                        type="radio"
                        value={opt.value}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="lostDisplay">补充说明</label>
                <input
                  id="lostDisplay"
                  maxLength={100}
                  placeholder={payload.noticeCategory === "found-owner" ? "例如：今天下午 3 点左右" : "例如：昨晚 8 点左右"}
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
            </fieldset>

            <div className="field">
              <label htmlFor="contact">主联系方式</label>
              <input
                id="contact"
                maxLength={100}
                placeholder="例如：13800138000"
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
            {!isEditMode ? (
              <div className="field">
                <label htmlFor="ownerEmail">管理链接邮箱</label>
                <input
                  id="ownerEmail"
                  maxLength={100}
                  type="email"
                  value={String(payload.ownerNotificationEmail)}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      ownerNotificationEmail: event.target.value
                    }))
                  }
                />
                <div className="hint">仅用于接收管理链接，不自动公开展示。创建后如需找回，请使用管理链接或“我的启事”。</div>
              </div>
            ) : null}

            <div className="field">
              <label htmlFor="description">补充描述</label>
              <textarea
                id="description"
                maxLength={500}
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
              <div className="hint">{payload.petProfile.description?.length ?? 0}/500</div>
            </div>

            <div className="field">
              <label htmlFor="rewardRecovery">找回奖励（分）</label>
              <input
                id="rewardRecovery"
                max={10000000}
                min={0}
                type="number"
                value={Number(payload.rewards?.recovery?.amountMinor ?? 0)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    rewards: {
                      ...current.rewards,
                      recovery: {
                        ...current.rewards?.recovery,
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
                    className={`button ${payload.riskFlags?.[risk.key] ? "button-primary" : "button-secondary"}`}
                    key={risk.key}
                    onClick={() =>
                      setPayload((current) => ({
                        ...current,
                        riskFlags: {
                          ...current.riskFlags,
                          [risk.key]: !current.riskFlags?.[risk.key]
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
          <button className="button button-primary" disabled={pending || uploadingImages} onClick={handleSubmit} type="button">
            {uploadingImages ? "图片处理中..." : pending ? (isEditMode ? "保存中..." : "生成中...") : isEditMode ? "保存修改" : `生成${categoryLabel}海报与分享页`}
          </button>
        </div>

        {error ? <p className="danger-box">{error}</p> : null}
        {result && !isEditMode ? (
          <div className="panel section" style={{ marginTop: 20 }}>
            <h3>启事已生成</h3>
            <div className="field">
              <label>公开分享页</label>
              <div className="actions">
                <a className="button button-primary" href={result.publicShareUrl} target="_blank" rel="noopener noreferrer">
                  查看分享页
                </a>
                <CopyButton label="复制公开链接" text={result.publicShareUrl} />
              </div>
            </div>
            <div className="field">
              <label>管理页（请妥善保存）</label>
              <div className="actions">
                <a className="button button-secondary" href={result.manageUrl} target="_blank" rel="noopener noreferrer">
                  打开管理页
                </a>
                <CopyButton label="复制管理链接" text={result.manageUrl} />
              </div>
              <p className="hint">匿名模式下，管理链接就是刷新、编辑和标记找回的凭证。建议复制保存或发送到自己的邮箱。</p>
            </div>
            <div className="field">
              <label>海报页</label>
              <a className="button button-secondary" href={result.publicShareUrl.replace("/notice/", "/poster/")} target="_blank" rel="noopener noreferrer">
                查看海报
              </a>
            </div>
          </div>
        ) : null}
        {!error && !result && isEditMode ? <p className="hint">保存后会更新分享页内容与版本号。</p> : null}
      </div>
    </div>
  );
}
