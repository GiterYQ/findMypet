# findMypet

面向 H5/Web 的轻量寻宠与寻主 notice 工具。首版重点不是做完整社区平台，而是让用户快速生成可传播的启事、海报和稳定分享页，并支持匿名管理、刷新状态和找回后停止扩散。

## 当前产品定位

findMypet 当前更接近一个“轻量 notice 系统”，不是单纯海报生成器。

核心闭环：

1. 用户分步填写必要信息。
2. 可上传照片，浏览器先压缩。
3. 生成公开分享页、匿名管理链接和多套海报模板。
4. 管理者可刷新、改状态、重新打开。
5. 公开列表按状态、活跃度、风险和悬赏做基础展示。

## 已支持能力

- 匿名创建：无需账号，创建后返回公开链接和管理链接。
- 管理链接：通过 token 管理自己的启事，token 只保存哈希。
- 本地找回：`/mine` 使用浏览器本地记录找回管理入口。
- 邮箱找回：可选填写管理邮箱；未配置邮件服务时不影响创建。
- 分步发布：移动端优先，先填必要信息，再引导补充照片、时间、风险、悬赏。
- 定位辅助：点击后请求浏览器定位，保存近似坐标，并通过后端反查尝试回填省市区街道。
- 中国地址选择：省/市/区县/街道使用本地版本化公开数据，找不到时可手动填写详细地址。
- 宠物类型：猫、狗、鸟、异宠；异宠支持填写具体类型。
- 发布类型：寻宠、寻主。
- 海报模板：classic、alert、square、minimal、urgent。
- 公开分享页：展示状态、联系方式、防骗提示、地图跳转入口。
- 公开列表：支持地区和宠物类型筛选，缩略图展示。
- 状态管理：active、recovered、closed；fresh、stale、archived。
- 举报和审核状态：支持基础 report、downrank、hidden 数据结构。
- 风险排序：病危、需喂药、失明/听障、行动障碍、老年/幼宠、高车流、极端天气等会进入优先级计算。

## 技术栈

- Next.js 15 App Router
- React 19
- Prisma 6
- SQLite for local MVP
- Zod
- Node test runner

## 开源协作

这个仓库计划作为开源项目持续迭代。欢迎围绕真实寻宠/寻主场景提交问题、模板建议、生产化基础设施和用户体验改进。

协作入口：

