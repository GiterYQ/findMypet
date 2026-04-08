/**
 * AppError
 * 作用：统一封装服务层错误，确保 API 输出稳定结构。
 * 联动：lib/core/error.constants.ts、route handlers、service 层。
 * 层级：types
 */
import { errorDictionary, type AppErrorCode } from "@/lib/core/error.constants";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly retryable: boolean;
  readonly userMessageKey: string;

  constructor(code: AppErrorCode, debugMessage?: string) {
    const definition = errorDictionary[code];
    super(debugMessage ?? definition.code);
    this.code = code;
    this.retryable = definition.retryable;
    this.userMessageKey = definition.userMessageKey;
  }
}

