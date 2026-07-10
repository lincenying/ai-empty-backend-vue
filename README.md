# ai-empty-backend-vue

基于 **Vue 3 + TypeScript + Vite** 的管理后台 Starter 模板，内置登录鉴权、菜单权限、示例 CRUD 页面及常用业务组件，可作为新项目快速起步。

## 特性

- **现代技术栈**：Vue 3 Composition API（`<script setup>`）、TypeScript、Vite 7、Pinia、Vue Router 5
- **UI 与样式**：Element Plus 按需引入 + Sass 主题定制 + UnoCSS 原子类（Attributify 模式）
- **工程化**：`unplugin-auto-import` / `unplugin-vue-components` 自动导入，`vue-macros` 增强类型推导
- **请求层**：基于 `ofetch` 封装统一请求，支持 Token 注入、错误处理、请求取消
- **权限体系**：菜单权限 + 按钮级权限（READ / ADD / UPDATE / DELETE 等）
- **示例模块**：内置 Demo CRUD 页面，开发环境支持 Mock 数据，无需后端即可体验
- **通用组件**：表格、弹窗、图片上传、文件上传、侧边栏布局等
- **生产优化**：代码分包、Terser 压缩、构建时间戳检测与版本更新提示

## 技术栈

| 类别 | 技术                                                  |
| ---- | ----------------------------------------------------- |
| 框架 | Vue 3、Vue Router 5、Pinia                            |
| 构建 | Vite 7、TypeScript、vue-tsc                           |
| UI   | Element Plus、@element-plus/icons-vue                 |
| 样式 | Sass、UnoCSS                                          |
| 请求 | ofetch、axios（部分场景）                             |
| 工具 | VueUse、mitt、nprogress、v-viewer、@wangeditor/editor |
| 规范 | ESLint、Stylelint、Prettier                           |

## 环境要求

- **Node.js** >= 18
- **pnpm** >= 9（推荐 `pnpm@11.10.0`，见 `package.json` 中 `packageManager` 字段）

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务

```bash
pnpm dev
```

