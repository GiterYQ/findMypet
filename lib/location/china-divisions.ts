/**
 * China divisions data service
 * 作用：读取版本化的中国省/市/区/街道公开数据，为地址选择器提供按需查询能力。
 * 联动：data/china-divisions、app/api/location/china-divisions/route.ts、NoticeForm。
 * 层级：service
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

export type ChinaDivisionOption = {
  code: string;
  name: string;
};

type PcaArea = ChinaDivisionOption;

type PcaCity = ChinaDivisionOption & {
  children?: PcaArea[];
};

type PcaProvince = ChinaDivisionOption & {
  children?: PcaCity[];
};

type StreetRecord = ChinaDivisionOption & {
  areaCode: string;
  cityCode: string;
  provinceCode: string;
};

const dataDirectory = path.join(process.cwd(), "data", "china-divisions");

let pcaCache: Promise<PcaProvince[]> | null = null;
let streetCache: Promise<StreetRecord[]> | null = null;

async function readJsonFile<T>(fileName: string): Promise<T> {
  const source = await readFile(path.join(dataDirectory, fileName), "utf8");
  return JSON.parse(source) as T;
}

async function getPcaData() {
  pcaCache ??= readJsonFile<PcaProvince[]>("pca-code.json");
  return pcaCache;
}

async function getStreetData() {
  streetCache ??= readJsonFile<StreetRecord[]>("streets.json");
  return streetCache;
}

export async function listChinaProvinces(): Promise<ChinaDivisionOption[]> {
  const provinces = await getPcaData();
  return provinces.map(({ code, name }) => ({ code, name }));
}

export async function listChinaCities(provinceCode: string): Promise<ChinaDivisionOption[]> {
  const provinces = await getPcaData();
  const province = provinces.find((item) => item.code === provinceCode);
  return province?.children?.map(({ code, name }) => ({ code, name })) ?? [];
}

export async function listChinaAreas(cityCode: string): Promise<ChinaDivisionOption[]> {
  const provinces = await getPcaData();
  const city = provinces.flatMap((province) => province.children ?? []).find((item) => item.code === cityCode);
  return city?.children?.map(({ code, name }) => ({ code, name })) ?? [];
}

export async function listChinaStreets(areaCode: string): Promise<ChinaDivisionOption[]> {
  const streets = await getStreetData();
  return streets
    .filter((street) => street.areaCode === areaCode)
    .map(({ code, name }) => ({ code, name }));
}

export async function getChinaDivisionLabel(code: string): Promise<string> {
  const provinces = await getPcaData();

  for (const province of provinces) {
    if (province.code === code) {
      return province.name;
    }

    for (const city of province.children ?? []) {
      if (city.code === code) {
        return `${province.name} ${city.name}`;
      }

      const area = city.children?.find((item) => item.code === code);
      if (area) {
        return `${province.name} ${city.name} ${area.name}`;
      }
    }
  }

  return code;
}
