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
          { text: "Node", link: "/articles/node" },
          { text: "一篇就够了：Http基础知识一网打尽", link: "/articles/network" },
          { text: "设计模式", link: "/articles/design-patterns" },
          { text: "安全", link: "/articles/security" },
          { text: "算法", link: "/articles/algorithm" },
          { text: "一篇就够了：前端性能优化", link: "/articles/optimize" },
          { text: "工程化", link: "/articles/engineer" },
          { text: "可视化（D3.js）", link: "/articles/visualization" },
          { text: "微前端", link: "/articles/micro-front-end" },
          { text: "多端（Taro）", link: "/articles/multi-terminal" },
        ],
      },
      {
        text: "手写题",
        items: [
          { text: "彻底搞懂：防抖、节流", link: "/articles/debounce-throttle" },
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
          { text: "实现一个前端请求拦截器", link: "/articles/intercept" },
          { text: "一套配置约束前端团队的代码规范", link: "/articles/code-rule" },
          { text: "撸一个React项目脚手架", link: "/articles/cli" },
          { text: "撸一个React项目组件库", link: "/articles/component" }
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
    },
    sidebarDepth: 3,
  },
}