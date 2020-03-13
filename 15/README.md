# CSS 夜点心：类名范式一览

今天的夜点心我们来回顾几种常见的 CSS 的类名范式

- OOCSS
- BEM
- SMACSS
- ACSS

CSS 的特性不断增强，预编译框架也层出不穷，但是即使使用 cssModules 这样的 scope 技术，我们仍需要一些范式来指导我们在局部更规范合理地给类取名字。

上面介绍的范式都不是什么新鲜事物，有的甚至相当有历史了，回顾他们主要目的在于帮助我们抬起头来重新想一想当初为什么我们选择了某一种范式（比如 BEM）来进行我们的类命名：

不同的范式的侧重不同，有些范式可以相互兼容组合，有些不能。他们大都是为了达成以下目标诞生的：

- 避免类名冲突
- 准确传达语义
- 提高样式复用率，减少代码量
- 实现样式拆分，控制各部分的影响面

而同时它们也大都就以下几点达成了共识：

- 避免使用 id 和标签作为样式锚点
- 避免使用 !important
- 避免关联标签与类名，如：`div.header` 或 `h1.title`
- 避免使用层级选择器，如：`.sidebar .title`

下面我们就来逐一回顾这些 CSS 范式，在文末我们还会附赠两个控制选择器权重的小技巧：

## OOCSS

> Object-oriented CSS，即「面向对象的 CSS」

OOCSS 提倡对类进行必要的分离，以提高复用性，减少 CSS 代码量。这种范式主张将样式类按照以下两个纬度进行拆分：

- 结构（Structrue）或布局（Layout） 与 皮肤（Skin）或主题（Theme）分离：
- 容器（Container）与 内容（Content）分离：

这样的分离方式在较早的前端工程中时常能见到，有时会为不同的分层建立单独的样式表，如 layout.css, theme.css 等
随着前端工程组件化的普及，这种分离逐渐少见。但对于大型的组件库项目，仍能带来不少的好处。

## BEM

> block element modifier，即「区块 元素 状态」

BEM 制定了一套统一的类名命名规则：`{区块名}__{元素名}--{状态名}`，例如一个卡片的类命名：

``` html
<div class="people-card" >
    <h2 class="people-card__title" >卡片标题</h2>
    <div class="people-card__content" >内容</div>
    <footer class="people-card__footer">
        <a class="people-card__link">详情</a>
        <a class="people-card__link people-card__link--disabled">分享</a>
    </footer>
</div>
```

BEM 加强了 HTML 的语义化，令代码更易读易维护。
由于命名规则与组件化的工程架构契合度较高，使得它成为目前比较流行的类命名方式。
通过与组件命名保持同步，例如给页面组件加上 `v-` 的前缀，给 UI 组件加上 `c-` 的前缀，可以一定程度上规避类名冲突的问题（当然如果配合使用 scope 技术就更完美了）：

另一方面我们也要看到 BEM 的劣势：

- 对 HTML 结构有一定的依赖性
- 类名过长，有时看起来会比较丑，并会稍稍增大样式表的大小
- 几乎没有复用性可言，要减小样式表大小只能再度跟组件联手，利用组件按需加载来减少首屏渲染的样式表大小

## SMACSS

> Scalable and Modular Architecture for CSS，即「CSS 的可扩展模块化架构」

这也是一种对样式进行拆分的范式。它有两个核心目标：

- 加强 HTML 和内容的语义
- 弱化对特定 HTML 结构的依赖

与其他范式不同的是 SMACSS 并不很强调不能使用 id 和层级选择器作为选择器，认为只要合适就行。与 OOCSS 类似，SMACSS 将类按职能分为以下 5 种：

- Base: 基础标签的默认样式 (html, body, h1, ul 等)，一般是重置
- Layout: 大块的布局，可以 id 作为选择器
- Module: 可复用的组件模块
- State: 特定状态下的样式 (hidden 或 expanded, active/inactive)
- Theme: 整站的一个主题

对上述的类别，往往需要遵循特定的命名方式，例如下面这样：

- Base: 无需命名，直接用标签作为选择器
- Layout: `l-` 或 `layout-` 前缀
- State: `is-` 前缀，如 `.is-active` ，`.is-hidden`
- Module: 可以不加前缀，也可以对相关的 module 加特定的前缀来方便组织

SMACSS 的分层方式其实在日常业务中常常会有所借鉴，一个典型的例子就是一般项目都会用一个 reset.css 来「归一化」不同平台的样式以及设置一些全局通用的样式，这就是 Base 层。

## ACSS

> Atomic CSS，即「原子 CSS」

提倡样式属性粒度的复用，如 `.di { display: inline }` `.fl { float: left }` 这样。
早期的 CSS UI 库如 Bootstrap 时常能见到这样的类名：`.lg .col-2 .btn` 等等。
现在，在具备 CSS 预处理器的工程中，Atomic 的思路可以用作样式基础层，组合到更大的类中去。

比如与 BEM 结合，嵌套使用：

``` css
.people-card__link {
    .fl;
}
```

借助预编译工具，我们可以从最小粒度的样式开始，一层一层组织更大粒度的样式层次。
例如下面的 ACSS 风格的 less 文件目录，从「夸克」到「原子」到「分子」，组建了一个工程的样式基础，实现了极大程度的复用：

``` text
atomic-structuring/
├── atoms
│   ├── _button.less
│   ├── _flag.less
│   ├── _grids.less
│   └── _media.less
├── molecules
│   ├── _banner.less
│   ├── _custom-post.less
│   ├── _footer-nav.less
│   └── _heading-group.less
├── quarks
│   ├── _links.less
│   ├── _lists.less
│   ├── _paragraphs.less
│   └── _tables.less
└── utilities
    ├── _base-spacing.less
    ├── _clearfix.less
    └── _reset.less
```

以上就是 CSS 类名范式相关的内容。也许你会发现，其实跟 JS 编程范式一样，你项目中的 CSS 架构往往也是几种范式的有机组合，而非完全执着于某一种理念。

## 附：CSS优先级Hack技巧

有时我们不得不使用 id 来作为选择器，有时我们不得不加重选择器的权重来覆盖第三方库的样式。下面是针对这两个问题的有用的小技巧。

- 通过属性选择器 `[id='{targetId}']` 替代 `#{targetId}` 以获得与 `.{className}` 相同优先级的选择器
- 通过自我重复的方式来提高一个选择器的优先级：的方式 `.{className}.{className}`

## 扩展阅读

- [An Introduction To Object Oriented CSS](https://www.smashingmagazine.com/2011/12/an-introduction-to-object-oriented-css-oocss/)
- [BEM 101](https://css-tricks.com/bem-101/)
- [What is SMACSS?](https://vanseodesign.com/css/smacss-introduction/)
- [OOCSS, ACSS, BEM, SMACSS: what are they? What should I use?](https://clubmate.fi/oocss-acss-bem-smacss-what-are-they-what-should-i-use/#SMACSS—Scalable_and_Modular_Architecture_for_CSS)
