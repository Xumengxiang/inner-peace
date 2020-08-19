# 一篇就够了：`React`全家桶

![一篇就够了：React 全家桶](/react.jpg)

## `React`

### `Virtual Dom`

#### 什么是`Virtual Dom`

`Virtual Dom`是对`Dom`的抽象，本质上是一个`JavaScript`对象，这个对象是对`Dom`的轻量级描述。

#### 为什么需要`Virtual Dom`

既然我们已经有了`Dom`，为什么还需要`Virtual Dom`呢？主要原因有以下三点：

* **性能需要**：`Dom`操作相对较慢，并且频繁操作`Dom`容易造成浏览器的回流和重绘，严重影响性能。`Virtual Dom`可以尽可能的减少`Dom`操作的次数。
* **现代前端框架的基本要求**：现代前端框架的一个基本要求就是无需手动操作`Dom`，原因有二：一、无法保证性能；二、省略`Dom`操作可以大大提高开发效率。
* **跨平台**：`Virtual Dom`的最初目的就是解决跨平台的问题，比如`Node.js`本身没有`Dom`，如果想要实现`SSR`，一种可行的方式就是借助`Virtual Dom`，因为`Virtual Dom`本身只是一个`JavaScript`对象。

#### 关键知识点（以`snabbdom.js`为例）

##### 根据`Dom`节点创建`VNode`

`VNode`是`Dom`节点的抽象，那么我们很容易定义它的形式。

```js
{
  type: String， // String，DOM 节点的类型，如 'div'/'span'
  data: Object,  // Object，包括 props，style等等 DOM 节点的各种属性
  children: Array // Array，子节点（子 vnode）
}
```

我们来看一下`snabbdom.js`中是怎么定义`VNode`的：

```ts
export interface VNode {
  sel: string | undefined; // VNode的选择器，nodeName+id+class的组合
  data: VNodeData | undefined; // 存放VNodeData的地方，具体见下面的VNodeData定义
  children: Array<VNode | string> | undefined; // vnode的子vnode的地方
  elm: Node | undefined; // 存储vnode对应的真实的dom的地方
  text: string | undefined; // vnode的text文本，和children只能二选一
  key: Key | undefined; // vnode的key值，主要用于后续vnode的diff过程
}

export interface VNodeData {
  props?: Props; // vnode上传递的其他属性
  attrs?: Attrs; // vnode上的其他dom属性，可以通过setAttribute来设置或删除的。
  class?: Classes; // vnode上的class的属性集合
  style?: VNodeStyle; // vnode上的style属性集合
  dataset?: Dataset; // vnode挂载的数据集合
  on?: On;  // 监听的事件集合
  hero?: Hero;
  attachData?: AttachData; // 额外附加的数据
  hook?: Hooks; // vnode的钩子函数集合，主要用于在不同阶段调用不通过的钩子函数
  key?: Key;
  ns?: string; // for SVGs 命名空间，主要用于SVG
  fn?: () => VNode; // for thunks
  args?: Array<any>; // for thunks
  [key: string]: any; // for any other 3rd party module
}
```

`snabbdom.js`中不仅仅存在`VNode`和`VNodeData`两个数据模型，还有一个生成`VNode`的工具方法`vnode`:

```ts
// 参数是sel，data，children，text，elm，返回值是一个VNode的对象
export function vnode(sel: string | undefined,
                      data: any | undefined,
                      children: Array<VNode | string> | undefined,
                      text: string | undefined,
                      elm: Element | Text | undefined): VNode {
  let key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children, text: text, elm: elm, key: key};
}
```

有了`VNode`和生成`VNode`的函数，接下来我们看看如何将真实的`Dom`节点转化为`VNode`:

