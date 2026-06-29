---
order: 1
title: Jenkins自动化部署项目
date: 2019-09-07 21:14:38
tags:
- Jenkins
- 自动化部署
categories: 
- 09_调试测试
- 04_自动部署
---



参考资料(官网)：https://www.jenkins.io/zh/

![image-20220127112845609](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127112846.png)

### 一、安装 jenkins

> 在你的本地电脑或者linux服务器上下载安装jenkins:
> jenkins下载地址：https://jenkins.io/   下载网站的war包版本就好了

下载完后把它部署到你的tomcat上运行：放到tomcat的webapps目录下，启动tomcat（windows下双击startup.bat或者linux下运行`sh startup.sh`），然后通过浏览器访问，如我的电脑上访问：`localhost:8080/jenkins` 。启动后的界面如下：

![image-20220127111025593](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127111026.png)

然后到提示的文件中把里面的文本复制出来填到管理员密码中。

接着如果是在本地电脑跑，可能会出现：`该jenkins实例似乎已离线` 提示，如果出现，是因为本地https访问不了的原因。在浏览器中另打开一个界面http://localhost:8080/pluginManager/advanced，把升级站点中的url中的https改为http,保存更新。然后关掉tomcat服务器重启，就可以联网了。

接下来选择安装推荐的插件，这个需要一定的时间。最后额外推荐安装两个插件，在系统管理中可以安装插件：

1. Rebuilder

2. Safe Restart

### 二、安装 git,maven

> 在linux服务器中安装git, maven，创建一个jenkens目录，配置git的公钥到你的github上，这些步骤是使用jenkins的前提。

安装git的目的是在自动化部署前实时从git远程仓库中拉取最新的代码。在linux(我用的是centos系统)安装git：

```shell
yum install git
```

生成密钥：

```shell
ssh-keygen -t rsa -C "youremail@abc.com"
```

可以不设置密钥密码直接按三次回车。 把家目录中生成的公钥内容复制到github或其他仓库上。    

安装maven的目的是通过项目中的pom.xml文件自动解决项目依赖问题，构建项目。linux中通过wget+下载链接下载maven的zip包然后解压即可。配置maven环境变量：

```shell
vim /etc/profile

//在这个文件末尾加上
export MAVEN_HOME=/root/maven3.4.5
export PATH=$MAVEN_HOME/bin:$PATH

//保存后在命令行输入,启动配置
. /etc/profile
```

创建jenkins目录，用来存储拉取下来的项目代码等。

### 三、服务器注册到 jenkins

> 将Linux服务器注册到Jenkins上

1、开启服务器上的ssh服务，可通过 `netstat -anp | grep :22` 命令查看是否开启

2、先来测试一下怎么在jenkins中操作远程服务器

在jenkins中选择**系统管理**——》新建节点

![image-20220127111431009](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127111431.png)

其中远程工作目录即你在Linux上创建的jenkins目录。在Credentials添加一个远程用户，输入你的远程机器用户名和密码保存。

![image-20220127111503594](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127111504.png)

点击TestEnv,启动代理。

在全局工具配置中配置git命令：

![image-20220127111559244](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127111600.png)

3、自动化部署过程原理：

![image-20220127111658342](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127111659.png)

所以需要编写一个shell脚本来执行这个过程。

具体的创建Jenkins任务的过程为

1. 创建jenkins任务

2. 填写Server信息

3. 配置git参数

4. 填写构建语句（shell脚本）,实现自动部署。

### 四、创建自动化部署任务

1. 编写shell部署脚本`deploy.sh`，并放到linux服务器中的jenkins目录下，在该目录下通过`touch deploy.sh`创建一个脚本，把下面的脚本复制到里面即可（到时每次自动部署都会执行它），脚本中的 **my-scrum** 为我要自动构建的项目名：

```sh
#!/usr/bin/env bash
#编译+部署项目站点

#需要配置如下参数

# 项目路径, 在Execute Shell中配置项目路径, pwd 就可以获得该项目路径

# export PROJ_PATH=这个jenkins任务在部署机器上的路径

# 输入你的环境上tomcat的全路径

# export TOMCAT_APP_PATH=tomcat在部署机器上的路径

### base 函数

killTomcat()
{
    #pid=`ps -ef|grep tomcat|grep java|awk '{print $2}'`
    #echo "tomcat Id list :$pid"
    #if [ "$pid" = "" ]
    #then
    #  echo "no tomcat pid alive"
    #else
    #  kill -9 $pid
    #fi
    #上面注释的或者下面的
    cd $TOMCAT_APP_PATH/bin
    sh shutdown.sh
}
cd $PROJ_PATH/my-scrum
mvn clean install

# 停tomcat

killTomcat

# 删除原有工程

rm -rf $TOMCAT_APP_PATH/webapps/ROOT
rm -f $TOMCAT_APP_PATH/webapps/ROOT.war
rm -f $TOMCAT_APP_PATH/webapps/my-scrum.war

# 复制新的工程到tomcat上

cp $PROJ_PATH/scrum/target/order.war $TOMCAT_APP_PATH/webapps/

cd $TOMCAT_APP_PATH/webapps/
mv my-scrum.war ROOT.war

# 启动Tomcat

cd $TOMCAT_APP_PATH/
sh bin/startup.sh
```

