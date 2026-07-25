---
order: 1
title: Codex保姆级教程完整版
date: 2026-6-25 19:40:05
index_img: https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725195029775.png
tags:
  - ai
  - 大模型
  - chatGPT
  - codex
categories:
  - 22_AI
  - 05_Codex
---

![image-20260725195028331](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725195029775.png)

参考资料：

* Codex 官方：https://openai.com/zh-Hans-CN/codex/
* Codex文档：https://developers.openai.com/codex
* Github 开源：https://github.com/openai/codex



## 一、codex 安装（chatgpt桌面版）

### 1.下载 codex安装包

有科学上网的同学，直接去OpenAI上去下载`codex`即可。

没有代理的用户，可以去微软应用商店上去下载，搜索 **ChatGPT**



![image-20260725195456547](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725195458381.png)

### 2.codex安装成功

在系统搜索栏 输入 **chatgpt** 能搜索到 chatgpt应用，就是安装成功了！先不要打开 codex！

![image-20260725195525765](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725195527291.png)

## 二、获取DeepSeek API Key

### 1.获取DeepSeek API Key

DeepSeek 官方API管理地址: https://platform.deepseek.com/api_keys

打开后登录账号。

如果之前没有创建过 API Key

![image-20260725195605167](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725195606556.png)

点击创建 API key

填写一个名称 创建后会得到示例格式的密钥：sk-xxxxxxxxxxxxxxxxxxxx

**注意：**

> API Key 只会在创建的时候完整显示一次，因此创建后务必立即保存到本地，如果忘记保存，只能删除重新创建新的 API Key。



## 三、配置CC-Switch

> 因为后面我们可能会有多种接入codex的方式,去改codex的配置文件会很麻烦,所以基本上都会下载 cc switch这个配置切换的软件,这个软件主要功能就是切换配置的,不过现在很全面了，支持 claude code，codex这些ai agent

### 1.安装CC-Switch:

双击**CC-Switch安装包**这个没什么好说的。

### 2.codex配置deepseek

打开 CC-Switch 点击顶部 **OpenAI 图标**，点击 **+** 新增一个渠道。

![image-20260725195714917](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725195717180.png)

### 3.codex配置第三方api

在预设供应商位置选择**DeepSeek**，往下滚动 找到 **API Key**的输入框，将前面获取的DeepSeek API Key 粘贴进去，填写完成后点击**添加**

![image-20260725195929499](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725195930747.png)

### 4.开启本地路由

点击 CC-Switch 设置 按钮

![image-20260725195950512](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725195952284.png)

找到 **本地路由**，进入后开启以下两个开关：

- 路由总开关
- Codex开关

> 如果没有打开，Codex 将无法通过 CC-Switch 转发请求。

![image-20260725200013862](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725200016503.png)

### 5.切换到DeepSeek渠道

回到 CC-Switch 主界面,在渠道列表中选择刚刚创建的**DeepSeek**

![image-20260725200042054](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725200043358.png)

### 6.重启Codex客户端

重启后客户端会重新读取本地代理配置,此时即可通过 DeepSeek API 进行调用。

## 四、git安装

Git 是一款分布式版本控制系统，由 Linux 之父 Linus Torvalds 于 2005 年创建。