```ts
// 参数是要求一个真实的dom对象
export function toVNode(node: Node, domApi?: DOMAPI): VNode {
  // 这边定义了一个变量叫api，主要是一些用于dom操作的api接口。
  const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi;
  // 定义了text的变量
  let text: string;
  // 如果node是一个element类型的dom对象就进行如下的操作
  if (api.isElement(node)) {
    // 获得node的id，变成#id 
    const id = node.id ? '#' + node.id : '';
   // 获得class，变成.class1.class2这样的形式
    const cn = node.getAttribute('class');
    const c = cn ? '.' + cn.split(' ').join('.') : '';
   // sel 变成tagName+id+class的形式，比如<div id=id class=class></div>的sel的值就变成了div#id.class
    const sel = api.tagName(node).toLowerCase() + id + c;
   // 定义一系列后续需要使用的attrs，children等对象。
    const attrs: any = {};
    const children: Array<VNode> = [];
    let name: string;
    let i: number, n: number;
    // 获得元素里所有的attrs
    const elmAttrs = node.attributes;
   // 获得元素中所有子节点,这边不用children
    const elmChildren = node.childNodes;
    for (i = 0, n = elmAttrs.length; i < n; i++) {
      name = elmAttrs[i].nodeName;
      if (name !== 'id' && name !== 'class') {
        // 把非id和class的属性值放到attrs中 
        attrs[name] = elmAttrs[i].nodeValue;
      }
    }
    for (i = 0, n = elmChildren.length; i < n; i++) {
      // 通过递归的方式把子节点翻译成vnode放入children数组中
      children.push(toVNode(elmChildren[i], domApi));
    }
   // 生成完整的vnode并返回
    return vnode(sel, {attrs}, children, undefined, node);
  } else if (api.isText(node)) {
   // 如果node是一个textContent类型的就返回文本的vnode
    text = api.getTextContent(node) as string;
    return vnode(undefined, undefined, undefined, text, node);
  } else if (api.isComment(node)) {
   // 如果node是一个comment类型的就返回sel是"!"的文本的vnode
    text = api.getTextContent(node) as string;
    return vnode('!', {}, [], text, node as any);
  } else {
    // 如果什么都不是就返回一个空的vnode 
    return vnode('', {}, [], undefined, node as any);
  }
}
```

##### 根据`VNode`生成真实的`Dom`节点

我们已经有了各种方法来生成一个`VNode`，包括从普通`js`对象生成，从真实的`Dom`来生成。但是我们怎么从`VNode`生成真实的`Dom`呢？接下来让我们来看看`snabbdom.js`中最重要的主代码`snabbdom.ts`。

利用`VNode`生成真实`Dom`在`snabbdom`中主要是通过`createElm`方法来实现，该方法放在`snabbdom.ts`中。

```ts
  //根据VNode创建element
  function createElm(vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
    let i: any, data = vnode.data;
    if (data !== undefined) {
      //如果VNodeData存在且hooks里有init函数,则执行init函数,然后重新赋值VNodeData
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode);
        data = vnode.data;
      }
    }
    // 子虚拟dom,
    let children = vnode.children, sel = vnode.sel;
    // 当sel == "!"的时候表示这个vnode就是一个comment
    if (sel === '!') {
      if (isUndef(vnode.text)) {
        vnode.text = '';
      }
      vnode.elm = api.createComment(vnode.text as string);
    } else if (sel !== undefined) {
      // Parse selector 这么一段就是为了从sel中获得tag值,id值,class值
      const hashIdx = sel.indexOf('#');
      const dotIdx = sel.indexOf('.', hashIdx);
      const hash = hashIdx > 0 ? hashIdx : sel.length;
      const dot = dotIdx > 0 ? dotIdx : sel.length;
      const tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      const elm = vnode.elm = isDef(data) && isDef(i = (data as VNodeData).ns) ? api.createElementNS(i, tag)
                                                                               : api.createElement(tag);
      // 设置元素的id
      if (hash < dot) elm.setAttribute('id', sel.slice(hash + 1, dot));
      // 设置元素的class
      if (dotIdx > 0) elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '));
      // 调用create钩子
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          const ch = children[i];
          if (ch != null) {
            //深度遍历
            api.appendChild(elm, createElm(ch as VNode, insertedVnodeQueue));
          }
        }
      } else if (is.primitive(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }
      i = (vnode.data as VNodeData).hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        //当insert的hook存在,就在插入Vnode的队列中加入该vnode
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      // 其他的情况就当vnode是一个简单的TextNode
      vnode.elm = api.createTextNode(vnode.text as string);
    }
    return vnode.elm;
  }
```

##### `diff`算法

