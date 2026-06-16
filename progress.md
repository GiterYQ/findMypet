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
