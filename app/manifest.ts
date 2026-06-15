/**
 * Web app manifest
 * 作用：提供移动端添加到主屏幕与 PWA 基础元信息。
 * 联动：app/layout.tsx、手机浏览器安装/收藏体验。
 * 层级：metadata
 */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "findMypet 寻宠启事",
    short_name: "findMypet",
    description: "快速生成寻宠/寻主启事、海报和稳定分享页。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#d35e38",
    orientation: "portrait"
  };
}
