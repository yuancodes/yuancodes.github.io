---
order: 3
title: IP与子网掩码与网关
date: 2016-4-28 21:41:52
tags:
- 计算机
- 网络
- IP
- 子网掩码
- 网关
categories: 
- 01_操作系统
- 03_计算机网络
---



涉及场景：

- 新机器交付后发现网络不通，不知道怎么查
- 搭建 Kubernetes 集群时 Pod 之间网络不通
- 配置负载均衡器或 VPN 时搞不清网段该怎么写
- 阿里云、AWS、腾讯云上配置 VPC 安全组和路由表
- 排查 Docker 容器网络、Calico/Flannel/Weave 网络问题
- 写 iptables/nftables 防火墙规则
- 遇到 ARP、ICMP、TCP/UDP 端口问题不知道从哪儿下手

## **IP 地址基础**

### **二进制和十进制的转换**

IP 地址是一个 32 位的二进制数，通常写成 4 个十进制字节，用点分隔。IPv4 地址范围从 `0.0.0.0` 到 `255.255.255.255`，共约 42 亿个地址。

```sh
十进制转二进制（按字节）
192 = 11000000
168 = 10101000
1   = 00000001
1   = 00000001

192.168.1.1 的二进制：
11000000.10101000.00000001.00000001
```

快速转换技巧：记住 2 的幂次方。

```sh
2^7 = 128  2^6 = 64  2^5 = 32  2^4 = 16
2^3 = 8   2^2 = 4   2^1 = 2   2^0 = 1

192 = 128 + 64 = 11000000
168 = 128 + 32 + 8 = 10101000
255 = 128+64+32+16+8+4+2+1 = 11111111
```

验证转换结果：把二进制各位对应的值加起来，看是否等于十进制。

```sh
# Linux 查看本机 IP 地址
ip addr show
# 或
ifconfig

# 查看指定接口的 IP
ip addr show eth0

# 查看所有网络接口（包括未激活的）
ip link show
```

### **IP 地址的分类（历史知识，现在已不强制）**

早期 IPv4 将 IP 分为五类：

| 类别 | 范围                        | 用途      | 网络/主机位数 |
| :--- | :-------------------------- | :-------- | :------------ |
| A 类 | 0.0.0.0 - 127.255.255.255   | 大型网络  | 8/24          |
| B 类 | 128.0.0.0 - 191.255.255.255 | 中型网络  | 16/16         |
| C 类 | 192.0.0.0 - 223.255.255.255 | 小型网络  | 24/8          |
| D 类 | 224.0.0.0 - 239.255.255.255 | 多播/组播 | 不适用        |
| E 类 | 240.0.0.0 - 255.255.255.255 | 保留      | 不适用        |

运维中实际接触最多的是 C 类（`192.168.x.x`）和私有地址段：

```sh
私有 IP 地址范围（RFC 1918，可在内网自由使用）：
10.0.0.0 - 10.255.255.255      （10/8 整段）
172.16.0.0 - 172.31.255.255    （172.16/12 段，16 个 B 类）
192.168.0.0 - 192.168.255.255  （192.168/16 段，256 个 C 类）
```

云服务器、容器网络、虚拟机默认都用私有地址。公有云的安全组就是控制这些私有 IP 的访问权限。

### **特殊 IP 地址**

```sh
# 本机回环地址，进程间通信用，不走物理网卡
127.0.0.1           # localhost
::1                  # IPv6 回环

# 网段广播地址（已很少用，了解即可）
# 192.168.1.255 是 192.168.1.0/24 网段的广播地址

# 网络地址
# 192.168.1.0 是 192.168.1.0/24 网段的网络地址，代表整个网段

# 链路本地地址（Windows 自动配置/IPv6 SLAAC）
169.254.0.0/16       # Windows 获取不到 DHCP 时自动分配的地址
fe80::/10            # IPv6 链路本地地址

# 全零地址
0.0.0.0/0            # 代表"任意地址"，路由表里常见
```

