/**
 * Notice time options
 * 作用：提供第三步时间说明的预设选择项，让用户通过日期/下拉滚轮完成时间填写。
 * 联动：components/notice/NoticeForm.tsx、tests/notice-time-options.test.mts。
 * 层级：utility
 */
export type NoticeTimeDisplayOption = {
  label: string;
  value: string;
};

type NoticeCategory = "lost-pet" | "found-owner";

const lostPetTimeOptions: NoticeTimeDisplayOption[] = [
  { label: "不确定", value: "不确定" },
  { label: "今天凌晨", value: "今天凌晨" },
  { label: "今天上午", value: "今天上午" },
  { label: "今天中午", value: "今天中午" },
  { label: "今天下午", value: "今天下午" },
  { label: "今天晚上", value: "今天晚上" },
  { label: "昨晚", value: "昨晚" },
  { label: "昨天白天", value: "昨天白天" },
  { label: "最近 2-3 天", value: "最近 2-3 天" }
];

const foundOwnerTimeOptions: NoticeTimeDisplayOption[] = [
  { label: "不确定", value: "不确定" },
  { label: "刚刚", value: "刚刚" },
  { label: "今天上午", value: "今天上午" },
  { label: "今天中午", value: "今天中午" },
  { label: "今天下午", value: "今天下午" },
  { label: "今天晚上", value: "今天晚上" },
  { label: "昨天", value: "昨天" },
  { label: "最近 2-3 天", value: "最近 2-3 天" }
];

export function getNoticeTimeDisplayOptions(category: NoticeCategory) {
  return category === "found-owner" ? foundOwnerTimeOptions : lostPetTimeOptions;
}

export function getHalfHourTimeOptions() {
  return Array.from({ length: 48 }, (_, index) => {
    const hour = Math.floor(index / 2);
    const minute = index % 2 === 0 ? 0 : 30;
    const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    return {
      label: value,
      value
    };
  });
}
