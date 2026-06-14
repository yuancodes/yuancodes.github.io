/**
 * Docsify Search Plugin with IndexedDB Sharded Storage
 * - 全站索引用分片形式存储在 IndexedDB 中
 * - 默认缓存7天过期
 * - 显示索引进度百分比（灰色<100%，绿色=100%）
 * - 已有缓存时直接进入全站搜索，无需重复索引
 */
(function () {
    // ========== 工具函数（保持与原插件一致） ==========
    function cleanMarkdown(text) {
        return text
            .replace(/<!-- {docsify-ignore} -->/, '')
            .replace(/{docsify-ignore}/, '')
            .replace(/<!-- {docsify-ignore-all} -->/, '')
            .replace(/{docsify-ignore-all}/, '')
            .trim();
    }

    function escapeHtml(text) {
        var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(text).replace(/[&<>"']/g, function (c) { return map[c]; });
    }

    function getTableText(item) {
        if (!item.text && item.type === 'table') {
            item.cells.unshift(item.header);
            item.text = item.cells.map(function (c) { return c.join(' | '); }).join(' |\n ');
        }
        return item.text;
    }

    function getListText(item) {
        if (!item.text && item.type === 'list') {
            item.text = item.raw;
        }
        return item.text;
    }

    // 解析 markdown 为索引数据（与原插件逻辑一致）
    function parseIndex(path, content, router, depth) {
        if (!content) content = '';
        var tokens = window.marked.lexer(content);
        var slugify = window.Docsify.slugify;
        var pathResult = '';
        var lastSlug = '';

        tokens.forEach(function (token, i) {
            if (token.type === 'heading' && token.depth <= depth) {
                // 处理标题属性
                var textStr = token.text || '';
                var config = {};
                textStr = textStr.replace(/^('|")/, '').replace(/('|")$/, '')
                    .replace(/(?:^|\s):([\w-]+:?)=?([\w-%]+)?/g, function (match, key, val) {
                        if (key.indexOf(':') === -1) {
                            config[key] = (val && val.replace(/&quot;/g, '')) || true;
                            return '';
                        }
                        return match;
                    }).trim();

                var attrId = config.id;
                var cleanText = cleanMarkdown(token.text);
                var slug;

                if (attrId) {
                    slug = router.toURL(path, { id: slugify(attrId) });
                } else {
                    slug = router.toURL(path, { id: slugify(escapeHtml(cleanText)) });
                }

                if (cleanText) {
                    pathResult = cleanText;
                }

                lastSlug = slug;
                indexData[lastSlug] = { slug: lastSlug, title: pathResult, body: '' };
            } else {
                if (i === 0) {
                    lastSlug = router.toURL(path);
                    indexData[lastSlug] = {
                        slug: lastSlug,
                        title: path !== '/' ? path.slice(1) : 'Home Page',
                        body: token.text || ''
                    };
                }

                if (lastSlug) {
                    if (indexData[lastSlug]) {
                        if (indexData[lastSlug].body) {
                            token.text = getTableText(token);
                            token.text = getListText(token);
                            indexData[lastSlug].body += '\n' + (token.text || '');
                        } else {
                            token.text = getTableText(token);
                            token.text = getListText(token);
                            indexData[lastSlug].body = indexData[lastSlug].body
                                ? indexData[lastSlug].body + token.text
                                : token.text;
                        }
                    } else {
                        indexData[lastSlug] = { slug: lastSlug, title: '', body: token.text || '' };
                    }
                }
            }
        });

        slugify.clear();
        return indexData;
    }

    function normalizeText(text) {
        return text && text.normalize ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : text;
    }

    // ========== 搜索逻辑（与原插件一致） ==========
    var indexData = {};
    var configConstants = {
        EXPIRE_KEY: 'docsify.search.expires',
        INDEX_KEY: 'docsify.search.index',
        IDB_NAME: 'docsify_search_db',
        IDB_STORE: 'search_index_shards',
        IDB_VERSION: 1,
        SHARD_SIZE: 50,
        MAX_AGE_DEFAULT: 7 * 24 * 60 * 60 * 1000 // 7天
    };

    // 执行搜索
    function doSearch(query) {
        var results = [];
        var allItems = [];

        // 收集所有已索引的项
        Object.keys(indexData).forEach(function (key) {
            allItems = allItems.concat(Object.keys(indexData[key]).map(function (slug) {
                return indexData[key][slug];
            }));
        });

        var terms = query.trim().split(/[\s\-\uff0c\\/]+/);
        if (terms.length !== 1) {
            terms = [].concat(query.trim(), terms);
        }

        for (var i = 0; i < allItems.length; i++) {
            (function (item) {
                var score = 0;
                var excerpt = '';
                var titleStr = '';
                var bodyStr = '';
                var titleRaw = item.title && item.title.trim();
                var bodyRaw = item.body && item.body.trim();
                var slug = item.slug || '';

                if (!titleRaw) return;

                titleStr = titleRaw;
                bodyStr = bodyRaw;
                var escapedTitle = escapeHtml(normalizeText(titleStr));
                var escapedBody = escapeHtml(normalizeText(bodyStr));

                terms.forEach(function (term) {
                    if (!term) return;
                    var regex = new RegExp(escapeHtml(normalizeText(term)).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'), 'gi');
                    var titleMatch = escapedTitle ? escapedTitle.search(regex) : -1;
                    var bodyMatch = escapedBody ? escapedBody.search(regex) : -1;

                    if (titleMatch >= 0 || bodyMatch >= 0) {
                        score += titleMatch >= 0 ? 3 : 0;
                        score += bodyMatch >= 0 ? 2 : 0;

                        var start, end;
                        if (bodyMatch >= 0) {
                            start = (bodyMatch < 11 ? 0 : bodyMatch - 10);
                            end = bodyMatch + term.length + 60;
                            if (bodyStr && end > bodyStr.length) end = bodyStr.length;
                            var snippet = escapedBody && '...' + escapedBody.substring(start, end).replace(regex, function (m) {
                                return '<em class="search-keyword">' + m + '</em>';
                            }) + '...';
                            excerpt += snippet;
                        }
                    }
                });

                if (score > 0) {
                    results.push({
                        title: escapedTitle,
                        content: bodyStr ? excerpt : '',
                        url: slug,
                        score: score
                    });
                }
            })(allItems[i]);
        }

        results.sort(function (a, b) { return b.score - a.score; });
        return results;
    }

    // ========== IndexedDB 分片存储 ==========
    var IDB = {
        db: null,

        openDB: function () {
            return new Promise(function (resolve, reject) {
                if (IDB.db) {
                    resolve(IDB.db);
                    return;
                }
                var request = indexedDB.open(configConstants.IDB_NAME, configConstants.IDB_VERSION);
                request.onupgradeneeded = function (e) {
                    var db = e.target.result;
                    if (!db.objectStoreNames.contains(configConstants.IDB_STORE)) {
                        db.createObjectStore(configConstants.IDB_STORE, { keyPath: 'key' });
                    }
                };
                request.onsuccess = function (e) {
                    IDB.db = e.target.result;
                    resolve(IDB.db);
                };
                request.onerror = function (e) {
                    reject(e);
                };
            });
        },

        get: function (key) {
            return new Promise(function (resolve, reject) {
                IDB.openDB().then(function (db) {
                    var tx = db.transaction([configConstants.IDB_STORE], 'readonly');
                    var store = tx.objectStore(configConstants.IDB_STORE);
                    var req = store.get(key);
                    req.onsuccess = function () {
                        resolve(req.result ? req.result.value : null);
                    };
                    req.onerror = function () { reject(); };
                }).catch(function () { reject(); });
            });
        },

        set: function (key, value) {
            return new Promise(function (resolve, reject) {
                IDB.openDB().then(function (db) {
                    var tx = db.transaction([configConstants.IDB_STORE], 'readwrite');
                    var store = tx.objectStore(configConstants.IDB_STORE);
                    var req = store.put({ key: key, value: value });
                    req.onsuccess = function () { resolve(); };
                    req.onerror = function () { reject(); };
                }).catch(function () { reject(); });
            });
        },

        delete: function (key) {
            return new Promise(function (resolve, reject) {
                IDB.openDB().then(function (db) {
                    var tx = db.transaction([configConstants.IDB_STORE], 'readwrite');
                    var store = tx.objectStore(configConstants.IDB_STORE);
                    var req = store.delete(key);
                    req.onsuccess = function () { resolve(); };
                    req.onerror = function () { reject(); };
                }).catch(function () { reject(); });
            });
        },

        // 检查缓存是否过期
        isCacheValid: function (expireKey) {
            return IDB.get(expireKey).then(function (expireTime) {
                return !!expireTime && expireTime > Date.now();
            }).catch(function () { return false; });
        },

        // 分片保存索引数据
        saveAllShards: function (indexKey, paths, maxAge, onProgress) {
            var totalShards = Math.ceil(paths.length / configConstants.SHARD_SIZE);
            var currentShard = 0;

            var saveNext = function () {
                if (currentShard >= totalShards) {
                    // 所有分片保存完毕，写入 meta 信息
                    IDB.set(indexKey + '_meta', {
                        totalShards: totalShards,
                        paths: paths,
                        expireTime: Date.now() + maxAge
                    }).then(function () {
                        onProgress && onProgress(100);
                    }).catch(function () {
                        onProgress && onProgress(100);
                    });
                    return;
                }

                var start = currentShard * configConstants.SHARD_SIZE;
                var end = Math.min(start + configConstants.SHARD_SIZE, paths.length);
                var shardData = {};

                for (var i = start; i < end; i++) {
                    var p = paths[i];
                    if (indexData[p]) {
                        shardData[p] = indexData[p];
                    }
                }

                IDB.set(indexKey + '_shard_' + currentShard, shardData).then(function () {
                    currentShard++;
                    var pct = Math.round((currentShard / totalShards) * 100);
                    if (pct < 100) {
                        onProgress && onProgress(pct);
                    }
                    setTimeout(saveNext, 0);
                }).catch(function () {
                    onProgress && onProgress(100);
                });
            };

            saveNext();
        },

        // 从分片加载索引数据
        loadAllShards: function (indexKey) {
            return new Promise(function (resolve, reject) {
                IDB.get(indexKey + '_meta').then(function (meta) {
                    if (!meta) {
                        resolve(false);
                        return;
                    }

                    // 检查是否过期
                    if (meta.expireTime && meta.expireTime < Date.now()) {
                        resolve(false);
                        return;
                    }

                    var totalShards = meta.totalShards;
                    var currentShard = 0;

                    var loadNext = function () {
                        if (currentShard >= totalShards) {
                            resolve(true);
                            return;
                        }

                        IDB.get(indexKey + '_shard_' + currentShard).then(function (shardData) {
                            if (shardData) {
                                // 将分片数据合并到 indexData
                                Object.keys(shardData).forEach(function (pathKey) {
                                    indexData[pathKey] = shardData[pathKey];
                                });
                            }
                            currentShard++;
                            loadNext();
                        }).catch(function () {
                            resolve(false);
                        });
                    };

                    loadNext();
                }).catch(function () {
                    reject();
                });
            });
        },

        // 清除分片缓存
        clearShards: function (indexKey) {
            return new Promise(function (resolve) {
                IDB.get(indexKey + '_meta').then(function (meta) {
                    if (!meta) {
                        resolve();
                        return;
                    }
                    var promises = [];
                    for (var i = 0; i < meta.totalShards; i++) {
                        promises.push(IDB.delete(indexKey + '_shard_' + i));
                    }
                    promises.push(IDB.delete(indexKey + '_meta'));
                    Promise.all(promises).then(function () { resolve(); }).catch(function () { resolve(); });
                }).catch(function () { resolve(); });
            });
        }
    };

    // ========== 索引进度显示 ==========
    function updateProgress(percent) {
        var el = document.querySelector('div.search .index-progress');
        if (!el) return;

        if (percent >= 100) {
            el.textContent = '全站索引100%';
            el.classList.add('complete');
        } else {
            el.textContent = '全站索引' + percent + '%';
            el.classList.remove('complete');
        }
    }

    // ========== 索引主流程 ==========
    var nsPrefix = '';

    function buildIndex(opts, vm, forceRebuild) {
        var isAuto = opts.paths === 'auto';
        var paths;

        if (isAuto) {
            var router = vm.router;
            paths = [];
            Docsify.dom.findAll('.sidebar-nav a:not(.section-link):not([data-nosearch])').forEach(function (link) {
                var href = link.getAttribute('href');
                var parsed = router.parse(href);
                var path = parsed.path || href || '';
                if (path && paths.indexOf(path) === -1 && !Docsify.util.isAbsolutePath(href)) {
                    paths.push(path);
                }
            });
        } else {
            paths = opts.paths;
        }

        // 处理 namespace
        nsPrefix = '';
        if (paths.length && isAuto && opts.pathNamespaces) {
            var firstPath = paths[0];
            if (Array.isArray(opts.pathNamespaces)) {
                nsPrefix = opts.pathNamespaces.filter(function (ns) {
                    return firstPath.slice(0, ns.length) === ns;
                })[0] || nsPrefix;
            } else if (opts.pathNamespaces instanceof RegExp) {
                var match = firstPath.match(opts.pathNamespaces);
                if (match) nsPrefix = match[0];
            }

            var hasNsPath = paths.indexOf(nsPrefix + '/') !== -1;
            var hasNsReadme = paths.indexOf(nsPrefix + '/README') !== -1;
            if (!hasNsPath && !hasNsReadme) {
                paths.unshift(nsPrefix + '/');
            }
        } else {
            var hasRoot = paths.indexOf('/') !== -1;
            var hasRootReadme = paths.indexOf('/README') !== -1;
            if (!hasRoot && !hasRootReadme) {
                paths.unshift('/');
            }
        }

        var expireKey = ((opts.namespace) ? configConstants.EXPIRE_KEY + '/' + opts.namespace : configConstants.EXPIRE_KEY) + nsPrefix;
        var indexKey = ((opts.namespace) ? configConstants.INDEX_KEY + '/' + opts.namespace : configConstants.INDEX_KEY) + nsPrefix;
        var maxAge = opts.maxAge || configConstants.MAX_AGE_DEFAULT;

        // 检查缓存是否有效
        IDB.isCacheValid(expireKey + '_expire').then(function (valid) {
            if (valid && !forceRebuild) {
                // 缓存有效，从 IndexedDB 加载分片
                IDB.loadAllShards(indexKey).then(function (success) {
                    updateProgress(100);
                }).catch(function () {
                    doBuildIndex(paths, indexKey, expireKey, maxAge, opts, vm);
                });
            } else {
                // 缓存无效或强制重建
                doBuildIndex(paths, indexKey, expireKey, maxAge, opts, vm);
            }
        }).catch(function () {
            // IndexedDB 不可用
            doBuildIndex(paths, indexKey, expireKey, maxAge, opts, vm);
        });
    }

    // 实际执行索引构建
    function doBuildIndex(paths, indexKey, expireKey, maxAge, opts, vm) {
        var total = paths.length;
        var done = 0;
        var lastShard = -1;

        var buildNext = function () {
            if (done >= total) {
                // 索引全部完成，保存分片到 IndexedDB
                IDB.set(expireKey + '_expire', Date.now() + maxAge).then(function () {
                    IDB.saveAllShards(indexKey, paths, maxAge, updateProgress);
                }).catch(function () {
                    updateProgress(100);
                });
                return;
            }

            var path = paths[done];

            // 如果已经索引过（来自缓存的部分数据），跳过
            if (indexData[path]) {
                done++;
                updateProgress(Math.round(done / total * 100));
                buildNext();
                return;
            }

            Docsify.get(vm.router.getFile(path), false, vm.config.requestHeaders).then(function (content) {
                parseIndex(path, content, vm.router, opts.depth);
                var pct = Math.round(++done / total * 100);
                updateProgress(pct);

                // 分片写入：每 SHARD_SIZE 个路径保存一个分片
                var currentShard = Math.floor(done / configConstants.SHARD_SIZE);
                if (currentShard > lastShard && done % configConstants.SHARD_SIZE === 0) {
                    lastShard = currentShard;
                    var shardStart = (currentShard - 1) * configConstants.SHARD_SIZE;
                    var shardData = {};
                    for (var i = shardStart; i < done; i++) {
                        var p = paths[i];
                        if (indexData[p]) {
                            shardData[p] = indexData[p];
                        }
                    }
                    IDB.set(indexKey + '_shard_' + (currentShard - 1), shardData).catch(function () {});
                }

                buildNext();
            }).catch(function () {
                done++;
                updateProgress(Math.round(done / total * 100));
                buildNext();
            });
        };

        buildNext();
    }

    // ========== 搜索结果渲染 ==========
    var noDataText = '';

    function renderSearchResults(query) {
        var searchEl = Docsify.dom.find('div.search');
        var resultsPanel = Docsify.dom.find(searchEl, '.results-panel');
        var clearBtn = Docsify.dom.find(searchEl, '.clear-button');
        var sidebarNav = Docsify.dom.find('.sidebar-nav');
        var appName = Docsify.dom.find('.app-name');

        if (!query) {
            resultsPanel.classList.remove('show');
            clearBtn.classList.remove('show');
            resultsPanel.innerHTML = '';
            if (searchOpts.hideOtherSidebarContent) {
                if (sidebarNav) sidebarNav.classList.remove('hide');
                if (appName) appName.classList.remove('hide');
            }
            return;
        }

        var results = doSearch(query);
        var html = '';

        results.forEach(function (item) {
            html += '<div class="matching-post">\n<a href="' + item.url + '">\n<h2>' + item.title + '</h2>\n<p>' + item.content + '</p>\n</a>\n</div>';
        });

        resultsPanel.classList.add('show');
        clearBtn.classList.add('show');
        resultsPanel.innerHTML = html || '<p class="empty">' + noDataText + '</p>';

        if (searchOpts.hideOtherSidebarContent) {
            if (sidebarNav) sidebarNav.classList.add('hide');
            if (appName) appName.classList.add('hide');
        }
    }

    // ========== 样式注入 ==========
    var stylesInjected = false;
    function injectStyles() {
        if (stylesInjected) return;
        stylesInjected = true;
        Docsify.dom.style(
            '\n' +
            '.sidebar { padding-top: 0; }\n' +
            '.search { margin-bottom: 20px; padding: 6px; border-bottom: 1px solid #eee; }\n' +
            '.search .input-wrap { display: flex; align-items: center; }\n' +
            '.search .results-panel { display: none; }\n' +
            '.search .results-panel.show { display: block; }\n' +
            '.search input { outline: none; border: none; width: 100%; padding: 0.6em 7px; font-size: inherit; border: 1px solid transparent; }\n' +
            '.search input:focus { box-shadow: 0 0 5px var(--theme-color, #42b983); border: 1px solid var(--theme-color, #42b983); }\n' +
            '.search input::-webkit-search-decoration, .search input::-webkit-search-cancel-button, .search input { -webkit-appearance: none; -moz-appearance: none; appearance: none; }\n' +
            '.search input::-ms-clear { display: none; height: 0; width: 0; }\n' +
            '.search .clear-button { cursor: pointer; width: 36px; text-align: right; display: none; }\n' +
            '.search .clear-button.show { display: block; }\n' +
            '.search .clear-button svg { transform: scale(.5); }\n' +
            '.search .index-progress { font-size: 12px; text-align: right; padding: 2px 0; color: #999; }\n' +
            '.search .index-progress.complete { color: #42b983; }\n' +
            '.search h2 { font-size: 17px; margin: 10px 0; }\n' +
            '.search a { text-decoration: none; color: inherit; }\n' +
            '.search .matching-post { border-bottom: 1px solid #eee; }\n' +
            '.search .matching-post:last-child { border-bottom: 0; }\n' +
            '.search p { font-size: 14px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }\n' +
            '.search p.empty { text-align: center; }\n' +
            '.app-name.hide, .sidebar-nav.hide { display: none; }\n'
        );
    }

    // ========== 初始化搜索 UI ==========
    var searchOpts = {};
    var searchTimer = null;

    function initSearchUI(opts, vm) {
        var initialQuery = vm.router.parse().query.s;
        searchOpts = opts;
        noDataText = opts.noData;

        injectStyles();

        // 创建搜索 HTML 结构（新增 index-progress div）
        var searchHTML = '<div class="input-wrap">\n' +
            '      <input type="search" value="" aria-label="Search text" placeholder="搜索" />\n' +
            '      <div class="clear-button">\n' +
            '        <svg width="26" height="24">\n' +
            '          <circle cx="12" cy="12" r="11" fill="#ccc" />\n' +
            '          <path stroke="white" stroke-width="2" d="M8.25,8.25,15.75,15.75" />\n' +
            '          <path stroke="white" stroke-width="2" d="M8.25,15.75,15.75,8.25" />\n' +
            '        </svg>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '    <div class="index-progress"></div>\n' +
            '    <div class="results-panel"></div>';

        var searchEl = Docsify.dom.create('div', searchHTML);
        var aside = Docsify.dom.find('aside');
        Docsify.dom.toggleClass(searchEl, 'search');
        Docsify.dom.before(aside, searchEl);

        // 事件绑定
        var searchContainer = Docsify.dom.find('div.search');
        var searchInput = Docsify.dom.find(searchContainer, 'input');
        var inputWrap = Docsify.dom.find(searchContainer, '.input-wrap');

        Docsify.dom.on(searchContainer, 'click', function (e) {
            if (['A', 'H2', 'P', 'EM'].indexOf(e.target.tagName) === -1) {
                e.stopPropagation();
            }
        });

        Docsify.dom.on(searchInput, 'input', function (e) {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function () {
                renderSearchResults(e.target.value.trim());
            }, 100);
        });

        Docsify.dom.on(inputWrap, 'click', function (e) {
            if (e.target.tagName !== 'INPUT') {
                searchInput.value = '';
                renderSearchResults('');
            }
        });

        // 如果有初始搜索词，执行搜索
        if (initialQuery) {
            setTimeout(function () {
                renderSearchResults(initialQuery);
            }, 500);
        }
    }

    // ========== 插件入口 ==========
    var defaultOpts = {
        placeholder: 'Type to search',
        noData: 'No Results!',
        paths: 'auto',
        depth: 2,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
        hideOtherSidebarContent: false,
        namespace: undefined,
        pathNamespaces: undefined
    };

    $docsify.plugins = [].concat(function (hook, vm) {
        var util = Docsify.util;
        var opts = vm.config.search || defaultOpts;

        if (Array.isArray(opts)) {
            defaultOpts.paths = opts;
        } else if (typeof opts === 'object') {
            defaultOpts.paths = Array.isArray(opts.paths) ? opts.paths : 'auto';
            defaultOpts.maxAge = util.isPrimitive(opts.maxAge) ? opts.maxAge : defaultOpts.maxAge;
            defaultOpts.placeholder = opts.placeholder || defaultOpts.placeholder;
            defaultOpts.noData = opts.noData || defaultOpts.noData;
            defaultOpts.depth = opts.depth || defaultOpts.depth;
            defaultOpts.hideOtherSidebarContent = opts.hideOtherSidebarContent || defaultOpts.hideOtherSidebarContent;
            defaultOpts.namespace = opts.namespace || defaultOpts.namespace;
            defaultOpts.pathNamespaces = opts.pathNamespaces || defaultOpts.pathNamespaces;
        }

        var isAuto = defaultOpts.paths === 'auto';

        hook.mounted(function () {
            initSearchUI(defaultOpts, vm);
            if (!isAuto) {
                buildIndex(defaultOpts, vm, false);
            }
        });

        hook.doneEach(function () {
            // 更新 placeholder
            var placeholder = defaultOpts.placeholder;
            var routePath = vm.route.path;
            var inputEl = Docsify.dom.getNode('.search input[type="search"]');
            if (inputEl) {
                if (typeof placeholder === 'string') {
                    inputEl.placeholder = placeholder;
                } else {
                    var matchedKey = Object.keys(placeholder).filter(function (key) {
                        return routePath.indexOf(key) > -1;
                    })[0];
                    inputEl.placeholder = placeholder[matchedKey];
                }
            }

            // 更新 noData 文本
            var noData = defaultOpts.noData;
            var currentPath = vm.route.path;
            noDataText = typeof noData === 'string' ? noData : noData[Object.keys(noData).filter(function (key) {
                return currentPath.indexOf(key) > -1;
            })[0]];

            if (isAuto) {
                buildIndex(defaultOpts, vm, false);
            }
        });
    }, $docsify.plugins);
})();
