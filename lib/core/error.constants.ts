/**
 * Error constants
 * 作用：定义统一错误码、是否可重试与用户提示 key。
 * 联动：API route、notice service、页面提交反馈。
 * 层级：constants
 */
export const errorDictionary = {
  INVALID_INPUT: {
    code: "INVALID_INPUT",
    retryable: false,
    userMessageKey: "error.invalidInput"
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    retryable: false,
    userMessageKey: "error.notFound"
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    retryable: false,
    userMessageKey: "error.unauthorized"
  },
  REFRESH_TOO_SOON: {
    code: "REFRESH_TOO_SOON",
    retryable: true,
    userMessageKey: "error.refreshTooSoon"
  }
} as const;

export type AppErrorCode = keyof typeof errorDictionary;

