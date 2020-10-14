# 必知必会：CSS

![css](/css.jpg)

## 盒模型

CSS的盒模型是CSS的基础，同时也是难点，属于经典问题了。我们可以认为每个html标签都是一个方块，然后这个方块又包着几个小方块，如同盒子一层层的包裹着，这就是所谓的盒模型。

![盒模型](/css-box.png)

盒模型分为IE盒模型和W3C标准盒模型。

### W3C标准盒模型

> **box-sizing: content-box**

属性`width`、`height`只包含内容`content`，不包含`padding`和`border`。

![content-box](/content-box.png)

### IE盒模型

> **box-sizing: border-box**

属性`width`、`height`包含内容`content`，且包含`padding`和`border`，`content + padding + border`。

![content-box](/border-box.png)

## BFC

### 什么是BFC

`BFC`为`Block Formatting Context`的简写，简称为“**块级格式化上下文**”，`BFC`为浏览器渲染某一区域的机制，`CSS2.1` 中只有`BFC`和`IFC`, `CSS3`中还增加了`GFC`和`FFC`。

* `BFC`（Block Formatting Context ）:块级格式化上下文
* `IFC`(CSS2.1)：Inline Formating Contexts，内联元素格式化上下文
* `GFC`(CSS3):GridLayout Formating Contexts，网格布局格式化上下文
* `FFC`(CSS3):Flex Formatting Contexts，自适应格式化上下文

### 如何创建BFC

下列方式会创建**块格式化上下文**：

1. 根元素（`<html>`）
2. **浮动元素**（元素的 `float` 不是 `none`）
3. **绝对定位元素**（元素的 `position` 为 `absolute` 或 `fixed`）
4. **行内块元素**（元素的 `display` 为 `inline-block`）
5. **`overflow`** 值不为 `visible` 的块元素
6. **弹性元素**（`display` 为 `flex` 或 `inline-flex` 元素的直接子元素）
7. **网格元素**（`display` 为 `grid` 或 `inline-grid` 元素的直接子元素）
8. 表格单元格（元素的 `display` 为 `table-cell`，`HTML`表格单元格默认为该值）
9. 表格标题（元素的 `display` 为 `table-caption`，`HTML`表格标题默认为该值）
10. 匿名表格单元格元素（元素的 `display` 为 `table`、`table-row`、 `table-row-group`、`table-header-group`、`table-footer-group`（分别是HTML `table`、`row`、`tbody`、`thead`、`tfoot` 的默认属性）或 `inline-table`）
11. `display` 值为 `flow-root` 的元素
12. `contain` 值为 `layout`、`content` 或 `paint` 的元素
13. 多列容器（元素的 `column-count` 或 `column-width` 不为 `auto`，包括 `column-count` 为 1）

### BFC的布局规则

* 内部的`Box`会在垂直方向，一个接一个地放置。
* `Box`垂直方向的距离由`margin`决定。属于同一个`BFC`的两个相邻`Box`的`margin`会发生重叠。
* 每个盒子（块盒与行盒）的`margin box`的左边，与包含块`border box`的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。
* `BFC`的区域不会与`float box`重叠。
* `BFC`就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。
* 计算`BFC`的高度时，浮动元素也参与计算。

### BFC的作用

#### 利用`BFC`避免margin重叠

根据上面的规则可以知道，属于同一个`BFC`的两个相邻的`Box`会发生`margin`重叠，所以可以通过设置不同的`BFC`来避免`margin`重叠。

#### 自适应两栏布局

根据规则 **`BFC`的区域不会与`float box`重叠**，所以可以通过左边块 `float:left`，右边块 `overflow:hidden`，实现自适应两栏布局。

#### 清除浮动

当我们不给父节点设置高度，子节点设置浮动的时候，会发生高度塌陷，这个时候我们可以通过设置父节点的BFC来清除浮动，因为 **计算`BFC`的高度时，浮动元素也参与计算**。

## 层叠上下文

由于页面中会有很多不同的元素层叠在一起，但是用户只能看到最上层的元素，我们可以将用户与屏幕之间的这个方向称为`Z轴`，如下图：

![zIndex](/zIndex.png)

`Z轴`上层级越高代表离用户越近，但是很多人存在一些误解，认为`z-index`值越大，在`Z轴`上就越靠上，但是这其中存在以下两个问题：

