# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本仓库中工作时的指南。

**语言偏好：所有回复、代码注释、文档均使用简体中文。**

## 项目概述

这是"姜源の全栈云笔记"（作者：Jerry/姜源）的个人技术博客，基于 **Docsify** 构建 — 一个轻量级、无需构建的静态站点生成器，直接在浏览器中渲染 Markdown 文件。站点托管在 GitHub Pages：`https://yuancodes.github.io/`。

**技术栈侧重**：Java/SpringBoot、Vue/React、项目管理、Linux、全栈工程。

## 常用命令

### 生成侧边栏

每次新增或删除文章后，必须先运行此命令重新生成侧边栏目录：

```bash
# 在 docs/ 目录下执行，扫描目录结构并自动生成 _sidebar.md
node gensidebar.js
```

该脚本会遍历 `docs/` 下所有 `.md` 文件（跳过 `_` 开头文件、`README.md` 及 `.git`、`categories`、`emoji`、`about`、`tool`、`js`、`css` 目录），按层级生成 Markdown 格式的侧边栏内容写入 `_sidebar.md`，同时备份原文件为 `_sidebar.md.bak`。

### 本地预览

```bash
# 从仓库根目录启动 — 在 http://localhost:3000 提供服务
# 注意：新增文章后需先执行 node gensidebar.js 生成侧边栏
docsify serve docs
```

无需构建、无需 `npm install`、无需打包工具。Docsify、插件和样式表均从 CDN（jsdelivr/unpkg/bootcdn）加载，完整脚本列表见 `docs/index.html`。

### 部署

推送到 `https://github.com/janycode/janycode.github.io` 的 `main` 分支即可自动发布到 GitHub Pages。

## 架构与结构

### Docsify 配置（站点核心）

`docs/index.html` 中的 `window.$docsify = { ... }` 对象控制站点的所有方面：

| 配置项 | 作用 |
|--------|------|
| `loadSidebar: true` | 从 `_sidebar.md` 加载侧边栏 |
| `loadNavbar: true` | 从 `_navbar.md` 加载导航栏 |
| `coverpage: true` | 从 `_coverpage.md` 加载封面 |
| `onlyCover: false` | 每页都显示封面 |
| `homepage: 'README.md'` | 站点首页为 `docs/README.md` |
| `subMaxLevel: 0` | 侧边栏仅显示页面标题，不显示 h1–h6 |
| `toc: { ... }` | 右侧目录，从 h2–h5 渲染 |
| `search`, `tabs`, `copyCode`, `pagination`, `count`, `progress`, `footer`, `hideCode`, `zoomImage`, `emoji` | 均已启用 |

**已加载插件**（部分有顺序依赖）：`search`, `emoji`, `zoom-image`, `docsify-copy-code`, `docsify-pagination`, `countable`, `docsify-footer-enh`, `docsify-plugin-toc`, `docsify-sidebar-collapse`, `front-matter`, `docsify-tabs`, `docsify-hide-code`, `docsify-backTop`，以及语法高亮（prism: python/c/cpp/clike/java/javascript/sql/css/bash/yaml）。

所有插件 JS/CSS 存放在 `docs/js/` 和 `docs/css/`，不通过 npm 安装。

### 内容组织（`docs/`）

顶层主题目录通过编号前缀控制侧边栏顺序：

```
00_先利其器/       — 工具（IDEA、VSCode、Trae、AList、Navicat 等）
01_操作系统/       — 操作系统
02_编程语言/       — 编程语言（Java、Python、Shell）
03_数据结构/       — 数据结构
04_大前端/         — 前端（HTML/CSS/JS/Vue/React/TS/Node/Bootstrap）
05_数据库/         — 数据库（MySQL、MyBatis、Redis、MongoDB）
06_服务器/         — 服务器（SSH、Nginx、CentOS）
07_虚拟机/         — 虚拟化
08_框架技术/       — 框架（Spring、SpringMVC、SpringBoot、SpringCloud、RabbitMQ、Dubbo 等）
09_调试测试/       — 调试与测试
10_设计模式/       — 设计模式
11_理论规范/       — 理论与规范
12_项目管理/       — 项目管理
13_第三方/         — 第三方集成
14_微服务/         — 微服务（Nacos、Gateway 等）
15_分布式/         — 分布式系统
16_性能优化/       — 性能优化
17_项目设计/       — 项目设计（业务/数据库/场景/全栈）
18_源码分析/       — 源码分析
19_技术选型/       — 技术选型
20_收藏整理/       — 收藏整理
21_代码片段/       — 代码片段
22_AI/             — AI（OpenAI、ClaudeCode、OpenClaw、提示词工程）
99_个人成长/       — 个人成长
about/             — 关于页面
tool/              — 工具索引
```

