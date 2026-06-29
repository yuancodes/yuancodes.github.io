---
order: 1
title: ClaudeCode学习和使用
date: 2026-01-22 23:35:05
index_img: https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260210171726358.png
tags:
  - ai
  - 大模型
  - Chat拆解
categories:
  - 22_AI
  - 04_ClaudeCode
---



参考资料：

* https://www.runoob.com/claude-code/claude-code-install.html

* https://blog.csdn.net/liulin_521/article/details/155862222
* https://zhuanlan.zhihu.com/p/2018862186013946674



## 1. 安装

```sh
# https://github.com/anthropics/claude-code
irm https://claude.ai/install.ps1 | iex
# or
winget install Anthropic.ClaudeCode
```

```sh
# 检查版本，确认安装成功
claude --version
```

```sh
# 手动更新到最新版
claude update
# 如果是 winget 安装的，则使用如下命令更新最新版
winget upgrade Anthropic.ClaudeCode
```

## 2. 启动

```sh
claude
```

> **报错**：
>
> `Unable to connect to Anthropic services`
>
> `Failed to connect to api.anthropic.com: ERR_BAD_REQUEST`
>
> **解决**：
>
> 国内第一次使用claude code的新手，都遇到过这样的报错。而成为了使用claude code的第一道门槛。
>
> 解决办法：找到配置文件，在 `C:\Users\用户名\.claude.json` 下面，打开加入一行（记得上一行的逗号不要落下）：
>
> ```json
> "hasCompletedOnboarding": true
> ```
>
> 重新打开 powershell 进行启动 `claude`，启动成功。

接下来就是进入到自己的**项目目录**下，使用 `claude` 启动 ClaudeCode。



## 3. API配置与模型切换

参考步骤：https://www.runoob.com/claude-code/claude-code-setup.html

`CC Switch`下载：https://github.com/farion1231/cc-switch/releases

* 安装教程：https://zhuanlan.zhihu.com/p/2010439384097367984

目前使用免安装版：https://github.com/farion1231/cc-switch/releases/download/v3.13.0/CC-Switch-v3.13.0-Windows-Portable.zip

--> 重启命令行终端，powershell。

**常用模型推荐**：

- longcat: https://longcat.chat/platform/usage
- 阿里云百炼



**切换模型**：

- 在提示框输入 `/model`
- 或启动时用 `claude --model sonnet`

* 确认模型配置无误：`/status`
* 静默执行所有命令（不询问）⚠️危险慎用！：`claude --dangerously-skip-permissions`

### 常见命令汇总

| 命令                | 说明                                                        | 示例                      |
| :------------------ | :---------------------------------------------------------- | :------------------------ |
| `/init`             | 在项目根目录生成 CLAUDE.md 文件，用于定义项目级指令和上下文 | `/init`                   |
| `/status`           | 查看当前模型、API Key、Base URL 等配置状态                  | `/status`                 |
| `/model <模型名称>` | 切换模型                                                    | `/model qwen3-coder-next` |
| `/clear`            | 清除对话历史，开始全新对话                                  | `/clear`                  |
| `/plan`             | 进入规划模式，仅分析和讨论方案，不修改代码                  | `/plan`                   |
| `/compact`          | 压缩对话历史，释放上下文窗口空间                            | `/compact`                |
| `/config`           | 打开配置菜单，可设置语言、主题等                            | `/config`                 |

### CLAUDE.md

`/init` 命令会生成这个文件，模版可以参考如下进行修改。