2. 在jenkins上点击新建一个任务，填好任务名，填写运行的节点（上文中新建节点时创建的）：

![image-20220127111928388](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127111929.png)

3. 点击源码管理，填写github（或gitlab等）地址：

![image-20220127112004139](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127112005.png)

4. 点击add，选择`check out to a sub-directory `,添加源码下载到jenkins目录下的指定目录（可以命名为你的项目名）：

![image-20220127112023087](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127112024.png)

5、填写构建任务时的shell脚本，然后保存，点击立即构建完成自动构建。（这里有一个坑，一定要`给tomcat下所有sh文件加上x权限`才能启动tomcat成功，具体为在tomcat目录上层执行`chmod a+x  -R tomcat`目录或者在tomcat的bin目录下执行`chmod +x *.sh`）

```shell
#当jenkins进程结束后新开的tomcat进程不被杀死
BUILD_ID=DONTKILLME
#加载变量
. /etc/profile
#配置运行参数

#PROJ_PATH为设置的jenkins目录的执行任务目录
export PROJ_PATH=`pwd`
#配置tomcat所在目录
export TOMCAT_APP_PATH=/root/tomcats/tomcat-my-scrum

#执行写好的自动化部署脚本
sh /root/jenkins/deploy.sh
```

![image-20220127112123466](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127112124.png)

6. 自动化构建成功：

![image-20220127112317237](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127112318.png)

7. 后续代码如果有改动，只要push到github或者gitlab等上，在jenkins界面中再次执行构建任务就可以了，非常方便，自动化部署，再也不用手动上传项目到服务器了。

### 五、遇到的问题

#### 5.1 解决一个tomcat关闭，所有tomcat都被关闭了的问题

（如果你的jenkins也是安装的服务器上的其中一个tomcat中，就可能被莫名杀掉）

这是因为所有的tomcat的关闭脚本（shutdown.sh或者说catalina.sh）都默认监听的是8005端口。只要进去tomcat目录下的conf目录下的server.xml文件中，将

```xml
<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <!-- Security listener. Documentation at /docs/config/listeners.html
  <Listener className="org.apache.catalina.security.SecurityListener" />
  -->
```

中的8005端口改为不同的端口，就不会一个tomcat关闭，所有的tomcat都被关闭了。



> 以后可以在linux服务器中安装多个tomcat，来部署不同的项目，分别使用不同的端口，如我喜欢用8081,8082,8083等端口来解决多个tomcat端口冲突问题（在tomcat的conf目录下的server.xml中修改即可，默认为8080）。然后可以用jenkins来管理这些tomcat的自动化部署。



### 六、Pipeline自动化构建

常见的项目自动化流程应该构建机从代码仓拉取代码进行构建，构建完成后会将产物推送到制品库中，比如镜像仓， 然后中间会有测试环境，用于进行自动化测试或人工测试，最后进行远程部署。

![image-20220127113127259](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127113128.png)

#### 6.1 新建jenkins项目

![image-20220127113204007](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127113205.png)

#### 6.2 点击配置按钮

![image-20220127113304678](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127113308.png)

![image-20220127113342135](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127113343.png)

![image-20220127113415906](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127113416.png)

![image-20220127113444513](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127113445.png)

![image-20220127113511631](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127113512.png)

![image-20220127113534109](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127113534.png)



说明：gitlab需要勾选标签推送事件，即可正常打tag

![image-20220127113637575](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20220127113638.png)

