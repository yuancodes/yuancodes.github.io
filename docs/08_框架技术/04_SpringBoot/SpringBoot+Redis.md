---
order: 7
title: SpringBoot+Redis
date: 2018-6-20 17:59:44
tags:
- SpringBoot
- Redis
categories: 
- 08_框架技术
- 04_SpringBoot
---

![image-20200708160944615](https://jy-imgs.oss-cn-beijing.aliyuncs.com/img/20200708160946.png)

参考资料：https://www.springcloud.cc/spring-boot.html

中文文档2：https://felord.cn/_doc/_springboot/2.1.5.RELEASE/_book/index.html



### 1. 导入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```



### 2. application配置

properties

```sh
#配置redis数据库索引（默认0号库）
spring.redis.database=0
#配置redis服务器ip地址
spring.redis.host=192.168.228.135
#配置redis服务器的端口号
spring.redis.port=6379
```

yml

```yaml
spring:
  redis:
    host: 47.94.193.104
    port: 6379
    pass: 1234
```



### 3. Controller

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/redis")
public class RedisController {
    @Autowired
    private RedisTemplate redisTemplate;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @RequestMapping("/testString")
    public String test(){
        //redisTemplate.opsForValue();//操作字符串
        //redisTemplate.opsForList();//操作List
        //redisTemplate.opsForSet();//操作Set
        //redisTemplate.opsForZSet();//操作ZSet
        //redisTemplate.opsForHash();//操作Map

        redisTemplate.opsForValue().set("username","jack");
        String username = (String)redisTemplate.opsForValue().get("username");
        System.out.println(username);

        stringRedisTemplate.opsForValue().set("password","123");
        String password = stringRedisTemplate.opsForValue().get("password");

        System.out.println(password);

        return "success";
    }
}
```



### 4. RedisUtils

```java
/**
 * Redis工具类，使用之前请确保RedisTemplate成功注入
 */
public class RedisUtils {
 
    private RedisUtils() {}
 
    @SuppressWarnings("unchecked")
    private static RedisTemplate<String, Object> redisTemplate = SpringUtils
        .getBean("redisTemplate", RedisTemplate.class);
 
    /**
     * 设置有效时间
     *
     * @param key Redis键
     * @param timeout 超时时间
     * @return true=设置成功；false=设置失败
     */
    public static boolean expire(final String key, final long timeout) {
 
        return expire(key, timeout, TimeUnit.SECONDS);
    }
 
    /**
     * 设置有效时间
     *
     * @param key Redis键
     * @param timeout 超时时间
     * @param unit 时间单位
     * @return true=设置成功；false=设置失败
     */
    public static boolean expire(final String key, final long timeout, final TimeUnit unit) {
 
        Boolean ret = redisTemplate.expire(key, timeout, unit);
        return ret != null && ret;
    }
 
    /**
     * 删除单个key
     *
     * @param key 键
     * @return true=删除成功；false=删除失败
     */
    public static boolean del(final String key) {
 
        Boolean ret = redisTemplate.delete(key);
        return ret != null && ret;
    }
 
    /**
     * 删除多个key
     *
     * @param keys 键集合
     * @return 成功删除的个数
     */
    public static long del(final Collection<String> keys) {
 
        Long ret = redisTemplate.delete(keys);
        return ret == null ? 0 : ret;
    }
 
    /**
     * 存入普通对象
     *
     * @param key Redis键
     * @param value 值
     */
    public static void set(final String key, final Object value) {
 
        redisTemplate.opsForValue().set(key, value, 1, TimeUnit.MINUTES);
    }
 
    // 存储普通对象操作
 
    /**
     * 存入普通对象
     *
     * @param key 键
     * @param value 值
     * @param timeout 有效期，单位秒
     */
    public static void set(final String key, final Object value, final long timeout) {
 
        redisTemplate.opsForValue().set(key, value, timeout, TimeUnit.SECONDS);
    }
 
    /**
     * 获取普通对象
     *
     * @param key 键
     * @return 对象
     */
    public static Object get(final String key) {
 
        return redisTemplate.opsForValue().get(key);
    }
 
    // 存储Hash操作
 
    /**
     * 往Hash中存入数据
     *
     * @param key Redis键
     * @param hKey Hash键
     * @param value 值
     */
    public static void hPut(final String key, final String hKey, final Object value) {
 
        redisTemplate.opsForHash().put(key, hKey, value);
    }
 
    /**
     * 往Hash中存入多个数据
     *
     * @param key Redis键
     * @param values Hash键值对
     */
    public static void hPutAll(final String key, final Map<String, Object> values) {
 
        redisTemplate.opsForHash().putAll(key, values);
    }
 
    /**
     * 获取Hash中的数据
     *
     * @param key Redis键
     * @param hKey Hash键
     * @return Hash中的对象
     */
    public static Object hGet(final String key, final String hKey) {
 
        return redisTemplate.opsForHash().get(key, hKey);
    }
 
    /**
     * 获取多个Hash中的数据
     *
     * @param key Redis键
     * @param hKeys Hash键集合
     * @return Hash对象集合
     */
    public static List<Object> hMultiGet(final String key, final Collection<Object> hKeys) {
 
        return redisTemplate.opsForHash().multiGet(key, hKeys);
    }
 
    // 存储Set相关操作
 
    /**
     * 往Set中存入数据
     *
     * @param key Redis键
     * @param values 值
     * @return 存入的个数
     */
    public static long sSet(final String key, final Object... values) {
        Long count = redisTemplate.opsForSet().add(key, values);
        return count == null ? 0 : count;
    }
 
    /**
     * 删除Set中的数据
     *
     * @param key Redis键
     * @param values 值
     * @return 移除的个数
     */
    public static long sDel(final String key, final Object... values) {
        Long count = redisTemplate.opsForSet().remove(key, values);
        return count == null ? 0 : count;
    }
 
    // 存储List相关操作
 
    /**
     * 往List中存入数据
     *
     * @param key Redis键
     * @param value 数据
     * @return 存入的个数
     */
    public static long lPush(final String key, final Object value) {
        Long count = redisTemplate.opsForList().rightPush(key, value);
        return count == null ? 0 : count;
    }
 
    /**
     * 往List中存入多个数据
     *
     * @param key Redis键
     * @param values 多个数据
     * @return 存入的个数
     */
    public static long lPushAll(final String key, final Collection<Object> values) {
        Long count = redisTemplate.opsForList().rightPushAll(key, values);
        return count == null ? 0 : count;
    }
 
    /**
     * 往List中存入多个数据
     *
     * @param key Redis键
     * @param values 多个数据
     * @return 存入的个数
     */
    public static long lPushAll(final String key, final Object... values) {
        Long count = redisTemplate.opsForList().rightPushAll(key, values);
        return count == null ? 0 : count;
    }
 
    /**
     * 从List中获取begin到end之间的元素
     *
     * @param key Redis键
     * @param start 开始位置
     * @param end 结束位置（start=0，end=-1表示获取全部元素）
     * @return List对象
     */
    public static List<Object> lGet(final String key, final int start, final int end) {
        return redisTemplate.opsForList().range(key, start, end);
    }
}
```

测试工具类：

```java
    @GetMapping("/test")
    public ApiResp test() {
        RedisUtils.set("key1", "value1");
        RedisUtils.get("key1");
        return ApiResp.retOK();
    }
```