```markdown
# PROJECT: [你的项目名称]

## 项目概述
[用一段话精确描述你在构建什么，目标用户是谁]

## 技术栈
- Frontend: [React / Next.js / Vue / 纯 HTML]
- Backend: [Node / Python / 等]
- Database: [Supabase / PostgreSQL / MongoDB]
- Styling: [Tailwind / CSS / SCSS]
- Deployment: [Vercel / Railway / 等]

## 项目结构
[描述你的文件夹结构和各目录的职责]
src/
  components/ — 可复用 UI 组件
  pages/ — 路由级页面组件
  lib/ — 工具函数和辅助模块
  api/ — API 路由处理器

## 编码规范
- [你的语言偏好 — TypeScript 还是 JavaScript]
- [错误处理方式]
- [文件和函数的命名规范]
- [你始终坚持的任何模式]

## 当前正在构建
[当前正在开发的功能或任务]

## Claude Code 绝对不要做的事
- 永远不要修改 [受保护文件夹] 中的文件
- 永远不要读取或访问 .env 文件
- 永远不要在未获明确指令的情况下 push 到 git
- 永远不要在未与我确认的情况下删除文件

## 重要上下文
[Claude Code 需要了解的关于你项目的任何其他信息]
```



> 真正的重心还是：`模型质量`、`提示词工程`、`skills`、`个人认知综合能力`。



### CLAUDE.md 强制追加

来源于 ☆star 数达 `90k+` 的开源项目：https://github.com/forrestchang/andrej-karpathy-skills

~~~markdown
## 必须遵守的四个原则

这些指南倾向于谨慎而非速度。对于琐碎的任务（简单的拼写错误修复、显而易见的一行修改），请自行判断 —— 并非每个改动都需要完整的严谨流程。

目标是减少非琐碎工作中的代价高昂的错误，而不是拖慢简单任务。

### 1. 编码前思考

**不要假设。不要隐藏困惑。呈现权衡。**

LLM 经常默默选择一种解释然后执行。这个原则强制明确推理：

- **明确说明假设** — 如果不确定，询问而不是猜测
- **呈现多种解释** — 当存在歧义时，不要默默选择
- **适时提出异议** — 如果存在更简单的方法，说出来
- **困惑时停下来** — 指出不清楚的地方并要求澄清

### 2. 简洁优先

**用最少的代码解决问题。不要过度推测。**

对抗过度工程的倾向：

- 不要添加要求之外的功能
- 不要为一次性代码创建抽象
- 不要添加未要求的"灵活性"或"可配置性"
- 不要为不可能发生的场景做错误处理
- 如果 200 行代码可以写成 50 行，重写它

**检验标准：** 资深工程师会觉得这过于复杂吗？如果是，简化。

### 3. 精准修改

**只碰必须碰的。只清理自己造成的混乱。**

编辑现有代码时：

- 不要"改进"相邻的代码、注释或格式
- 不要重构没坏的东西
- 匹配现有风格，即使你更倾向于不同的写法
- 如果注意到无关的死代码，提一下 —— 不要删除它

当你的改动产生孤儿代码时：

- 删除因你的改动而变得无用的导入/变量/函数
- 不要删除预先存在的死代码，除非被要求

**检验标准：** 每一行修改都应该能直接追溯到用户的请求。

### 4. 目标驱动执行

**定义成功标准。循环验证直到达成。**

将指令式任务转化为可验证的目标：

| 不要这样做... | 转化为... |
|--------------|-----------------|
| "添加验证" | "为无效输入编写测试，然后让它们通过" |
| "修复 bug" | "编写重现 bug 的测试，然后让它通过" |
| "重构 X" | "确保重构前后测试都能通过" |

对于多步骤任务，说明一个简短的计划：

```
1. [步骤] → 验证: [检查]
2. [步骤] → 验证: [检查]
3. [步骤] → 验证: [检查]
```

强有力的成功标准让 LLM 能够独立循环执行。弱标准（"让它工作"）需要不断澄清。

---

**这些指南在以下情况下有效:** 减少不必要的差异修改，减少由于过度复杂而导致的重写，并在实施之前而非错误之后澄清问题。
~~~



### 三大文件

![d16c7c425b42b4fc76066f87cb0a7572](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260427215818847.png)

![399e6a0627db7402fcffb730fc781906](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260427215827678.png)

