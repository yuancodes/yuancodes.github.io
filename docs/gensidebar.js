var sidebarTxt = '<!-- 侧边栏：docs/_sidebar.md -->\n\n* :house:首页\n    * [目录](_sidebar.md)\n\n';
var path = require('path');
var curPath = path.resolve('./');
var skipPathArr = ['.git', 'categories', 'emoji', 'about', 'tool', 'js', 'css'];

function walkSync(currentDirPath, prefixBlank, callback) {
    var fs = require('fs'),
        path = require('path');
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var basename = path.basename(filePath);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory() && skipPathArr.indexOf(basename) < 0 && '_' != basename.substr(0, 1)) {
            sidebarTxt += prefixBlank + '* ' + basename + '\n';
            walkSync(filePath, prefixBlank + '    ', callback);
        }
    });
}

walkSync(curPath, '', function (filePath, stat) {
    if (".md" == path.extname(filePath).toLowerCase()
        && '_' != path.basename(filePath).substr(0, 1)
        && 'README.md' != path.basename(filePath)) {
        var relativeFilePath = filePath.substr(curPath.length);
        //console.log("file:"+ path.basename(filePath).slice(1));
        var itemText = relativeFilePath.substr(1, relativeFilePath.length - 4);
        while (itemText.indexOf('\\') > 0) {
            itemText = itemText.substr(itemText.indexOf('\\') + 1);
            sidebarTxt += '    ';
        }
        var itemTextArr = itemText.split('\\');
        itemText = itemTextArr[itemTextArr.length - 1];
        if (itemText.indexOf('-') > 0) {
            itemText = itemText.substr(itemText.indexOf('-') + 1);
        }
        //console.log("itemText: " + itemText);
        relativeFilePath = "." + relativeFilePath.replace(/\\/g, '/').replace(/\s+/g, '%20');
        //console.log("relativeFilePath: " + relativeFilePath)
        sidebarTxt += '* [' + itemText + '](' + relativeFilePath + ')\n';
    }
    //console.log("file:"+ +path.extname(filePath));
});

var path = require('path');
var fs = require('fs');
fs.copyFile(path.resolve('./') + "/_sidebar.md", path.resolve('./') + "/_sidebar.md.bak", function (err) {
    if (err) throw new Error('something wrong was happended')
});
//console.log(path.resolve('./')+"/_sidebar.md");

console.log(sidebarTxt);
fs.writeFile(path.resolve('./') + '/_sidebar.md', sidebarTxt, function (err) {
    if (err) {
        console.error(err);
    }
});