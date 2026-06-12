/**
 * tag-cloud.js
 * 标签云交互逻辑 - 统计标签频率、渲染标签云、点击筛选文章
 *
 * 依赖：articles-data.json（通过 <script> 标签加载，定义 articlesData 全局变量）
 */
(function () {
    'use strict';

    var TAG_COLORS = [
        '#78c06e', // 等级1 - 绿色
        '#5b9bd5', // 等级2 - 蓝色
        '#ed7d31', // 等级3 - 橙色
        '#ffc000', // 等级4 - 黄色
        '#c00000'  // 等级5 - 红色（高频）
    ];

    var articlesData = [];
    var tagFrequency = {};

    /**
     * 初始化
     */
    function init() {
        if (typeof articlesData !== 'undefined' && window.articlesData.length > 0) {
            articlesData = window.articlesData;
        }
        if (articlesData.length === 0) {
            document.getElementById('tag-cloud').innerHTML =
                '<p style="color:#999;">标签数据未加载，请刷新页面</p>';
            return;
        }
        calcTagFrequency();
        renderTagCloud();
    }

    /**
     * 计算标签频率
     */
    function calcTagFrequency() {
        tagFrequency = {};
        articlesData.forEach(function (article) {
            if (article.tags && article.tags.length > 0) {
                article.tags.forEach(function (tag) {
                    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
                });
            }
        });
    }

    /**
     * 根据频率计算等级(1-5)
     */
    function getLevel(count) {
        if (count >= 20) return 5;
        if (count >= 10) return 4;
        if (count >= 5) return 3;
        if (count >= 2) return 2;
        return 1;
    }

    /**
     * 根据等级获取字体大小
     */
    function getFontSize(level) {
        var sizes = [12, 14, 17, 21, 26];
        return sizes[level - 1];
    }

    /**
     * 渲染标签云
     */
    function renderTagCloud() {
        var container = document.getElementById('tag-cloud');
        if (!container) return;

        // 按频率降序排序
        var sortedTags = Object.keys(tagFrequency).sort(function (a, b) {
            return tagFrequency[b] - tagFrequency[a];
        });

        if (sortedTags.length === 0) {
            container.innerHTML = '<p style="color:#999;">暂无标签</p>';
            return;
        }

        var html = '';
        sortedTags.forEach(function (tag) {
            var count = tagFrequency[tag];
            var level = getLevel(count);
            var fontSize = getFontSize(level);
            var color = TAG_COLORS[level - 1];

            html += '<span class="tag-item" ' +
                'data-tag="' + escapeHtml(tag) + '" ' +
                'data-count="' + count + '" ' +
                'style="font-size:' + fontSize + 'px; ' +
                'color:' + color + '; ' +
                'border:1px solid ' + color + ';" ' +
                'title="共 ' + count + ' 篇文章">' +
                escapeHtml(tag) + ' <small>(' + count + ')</small></span>';
        });

        container.innerHTML = html;

        // 绑定点击事件
        var tagItems = container.querySelectorAll('.tag-item');
        for (var i = 0; i < tagItems.length; i++) {
            tagItems[i].addEventListener('click', function (e) {
                var tagName = this.getAttribute('data-tag');
                filterByTag(tagName);
            });
        }
    }

    /**
     * 按标签筛选文章
     */
    function filterByTag(tagName) {
        var resultContainer = document.getElementById('tag-filter-result');
        if (!resultContainer) return;

        var matched = articlesData.filter(function (article) {
            return article.tags && article.tags.indexOf(tagName) >= 0;
        });

        // 按日期倒序
        matched.sort(function (a, b) {
            return (b.date || '').localeCompare(a.date || '');
        });

        var html = '<div class="filter-header">';
        html += '<h3>标签「' + escapeHtml(tagName) + '」下的文章 <small>(' + matched.length + ' 篇)</small></h3>';
        html += '<button class="filter-back" onclick="document.getElementById(\'tag-filter-result\').innerHTML=\'\';document.getElementById(\'tag-cloud\').style.display=\'flex\';">&larr; 返回标签云</button>';
        html += '</div>';

        if (matched.length === 0) {
            html += '<p style="color:#999; padding:10px;">暂无匹配文章</p>';
        } else {
            html += '<ul class="filter-list">';
            matched.forEach(function (article) {
                var path = article.path.replace(/^\.\//, '/').replace(/\.md$/, '');
                html += '<li>';
                html += '<a href="#' + path + '">' + escapeHtml(article.title) + '</a>';
                if (article.date) {
                    html += ' <small class="filter-date">' + escapeHtml(article.date) + '</small>';
                }
                if (article.categories && article.categories.length > 0) {
                    html += ' <small class="filter-categories">' + escapeHtml(article.categories.join(' > ')) + '</small>';
                }
                html += '</li>';
            });
            html += '</ul>';
        }

        resultContainer.innerHTML = html;
        // 隐藏标签云，显示结果
        document.getElementById('tag-cloud').style.display = 'none';
    }

    /**
     * HTML 转义
     */
    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // DOM 就绪后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