> 需要自己编写对应项目构建的 jenkinsfile。
>
> eg:
>
> ```pipeline
> pipeline {
> 	agent any
> 	options {        # jenkins参数
> 		buildDiscarder(logRotator(numToKeepStr: '10'))
> 		disableConcurrentBuilds()
> 		timeout(time: 20, unit: 'MINUTES')
> 		gitLabConnection('gitlab')
> 	}
>     parameters {    # 参数
>         gitParameter name: 'TAG', 
>                      type: 'PT_TAG',
>                      defaultValue: 'master'
>     }
> 	environment {         # 环境变量
> 	    GOPATH="/data/go_pkg"
> 	    CGO_ENABLED="0"
> 	    GOOS="linux"
> 	    GOARCH="amd64"
>         HOST="hub.test.com"
>         RUN_DISPLAY_URL="https://jenkins.test.com/job/${JOB_BASE_NAME}/${BUILD_NUMBER}/display/redirect"
>         TAB_STR = "\n                    \n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
>     }
> 	stages{       # 第一阶段打印变量
> 	   stage('Printenv') {
>           steps {
>             script{
>                 sh 'printenv'
>            }
>        }
> 	 }
>        stage('TagInfo') {      #  第二阶段git信息配置
>             steps {
>                 checkout([$class: 'GitSCM', 
>                           branches: [[name: "${params.TAG}"]], 
>                           doGenerateSubmoduleConfigurations: false, 
>                           extensions: [], 
>                           gitTool: 'Default', 
>                           submoduleCfg: [], 
>                           userRemoteConfigs: [[url: 'git@gitlab.test.com:web/test/microeccbiz.git']]
>                         ])
>             }
>         }
>        stage('Clone Code'){    # 第三阶段 clone代码
> 	      steps {
>              git 'git@gitlab.test.com:web/test/microeccbiz.git'
> 			 updateGitlabCommitStatus(name: env.STAGE_NAME, state: 'success')
>                 script{
>                     env.BUILD_TASKS = env.STAGE_NAME + "√..." + env.TAB_STR
>                  }
>               }
>            }
> 
>        stage('Code Build'){   # 第四阶段 构建代码
> 	      steps {
>              retry(2) { sh "make build" }
> 			 updateGitlabCommitStatus(name: env.STAGE_NAME, state: 'success')
>                script{
>                   env.BUILD_TASKS += env.STAGE_NAME + "√..." + env.TAB_STR
>                 }
>              }  
>          }
>        stage('Quality Scanning'){   # 第五阶段 代码质量扫描
> 	      steps {
>              echo "sonarqube"   # 此处未定义，需要自行定义
> 			 updateGitlabCommitStatus(name: env.STAGE_NAME, state: 'success')
>                 script{
>                     env.BUILD_TASKS += env.STAGE_NAME + "√..." + env.TAB_STR
>                 }
>              }
>          }
>        
>        stage('Docker Build'){     # 第六阶段 docker构建
>           steps {
>               script {
>                   PROJECT="项目名称"
>                   envTag="${env.gitlabBranch}"
>                   result = sh(script: "basename ${envTag}", returnStdout: true).trim()
>                   DOCKER_TAG = "${result}"
>                   matcher = '(^v[0-9]{1}.[0-9]{1,2}.[0-9]{1,2})$'     # 正则匹配
>                   matcherAlpha = '(^v[0-9]{1}.[0-9]{1,2}.[0-9]{1,2}-alpha[0-9]{0,2})$'
>                   matcherBeta = '(^v[0-9]{1}.[0-9]{1,2}.[0-9]{1,2}-beta[0-9]{0,2})$'
> 				  matcherTest = '(^v[0-9]{1}.[0-9]{1,2}.[0-9]{1,2}-test[0-9]{0,2})$'
>                   if ("${DOCKER_TAG}"=~"${matcherAlpha}"){    # if判断是否为相对应的tag，然后去打不同的tag
>                       echo "tag is alpha"
>                       DOCKER_TAG="${DOCKER_TAG}"
>                       DOCKER_TARGET="hub.test.com/alpha/${PROJECT}"
>                       return
>                   }else if ("${DOCKER_TAG}"=~"${matcherBeta}"){
>                       echo "tag is beta"
>                       DOCKER_TAG="${DOCKER_TAG}"
>                       DOCKER_TARGET="hub.test.com/beta/${PROJECT}"
>                       return
>                   }else if("${DOCKER_TAG}"=~"${matcher}"){
>                     echo "master tag"
>                     DOCKER_TAG="${DOCKER_TAG}"
>                     //DOCKER_TARGET="hub.test.com/version/${PROJECT}"
>                     DOCKER_TARGET="registry.cn-guangzhou.aliyuncs.com/test/${PROJECT}"
>                     return
> 				  }else if("${DOCKER_TAG}"=~"${matcherTest}"){
>                     echo "master tag"
>                     DOCKER_TAG="${DOCKER_TAG}"
>                     DOCKER_TARGET="registry.cn-guangzhou.aliyuncs.com/test/${PROJECT}"
>                     return
>                  }else{
>                      echo "git tag error"
>                      return
>                  }
>               }
>               retry(2){
>                   sh "make docker-build DOCKER_TARGET='${DOCKER_TARGET}' DOCKER_TAG='${DOCKER_TAG}' GITLAB_USER=test GITLAB_TOKEN=token"
>               }
> 			  updateGitlabCommitStatus(name: env.STAGE_NAME, state: 'success')
>                 script{
>                     env.BUILD_TASKS += env.STAGE_NAME + "√..." + env.TAB_STR
>                 }
>              }
>          }
>    	   stage('Push Image'){   # 第七阶段 push镜像 
>    	       
>               steps {
>                 script{
>                     if("${DOCKER_TAG}"=~"${matcher}"||"${DOCKER_TAG}"=~"${matcherTest}"){
>                         echo "push cloud Ali"
>                         withCredentials([usernamePassword(credentialsId: 'aliyunimages', passwordVariable: 'password', usernameVariable: 'username')]) {
>              	        retry(2) { sh "docker login -u ${username} -p ${password} registry.cn-qingdao.aliyuncs.com && make docker-release DOCKER_TARGET=${DOCKER_TARGET} DOCKER_TAG=${DOCKER_TAG}" }
>              	        }
>             			updateGitlabCommitStatus(name: env.STAGE_NAME, state: 'success')
>                             script{
>                                 env.BUILD_TASKS += env.STAGE_NAME + "√..." + env.TAB_STR
>                             }                   
>                     }else if ("${DOCKER_TAG}"=~"alpha"||"${DOCKER_TAG}"=~"beta"){
>                         echo "push local"
>                         withCredentials([usernamePassword(credentialsId: 'hub', passwordVariable: 'password', usernameVariable: 'username')]) {
>          	            retry(2) { sh "docker login -u ${username} -p ${password} ${HOST} && make docker-release DOCKER_TARGET=${DOCKER_TARGET} DOCKER_TAG=${DOCKER_TAG}" }
>          	             }
>     			        updateGitlabCommitStatus(name: env.STAGE_NAME, state: 'success')
>                         script{
>                             env.BUILD_TASKS += env.STAGE_NAME + "√..." + env.TAB_STR
>                         }
>                     }else{
>    	                    echo "docker target is null"
>    	                }
>                 }
>      	    }
> 	     }
> 	   stage('Application Deploy'){   # 第八阶段  部署服务
>           steps {	   
>              echo "deployment"
>  	         script {
>                   if ("${DOCKER_TAG}"=~"${matcherAlpha}"){
>                       echo "deploy to develop server"
>                         projectId="c-ewrwfwf-vfwef"
>                         pnamespace="web"
>                         sh """
>                         curl -k -u "token-s4xdt:zfwefgwgemm6dfwwhqvzljg7p5qqrf9sdfsfsfweerfdsgertwrfsdvsdfwe" \
>                         -X POST \
>                         -H 'Accept: application/json' \
>                         -H 'Content-Type: application/json' \
>                         'https://10.7.0.211/v3/project/${projectId}/workloads/deployment:${pnamespace}:${PROJECT}?action=redeploy'
>                         """
>                       return
>                   }else if ("${DOCKER_TAG}"=~"${matcherBeta}"){
>                       echo "deploy to test server"
>                         projectId="c-werfwe-wrfsf"
>                         pnamespace="server"
>                         sh """
>                         curl -k -u "token-s4xdt:zfwefgwgemm6dfwwhqvzljg7p5qqrf9sdfsfsfweerfdsgertwrfsdvsdfwer" \
>                         -X POST \
>                         -H 'Accept: application/json' \
>                         -H 'Content-Type: application/json' \
>                         'https://10.7.0.211/v3/project/${projectId}/workloads/deployment:${pnamespace}:${PROJECT}?action=redeploy'
>                         """
>                       return
>                   }else{
>                     echo "deploy failed"
>                     return
>                  }
>               }
> 			 updateGitlabCommitStatus(name: env.STAGE_NAME, state: 'success')
>                 script{
>                     env.BUILD_TASKS += env.STAGE_NAME + "√..." + env.TAB_STR
>                 }
>  	         }
> 	     }
>     }
>     post {    # 第九阶段  微信通知
>        success {
>            echo 'Congratulations!'
>            sh """
>                curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=fsfgerg3424sf-fdsf2-4e15-5342-fsfsffgr598c7ae' \
>                    -H 'Content-Type: application/json' \
>                    -d '
>                    {
>                       "msgtype": "text",
>                       "text": {
>                         "content": "😄👍构建成功👍😄\n 构建人：${gitlabUserName} \n 项目名称: ${PROJECT}  \n 构建标签：${DOCKER_TAG} \n 构建地址: ${RUN_DISPLAY_URL}"
>                       }
>                   }'
>             """
>         }
>        failure {
>             echo 'Oh no!'
>             sh """
>                 curl 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=32134fsffe-sdfsfsf-4e15-9705-be5e65fsadfs' \
>                 -H 'Content-Type: application/json' \
>                 -d '
>                  {
>                    "msgtype": "text",
>                    "text": {
>                        "content": "😖❌构建失败\n 构建人：${gitlabUserName}\n 项目名称: ${JOB_BASE_NAME} \n 构建标签：${DOCKER_TAG} \n 构建地址: ${RUN_DISPLAY_URL} "
>                     }
>                  }'
>             """
>         }
>         always { 
>             echo 'I will always say Hello again!'
>         }
>    }
> }
> ```