1. `z-index`属性值仅在定义了`position`属性且值为非`static`的元素上才有效果。
2. 判断元素在`Z轴`上的堆叠顺序，不仅仅是直接比较两个元素的`z-index`值的大小，这个堆叠顺序实际上由`层叠上下文`、`层叠等级`共同决定。

### 什么是层叠上下文

**层叠上下文**(`stacking context`)，是HTML中一个三维的概念。在`CSS2.1`规范中，每个盒模型的位置是三维的，分别是平面画布上的`X轴`，`Y轴`以及表示层叠的`Z轴`。一般情况下，元素在页面上沿`X轴``Y轴`平铺，我们察觉不到它们在`Z轴`上的层叠关系。而一旦元素发生堆叠，这时就能发现某个元素可能覆盖了另一个元素或者被另一个元素覆盖。

如果一个元素含有**层叠上下文**，(也就是说它是层叠上下文元素)，我们可以理解为这个元素在`Z轴`上就“高人一等”，最终表现就是它离屏幕观察者更近。

### 什么是层叠等级

**层叠等级**(`stacking level`)，叫“层叠级别”或者“层叠水平”也行。

1. 在同一个层叠上下文中，它描述定义的是该层叠上下文中的层叠上下文元素在Z轴上的上下顺序。
2. 在其他普通元素中，它描述定义的是这些普通元素在Z轴上的上下顺序。

上面两条看着没啥区别，但并不能将它们合并混为一谈。

1. **普通元素的层叠等级优先由其所在的层叠上下文决定**。
2. **层叠等级的比较只有在当前层叠上下文元素中才有意义**。**不同层叠上下文中比较层叠等级是没有意义的**。

### 什么是层叠顺序

**层叠顺序**英文称作`stacking order`。表示元素发生层叠时候有着特定的垂直显示顺序，注意，这里跟上面两个不一样，上面的`层叠上下文`和`层叠等级`是概念，而这里的**层叠顺序是规则**。

**在CSS3还没有出现的时候**（注意这里的前提），层叠顺序规则遵循下面这张图：

![层叠顺序](/stack-order.png)

上图包含一些关键信息：

1. 位于最低水平的`border/background`指的是层叠上下文元素的边框和背景色。每一个层叠顺序规则适用于一个完整的层叠上下文元素。
2. `inline-block`和`inline`水平元素是同等level级别。
3. `z-index:0`实际上和`z-index:auto`单纯从层叠水平上看，是可以看成是一样的。**两者在层叠上下文领域有着根本性的差异**。

> 大家有没有想过，为什么内联元素的层叠顺序要比浮动元素和块状元素都高？为什么呢？我明明感觉浮动元素和块状元素要更屌一点啊。

请看下图：

![stack-order-1](/stack-order-1.png)

当然了，上面说的这些层叠顺序规则还是老时代的，如果把`CSS3`也牵扯进来，呵呵，事情就不一样了。

### 务必牢记的层叠准则

1. **谁大谁上**：当具有明显的层叠水平标示的时候，如识别的`z-index`值，在同一个层叠上下文领域，层叠水平值大的那一个覆盖小的那一个。通俗讲就是官大的压死官小的。
2. **后来居上**：当元素的层叠水平一致、层叠顺序相同的时候，在DOM流中处于后面的元素会覆盖前面的元素。

### 层叠上下文的特性

层叠上下文的主要特征如下：

1. 层叠上下文的层叠水平要比普通元素高。
2. 层叠上下文可以阻断元素的混合模式。
3. 层叠上下文可以嵌套，内部层叠上下文及其所有子元素均受制于外部的层叠上下文。
4. 每个层叠上下文和兄弟元素独立，也就是当进行层叠变化或渲染的时候，只需要考虑后代元素。
5. 每个层叠上下文是自成体系的，当元素发生层叠的时候，整个元素被认为是在父层叠上下文的层叠顺序中。

### 如何创建层叠上下文

如同块状格式化上下文，层叠上下文也基本上是有一些特定的CSS属性创建的。总结起来有3种途径：

1. 页面根元素天生具有层叠上下文，称之为**根层叠上下文**。
2. **`z-index`值为数值**的定位元素的**传统层叠上下文**。
3. 其他CSS3属性

#### 根层叠上下文

