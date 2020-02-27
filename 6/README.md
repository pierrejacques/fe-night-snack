# 函数式夜点心：Monad

今天的夜点心关于函数式编程中的 Monad 函子

函数式编程（下面简称 FP），往往被前端们拿来主义地用来解决一些「局部困难」：如使用 `rxjs` 来处理订阅流；如使用高阶组件来复用逻辑。它在充斥着副作用的应用中默默承担着一个工具的角色，帮上一点小忙，却不太受重视，还时常被曲解。

「函数式夜点心」系列希望从动机出发，剥去一些干扰视听的细节和定义，介绍一些 FP 中的概念。希望籍此能让笔者和大家一起对 FP 的优势和困境有更深入的认识。

今天要介绍的概念 Monad （可译作「单子函子」）是为了解决「函数组合」和「异常处理」这两个问题而引入的概念。

## 问题描述

现有如下两个函数 `f` 和 `g`，它们都输入一个数字并输出一个数字。我们不关心他们的逻辑细节，而仅通过一种简洁的方式来声明他们的输入输出类型：

``` hs
f::Number -> Number

g::Number -> Number
```

现在我们希望把他们组合起来，得到一个新的函数 `h`，让它也成为一个输入数字输出一个数字的函数：

``` hs
h::Number -> Number
```

这很简单，构造一个用于组合函数的 `compose` 工具函数就可以了，比如像下面这样：

``` ts
let compose = (func1, func2) => x => func1(func2(x))

let h = compose(g, f);
```

## 异常处理的问题

上面的函数 `f`, `g`, `h` 看起来一切正常，但是我们不能保证输入到它们的值一定合法，有可能输入空值导致报错。FP 认为异常处理不应该打断一段逻辑的执行，所以采用 try-catch 语句来抓错是不可行的。为了做到在处理异常的同时不打断执行，我们需要通过一种「容器」将函数的结果包装起来，用来标明一个结果是不是存在异常。这里我们把这种容器命名为 `Maybe`，因为它具有某种未知性。这个容器可以具有如下类似我们熟悉的 AJAX 响应数据的结构：

``` ts
interface Maybe<T> { // Maybe 的结构可以像一个 AJAX 请求的响应数据一样
  error?: boolean; // error 表明执行过程是不是有异常
  data?: T; // 成功时返回的执行结果
}
```

现在我们就可以改造 `f` 和 `g` 两个函数，让它们返回包含了数字结果的 `Maybe` 结构。*下面声明中的 `Maybe Number` 代表包装了数字类型的 `Maybe` 容器*：

``` hs
mf::Number -> Maybe Number

mg::Number -> Maybe Number
```

于此同时我们希望由他们组合得到的 `mh` 函数也具有相同的输入输入出类型：

``` hs
mh::Number -> Maybe Number
```

这时原来的组合函数 `compose` 就不能满足把 `mf` 和 `mg` 组合成 `mh` 的需求了，因为 `mf` 的返回结果是 `Maybe` 类型的，不能直接输入给接收数字的 `mg` 处理。我们需要一个新的组合函数，姑且把它称作 `mcompose`，先不用关心它的实现，只要知道它能够把 `mf` 和 `mg` 组合成 `mh` 就行了：

``` ts
let mh = mcompose(mg, mf);
```

到这里，对于一些函数式语言而言，其实我们已经实现了所谓的 Monad：在对上面我们定义的结构 `Maybe` 实现了 `mcompose` 操作之后，`Maybe` 就成为一个 Monad 了，就是这么简单。

但对于 ES 而言，我们还是需要将上述的组合过程改写为链式调用的形式来方便大家理解。把 `mf` 和 `mg` 组合成 `mh` 的逻辑改写成如下的链式结构：

``` ts
let mh = x => Maybe.of(x).chain(mf).chain(mg)
```

这里的 `Maybe` 在原先持有 `data` 和 `error` 字段的基础上获得了一些额外的方法：

- `of` 方法把输入一个数字，输出包装持有该数字的一个 `Maybe` 结构
- `chain` 方法通过输入的函数（该函数符合 `Number -> Maybe Number` 的结构），对自身持有的值进行处理，输出一个持有新的结果的 `Maybe` 实例

此外我们的 `Maybe` 还需要实现一个 `map` 方法，来方便我们将原来输出数字的 `f` 和 `g` 转为为输出 `Maybe` 的 `mf` 和 `mg`：

