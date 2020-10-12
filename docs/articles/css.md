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

### 什么是层叠上下文

### 什么是层叠等级

### 如何产生层叠上下文

### 什么是层叠顺序

### CSS3中的属性对层叠上下文的影响

## 浮动

### 浮动是什么

### 浮动有哪些特点

### 浮动有哪些缺点

### 如何清除浮动

## 经典布局

### 圣杯布局

#### 实现一：margin

#### 实现二：flex

### 双飞翼布局

#### 实现一：flex

#### 实现二：grid

## Flex

### 轴

#### 主轴

#### 交叉轴

### 容器

#### 父容器

#### 子容器

## Grid

### 行和列

### 单元格

### 网格线

### 容器和项目

#### 容器属性

#### 项目属性

## LESS

### 嵌套规则

### 变量

### 混合（mixins）

### 运算

### 命名空间

### 引入

### !important

### 条件表达式

### 循环

### 合并属性

### 函数库
