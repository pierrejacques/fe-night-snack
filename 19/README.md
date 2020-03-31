# Typescript 夜点心：常量断言

今天的夜点心我们来谈谈 TS 中的常量断言

常量断言（语法写作 `as const`）是 Typescript 3.4 （现在的最新版本是 3.8.3）发布的新特性中最实用的一个，在我们的第一篇夜点心 [Typescript夜点心：类型推断的策](../1/README.md) 中我们就介绍过，TS 会区别对待可修改和不可修改的值的类型推断：

例如下面的 `immutableString` 会被推断成单值类型 `'Acid Mother Temple'`
而 `mutableString` 则会被推断成通用的 `string` 类型

``` ts
const immutableString = 'Acid Mother Temple';

let mutableString = 'Robert Fripp';
```

而在一般的对象中，由于对象的属性都具有可修改性，TS 都会对它们「从宽」类型推断，例如下面的 `prop` 的类型被推断为 `string`：

``` ts
const obj = {
  prop: 'David Bowie'
};
```

## 问题

这样的类型推断策略在大部分的情形下比较通用，但在个别情形下会显得有些棘手。例如我们想实现一个 React 中的自定义 Hook。这个 Hook 能通过 Ref 维护一个状态。它的返回值与 `useState` 类似是一个元组：第一项是该状态的值，第二项是该状态的 setter

``` ts
import { useRef } from 'react';

const useRenderlessState = <S>(initialState: S) => {
  const stateRef = useRef(initialState);

  const state = stateRef.current;

  const setState = (nextState: S) => stateRef.current = nextState;

  return [state, setState];
}
```

此时我们会发现上面 Hook 的返回值的类型被推导成了如下的数组类型：

``` ts
(S | ((nextState: S) => S))[]
```

这让我们无法对它进行准确的解构：

``` ts
// 组件中使用
const [value, setValue] = useRenderlessState(1);
```

上面的 `value` 和 `setValue` 都被推导成了 `number | (nextState: number) => number` 的联合类型。

在 3.4 以前的 TS 中，我们只能通过对输出值的声明或者断言来明确 Hooks 的返回值类型是元组（Tuple）而不是数组（Array）：

- 声明的做法

``` ts
const useRenderlessState = <S>(initialState: S): [S, (nextValue: S) => S] => {/*...*/}

```

- 断言的做法

``` ts
const useRenderlessState = <S>(initialState: S) => {
  // ...
  return [state, setState] as [typeof value, typeof setValue];
}
```

## as const

上面的两种写法都各有冗余成分，算不上优雅。

其实从语义层面来分析，TS 之所以没能将返回值推断为元组类型是因为它认为该返回值仍有可能被 push 值，被修改。所以我们真正需要做的是告诉 TS，这个返回值是一个 final，其本身和属性都是不可篡改的，而这正是常量断言所做的事

常量断言可以把一个值标记为一个不可篡改的常量，从而让 TS 以最严格的策略来进行类型推断：

``` ts
const useRenderlessState = <S>(initialState: S) => {
  // ...
  return [state, setState] as const
}
```

这下 `useRenderlessState` 的返回类型就被推断成了如下的 `readonly` 值：

``` ts
readonly [S, (nextState: S) => S]
```

无论是语法层面还是语义层面都准确而无冗余，可以说是最佳实践了。

## 两个 const 的区别

`as const` 中的 const 与我们声明常量时使用的 `const` 有什么区别和联系呢？其实两者无论是语法还是语义，都相当不同：

- `const` 常量声明是 ES6 的语法，对 TS 而言，它只能反映该常量本身是不可被重新赋值的，它的子属性仍然可以被修改，故 TS 只会对它们做松散的类型推断
- `as const` 是 TS 的语法，它告诉 TS 它所断言的值以及该值的所有层级的子属性都是不可篡改的，故对每一级子属性都会做最严格的类型推断

例如下面字面量对象的第二层属性仍被推断成了 `1967` 这样的单值类型而不是宽泛的 `number` 类型，其类型推断结果与字面量声明几乎长得一模一样。

``` ts
const albumsByStyle = {
  psychodelic: {
    'magical-mystery-tour': 1967,
    'the-piper-at-the-gates-of-dawn': 1967,
  },
  glam: {
    'a-night-at-the-opera': 1975,
    'diamond-dogs': 1974,
  }
} as const;
```

所以笔者认为其实 `as const` 写作 `as readonly` 或 `as final` 更能准确反映它的语义和行为

## 用作枚举

常量断言可以让我们不需要 `enum` 关键字就能定义枚举对象：

``` ts
const EnvEnum = {
  Development: 'dev',
  Production: 'prod',
  Testing: 'test',
} as const
```

在使用该枚举对象时我们需要先实现一个 `ValueOf` 工具范型来帮助我们获取得到所谓的「枚举类型」：

``` ts
type ValueOf<T> = T[keyof T];

type EnvEnumType = ValueOf<typeof EnvEnum>;

const env: EnvEnumType = EnvEnum.Development;
```

上面的用法可能显得脱裤子放屁，不过也算是常量断言的一种巧用，而且他带来了比使用 `enum` 更多的可能性

以上就是常量断言的相关内容，它可以帮我们把 TS 代码写的更准确简洁。

最后，如果你在本文所举的例子中发现了一些你所熟悉但本不该属于这里的名字，你可以点击下面的链接关注一下，不会让你失望的😊 [虾米音乐人-丘瑙底河](https://www.xiami.com/artist/yi3sXv13c46)

---

## 扩展阅读

- [const assertions are the killer new TypeScript feature](https://blog.logrocket.com/const-assertions-are-the-killer-new-typescript-feature-b73451f35802/)
