# Webapck 5.0 新特性尝鲜

> Webpack 团队于北京时间 2019 年 10 月 12 日凌晨发布了 `v5.0.0-beta.0` 版本，并计划于 2020 年 10 月 10 日 发布首个正式版本。

本文主要根据[webpack/changelog-v5](https://github.com/webpack/changelog-v5)进行体验和总结

## 主要内容

Webpack 5.0 主要优化方向：

1. 通过持久化存储优化构建性能。
2. 采用更好的算法与 defalut 来改善长效缓存。
3. 通过更好的 Tree Shaking 和代码生成来改善 bundle 的大小。
4. 清除内部结构中奇怪的代码，同时在不影响 v4 功能基础上实现了新特性。
5. 通过引入破坏性更改来为新特性做准备，以便于我们能尽可能长期地使用 v5。

## 迁移指南

[点此查看迁移指南](https://github.com/webpack/changelog-v5/blob/master/MIGRATION%20GUIDE.md)

## 尝鲜之旅

### 打包文件对比

#### v4

`src/index.js`:

```js
console.log('Goodbye, webpack v4!');
```

运行`webpack --mode development`，输出的`main.js(3.8kb)`:

```js
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("console.log('Goodbye, webpack v4!');\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });
```

#### v5

`src/index.js`:

```js
console.log('Hello, webpack v5!');
```

运行`webpack --mode development`，输出的`main.js(872bytes)`:

```js
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
eval("console.log('Hello, webpack v5!');\n\n//# sourceURL=webpack://webpack-v4/./src/index.js?");
/******/ })()
;
```

### 按需加载对比

```js
//src文件夹index.js
import("./async.js").then((_)=>{
    console.log(_.data);
})
console.log("Hello Webpack5")

//src文件夹async.js
const data = "异步数据🍊";
export default data;
```

#### v4

默认对这些文件生成一堆`0.js`、`1.js`、`2.js`，需要使用`import(/* webpackChunkName: "name" */ "module")` 才能对这些模块命名。

#### v5

在开发模式中启用了一个新命名的块 id 算法，该算法提供块(以及文件名)可读的引用。 模块 ID 由其相对于上下文的路径确定。

### moduleIds 和 chunkIds

#### v4

在v4的版本中不同模块会被一次分配给一个`chunkId`。然后生成的`main.js`根据`chunkId`加载对应的文件，但是悲剧的事如果此时我删掉前面的一些模块时，会导致后面的模块上位也就是原来的`1`变成了`0`，不利于长效缓存。

```js
module.exports = {
  optimization:{
    chunkIds: "natural",
    moduleIds: "size"
  }
}
```

#### v5

添加了用于长效缓存的新算法。在生产模式下，默认启用这些功能。

```js
module.exports = {
  optimization:{
    chunkIds: "deterministic",
    moduleIds: "deterministic"
  }
}
```

此算法采用确定性的方式将短数字 ID（3 或 4 个字符）分配给 `modules` 和 `chunks`。这是基于 `bundle` 大小和长效缓存间的折中方案。

### 编译速度

`Webpack`的编译速度相信是很多同学比较头痛的问题，当然我们也有很多优化的办法。比如`HappyPack`、`Cache-loader`、排除`node_modules`、多线程压缩甚至可以采用分布式编译等等。其实`Webpack`编译慢跟他的`laoder`机制不无关系，比如 `string`->`ast`->`string` 。

在v5的版本中只要在配置文件中加上这样一句:

```js
  module.exports = {
    cache: {
      type: 'filesystem'
    }
  }
```

### Module Federation

#### 什么是 Module Federation

`Module Federation`主要是用来解决多个应用之间代码共享的问题，可以让我们的更加优雅的实现跨应用的代码共享。假设我们现在有两个项目A、B，`项目 A`内部有个轮播图组件，`项目 B`内部有个新闻列表组件。

现在来了个需求，要将`项目 B`的新闻列表移植到`项目 A`中，而且需要保证后续的迭代过程中，两边的新闻列表样式保持一致。这时候你有两种做法：

1. 使用 CV 大法，将`项目 B`的代码完整复制一份到`项目 A`；
2. 将新闻组件独立，发布到内部的 npm，通过 npm 加载组件；

CV 大法肯定比独立组件要快，毕竟不需要将组件代码从`项目 B`独立出来，然后发布 npm。但是 CV 大法的缺陷是，不能及时同步代码，如果你的另一个同事在你复制代码之后，对`项目 B`的新闻组件进行了修改，此时`项目 A`与`项目 B`的新闻组件就不一致了。

这个时候，如果你两个项目恰好使用了 Webpack 5，那应该是件很幸福的事，因为你不需要任何代价，只需要几行配置，就能直接在`项目 A`用上`项目 B`的新闻组件。不仅如此，还可以在`项目 B`中使用`项目 A`的轮播图组件。也就是说，通过`Module Federation`实现的代码共享是双向的。

#### Module Federation 实践

首先看一下项目的目录结构。

**项目A:**

```txt
├── public
│   └── index.html
├── src
│   ├── index.js
│   ├── bootstrap.js
│   ├── App.js
│   └── Slides.js
├── package.json
└── webpack.config.js
```

**项目B:**

```txt
├── public
│   └── index.html
├── src
│   ├── index.js
│   ├── bootstrap.js
│   ├── App.js
│   └── NewsList.js
├── package.json
└── webpack.config.js
```

项目 A、B 的差异主要在 `App.js` 中 import 的组件不同，两者的 `index.js`、`bootstrap.js` 都是一样的。

```jsx
import React from "react";
import Slides from './Slides';

const App = () => (
  <div>
    <h2 style={{ textAlign: 'center' }}>App1, Local Slides</h2>
    <Slides />
  </div>
);

export default App;
```

**项目A的`App.js`:**

```jsx
import React from "react";
import Slides from './Slides';

const App = () => (
  <div>
    <h2 style={{ textAlign: 'center' }}>App1, Local Slides</h2>
    <Slides />
  </div>
);

export default App;
```

**项目B的`App.js`:**

```jsx
import React from "react";
import NewsList from './NewsList';
const RemoteSlides = React.lazy(() => import("app1/Slides"));

const App = () => (
  <div>
    <h2 style={{ textAlign: 'center' }}>App 2, Local NewsList</h2>
    <NewsList />
  </div>
);

export default App;
```

在接入 `Module Federation` 之前的 **`webpack`** 配置：

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  // 入口文件
  entry: "./src/index",
  // 开发服务配置
  devServer: {
    // 项目 A 端口为 3001，项目 B 端口为 3002
    port: 3001,
    contentBase: path.join(__dirname, "dist"),
  },
  output: {
    // 项目 A 端口为 3001，项目 B 端口为 3002
    publicPath: "http://localhost:3001/",
  },
  module: {
    // 使用 babel-loader 转义
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  plugins: [
    // 处理 html
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
```

##### 配置：exposes/remotes

我们修改 webpack 配置，引入 `Module Federation`，让`项目 A`引入`项目 B`的新闻组件。

```js
// 项目 B 的 webpack 配置
const { ModuleFederationPlugin } = require("webpack").container;
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      // 提供给其他服务加载的文件
      filename: "remoteEntry.js",
      // 唯一ID，用于标记当前服务
      name: "app2",
      // 需要暴露的模块，使用时通过 `${name}/${expose}` 引入
      exposes: {
        "./NewsList": "./src/NewsList",
      }
    })
  ]
};