指的是页面根元素，也就是滚动条的默认的始作俑者`<html>`元素。这就是为什么，绝对定位元素在`left`/`top`等值定位的时候，如果没有其他定位元素限制，会相对浏览器窗口定位的原因。

#### 定位元素与传统层叠上下文

对于包含有`position:relative`/`position:absolute`的定位元素，当其z-index值不是auto的时候，会创建层叠上下文。

#### CSS3与新时代的层叠上下文

* 父元素`display:flex`或者`display:inline-flex`，子元素的`z-index`不是`auto`是数值，此时**子元素为层叠上下文元素**；
* 元素的`opacity`值不是`1`；
* 元素的`transform`值不是`none`；
* 元素`mix-blend-mode`值不是`normal`；
* 元素的`filter`值不是`none`；
* 元素的`isolation`值是`isolate`；
* `will-change`指定的属性值为上面任意一个；
* 元素的`-webkit-overflow-scrolling`设为`touch`；

## 浮动

当元素浮动以后可以向左或向右移动，直到它的外边缘碰到包含它的框或者另外一个浮动元素的边框为止。元素浮动以后会脱离正常的文档流，所以文档的普通流中的框就变现的好像浮动元素不存在一样。

### 浮动有哪些特点

1. 在图文混排的时候可以很好的使文字环绕在图片周围。
2. 当元素浮动了起来之后，它有着块级元素的一些性质例如可以设置宽高等，但它与inline-block还是有一些区别的:
   * 横向排序的时候，float可以设置方向而inline-block方向是固定的
   * inline-block在使用时有时会有空白间隙的问题

### 浮动有哪些缺点

最明显的缺点就是浮动元素一旦脱离了文档流，就无法撑起父元素，会造成父级元素高度塌陷。

### 如何清除浮动

1. **使用空标签**：给所有浮动标签后面添加一个空标签，标签属性`clear:both`，缺点是需要添加无意义的标签
2. **触发父级元素为BFC元素**
3. **使用after伪元素清除浮动**（该方法只适用于非IE浏览器）

```css
#parent:after{
  content:".";
  height:0; /*必须设置height:0,不然该元素会比实际元素高出若干像素。*/
  visibility:hidden;
  display:block;
  clear:both;
}
```

## Flex

> flex其实非常简单好用。在小程序、webapp、混合app上，官方都是推荐使用flex来实现自适应的布局。

![flex](/flex.png)

采用Flex布局的元素，称为**Flex容器**`container`。它的所有子元素自动成为容器成员，称为**Flex项目**`item`。

容器中默认存在两条轴，**主轴**(`main axis`) 和**交叉轴**(`cross axis`)。项目默认沿主轴排列。单个项目占据的主轴空间叫做`main size`，占据的交叉轴空间叫做`cross size`。

> **任何容器都能指定Flex布局**：设置了 `flex` 布局之后，子元素的 `float`、`clear`、`vertical-align` 的属性将失效

### 容器的属性

#### flex-direction：主轴的方向

```css
.container {
  flex-direction: row | row-reverse | column | column-reverse;  
}
```

![flex-direction](/flex-direction.png)

#### flex-wrap：容器内项目是否可换行

```css
.container {  
  flex-wrap: nowrap | wrap | wrap-reverse;
}  
```

主轴为水平方向时，表现如下：

![flex-wrap](/flex-wrap.png)

#### flex-flow：flex-direction 和 flex-wrap 集合

```css
.container {
  flex-flow: <flex-direction> <flex-wrap>;
}
```

#### justify-content：主轴方向项目的对齐方式

```css
.container {
  justify-content: flex-start | flex-end | center | space-between | space-around;
}
```

主轴为水平方向时，表现如下：

![justify-content](/justify-content.png)

#### align-items：交叉轴上项目的对齐方式

```css
.container {
  align-items: flex-start | flex-end | center | baseline | stretch;
}
```

主轴为水平方向时，表现如下：

![align-items](/align-items.png)

#### align-content：多根轴线指定对齐方式

> 如果项目只有一根轴线`flex-wrap: nowrap`，该属性将不起作用

```css
.container {
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
}
```

主轴为水平方向时`flex-direction: row`，`flex-wrap: wrap`，表现如下：

![align-content](/align-content.png)

### 项目的属性