开发服务默认运行在 [http://localhost:8055](http://localhost:8055)，并自动打开浏览器。

### 构建

```bash
# 测试环境构建
pnpm build_test

# 生产环境构建
pnpm build_prod
```

构建产物输出至 `../_build/cbm_v6` 目录。

### 预览构建结果

```bash
pnpm preview
```

### 代码检查

```bash
# ESLint
pnpm lint
pnpm lint:fix

# TypeScript 类型检查
pnpm lint:ts

# 样式检查
pnpm lint:css
```

## 环境变量

项目通过 `.env.*` 文件区分环境，所有前端变量以 `VITE_` 开头：

| 变量                   | 说明               | 示例                                  |
| ---------------------- | ------------------ | ------------------------------------- |
| `VITE_APP_ENV`         | 运行环境标识       | `development` / `test` / `production` |
| `VITE_APP_TITLE`       | 应用标题           | `管理后台 Starter`                    |
| `VITE_APP_VERSION`     | 应用版本           | `v1.0`                                |
| `VITE_BASE_API`        | 接口前缀           | `/cbm/api/v6`                         |
| `VITE_ASSETS_URL`      | 静态资源接口前缀   | `/cbm/api/v6`                         |
| `VITE_ASSETS_BASE_URL` | 静态资源基础路径   | `/cbm`                                |
| `VITE_USE_DEMO_MOCK`   | 是否启用 Demo Mock | `true` / `false`                      |

环境文件说明：

- `.env.development` — 本地开发（默认开启 Mock）
- `.env.test` — 测试环境构建
- `.env.production` — 生产环境构建（关闭 Mock）

## 开发代理

本地开发时，`/cbm` 路径会代理到后端服务，配置见 `vite.config.build.ts`：

```ts
return {
    server: {
        proxy: {
            '/cbm': {
                target: 'https://39.183.161.132:51281',
                changeOrigin: true,
                secure: false,
            },
        }
    }
}
```

按需修改 `target` 为你的后端地址。

## 目录结构

```text
├── public/                  # 静态资源（不参与构建）
├── src/
│   ├── api/                 # 业务 API 封装
│   ├── assets/              # 图片、字体、全局样式
│   │   └── styles/          # SCSS 样式（Element 主题、布局、模块样式）
│   ├── components/          # 公共组件
│   ├── composables/         # 组合式函数（请求、存储、事件总线等）
│   ├── config/              # 全局配置与接口路径常量
│   ├── mock/                # 本地 Mock 数据
│   ├── pages/               # 页面组件
│   │   ├── common/          # 登录、404、无权限、iframe 等
│   │   └── demo/            # 示例 CRUD 页面
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia 状态管理
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   ├── app.vue              # 根组件
│   └── main.ts              # 应用入口
├── .env.development         # 开发环境变量
├── .env.test                # 测试环境变量
├── .env.production          # 生产环境变量
├── vite.config.ts           # Vite 主配置
├── unocss.config.ts         # UnoCSS 配置
└── package.json
```

## 路由说明

项目使用 **Hash 路由**（`createWebHashHistory`），主要路由如下：

| 路径          | 页面     | 说明                   |
| ------------- | -------- | ---------------------- |
| `/`           | —        | 重定向至 `/demo/index` |
| `/login`      | 登录页   | 无需登录               |
| `/demo/index` | 示例列表 | 默认布局，含 CRUD 演示 |
| `/iframe`     | 内嵌页   | 用于菜单外链           |
| `/404`        | 404 页面 | —                      |
| `/no-auth`    | 无权限页 | —                      |

路由 `meta` 字段：

- `layout: 'default'` — 带侧边栏的管理端布局
- `layout: 'common'` — 无侧边栏的通用布局（登录、错误页等）
- `needLogin: false` — 跳过登录校验

## 权限与 Mock

### 按钮权限

通过 `useMenuStore` 获取菜单与按钮权限，页面内使用 `useMenuData()` 或 `useDemoAuth()` 判断操作权限：

```ts
const { auth } = useDemoAuth()

// auth.READ / auth.ADD / auth.UPDATE / auth.DELETE / auth.BATCH_DELETE
```

### Demo Mock

当 `VITE_USE_DEMO_MOCK=true` 时，示例模块走本地 Mock（`src/mock/demo/`），无需连接后端即可调试列表、新增、编辑、删除等流程。

## 内置组件

| 组件                | 说明                         |
| ------------------- | ---------------------------- |
| `global-table`      | 通用表格（分页、多选、序号） |
| `global-dialog`     | 通用弹窗                     |
| `global-menu`       | 侧边菜单                     |
| `layout-aside`      | 侧边栏布局                   |
| `page-header`       | 页面标题区                   |
| `upload-image`      | 单图上传                     |
| `upload-multi-file` | 多文件上传                   |
| `upload-filelist`   | 文件列表上传                 |
| `row-state`         | 行状态展示                   |

组件通过 `unplugin-vue-components` 自动注册，无需手动 import。

## 接口规范

统一响应结构（业务层）：

```ts
interface IApiPayload<T = unknown> {
    statusCode: string // '000000' 表示成功
    message?: string
    result?: T
}
```

接口路径常量集中在 `src/config/api.ts`，业务请求封装在 `src/api/` 目录。

## 新增业务模块建议

1. 在 `src/types/` 定义接口类型
2. 在 `src/config/api.ts` 添加接口路径
3. 在 `src/api/` 封装请求方法
4. 在 `src/pages/` 创建页面组件
5. 在 `src/router/index.ts` 注册路由
6. 按需在后端配置菜单与按钮权限

可参考 `src/pages/demo/` 作为 CRUD 页面模板。

## 路径别名

| 别名 | 路径   |
| ---- | ------ |
| `@`  | `src/` |
| `~`  | `src/` |

## 许可证

Private — 内部项目模板。
