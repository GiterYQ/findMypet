# findMypet 进度记录

## 2026-06-16

- 创建下一阶段规划文件：`task_plan.md`、`findings.md`、`progress.md`。
- 明确下一阶段目标：
  - 拓展模板。
  - 将创建流程改成分步填写，降低首屏负担。
- 当前推荐执行顺序：
  1. 模板体系产品化。
  2. 分步发布流程。
  3. 增加更多模板。
  4. 优化手机端填写体验。
  5. 完整预览回归。

## 当前环境状态

- 项目路径：`/Users/ye/findMypet`
- 当前分支：`main`
- 远端：`origin https://github.com/GiterYQ/findMypet.git`
- 已有预览命令：`npm run dev:mobile`

## 2026-06-16 阶段 1 执行记录

- 完成模板体系产品化：
  - `posterTemplateOptions` 统一维护模板名称、用途和画幅。
  - `getPosterTemplateHref` 统一生成模板 URL。
  - 海报页模板选择区改成配置驱动卡片。
- 验证记录：
  - `npm test` 通过 16 项。
  - `npm run lint` 通过。
  - `npm run build` 首次失败一次，原因是 Next typed routes 不接受宽泛 `string` 作为 `Link href`。
  - 修复方式：将 `getPosterTemplateHref` 返回类型收窄为模板字符串 union。
  - 修复后 `npm run build` 通过。

## 2026-06-16 阶段 3 执行记录

- 完成创建页分步发布流程：
  - 新增 `noticeFormSteps` 步骤配置，统一维护步骤顺序、文案和字段归属。
  - `NoticeForm` 创建模式改为 5 步：必要信息、照片与描述、时间与紧急程度、悬赏与找回、预览生成。
  - 第一步控制为 6 个字段，降低首屏压迫感。
  - 第五步增加生成前摘要，用户可最后确认关键信息。
  - 编辑模式保持原完整表单，避免影响管理页。
  - 移动端增加 sticky 上一步/下一步操作栏。
- TDD 记录：
  - 先补 `notice-form-steps` 测试，确认缺少字段分组 API 时失败。
  - 再实现字段分组、步骤查找和字段归属 helper。
- 验证记录：
  - `npm test` 通过 20 项。
  - `npm run lint` 通过。
  - `npm run build` 首次失败一次，原因是 `as const` 步骤字段元组在 `includes` 中被 TypeScript 推成 `never`。
  - 修复方式：将当前步骤字段显式拓宽为 `readonly NoticeFormStepField[]`。
  - 修复后 `npm run build` 通过。

## 2026-06-16 阶段 2 执行记录

- 完成新增模板：
  - `minimal`：社区简洁模板，适合物业群、社区群和公告栏。
  - `urgent`：危急大字模板，适合病危、需喂药、失明、交通危险等场景。
  - `posterTemplateIds`、`posterTemplateOptions`、`normalizePosterTemplate` 和 `getPosterTemplateHref` 已支持 5 套模板。
  - 海报页已接入 `NoticeMinimalPoster` 和 `NoticeUrgentPoster`。
- TDD 记录：
  - 先更新 `poster-template` 测试，确认 `minimal` / `urgent` 未接入时失败。
  - 再实现模板配置、组件和渲染分支。
- 验证记录：
  - `npm test` 通过 20 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。

## 2026-06-16 阶段 4 执行记录

- 完成移动端表单体验优化：
  - `photo`、`time-risk`、`reward-extra` 步骤增加 `skippable` 标记。
  - 创建流程的可跳过步骤按钮文案改为“跳过，稍后补充”。
  - 悬赏输入从“分”改成“元”，内部通过 `money.ts` 转为 `amountMinor` 保存。
  - 生成前确认摘要使用统一金额展示格式。
  - 风险标签按钮增加 `risk-button` 样式，扩大手机点击区域。
- TDD 记录：
  - 先新增金额转换测试和可跳过步骤测试，确认缺少实现时失败。
  - 再实现 `lib/notice/money.ts`、步骤 `skippable` 字段和表单接入。
- 验证记录：
  - `npm test` 通过 24 项。
  - `npm run lint` 通过。
  - `npm run build` 首次失败一次，原因是非跳过步骤没有显式 `skippable` 属性，TypeScript 不允许直接访问。
  - 修复方式：所有步骤显式声明 `skippable: boolean`。
  - 修复后 `npm run build` 通过。

## 2026-06-16 阶段 5 执行记录

- 完成真实预览与回归：
  - `npm test` 通过 24 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。
  - 重启 `npm run dev:mobile` 后服务 ready。
  - 局域网预览地址：`http://192.168.10.33:3000`。