// 项目 A 的 webpack 配置
const { ModuleFederationPlugin } = require("webpack").container;
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "app1",
      // 引用 app2 的服务
      remotes: {
        app2: "app2@http://localhost:3002/remoteEntry.js",
      }
    })
  ]
};
```

需要重点关注 `exposes`/`remotes`：

* 提供了 `exposes` 选项的表示当前应用是一个 `Remote`，`exposes` 内的模块可以被其他的 `Host` 引用，引用方式为 `import(${name}/${expose})`。
* 提供了 `remotes` 选项的表示当前应用是一个 `Host`，可以引用 `remote` 中 `expose` 的模块。

然后修改`项目 A`的`App.js`：

```jsx
import React from "react";
import Slides from './Slides';
// 引入项目 B 的新闻组件
const RemoteNewsList = React.lazy(() => import("app2/NewsList"));

const App = () => (
  <div>
    <h2 style={{ textAlign: 'center' }}>App1, Local Slides, Remote NewsList</h2>
    <Slides />
    <React.Suspense fallback="Loading Slides">
      <RemoteNewsList />
    </React.Suspense>
  </div>
);

export default App;
```

此时，`项目 A`就已经成功接入了`项目 B`的新闻组件。我们再看看`项目 A`的网络请求，`项目 A`配置了 `app2: "app2@http://localhost:3002/remoteEntry.js"` 的 `remote` 后，会先请求`项目 B`的 `remoteEntry.js` 文件作为入口。在我们 import `项目 B`的新闻组件时，就会去获取项目 B 的 `src_NewsList_js.js` 文件。

![remoteEntry](/remoteEntry.png)

##### 配置：shared

除了前面提到的模块引入和模块暴露相关的配置外，还有个 `shared` 配置，主要是用来避免项目出现多个公共依赖。

例如，我们当前的`项目 A`，已经引入了一个 `react/react-dom`，而`项目 B` 暴露的新闻列表组件也依赖了 `react/react-dom`。如果不解决这个问题，`项目 A` 就会加载两个 `react` 库。这让我回想起刚刚入行的时候，公司的一个项目由于是 `PHP` 模板拼接的方式，不同部门在自己的模板中都引入了一个 `jQuery`，导致项目中引入了三个不同版本的 `jQuery`，特别影响页面性能。

所以，我们在使用 `Module Federation` 的时候一定要记得，将公共依赖配置到 `shared` 中。另外，一定要两个项目同时配置 `shared` ，否则会报错。

接下来，我们在浏览器打开`项目 A`，在 Chrome 的 network 面板中，可以看到`项目 A` 直接使用了`项目 B` 的 `react/react-dom`。

![v5-share](/v5-share.png)

##### 双向共享

前面提到过，`Module Federation` 的共享可以是双向的。下面，我们将`项目 A` 也配置成一个 `Remote`，将`项目 A` 的轮播图组件暴露给`项目 B` 使用。

```js
// 项目 B 的 webpack 配置
const { ModuleFederationPlugin } = require("webpack").container;
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "app2",
      filename: "remoteEntry.js",
      // 暴露新闻列表组件
      exposes: {
        "./NewsList": "./src/NewsList",
      },
      // 引用 app1 的服务
      remotes: {
        app1: "app1@http://localhost:3001/remoteEntry.js",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true }
      }
    })
  ]
};

