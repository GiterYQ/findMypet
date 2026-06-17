/**
 * NoticeForm
 * 作用：提供首版 notice 创建与编辑表单，保持结构化字段与 API schema 对齐。
 * 联动：app/page.tsx、manage 页面、notice.schema.ts、API routes。
 * 层级：component
 */
"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { CopyButton } from "@/components/notice/CopyButton";
import { compressImageFile, uploadCompressedImage } from "@/lib/media/client-image";
import { formatAmountMinorForDisplay, majorAmountInputToMinor, minorAmountToMajorInput } from "@/lib/notice/money";
import {
  getNoticeFormRequiredSummary,
  getNoticeFormNextButtonLabel,
  getNoticeFormStep,
  type NoticeFormStepField,
  isNoticeFormFieldRequired,
  noticeFormSteps
} from "@/lib/notice/notice-form-steps";
import { type NoticeCreateInput } from "@/lib/notice/notice.schema";
import { getFullLocationText, getLocationFieldLabel, getNoticeCategoryLabel, getPetTypeDisplayName, getTimeFieldLabel } from "@/lib/notice/notice-display";
import { saveManagedNotice } from "@/lib/manage/manage-history";
import { getHalfHourTimeOptions, getNoticeTimeDisplayOptions } from "@/lib/notice/notice-time-options";

type NoticeFormProps = {
  initialValue?: Partial<NoticeCreateInput>;
  manageToken?: string;
  mode?: "create" | "edit";
  shortId?: string;
};

type ChinaDivisionOption = {
  code: string;
  name: string;
};

