# 测试夜点心：通过 JSDOM 来模拟浏览器环境

今天的夜点心我们来谈谈前端单测中的一个不可或缺的工具库：jsdom

node 环境与浏览器环境的一个主要区别是 document 和 window 对象的缺失。尽管现代的前端开发中源码对 DOM 和 BOM 的直接操作往往非常有限，但在单元测试层面，他们的存在是必不可少的——可以用来重建一个特定的浏览器版本；用来还原一种特定的缓存状态；用来断言一个模块运行后产生的副作用等等。

因此相比运行环境可控的后端，在测试脚本的运行的 node 环境中模拟浏览器环境是前端单元测试中的关键点之一。

如下面的函数能够把一个值从浏览器的 localStorage 中取出，并把赋给指定的 DOM 节点：

``` js
function dumFunction(key, id) {
  const cache = localStorage.getItem(key);
  document.getElementById(id).textContent = cache;
}
```

由于这个函数是通过对浏览器环境的副作用来实现其功能的，在 node 环境下测试它会有些困难。

## JSDOM

JSDOM 诞生在这种情形下，它顾名思义就是通过纯 JS 实现的 DOM 对象，不过它的范畴其实远大于 DOM，官方对它的描述是：

> a pure-JavaScript implementation of many web standards, notably the WHATWG DOM and HTML Standards, for use with Node.js

「针对 node 环境通过纯 JS 实现的一系列 web 标准」

JSDOM 对浏览器环境的还原是如此的真实以至于他可以被当作无头浏览器使用。

下面的这段代码就演示了 JSDOM 是如何在 node 环境下偷天换日，硬生生模拟出一个浏览器的世界来的：

``` js
const { JSDOM } = require('jsdom');

const jsDomIntance = new JSDOM(`
  <!DOCTYPE html>
  <body>
    <p id="root">夜点心的大本营</p>
  </body>
`)

const window = jsDomIntance.window; // window 对象
const document = window.document; // document 对象

console.log(
  document.getElementById('root').textContent
); // 夜点心的大本营
```

通过一段字符串格式的 HTML 文本来创建一个 JSDOM 的实例，然后就可以通过这个实例取得 window 对象和 document 对象，并查询到我们通过 HTML 声明的 DOM 节点。

此外，JSDOM 生成的 window 对象下还实现了如 history, localStorage, sessionStorage, location, postMessage, setTimeout, setInterval 等一众我们熟悉的 API，通过这些 API，我们就能对文章开头的 dumFunction 开展测试了：

``` js
test('dum function', () => {
  // 创建 JSDOM，获得 window 对象
  const { window } = new JSDOM(`<div id="dum-id" ></div>`);

  // 将被测函数需要用到的变量挂到全局
  global.localStorage = window.localStorage;
  global.document = window.document;

  const key = 'cache-key';
  const id = 'dum-id';

  // 设置缓存状态
  const value = 'DUM_VALUE';
  localStorage.setItem(key, value);

  // 运行被测函数
  dumFunction(key, id);

  // 断言
  expect(document.getElementById(id).textContent)
  .toBe(value);
})
```

上面的测试脚本开起来一切合理，但实际运行的时候却报错了：

``` txt
[DOMException [SecurityError]: localStorage is not available for opaque origins
```

产生这个报错的原因是因为我们在构造 JSDOM 实例时没有设置 URL，从而引发了 localStorage 操作时安全策略方面的问题。解决的办法就是在实例化 JSDOM 的时候在第二个配置参数中传入指定的 URL，即：

``` js
const { window } = new JSDOM(`
  <div id="dum-id" ></div>
`, {
  url: 'http://some.dum.site'
});
```

这下测试脚本就能顺利执行了。

因为 jsdom 在前端单元测试中的普遍有效，一般主流的测试框架都集成了开箱即用的 jsdom 能力且会比我们手动挂载到 global 对象上的做法更好用，可以直接在测试代码中访问到 window 等全局变量。

## URL 问题

jsdom 能满足大部分测试场景下对浏览器环境的还原，但也存在一些常见测试场景下的坑点，一个典型的例子就是在 jsdom 环境下调用 history.push, location.reload 这样的方法，或是给 location.href 赋值都会引发如下报错，这可以说是一个著名的雷区：

``` text
Error: Not implemented: navigation (except hash changes)
```

一般来说在单元测试中，我们有两类场景需要使用到 URL 相关的 API：

- 调整当前的 URL 以 mock 特定的测试环境
- 验证被测模块是否发起了 URL 跳转

对前一种场景，可以直接在创建 jsDom 实例的时候指定 URL，也可以通过已创建的 jsDom 实例的 reconfigure 方法来调整 URL：

``` js
jsdom.reconfigure({
  url: 'https://some.really.dum.url'
})
```

\* 注，通过 reconfigure 来修正当前的 URL 是较新的 API，更早的 jsdom 版本中可通过专门的 changeURL 函数来修改当前的 URL，该 API 现已废弃。

也可以使用 JSDOM 提供的 fromURL 方法来快速创建一个 JSDOM 实例以避免全局修改 URL 带来的副作用：

``` js
const { JSDOM } = require('jsdom');

JSDOM.fromUrl('https://fast.dum.url').then(dom => {
  console.log(
    dom.window.location.href
  ); // https://fast.dom.url
})
```

对后一种场景，一个简单粗暴的做法就是把 jsdom 实例中的 location 和 history 对象简单地替换为你自己 mock 的模块，例如：

``` js
// 删除原对象
delete window.location;

// 添加 mock 对象
window.location = {
  reload: jest.fn(),
}

// 运行被测模块
runTest();

// 断言
expect(window.location.reload).toBeCalled();
```

然而如果被测模块用到了 location 或 history 对象提供的一些原生功能（如 location 的 URL 解析能力），同时也会修改 location.href 以实现 URL 跳转的话，事情就变得很棘手。坦白说，到目前为止笔者还没有找到一种能在充分保全 location 模块的功能的情况下完美绕开 navigation 问题的方式。

一种思路是通过 npm 上的一些基于 node 实现 location 和 history 的库来替换 jsdom 中的 location，不过这些对象一般都是个人维护的，很多时候不太靠谱。如 npm 上的 location 库，mock-location 库，都不具备根据 href 解析 hash，origin 等字段的功能，这也属于基于 jsdom 的前端单测中的著名痛点了。

---

以上粗略介绍了一些关于 jsdom 的使用场景，jsdom 库还包含了丰富的 API 来模拟资源请求，cookie 存储等情况，这里就不再赘述了。

jsdom 让我们在 node 环境执行前端代码成为可能，不过总的来说直接基于 jsdom 进行单元测试的大都是比较底层的模块，如是一些 utility 模块，下一期的测试夜点心，我们将介绍如何对前端组件开展单元测试。

## 扩展阅读

- [JSDOM: A Guide to How to Get Started and What You Can Do](https://www.testim.io/blog/jsdom-a-guide-to-how-to-get-started-and-what-you-can-do/)