- HTTP 检查：
  - `/` 返回 200。
  - `/mine` 返回 200。
  - `/api/notices` 返回 200，并返回本地测试启事 `vYPV3jRq`。
  - `/notice/vYPV3jRq` 返回 200。
  - `/poster/vYPV3jRq` 返回 200。
  - `/poster/vYPV3jRq?template=alert` 返回 200。
  - `/poster/vYPV3jRq?template=square` 返回 200。
  - `/poster/vYPV3jRq?template=minimal` 返回 200。
  - `/poster/vYPV3jRq?template=urgent` 返回 200。
- 注意：
  - 初次 curl 被本机代理拦截为 502，使用 `--noproxy '*'` 后可直连。
  - 一次针对 HTML 内容的 grep 检查遇到 `127.0.0.1` 连接拒绝，随后用 `localhost` 首页 200 和 dev server 访问日志确认服务仍可用。

## 2026-06-16 表单与模板体验修复

- 修复用户反馈：
  - 海报模板不再显示内部 `ID ... · 版本 ...` 文案。
  - 可跳过步骤的主按钮不再显示“跳过，稍后补充”，统一显示“下一步”。
  - 可跳过能力改为步骤说明提示：“这一步可不填，直接点下一步。”
  - 压缩网页和移动端的表单字号、间距、输入框高度、按钮高度、步骤卡片和确认摘要间距。
- 根因记录：
  - `skippable` 被误用为主操作文案，导致用户以为只能跳过，实际按钮行为仍是下一步。
  - 海报模板直接展示了内部追踪字段，影响普通用户理解。
  - 全局表单 spacing 偏展示型页面，实际填写时密度过低。
- 验证记录：
  - `npm test` 通过 25 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。

## 2026-06-16 第三步时间选择与步骤视觉优化

- 完成用户反馈：
  - 第三步“补充说明”从手打输入框改成预设下拉选择，手机上使用系统选择器/滚轮。
  - 寻宠和寻主使用不同时间选项，避免“昨晚”等文案出现在寻主场景。
  - 5 个步骤增加独立视觉主题色，当前步骤面板背景会变化。
  - 字段标题加粗并增加色块/左边强调线，一眼能区分填写区域。
- TDD 记录：
  - 先新增 `notice-time-options` 测试，确认时间选项工具缺失时失败。
  - 先新增步骤 tone 唯一性测试，确认步骤配置缺少视觉主题时失败。
  - 再实现 `notice-time-options.ts`、步骤 `tone` 字段、表单下拉选择和主题 CSS。
- 验证记录：
  - `npm test` 通过 28 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。

## 2026-06-16 必填规则、精确时间与公开列表压缩

- 完成用户反馈：
  - 创建表单首步的业务必填项收窄为位置和联系方式，宠物名称可留空并在提交时自动显示为“未知”。
  - 精确时间从手打改为 24 小时制下拉选择，按 30 分钟步进覆盖 `00:00` 到 `23:30`。
  - 公开列表卡片不再复用大图 `.notice-photo`，改为专用缩略图结构，桌面 88px、手机 76px，减少列表占位。
- TDD 记录：
  - 先新增 `requiredFields` 测试，确认必要信息步骤只要求 `addressText` 和 `contact`。
  - 先新增 `getHalfHourTimeOptions` 测试，确认精确时间提供 48 个半小时选项。
  - 先新增公开列表缩略图静态回归测试，确认 `NoticeCard` 使用独立缩略图类且 CSS 固定尺寸。
- 验证记录：
  - `npm test` 通过 32 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。

## 2026-06-16 手机端 App 化体验优化

- 完成用户反馈：
  - 手机端隐藏桌面式 hero，改为 sticky 顶部 App 栏，降低“手机打开网页”的感觉。
  - 增加底部快捷 tab：发布、列表、我的，方便手机单手跳转。
  - 创建表单在手机端使用更强的 App 卡片感、圆角输入框、浮层式下一步操作区。
  - 字段标题增加“必填/可选” badge，第一步明确展示“必填：位置、联系方式”。
  - 手机端默认隐藏筛选表单，公开列表保留为紧凑动态区。
- TDD 记录：
  - 先新增 `isNoticeFormFieldRequired` 和 `getNoticeFormRequiredSummary` 测试，确认必填范围被配置锁定。
  - 先新增表单 UI 静态测试，确认 NoticeForm 使用必填摘要和字段 badge。
  - 先新增首页 App chrome 静态测试，确认移动端顶部栏、底部 tab 和移动端 CSS 存在。
- 验证记录：
  - `npm test` 通过 38 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。