const defaultNotice: NoticeCreateInput = {
  locale: "zh-CN",
  noticeCategory: "lost-pet",
  petProfile: {
    name: "",
    type: "cat",
    customType: "",
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

const leftColumnStepFields = new Set<NoticeFormStepField>([
  "noticeCategory",
  "petName",
  "petType",
  "addressText",
  "nearbyLandmark",
  "photoUpload",
  "lostDate",
  "timePrecision",
  "lostDisplay",
  "contact"
]);

const rightColumnStepFields = new Set<NoticeFormStepField>([
  "description",
  "riskFlags",
  "rewardRecovery",
  "ownerEmail",
  "antiScam"
]);

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

function toLocalTimeString(isoString?: string): string {
  if (!isoString) {
    return "12:00";
  }

  try {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = date.getMinutes() < 30 ? "00" : "30";
    return `${hours}:${minutes}`;
  } catch {
    return "12:00";
  }
}

function buildLocalDateTimeIso(dateValue: string, timeValue: string): string | undefined {
  if (!dateValue) {
    return undefined;
  }

  return new Date(`${dateValue}T${timeValue || "12:00"}:00`).toISOString();
}

function isHalfHourTimeValue(value?: string): boolean {
  return Boolean(value && /^\d{2}:(00|30)$/.test(value));
}

function buildAddressTextFallback(location: NoticeCreateInput["lostInfo"]["location"]) {
  return [
    location.province,
    location.city,
    location.district,
    location.street
  ]
    .filter((part): part is string => Boolean(part?.trim()))
    .join("");
}

function hasUsableLocation(location: NoticeCreateInput["lostInfo"]["location"]) {
  return Boolean(location.addressText.trim() || buildAddressTextFallback(location));
}

function compactPreviewText(value: string, fallback: string, maxLength = 54) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

function ensureSelectedDivisionOption(options: ChinaDivisionOption[], selectedName: string, selectedCode?: string) {
  if (!selectedName || options.some((option) => option.name === selectedName)) {
    return options;
  }

  return [{ code: selectedCode || selectedName, name: selectedName }, ...options];
}

async function loadChinaDivisionOptions(params: Record<string, string>) {
  const url = new URL("/api/location/china-divisions", window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("china divisions request failed");
  }

  const data = (await response.json()) as { options?: ChinaDivisionOption[] };
  return data.options ?? [];
}

export function NoticeForm({ initialValue, manageToken, mode = "create", shortId }: NoticeFormProps) {
  const [payload, setPayload] = useState<NoticeCreateInput>(() => ({ ...defaultNotice, ...initialValue }));
  const [result, setResult] = useState<{ publicShareUrl: string; manageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [showManualLocationFields, setShowManualLocationFields] = useState(() =>
    Boolean(initialValue?.lostInfo?.location?.province || initialValue?.lostInfo?.location?.city || initialValue?.lostInfo?.location?.district)
  );
  const [provinceOptions, setProvinceOptions] = useState<ChinaDivisionOption[]>([]);
  const [cityOptions, setCityOptions] = useState<ChinaDivisionOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<ChinaDivisionOption[]>([]);
  const [streetOptions, setStreetOptions] = useState<ChinaDivisionOption[]>([]);
  const [showNearbyLandmark, setShowNearbyLandmark] = useState(() => Boolean(initialValue?.lostInfo?.location?.nearbyLandmark));
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const isEditMode = mode === "edit";
  const isStepFlow = !isEditMode;
  const activeStep = getNoticeFormStep(activeStepIndex);
  const activeStepFields: readonly NoticeFormStepField[] = activeStep.fields;
  const isFinalCreateStep = isStepFlow && activeStepIndex === noticeFormSteps.length - 1;
  const hasLeftColumnFields =
    isEditMode || activeStepFields.some((field) => leftColumnStepFields.has(field));
  const hasRightColumnFields =
    isEditMode || activeStepFields.some((field) => rightColumnStepFields.has(field));
  const locationFieldLabel = getLocationFieldLabel(payload.noticeCategory);
  const timeFieldLabel = getTimeFieldLabel(payload.noticeCategory);
  const categoryLabel = getNoticeCategoryLabel(payload.noticeCategory);
  const selectedRiskLabels = riskOptions
    .filter((risk) => Boolean(payload.riskFlags?.[risk.key]))
    .map((risk) => risk.label);
  const uploadedPhotoCount = payload.photos.filter((photo) => photo.url).length;
  const recoveryRewardMinor = Number(payload.rewards?.recovery?.amountMinor ?? 0);
  const nextStepLabel = getNoticeFormNextButtonLabel(activeStep.id);
  const timeDisplayOptions = getNoticeTimeDisplayOptions(payload.noticeCategory);
  const currentTimeDisplay = String(payload.lostInfo.lostTime.displayText ?? "");
  const halfHourTimeOptions = getHalfHourTimeOptions();
  const selectedDateValue = payload.lostInfo.lostTime.startAt ? toLocalDateString(payload.lostInfo.lostTime.startAt) : "";
  const selectedExactTimeValue = isHalfHourTimeValue(currentTimeDisplay)
    ? currentTimeDisplay
    : toLocalTimeString(payload.lostInfo.lostTime.startAt);
  const visibleTimeDisplayOptions =
    currentTimeDisplay && !timeDisplayOptions.some((option) => option.value === currentTimeDisplay)
      ? [{ label: currentTimeDisplay, value: currentTimeDisplay }, ...timeDisplayOptions]
      : timeDisplayOptions;
  const requiredSummary = getNoticeFormRequiredSummary(activeStep.id);
  const completedStepCount = activeStepIndex;
  const remainingStepCount = Math.max(noticeFormSteps.length - activeStepIndex - 1, 0);
  const selectedProvince = String(payload.lostInfo.location.province ?? "");
  const selectedCity = String(payload.lostInfo.location.city ?? "");
  const selectedDistrict = String(payload.lostInfo.location.district ?? "");
  const selectedStreet = String(payload.lostInfo.location.street ?? "");
  const selectedProvinceOption = provinceOptions.find((option) => option.name === selectedProvince);
  const selectedCityOption = cityOptions.find((option) => option.name === selectedCity);
  const selectedDistrictOption = districtOptions.find((option) => option.name === selectedDistrict);
  const visibleProvinceOptions = ensureSelectedDivisionOption(provinceOptions, selectedProvince);
  const visibleCityOptions = ensureSelectedDivisionOption(cityOptions, selectedCity);
  const visibleDistrictOptions = ensureSelectedDivisionOption(districtOptions, selectedDistrict);
  const visibleStreetOptions = ensureSelectedDivisionOption(streetOptions, selectedStreet);
  const previewLocationText = getFullLocationText(payload.lostInfo.location) || "填写地址后显示在这里";
  const previewTitleText = compactPreviewText(payload.petProfile.name, "未知", 16);
  const previewPetTypeText = compactPreviewText(getPetTypeDisplayName(payload.petProfile), "宠物", 12);
  const previewAddressText = compactPreviewText(previewLocationText, "填写地址后显示在这里", 56);
  const previewContactText = compactPreviewText(payload.contactMethods[0]?.value ?? "", "填写联系方式后显示", 32);
  const previewPhoto = payload.photos.find((photo) => photo.url);
  const hasPreviewPhoto = Boolean(previewPhoto);
  const canShowManualLocationFields = isEditMode || showManualLocationFields;

  useEffect(() => {
    if (!canShowManualLocationFields) {
      return;
    }

    let cancelled = false;

    loadChinaDivisionOptions({ level: "provinces" })
      .then((options) => {
        if (!cancelled) {
          setProvinceOptions(options);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [canShowManualLocationFields]);

  useEffect(() => {
    if (!canShowManualLocationFields || !selectedProvinceOption?.code) {
      setCityOptions([]);
      return;
    }

    let cancelled = false;

    loadChinaDivisionOptions({ level: "cities", provinceCode: selectedProvinceOption.code })
      .then((options) => {
        if (!cancelled) {
          setCityOptions(options);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [canShowManualLocationFields, selectedProvinceOption?.code]);

  useEffect(() => {
    if (!canShowManualLocationFields || !selectedCityOption?.code) {
      setDistrictOptions([]);
      return;
    }

    let cancelled = false;

    loadChinaDivisionOptions({ level: "areas", cityCode: selectedCityOption.code })
      .then((options) => {
        if (!cancelled) {
          setDistrictOptions(options);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [canShowManualLocationFields, selectedCityOption?.code]);

  useEffect(() => {
    if (!canShowManualLocationFields || !selectedDistrictOption?.code) {
      setStreetOptions([]);
      return;
    }

    let cancelled = false;

    loadChinaDivisionOptions({ level: "streets", areaCode: selectedDistrictOption.code })
      .then((options) => {
        if (!cancelled) {
          setStreetOptions(options);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [canShowManualLocationFields, selectedDistrictOption?.code]);

  function isFieldVisible(field: NoticeFormStepField) {
    return isEditMode || activeStepFields.includes(field);
  }

  function isCurrentFieldRequired(field: NoticeFormStepField) {
    return isStepFlow ? isNoticeFormFieldRequired(activeStep.id, field) : field === "addressText" || field === "contact";
  }

  function renderRequirementBadge(field: NoticeFormStepField) {
    const isRequired = isCurrentFieldRequired(field);

    return (
      <span className={`notice-field-badge ${isRequired ? "notice-field-badge-required" : "notice-field-badge-optional"}`}>
        {isRequired ? "必填" : "可选"}
      </span>
    );
  }

  function renderFieldLabel(field: NoticeFormStepField, label: string, htmlFor?: string) {
    return (
      <label className="notice-field-label" htmlFor={htmlFor}>
        <span>{label}</span>
        {renderRequirementBadge(field)}
      </label>
    );
  }

  function renderLegend(field: NoticeFormStepField, label: string) {
    return (
      <span className="notice-field-label">
        <span>{label}</span>
        {renderRequirementBadge(field)}
      </span>
    );
  }

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

  async function handleReverseGeocodeLocation(latitude: number, longitude: number) {
    const response = await fetch("/api/location/reverse-geocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lat: latitude,
        lng: longitude,
        language: payload.locale
      })
    });

    if (!response.ok) {
      throw new Error("reverse geocode failed");
    }

    const data = (await response.json()) as {
      location?: {
        province?: string;
        city?: string;
        district?: string;
        street?: string;
        addressText?: string;
        placeName?: string;
        regionCode?: string;
      } | null;
    };

    if (!data.location) {
      setShowManualLocationFields(true);
      return false;
    }

    setPayload((current) => ({
      ...current,
      lostInfo: {
        ...current.lostInfo,
        location: {
          ...current.lostInfo.location,
          province: data.location?.province ?? current.lostInfo.location.province,
          city: data.location?.city ?? current.lostInfo.location.city,
          district: data.location?.district ?? current.lostInfo.location.district,
          street: data.location?.street ?? current.lostInfo.location.street,
          addressText: data.location?.addressText ?? current.lostInfo.location.addressText,
          placeName: data.location?.placeName ?? current.lostInfo.location.placeName,
          regionCode: data.location?.regionCode ?? current.lostInfo.location.regionCode
        }
      }
    }));

    const resolved = Boolean(data.location.addressText || data.location.city || data.location.district);
    setShowManualLocationFields(!resolved);
    return resolved;
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("位置识别失败，请手动输入位置。");
      setShowManualLocationFields(true);
      return;
    }

    setLocating(true);
    setLocationStatus("正在请求定位权限...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setPayload((current) => ({
          ...current,
          lostInfo: {
            ...current.lostInfo,
            location: {
              ...current.lostInfo.location,
              lat: latitude,
              lng: longitude,
              privacyLevel: "approximate"
            }
          }
        }));
        setLocationStatus("已获取当前位置，正在识别省市区...");

        try {
          const resolved = await handleReverseGeocodeLocation(latitude, longitude);
          setLocationStatus(resolved ? "已自动填入大致地址，请检查并补充门口/楼栋等细节。" : "位置识别失败，请手动输入位置。");
        } catch {
          setLocationStatus("位置识别失败，请手动输入位置。");
          setShowManualLocationFields(true);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocationStatus("位置识别失败，请手动输入位置。");
        setShowManualLocationFields(true);
        setLocating(false);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60_000,
        timeout: 10_000
      }
    );
  }

  function validateForm(): string | null {
    if (payload.petProfile.name.length > 30) return "宠物名称不能超过 30 个字符";
    if (!hasUsableLocation(payload.lostInfo.location)) return `请填写${locationFieldLabel}`;
    if (payload.lostInfo.location.addressText.length > 200) return "详细地址不能超过 200 个字符";
    if (!payload.contactMethods[0]?.value.trim()) return "请填写联系方式";
    if (payload.contactMethods[0].value.length > 100) return "联系方式不能超过 100 个字符";
    if (payload.petProfile.description && payload.petProfile.description.length > 500) return "补充描述不能超过 500 个字符";
    return null;
  }

  function validateStepBeforeNext(): string | null {
    if (activeStep.id !== "essentials") {
      return null;
    }

    if (payload.petProfile.name.length > 30) return "宠物名称不能超过 30 个字符";
    if (!hasUsableLocation(payload.lostInfo.location)) return `请填写${locationFieldLabel}`;
    if (payload.lostInfo.location.addressText.length > 200) return "详细地址不能超过 200 个字符";
    if (!payload.contactMethods[0]?.value.trim()) return "请填写联系方式";
    if (payload.contactMethods[0].value.length > 100) return "联系方式不能超过 100 个字符";

    return null;
  }

  function goToNextStep() {
    const validationError = validateStepBeforeNext();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setActiveStepIndex((current) => Math.min(current + 1, noticeFormSteps.length - 1));
  }

  function goToPreviousStep() {
    setError(null);
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  function cleanPayload() {
    const fallbackAddressText = buildAddressTextFallback(payload.lostInfo.location);
    const addressText = payload.lostInfo.location.addressText.trim() || fallbackAddressText;

    return {
      ...payload,
      photos: payload.photos.filter((p) => p.url),
      ownerNotificationEmail: payload.ownerNotificationEmail?.trim() || undefined,
      petProfile: {
        ...payload.petProfile,
        name: payload.petProfile.name.trim() || "未知",
        customType: payload.petProfile.type === "other" ? payload.petProfile.customType?.trim() || undefined : undefined,
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
          addressText
        }
      }
    };
  }

  async function handleSubmit() {
    const validationError = validateForm();
    if (validationError) {
      if (isStepFlow) {
        setActiveStepIndex(validationError.includes("补充描述") ? 1 : 0);
      }
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
      <div className={isStepFlow ? `panel section notice-step-theme notice-step-theme-${activeStep.tone}` : "panel section"}>
        <h2>{isEditMode ? `编辑${categoryLabel}启事` : `创建${categoryLabel}启事`}</h2>
        {isStepFlow ? (
          <div className="notice-stepper" aria-label="创建进度">
            <div className="notice-step-context" aria-label="当前步骤说明">
              <div>
                <span className="notice-step-context-kicker">当前任务</span>
                <strong>{activeStep.goal}</strong>
              </div>
              <div className="notice-step-context-meter">
                <span className="notice-step-context-stat">
                  已完成 <strong>{completedStepCount}</strong>
                </span>
                <span className="notice-step-context-stat">
                  剩余 <strong>{remainingStepCount}</strong>
                </span>
                <span className="notice-step-context-stat">{activeStep.estimate}</span>
              </div>
            </div>
            <div className="notice-stepper-header">
              <span>
                {activeStepIndex + 1}/{noticeFormSteps.length}
              </span>
              <div>
                <strong>{activeStep.title}</strong>
                <p>{activeStep.summary}</p>
                <p className="notice-step-required-summary">{requiredSummary}</p>
                {activeStep.skippable ? <p>这一步可不填，直接点下一步。</p> : null}
              </div>
            </div>
            <div className="notice-stepper-track">
              {noticeFormSteps.map((step, index) => (
                <button
                  aria-label={`跳转到第 ${index + 1} 步：${step.title}`}
                  aria-current={index === activeStepIndex ? "step" : undefined}
                  className={`notice-step-pill ${index === activeStepIndex ? "notice-step-pill-active" : ""}`}
                  key={step.id}
                  onClick={() => setActiveStepIndex(index)}
                  type="button"
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className={`grid ${isEditMode ? "two-col" : "notice-step-grid notice-step-grid-with-preview"}`}>
          {hasLeftColumnFields ? (
            <div className="notice-step-grid-form-column">
            {isFieldVisible("noticeCategory") ? (
              <div className="field">
              {renderFieldLabel("noticeCategory", "发布类型")}
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
            ) : null}

            {isFieldVisible("photoUpload") ? (
              <div className="field">
              {renderFieldLabel("photoUpload", "宠物照片", "photoUpload")}
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
              <div className="notice-upload-preview-grid">
                {payload.photos.filter((photo) => photo.url).map((photo, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`宠物照片 ${index + 1}`}
                    className="notice-upload-preview-photo"
                    key={`${photo.url}-preview-${index}`}
                    src={photo.url}
                  />
                ))}
              </div>
            </div>
            ) : null}

            {isFieldVisible("addressText") || isFieldVisible("nearbyLandmark") ? (
              <fieldset className="field" style={{ border: "1px solid var(--color-border, #ddd)", borderRadius: 8, padding: 10 }}>
              <legend>{renderLegend("addressText", locationFieldLabel)}</legend>

              <div className="notice-location-choice-row">
                <div className="notice-location-tools">
                  <button
                    className="button button-secondary notice-location-button"
                    disabled={locating}
                    onClick={handleUseCurrentLocation}
                    type="button"
                  >
                    {locating ? "定位中..." : "使用当前位置"}
                  </button>
                </div>

                <button
                  className="notice-manual-location-toggle"
                  onClick={() => setShowManualLocationFields((current) => !current)}
                  type="button"
                >
                  {canShowManualLocationFields ? "收起位置选择" : "手动选择位置"}
                </button>
              </div>
              <span className="notice-location-status">
                {locationStatus ?? "定位和手动输入二选一；定位失败时可直接手动填写。"}
              </span>

              <div className={`notice-manual-location-panel ${canShowManualLocationFields ? "notice-manual-location-panel-open" : ""}`}>
                <div className="notice-manual-location-grid">
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="sr-only" htmlFor="province">选择省份</label>
                    <select
                      aria-label="选择省份"
                      id="province"
                      value={selectedProvinceOption?.code ?? selectedProvince}
                      onChange={(event) => {
                        const nextProvince = visibleProvinceOptions.find((option) => option.code === event.target.value);
                        setPayload((current) => ({
                          ...current,
                          lostInfo: {
                            ...current.lostInfo,
                            location: {
                              ...current.lostInfo.location,
                              province: nextProvince?.name ?? "",
                              city: "",
                              district: "",
                              street: "",
                              regionCode: nextProvince?.code
                            }
                          }
                        }));
                      }}
                    >
                      <option value="">选择省份</option>
                      {visibleProvinceOptions.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="sr-only" htmlFor="city">选择城市</label>
                    <select
                      aria-label="选择城市"
                      id="city"
                      value={selectedCityOption?.code ?? selectedCity}
                      onChange={(event) => {
                        const nextCity = visibleCityOptions.find((option) => option.code === event.target.value);
                        setPayload((current) => ({
                          ...current,
                          lostInfo: {
                            ...current.lostInfo,
                            location: {
                              ...current.lostInfo.location,
                              city: nextCity?.name ?? "",
                              district: "",
                              street: "",
                              regionCode: nextCity?.code ?? current.lostInfo.location.regionCode
                            }
                          }
                        }));
                      }}
                    >
                      <option value="">选择城市</option>
                      {visibleCityOptions.map((city) => (
                        <option key={city.code} value={city.code}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="sr-only" htmlFor="district">选择区县</label>
                    <select
                      aria-label="选择区县"
                      id="district"
                      value={selectedDistrictOption?.code ?? selectedDistrict}
                      onChange={(event) => {
                        const nextDistrict = visibleDistrictOptions.find((option) => option.code === event.target.value);
                        setPayload((current) => ({
                          ...current,
                          lostInfo: {
                            ...current.lostInfo,
                            location: {
                              ...current.lostInfo.location,
                              district: nextDistrict?.name ?? "",
                              street: "",
                              regionCode: nextDistrict?.code ?? current.lostInfo.location.regionCode
                            }
                          }
                        }));
                      }}
                    >
                      <option value="">选择区县</option>
                      {visibleDistrictOptions.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field notice-manual-location-street" style={{ marginBottom: 8 }}>
                    <label className="sr-only" htmlFor="street">填写街道或乡镇</label>
                    <input
                      aria-label="填写街道或乡镇"
                      id="street"
                      list="streetOptions"
                      maxLength={50}
                      placeholder="例如：望京街道"
                      value={selectedStreet}
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
                    <datalist id="streetOptions">
                      {visibleStreetOptions.map((street) => (
                        <option key={street.code} value={street.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="field" style={{ marginBottom: 8 }}>
                {renderFieldLabel("addressText", "详细地址", "addressText")}
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
                <div className="hint">如果已经选择省市区街道，这里可只补门口、楼栋或路口。</div>
              </div>

              {showNearbyLandmark ? (
                <div className="field notice-landmark-field" style={{ marginBottom: 0 }}>
                  <div className="notice-landmark-label-row">
                    {renderFieldLabel("nearbyLandmark", "附近标志物", "nearbyLandmark")}
                    <button
                      aria-label="取消附近标志物"
                      className="notice-landmark-remove"
                      onClick={() => {
                        setShowNearbyLandmark(false);
                        setPayload((current) => ({
                          ...current,
                          lostInfo: {
                            ...current.lostInfo,
                            location: {
                              ...current.lostInfo.location,
                              nearbyLandmark: ""
                            }
                          }
                        }));
                      }}
                      type="button"
                    >
                      -
                    </button>
                  </div>
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
              ) : (
                <button className="notice-landmark-toggle" onClick={() => setShowNearbyLandmark(true)} type="button">
                  <span>+</span>
                  添加附近标志物
                </button>
              )}
            </fieldset>
            ) : null}

            {isFieldVisible("lostDate") || isFieldVisible("timePrecision") || isFieldVisible("lostDisplay") ? (
              <fieldset className="field" style={{ border: "1px solid var(--color-border, #ddd)", borderRadius: 8, padding: 10 }}>
              <legend>{renderLegend("lostDate", timeFieldLabel)}</legend>

              <div className="field" style={{ marginBottom: 8 }}>
                {renderFieldLabel("lostDate", "日期", "lostDate")}
                <input
                  id="lostDate"
                  type="date"
                  value={selectedDateValue}
                  onChange={(event) => {
                    const dateValue = event.target.value;
                    const timeValue = payload.lostInfo.lostTime.precision === "exact" ? selectedExactTimeValue : "12:00";
                    setPayload((current) => ({
                      ...current,
                      lostInfo: {
                        ...current.lostInfo,
                        lostTime: {
                          ...current.lostInfo.lostTime,
                          startAt: buildLocalDateTimeIso(dateValue, timeValue)
                        }
                      }
                    }));
                  }}
                />
              </div>

              <div className="field" style={{ marginBottom: 8 }}>
                {renderFieldLabel("timePrecision", "时间精度")}
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
                        onChange={() => {
                          const dateValue = selectedDateValue || toLocalDateString(new Date().toISOString());
                          const exactTimeValue = selectedExactTimeValue || "12:00";
                          setPayload((current) => ({
                            ...current,
                            lostInfo: {
                              ...current.lostInfo,
                              lostTime: {
                                ...current.lostInfo.lostTime,
                                precision: opt.value,
                                startAt:
                                  opt.value === "exact"
                                    ? buildLocalDateTimeIso(dateValue, exactTimeValue)
                                    : current.lostInfo.lostTime.startAt,
                                displayText: opt.value === "exact" ? exactTimeValue : ""
                              }
                            }
                          }));
                        }}
                        type="radio"
                        value={opt.value}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                {renderFieldLabel("lostDisplay", payload.lostInfo.lostTime.precision === "exact" ? "具体时间" : "补充说明", "lostDisplay")}
                <select
                  id="lostDisplay"
                  value={payload.lostInfo.lostTime.precision === "exact" ? selectedExactTimeValue : currentTimeDisplay}
                  onChange={(event) => {
                    const nextDisplayValue = event.target.value;
                    const dateValue = selectedDateValue || toLocalDateString(new Date().toISOString());
                    setPayload((current) => ({
                      ...current,
                      lostInfo: {
                        ...current.lostInfo,
                        lostTime: {
                          ...current.lostInfo.lostTime,
                          startAt:
                            current.lostInfo.lostTime.precision === "exact"
                              ? buildLocalDateTimeIso(dateValue, nextDisplayValue)
                              : current.lostInfo.lostTime.startAt,
                          displayText: nextDisplayValue
                        }
                      }
                    }));
                  }}
                >
                  {payload.lostInfo.lostTime.precision === "exact" ? null : <option value="">请选择大概时间</option>}
                  {(payload.lostInfo.lostTime.precision === "exact" ? halfHourTimeOptions : visibleTimeDisplayOptions).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="hint">
                  {payload.lostInfo.lostTime.precision === "exact"
                    ? "按 30 分钟步进选择，例如 08:00、08:30。"
                    : "不用手打，直接选择最接近的时间段即可。"}
                </div>
              </div>
            </fieldset>
            ) : null}

            {isFieldVisible("contact") ? (
              <div className="field">
              {renderFieldLabel("contact", "主联系方式", "contact")}
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
            ) : null}

            {isFieldVisible("petName") || isFieldVisible("petType") ? (
              <div className="notice-optional-divider">下面可选，想快一点可以直接下一步</div>
            ) : null}

            {isFieldVisible("petName") || isFieldVisible("petType") ? (
              <div className="notice-pet-identity-grid">
                {isFieldVisible("petName") ? (
                  <div className="field">
                    {renderFieldLabel("petName", "宠物名称", "petName")}
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
                    {!payload.petProfile.name.trim() ? (
                      <div className="hint">可不填，生成时会自动显示为&ldquo;未知&rdquo;。</div>
                    ) : null}
                  </div>
                ) : null}

                {isFieldVisible("petType") ? (
                  <div className="field">
                    {renderFieldLabel("petType", "宠物类型", "petType")}
                    <select
                      id="petType"
                      value={String(payload.petProfile.type)}
                      onChange={(event) =>
                        setPayload((current) => ({
                          ...current,
                          petProfile: {
                            ...current.petProfile,
                            type: event.target.value as NoticeCreateInput["petProfile"]["type"],
                            customType: event.target.value === "other" ? current.petProfile.customType : ""
                          }
                        }))
                      }
                    >
                      <option value="cat">猫</option>
                      <option value="dog">狗</option>
                      <option value="bird">鸟</option>
                      <option value="other">异宠</option>
                    </select>
                  </div>
                ) : null}
              </div>
            ) : null}

            {isFieldVisible("petType") && payload.petProfile.type === "other" ? (
              <div className="field">
                {renderFieldLabel("petType", "具体宠物类型", "petCustomType")}
                <input
                  id="petCustomType"
                  maxLength={30}
                  placeholder="例如：兔子、仓鼠、乌龟、蜥蜴"
                  value={String(payload.petProfile.customType ?? "")}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      petProfile: {
                        ...current.petProfile,
                        customType: event.target.value
                      }
                    }))
                  }
                />
              </div>
            ) : null}
          </div>
          ) : null}

          {hasRightColumnFields ? (
            <div className="notice-step-grid-form-column">
            {!isEditMode && isFieldVisible("ownerEmail") ? (
              <div className="field">
                {renderFieldLabel("ownerEmail", "管理链接邮箱", "ownerEmail")}
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

            {isFieldVisible("description") ? (
              <div className="field">
              {renderFieldLabel("description", "补充描述", "description")}
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
            ) : null}

            {isFieldVisible("rewardRecovery") ? (
              <div className="field">
              {renderFieldLabel("rewardRecovery", "找回奖励（元）", "rewardRecovery")}
              <input
                id="rewardRecovery"
                max={100000}
                min={0}
                placeholder="例如：500"
                step="0.01"
                type="number"
                value={minorAmountToMajorInput(payload.rewards?.recovery?.amountMinor)}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    rewards: {
                      ...current.rewards,
                      recovery: {
                        ...current.rewards?.recovery,
                        enabled: majorAmountInputToMinor(event.target.value) > 0,
                        amountMinor: majorAmountInputToMinor(event.target.value)
                      }
                    }
                  }))
                }
              />
              <div className="hint">这里只填“元”，系统会按最小货币单位保存，避免海报和排序金额不一致。</div>
            </div>
            ) : null}

            {isFieldVisible("riskFlags") ? (
              <div className="field">
              {renderFieldLabel("riskFlags", "紧急风险标签")}
              <div className="tag-list">
                {riskOptions.map((risk) => (
                  <button
                    className={`button risk-button ${payload.riskFlags?.[risk.key] ? "button-primary" : "button-secondary"}`}
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
            ) : null}

            {isFieldVisible("antiScam") ? (
              <div className="danger-box">
              防骗提示：未核实前，请勿提前支付任何费用。高风险标签会影响公开列表排序，请如实填写。
            </div>
            ) : null}
          </div>
          ) : null}

          {isStepFlow ? (
            <aside className="notice-live-preview" aria-label="实时海报预览">
              <span>实时预览</span>
              <div className="notice-live-preview-card">
                <div className="notice-live-preview-media" aria-label={hasPreviewPhoto ? "已上传照片预览" : "照片骨架预览"}>
                  {previewPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="实时预览主图" src={previewPhoto.url} />
                  ) : (
                    <div className="notice-preview-skeleton" aria-hidden="true">
                      <span />
                    </div>
                  )}
                </div>
                <div className="notice-live-preview-content">
                  <div className="notice-live-preview-kicker">{categoryLabel}</div>
                  <div className="notice-live-preview-title-row">
                    <strong>{previewTitleText}</strong>
                    <span>{previewPetTypeText}</span>
                  </div>
                  <p className="notice-live-preview-location">{previewAddressText}</p>
                </div>
                <div className="notice-preview-skeleton-line" aria-hidden="true" />
                <div className="notice-live-preview-contact">
                  <span className="notice-live-preview-contact-label">联系</span>
                  <strong>{previewContactText}</strong>
                </div>
              </div>
            </aside>
          ) : null}
        </div>

        {isFinalCreateStep ? (
          <div className="notice-step-review">
            <h3>确认后生成</h3>
            <dl className="notice-review-list">
              <div>
                <dt>类型</dt>
                <dd>{categoryLabel}</dd>
              </div>
              <div>
                <dt>宠物</dt>
                <dd>
                  {payload.petProfile.name.trim() || "未知"} / {getPetTypeDisplayName(payload.petProfile)}
                </dd>
              </div>
              <div>
                <dt>{locationFieldLabel}</dt>
                <dd>{payload.lostInfo.location.addressText || "未填写"}</dd>
              </div>
              <div>
                <dt>联系方式</dt>
                <dd>{payload.contactMethods[0]?.value || "未填写"}</dd>
              </div>
              <div>
                <dt>照片</dt>
                <dd>{uploadedPhotoCount > 0 ? `${uploadedPhotoCount} 张` : "未上传，可稍后补"}</dd>
              </div>
              <div>
                <dt>紧急标签</dt>
                <dd>{selectedRiskLabels.length > 0 ? selectedRiskLabels.join("、") : "未选择"}</dd>
              </div>
              <div>
                <dt>找回奖励</dt>
                <dd>{formatAmountMinorForDisplay(recoveryRewardMinor, payload.rewards?.recovery?.currency ?? "CNY")}</dd>
              </div>
            </dl>
            <p className="hint">生成后会得到公开分享页、海报页和匿名管理链接。管理链接会保存在本机“我的启事”，如填写邮箱也会尝试发送到邮箱。</p>
          </div>
        ) : null}

        <div className={`actions ${isStepFlow ? "notice-step-actions" : ""}`} style={{ marginTop: 12 }}>
          {isStepFlow ? (
            <>
              <button className="button button-secondary" disabled={activeStepIndex === 0 || pending || uploadingImages} onClick={goToPreviousStep} type="button">
                上一步
              </button>
              {isFinalCreateStep ? (
                <button className="button button-primary" disabled={pending || uploadingImages} onClick={handleSubmit} type="button">
                  {uploadingImages ? "图片处理中..." : pending ? "生成中..." : `生成${categoryLabel}海报与分享页`}
                </button>
              ) : (
                <button className="button button-primary" disabled={pending || uploadingImages} onClick={goToNextStep} type="button">
                  {uploadingImages ? "图片处理中..." : nextStepLabel}
                </button>
              )}
            </>
          ) : (
            <button className="button button-primary" disabled={pending || uploadingImages} onClick={handleSubmit} type="button">
              {uploadingImages ? "图片处理中..." : pending ? "保存中..." : "保存修改"}
            </button>
          )}
        </div>

        {error ? <p className="danger-box">{error}</p> : null}
        {result && !isEditMode ? (
          <div className="panel section" style={{ marginTop: 12 }}>
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