### **查看本机 IP 和网络信息**

```sh
# 查看所有 IP 配置（推荐）
ip addr show
ip addr show eth0

# 查看路由表
ip route show
ip route

# 查看 ARP 表（IP 和 MAC 地址映射）
ip neigh show
arp -a

# 查看端口监听情况
ss -tlnp
netstat -tlnp

# 查看当前网络连接
ss -tnp
netstat -tnp

# 查看网络接口统计
ip -s link show eth0
```

## **子网掩码与 CIDR**

### **什么是子网掩码**

子网掩码用来区分 IP 地址中哪些是网络部分，哪些是主机部分。32 位子网掩码中，1 对应网络位，0 对应主机位。

```sh
子网掩码示例：255.255.255.0
二进制：11111111.11111111.11111111.00000000

IP 地址 192.168.1.100 和子网掩码 255.255.255.0：
192.168.1  = 网络部分（前三字节）
100        = 主机部分（最后一字节）

网络地址 = IP & 子网掩码 = 192.168.1.100 & 255.255.255.0 = 192.168.1.0
广播地址 = 网络地址 | (~子网掩码) = 192.168.1.0 | 0.0.0.255 = 192.168.1.255
```

子网掩码两种写法：

- **点分十进制**：`255.255.255.0`
- **CIDR 表示法**：`/24`（表示前 24 位是网络位）

常用 CIDR 掩码速算：

```sh
/32  = 255.255.255.255  主机数：1
/31  = 255.255.255.254  主机数：2（点对点链路）
/30  = 255.255.255.252  主机数：4
/29  = 255.255.255.248  主机数：8
/28  = 255.255.255.240  主机数：16
/27  = 255.255.255.224  主机数：32
/26  = 255.255.255.192  主机数：64
/25  = 255.255.255.128  主机数：128
/24  = 255.255.255.0    主机数：256（常用，256 - 2 = 254 可用）
/23  = 255.255.254.0    主机数：512
/22  = 255.255.252.0    主机数：1024
/21  = 255.255.248.0    主机数：2048
/20  = 255.255.240.0    主机数：4096
/16  = 255.255.0.0      主机数：65536
/8   = 255.0.0.0        主机数：16777216
```

计算可用主机数：2^(32-CIDR) - 2（减去网络地址和广播地址）

### **CIDR 块的大小选择**

选择太小的 CIDR 块会浪费 IP，选择太大的不方便管理。实际运维中的选择：

```sh
/30 或 /31：点对点链路，如两台服务器直连、路由器互联接口
/29：小型业务，如少数几台机器的服务集群
/28：中型业务，如一个部门的小型服务器集群
/27：中等规模，如一个业务线的基础设施
/26：较大规模，如一个业务线的完整基础设施
/25 或 /24：大规模，如整个 Kubernetes 集群、整个 VPC 子网
/16 或 /8：超大规模，如整个数据中心的网段划分
```

### **子网划分实战**

假设你有一个 `192.168.0.0/24` 网段，需要划分给 4 个部门，每个部门约 50 台机器。

```sh
原始网段：192.168.0.0/24
二进制掩码：11111111.11111111.11111111.00000000
可用 IP：192.168.0.1 - 192.168.0.254（254 台）

划分方案（每个子网需要 /26，即 64 个地址）：

部门 A：192.168.0.0/26
  网络地址：192.168.0.0
  可用范围：192.168.0.1 - 192.168.0.62
  广播地址：192.168.0.63

部门 B：192.168.0.64/26
  网络地址：192.168.0.64
  可用范围：192.168.0.65 - 192.168.0.126
  广播地址：192.168.0.127

部门 C：192.168.0.128/26
  网络地址：192.168.0.128
  可用范围：192.168.0.129 - 192.168.0.190
  广播地址：192.168.0.191

部门 D：192.168.0.192/26
  网络地址：192.168.0.192
  可用范围：192.168.0.193 - 192.168.0.254
  广播地址：192.168.0.255
```