## 2026-06-16 iPhone 全机型断点优化

- 完成用户反馈：
  - 针对窄屏 iPhone（含 SE/mini 级别）收紧页面 padding、顶部栏、底部 tab、输入框和卡片尺寸。
  - 针对标准 iPhone 宽度稳定表单最大宽度、底部 tab 宽度和公开列表缩略图比例。
  - 针对 Plus/Pro Max 级别机型放宽左右留白和卡片尺寸，避免大屏手机显得过度拥挤。
  - 针对短屏和横屏 iPhone，将浮动步骤操作区回到文档流，避免按钮叠住输入区域。
  - 横屏保护覆盖到 960px，兼容 Pro Max 级别横向视口。
- TDD 记录：
  - 先把横屏断点测试从 932px 提升到 960px，确认当前 CSS 失败。
  - 再调整 `app/globals.css` 的 iPhone 横屏媒体查询并确认测试恢复通过。
- 验证记录：
  - `npm test` 通过 40 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。

## 2026-06-17 手机发布步骤上下文提示优化

- 完成用户反馈：
  - 创建流程顶部增加“当前任务”提示条，明确本步目标、预计耗时、已完成步骤和剩余步骤。
  - 每个步骤配置补充 `goal` 和 `estimate`，让表单文案继续集中在 `notice-form-steps.ts` 管理。
  - 手机端提示条采用单列 App 卡片样式，窄屏 iPhone 下进一步压缩字号和间距，避免增加首屏负担。
- TDD 记录：
  - 先新增步骤元信息测试，确认 `goal` / `estimate` 缺失时失败。
  - 先新增表单和 CSS 静态测试，确认 `notice-step-context` 相关 class 未实现时失败。
  - 再实现步骤配置、表单提示条和响应式样式。
- 验证记录：
  - `npm test` 通过 43 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。

## 2026-06-17 首步必填优先填写优化

- 完成用户反馈：
  - 首步字段顺序调整为发布类型、位置、联系方式、宠物名称、宠物类型。
  - 必填的位置和联系方式提前到宠物可选信息之前，降低手机首屏“要填很多”的心理负担。
  - 在宠物名称/类型前增加“下面可选，想快一点可以直接下一步”分隔提示。
- TDD 记录：
  - 先更新步骤配置测试，确认首步字段顺序仍旧把宠物可选信息前置时失败。
  - 先新增表单源码顺序测试，确认地址/联系方式必须早于宠物名称/类型。
  - 再调整 `notice-form-steps.ts`、`NoticeForm.tsx` 和可选分隔样式。
- 验证记录：
  - `npm test` 通过 44 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。

## 2026-06-17 浏览器定位辅助填写

- 完成用户反馈：
  - 创建/编辑位置区域增加“使用当前位置”按钮，只在用户主动点击后请求浏览器定位权限。
  - 定位成功后写入 `lat/lng`，并保持 `privacyLevel: approximate`，不自动反查地址，避免地图 API 成本和误填地址。
  - 定位失败、拒绝授权或浏览器不支持时展示非阻塞提示，仍允许用户手动填写地址和附近标志物。
  - 手机端定位操作区改成独立卡片，按钮占满一行，避免和必填地址输入混在一起。
- TDD 记录：
  - 先新增表单和 CSS 静态测试，确认定位按钮、`navigator.geolocation`、近似隐私和移动端样式缺失时失败。
  - 再实现 `NoticeForm` 定位状态、点击处理和响应式样式。
- 验证记录：
  - `npm test` 通过 46 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。
  - 注意：浏览器定位在真实手机上通常需要 HTTPS；本地 `localhost` 可用，局域网 HTTP 预览可能被部分手机浏览器拦截定位权限。

## 2026-06-17 首步必选项与异宠文案优化

- 完成用户反馈：
  - 首步必填摘要从“位置、联系方式”扩展为“发布类型、位置、联系方式、宠物类型”。
  - 发布类型和宠物类型继续保留默认值，降低填写成本，但 UI 明确它们属于必选决策。
  - 内部枚举仍使用 `other`，展示层统一改为“异宠”，覆盖创建表单、最终确认摘要、公开列表筛选和海报/列表通用展示。
- TDD 记录：
  - 先更新步骤配置测试，确认 `noticeCategory` 和 `petType` 未被标记必填时失败。
  - 先新增宠物类型展示测试，确认 `other` 仍展示为“其他”时失败。
  - 再更新步骤配置、`notice-display`、筛选器和表单摘要。
- 验证记录：
  - `npm test` 通过 49 项。
  - `npm run lint` 通过。
  - `npm run build` 通过。
