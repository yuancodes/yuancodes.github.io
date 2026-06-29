# AGENTS.md

## 语言

所有对话、文档、代码注释均使用**简体中文**。

## 项目性质

Docsify 静态博客站点，**无构建步骤、无测试、无 Lint**。不要尝试运行 `npm test`、`npm run build`、`eslint` 等命令。

## 关键操作

### 新增/删除文章后

```bash
node gensidebar.js
```

在 `docs/` 目录下执行。脚本会扫描 `docs/` 目录结构，自动生成 `docs/_sidebar.md`（原文件备份为 `_sidebar.md.bak`）。**必须在增删文章后执行，否则侧边栏不更新。**

**排序**：同一目录下的文件按 front matter 中的 `order` 字段升序排列，未设置 `order` 的排在最后。目录名始终排在同级文件之后。

### 本地预览

```bash
docsify serve docs
```

在仓库根目录执行，访问 `http://localhost:3000`。

### 部署

推送到 `main` 分支即自动发布到 GitHub Pages。

## 文件放置规则

- 文章放入 `docs/XX_主题名/YY_子分类/` 下的编号目录
- 新增顶级分类需在 `gensidebar.js` 中同步（脚本硬编码了目录列表）
- 图片放入 `docs/_media/`，用 `![alt](_media/xxx.png)` 引用
- 插件 JS/CSS 存放在 `docs/js/` 和 `docs/css/`，**不通过 npm 安装**

## 侧边栏与导航

| 文件 | 编辑方式 |
|------|----------|
| `docs/_sidebar.md` | **自动生成**，不要手动编辑。改完文章后运行 `node gensidebar.js` |
| `docs/_navbar.md` | **手动编辑**，控制顶部导航栏链接 |

## 不要做的事

- 不要 `npm install` — 站点无依赖管理
- 不要手动编辑 `docs/_sidebar.md` — 会被 `gensidebar.js` 覆盖
- 不要删除 `docs/_sidebar.md` 中的 `alias` 配置
- 不要在 `docs/` 之外创建内容文件
- 不要修改 `docs/index.html` 中的插件加载顺序（有依赖关系）
