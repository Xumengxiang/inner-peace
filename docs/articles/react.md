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

#### `React v15`存在的问题

`React`在进行组件渲染时，从`setState`开始到渲染完成整个过程是同步的（“一气呵成”）。如果需要渲染的组件比较庞大，`js`执行会占据主线程时间较长，会导致页面响应度变差，使得`React`在动画、手势等应用中效果比较差。

##### 卡顿原因

`Stack reconciler`的工作流程很像函数的调用过程。父组件里调子组件，可以类比为函数的递归（这也是为什么被称为`stack reconciler`的原因）。在`setState`后，`React`会立即开始`reconciliation`过程，从父节点（`Virtual DOM`）开始遍历，以找出不同。将所有的`Virtual DOM`遍历完成后，`reconciler`才能给出当前需要修改真实`DOM`的信息，并传递给`renderer`，进行渲染，然后屏幕上才会显示此次更新内容。对于特别庞大的`vDOM`树来说，`reconciliation`过程会很长(`x00ms`)，在这期间，主线程是被`js`占用的，因此任何交互、布局、渲染都会停止，给用户的感觉就是页面被卡住了。

#### `React v16`的解决思路

为了解决这个问题，`React`团队经过两年的工作，重写了`React`中核心算法——`reconciliation`。并在`v16`版本中发布了这个新的特性。为了区别之前和之后的`reconciler`，通常将之前的`reconciler`称为`stack reconciler`，重写后的称为`fiber reconciler`，简称为`Fiber`。

#### `Fiber`的原理

##### Scheduler

`scheduling`(调度)是`fiber reconciliation`的一个过程，主要决定应该在何时做什么。在`stack reconciler`中，`reconciliation`是“一气呵成”，对于函数来说，这没什么问题，因为我们只想要函数的运行结果，但对于UI来说还需要考虑以下问题：

* 并不是所有的`state`更新都需要立即显示出来，比如屏幕之外的部分的更新
* 并不是所有的更新优先级都是一样的，比如用户输入的响应优先级要比通过请求填充内容的响应优先级更高
* 理想情况下，对于某些高优先级的操作，应该是可以打断低优先级的操作执行的，比如用户输入时，页面的某个评论还在`reconciliation`，应该优先响应用户输入

所以理想状况下`reconciliation`的过程应该是像下图所示一样，每次只做一个很小的任务，做完后能够“喘口气儿”，回到主线程看下有没有什么更高优先级的任务需要处理，如果有则先处理更高优先级的任务，没有则继续执行(`cooperative scheduling` 合作式调度)。

![Scheduler](/scheduler.jpg)

##### 任务拆分

**`Stack reconciler`**：代码中创建（或更新）一些元素，`react`会根据这些元素创建（或更新）`Virtual DOM`，然后`react`根据更新前后`virtual DOM`的区别，去修改真正的`DOM`。注意，在`stack reconciler`下，`DOM`的更新是同步的，也就是说，在`virtual DOM`的比对过程中，发现一个`instance`有更新，会立即执行`DOM`操作。

**`Fiber reconciler`**：操作是可以分成很多小部分，并且可以被中断的，所以同步操作`DOM`可能会导致`fiber-tree`与实际`DOM`的不同步。对于每个节点来说，其不光存储了对应元素的基本信息，还要保存一些用于任务调度的信息。因此，`fiber`仅仅是一个对象，表征`reconciliation`阶段所能拆分的最小工作单元，和上图中的`react instance`一一对应。通过`stateNode`属性管理`Instance`自身的特性。通过`child`和`sibling`表征当前工作单元的下一个工作单元，`return`表示处理完成后返回结果所要合并的目标，通常指向父节点。**整个结构是一个链表树**。每个工作单元（`fiber`）执行完成后，都会查看是否还继续拥有主线程时间片，如果有继续下一个，如果没有则先处理其他高优先级事务，等主线程空闲下来继续执行。

## `Redux`

`Redux`的几个核心概念：

* **`Store`**：保存数据的地方，你可以把它看成一个容器，整个应用只能有一个`Store`。
* **`State`**：`Store`对象包含所有数据，如果想得到某个时点的数据，就要对`Store`生成快照，这种时点的数据集合，就叫做`State`。
* **`Action`**：`State`的变化，会导致`View`的变化。但是，用户接触不到`State`，只能接触到`View`。所以，`State`的变化必须是`View`导致的。`Action`就是`View`发出的通知，表示`State`应该要发生变化了。
* **`Action Creator`**：`View`要发送多少种消息，就会有多少种`Action`。如果都手写，会很麻烦，所以我们定义一个函数来生成`Action`，这个函数就叫`Action Creator`。
* **`Reducer`**：`Store`收到`Action`以后，必须给出一个新的`State`，这样`View`才会发生变化。这种`State`的计算过程就叫做Reducer。Reducer是一个函数，它接受`Action`和当前`State`作为参数，返回一个新的`State`。
* **`dispatch`**：是`View`发出`Action`的唯一方法。

