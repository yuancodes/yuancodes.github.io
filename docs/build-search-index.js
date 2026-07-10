var path = require('path');
var fs = require('fs');

var curPath = path.resolve('./');
var skipPathArr = ['.git', 'categories', 'emoji', 'about', 'tool', 'js', 'css'];

function getFrontMatter(content) {
    var match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (match) {
        return match[1];
    }
    return null;
}

function getTitle(content, fileName) {
    var frontMatter = getFrontMatter(content);
    if (frontMatter) {
        var titleMatch = frontMatter.match(/^title:\s*(.+)/m);
        if (titleMatch) {
            return titleMatch[1].trim();
        }
    }
    // 从文件名获取标题
    var name = fileName.replace(/\.md$/, '');
    if (name.indexOf('-') > 0) {
        name = name.substr(name.indexOf('-') + 1);
    }
    return name;
}

function getContentWithoutFrontMatter(content) {
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function stripMarkdown(md) {
    // 移除代码块
    var text = md.replace(/```[\s\S]*?```/g, ' ');
    // 移除行内代码
    text = text.replace(/`[^`]+`/g, ' ');
    // 移除链接，保留文字
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // 移除图片
    text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
    // 移除 HTML 标签
    text = text.replace(/<[^>]+>/g, ' ');
    // 移除 Markdown 标题符号
    text = text.replace(/^#+\s*/gm, '');
    // 移除加粗、斜体符号
    text = text.replace(/[*_]{1,3}/g, '');
    // 移除多余空格
    text = text.replace(/\s+/g, ' ');
    return text.trim();
}

function walkSync(currentDirPath, items) {
    var entries = fs.readdirSync(currentDirPath);

    entries.forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var basename = path.basename(filePath);
        var stat = fs.statSync(filePath);

        if (stat.isFile() && path.extname(filePath).toLowerCase() === '.md'
            && '_' !== basename.substr(0, 1) && basename !== 'README.md') {
            try {
                var content = fs.readFileSync(filePath, 'utf8');
                var title = getTitle(content, name);
                var text = getContentWithoutFrontMatter(content);
                var searchText = stripMarkdown(text);
                var relativePath = '.' + filePath.substr(curPath.length).replace(/\\/g, '/').replace(/\s+/g, '%20');

                items.push({
                    id: relativePath,
                    t: title,
                    // 只存储前 500 字符作为摘要
                    c: searchText.substring(0, 500)
                });
            } catch (e) {
                console.error('Error processing file:', filePath, e.message);
            }
        } else if (stat.isDirectory() && skipPathArr.indexOf(basename) < 0 && '_' !== basename.substr(0, 1)) {
            walkSync(filePath, items);
        }
    });
}

// 生成索引
var items = [];
walkSync(curPath, items);

// 按 order 排序（如果有）
items.sort(function (a, b) {
    return a.id.localeCompare(b.id);
});

console.log('Generated search index with ' + items.length + ' items');

// 写入文件
var indexContent = JSON.stringify(items);
fs.writeFileSync(path.join(curPath, 'search-index.json'), indexContent, 'utf8');

console.log('Search index written to search-index.json');
console.log('File size: ' + (indexContent.length / 1024).toFixed(2) + ' KB');
