---
title: 04-Docker 构建镜像&运行&负载均衡
date: 2025-5-27 22:25:52
tags:
- Docker
categories: 
- 12_项目管理
- 04_Docker
---



## 前置

在 centos 中先提前处理一些前置问题：

> 新安装的centos7.9 执行命令 `sudo yum update -y` 报错：
>
> Cannot find a valid baseurl for repo: base/7/x86_64
>
> 解决方案: 
>
> ```sh
> # 先切root用户
> su - root
> # 进入源目录
> cd /etc/yum.repos.d/
> # 备份所有旧 repo（防止改错）
> mkdir backup
> mv CentOS-*.repo backup/
> # 下载阿里云 CentOS7 源
> curl -o CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
> # 把 $releasever 写死为 7.9.2009（避免自动匹配出错）
> sed -i 's/$releasever/7.9.2009/g' CentOS-Base.repo
> 
> # 清理缓存 + 重建
> yum clean all
> yum makecache
> 
> # 再次执行
> sudo yum update -y
> ```



## 安装 Docker

### 安装并设置开机自启

```sh
# 先安装 yum-utils
sudo yum install -y yum-utils
# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
# 安装 Docker （可能报错：获取 GPG 密钥失败）
sudo yum install docker-ce docker-ce-cli containerd.io -y
# 启动 Docker
sudo systemctl start docker
# 运行 Hello World 容器，如果看到欢迎消息，说明 Docker 已经正确安装并可以使用。
sudo docker run hello-world
# 设置 Docker 开机启动
sudo systemctl enable docker
```



### 解决获取 GPG 密钥失败

```sh
# 先切 root
su - root
# 删掉旧的官方 repo
rm -f /etc/yum.repos.d/docker-ce.repo
# 直接写一个阿里云 docker-ce 源（带国内 gpg 地址）
cat > /etc/yum.repos.d/docker-ce.repo <<'EOF'
[docker-ce-stable]
name=Docker CE Stable - $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/$basearch/stable
enabled=1
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg
EOF
# 清理缓存、重建
yum clean all
yum makecache
# 再次执行安装命令
yum install docker-ce docker-ce-cli containerd.io -y
```



### 切换国内镜像源

```sh
# 运行第一个docker容器时，可能会报错
docker run hello-world
# 报错：
Unable to find image 'hello-world:latest' locally
docker: Error response from daemon: Get "https://registry-1.docker.io/v2/": read tcp 192.168.40.128:49142->3.216.35.38:443: read: connection reset by peer.
See 'docker run --help'.
# 解决，先切 root
su - root
# 编辑（没有会自动新建）
vi /etc/docker/daemon.json
# 把下面内容完整复制进去，保存退出：按 ESC → 输入 :wq → 回车。
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://docker.registry.cyou",
    "https://docker-cf.registry.cyou",
    "https://dockercf.jsdelivr.fyi",
    "https://docker.jsdelivr.fyi",
    "https://dockertest.jsdelivr.fyi",
    "https://mirror.aliyuncs.com",
    "https://dockerproxy.com",
    "https://mirror.baidubce.com",
    "https://docker.m.daocloud.io",
    "https://docker.nju.edu.cn",
    "https://docker.mirrors.sjtug.sjtu.edu.cn",
    "https://docker.mirrors.ustc.edu.cn",
    "https://mirror.iscas.ac.cn",
    "https://docker.rainbond.cc"
  ]
}
# 重载配置 + 重启 Docker
systemctl daemon-reload
systemctl restart docker
# 验证是否生效，看到配置的镜像地址在 Registry Mirrors:
docker info
# 再跑 hello-world
docker run hello-world

```



## Dockerfile+AI

使用 ai 生成，方便快捷。

vue 项目提示词：

```markdown
请为我的 Vue3 + Vite 前端项目生成一个生产环境可用的 Dockerfile。
要求：
1. 使用多阶段构建：node 环境构建，nginx 运行
2. 基础镜像使用 node:22-alpine（构建） + nginx:alpine（运行）
3. 工作目录 /app
4. 先复制 package.json 和 package-lock.json 再 install，利用缓存
5. 执行 npm install && npm run build
6. 构建产物 dist 目录拷贝到 nginx 的 /usr/share/nginx/html
7. 暴露 80 端口
8. 镜像最小化、安全、无冗余
9. 可以直接用于生产环境
10. 给我完整可直接使用的 Dockerfile，不要解释，只要代码
```