在 Linux 上验证子网划分：

```sh
# 安装 ipcalc 工具
apt install ipcalc   # Debian/Ubuntu
yum install ipcalc   # CentOS/RHEL

# 计算网段信息
ipcalc 192.168.0.0/26
ipcalc 192.168.0.64/26
ipcalc 192.168.0.128/26
ipcalc 192.168.0.192/26

# 输出示例
ipcalc 192.168.0.0/26
Address:   192.168.0.0
Netmask:   255.255.255.192
Wildcard:  0.0.0.63
Network:   192.168.0.0/26
HostMin:   192.168.0.1
HostMax:   192.168.0.62
Broadcast: 192.168.0.63
Hosts/Net: 62

# 批量计算
ipcalc 192.168.0.0/24 -s 64 64 64 64  # 划分成 4 个 64 地址的子网
```

### **判断两个 IP 是否在同一个网段**

运维中常需要判断两台机器是否可以直接通信（不需要网关）。

```sh
# 方法：两个 IP 分别和子网掩码做 AND 运算，结果相同则在同网段

# Python 脚本判断
python3 << 'EOF'
def ip_in_subnet(ip, subnet):
    ip_parts = [int(x) for x in ip.split('.')]
    subnet_cidr = int(subnet.split('/')[1])
    subnet_mask = (0xFFFFFFFF >> (32 - subnet_cidr)) << (32 - subnet_cidr)
    
    net_parts = [0,0,0,0]
    for i in range(4):
        net_parts[i] = (subnet_mask >> (8 * (3-i))) & 0xFF
    
    ip_int = (ip_parts[0]<<24) + (ip_parts[1]<<16) + (ip_parts[2]<<8) + ip_parts[3]
    subnet_int = (net_parts[0]<<24) + (net_parts[1]<<16) + (net_parts[2]<<8) + net_parts[3]
    
    return (ip_int & subnet_mask) == (subnet_int & subnet_mask)

print(ip_in_subnet("192.168.1.100", "192.168.1.0/24"))  # True
print(ip_in_subnet("192.168.2.100", "192.168.1.0/24"))  # False
EOF
```

## **默认网关**

### **网关的作用**

同一网段的设备可以直接通信，跨网段通信需要通过网关转发。网关是一个网段通往其他网段的"大门"，通常是路由器或三层交换机的接口 IP。

```sh
场景：192.168.1.10 想访问 192.168.2.20

1. 192.168.1.10 发现 192.168.2.20 不在本地网段（192.168.1.0/24）
2. 192.168.1.10 把数据包发给默认网关（通常是 .1，如 192.168.1.1）
3. 网关路由器查看自己的路由表，决定把包转发到哪里
4. 最终数据包到达 192.168.2.20
```

### **查看和配置网关**

```sh
# 查看当前路由表（包含默认网关）
ip route show
# 输出示例：
# default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.100 metric 600
# 192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100

# 查看更详细的路由信息
route -n
# Kernel IP routing table
# Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
# 0.0.0.0         192.168.1.1     0.0.0.0         UG    600    0        0 eth0
# 192.168.1.0     0.0.0.0         255.255.255.0   U     600    0        0 eth0

# 添加默认网关（临时，重启失效）
ip route add default via 192.168.1.1 dev eth0

# 删除默认网关
ip route del default via 192.168.1.1

# 查看网关对应的 MAC 地址（ARP 解析）
arp 192.168.1.1
```

### **云服务器网关配置**

阿里云、AWS、腾讯云的 VPC 网络中，子网的网关由云平台统一管理，通常是网段的第一个 IP（如 `192.168.1.1`）。

```sh
阿里云 VPC 网段常用：
VPC: 192.168.0.0/16
交换机（子网）：192.168.1.0/24
交换机网关：192.168.1.1（自动分配）

云服务器网卡配置的网关必须是 192.168.1.1
云服务器安全组控制的是入方向和出方向规则
```

## **VLAN 虚拟局域网**

