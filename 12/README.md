# ESnext 夜点心：利用 JSON.parse 提高代码解析速度

今天的夜点心我们关注一些 ES 的性能细节：对象的创建速度。

先说结论：通过 JSON.stringify 创建 JS 对象的速度要显著快于直接通过 JS 字面量来创建对象。

这个乍一听很不自然的该结论不仅适用于最主流的 V8 引擎，对其他绝大多数 JS 引擎也都适用。下面我们就来看一看这其中的玄妙，相信你会渐渐发现这件事其实没有那么令人意外。

## 快多少

下面的数据来自 goo.gle/json-parse-bench，列出了 4 种解析器下 JSON.parse 比原生解析快多少的比较，v8 下快 1.7 倍，其他解析器从 1.2 倍到 2 倍不等。

![image 12-1](./assets/12-1.png)

## 为什么

下面的例举了两段等价的对象创建逻辑，一段是直接通过 JS 字面量实现的，另一段通过 `JSON.parse` 函数：

``` js
const literalCreated = {
  category: '前端夜点心',
  topic: 'JSON.parse',
  author: '哔哔机',
  order: 12,
};

const jsonParseCreated = JSON.parse(`{
  "category": "前端夜点心",
  "topic": "JSON.parse",
  "author": "哔哔机",
  "order": 12
}`);
```

literalCreated 的创建方式是我们日常开发中常用的方式，更自然且简单易读。

jsonParseCreated 的做法则看起来多此一举——先在脑子里把对象序列化成字符串，再用 JSON.parse 来解析，缺乏高亮提示，非常难读，竟然据说还更快？

是的。更快的根本原因有二：解析成本与解析成本

### 解析成本一：更多需要标记的对象

对于 JS 解析器来说，创建 literalCreated 需要标记（tokenize）包括整个对象，和内部所有的键和值在内的共 9 个对象。而创建 jsonParseCreated 而言，只需要标记一个作为入参的字段串对象。在对象变得更为复杂的情况下，前者的创建方式需要标记的对象数量也会不断增加，后者则始终只需要标记一个字段串。

### 解析成本二：更少的可能性

JSON.parse 的编译过程远比 JS 的编译过程简单。

例如当 JSON.parse 方法解析到一个 `{` 时，它知道这只会是两种可能：「创建一个对象」或「不合法的字符串」。

而当 JS 的解析器遇到一个 `{` 时，他面临的可能性就多得多：

- 一个字面量对象：

``` js
const y = { x: 778 };
```

- 一个对之前变量名的引用：

``` js
const x = 778;

const y = { x };
```

- 一个解构赋值：

``` js
const { x } = { x: 778 };
```

- 一个函数参数解构：

``` js
const f = ({ x }) => x;
```

这么多的潜在可能性让解析器必须先阅读部分的其余代码才能推断当前这个 `{` 的含义。这必然会显著减慢解析速度。

## 应用到日常开发中

在开发中全面应用 JSON.parse 来创建对象可以带来一定的性能提升。一个 Redux app 中的案例将 TTI 时间优化了 18%。

当然作为程序员，我们不会傻到写源码的时候就一遍遍地在脑子里先序列化要创建的对象然后把它通过 JSON.parse 包裹起来，这样繁琐易错还不易读。

可以通过 webpack 和 babel 的相关工具来帮助我们完成对源码的转换优化：

- goo.gle/json-parse-webpack
- goo.gle/json-parse-babel

## 扩展阅读

- [Faster apps with JSON.Parse](https://medium.com/@samichkhachkhi/faster-apps-with-json-parse-9759ef9efce)
- [GitHub: JSON.parse benchmark](https://github.com/GoogleChromeLabs/json-parse-benchmark)

