var sidebarTxt = '<!-- 侧边栏：docs/_sidebar.md -->\n\n* :house:首页\n    * [目录](_sidebar.md)\n\n';
var path = require('path');
var fs = require('fs');
var curPath = path.resolve('./');
var skipPathArr = ['.git', 'categories', 'emoji', 'about', 'tool', 'js', 'css'];

function getOrder(filePath) {
    try {
        var content = fs.readFileSync(filePath, 'utf8');
        var match = content.match(/^---\n([\s\S]*?)\n---/);
        if (match) {
            var orderMatch = match[1].match(/^order:\s*(\S+)/m);
            if (orderMatch) {
                var val = Number(orderMatch[1]);
                return isNaN(val) ? Infinity : val;
            }
        }
    } catch (e) {}
    return Infinity;
}

function getDisplayText(name) {
    var text = name;
    if (text.indexOf('-') > 0) {
        text = text.substr(text.indexOf('-') + 1);
    }
    return text.replace(/\.md$/, '');
}

function walkSync(currentDirPath, prefixBlank) {
    var entries = fs.readdirSync(currentDirPath);
    var items = [];

    entries.forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var basename = path.basename(filePath);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && path.extname(filePath).toLowerCase() === '.md'
            && '_' !== basename.substr(0, 1) && basename !== 'README.md') {
            items.push({ type: 'file', name: name, filePath: filePath, order: getOrder(filePath) });
        } else if (stat.isDirectory() && skipPathArr.indexOf(basename) < 0 && '_' !== basename.substr(0, 1)) {
            items.push({ type: 'dir', name: name, filePath: filePath, order: Infinity });
        }
    });

    items.sort(function (a, b) {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
    });

    items.forEach(function (item) {
        if (item.type === 'file') {
            var relativeFilePath = item.filePath.substr(curPath.length);
            var displayText = getDisplayText(item.name);
            var relativePath = '.' + relativeFilePath.replace(/\\/g, '/').replace(/\s+/g, '%20');
            sidebarTxt += prefixBlank + '* [' + displayText + '](' + relativePath + ')\n';
        } else {
            sidebarTxt += prefixBlank + '* ' + item.name + '\n';
            walkSync(item.filePath, prefixBlank + '    ');
        }
    });
}

walkSync(curPath, '');

fs.copyFile(path.resolve('./') + "/_sidebar.md", path.resolve('./') + "/_sidebar.md.bak", function (err) {
    if (err) throw new Error('something wrong was happended')
});

console.log(sidebarTxt);
fs.writeFile(path.resolve('./') + '/_sidebar.md', sidebarTxt, function (err) {
    if (err) {
        console.error(err);
    }
});
