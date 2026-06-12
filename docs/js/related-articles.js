/**
 * related-articles.js
 * Docsify 插件：在文章底部插入"相关推荐"
 *
 * 相关性算法：
 *   - 同一级分类 +10
 *   - 同二级分类 +20
 *   - 每个相同标签 +5
 *   - 最多展示 5 篇推荐
 *
 * 依赖：articles-data.json（通过 <script> 标签加载，定义 articlesData 全局变量）
 */
(function () {
    'use strict';

    // 全局文章数据（由 articles-data.json 通过 <script> 标签加载）
    var allArticles = (typeof articlesData !== 'undefined') ? articlesData : [];

    if (allArticles.length === 0) {
        console.warn('related-articles: 文章数据未加载，推荐功能不可用');
        return;
    }

    /**
     * 根据路径查找文章
     */
    function findArticleByPath(path) {
        if (!path) return null;
        for (var i = 0; i < allArticles.length; i++) {
            if (allArticles[i].path === path) {
                return allArticles[i];
            }
        }
        return null;
    }

    /**
     * 计算相关性得分
     */
    function calcScore(current, candidate) {
        var score = 0;

        // 同一级分类 +10
        if (current.categories && candidate.categories &&
            current.categories[0] === candidate.categories[0]) {
            score += 10;
        }

        // 同二级分类 +20
        if (current.categories && candidate.categories &&
            current.categories.length >= 2 && candidate.categories.length >= 2 &&
            current.categories[1] === candidate.categories[1]) {
            score += 20;
        }

        // 每个相同标签 +5
        if (current.tags && candidate.tags) {
            current.tags.forEach(function (tag) {
                if (candidate.tags.indexOf(tag) >= 0) {
                    score += 5;
                }
            });
        }

        return score;
    }

    /**
     * 渲染推荐区域
     */
    function renderRelatedArticles(vm) {
        var currentPath = vm.route.path;
        var currentArticle = findArticleByPath(currentPath);
        if (!currentArticle) return;

        // 计算所有文章的相关性
        var scored = allArticles.map(function (article) {
            if (article.path === currentArticle.path) return null;
            var score = calcScore(currentArticle, article);
            if (score <= 0) return null;
            return { article: article, score: score };
        }).filter(Boolean);

        // 按得分降序排序
        scored.sort(function (a, b) {
            if (b.score !== a.score) return b.score - a.score;
            // 同分时按日期倒序
            return (b.article.date || '').localeCompare(a.article.date || '');
        });

        // 取 Top 5
        var topArticles = scored.slice(0, 5);
        if (topArticles.length === 0) return;

        // 查找内容区域
        var contentArea = document.querySelector('.content');
        if (!contentArea) return;

        // 检查是否已经存在推荐区域（避免重复渲染）
        if (contentArea.querySelector('.related-articles')) return;

        // 构建 HTML
        var html = '<div class="related-articles">';
        html += '<h3>📖 相关推荐</h3>';
        html += '<ul class="related-list">';

        topArticles.forEach(function (item) {
            var path = item.article.path.replace(/^\.\//, '/').replace(/\.md$/, '');
            html += '<li>';
            html += '<a href="#' + path + '">' + escapeHtml(item.article.title) + '</a>';
            if (item.article.categories && item.article.categories.length > 0) {
                var catName = item.article.categories[item.article.categories.length - 1]
                    .replace(/^\d+_/, '');
                html += ' <span class="related-category">' + escapeHtml(catName) + '</span>';
            }
            html += '</li>';
        });

        html += '</ul></div>';

        contentArea.insertAdjacentHTML('beforeend', html);
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

    // 注册 Docsify 插件
    var relatedPlugin = function (hook, vm) {
        hook.doneEach(function () {
            // 使用 setTimeout 确保 DOM 完全渲染
            setTimeout(function () {
                renderRelatedArticles(vm);
            }, 100);
        });
    };

    window.$docsify = window.$docsify || {};
    window.$docsify.plugins = (window.$docsify.plugins || []).concat(relatedPlugin);
})();