我们已经把`complie`的阶段弄的差不多了，现在只剩下，怎么比较`oldVnode`与`newVnode`两个`vnode`，并实现`DOM`树更新？也就是我们前面提到的`diff`方法和`patch`过程，在`snabbdom.ts`，`diff`和`patch`都写在一起，我们继续往下看。

```ts
  // 只要这两个虚拟元素的sel(选择器)和key一样就是same的
  function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
  }
  // patch过程
  function patchVnode(oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
    let i: any, hook: any;
    // 调用全局hook里定义的事件的地方。
    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    // 因为 vnode 和 oldVnode 是相同的 vnode，所以我们可以复用 oldVnode.elm。
    const elm = vnode.elm = (oldVnode.elm as Node);
    let oldCh = oldVnode.children;
    let ch = vnode.children;
    if (oldVnode === vnode) return;
    if (vnode.data !== undefined) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      i = vnode.data.hook;
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
    }
    // 如果 vnode.text 是 undefined
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        // 核心逻辑（最复杂的地方）：怎么比较新旧 children 并更新，对应上面
        // 的数组比较
        if (oldCh !== ch) updateChildren(elm, oldCh as Array<VNode>, ch as Array<VNode>, insertedVnodeQueue);
        // 添加新 children
      } else if (isDef(ch)) {
        // 首先删除原来的 text
        if (isDef(oldVnode.text)) api.setTextContent(elm, '');
        // 然后添加新 dom（对 ch 中每个 vnode 递归创建 dom 并插入到 elm）
        addVnodes(elm, null, ch as Array<VNode>, 0, (ch as Array<VNode>).length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        // 相反地，如果原来有 children 而现在没有，那么我们要删除 children。
        removeVnodes(elm, oldCh as Array<VNode>, 0, (oldCh as Array<VNode>).length - 1);
      } else if (isDef(oldVnode.text)) {
        // 最后，如果 oldVnode 有 text，删除。
        api.setTextContent(elm, '');
      }
      // 否则 （vnode 有 text），只要 text 不等，更新 dom 的 text。
    } else if (oldVnode.text !== vnode.text) {
      api.setTextContent(elm, vnode.text as string);
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
  }

  // diff算法的重点
  function updateChildren(parentElm: Node,
                          oldCh: Array<VNode>,
                          newCh: Array<VNode>,
                          insertedVnodeQueue: VNodeQueue) {
    // parentElm:Node
    // oldCh: Array<VNode>
    // newCh: Array<VNode>
    // insertdVnodeQuenen: VNodeQuenen
    // 和patchVnode形成了精巧递归
    let oldStartIdx = 0, newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx: any;
    let idxInOld: number;
    let elmToMove: VNode;
    let before: any;

    // 当oldCh和newCh其中还有一个没有比较完的话，就执行下的函数
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVnode == null) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx];
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // 把获得更新后的 (oldStartVnode/newEndVnode) 的 dom 右移，移动到
        // oldEndVnode 对应的 dom 的右边。为什么这么右移？
        // （1）oldStartVnode 和 newEndVnode 相同，显然是 vnode 右移了。
        // （2）若 while 循环刚开始，那移到 oldEndVnode.elm 右边就是最右边，是合理的；
        // （3）若循环不是刚开始，因为比较过程是两头向中间，那么两头的 dom 的位置已经是
        //     合理的了，移动到 oldEndVnode.elm 右边是正确的位置；
        // （4）记住，oldVnode 和 vnode 是相同的才 patch，且 oldVnode 自己对应的 dom
        //     总是已经存在的，vnode 的 dom 是不存在的，直接复用 oldVnode 对应的 dom。
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm as Node, api.nextSibling(oldEndVnode.elm as Node));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        //更新新旧vnode的值，然后vnode左移
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm as Node, oldStartVnode.elm as Node);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }
        idxInOld = oldKeyToIdx[newStartVnode.key as string];
        // 新的children中的startVnode元素没有在旧children中找到
        if (isUndef(idxInOld)) { // New element
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
          newStartVnode = newCh[++newStartIdx];
        } else {
          // 新的children中的startNode元素在旧children中找到元素
          elmToMove = oldCh[idxInOld];
          // 如果sel不相等则必须重新创建一个新的ele
          if (elmToMove.sel !== newStartVnode.sel) {
            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
          } else {
            // 更新操作
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined as any;
            api.insertBefore(parentElm, (elmToMove.elm as Node), oldStartVnode.elm as Node);
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
```

