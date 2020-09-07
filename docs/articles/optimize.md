# 一篇就够了：前端全流程性能优化

![一篇就够了：前端全流程性能优化](/optimize.jpg)

## 性能监控

一个页面性能差的话会大大影响用户体验。用户打开页面等待的太久，可能会直接关掉页面，甚至就不再使用了，这种情况在移动端更加明显，移动端用户对页面响应延迟容忍度很低。虽然页面性能很重要，但是在实际使用中，页面性能差的情况并不少见。主要有以下两个原因：

* 在产品的迭代演进过程中，页面性能可能会被忽略，性能随着**版本迭代**而有所衰减
* 性能优化是一项复杂而挑战的事情，需要明确的优化方向和具体的优化手段才能快速落地取效

所以需要一个性能监控系统，持续监控和预警页面性能的状况，并且在发现瓶颈的时候指导优化工作。

### 性能指标

#### 首次内容绘制（FCP）- 白屏

不管是我们如何优化性能，首屏必然是会出现白屏的，因为这是前端开发这项技术的特点决定的。从路由改变起(即用户再按下回车的瞬间)到首次内容绘制(即能看到第一个内容)为止算白屏时间。

白屏时间内发生了什么：

1. 回车按下，浏览器解析网址，进行 `DNS` 查询，查询返回 `IP`，通过 `IP` 发出 `HTTP(S)` 请求
2. 服务器返回`HTML`，浏览器开始解析 `HTML`，此时触发请求 `js` 和 `css` 资源
3. `js` 被加载，开始执行 `js`，调用各种函数创建 `DOM` 并渲染到根节点，直到第一个可见元素产生

##### 对应的优化措施

* Loading 提示
* (伪)服务端渲染
* 开启HTTP2
* 开启浏览器缓存

#### 首次有意义绘制（FMP）

在白屏结束之后，页面开始渲染，但是此时的页面还只是出现个别无意义的元素，比如下拉菜单按钮、或者乱序的元素、导航等等，这些元素虽然是页面的组成部分但是没有意义。只有可是区域内元素渲染完成才算是有意义绘制。

##### 对应的优化措施

* `Skeleton`骨架屏

#### 可交互时间（TTI）

当有意义的内容渲染出来之后，用户会尝试与页面交互，这个时候页面并不是加载完毕了，而是看起来页面加载完毕了，事实上这个时候 JavaScript 脚本依然在密集得执行。

这个时候页面并不是可交互的，直到`TTI` 的到来，`TTI`到来之后用户就可以跟页面进行正常交互的，`TTI`一般没有特别精确的测量方法，普遍认为满足 **`FMP` && `DOMContentLoader`事件触发 && 页面视觉加载85%** 这几个条件后，`TTI` 就算是到来了。

##### 对应的优化措施

* `Tree Shaking`
* `polyfill`动态加载
* 动态加载`ES6`代码
* 路由级别拆解代码
  
### Lighthouse

Lighthouse 是一个开源的自动化工具，用于改进网络应用的质量。 你可以在 Chrome DevTools 面板中找到 Lighthouse。

运行Lighthouse会给页面打分并给出优化建议。

#### 运行参数选择界面

![启动Lighthouse](/lighthouse1.png)

#### 运行结果界面

![Lighthouse运行结果](/lighthouse2.png)

## Nginx

### 开启 GZIP 压缩

```nginx
# 开启gzip
gzip on;

# 启用gzip压缩的最小文件；小于设置值的文件将不会被压缩
gzip_min_length 1k;

# gzip 压缩级别 1-10
gzip_comp_level 2;

# 进行压缩的文件类型。

gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;

# 是否在http header中添加Vary: Accept-Encoding，建议开启
gzip_vary on;
```

### 开启 HTTP 2.0

注意事项：

* `Nginx` `1.10.0` 以上版本才支持 `Http2.0`，如果使用的是 `Tengine`，版本需要大于 `2.2.1`
* `Http2.0` 只支持 `Https` 协议的网站，且 `openssl` 版本需要高于 `1.0.2`

在保证以上两点的情况下，`Nginx` 配置 `http2` 很简单，只需要在 `listen` 的端口后新增 `http2` 标识即可，如下：

```nginx
server {
  listen  443 ssl http2;
  server_name  hostname.com;

  ssl_certificate   cert/214547145790616.pem;
  ssl_certificate_key  cert/214547145790616.key;

  location / {
    proxy_pass http://localhost:8088;
  }
}
```

### 静态资源缓存

### 负载均衡

## Webpack

### 代码分割

### UglifyJs 压缩

### CDN

### Tree Shaking

### GZIP

### webpack-bundle-analyze

### 提取公共依赖

## 按需加载

### 组件懒加载

### 组件预加载

### 模块按需引入

## 其它

### 预加载 Preload/Prefetch

### defer 和 async

### SSR 和 Pre-render

### 节流、防抖

### 事件委托

### CSS 相关性能优化

### 虚拟列表

### Web Worker