* **CLAUDE.md**

![9ae99973df6193dfe220f6c9c368618c](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260427215706464.png)

* **settings.json**

![a9270577532d422b42a954d0793b2caf](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260427215724982.png)

* **rules/**

![e16f38daa54384d801db629e9d8c6403](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260427215739860.png)



### Skills

安装 find-skill ：

```
帮我全局安装查找技能skill的技能。
```

安装 项目对应的技能：

```
帮我分析项目技术栈，然后给我推荐最适合的技能skill，由我来确认是否安装
```

代码优化，使用技能：

```
针对项目的建议流程
  1. 初步审查: 先使用 /review 进行整体代码质量评估
  2. 优化建议: 使用 /simplify 获取性能优化和重构建议
  3. 安全审查: 使用 /security-review 确保安全性（特别是当前系统的数据安全）

为什么推荐这个组合
  基于您的项目特点：
  - Spring Boot + MyBatis Plus: review 能很好理解Java生态
  - 当前管理系统: security-review 对数据安全很重要
  - 分层架构: simplify 能识别跨层优化机会
  - Vue + TypeScript 前端: 技能同样支持前端代码审查
```



## 4. 项目结构

设置 ClaudeCode 默认语言为中文。

![image-20260426120153286](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260426120156759.png)

如果不达预期，就使用提示词让其记住，以后本项目的所有对话全部使用中文，包括文档。

> 使用该提示词：
>
> ```
> 请全局记住：所有回复、代码注释和文档内容都使用中文，确保在不同的项目和不同的会话中都能生效。
> ```

对 Claude 最友好的项目结构：

```
claude-code-project/
├── .claude/                         # claude局部配置
├── backend/                         # 后端项目
│   ├── src/main/
│   ├── .gitignore                   # Git忽略配置
│   └── pom.xml                      # maven 依赖配置
├── frontend/                        # 前端项目
│   ├── src/
│   ├── .gitignore                   # Git忽略配置
│   └── package.json                 # pnpm 依赖配置
└── README.md                        # 文档
```

只有在`同一个目录下打开前后端项目`，才能让 AI 更好的理解项目，进行前后端互通协作编码。

为了让 ClaudeCode 更好用，更听话，不仅需要这个友好的项目结构，而且也需要结合 TRAE 生成 `CLAUDE.md` 核心文件（基础规范，每次对话都会携带）。

> 让 ClaudeCode 更好用：
> 1. 后端项目、前端项目 以平级的方式放在一个 父目录(新建)下。
> 2. 借助于 TRAE 中 Auto 模型就行，使用`计划模式`让其分析代码并生成 CLAUDE.md，提示词：
>
> ```
> /plan 帮我深度分析当前目录下的后端项目 xxx 和前端项目 xxx-web，然后在当前目录下重新生成一个详细的 CLAUDE.md 文件，用于 ClaudeCode 开发使用。
> ```

## 5. IDEA 插件使用

认准 `Claude Code [Beta]` 为官方插件。

![image-20260426120951789](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260426120953352.png)

MCP 需要 IDEA 2026版本（注意同版本的 jetBrain 的产品都需要爆破）

![image-20260426121631166](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260426121633985.png)



## 6. 场景与命令

### 6.1 打开终端，第一件事

#### 场景一：直接开干，进交互会话

```sh
claude
```

最朴素的用法，没什么好说的，进去之后就是一个对话界面，适合什么任务还没想好、先看看再说的时候

#### 场景二：进去就想开始一个具体任务，别废话

```sh
claude "帮我看看这个项目的整体结构，给我一个概览"
```

带上初始 prompt 启动，进去直接干活，不用再手打一遍，节省那两秒进入状态的摩擦

#### 场景三：昨天聊了一半，今天接着搞，不想重建上下文

你昨天花了半小时跟 Claude 交代清楚了背景、需求、限制条件，今天不想再说一遍

```sh
claude -c
```

`-c` 是 continue，继承上次这个目录里的对话，上下文全在，不用重新交代背景，接着聊

如果你同时跑好几个任务，不同任务开了不同会话，想恢复某个具体的

```sh
claude -r "auth-refactor" "继续，把单元测试也补上"
```

按名字恢复，直接带上今天要干啥，非常顺，不用先进去再打指令

#### 场景四：写脚本，或者 CI 里跑，压根不需要交互

```sh
cat error.log | claude -p "帮我分析这堆报错的根本原因，给出排查方向"
```

`-p` 是 print mode，执行完自动退出，不会等你输入，适合塞进 shell 脚本或者 CI 流水线

这才是 Claude Code 在自动化场景里的正确用法，把它当成一个接受文本、输出分析的命令行工具来用

#### 场景五：想在隔离环境里折腾，不影响主分支

让 Claude 帮你做一个比较大的改动，但又怕改乱了，想在一个独立的地方跑

```sh
claude -w feature-auth
```

`-w` 是 worktree，Claude 会在一个独立的 git worktree 里工作，改啥都不影响你的主分支，做完了满意再合并

加 `--tmux` 还可以开一个专属 tmux 窗口，多任务并行的时候特别好使

```sh
claude -w feature-auth --tmux
```

### 6.2 上下文快撑爆了，但任务还没做完

用 Claude Code 干活久了一定会遇到：对话越来越长，响应越来越慢，甚至出现截断

这时候很多人直接 `/clear` 重开，其实是错的，上下文这么多是有积累价值的，不一定要全扔掉

#### 想保留同一个对话，只是释放一下空间

```sh
/compact
```

Claude 把前面的对话压缩成一个摘要，继续往下聊，上下文占用大幅下降，任务还在继续，不割裂

可以加说明，告诉它哪些是重点

```sh
/compact 重点保留认证模块的讨论细节，接口设计不要压缩，其他可以压
```

加了说明之后，Claude 会在摘要里优先保留你说的那部分，不会把重要决策给压没了

#### 想彻底开一个新对话，不拖历史包袱

```sh
/clear
```

上下文清空，全新开始，但原来的对话不是删了，随时可以 `/resume` 找回来

`/clear` 和 `/compact` 的核心区别：一个是新建，一个是压缩同一个，别用错

#### 想知道现在上下文用了多少，哪块最占地方

```sh
/context
```

弹出一个彩色格子可视化图，一眼看出哪些工具、哪些文件在吃上下文，还会给优化建议，比如"这个工具输出太长了可以换一个"

### 6.3 想换模型，或者调整思考深度

有时候你就问个语法问题，没必要上 Opus 跑半天烧钱；有时候做架构分析，Sonnet 给的答案太浅根本不够用

#### 会话里临时换模型

```sh
/model
```

不带参数弹出选择器，上下键选，回车确认，不用退出重进

也可以直接指定

```sh
/model opus
/model claude-sonnet-4-6
```

#### 启动时就指定模型

```sh
claude --model opus
claude --model claude-sonnet-4-6
```

#### 调整努力级别，控制思考深度和 Token 消耗

这个很多人不知道，`--effort` 可以控制 Claude 在这个任务上"花多大力气"

```sh
claude --effort low      # 快速回答，适合简单问题
claude --effort high     # 深度分析，适合复杂架构问题
claude --effort xhigh    # 更深，适合难搞的 bug 排查
```

会话里也可以随时调

```sh
/effort high
/effort
```

不带参数弹交互滑块，左右键调，实时生效，不用等这一条回答完

同一个任务，`low` 和 `xhigh` 的回答质量差距很明显，遇到搞不定的问题先试试调高 effort，不要上来就换模型

## 6.4 权限弹窗每次都要确认，烦透了

改个文件弹一次确认，创建一个新文件又弹，跑个命令再弹

这个问题有三种解法，对应三种不同的场景

#### 场景一：完全信任这个任务，让 Claude 放飞自我

```sh
claude --dangerously-skip-permissions
```

名字起得很直白，危险操作，会跳过所有权限确认，Claude 想改啥就改啥，想执行啥命令就执行

在你完全清楚任务范围、完全信任 Claude 判断的时候用，别无脑开着跑不熟悉的任务

#### 场景二：先只让它分析，不让它动文件

让 Claude 给方案，你看完没问题再让它动手

```sh
claude --permission-mode plan
```

计划模式，Claude 只能读文件、思考、输出方案，不能执行任何修改，零风险

会话里也可以随时进入

```sh
/plan
/plan 重构这个认证流程，先给我看方案，我确认了再动
```

#### 场景三：指定哪些操作不用问，其他的还是要确认

比如你允许它自由读文件和跑 git 命令，但文件写入还是要确认

```sh
claude --allowedTools "Read" "Bash(git log *)" "Bash(git diff *)"
```

也可以反过来，直接禁掉某些工具

```sh
claude --disallowedTools "Bash(rm *)"
```

这种细粒度控制比"全开"或"全关"更实用，自动模式适合你日常开发

```sh
claude --permission-mode auto
```

auto 模式会自动减少弹窗，只在真正有风险的操作上提示，不像 default 那么烦

### 6.5 想让 Claude 永远记住你的编码规范

每次开新会话都要重新交代"用 TypeScript、不要 any、接口用 interface 不用 type、注释写中文"，这事真的很烦

#### 方法一：启动时追加规则到系统提示

```sh
claude --append-system-prompt "所有代码用 TypeScript，禁止用 any，函数注释写中文"
```

追加而不是替换，Claude 原本的能力不受影响，只是加了你的约束

规则多了写成文件更好管理，跟项目放一起，团队共用

```sh
claude --append-system-prompt-file ./team-coding-rules.txt
```

#### 方法二：彻底替换系统提示，完全自定义

```
claude --system-prompt "你是一个专注 Java 后端的技术专家，所有方案优先考虑性能和可维护性"
```

这个是完全替换，Claude Code 原有的一些默认行为也会变，慎用，适合非常明确需要定制化角色的场景

#### 方法三：初始化 CLAUDE.md，一劳永逸

这是我最推荐的做法

```sh
/init
```

Claude 帮你生成一个 `CLAUDE.md` 文件，放在项目根目录，把项目背景、技术栈、编码规范、注意事项全写进去

以后每次在这个项目里启动 Claude Code，它自动读取这个文件，再也不用重复交代背景

这就是为啥团队里推行了 CLAUDE.md 之后，每个人用起来都更顺，新人入项也更快上手

#### 方法四：管理个人记忆文件

```sh
/memory
```

这个是管理你个人级别的 Claude 记忆，可以跨项目记住你的个人偏好，比如"我不喜欢过度注释"、"我习惯函数式风格"这类

### 6.6 想看 Claude 改了什么，不想瞎猜

Claude 一顿操作下来改了七八个文件，你不知道具体改了啥，这种感觉很不安全

**交互式 diff 查看器**

```sh
/diff
```

弹出一个可视化的 diff 界面，左右箭头在"当前整体 git diff"和"Claude 每一轮的改动"之间切换，上下箭头翻文件，清清楚楚

比你自己跑 `git diff` 可读性强多了，尤其是改了很多文件的时候

**回退到某个节点，反悔了**

Claude 这一轮改的方向你觉得不对，想撤回到之前的状态

```sh
/rewind
```

弹出对话历史，选一个你想回到的节点，会话状态和代码改动都一起回退，是真正的"悔棋"，不只是对话层面

#### 对话分叉，两条路都试试

你想让 Claude 试试方案 A，同时也想保留主线去试方案 B，又不想开两个会话从头交代背景

```sh
/branch 试试用缓存层解决这个问题
```

从当前对话的这个节点分叉出去，在分支里折腾，主线不动，两条路都可以走

### 6.7 代码改完怎么做质量把关

#### 代码简化和重构

让 Claude 帮你改完之后，可以让它自己做一轮质量审查

```sh
/simplify
```

会并行跑三个审查 Agent，分别从不同角度审，结果汇总之后直接帮你修，不只是给建议

可以聚焦某个方向

```sh
/simplify focus on reducing duplication
/simplify focus on memory efficiency
```

#### 安全审查

```sh
/security-review
```

自动分析当前分支相对主分支的改动，找 SQL 注入、XSS、不当鉴权、敏感数据泄露这类问题，结果直接输出

做完一个功能上线之前跑一遍，比人工 review 快多了，也比 SonarQube 覆盖面更灵活

#### Review PR

```sh
/review
/review 123
/review https://github.com/org/repo/pull/456
```

默认检测当前分支对应的 PR，也可以直接传 PR 号或者 URL，本地做一次轻量级 review

### 6.8 大规模并行改动，一个人干一个团队的活

这是 Claude Code 里最被低估的功能，很多人不知道有 `/batch`

#### 场景：你要把整个项目从 CommonJS 改成 ESM

这种改动散落在几十个文件里，一个一个改没完没了

```sh
/batch migrate src/ from CommonJS to ESM
```

Claude 会先分析整个代码库，把任务拆成 5 到 30 个独立的工作单元，给你看计划

你确认之后，它会为每个单元各派一个后台 Agent，每个 Agent 在独立的 git worktree 里工作，并行执行，每个 Agent 做完还会自动跑测试、开 PR

几十个文件的改动，可能就是你喝杯水的时间

其他适合 `/batch` 的场景：

全局替换某个 API 调用方式、给所有函数补单元测试、把所有日志调用从 `console.log` 改成统一的 logger、删除所有废弃的 TODO 注释……凡是"全局性、重复性、可以拆分并行"的改动，都可以用

#### 查看和管理后台任务

```sh
/tasks
```

列出所有正在跑的后台 Agent 任务，可以查进度、停掉某个任务

### 6.9 CI 自动修复 PR，躺着等绿灯

这是我目前觉得最爽的一个功能

你提了一个 PR，CI 跑红了，或者 reviewer 留了评论，你不想自己手动改

```sh
/autofix-pr
```

Claude 会在云端开一个 session，自动监听你这个 PR 的 CI 状态和 reviewer 评论，有失败就自动修，修完直接 push

你就去喝咖啡，回来看绿灯就行

可以加说明，只修特定类型的问题

```sh
/autofix-pr only fix lint and type errors, don't touch the logic
```

需要你装了 `gh` CLI，而且账号有 Claude Code on the web 的权限

### 6.10 会话管理，同时跑多个任务

#### 启动时就给会话起名

```sh
claude -n "订单模块重构"
claude --name "修复登录 bug"
```

起了名字，会话列表里一眼认出来，`/resume` 的时候不用猜是哪个

#### 会话里随时改名

```sh
/rename feature-auth-final
```

改了名字，终端标题栏也会跟着变

#### 恢复某个具体的会话

```sh
/resume
```

弹出历史会话列表，有名字显示名字，没名字显示自动生成的摘要

#### 导出会话记录

```sh
/export
/export ./auth-refactor-notes.txt
```

把当前对话导出成纯文本，做技术方案存档或者给别人看的时候很有用

### 6.11 脚本和 CI 里用 Claude Code

#### 基础的非交互调用

```sh
# 管道输入
cat error.log | claude -p "分析这堆报错，给出优先级排序和排查思路"

# 直接传文件内容
claude -p "review 这段代码的安全性：$(cat src/auth.ts)"
```

#### 控制花费和轮次，防止失控

```sh
# 超过 3 美元自动停
claude -p --max-budget-usd 3.00 "帮我重构这个模块"

# 最多跑 10 轮，跑完自动退出
claude -p --max-turns 10 "自动修复所有 lint 错误"

# 两个一起用，双重保险
claude -p --max-budget-usd 5.00 --max-turns 20 "分析整个项目的代码质量"
```

#### 裸模式，更快启动，适合简单脚本

```sh
claude --bare -p "检查这段代码有没有明显的 bug"
```

`--bare` 跳过插件、MCP、hooks 的自动发现，启动快很多，适合不需要那些能力的简单脚本调用

#### 输出 JSON，给下游程序解析

```sh
claude -p "列出这个项目里所有的对外 API 接口，包括路径和方法" --output-format json
```

返回的是结构化 JSON，直接喂给下游脚本处理，不用自己去解析纯文本

#### 批量处理多个文件

```sh
for f in src/**/*.ts; do
  result=$(cat "$f" | claude -p "检查这个文件有没有安全漏洞，只列关键问题")
  if [ -n "$result" ]; then
    echo "=== $f ===" >> security-report.txt
    echo "$result" >> security-report.txt
  fi