### `React`最新的生命周期

`React` 从 `v16.3` 开始，对生命周期进行了渐进式的调整。废弃了一些生命周期方法和添加了一些新的生命周期方法。

#### 原·生命周期方法

![原·生命周期](/old-funcs.jpg)

#### 新·生命周期方法

![新·生命周期](/new-funcs.jpg)

##### 废弃的生命周期方法

* `componentWillMount`
* `componentWillReceiveProps`
* `componentWillUpdate`

##### 新增的生命周期方法

* `getDerivedStateFromProps`
* `getSnapshotBeforeUpdate`

##### 挂载

**`constructor()`**
  
```jsx
constructor(props)
```

`React` 组件在挂载前，会调用它的构造函数，在构造函数内部必须执行一次`super(props)`。不能再`constructor`内部调用`this.setState`。 通常用于：

* 通过给this.state初始化内部状态
* 为事件处理函数绑定this

**`static getDerivedStateFromProps()`**

```jsx
static getDerivedStateFromProps(newProps,prevState)
```

是一个静态方法，父组件传入的`newProps`和当前组件的`prevState`进行比较，判断时候需要更新`state`，返回值对象用作更新`state`，如果不需要则返回`null`。在`render()`方法之前调用，并且在初始挂载和后续更新时调用。

**`render()`**

`render()`是组件中唯一必须实现的方法。`render()` 函数应该是纯函数。不能够调用`setState`。

**`componentDidMount()`**

组件加载完成，能够获取真是的 `DOM` 在此阶段可以`ajax`请求和绑定事件，在此阶段绑定了时间要在`componentWillUnmount()`取消。在此阶段可以调用`setState`，触发`render`渲染，但会影响性能。

##### 更新

**`static getDerivedStateFromProps()`**

和挂载阶段一致。

**`shouldComponentUpate()`**

```jsx
shouldComponentUpdate(props,state)
```

在已挂载的组件，当`props`或者`state`发生变化时，会在渲染前调用。根据父组件的 `props` 和当前的 `state` 进行对比，返回`true`/`false`。决定是否触发后续的生命周期函数。

**`render()`**

和挂载阶段一致。

**`getSnapshotBeforeUpdate()`**

```jsx
getSnapshotBeforeUpdate(prevProps,prevState)
```

在真实的 `DOM` 更新前调用。可获取一些有用的信息然后作为参数传递给`componentDidUpdate()`。`prevProps`表示更新前的`props`,`prevState`表示更新前的`state`。

在`render()`之后`componentDidUpdate()`之前调用。此方法的返回值`(snaphot)`可作为`componentDidUpdate()`的第三个参数使用。如不需要返回值则直接返回`null`。

**`componentDidUpdate`**

```jsx
componentDidUpdate(prevProps, prevState, snapshot)
```

该方法会在更新完成后立即调用。首次渲染不会执行此方法。当组件更新后，可以在此处对 `DOM` 进行操作。可以在此阶段使用`setState`，触发`render()`但必须包裹在一个条件语句里，以避免死循环。

##### 卸载

**`componentWillUnmount`**

```jsx
componentWillUnmount()
```

会在组件卸载和销毁之前直接调用。此方法主要用来执行一些清理工作，例如：定时器，清除事件绑定，取消网络请求。

### `setState`是同步操作还是异步操作

* `setState`只在合成事件和钩子函数中是“异步”的，在原生事件和`setTimeout`中都是同步的。
* `setState`的“异步”并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是合成事件和钩子函数的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值，形成了所谓的“异步”，当然可以通过第二个参数 `setState(partialState, callback)` 中的`callback`拿到更新后的结果。
* `setState`的批量更新优化也是建立在“异步”（合成事件、钩子函数）之上的，在原生事件和`setTimeout`中不会批量更新，在“异步”中如果对同一个值进行多次`setState`，`setState`的批量更新策略会对其进行覆盖，取最后一次的执行，如果是同时`setState`多个不同的值，在更新时会对其进行合并批量更新。