- 路线图：[`ROADMAP.md`](./ROADMAP.md)
- 贡献指南：[`CONTRIBUTING.md`](./CONTRIBUTING.md)
- 行为准则：[`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- 安全披露：[`SECURITY.md`](./SECURITY.md)
- 许可证：[`LICENSE`](./LICENSE)

适合优先贡献的方向：

- 生产化 P0：PostgreSQL、对象存储、限流、上传审核、cron、HTTPS 部署。
- 发布成功率：定位 fallback、AI 特征建议、管理链接找回、表单组件拆分。
- 传播效果：海报二维码、模板缩略图、已找回/停止扩散海报、微信分享文案。
- 开源治理：Issue/PR 模板、CI、文档、示例部署说明。

## 目录结构

```text
app/
  page.tsx                         首页、创建表单、公开列表
  notice/[shortId]/page.tsx        公开分享页
  manage/[shortId]/page.tsx        匿名管理页
  poster/[shortId]/page.tsx        海报模板页
  mine/page.tsx                    本机管理历史
  api/notices/**                   notice 创建、读取、编辑、状态、举报、刷新
  api/uploads/images/route.ts      图片上传入口
  api/cron/notices/activity        fresh/stale/archived 定时推进

components/notice/
  NoticeForm.tsx                   创建/编辑表单
  NoticeCard.tsx                   公开列表卡片
  NoticeFilters.tsx                列表筛选
  ManageConsole.tsx                管理操作台
  Notice*Poster.tsx                海报模板组件
  PosterActions.tsx                下载 PNG / 打印 PDF
  LocationLinkCard.tsx             地图跳转
  ContactMethodsCard.tsx           联系方式展示

lib/notice/
  notice.schema.ts                 Zod 输入边界
  notice.types.ts                  领域类型
  notice.service.ts                业务状态、创建、编辑、排序、举报
  notice.repository.ts             Prisma 读写
  notice.mapper.ts                 public/admin payload 隔离
  notice-form-steps.ts             分步发布配置
  poster-template.ts               海报模板配置
  notice-display.ts                统一展示文案
  activity-maintenance.ts          stale/archive 推进规则
  money.ts                         金额最小单位转换

lib/media/
  client-image.ts                  前端压缩和上传
  image-validation.ts              后端图片类型校验

lib/manage/
  manage-url.ts                    管理链接解析
  manage-history.ts                本地管理历史

lib/location/
  map-link.ts                      地图跳转链接
  reverse-geocode.ts               坐标反查地址
  china-divisions.ts               本地中国行政区划数据查询

data/china-divisions/
  pca-code.json                    省/市/区县数据
  streets.json                     街道/乡镇数据
  README.md                        数据来源、限制和更新策略

prisma/
  schema.prisma                    数据模型和枚举
```

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 准备环境变量：

```bash
cp .env.example .env
```

3. 初始化数据库：

```bash
TMPDIR=/tmp npx prisma db push
```

4. 启动本机预览：

```bash
npm run dev
```

5. 启动手机同 Wi-Fi 预览：

```bash
npm run dev:mobile
```

macOS 可通过 `ifconfig` 查找当前活跃内网 IP，然后在手机打开：

```text
http://<LAN-IP>:3000
```

当前浏览器定位在真实手机上通常需要 HTTPS；`localhost` 可用，局域网 HTTP 可能被部分浏览器拦截定位权限。

## 环境变量

```text
DATABASE_URL          数据库连接。本地默认 file:./dev.db
APP_BASE_URL          公开站点 origin，用于生成分享链接和管理链接
RESEND_API_KEY        可选，Resend 邮件 API key
RESEND_FROM_EMAIL     可选，管理链接邮件发件地址
CRON_SECRET           生产环境调用 cron 接口的密钥
REVERSE_GEOCODE_ENDPOINT  可选，坐标反查地址服务，默认 Nominatim
REVERSE_GEOCODE_EMAIL     可选，公共 Nominatim 使用时用于识别应用联系人
```

如果邮件未配置或发送失败，创建仍会成功。用户需要复制管理链接，或在同一浏览器的 `/mine` 找回。

定位地址回填通过后端 `/api/location/reverse-geocode` 调用反查服务。默认使用 Nominatim 公共服务，只适合低频 MVP 演示；生产环境建议替换为高德、Google、Mapbox 或自有可商用服务。

中国省市区街道下拉通过 `/api/location/china-divisions` 读取本地 `data/china-divisions` 数据。当前数据来自 `modood/Administrative-divisions-of-China`，上游标注数据截止 `2023-06-30`、发布时间 `2023-09-11`。`https://www.bmcx.com/api/` 是 iframe/工具嵌入生成页，不是稳定 JSON 接口，因此只可人工参考，不作为运行时依赖。

## 验证命令

```bash
npm test
npm run lint
npm run build
```

每个独立功能应单独 commit。提交前至少跑以上三条。

## 生产部署清单

当前项目可用于 MVP 演示和本地试用。若要实际公开上线，建议至少补齐：

- 数据库：SQLite 换 PostgreSQL。
- 图片存储：本地存储换对象存储，例如 S3、R2、OSS 或 COS。
- CDN：图片和海报资源走 CDN。
- 邮件：配置 Resend 或同类邮件服务。
- 环境：配置 `APP_BASE_URL`、`CRON_SECRET`、数据库 URL、邮件 key。
- 定时任务：定期调用 `/api/cron/notices/activity`。
- HTTPS：真实定位、微信内访问、PWA 安装都需要 HTTPS。
- 地图服务：配置可商用的 reverse geocode 服务，避免依赖公共低频接口。
- 限流：创建、上传、举报接口需要基础限流。
- 内容审核：公开图片上传需要接入鉴黄、暴恐、违规图检测。
- 备份：数据库和对象存储要有备份策略。

## 微信公众号接入方向

适合先接“公众号菜单 + H5 页面”，不要一开始做小程序。

推荐路径：

1. 部署 Web 到 HTTPS 域名。
2. 微信公众号后台配置菜单：
   - 发布寻宠：`https://domain.com/#create-notice`
   - 最新启事：`https://domain.com/`
   - 我的启事：`https://domain.com/mine`
3. 做微信内浏览器适配：
   - 顶部提示“请保存管理链接”。
   - 分享文案和海报二维码更醒目。
   - 地图跳转失败时提供复制地址和坐标。
4. 后续再接公众号消息能力：
   - 发送管理链接到用户邮箱。
   - 通过关键词返回最近启事。
   - 用模板消息提醒刷新。

不建议首版直接做 OAuth 登录。匿名管理链接 + 邮箱找回更符合当前 MVP 成本。

## 后续拓展优先级

### P0：上线地基

- PostgreSQL
- 对象存储
- HTTPS 部署
- 邮件服务
- 限流和上传审核
- cron 定时推进 stale/archive

### P1：发布成功率

- 地址反查和地图选点
- 更多宠物类型细分
- AI 照片特征建议
- 更短的手机首屏
- 管理链接邮件重发

### P2：传播效果

- 海报二维码
- 微信分享文案优化
- 更多真实场景模板
- 海报模板预览缩略图
- 找回后自动生成“已找回，停止扩散”海报

### P3：平台化

- 志愿者协助刷新
- 区域聚合页
- 更精细的排序权重
- 站内线索提交
- 后台审核面板
- 数据统计和转化漏斗

## 当前边界

- 不做完整账号体系。
- 不做站内私信。
- 不做模板拖拽编辑器。
- 不做复杂地图供应商适配。
- 不做小程序。
- 不承诺 AI 自动识别一定准确，未来只作为“待确认建议值”。