done
```

#### 在 CI 里加一步代码审查

```sh
# GitHub Actions 里
-name:ClaudeCodeReview
run:|
    gitdifforigin/main...HEAD|claude-p\
      --max-budget-usd1.00\
      "review 这个 PR 的改动，找出潜在的 bug 和安全问题"\
      >>review-result.txt
```

### 6.12 几个平时不太注意但挺有用的

#### 问个旁路问题，不污染主对话上下文

你正在让 Claude 搞一件事，突然想顺嘴问个无关的小问题，但又不想把它加进上下文影响任务

```sh
/btw 这里的 interface 和 type 在 TypeScript 里有啥本质区别
/btw Postgres 的 JSONB 和 JSON 有啥性能差异
```

Claude 回答完，这条问答不会被计入主对话的上下文，不影响后续任务的理解，我用这个贼频繁

#### 复制最后一条回复

```sh
/copy
/copy 2
```

有代码块的话弹出选择器，可以只复制某个代码块，不用全选，`/copy 2` 是复制倒数第二条

SSH 远程连接的时候剪贴板不通，`/copy` 会问你要不要写成文件，也很方便

#### 当前 Session 烧了多少钱

```sh
/usage
```

看 Token 消耗和花费，我跑完大任务都会瞄一眼，养成这个习惯能避免月底账单惊喜

#### 当前版本和更新

```sh
claude -v           # 查看版本号
claude update       # 更新到最新版
claude install stable  # 安装稳定版
```

#### 登录和认证状态

```sh
claude auth login           # 登录
claude auth login --console # 通过 Anthropic Console 登录（API key 计费）
claude auth status --text   # 看登录状态，--text 是人话版，不加是 JSON
claude auth logout          # 退出登录
```

#### 清理项目本地状态

跑了太多任务，本地 Claude Code 状态积了一堆历史垃圾，想清干净重来

```sh
# 先预览，看会删哪些东西
claude project purge ~/work/repo --dry-run

# 确认没问题，直接清
claude project purge ~/work/repo -y

# 清所有项目
claude project purge --all -y
```

## 6.13 调试和排查

Claude Code 本身出了问题，或者响应不对劲，怎么排查

#### 开启详细日志

```sh
claude --verbose
```

会输出每一轮的详细过程，能看到 Claude 在做什么决定，工具调用是什么参数

#### 调试模式，可以过滤分类

```sh
claude --debug              # 全部调试日志
claude --debug "api,mcp"    # 只看 API 和 MCP 相关的
claude --debug "!statsig"   # 排除某个分类
```

#### 把调试日志写到文件

```sh
claude --debug-file /tmp/claude-debug.log
```

日志会持续写入这个文件，方便事后分析，不用翻终端滚动

#### 诊断安装和配置

```sh
/doctor
```

自动检测 Claude Code 的安装状态和配置，结果有状态图标，哪里有问题一眼看出来，按 `f` 可以让 Claude 自动修复。