### **VLAN 的作用**

一个物理交换机上可以划分多个 VLAN，实现广播域隔离。不同 VLAN 的设备即使连在同一台交换机上，也无法直接通信，需要通过三层路由转发。

```sh
场景：服务器有三个网络用途
- 管理网络：192.168.1.0/24（VLAN 100）
- 业务网络：192.168.2.0/24（VLAN 200）
- 存储网络：192.168.3.0/24（VLAN 300）

配置后：
- 同一 VLAN 内的服务器可以互相通信
- 不同 VLAN 的服务器需要通过路由/网关才能通信
- 广播包不会穿越 VLAN 边界
```

### **Linux 配置 VLAN**

```sh
# 加载 8021q 内核模块
modprobe 8021q

# 创建 VLAN 接口
ip link add link eth0 name eth0.100 type vlan id 100

# 配置 IP
ip addr add 192.168.1.10/24 dev eth0.100

# 激活接口
ip link set eth0.100 up

# 查看 VLAN 配置
ip link show type vlan
cat /proc/net/vlan/config

# 删除 VLAN 接口
ip link del eth0.100
```

### **交换机的 VLAN 端口模式**

实际运维中，交换机配置比 Linux 命令更重要。常见端口模式：

```sh
Access 口：连接终端设备（服务器、PC）
- 属于单个 VLAN
- 收到的帧不带 VLAN tag
- 发出的帧不带 VLAN tag
- 配置示例：switchport mode access; switchport access vlan 100

Trunk 口：连接其他交换机或路由器
- 允许通过多个 VLAN
- 收到的帧带 VLAN tag
- 发出的帧带 VLAN tag
- 配置示例：switchport mode trunk; switchport trunk allowed vlan 100,200,300

Hybrid 口：华为设备特有，兼具两者特点
- 可以灵活配置哪些 VLAN 打 tag，哪些不打
```

## **路由基础**

### **路由表的工作原理**

每台 IP 网络设备（主机、路由器、三层交换机）都有路由表。发包时，设备根据路由表决定把包发到哪里。

```sh
# 查看 Linux 路由表
ip route show
route -n

# 典型路由表解读
# 192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100
#    ^网段        ^接口  ^学习方式   ^链路本地   ^本机IP
#    目标网络，通过 eth0 直连，不需要网关

# 10.0.0.0/8 via 192.168.1.1 dev eth0
#    ^目标网络    ^下一跳网关   ^出接口
#    目标 10.x.x.x 的包发给 192.168.1.1 转发

# default via 192.168.1.1 dev eth0
#    ^默认路由，匹配所有其他目标
```

路由匹配规则（最长前缀匹配）：

```sh
假设目标 IP 是 10.20.30.40，路由表有：
1. 0.0.0.0/0        （默认路由，匹配 0 位）
2. 10.0.0.0/8       （匹配 8 位）
3. 10.20.0.0/16     （匹配 16 位）
4. 10.20.30.0/24    （匹配 24 位）

最长匹配原则：选择第 4 条，匹配 24 位
```

### **添加和删除路由**

```sh
# 添加静态路由（临时，重启失效）
# 添加到 10.10.0.0/16 的路由，经过 192.168.1.1
ip route add 10.10.0.0/16 via 192.168.1.1 dev eth0

# 添加到特定主机的路由
ip route add 10.10.10.20/32 via 192.168.1.1 dev eth0

# 添加黑名单路由（流量丢弃）
ip route add blackhole 10.10.10.0/24

# 删除路由
ip route del 10.10.0.0/16 via 192.168.1.1 dev eth0

# 永久保存路由（CentOS 7/8）
# 在 /etc/sysconfig/network-scripts/route-eth0 中添加：
10.10.0.0/16 via 192.168.1.1 dev eth0

# 永久保存路由（Debian/Ubuntu）
# 在 /etc/network/interfaces 中添加：
up ip route add 10.10.0.0/16 via 192.168.1.1 dev eth0
```

