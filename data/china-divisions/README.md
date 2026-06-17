# China Divisions Data

本目录存放中国省、市、区县、街道的本地版本化数据，用于 `NoticeForm` 的手动地址选择。

## Source

- Primary source: `modood/Administrative-divisions-of-China`
- Repository: `https://github.com/modood/Administrative-divisions-of-China`
- Files used:
  - `dist/pca-code.json`
  - `dist/streets.json`
- Dataset cutoff stated by upstream: `2023-06-30`
- Upstream publish date stated by upstream: `2023-09-11`

## Runtime Policy

The app does not call third-party region pages at runtime. The frontend calls the local API route `GET /api/location/china-divisions`, and the route reads these local JSON files on the server.

`https://www.bmcx.com/api/` was checked as a possible reference, but it returns an iframe/embed generator HTML page rather than a stable JSON API. It should not be used as a runtime dependency.

## Known Limitation

Upstream states that specific statistical division codes are no longer publicly updated by the National Bureau of Statistics from October 2024. Treat this dataset as the latest practical public baseline, not a guaranteed live source.

If a user cannot find a street, the UI must allow typing the detailed address manually.