// 项目 A 的 webpack 配置
const { ModuleFederationPlugin } = require("webpack").container;
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "app1",
      filename: "remoteEntry.js",
      // 暴露轮播图组件
      exposes: {
        "./Slides": "./src/Slides",
      },
      // 引用 app2 的服务
      remotes: {
        app2: "app2@http://localhost:3002/remoteEntry.js",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true }
      },
    })
  ]
};
```

在项目 B 中使用轮播图组件：

```diff
// App.js
import React from "react";
import NewsList from './NewsList';
+const RemoteSlides = React.lazy(() => import("app1/Slides"));

const App = () => (
  <div>
-   <h2 style={{ textAlign: 'center' }}>App 2, Local NewsList</h2>
+   <h2 style={{ textAlign: 'center' }}>App 2, Remote Slides, Local NewsList</h2>
+   <React.Suspense fallback="Loading Slides">
+     <RemoteSlides />
+   </React.Suspense>
    <NewsList />
  </div>
);

export default App;
```

#### 加载逻辑

这里有一个点需要特别注意，就是入口文件 `index.js` 本身没有什么逻辑，反而将逻辑放在了 `bootstrap.js` 中，`index.js` 去动态加载 `bootstrap.js`。

```js
// index.js
import("./bootstrap");

// bootstrap.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
ReactDOM.render(<App />, document.getElementById("root"));
```

如果删掉 `bootstrap.js`，将逻辑直接放到 `index.js` 是否可行呢？经过测试，确实是不可行的。

![v5-eager](/v5-eager.png)

通过 `network` 面板也可以看出，`remote.js` 是先于 `bootstrap.js` 加载的，所以我们的 `bootstrap.js` 必须是个异步逻辑。

![v5-network](/v5-network.png)

#### 总结

Webpack 5 提供的 `Module Federation` 还是很强大的，特别是在多个项目中进行代码共享，提供了极大的便利，但是这有一个致命缺点，需要你们所有的项目都基于 Webpack，而且已经升级到了 Webpack 5。相比起 `Module Federation`，大家也可以考虑 `vite` 提供的方案，利用浏览器原生的模块化能力，进行代码共享。