### **策略路由（高级）**

Linux 支持基于源地址、fwmark、UID 等条件的策略路由。

```sh
# 查看策略路由规则
ip rule show

# 默认规则优先级
# 0:      from all lookup local
# 32766:  from all lookup main
# 32767:  from all lookup default

# 添加基于源地址的策略路由
# 来自 192.168.1.0/24 的流量走 eth0
ip rule add from 192.168.1.0/24 table 100
ip route add default via 192.168.1.1 dev eth0 table 100

# 添加基于 fwmark 的策略路由（常用于流量整形）
iptables -A PREROUTING -s 10.0.0.0/8 -j MARK --set-mark 1
ip rule add fwmark 1 table 200
ip route add default via 10.0.0.1 dev eth1 table 200
```

## **DNS 基础**

### **DNS 的作用**

域名系统负责把人类可读的域名转换成 IP 地址。运维中遇到"机器能 ping 通 IP，但 ping 不通域名"的问题，基本就是 DNS 故障。

```sh
# 查看当前 DNS 服务器配置
cat /etc/resolv.conf

# 测试 DNS 解析
nslookup www.baidu.com
dig www.baidu.com
host www.baidu.com

# 验证 DNS 缓存（systemd-resolved）
resolvectl status
resolvectl query www.baidu.com

# 清理 DNS 缓存
# systemd-resolved
systemctl restart systemd-resolved

# nscd
systemctl restart nscd

# 手动指定 DNS 查询
nslookup www.baidu.com 8.8.8.8   # 用 Google DNS 查询
dig @8.8.8.8 www.baidu.com
```

### **/etc/hosts 本地解析**

在 DNS 不可用或需要自定义解析时，使用 `/etc/hosts`。

```sh
# /etc/hosts 格式：IP 域名 别名
127.0.0.1   localhost localhost.localdomain
192.168.1.100   db-master.internal db-master
192.168.1.101   db-slave.internal db-slave
10.244.1.5       redis-01.default.svc.cluster.local redis-01

# 优先级：/etc/hosts > DNS（可通过 /etc/nsswitch.conf 修改）
```

## **网络故障排查流程**

### **排查思路**

网络故障排查遵循分层排除法，从底层到高层：

```sh
第1层：物理层 - 网线、光纤、网卡灯是否亮
第2层：数据链路层 - MAC 地址、ARP、交换机端口
第3层：网络层 - IP 地址、子网掩码、路由表、网关
第4层：传输层 - TCP/UDP 端口、防火墙状态
第5层：应用层 - HTTP 响应、DNS 解析、证书
```

### **常用排查命令**

```sh
# 1. 检查 IP 配置是否正确
ip addr show eth0
# 确认：IP 地址是否正确、子网掩码是否正确、网卡是否 UP

# 2. 检查网关是否可达
ping -c 3 192.168.1.1
# 确认：网关是否响应、是否有丢包

# 3. 检查目标是否可达（ICMP）
ping -c 3 8.8.8.8
ping -c 3 192.168.2.100
# 确认：能否 ping 通外网、能否 ping 通同网段其他机器

# 4. 检查端口是否开放（TCP）
nc -zv 192.168.1.100 22
nc -zv 10.0.0.50 3306
telnet 192.168.1.100 80

# 5. 检查路由是否正确
ip route show
traceroute -m 10 8.8.8.8    # 跟踪路由（需要 traceroute 包）
tracepath 8.8.8.8            # 轻量版 traceroute

# 6. 检查 DNS 解析
nslookup www.baidu.com
dig +short www.baidu.com

# 7. 检查防火墙规则
iptables -L -n -v
iptables -L INPUT -n -v
iptables -L OUTPUT -n -v

# 8. 检查监听端口
ss -tlnp
netstat -tlnp
# 确认服务是否在监听、绑定的 IP 是否正确

# 9. 检查连接状态
ss -tnp
netstat -tnp
# 查看当前 TCP 连接、连接状态分布

# 10. 检查 ARP 表
ip neigh show
arp -a
# 确认是否能解析到 MAC 地址
```

