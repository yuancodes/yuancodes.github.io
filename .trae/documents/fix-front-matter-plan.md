# 博客详情页 Front Matter 展示问题解决方案

## 问题分析

### 现象
博客文章详情页中，markdown 文件的前置元信息（front matter）被直接渲染展示出来，而不是被正确过滤掉。

### 根因
虽然项目已安装了 `front-matter.min.js` 插件（[front-matter.min.js](file:///e:/blog/janycode.yuancodes.github.io/docs/js/front-matter.min.js)），但该插件的 `beforeEach` 钩子可能未生效或被其他插件干扰。

### 当前配置
- **文章格式**：标准 YAML front matter，以 `---` 开头和结尾
- **插件位置**：第 222 行加载 `front-matter.min.js`
- **加载顺序**：在 `docsify.min.js` 之后加载

## 解决方案

### 方案一：增强 front-matter 插件配置（推荐）

在 `index.html` 中添加自定义的 `beforeEach` 钩子，手动处理 front matter，确保其被正确移除。

**修改文件**：[docs/index.html](file:///e:/blog/janycode.yuancodes.github.io/docs/index.html)

**修改内容**：
在 `window.$docsify` 配置对象中添加 `beforeEach` 钩子：

```javascript
window.$docsify = {
    // ... 现有配置 ...
    
    // 手动处理 front matter，确保前置元信息被移除
    beforeEach: function(content) {
        // 匹配 front matter：以 --- 开头，以 --- 或 ... 结尾
        var frontMatterRegex = /^\ufeff?---\s*\n[\s\S]*?\n---\s*\n/;
        var match = content.match(frontMatterRegex);
        if (match) {
            return content.replace(match[0], '');
        }
        return content;
    }
};
```

### 方案二：检查并调整插件加载顺序

确保 `front-matter.min.js` 在所有可能修改内容的插件之前加载。

**当前加载顺序（部分）**：
1. `docsify.min.js` (194)
2. `jquery.min.js` (196)
3. `search-index.min.js` (201)
4. `emoji.min.js` (203)
5. `zoom-image.min.js` (205)
6. `docsify-copy-code.min.js` (207)
7. `docsify-pagination.min.js` (212)
8. `countable.min.js` (214)
9. `docsify-footer-enh.min.js` (216)
10. `docsify-plugin-toc.min.js` (218)
11. `docsify-sidebar-collapse.min.js` (220)
12. `front-matter.min.js` (222) ← 当前位置
13. `docsify-tabs.min.js` (224)
14. `docsify-hide-code.min.js` (226)

**调整建议**：将 `front-matter.min.js` 移动到 `search-index.min.js` 之后、`emoji.min.js` 之前。

### 方案三：替换 front-matter 插件

如果前两种方案无效，可以尝试替换为更可靠的 front matter 处理方式。

## 实施计划

1. **第一步**：采用方案一，在 `index.html` 中添加自定义 `beforeEach` 钩子
2. **第二步**：重启本地预览服务验证效果
3. **第三步**：检查多篇文章确认修复生效

## 风险评估

- **低风险**：修改仅涉及 `index.html` 配置，不影响文章内容
- **兼容性**：自定义正则与标准 YAML front matter 格式兼容
- **回滚**：若出现问题，可直接删除添加的 `beforeEach` 配置恢复原状
