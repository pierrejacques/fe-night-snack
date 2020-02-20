# ESnext 夜点心：带问号的语法糖

今天的夜点心关于 ECMAScript 的两个带有 `?` 新提案，它们都是 2019 年进入草案的语法糖

## Optional chaining

`optional chaining` 可以被直译为「可选链式取值」，有四种语法结构:

- 对象静态可选取值：`obj?.prop`
- 对象可选表达式取值：`obj?.[exp]`
- 数组可选索引：`arr?.[index]`
- 函数可选调用：`func?.(args)`

这些语法大同小异（后面的三种写法的 `.` 不要忘了哦），本质都是帮助我们减少一些判断值是否是 `null` 或者 `undefined` 的条件语句的书写。例如面对一个大对象，原本的取值方式：

``` js
console.log(obj !== null && obj !== undefined ? obj.prop : undefined)
```

就可以简化为

``` js
console.log(obj?.prop);
```

上面的两条语句是完全等同的。在这里不再举更多语法结构的例子，相信大家应该可以很快掌握这种简单好用的式子。下面罗列了一些 `optional chaining` 语法的逻辑细节：

- 返回 `undefined`：只要 `?` 前的值是 `null` 或者 `undefined`，表达式就返回 `undefined`。即没有办法通过它来区分两者：

``` js
null?.someProp === undefined // true
```

- 不作函数检查：作为函数可选调用方式使用时并不会帮你检查是不是函数，而仅仅是检查是否是 `null` 或者 `undefined`，因而直接调用一个不是函数的值仍会报错：

``` js
1?.(); // TypeError: 1 is not a function
```

- 语法短路：同三元表达式或逻辑符 `||` 和 `&&` 一样，在遇到 `null` 或 `undefined` 之后便产生短路，不再执行后续的表达式，直接返回 `undefined`：

``` js
const getPropName = () => {
  console.log('executed');
  return 'a';
};

null?.[getPropName()]; // 通过 IIFE 返回 1

// 控台没有输出
```

## Nullish coalescing operator

Nullish coalescing operator 可翻译为「空位合并运算符」，语法形式为 `??` 是一个有点类似 `||` 的合并符。我们通过一个例子来解释它的作用：

例如我们需要在界面上展示一个数值，在数值不存在的时候展示 '--'，应该怎么写呢？`value || '--'` 是不行的，因为在 `value` 等于 `0` 时也展示了 `'--'`，而 `0` 显然是合法的数值。这时就要用把 `||` 替换为 `??`：表达式 `value ?? '--'` 仅会在 `value` 的值为 `null` 或者 `undefined` 是才返回 `'--'`，否则都直接返回 `value`。

下面是一些更多的例子

``` js
false ?? true // false
0 ?? '--' // 0
null ?? '--' // '--'
```

下面是一些语法细节：

- 语法短路：同 `||` 和 `&&` 一样，`??` 也会造成语法短路，在没有碰到空值的情况下不会执行后面的表达式

``` js
const foo = () => console.log('executed');

1 ?? foo();

// 控台没有输出
```

- 不可混用：`??` 禁止与 `||` 或 `&&` 直接混用，会造成语法错误！不过可以通过括号来将他们「隔开」

``` js
null || undefined ?? 'foo'; // SyntaxError: Unexpected token '??'
true && false ?? 'foo'; // SyntaxError: Unexpected token '??'

(null || undefined) ?? 'foo'; // 'foo'
true && (false ?? 'foo'); // 'foo'
```

## 浏览器支持

作为新草案，这两个带问号的语法糖的浏览器支持并不好，在五大浏览器的最新版中都还有一般没有支持。

但从更为实际的层面，babel 已经为他们出了转码插件：

- @babel/plugin-proposal-optional-chaining
- @babel/plugin-proposal-nullish-coalescing-operator

这两个特新也被支持进了 Typescript 3.7 中

不过 nodeJS 对这两项特性目前还都不支持。

## 扩展阅读

- [Optional chaining - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [Nullish coalescing operator - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)