### **常见故障案例**

#### **案例 1：服务器获取到 169.254.x.x 地址**

```sh
# 现象：机器 IP 是 169.254.x.x，无法上网

# 原因：DHCP 获取失败，Windows 自动分配了链路本地地址

# 排查步骤：
# 1. 检查网线是否插好
ip link show eth0

# 2. 检查 DHCP 配置
cat /etc/network/interfaces
# 或
cat /etc/sysconfig/network-scripts/ifcfg-eth0

# 3. 手动触发 DHCP 请求
dhclient -r eth0   # 释放
dhclient eth0      # 重新获取

# 4. 如果网络是静态配置，手动设置正确 IP
ip addr add 192.168.1.100/24 dev eth0
ip route add default via 192.168.1.1
```

#### **案例 2：同网段机器 ping 不通**

```sh
# 现象：机器 A（192.168.1.10）和机器 B（192.168.1.20）ping 不通

# 排查步骤：
# 1. 确认 IP 配置
# 在 A 上：
ip addr show eth0
# 应该在 A 上看到 192.168.1.10

# 在 B 上：
ip addr show eth0
# 应该在 B 上看到 192.168.1.20

# 2. 检查是否在同一网段
# 192.168.1.10/24 和 192.168.1.20/24 同一网段，可以直接通信
# 如果 A 的掩码是 /16 而 B 是 /24，可能不在同一网段

# 3. 检查 ARP
# 在 A 上：
ping -c 1 192.168.1.20
arp -a | grep 192.168.1.20

# 4. 检查防火墙
iptables -L INPUT -n
# 可能有 DROP icmp 或 DROP all 规则

# 5. 检查 eth0 是否 UP
ip link show eth0

# 解决方案：
# - 修正 IP/掩码配置
# - 清理防火墙规则或添加 ICMP 放行
```

#### **案例 3：跨网段机器 ping 不通**

```sh
# 现象：192.168.1.10 ping 192.168.2.20 不通

# 排查步骤：
# 1. 确认网关配置
# 在 192.168.1.10 上：
ip route show
# 应该有：default via 192.168.1.1 dev eth0

# 2. 确认网关本身是否可达
ping -c 1 192.168.1.1

# 3. 检查网关路由
# 在网关路由器上检查是否有到 192.168.2.0/24 的路由

# 4. 双向检查
# 不仅要检查源到目标的路由，还要检查目标到源的回程路由

# 常见原因：
# - 默认网关配置错误或缺失
# - 目标网段路由表中没有回程路由
# - 中间路由器 ACL 拦截了 ICMP
```

#### **案例 4：DNS 解析正常但无法访问**

```sh
# 现象：nslookup 能解析出 IP，但 ping 不通域名

# 排查步骤：
# 1. 确认是 TCP 还是 UDP 问题
nc -zv www.baidu.com 443
nc -zuv 8.8.8.8 53

# 2. 检查路由
ip route show
traceroute -m 5 www.baidu.com

# 3. 检查防火墙出方向
iptables -L OUTPUT -n -v

# 4. 检查 MTU
ip link show eth0
ping -c 3 -M do -s 1400 8.8.8.8
# 如果大包丢包小包不丢，可能是 MTU 问题（常见于 VPN）

# 5. 检查代理
echo$http_proxy
echo$https_proxy
env | grep -i proxy
```

### **网络排查流程图**

