/**
 * Image upload route
 * 作用：接收前端压缩后的图片并存入本地 uploads 目录，提供稳定静态 URL。
 * 联动：local-storage.service.ts、NoticeForm、后续对象存储替换点。
 * 层级：route
 */
import { NextResponse } from "next/server";
import { detectImageMimeType } from "@/lib/media/image-validation";
import { storeUploadedImage } from "@/lib/media/local-storage.service";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "Missing upload file." } }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "Only image uploads are allowed." } }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "Image exceeds 5MB limit." } }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detectedMimeType = detectImageMimeType(buffer);

    if (!detectedMimeType) {
      return NextResponse.json({ error: { code: "INVALID_INPUT", message: "Unsupported or invalid image file." } }, { status: 400 });
    }

    const uploaded = await storeUploadedImage(buffer, detectedMimeType);
    return NextResponse.json({ item: uploaded });
  } catch {
    return NextResponse.json({ error: { code: "UNKNOWN", message: "Unexpected upload error." } }, { status: 500 });
  }
}
