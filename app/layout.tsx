/**
 * Root layout
 * 作用：定义站点级布局、元信息和全局样式加载。
 * 联动：app/globals.css、各路由页面。
 * 层级：page
 */
import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "findMypet",
  description: "A lightweight lost pet notice tool with hosted share pages.",
  applicationName: "findMypet",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "findMypet"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f3ec"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