``` ts
let mf = x => Maybe.of(x).map(f)
let mg = x => Maybe.of(x).map(g)
```

好了！像上面这样实现了 `of`, `map`, `chain` 方法且能够持有值的对象，就被称为 Monad。它能帮助我们解决「函数组合」和「异常处理」的问题，让我们可以自由安全地组合逻辑，做到函数粒度的逻辑复用：

``` ts
mh(null) // { error: true };
mh(1) // { data: {正确的返回值} };
mh(1).chain(mh) // 自我组合
mh(1).chain(
  x => Maybe.of(x).map(x => x + 1)
); // 是不是有点流的感觉了
```

## ES 原生的 Monad

在原生的 ECMAScript 语言中有没有 Monad 呢？我们熟知的 `Array` 就是一个，只是它的动机不在「异常处理」，而且它实现的链式方法不叫 `chain` 而叫 `flatMap`，下面以 `Array` 为例替换上文中的 `Maybe`：

``` ts
let f = x => x + 1
let g = x => x ** 2

let mf = x => Array.of(x).map(f)
let mg = x => Array.of(x).map(g)

let mh = x => Array.of(x).flatMap(mf).flatMap(mg);
```

`Array` 作为 Monad 为我们提供了「批量处理数据」和「组合逻辑」的能力。

那另一个重要的 ES 对象 `Promise` 是否关于 `then` 方法成为 Monad 的呢？答案是否定的，根本原因在于，`Promise` 的 `then` 即可以像 `map` 那样直接处理类似上面 `f` 这样的函数，又能像 `chain` 那样处理 `mf` 那样的函数，它混淆了两个概念，这样的混淆会造成一些原本在其他 Monad 上成立的「重构等式」在 `Promise` 上不成立，故严格来说，不能把它算作 Monad *（详见 [stackoverflow - Why are Promises Monads?](https://stackoverflow.com/questions/45712106/why-are-promises-monads) 下的第一个回答）*。

最后，**Monad 是流的雏形**。各种流式框架的核心结构都是 Monad ，例如 rx 中的 `Observable`，xstream 中的 `XStream`，而 most 框架的名字就是由 Monadic Stream 的首字母 mo 和 st 构成的。

## 补充

为了方便解释，文中简化和减少一些概念，在这里做一下补充：

- 文中几处用来描述函数类型的语法是一种叫做 Hindley–Milner 的类型系统
- 真正的 `Maybe` 不会像文中那样定义成响应体的结构，而是被分解为两个构造器 `Just` 和 `Nothing`，前者用来包含结果，后者用来表示异常。如在 Haskell 中可以定义为 `data Maybe a = Just a | Nothing`。有的语言或框架把这种异常处理的结构命名为 `Either`，分为 `Right` （正常）和 `Left` （异常）两个构造器：`data Either a = Right a | Left`。
- 在 Haskell 中，上面的 `mcompose` 方法等同于操作符 `>=>` ，类似的 Monad 操作符还有 `>>=`, `>>`，都是与具体的 Monad 分离的方法。这表明我们并不需要把数据和方法绑定在一起才能让 Monad 成立，只是在 ES 等多范式语言中，通过类来实现 Monad 是最自然的方式。
- Monad 其实是以一系列概念作为基础的，这些概念相互继承，每一层会增加一些特性，文中把特性都集中直接到了 Monad 身上： Context（持有数据）=> Pointed Container（持有 of 方法）=> Functor（持有 map 方法）=> Monad（持有 chain 方法）。而对 `chain` 的定义是：`M a -> (a -> M b) -> b`，即可以将一个包装了 `a` 类型的结构通过具有 `a -> M b` 的结构函数，映射得到一个包装了 `b` 类型的结构。

点下方原文链接，可以在 github 中看到对 `Maybe` ES 的实现

## 扩展阅读

- [JavaScript Monads Made Simple](https://medium.com/javascript-scene/javascript-monads-made-simple-7856be57bfe8)
- [Functors, Applicatives, And Monads In Pictures](http://adit.io/posts/2013-04-17-functors,_applicatives,_and_monads_in_pictures.html)
- [An Intuitive Introduction to Monads in Under 10 Minutes](https://www.youtube.com/watch?v=Nq-q2USYetQ)
