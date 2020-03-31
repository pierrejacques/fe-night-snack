# TypeScript 夜点心：条件范型

今天的夜点心来谈一谈怎么写 TS 中的条件范型

## 问题

在 [函数式夜点心：Monad](../6/README.md) 中我们提到过 `Promise` 的 `then` 方法是一种同时承载了 `map` 和 `chain` 功能的方法

- `map` 功能：当接收的函数的返回值的类型不是 `Promise` 时，返回包含了该值的 `Promise`
- `chain` 功能：当接受的函数返回值的类型是 `Promise` 时，直接返回该值

现在假设我们需要实现一个名为 `promisify` 函数，它的功能有些类似 `then` 方法：接受一个值，如果它已经是 `Promise` 了，就直接返回；如果不是，就把它包在一个 `Promise` 中返回。这个需求实现起来不难：

``` ts
function promisify<T> (input: T) {
  if (input instanceOf Promise) {
    return input;
  }
  return Promise.resolve(input);
}
```

上面的实现通过范型 `T`，声明了入参 `input` 的类型。而Typescript 通过自己的类型推导，只能得出 `promisify` 的返回类型是 `(T & Promise<any>) | Promise<T>` ，并不能像我们的函数逻辑那样，知道应该在 T 是 Promise 的时候返回 T 类型，否则返回 `Promise<T>` 类型。这样类型的定义与函数的逻辑没有匹配上，会使得 `promisify` 函数变得很难用：我们不得不每次都手动断言它的返回类型，繁琐且易错。

为了让 TypeScript 能够根据入参的类型自动判断出出参的类型，我们需要用到条件范型：

## 条件范型

条件范型通过类似三元表达式的 `extends ? :` 的结构和 `infer` 关键字，帮助我们写出能够根据条件成立与否进行类型转换的工具范型。

`T extends U ? A : B` 的结构判断一个类型 `T` 是否是类型 `U` 的子类型，是则返回 `A`，不是返回 `B`，例如：

``` ts
type Condition<T> = T extends { name: string } ? string : number;

type Test1 = Condition<{ name: string; value: number }>; // string
type Test2 = Condition<{ value: number }>; // number;
```

通过条件范型的三元表达式结构，我们很快就能解决上面提到的问题：

``` ts
function promisify<T> (input: T): T extends Promise ? T : Promise<T> {
  // 函数的具体实现
}
```

### infer 关键字

现在假设我们的需求变得更复杂了一点，需要把 Promise 中的值包在一个 { value: T } 的结构中返回，像下面实现的这样，那么它的返回类型又应该怎么声明呢？

``` ts
function promisify2<T> (input: T) {
  if (input instanceof Promise) {
    return input.then(value => ({ value }));
  }
  return Promise.resolve({ value: input });
}
```

这时仅仅使用 `extends ? :` 的结构就不够了。因为当 `T` 是 `Promise` 的子类型时，我们需要从 `T` 中「抽取」出它的范型 `U` 并把它重新包装起来返回出来。即假设 `T = Promise<U>`,我们需要获得 `U`。这时就需要用到 `infer` 关键词：`infer`，infer 意为推断，可以用来解构提取我们需要的类型，用法很简单：

- 在 `extends` 和 `?` 之间使用 `infer`
- 把 `infer {类型变量名}` 放置在需要提取的类型的位置
- 在 `?` 和 `:` 之间使用推断得到的类型变量来构造需要返回的类型

如下的 `Unpromise` 条件范型就在 T 是 Promise 时通过 `infer` 关键字提取了 Promise 的范型

``` ts
type Unpromise<T> = T extends Promise<infer U> ? U : T;

type Test1 = Unpromise<number>; // number
type Test2 = Unpromise<Promise<string>>; // string
```

通过 `infer` 我们就能够完成上面 `promisify2` 函数的返回类型的声明：

``` ts
function promisify2<T>(
  input: T
): T extends Promise<infer U> ? Promise<{ value: U }> : Promise<{ value: T }>
{
  // 具体的实现
};
```

上述的类型声明因为逻辑的复杂化变得冗长而难读，我们可以通过适当的类型拆解来优化它的可读性，同时也能提高类型的复用性：

``` ts
type Container<T> = Promise<{ value: T }>;
type Unpromise<T> = T extends Promise<U> ? U : T;

function promisify2<T>(input: T): Container<Unpromise<T>> {
  // 具体的实现
}
```

## 更多例子：

``` ts
// 提取数组项的类型
type Unarray<T> = T extends (infer U)[] ? U : never;

// 提取函数的返回值类型（TS 已内置）
type ReturnType<T> = T extends ((...params: any[]) => infer U) ? U : never;

// 提取函数的入参类型（TS 已内置）
type Parameters<T> = T extends ((...params: P) => infer P) ? P : never;

// 元组第一项的类型，可用在 Hooks 风格的 React 组件中
type Head<T> = T extends [infer H, ...any[]] ? H : never;
```

上面这些例子中的 `never` 可以类比函数中的 `void` 来理解，相当于不符合条件则不返回任何类型。

以上就是「条件范型」的相关内容。条件范型使得范型具有函数一般的灵活性，方便我们定义出与实现逻辑更为匹配的类型，写出更优雅强大的 TS 代码。

## 扩展阅读

- [Conditional Types in TypeScript](https://mariusschulz.com/blog/conditional-types-in-typescript)
