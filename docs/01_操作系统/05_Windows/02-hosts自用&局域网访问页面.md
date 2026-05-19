---
title: 02-hosts自用&局域网访问页面
date: 2019-6-15 20:45:31
tags:
- windows
- hosts
- github
categories: 
- 01_操作系统
- 05_Windows
---



## hosts - github

```
# github
140.82.114.9 codeload.github.com
140.82.114.3 github.com
199.232.69.194 github.global.ssl.fastly.net
52.217.130.0 s3.amazonaws.com
52.217.232.73 github-cloud.s3.amazonaws.com
# Github Hosts
# update: 2021-01-26
140.82.113.4 github.com
140.82.114.10 nodeload.github.com
140.82.113.5 api.github.com
140.82.114.10 codeload.github.com

185.199.108.153 training.github.com
185.199.108.153 assets-cdn.github.com
185.199.108.153 documentcloud.github.com
185.199.108.154 help.github.com
185.199.108.153 githubstatus.com

199.232.69.194 github.global.ssl.fastly.net
199.232.96.133 raw.github.com
199.232.96.133 raw.githubusercontent.com
199.232.96.133 cloud.githubusercontent.com
199.232.96.133 gist.githubusercontent.com
199.232.96.133 marketplace-screenshots.githubusercontent.com
199.232.96.133 repository-images.githubusercontent.com
199.232.96.133 user-images.githubusercontent.com
199.232.96.133 desktop.githubusercontent.com

199.232.96.133 avatars.githubusercontent.com
199.232.96.133 avatars0.githubusercontent.com
199.232.96.133 avatars1.githubusercontent.com
199.232.96.133 avatars2.githubusercontent.com
199.232.96.133 avatars3.githubusercontent.com
199.232.96.133 avatars4.githubusercontent.com
199.232.96.133 avatars5.githubusercontent.com
199.232.96.133 avatars6.githubusercontent.com
199.232.96.133 avatars7.githubusercontent.com
199.232.96.133 avatars8.githubusercontent.com
# End of the section
```



## 局域网访问页面

### 1. 关闭**你自己电脑**防火墙（最简单方案）

Win11 操作：

1. 设置 → 更新和安全 → Windows 安全中心 → 防火墙和网络保护
2. 把**专用网络、公用网络**防火墙**全部临时关闭**

> 只关**你自己电脑**的，同事电脑不用关任何防火墙

### 2. 不想关全局防火墙 → 单独放行端口（`推荐`）

1. 搜索「**高级安全 Windows 防火墙**」
2. 左侧 **入站规则** → 右侧 **新建规则**
3. 规则类型：**端口**
4. 协议和端口：TCP，填入你的 Node 端口（如 3000）
5. 允许连接 → 全选网络 → 命名：Node 服务端口 3000，完成

> 1、按下 Win + R 键调出“运行”窗口。 
>
> 2、输入 `wf.msc` 并按回车。
>
> 或
>
> windows位置: 控制面板\所有控制面板项\Windows Defender 防火墙 - 高级设置