### `React`如何实现组件间通信

* 父组件向子组件通讯: 父组件可以向子组件通过传`props`的方式，向子组件进行通讯。
* 子组件向父组件通讯: `props` + 回调的方式,父组件向子组件传递`props`进行通讯，此`props`为作用域为父组件自身的函数，子组件调用该函数，将子组件想要传递的信息，作为参数，传递到父组件的作用域中。
* 兄弟组件通信: 找到这两个兄弟节点共同的父节点,结合上面两种方式由父节点转发信息进行通信。
* 跨层级通信: `Context`设计目的是为了共享那些对于一个组件树而言是“全局”的数据，例如当前认证的用户、主题或首选语言,对于跨越多层的全局数据通过`Context`通信再适合不过。
* 发布订阅模式: 发布者发布事件，订阅者监听事件并做出反应,我们可以通过引入`event`模块进行通信。
* 全局状态管理工具: 借助`Redux`或者`Mobx`等全局状态管理工具进行通信,这种工具会维护一个全局状态中心`Store`,并根据不同的事件产生新的状态。

![React如何实现组件间通信](/redux.png)

### 组件/逻辑复用方式比较

主要对组件复用的三种方式进行比较：`HOC`、`Render Props`、`Hooks`。

#### `HOC` - 优势

* `HOC`通过外层组件通过`Props`影响内层组件的状态，而不是直接改变其`State`不存在冲突和互相干扰，这就降低了耦合度
* `HOC`具有天然的层级结构（组件树结构），这又降低了复杂度

#### `HOC` - 劣势

* **扩展性限制**: `HOC`无法从外部访问子组件的`State`，因此无法通过`shouldComponentUpdate`滤掉不必要的更新，`React`在支持`ES6 Class`之后提供了`React.PureComponent`来解决这个问题。
* **`Ref` 传递问题**: `Ref` 被隔断，后来的`React.forwardRef` 来解决这个问题。
* **`Wrapper Hell`**: `HOC`可能出现多层包裹组件的情况，多层抽象同样增加了复杂度和理解成本。
* **命名冲突**: 如果高阶组件多次嵌套，没有使用命名空间的话会产生冲突，然后覆盖老属性。
* **不可见性**: `HOC`相当于在原有组件外层再包装一个组件，你压根不知道外层的包装是啥，对于你是黑盒。

#### `Render Props` - 优势

* 上述`HOC`的缺点`Render Props`都可以解决

#### `Render Props` - 劣势

* **使用繁琐**: `HOC`使用只需要借助装饰器语法通常一行代码就可以进行复用，`Render Props`无法做到如此简单。
* **嵌套过深**: `Render Props`虽然摆脱了组件多层嵌套的问题，但是转化为了函数回调的嵌套。

#### `Hooks` - 优势

* **简洁**: `React Hooks`解决了`HOC`和`Render Props`的嵌套问题，更加简洁。
* **解耦**: `React Hooks`可以更方便地把 `UI` 和状态分离，做到更彻底的解耦。
* **组合**: `Hooks` 中可以引用另外的 `Hooks`形成新的`Hooks`，组合变化万千。
* **函数友好**: `React Hooks`为函数组件而生，从而解决了类组件的几大问题:
  * `this`指向容易错误
  * 分割在不同声明周期中的逻辑使得代码难以理解和维护
  * 代码复用成本高（高阶组件容易使代码量剧增）

#### `Hooks` - 劣势

* 额外的学习成本（`Functional Component` 与 `Class Component` 之间的困惑）
* 写法上有限制（不能出现在条件、循环中），并且写法限制增加了重构成本
* 破坏了`PureComponent`、`React.memo`浅比较的性能优化效果（为了取最新的`props`和`state`，每次`render()`都要重新创建事件处理函数）
* 在闭包场景可能会引用到旧的`state`、`props`值
* 内部实现上不直观（依赖一份可变的全局状态，不再那么“纯”）
* `React.memo`并不能完全替代`shouldComponentUpdate`（因为拿不到 `state change`，只针对 `props change`）

### `React Fiber`架构解析

## `Redux`

## `React-Router`
