/**
 * Local storage service
 * 作用：提供首版本地文件存储实现，并保持接口形态可替换为对象存储。
 * 联动：upload API、NoticeForm、后续 S3/R2 provider。
 * 层级：service
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const uploadDirectory = path.join(process.cwd(), "public", "uploads");

function inferExtension(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export async function storeUploadedImage(buffer: Buffer, mimeType: string) {
  await mkdir(uploadDirectory, { recursive: true });

  const extension = inferExtension(mimeType);
  const filename = `${crypto.randomUUID()}.${extension}`;
  const absolutePath = path.join(uploadDirectory, filename);
  await writeFile(absolutePath, buffer);

  return {
    url: `/uploads/${filename}`
  };
}