### `Redux`的工作流程

![redux-flow](/redux-flow.png)

1. 用户（通过`View`）发出`Action`，发出方式就用到了`dispatch`方法。
2. `Store`自动调用`Reducer`，并且传入两个参数：当前`State`和收到的`Action`，`Reducer`会返回新的`State`
3. `State`一旦有变化，`Store`就会调用监听函数，来更新`View`。

### `React-Redux`

#### 入口文件

* `Provider`的作用是从最外部封装了整个应用，并向`connect`模块传递`store`

```jsx
// 文件路径：@/index.js
import React from 'react';
import { render } from 'react-dom';
import { browserHistory, Router } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import store from '@/store';
import routes from '@/routes';

const history = syncHistoryWithStore(browserHistory, store);

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root'),
);
```

#### `store`文件

* 通过`createStore`创建store
* 通过`applyMiddleware`接入`redux-thunk`中间件

```jsx
// 文件路径：@/store
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '@/reducers';

export default createStore(rootReducer, applyMiddleware(thunk));
```

#### `reducer`文件

* 通过`combineReducers`将各个子模块的reducer合并

```jsx
// 文件路径：@/reducers
import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import home from './home';
import user from './user';
import base from './base';

export default combineReducers({
  routing,
  home,
  user,
  base,
});
```

#### `action`文件

```jsx
// 文件路径：@/actions/user
export const getUserInfo = user => (dispatch) => {
  dispatch({ type: 'GET_USER_INFO', ...user });
};
```

#### 组件

* 通过`connect`连接`React`组件和`Redux`，实现以下功能：
  * 获取`state`: `connect`通过`context`获取`Provider`中的`store`，通过`store.getState()`获取整个`store tree`上所有`state`
  * 包装原组件: 将`state`和`action`通过`props`的方式传入到原组件内部`wrapWithConnect`返回一个`ReactComponent`对象`Connect`，`Connect`重新`render`外部传入的原组件`WrappedComponent`，并把`connect`中传入的`mapStateToProps`, `mapDispatchToProps`与组件上原有的`props`合并后，通过属性的方式传给`WrappedComponent`
  * 监听`store tree`变化: `connect`缓存了`store tree`中`state`的状态,通过当前`state`状态和变更前`state`状态进行比较,从而确定是否调用`this.setState()`方法触发`Connect`及其子组件的重新渲染

```jsx
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getUserInfo } from '@/actions/user';

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
    props.getUserInfo({ userId: '123', token:'123' });
  }

  render() {
    return (<div>组件</div>);
  }
}

const mapStateToProps = state => ({
  user: state.user,
});
const mapDispatchToProps = {
  getUserInfo,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Index);
```

### `React-Redux`中如何进行异步操作

* 直接在`componentDidmount`进行请求，无需借助`redux`
* 借助`redux`中间件

### `Redux`中间件比较

#### `redux-thunk`

**优点：**

* 体积小: redux-thunk的实现方式很简单,只有不到20行代码
* 使用简单: redux-thunk没有引入像redux-saga或者redux-observable额外的范式,上手简单

**缺陷：**

* 样板代码过多: 与redux本身一样,通常一个请求需要大量的代码,而且很多都是重复性质的
* 耦合严重: 异步操作与redux的action偶合在一起,不方便管理
* 功能孱弱: 有一些实际开发中常用的功能需要自己进行封装

#### `redux-saga`

**优点：**

* 异步解耦: 异步操作被被转移到单独`saga.js`中，不再是掺杂在`action.js`或`component.js`中
* `action`摆脱`thunk function: dispatch`的参数，依然是一个纯粹的`action (FSA)`，而不是充满 “黑魔法”`thunk function`
* 异常处理: 受益于 `generator function` 的 `saga`实现，代码异常/请求失败 都可以直接通过 try/catch 语法直接捕获处理
* 功能强大: `redux-saga`提供了大量的`Saga`辅助函数和`Effect`创建器供开发者使用，开发者无须封装或者简单封装即可使用
* 灵活: `redux-saga`可以将多个`Saga`可以串行/并行组合起来，形成一个非常实用的异步`flow`
* 易测试: 提供了各种`case`的测试方案，包括`mock task`，分支覆盖等等

**缺陷：**

* 额外的学习成本: `redux-saga`不仅在使用难以理解的`generator function`，而且有数十个`API`,学习成本远超`redux-thunk`，最重要的是你的额外学习成本是只服务于这个库的，与`redux-observable`不同，`redux-observable`虽然也有额外学习成本但是背后是和`rxjs`一整套思想
* 体积庞大: 体积略大,代码近2000行，min版25KB左右
* 功能过剩: 实际上并发控制等功能很难用到,但是我们依然需要引入这些代码
* `ts`支持不友好: `yield`无法返回TS类型

#### `redux-observable`

**优点：**