```sh
开始：网络不通
  |
  v
ping 127.0.0.1 成功？
  |-- 否 --> 本机 TCP/IP 协议栈问题，检查内核参数
  |           ip link set eth0 up
  |
  v
ping 本机 IP 成功？
  |-- 否 --> 网卡 down 或 IP 配置错误
  |           ip link set eth0 up
  |           ip addr add x.x.x.x/xx dev eth0
  |
  v
ping 网关 IP 成功？
  |-- 否 --> 本网段 ARP 问题或网关本身问题
  |           检查网线、交换机端口
  |           检查网关是否通电
  |
  v
ping 目标 IP 成功？
  |-- 否 --> 中间网络问题
  |           traceroute 追查在哪一跳丢包
  |           检查沿途路由器路由表
  |
  v
ping 域名 成功？
  |-- 否 --> DNS 问题
  |           检查 /etc/resolv.conf
  |           检查 DNS 服务器
  |
  v
telnet/curl 目标端口 成功？
  |-- 否 --> 防火墙或服务问题
  |           检查 iptables/nftables
  |           检查目标服务是否监听
  |
  v
解决
```

## **Docker/Kubernetes 网络基础**

### **Docker 网络模式**

```sh
# 查看 Docker 网络
docker network ls

# 常见网络模式：
# bridge：默认模式，容器在桥接网络，IP 通常 172.17.0.0/16
# host：容器网络直接用宿主机网络栈
# overlay：跨 Docker 守护进程通信（Swarm 模式）
# macvlan：容器直接获得 MAC 地址，像物理机一样

# 查看容器网络信息
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name

# 查看容器内网络命名空间
docker exec -it container_name ip addr
docker exec -it container_name cat /etc/resolv.conf

# 测试容器间通信
docker exec -it container_a ping -c 1 container_b

# 容器 DNS 配置
# Docker daemon 配置 /etc/docker/daemon.json
{
"dns": ["8.8.8.8", "114.114.114.114"]
}
```

### **Kubernetes 网络模型**

Kubernetes 网络模型要求：

- 所有 Pod 可以直接通过 IP 互访，无需 NAT
- 节点可以与所有 Pod 互访，无需 NAT
- Pod 看到的 IP 和其他 Pod 看到的相同

常见 CNI 插件对比：

| CNI     | 网段示例      | 特点                  |
| :------ | :------------ | :-------------------- |
| Flannel | 10.244.0.0/16 | 简单，VXLAN 封装      |
| Calico  | 10.244.0.0/16 | 支持 BGP，性能好      |
| Cilium  | 10.244.0.0/16 | eBPF 加速，可观测性强 |
| Weave   | 10.32.0.0/16  | 简单，加密传输        |

```sh
# 查看 Kubernetes 节点 IP 和 Pod CIDR
kubectl get nodes -o wide

# 查看 Pod IP（需要指定 -o wide）
kubectl get pods -o wide --all-namespaces

# 查看 Service ClusterIP
kubectl get svc -o wide

# 查看 CNI 配置（Calico 示例）
kubectl get nodes -o jsonpath='{.items[*].spec.podCIDR}'
kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'

# 排查 Pod 网络问题
kubectl exec -it pod_name -- ip addr
kubectl exec -it pod_name -- cat /etc/resolv.conf
kubectl exec -it pod_name -- ping -c 1 8.8.8.8

# 查看 Pod 事件
kubectl describe pod pod_name

# 查看 CNI 日志
kubectl logs -n kube-system -l k8s-app=calico-node
journalctl -u kubelet | grep -i cni
```

## **防火墙基础**

### **iptables 基础**

Linux 防火墙按链（chain）和表（table）组织。

```sh
# 查看所有规则
iptables -L -n -v
iptables -L INPUT -n -v

# 四表（按优先级）：
# raw：连接跟踪的预处理
# mangle：修改数据包内容
# nat：地址转换
# filter：过滤（默认表）

# 五链：
# PREROUTING：路由前
# INPUT：进入本机
# FORWARD：转发
# OUTPUT：出本机
# POSTROUTING：路由后

# 常见场景：
# 允许 SSH 接入
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许 HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 允许已建立的连接
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 丢弃所有其他入站
iptables -A INPUT -j DROP

# 保存规则（CentOS）
service iptables save

# 保存规则（Debian/Ubuntu）
iptables-save > /etc/iptables/rules.v4

# 从文件恢复规则
iptables-restore < /etc/iptables/rules.v4
```