java springboot 项目提示词：

```markdown
请为我的 JDK 21 + SpringBoot 3.x 后端项目生成一个生产级 Dockerfile。
要求：
1. 使用多阶段构建：Maven 构建 + JRE 运行
2. 构建镜像：maven:eclipse-temurin-21-alpine
3. 运行镜像：eclipse-temurin:21-jre-alpine（最精简）
4. 工作目录 /app
5. 先复制 pom.xml 进行依赖下载，利用 docker 缓存
6. 再复制源码，执行 mvn clean package -DskipTests
7. 拷贝 target/*.jar 到运行阶段
8. 暴露端口 8080
9. 使用 java -jar 启动
10. 镜像最小化、生产可用、无冗余
11. 给我完整可直接使用的 Dockerfile，只要代码，不要解释
```

如果是前后端一体：

```markdown
请为我的前后端分离项目生成完整的 Docker 部署文件，包括：
1. 前端 Vue3 + Vite 项目的 Dockerfile（多阶段、nginx、node22、alpine）
2. 后端 JDK21 + SpringBoot3 项目的 Dockerfile（多阶段、maven、jre21、alpine）
3. docker-compose.yml，包含 frontend 和 backend 两个服务
4. 所有镜像都使用 alpine 精简版
5. 前端端口 80
6. 后端端口 8080
7. 生产环境可用，最小化镜像，安全规范
8. 不要解释，直接给我完整文件代码
```



## docker 多节点部署+nginx负载均衡

### 主流实现架构

```sh
浏览器 → Nginx（负载均衡 轮询）→ 节点1 + 节点2
```

节点 1：`quick-create-so-1`（你的 node 项目）

节点 2：`quick-create-so-2`

Nginx：自动把请求**轮流分发**到两个节点（默认就是轮询）



### 具体步骤

```sh
# 先停掉旧容器（避免冲突）
docker rm -f quick-create-so quick-create-so-1 quick-create-so-2 nginx-lb
# 启动 2 个项目节点（一模一样，只是名字不同）
# 节点 1
docker run -d \
  --name quick-create-so-1 \
  quick-create-so:latest
# 节点 2
docker run -d \
  --name quick-create-so-2 \
  quick-create-so:latest

# 创建 Nginx 负载均衡配置（关键）
mkdir -p /home/nginx/conf.d
# 创建配置文件
cat > /home/nginx/conf.d/default.conf <<EOF
upstream backend {
    server quick-create-so-1:8888;
    server quick-create-so-2:8888;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
    }
}
EOF
# 启动 nginx 负载均衡
docker run -d \
  -p 80:80 \
  --name nginx-lb \
  -v /home/nginx/conf.d:/etc/nginx/conf.d \
  --link quick-create-so-1 \
  --link quick-create-so-2 \
  nginx
```

> 最后那个 `nginx` 是 **Docker 镜像名**：
>
> - Docker 会自动去 Docker Hub 拉取官方 Nginx 镜像（如果本地没有）；
> - 这个镜像里**已经打包好了 Nginx 程序和运行环境**；
> - 启动容器 = 启动一个**独立、隔离的 Nginx 实例**，和宿主机有没有装 Nginx **完全没关系**。
>
> 一句话：**宿主机只需要有 Docker，不需要有 Nginx。**

测试负载均衡: 不用加端口 8888

http://192.168.40.128

刷新几次 → 你会看到请求轮流打到节点 1、节点 2、节点 1、节点 2……

这就是 默认`轮询`**负载均衡**。



## docker 多节点部署+nacos负载均衡

### 主流实现架构

```sh
浏览器 → 网关 / 负载均衡组件
          ↓ (自动从 Nacos 拿服务列表)
Nacos（服务注册中心）
          ↓ ↓
服务1    服务2   服务3...（自动注册、自动发现）
```

优势：

- 不用手动改 Nginx 配置
- 启动新服务自动注册到 Nacos
- 负载均衡自动轮询（默认就是）
- 服务挂了自动剔除

