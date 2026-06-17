/**
 * Poster address tests
 * 作用：锁定海报模板统一展示“地址：完整地址”，避免不同模板漏掉地址前缀或结构化地址。
 * 联动：lib/notice/notice-display.ts、components/notice/*Poster.tsx。
 * 层级：test
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getPosterAddressLine } from "../lib/notice/notice-display.ts";

test("getPosterAddressLine prefixes the full structured location with address label", () => {
  const addressLine = getPosterAddressLine({
    province: "北京市",
    city: "北京市",
    district: "朝阳区",
    street: "望京街道",
    addressText: "望京SOHO北门",
    nearbyLandmark: "望京站C口"
  });

  assert.equal(addressLine, "地址：北京市北京市朝阳区望京街道望京SOHO北门（望京站C口附近）");
});

test("poster templates render poster address line instead of raw address text", async () => {
  const posterFiles = [
    "../components/notice/NoticePoster.tsx",
    "../components/notice/NoticeAlertPoster.tsx",
    "../components/notice/NoticeSquarePoster.tsx",
    "../components/notice/NoticeMinimalPoster.tsx",
    "../components/notice/NoticeUrgentPoster.tsx"
  ];

  for (const posterFile of posterFiles) {
    const source = await readFile(new URL(posterFile, import.meta.url), "utf8");

    assert.match(source, /getPosterAddressLine/);
    assert.doesNotMatch(source, /<strong>{notice\.lostInfo\.location\.addressText}<\/strong>/);
    assert.doesNotMatch(source, /<dd>{notice\.lostInfo\.location\.addressText}<\/dd>/);
  }
});
