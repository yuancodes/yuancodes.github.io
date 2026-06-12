/**
 * generate-data.js
 * 扫描 docs/ 目录下所有 .md 文件的 front matter，生成 articles-data.json
 *
 * 使用方法: node generate-data.js
 * 输出: docs/js/articles-data.json
 */

var path = require('path');
var fs = require('fs');

// 脚本位于 docs/js/ 目录，向上两级到达项目根目录的 docs/
var curPath = path.resolve(__dirname, '..');
var outputPath = path.join(curPath, 'js', 'articles-data.json');

// 跳过的目录和文件
var skipDirArr = ['.git', 'categories', 'emoji', 'about', 'tool', 'js', 'css', '_media', 'node_modules'];
var skipFilePrefix = '_';

/**
 * 从文件内容中提取 YAML front matter
 */
function extractFrontMatter(content) {
    var match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return null;
    return match[1];
}

/**
 * 简单解析 YAML 字段（支持 title, date, tags, categories）
 */
function parseSimpleYaml(yamlStr) {
    var result = {
        title: '',
        date: '',
        tags: [],
        categories: []
    };

    var lines = yamlStr.split('\n');
    var currentField = null;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();

        // 检测顶层字段
        if (trimmed.indexOf('title:') === 0) {
            currentField = 'title';
            var val = trimmed.substring(6).trim();
            // 去除引号
            val = val.replace(/^["']|["']$/g, '');
            result.title = val;
        } else if (trimmed.indexOf('date:') === 0) {
            currentField = 'date';
            var dateVal = trimmed.substring(5).trim();
            dateVal = dateVal.replace(/^["']|["']$/g, '');
            result.date = dateVal;
        } else if (trimmed.indexOf('tags:') === 0) {
            currentField = 'tags';
            // tags 可能内联写法: tags: [tag1, tag2]
            var inlineTags = trimmed.substring(5).trim();
            if (inlineTags && inlineTags.indexOf('[') === 0) {
                // 解析内联数组
                var tagArr = inlineTags.replace(/[\[\]]/g, '').split(',');
                for (var t = 0; t < tagArr.length; t++) {
                    var tag = tagArr[t].trim().replace(/^["']|["']$/g, '');
                    if (tag) result.tags.push(tag);
                }
                currentField = null;
            }
        } else if (trimmed.indexOf('categories:') === 0) {
            currentField = 'categories';
            var inlineCats = trimmed.substring(11).trim();
            if (inlineCats && inlineCats.indexOf('[') === 0) {
                var catArr = inlineCats.replace(/[\[\]]/g, '').split(',');
                for (var c = 0; c < catArr.length; c++) {
                    var cat = catArr[c].trim().replace(/^["']|["']$/g, '');
                    if (cat) result.categories.push(cat);
                }
                currentField = null;
            }
        } else if (trimmed.indexOf('- ') === 0 && currentField) {
            // 列表项
            var item = trimmed.substring(2).trim().replace(/^["']|["']$/g, '');
            if (item) {
                if (currentField === 'tags') result.tags.push(item);
                if (currentField === 'categories') result.categories.push(item);
            }
        } else if (trimmed === '' || trimmed.indexOf('#') === 0) {
            // 空行或注释，不做处理
        } else if (trimmed.indexOf(':') > 0 && trimmed.indexOf(':') < 10) {
            // 其他字段，重置当前字段
            currentField = null;
        }
    }

    return result;
}

/**
 * 递归扫描目录，收集文章数据
 */
function scanArticles(dirPath, prefixPath, articles) {
    var entries = fs.readdirSync(dirPath);

    for (var i = 0; i < entries.length; i++) {
        var name = entries[i];
        var fullPath = path.join(dirPath, name);
        var stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // 跳过指定目录
            if (skipDirArr.indexOf(name) >= 0) continue;
            if (name.charAt(0) === skipFilePrefix) continue;
            if (name.charAt(0) === '.' && name !== '.') continue;

            scanArticles(fullPath, prefixPath ? prefixPath + '/' + name : name, articles);
        } else if (stat.isFile()) {
            // 只处理 .md 文件
            if (path.extname(name).toLowerCase() !== '.md') continue;
            // 跳过下划线开头的文件
            if (name.charAt(0) === skipFilePrefix) continue;
            // 跳过 README.md
            if (name.toLowerCase() === 'readme.md') continue;

            var relativePath = prefixPath ? prefixPath + '/' + name : name;
            var displayPath = './' + relativePath;

            // 读取文件前 30 行提取 front matter
            var content = '';
            try {
                content = fs.readFileSync(fullPath, 'utf-8');
            } catch (e) {
                console.warn('无法读取文件: ' + fullPath);
                continue;
            }

            var frontMatterStr = extractFrontMatter(content);
            var meta = frontMatterStr ? parseSimpleYaml(frontMatterStr) : null;

            // 构建文章数据
            var title = meta && meta.title ? meta.title : name.replace(/\.md$/, '');
            // 去掉文件名开头的数字前缀（如 "01-IDEA安装配置" -> "IDEA安装配置"）
            var displayTitle = title;
            var dashIndex = displayTitle.indexOf('-');
            if (dashIndex > 0 && dashIndex < 5) {
                displayTitle = displayTitle.substring(dashIndex + 1);
            }

            var categories = meta && meta.categories.length > 0 ? meta.categories : [];
            // 从路径推断分类
            if (categories.length === 0) {
                var pathParts = relativePath.split('/');
                if (pathParts.length >= 2) {
                    categories = [pathParts[0], pathParts[pathParts.length - 2]];
                } else if (pathParts.length === 1) {
                    categories = [pathParts[0]];
                }
            }

            articles.push({
                title: displayTitle,
                originalTitle: title,
                path: displayPath,
                tags: meta && meta.tags.length > 0 ? meta.tags : [],
                categories: categories,
                date: meta && meta.date ? meta.date : ''
            });
        }
    }
}

// 主流程
console.log('开始扫描文章数据...');
console.log('扫描目录: ' + curPath);

var articles = [];
scanArticles(curPath, '', articles);

// 按路径排序
articles.sort(function (a, b) {
    return a.path.localeCompare(b.path);
});

// 写入 JSON（包装为 JS 变量赋值，供 <script> 标签加载）
var jsonStr = 'var articlesData = ' + JSON.stringify(articles, null, 2) + ';';
fs.writeFileSync(outputPath, jsonStr, 'utf-8');

console.log('扫描完成！');
console.log('共发现 ' + articles.length + ' 篇文章');
console.log('数据已写入: ' + outputPath);

// 统计标签数
var allTags = {};
articles.forEach(function (a) {
    a.tags.forEach(function (t) {
        allTags[t] = (allTags[t] || 0) + 1;
    });
});
console.log('共发现 ' + Object.keys(allTags).length + ' 个标签');