### **nftables 新一代防火墙**

CentOS 8+ 推荐使用 nftables，语法更简洁。

```sh
# 查看规则
nft list ruleset

# 添加表
nft add table ip filter

# 添加链
nft add chain ip filter input { type filter hook input priority 0 \; }

# 添加规则
nft add rule ip filter input tcp dport 22 accept

# 允许已建立的连接
nft add rule ip filter input ct state established,related accept

# 拒绝其他入站
nft add rule ip filter input counter drop

# 保存配置
nft list ruleset > /etc/sysconfig/nftables.conf
```

## **生产环境网络安全建议**

### **最小权限原则**

```sh
# 1. 限制 SSH 访问来源
iptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/8 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j DROP

# 或者使用 tcpwrappers
echo"sshd: 10.0.0.0/8" >> /etc/hosts.allow
echo"sshd: ALL" >> /etc/hosts.deny

# 2. 禁止 ICMP 广播（防止放大攻击）
echo 1 > /proc/sys/net/ipv4/icmp_echo_ignore_broadcasts

# 3. 禁用源路由
echo 0 > /proc/sys/net/ipv4/conf/all/accept_source_route
echo 0 > /proc/sys/net/ipv4/conf/default/accept_source_route

# 4. 开启反向路径过滤（防止 IP 欺骗）
echo 1 > /proc/sys/net/ipv4/conf/all/rp_filter
echo 1 > /proc/sys/net/ipv4/conf/default/rp_filter

# 5. 禁止 ICMP 重定向
echo 0 > /proc/sys/net/ipv4/conf/all/accept_redirects
echo 0 > /proc/sys/net/ipv4/conf/default/accept_redirects
```

### **内网安全**

```sh
# 1. 不同业务网段隔离
# 使用 VLAN 或云平台安全组隔离

# 2. 数据库只允许应用服务器访问
iptables -A INPUT -p tcp --dport 3306 -s 10.0.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 3306 -j DROP

# 3. Redis 只允许内网访问，禁用危险命令
bind 10.0.1.0/24
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command SHUTDOWN ""

# 4. 定期检查异常连接
ss -tnp | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -rn | head -20
```

### **永久生效的网络优化参数**

```sh
# /etc/sysctl.conf 或 /etc/sysctl.d/99-custom.conf

# 网络基础参数
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# TCP 时间参数
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.tcp_keepalive_intvl = 15

# TCP 缓冲
net.ipv4.tcp_rmem = 4096 87380 6291456
net.ipv4.tcp_wmem = 4096 65536 6291456

# 启用窗口缩放（高带宽高延迟网络）
net.ipv4.tcp_window_scaling = 1

# 连接追踪表大小（高并发服务器需要调大）
net.netfilter.nf_conntrack_max = 1048576
net.netfilter.nf_conntrack_tcp_timeout_established = 432000

# 应用配置
sysctl -p
```

## **总结**

网络基础是运维的必修课，核心知识点：

**IP 地址和子网：**

- IP 是 32 位二进制数，4 字节点分十进制表示
- 子网掩码区分网络位和主机位，CIDR 是简化写法
- 私有地址段：`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`
- 两个 IP 是否同网段：分别和掩码做 AND，结果相同则同网段

**网关和路由：**

- 同网段直接通信，跨网段走网关
- 路由表按最长前缀匹配
- 默认网关用 `0.0.0.0/0` 表示

**故障排查顺序：**

- 先 ping 127.0.0.1 确认本机协议栈正常
- 再 ping 本机 IP 确认网卡正常
- 然后 ping 网关确认链路正常
- 最后 ping 目标逐段定位

**常用命令：**

- `ip addr`：查 IP 配置
- `ip route`：查路由表
- `ip neigh`：查 ARP 表
- `ping`：测试连通性
- `traceroute`：追踪路由
- `nslookup/dig`：测 DNS
- `ss/netstat`：查端口
- `iptables`：配防火墙

