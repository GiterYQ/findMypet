/**
 * Image validation
 * 作用：基于文件魔数识别服务端允许的图片类型，避免仅信任客户端 MIME。
 * 联动：app/api/uploads/images/route.ts、local-storage.service.ts、tests/image-validation.test.mts。
 * 层级：utility
 */
export type SupportedImageMimeType = "image/jpeg" | "image/png" | "image/webp";

function hasBytes(buffer: Uint8Array, expected: number[], offset = 0) {
  if (buffer.byteLength < offset + expected.length) {
    return false;
  }

  return expected.every((byte, index) => buffer[offset + index] === byte);
}

export function detectImageMimeType(buffer: Uint8Array): SupportedImageMimeType | null {
  if (hasBytes(buffer, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (hasBytes(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  // WebP 文件使用 RIFF 容器，前 4 字节是 RIFF，第 8-11 字节是 WEBP。
  if (hasBytes(buffer, [0x52, 0x49, 0x46, 0x46]) && hasBytes(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    return "image/webp";
  }

  return null;
}
