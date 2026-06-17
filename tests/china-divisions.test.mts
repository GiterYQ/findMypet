/**
 * China divisions tests
 * 作用：验证中国行政区划数据源覆盖全国省市区，并支持按区县查询街道。
 * 联动：data/china-divisions、lib/location/china-divisions.ts、china-divisions API。
 * 层级：test
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getChinaDivisionLabel, listChinaAreas, listChinaCities, listChinaProvinces, listChinaStreets } from "../lib/location/china-divisions.ts";

test("china divisions data covers national provinces cities areas and streets", async () => {
  const provinces = await listChinaProvinces();
  const beijing = provinces.find((item) => item.name === "北京市");

  assert.ok(provinces.length >= 31);
  assert.ok(beijing);

  const cities = await listChinaCities(beijing.code);
  const beijingCity = cities.find((item) => item.name === "市辖区");
  assert.ok(beijingCity);

  const areas = await listChinaAreas(beijingCity.code);
  const chaoyang = areas.find((item) => item.name === "朝阳区");
  assert.ok(chaoyang);

  const streets = await listChinaStreets(chaoyang.code);
  assert.ok(streets.some((item) => item.name.includes("望京")));
});

test("china divisions API route supports level based queries", async () => {
  const source = await readFile(new URL("../app/api/location/china-divisions/route.ts", import.meta.url), "utf8");

  assert.match(source, /level === "provinces"/);
  assert.match(source, /level === "cities"/);
  assert.match(source, /level === "areas"/);
  assert.match(source, /level === "streets"/);
  assert.match(source, /areaCode is required/);
});

test("china division label resolves readable province city and area names", async () => {
  assert.equal(await getChinaDivisionLabel("11"), "北京市");
  assert.equal(await getChinaDivisionLabel("1101"), "北京市 市辖区");
  assert.equal(await getChinaDivisionLabel("110105"), "北京市 市辖区 朝阳区");
  assert.equal(await getChinaDivisionLabel("CN"), "CN");
});

test("NoticeForm loads china division options from API instead of bundled sample list", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /\/api\/location\/china-divisions/);
  assert.match(source, /loadChinaDivisionOptions/);
  assert.doesNotMatch(source, /cn-region-options/);
});

test("NoticeForm stores selected china division code for public list filtering", async () => {
  const source = await readFile(new URL("../components/notice/NoticeForm.tsx", import.meta.url), "utf8");

  assert.match(source, /regionCode: nextProvince\?\.code/);
  assert.match(source, /regionCode: nextCity\?\.code/);
  assert.match(source, /regionCode: nextDistrict\?\.code/);
});
