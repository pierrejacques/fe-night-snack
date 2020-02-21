# ESnext 夜点心：带问号的语法糖

今天的夜点心关于 ECMAScript 的两个带有 `?` 的新提案。

## Optional chaining

`optional chaining` 可以被直译为「可选链式取值」，有四种语法结构:

- 对象静态属性：`obj?.prop`
- 对象动态属性：`obj?.[exp]`
- 数组索引：`arr?.[index]`
- 函数调用：`func?.(args)`

这些写法大同小异（后面的三种写法的 `.` 不要忘了哦），本质都是帮助我们减少一些判断值是否是 `null` 或者 `undefined` 的条件语句的书写。这样面对一个对象，原本的安全取值逻辑：

``` js
console.log(obj !== null && obj !== undefined ? obj.prop : undefined)
```

就可以简化为

``` js
console.log(obj?.prop);
```

且逻辑完全等价。

无需更多的例子，相信大家已经基本学会这种语法。下面罗列了一些 optional chaining 容易被忽略的语法细节：

- **返回 `undefined`**：无论 `?` 前的值是 `null` 还是 `undefined`，表达式都会返回 `undefined`，即没有办法通过它来区分两者：

``` js
null?.someProp === undefined // true
```

- **不做函数检查**：进行函数可选调用时，这种语法并不会帮你检查是不是函数，而仅仅是检查是否是 `null` 或者 `undefined`，因而直接调用一个不是函数的值仍会报错：

``` js
1?.(); // TypeError: 1 is not a function
```

- **短路**：同逻辑符 `||` 和 `&&` 一样，这种新语法在 `?` 前遇到 `null` 或 `undefined` 之后便会产生短路，不再执行后续的表达式，直接返回 `undefined`：

``` js
const getPropName = () => {
  console.log('executed');
  return 'a';
};

null?.[getPropName()];

// 控台没有输出 'a'
```

## Nullish coalescing operator

Nullish coalescing operator 可直译为「空位合并运算符」，语法形式为 `exp1 ?? exp2` 是一个有点类似 `||` 的合并符，它仅会在 `exp1` 的值为 `null` 或 `undefined` 时计算并返回 `exp2` 的值：

例如我们需要在界面上展示一个数值，在数值不存在的时候展示 '--'，应该怎么写呢？`value || '--'` 是不行的，因为在 `value` 等于 `0` 时也展示了 `'--'`，而 `0` 显然是合法的数值。这时使用 `value ?? '--'` 就会很合适。

更多例子：

``` js
false ?? true // false
0 ?? '--' // 0
null ?? '--' // '--'
```

下面是一些语法细节：

- **短路**：同 `||` 和 `&&` 一样，`??` 在没有碰到空值的情况下不会执行后面的表达式

``` js
const foo = () => console.log('executed');

1 ?? foo();

// 控台没有输出 'executed'
```

- **混用报错**：`??` 禁止与 `||` 或 `&&` 直接混用，会造成语法错误！不过可以通过括号来将他们「隔开」

``` js
null || undefined ?? 'foo'; // SyntaxError: Unexpected token '??'
true && false ?? 'foo'; // SyntaxError: Unexpected token '??'

(null || undefined) ?? 'foo'; // 'foo'
true && (false ?? 'foo'); // 'foo'
```

## 浏览器支持

作为草案，这两个带问号的语法糖的浏览器支持并不好，五大浏览器的最新版都还有一半没有支持它们，nodeJS 对这两项特性目前还都不支持。

但在更为实际的开发层面，babel 已经为他们出了转码插件：

- @babel/plugin-proposal-optional-chaining
- @babel/plugin-proposal-nullish-coalescing-operator

Typescript 也从 3.7 开始支持这两个特性。

所以只要使用合理的转码工具，还是可以通过它们来简化我们的源码的。

## 扩展阅读

- [Optional chaining - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [Nullish coalescing operator - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator)