每个主题文件夹下包含带编号的子文件夹（如 `01_Intellij IDEA/`），内部存放实际的 `.md` 文件。

### 侧边栏与导航

| 文件 | 作用 |
|------|------|
| `docs/_sidebar.md` | **主侧边栏**，用于所有非首页页面。列出所有主题及其嵌套文件，顺序和层级即站点地图，编辑需谨慎 |
| `docs/_sidebar_home.md` | 仅用于首页的侧边栏（当前与 `_sidebar.md` 基本一致，仅缺少首页入口） |
| `docs/_navbar.md` | 顶部导航栏，包含主要板块的快捷链接（后端、前端、框架、组件、数据库、服务器、AI、工具、关于） |
| `docs/_coverpage.md` | 封面页，首次访问时显示 |
| `docs/_404.md` | 自定义 404 页面 |

### 页面约定

- **Markdown + HTML 混排**：文章自由混合 Markdown 和内联 `<div>`/`<style>`，用于卡片网格、渐变、Hero 区域等（示例见 `docs/README.md` 和 `docs/about/README.md`）
- **YAML Front Matter**：部分页面（如 `docs/about/README.md`）使用 `---` 前置元数据，包含 `title`、`date`、`layout`、`comment` 字段，由 `front-matter` 插件解析
- **标题格式**：页面 `h1` 成为浏览器标签页标题。站点 JS 会将非首页的 `document.title` 重写为 `"${页面标题} - 姜源の全栈云笔记"`
- **标题锚点**：CSS 为 h1–h4 设置 `scroll-margin-top: 60px`，以补偿固定导航栏的偏移
- **图片**：使用 `![alt](_media/foo.png)` 引用 `docs/_media/` 下的图片，Markdown 渲染器会将图片包裹在 `<figure>` 中实现居中
- **选项卡**：`docsify-tabs` 已启用，支持 `persist`/`sync`/`classic` 主题，使用 `<!-- tabs -->` 语法实现多语言（如 Java/Python）示例
- **别名**：`docs/_sidebar.md` 通过 `alias: { '/.*/_sidebar.md': '/_sidebar.md' }` 为所有路由提供别名 — 请勿删除

### 静态资源

| 目录 | 内容 |
|------|------|
| `docs/css/` | `vue.min.css`（docsify 主题）、`sidebar.min.css`（折叠箭头）、`breadcrumb.min.css` |
| `docs/js/` | 所有插件 JS、jQuery、prism 语法高亮器、docsify 核心（`docsify.min.js`） |
| `docs/_media/` | 网站图标、Logo、共享图片 |

所有资源直接从仓库提供服务，无资源管道、无 npm、无构建步骤。

## 站点标题与品牌

| 项目 | 内容 |
|------|------|
| 站点名称 | `姜源の全栈云笔记` |
| 作者 | Jerry / 姜源 |
| 标语 | "没有天生学霸，皆为厚积薄发" |
| 描述 | "专注于 Java/SpringBoot/Vue/React 全栈开发与项目管理，分享可落地的技术方案与成长经验" |
| 页脚 | "Docsify © since 2016 by Jerry(姜源)" |
| 百度统计 | 已在 `index.html` 中配置 `baiduTjId` |

## 编辑前须知

- **无构建步骤** — 使用 `docsify serve` 时，刷新即可立即看到 `.md` 文件的修改
- **侧边栏自动生成** — 添加新页面后需执行 `node gensidebar.js` 重新生成 `docs/_sidebar.md`（若需出现在顶栏则还需编辑 `_navbar.md`）
- **CDN 依赖** — 站点无法离线运行，所有 JS/CSS 在运行时从 jsdelivr/unpkg/bootcdn 加载
- **中文内容** — 所有文章、标题、注释均使用简体中文，UI 字符串（搜索框、分页、复制按钮）也为中文
- **无测试、无 Lint** — 这是内容站点，不是应用，无需运行测试或 Lint