默认行为：

1. 服务启动 → **自动注册到 Nacos**
2. 网关 / OpenFeign → **自动从 Nacos 拉取服务列表**
3. **默认负载均衡策略 = 轮询**
4. 扩缩节点 **完全自动**

### 具体步骤

你唯一要做的：**启动多个相同服务实例即可**

```sh
docker run -d --name node1 你的服务
docker run -d --name node2 你的服务
```

它们会自动变成一个集群。

这才是公司微服务真正的负载均衡流程：

1. 两个节点都**注册到 Nacos**
2. 调用方（前端 / 网关 / 其他微服务）**去 Nacos 拿地址列表**
3. 本地**自动轮询**调用
4. 增加节点 → Nacos 自动发现
5. 节点挂了 → Nacos 自动剔除

**全程不需要改任何配置文件！**



> **不加 Nacos**：用 Nginx 手动配置节点列表
>
> **加了 Nacos**：**自动服务发现 + 自动负载均衡（轮询）**
>
> **不用改配置，不用维护 IP，不用重启负载均衡**
>
> **这就是生产环境标准玩法**



## 附：脚本1

docker 构建并运行：

```sh
read name && echo "你的项目名是: $name" && echo "构建镜像: $name" && docker build -t "$name:latest" . && echo "启动容器: $name" && docker rm -f "$name" && docker run -d -p 8888:8888 --name "$name" "$name:latest" && echo "运行成功！访问: http://192.168.xx.xxx:8888"
```

> 该脚本是直接删除容器和镜像，然后构建镜像运行到容器，使用的都是 latest 版本，如果使用标准版本号 x.y.z 会更贴近于生产环境。

docker 进入容器bash：

```sh
docker exec -it [container] /bin/sh
```

docker 重启docker服务：

```sh
systemctl daemon-reload && systemctl restart docker
```

docker 强制删除使用镜像的容器：

```sh
docker rm -f $(docker ps -a -q --filter ancestor=容器名:latest)
docker rmi -f 镜像名
```



## 附：脚本2

以 quick-create-so 这个 node 小项目为例：

```sh
# ==============================
# 一键搭建：Nacos + 2个服务节点 + 自动负载均衡
# 效果：访问 80 端口 → 自动轮询 2 个服务
# ==============================

# 1. 清理旧环境
docker rm -f quick-create-so-1 quick-create-so-2 nacos nginx-lb

# 2. 启动 Nacos（注册中心）
echo "正在启动 Nacos..."
docker run -d \
  --name nacos \
  -p 8848:8848 \
  -e MODE=standalone \
  nacos/nacos-server:v2.2.3

# 3. 启动 2 个服务节点（自动注册到 Nacos）
echo "正在启动服务节点 1..."
docker run -d \
  --name quick-create-so-1 \
  -e NACOS_SERVER=192.168.40.128:8848 \
  quick-create-so:latest

echo "正在启动服务节点 2..."
docker run -d \
  --name quick-create-so-2 \
  -e NACOS_SERVER=192.168.40.128:8848 \
  quick-create-so:latest

# 4. 启动 Nginx 负载均衡（自动从 Nacos 发现服务）
echo "正在启动 Nginx 负载均衡..."
mkdir -p /home/nginx/conf.d
cat > /home/nginx/conf.d/default.conf <<EOF
upstream service {
    server quick-create-so-1:8888;
    server quick-create-so-2:8888;
}
server {
    listen 80;
    location / {
        proxy_pass http://service;
        proxy_set_header Host \$host;
    }
}
EOF

docker run -d \
  --name nginx-lb \
  -p 80:80 \
  -v /home/nginx/conf.d:/etc/nginx/conf.d \
  --link quick-create-so-1 \
  --link quick-create-so-2 \
  nginx

echo -e "\n✅ 部署完成！"
echo -e "🌐 访问地址（自动轮询）：http://192.168.40.128"
echo -e "🔧 Nacos 控制台：http://192.168.40.128:8848/nacos"
echo -e "默认账号：nacos / 密码：nacos"
```



## 扩展

如果节点更多，那就需要引入 `k8s` 这种重量级的中间件来进行管理服务节点。