参考我的git博文:[Git for Github](https://yuancodes.github.io/#/./12_项目管理/01_Git/Git for Github?id=git-for-github)



## 五、codex 入门

### 1.codex界面认识

如果启动时停留在图标界面，先检查网络连接。进入 Codex 后，即使界面最初显示英文，也可以继续使用，后续会根据语言自动切换。主界面左侧是工具栏，右侧是对话输入框，顶部是菜单栏。

![image-20260725200646477](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725200649143.png)

### 2.codex创建工作空间

先在电脑上建立用于不同项目的文件夹，例如 `codex-shop` 和 `codex-list`。将文件夹拖到 Codex 左侧区域，即可添加为独立工作空间；也可以通过 **添加新项目**选择现有文件夹。多个工作空间可以分别承载不同任务，避免项目内容互相混淆。

![image-20260725200859063](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725200901102.png)

### 3.codex创建多个并行任务

在当前项目中输入需求并提交，即可启动第一个任务。需要同时处理其他任务时，点击左上角的 **新建对话**，或在 Windows 使用 `Ctrl+N`、在 macOS 使用 `Command+N`，然后选择相应项目并提交新的需求。左侧任务列表会同时显示各任务的执行状态。

任务主要呈现三种状态：**进行中**表示 Codex 正在处理；**等待批准**表示创建文件、下载内容或使用权限等操作需要用户确认；**完成**表示任务已经结束。遇到等待批准时，任务不会自行继续，必须由用户处理。

![image-20260725201011040](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201012693.png)

### 4.创建不归属项目的对话

新建对话后选择 **不使用项目**，再输入一般性问题。

![image-20260725201033003](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201034845.png)

这类对话不会归属任何工作空间，而会统一显示在左侧的普通对话区域，适合无需读写具体项目的内容。

![image-20260725201045359](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201046653.png)

## 六、codex 功能模块

### 1.使用内置浏览器预览页面

选中目标对话，点击右侧功能区域的图标，然后点击 **加号**并选择 **浏览器**。输入本地访问地址，或者直接点击对话中生成的 `index.html` 链接，即可在 Codex 右侧预览页面。

![image-20260725201124772](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201126604.png)

### 2.搜索历史对话

点击左侧菜单栏的 **搜索**，或者按 `Ctrl+G` 打开对话搜索。输入关键词后，可以从历史对话中找到标题匹配的记录。

> ⚠️ 注意：该功能只能搜索对话标题，不能搜索对话正文。
>
> ![image-20260725201156029](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201158490.png)

### 3.codex对话重命名

**双击**需要修改的对话标题，输入便于识别的新名称并保存。可以在重要对话的标题中加入项目名、功能名或特殊标记，方便后续通过**搜索**快速定位。

![image-20260725201730084](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201731983.png)

### 4.codex归档和恢复对话

点击对话后方的 **归档**按钮并确认，对话便会从当前列表移入归档列表。需要恢复时，打开 **设置 → 已归档对话**，找到目标对话并点击 **取消归档**，对话就会重新出现在列表中。

> 不需要的对话 归档即可，需要的时候再取消归档，方便管理会话

![image-20260725201749957](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201751562.png)

### 5.codex打开权限管理

新建或打开一个对话，在输入框下方找到权限菜单。Codex 会把当前项目文件夹作为沙箱，并提供 **默认权限**、**自动审查**和 **完全访问权限**三种模式。

**默认权限**允许 Codex 读写当前项目文件夹，但不能直接修改沙箱外的文件，也不能直接执行需要外部网络的操作。需要访问外部文件、联网下载或使用额外权限时，Codex 会发起提权请求，获得用户批准后才能继续。

> ⚠️ 注意：权限限制由运行环境执行，不只是提示模型自行遵守。

**自动审查模式**会检查提权操作的风险。低风险操作可以自动放行，高风险操作仍需人工确认，从而减少频繁审批，同时保留必要的安全控制。

**完全访问权限**会解除沙箱限制，使 Codex 能够访问和修改项目外文件、使用网络以及执行更广泛的电脑操作。首次启用时，需要在警告对话框中明确确认。

> ⚠️ 注意：完全访问权限风险较高。教程建议日常优先使用自动审查，仅在清楚操作范围和后果时启用完全访问。
>
> ![image-20260725201810135](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201811462.png)

### 6.节省Token

点击对话中的上下文使用量图标，可以查看已使用空间、剩余空间和总容量。达到上限时，Codex 会自动压缩历史信息；也可以输入 `/` 并选择 **压缩**，手动触发上下文压缩。

> ⚠️ 注意：压缩后仍会保留部分历史信息。开始新的业务或任务时，建议新建对话，减少旧信息对模型的干扰和不必要的 Token 消耗。

![image-20260725201830400](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201832388.png)

### 7.添加图片或文件作为参考资料

点击输入框附近的 **加号**，选择图片或文件并上传。也可以复制图片或文件后直接粘贴到输入区域。添加的资料会作为提示词的补充信息，帮助 Codex 理解任务背景和预期结果。



## 七、codex 控制与引导

在任务执行过程中发现 AI 理解方向不对时，及时人工干预，让它停止当前方向并按新的要求继续执行。这里的 `steer` 可以理解为“掌舵”“控制”或“引导”。

### 1.输入新的引导要求

在 Codex 仍在执行时，直接输入新的要求，例如 **将这个部分的内容改得更温馨一点**。提交后点击 **引导**，让 Codex 暂停原来的执行方向，并按照新的要求继续修改。

如果只输入新消息但不点击 **引导**，Codex 会先把上一个任务执行完，再排队处理新任务。

点击 **引导** 后，Codex 会把当前任务暂停，直接执行你刚刚输入的新要求；如果不点击 **引导**，新要求会进入排队状态，等待当前任务结束后再执行。

![image-20260725201927251](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725201928956.png)

### 2.进入设置查看跟进行为

如果想调整后续消息的默认处理方式，可以打开 Codex 的 **设置**，进入 **常规**，向下找到 **跟进行为**。这里可以看到 **排队** 和 **引导** 两种模式。

> ⚠️ 注意：如果默认改成 **引导**，后续输入可能会直接打断当前任务。教程中更推荐默认排队，遇到方向错误时再手动引导。

![image-20260725202002788](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202004635.png)

## 八、codex计划模式

#### 1.使用计划模式

打开 Codex，新建一个对话。在输入框左侧点击 **加号**，选择 **计划模式**，即可进入计划模式。

在计划模式中，用户先提交需求，Codex 会先生成计划，而不是立刻修改代码。用户确认计划可行后，Codex 才会继续实施；如果计划不合适，可以继续调整，直到满意为止。

提交需求后，Codex 会先生成完整计划，说明它准备怎么做、改成什么样。阅读计划后，如果没有问题，选择 **实施此计划**并提交；如果不同意，Codex 会继续停留在计划模式中，等待你补充或调整要求。

计划模式适合 **首次搭建项目**、**重大重构**、**框架迁移**、**技术栈升级** 和 **复杂 Bug 修复** 等多步骤任务。对于简单修改，可以直接让 Codex 执行；对于复杂任务，建议先使用计划模式确认整体方案。

![image-20260725202021646](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202023020.png)

### 2.使用批注模式精确修改页面区域

在右侧浏览器查看页面时，点击 **批注**，选中需要修改的区域。例如选中价格区域，输入 **价格太高，改成 20 块钱**，点击对勾确认，然后发送给 Codex。Codex 会根据批注只修改指定区域，完成后页面中的价格会变为 `20`。

![image-20260725202042248](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202043779.png)

## 九、codex 代码管理

Codex 本身不是传统 IDE，不提供完整的代码编辑界面；如果需要手动查看或修改代码，可以将 Codex 与 **VS Code** 等本机开发工具集成。

### 1.用 VS Code 打开 Codex 项目

在 Codex 中打开当前项目，例如 `codex-shop`。点击右上角的 **VS Code 图标**，即可在 VS Code 中打开 Codex 生成的项目代码。打开后，可以手动修改源码、文本或配置。直接在vs code 打开项目的文件夹也是可以的。

### 2.选择默认代码编辑器

点击右上角 VS Code 图标旁边的 **下拉箭头**，可以看到本机已安装的开发工具，例如 **VS Code**、**Cursor** 或其他 IDE。也可以进入 **设置**，在 **常规** 中找到 **默认打开目标**，选择默认使用的编辑器。

![image-20260725202103247](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202104621.png)

### 3.git初始化

在 Codex 中选择当前项目，然后让 Codex 将项目初始化为 **Git 仓库**，并排除不需要提交的文件。初始化后，项目中会包含 `.git` 目录，并可配合 `.gitignore` 管理哪些文件需要提交、哪些文件需要忽略。

![image-20260725202119662](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202126381.png)

### 4.推送远程仓库

不需要远程仓库的可以不用推送远程仓库。

打开浏览器访问 Gitee，登录账号后点击右侧 **加号**，选择 **新建仓库**。填写仓库名称、归属、路径和简介，其他选项保持默认，然后点击 **创建**。创建完成后，这个远程仓库就可以用来托管当前项目代码。

> gitee 与 github一样。

### 5.代码回滚

当代码持续修改并提交后，如果发现某次修改不符合预期，可以通过 **Git 版本记录**配合 Codex 的 **分叉**功能回到之前的状态。这里要区分两件事：分叉可以回滚对话历史，但代码回滚还需要明确指定 Git 提交。

### 6.通过分叉回到上一段对话

如果希望回到修改前的效果，先找到上一次正确提交对应的对话位置，点击该位置附近的 **分叉**按钮，选择 **派生到本地**。Codex 会生成一个新的对话窗口，保留分叉点之前的对话内容。

> ⚠️ 注意：此时只回滚了对话历史，代码本身还没有回滚。
>
> ![image-20260725202423198](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202431072.png)

### 7.复制 Git 提交哈希并回滚代码

打开 VS Code 左侧的 **源代码管理**，找到想要回到的那一次提交，例如初始化提交。右键选择 **复制提交哈希**，然后回到 Codex，把提交哈希发给它，并说明 **把代码回到这里**。Codex 会根据该提交将代码回退到指定版本。

![image-20260725202447106](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202448362.png)

## 十、codex记忆系统

开启新对话后，Codex 会进入新的上下文环境，可能不记得之前的项目背景。为了避免每次都重复说明项目情况，可以通过记忆系统把项目规则、工作约束和个人偏好保存下来。

Codex 的记忆系统主要有两种方式：一种是项目级方式，在当前项目根目录创建 `AGENTS.md`，只对当前项目生效；另一种是全局方式，在 Codex 的 **个性化** 设置中配置 **自定义指令**，对所有项目生效。

![image-20260725202511711](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202513144.png)

### 1.在项目根目录创建 AGENTS.md

打开当前项目根目录，新建文件 `AGENTS.md`。

> ⚠️ 注意：文件名中的 `AGENTS` 建议使用大写，确保 Codex 能正确识别项目级规则文件。

在 `AGENTS.md` 中写入当前项目需要 Codex 记住的信息，例如项目背景、用户偏好或工作约束。

如果不想手动整理 `AGENTS.md`，可以让 Codex 通读当前项目，并把学到的项目信息写入 `AGENTS.md`。

例如输入：

```
通读当前项目，把你学到的关于项目的信息保存到 AGENTS.md 文件，用中文且清晰
```

完成后，文件中会包含项目概览、运行命令、关键文件、页面结构等信息。

### 2.AGENTS.md 应该写什么

`AGENTS.md` 是写给 Codex 的项目规则文件，适合放 **工作约束**、**验证命令**、**风险边界**、**包管理器**、**测试命令**、**构建命令**、**代码风格**、**提交前检查** 和特定目录的例外规则。

> ⚠️ 注意：`AGENTS.md` 不是越长越好，不建议放长篇产品文档、历史会议纪要、临时任务列表、密钥、账号、Token 或可以通过命令自动发现的信息。

### 3.配置全局自定义指令

打开 Codex 的 **设置**，进入 **个性化**，找到 **自定义指令**。在这里写入所有项目都需要遵守的工作约定，例如修改 JS 文件后必须运行 `npm test`、安装依赖时优先使用 `pnpm`、添加新的生产依赖前先确认。写完后点击 **保存**。

![image-20260725202600977](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202602426.png)

## 十一、codex插件与自动化

插件可以把第三方服务的能力接入 Codex，自动化则可以把重复任务设置为定期执行。下面我们使用 github 与 gamil 插件来测试。

### 1.安装 GitHub 和 Gmail 插件

点击左侧 **插件**，在插件市场中找到 **GitHub** 并点击加号安装。安装时按提示登录 GitHub 并授权。随后找到 **Gmail** 插件，同样点击安装并完成 Google 账号授权。

![image-20260725202619249](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202620650.png)

### 2.确认插件已可调用

回到对话输入框，输入 `/` 打开可调用能力列表。如果能看到 **GitHub** 和 **Gmail**，说明两个插件已经安装并可正常使用。

### 3.组合插件完成一次任务

在对话中同时调用 **GitHub** 和 **Gmail**，让 Codex 查询 GitHub 上最近一个月 AI 相关项目中 Star 增长最多的前 10 个项目，并通过 Gmail 发送到邮箱。任务完成后，打开 Gmail 查看邮件，确认项目列表已经发送成功。

![image-20260725202630660](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202632571.png)

#### 4.把插件任务设置为自动化

在对话中输入类似 **把上述任务做成一个自动化，每周五下午 5 点半通过邮件发送给我**。Codex 会根据这个描述创建自动化任务。

### 5.查看和编辑自动化任务

点击左侧 **自动化**，可以看到刚创建的任务。进入编辑后，可以修改运行环境、项目、重复时间、模型和推理强度，也可以点击 **立即运行**进行测试。

> ⚠️ 注意：这类重复信息收集任务通常不需要选择最高级模型，选择成本更低的模型即可。

## 十二、codex 的skills

这里不展开 Skills 的底层原理，重点演示三种使用方案：官方 Skills、第三方 Skills，以及自己编写的 Skills。

### 1.进入技能页面并找到官方 Skill

打开 Codex 左侧 **插件**，切换到 **技能** 页面。在技能列表中找到官方提供的 **PDF Skill**。如果尚未安装，就先安装；如果已经安装，可以直接使用。

![image-20260725202709269](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202710631.png)

### 2.调用官方 PDF Skill 生成文件

在对话输入框中输入 `/`，选择 **PDF Skill**，然后提出需求，例如 **在当前目录下创建一个 PDF，把所有历史对话都放进去**。等待 Codex 执行完成后，打开生成的 PDF，检查内容是否正常。

![image-20260725202724715](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202726201.png)

### 3.安装第三方 Skill

下载第三方 Skill 后先解压。然后创建一个项目目录，例如 `CodexSkills`，在其中创建 `.codex\skills` 目录，并把解压后的 Skill 文件夹复制到 `skills` 目录下。

![image-20260725202737123](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202738249.png)

## 十三、codex 的mcp

MCP 是模型上下文协议，可以理解为 AI 大模型的标准化工具箱，用来连接第三方文档、外部工具和共享信息。

示例中接入的是 **GitHub MCP**。

Codex 虽然可以通过 Git 命令做基础版本管理，但创建 PR、管理 Issue、查看 PR 评论等操作更适合通过 GitHub API 完成，因此可以借助 GitHub MCP 扩展能力。

### 1.进入 MCP 服务设置

打开 Codex，点击左下角 **设置**，进入设置页面后找到 **MCP 服务**，点击 **添加服务器**。MCP 可以使用本地方式，也可以使用远程 HTTP 方式；示例选择远程方式。

![image-20260725202819088](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202821196.png)

### 2.填写 GitHub MCP 服务信息

选择 **流式 HTTP**，填写服务器名称，例如 `github_mcp_server`，再粘贴 GitHub MCP 的 URL 地址。随后需要填写 GitHub Token 作为访问令牌。

### 3.创建 GitHub Token

打开 GitHub，进入头像菜单中的 **Settings**，找到 **Developer settings**，进入 Token 页面创建新的 Token。填写名称，例如 `Codex-GitHub`，选择授权时长，并按需要勾选权限范围，最后创建并复制 Token。

> ⚠️ 注意：Token 属于敏感凭证，不要公开分享，也不要写入项目代码或普通文档。
>
> ![image-20260725202840974](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202842364.png)

### 4.保存 MCP 配置并重启 Codex

回到 Codex 的 MCP 配置页面，把复制的 Token 粘贴到令牌位置，其他配置保持默认，然后点击 **保存**。保存后退出并重新打开 Codex，让 MCP 服务配置生效。

![image-20260725202857557](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725202859155.png)

### 5.验证 GitHub MCP 是否可用

在 Codex 中输入需求，例如 **使用 GitHub MCP，帮我查看 GitHub 项目最近的 5 个 Issue，并按优先级排序**。如果仓库中没有 Issue，可能返回空列表；添加 Issue 后再次查询，如果能返回问题列表和优先级，说明 MCP 已经正常工作。

## 十四、codex 常见问题

### 1.设置中文无效问题

安装codex之后，codex会请求openai去下载中文语言包

如果你没有代理的话，你在codex里面设置中文是无效的

### 2.codex配置代理

如果是账号接入codex，是一定要给codex配置代理的

不然你发任何消息都会一直Reconnection

配置代理也很简单，在.codex 目录 创建.env 文件写入：

```env
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
ALL_PROXY=http://127.0.0.1:7890
NO_PROXY=localhost,127.0.0.1
```

![image-20260725204030038](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20260725204032401.png)
