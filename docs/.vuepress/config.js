module.exports = {
  title: '潜心摸鱼，戒骄戒躁',
  description: '....',
  themeConfig: {
    lastUpdated: 'Last Updated', // string | boolean
    nav: [
      {
        text: "前端知识体系",
        items: [
          { text: "React", link: "/articles/react" },
          { text: "Node", link: "/articles/node" },
          { text: "网络", link: "/articles/network" },
          { text: "设计模式", link: "/articles/design-patterns" },
          { text: "安全", link: "/articles/security" },
          { text: "算法", link: "/articles/algorithm" },
          { text: "性能优化", link: "/articles/optimization" },
          { text: "工程化", link: "/articles/engineer" },
          { text: "可视化（D3.js）", link: "/articles/visualization" },
          { text: "微前端", link: "/articles/micro-front-end" },
          { text: "多端（Taro）", link: "/articles/multi-terminal" },
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
        items: [{ text: "前端小报", link: "/articles/little-news" }],
      },
    ],
    sidebar: {
      "/articles/js": [
        {
          title: "1. 框架指南",
          collapsable: true,
          path: "framework",
          // children: [
          //   { title: "内置功能", path: "/handbook/" },
          //   { title: "展望未来", path: "/handbook/" },
          // ],
        },
        // ["/handbook/framework", "1. 框架指南"],
        {
          title: "2. 功能特性",
          collapsable: true,
          children: [
            { title: "内置功能", path: "/handbook/" },
            { title: "展望未来", path: "/handbook/" },
          ],
        },
      ],
    },
    sidebarDepth: 3,
  }
}