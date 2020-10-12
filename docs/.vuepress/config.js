module.exports = {
  title: '潜心摸鱼，戒骄戒躁',
  description: '....',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    repo: 'Xumengxiang/inner-peace',
    repoLabel: 'Github',
    lastUpdated: '最后修改时间', // string | boolean
    nav: [
      {
        text: "前端知识体系",
        items: [
          { text: "一篇就够了：React全家桶", link: "/articles/react" },
          { text: "一篇就够了：Http基础知识一网打尽", link: "/articles/network" },
          { text: "一篇就够了：前端性能优化", link: "/articles/optimize" },
          { text: "必知必会：CSS", link: "/articles/css" },
          { text: "必知必会：JavaScript与ES6", link: "/articles/css" },
          { text: "必知必会：Node.js", link: "/articles/node" },
          { text: "必知必会：设计模式", link: "/articles/design-patterns" },
          { text: "必知必会：Web安全", link: "/articles/security" },
          { text: "必知必会：算法", link: "/articles/algorithm" },
          { text: "必知必会：工程化与部署", link: "/articles/engineer" },
          { text: "快速上手：多端（Taro）", link: "/articles/multi-terminal" },
          { text: "快速上手：Webpack 5.0", link: "/articles/webpack-v5" },
        ],
      },
      {
        text: "手写题",
        items: [
          { text: "防抖、节流", link: "/articles/debounce-throttle" },
          { text: "深浅拷贝", link: "/articles/copy" },
          { text: "事件委托", link: "/articles/entrust" },
          { text: "new", link: "/articles/new" },
          { text: "promise", link: "/articles/promise" },
          { text: "call、apply、bind", link: "/articles/call-apply-bind" },
          { text: "函数柯里化", link: "/articles/curry" },
          { text: "实现拖拽div", link: "/articles/drag-dom" },
        ],
      },
      {
        text: "有趣的小项目",
        items: [
          { text: "Chrome插件：前端小报", link: "/articles/little-news" },
          { text: "VSCode插件：用Github小绿点画个画", link: "/articles/green-wall" },
          { text: "Webpack Plugin：ftpDeploy", link: "/articles/ftp-deploy" },
          { text: "Webpack Loader：多语言", link: "/articles/multi-language" },
          { text: "前端性能监控系统搭建", link: "/articles/apm" },
          { text: "团队开发：代码规范", link: "/articles/code-rule" },
          { text: "团队开发：React项目脚手架", link: "/articles/cli" },
          { text: "团队开发：React项目组件库", link: "/articles/component" },
          { text: "团队开发：项目模板", link: "/articles/component" },
        ],
      },
    ],
    sidebar: {
      "/articles/react": [
        {
          collapsable: false,
          children: [
            { title: "一篇就够了：React全家桶", path: "/articles/react" },
          ],
        },
      ],
      "/articles/network": [
        {
          collapsable: false,
          children: [
            { title: "一篇就够了：HTTP 基础知识一网打尽", path: "/articles/network" },
          ],
        },
      ],
      "/articles/optimize": [
        {
          collapsable: false,
          children: [
            { title: "一篇就够了：前端性能优化", path: "/articles/optimize" },
          ],
        },
      ],
      "/articles/webpack-v5": [
        {
          collapsable: false,
          children: [
            { title: "一篇就够了：Webapck 5.0 新特性尝鲜", path: "/articles/webpack-v5" },
          ],
        },
      ],
      "/articles/css": [
        {
          collapsable: false,
          children: [
            { title: "必知必会：CSS", path: "/articles/css" },
          ],
        },
      ],
    },
    sidebarDepth: 3,
  },
}