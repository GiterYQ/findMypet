/**
 * Client image helpers
 * 作用：在浏览器侧压缩和标准化图片，降低首版匿名上传的体积与渲染成本。
 * 联动：components/notice/NoticeForm.tsx、notice photos payload。
 * 层级：service
 */
import { type PetPhoto } from "@/lib/notice/notice.types";

const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 1600;
const JPEG_QUALITY = 0.82;

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Image decode failed."));
    };

    image.src = imageUrl;
  });
}

export async function compressImageFile(file: File, isPrimary = false): Promise<PetPhoto> {
  const image = await loadImage(file);
  const scale = Math.min(MAX_IMAGE_WIDTH / image.width, MAX_IMAGE_HEIGHT / image.height, 1);
  const targetWidth = Math.max(Math.round(image.width * scale), 1);
  const targetHeight = Math.max(Math.round(image.height * scale), 1);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context unavailable.");
  }

  // 统一在浏览器侧重采样，避免将原始大图直接塞进 JSON payload。
  context.drawImage(image, 0, 0, targetWidth, targetHeight);
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

  return {
    url: dataUrl,
    width: targetWidth,
    height: targetHeight,
    sizeBytes: Math.round((dataUrl.length * 3) / 4),
    isPrimary
  };
}