* 功能最强: 由于背靠`rxjs`这个强大的响应式编程的库,借助`rxjs`的操作符,你可以几乎做任何你能想到的异步处理
* 背靠`rxjs`: 由于有`rxjs`的加持,如果你已经学习了`rxjs`，`redux-observable`的学习成本并不高,而且随着`rxjs`的升级redux-observable也会变得更强大

**缺陷：**

* 学习成本奇高: 如果你不会`rxjs`，则需要额外学习两个复杂的库
* 社区一般: `redux-observable`的下载量只有`redux-saga`的1/5，社区也不够活跃，在复杂异步流中间件这个层面`redux-saga`仍处于领导地位

## `React-Router`

前端路由是现代SPA应用必备的功能，每个现代前端框架都有对应的实现，例如`vue-router`、`react-router`。我们在这里不去探究`vue-router`或者`react-router`的实现，因为不管是哪种路由无外乎用兼容性更好的`hash`实现或者是`H5 History`实现，与框架匹配只需要做相应的封装即可。

### `Hash`路由

```jsx
class Routers {
  constructor() {
    // 储存hash与callback键值对
    this.routes = {};
    // 当前hash
    this.currentUrl = '';
    // 记录出现过的hash
    this.history = [];
    // 作为指针,默认指向this.history的末尾,根据后退前进指向history中不同的hash
    this.currentIndex = this.history.length - 1;
    this.refresh = this.refresh.bind(this);
    this.backOff = this.backOff.bind(this);
    // 默认不是后退操作
    this.isBack = false;
    window.addEventListener('load', this.refresh, false);
    window.addEventListener('hashchange', this.refresh, false);
  }

  route(path, callback) {
    this.routes[path] = callback || function() {};
  }

  refresh() {
    this.currentUrl = location.hash.slice(1) || '/';
    if (!this.isBack) {
      // 如果不是后退操作,且当前指针小于数组总长度,直接截取指针之前的部分储存下来
      // 此操作来避免当点击后退按钮之后,再进行正常跳转,指针会停留在原地,而数组添加新hash路由
      // 避免再次造成指针的不匹配,我们直接截取指针之前的数组
      // 此操作同时与浏览器自带后退功能的行为保持一致
      if (this.currentIndex < this.history.length - 1)
        this.history = this.history.slice(0, this.currentIndex + 1);
      this.history.push(this.currentUrl);
      this.currentIndex++;
    }
    this.routes[this.currentUrl]();
    console.log('指针:', this.currentIndex, 'history:', this.history);
    this.isBack = false;
  }
  // 后退功能
  backOff() {
    // 后退操作设置为true
    this.isBack = true;
    this.currentIndex <= 0
      ? (this.currentIndex = 0)
      : (this.currentIndex = this.currentIndex - 1);
    location.hash = `#${this.history[this.currentIndex]}`;
    this.routes[this.history[this.currentIndex]]();
  }
}
```

### `History`路由

```jsx
class Routers {
  constructor() {
    this.routes = {};
    // 在初始化时监听popstate事件
    this._bindPopState();
  }
  // 初始化路由
  init(path) {
    history.replaceState({path: path}, null, path);
    this.routes[path] && this.routes[path]();
  }
  // 将路径和对应回调函数加入hashMap储存
  route(path, callback) {
    this.routes[path] = callback || function() {};
  }

  // 触发路由对应回调
  go(path) {
    history.pushState({path: path}, null, path);
    this.routes[path] && this.routes[path]();
  }
  // 监听popstate事件
  _bindPopState() {
    window.addEventListener('popstate', e => {
      const path = e.state && e.state.path;
      this.routes[path] && this.routes[path]();
    });
  }
}
```

### 路由切换动画

我们可以借助`React`的官方动画库`react-transition-group`来实现路由切换动画。

示例如下：

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import { Container, Navbar, Nav } from 'react-bootstrap'
import Home from './pages/home'
import About from './pages/about'
import Contact from './pages/contact'
import './styles.css'

const routes = [
  { path: '/', name: 'Home', Component: Home },
  { path: '/about', name: 'About', Component: About },
  { path: '/contact', name: 'Contact', Component: Contact },
]

function Example() {
  return (
    <Router>
      <>
        <Navbar bg="light">
          <Nav className="mx-auto">
            {routes.map(route => (
              <Nav.Link
                key={route.path}
                as={NavLink}
                to={route.path}
                activeClassName="active"
                exact
              >
                {route.name}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar>
        <Container className="container">
          {routes.map(({ path, Component }) => (
            <Route key={path} exact path={path}>
              {({ match }) => (
                <CSSTransition
                  in={match != null}
                  timeout={300}
                  classNames="page"
                  unmountOnExit
                >
                  <div className="page">
                    <Component />
                  </div>
                </CSSTransition>
              )}
            </Route>
          ))}
        </Container>
      </>
    </Router>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<Example />, rootElement)
```