#### order：项目在容器中的排列顺序

> 数值越小，排列越靠前，默认值为 0

```css
.item {
    order: <integer>;
}
```

![flex-order](/flex-order.png)

#### flex-grow：项目放大比例

> 默认为0，即如果存在剩余空间，也不放大

```css
.item {
  flex-grow: <number>; /* default 0 */
}
```

存在剩余空间时表现如下：

![flex-grow](/flex-grow.png)

#### flex-shrink：项目缩小比例

> 默认为1，即如果空间不足，该项目将缩小

```css
.item {
  flex-shrink: <number>; /* default 1 负值对该属性无效 */
}
```

存在空间不足时表现如下：

![flex-grow](/flex-shrink.png)

#### flex-basis：项目占据的主轴空间

> 浏览器根据这个属性，计算主轴是否有多余空间,默认值为auto，即项目的本来大小

```css
.item {
    flex-basis: <length> | auto; /* default auto */
}
```

* 主轴为水平方向的时候，`flex-basis`的值会让项目的宽度设置失效
* `flex-basis`需要配合`flex-grow`和`flex-shrink`使用,但`flex-grow`和`flex-shrink`只有一个会起作用(不可能既放大又缩小)
* 它可以设为跟`width`或`height`属性一样的值（比如350px），则项目将占据固定空间

翻译过来就是：**当存在剩余空间下，优先分配`flex-basis`不为`auto`的项目后，再分配剩余空间**

#### align-self：指定项目和其他项目不一样的对齐方式

CSS 属性 `align-self` 会对齐当前 flex 行中的元素，并覆盖已有的 `align-items` 的值。

```css
.item {
   align-self: auto | flex-start | flex-end | center | baseline | stretch; /* default auto */
}
```

## LESS

`LESS`是`CSS`预处理语言，是`CSS`的扩展。

**特点：**

* 写样式更简单：嵌套
* 使用方便：变量、运算、函数
* 学习成本低：语法

### 语法

保留CSS的基础语法，并进行了扩展

```less
@import "reset.css" //less在编译时不会变动css文件
@import "base" //less导入其他less文件时可以省略文件格式
@import url("base.less") //less也可以使用url形式导入，但是必须有后缀
```

### 运算

在`less`中，可以在书写属性时直接进行加减乘除

例子：header插入了一个padding

```less
@fullWidth: 1200px;
.header{
  width: @fullWidth – 20px * 2;
  padding: 0px 20px*2;
}
```

### 变量

#### 格式：以@开头

```less
@headergray: #c0c0c0;
@fullWidth: 1200px;
@logoWidth: 35%;
```

#### 字符串插值

```less
@name: banner;
background: url("images/@{name}.png") no-repeat;
```

编译:

```css
background: url("images/banner.png") no-repeat;
```

#### 避免编译

```less
background: ~"red";
```

编译:

```css
background: red;
```

#### 移动端rem布局中的使用

```less
@fullWidth: 750;
@toRem: unit(@fullWidth/10,rem);
header{
  height: 150/@toRem;
}
```

编译:

```css
header{
  height: 2rem;
}
```

### 混合

#### 在一个类中继承另一个类

```less
.class1{
  color: red;
}
.class2{
  background: green;
  .class1;
}
```

编译:

```css
.class1{
  color: red;
}
.class2{
  background: green;
  color: red;
}
```

#### 用&替换当前选择器

```less
a{
  color: #000;
  &:hover{
    color: #f00;
  }
}
```

编译:

```css
a{
  color: #000;
}

a:hover{
  color: #f00;
}
```

#### 在父类中嵌套子类

```less
.class1{
  p{
    span{
      a{ }
    }
    &:hover{  }
  }
  div{  }
}
```

编译:

```css
.class1{ }
.class1 p{ }
.class1 p span{ }
.class1 p span a{ }
.class1 p:hover{ }
.class1 div{ }
```

#### 带参混合

```less
.color(@color=red){
  color: @color;
}
.class1{
  .color(#0f0);
}
.class2{
  .color();
}
```

编译:

```css
.class1{
  color: #0f0;
}
.class2{
  color: red;
}
```

#### 块定义

```less
@demo: {
  color: #f00;
}
body {
  @demo()
}
```

编译:

```css
body {
  color: #f00;
}
```

### 函数

### 使用JS表达式
