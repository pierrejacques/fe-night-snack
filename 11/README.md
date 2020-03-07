# 函数式夜点心：异步流程与 Task 函子

今天的夜点心继续昨天的话题，谈一谈函数式编程中的异步数据流处理。

在介绍异步函子之前，首先需要了解 Monad 函子和 IO 函子的概念，可以参考之前的 [函数式夜点心：Monad](../6/README.md) 和 [函数式夜点心：IO Monad 与副作用处理](../10/README.md) 进行了解。

昨天的文章中，IO 函子通过推迟执行的方式来实现对副作用的管理和隔离。而今天要讨论的异步流程本身就是关于逻辑的推迟执行的，所以下面要介绍的异步流程函子 Task 就是在 IO 函子的基础上稍作改写而成的：

## Task 函子

Task 函子通过类似 `Promise` 的 `resolve` 的风格来声明一个异步流程，例如下面的 `requestTask` 包裹了一个请求 HTTP 接口的流程：

``` js
const requestTask = Task(resolve => http.get('some/url').then(resolve));
```

与 `IO` 的推迟执行一样，上面声明的 `requestTask` 并没有真正发起请求，它只声明了一个请求动作，这个动作并没有被执行。

在这个动作的基础上，我们可以通过 `map` 方法来为他添加后续的数据操作流程。

例如，我们可以基于 `requestTask` 组合产生两个不同的流程，来处理不同的事务：

``` js
const detailTask = requestTask.map(x => x.detail);
const listTask = requestTask.map(x => x.list);
```

然后我们可以分别 `fork` 上面的两个 `Task`，独立发起两次请求并完成不同的事务：

``` js
detailTask.fork( // 一次请求
  x => console.log('detail: ', x)
);
listTask.fork( // 又一次请求
  x => console.log('list: ', x)
);
```

### chain

`Task` 的 `chain` 方法可以组合多个不同的 `Task` 流程来实现串行请求的效果，很类似 IO 通过 `chain` 来组合两次副作用操作的过程：

``` js
const request = url => Task(resolve => http.get(url).then(resolve));

request('first/url')
  .map(x => x.urlToDetail)
  .chain(request)
  .map(x => x.detail)
  .fork(detail => console.log(detail));
```

上面的逻辑中，两个通过 `request` 生成的 `Task` 函子被组合起来构成一个串行请求的动作。在 `fork` 的时候，这个动作被触发执行。

讲完了 `Task` 函子的基本用法，我们来比较一下 `Task` 和我们常用的 `Promise` 的区别。

## 与 Promise 的区别

`Promise` 在表面上看和 `Task` 非常相似，上面的最后一段代码的等价 `Promise` 实现如下：

``` js
const request = url => new Promise(resolve => http.get(url).then(resolve));

request('first/url')
  .then(x => x.urlToDetail)
  .then(request)
  .then(x => x.detail)
  .then(detail => console.log(detail));
```

可以说除了方法名不同几乎一模一样。但实质上，它俩还是有诸多不同之处的：

- 方法混淆

`Task` 的 `map` / `chain` / `fork` 在 `Promise` 中全都是 `then` 方法。这样的 `API` 设计让 Promise 更好用，但也失去了一些函数式的特性，尤其是 fork 和另两个方法的意义是完全不同的

- 立即执行 vs 延迟执行

`Task` 的异步流直到 `fork` 之前都仅仅是「动作」，没有「执行」，而 `Promise` 在生成的当下即发起了异步流程，这个的不同造成了这两种数据流程的根本不同。

- 多次订阅 vs 单次调用

因为上面执行时机的不同，`Task` 可以分化出很多不同的异步流程，每个流程都可以被多次 `fork` 执行，而 `Promise` 流程只会执行一次。

- 异步微任务 vs 纯粹的回调

即使是用 `Promise` 直接 `resolve` 一个结果，仍会生成一个异步微任务，排在在同步流程之后执行。这让 `Promise` 的数据流不适合兼容同步的数据流程。
而 `Task` 由于仅仅是纯粹一系列的函数回调组合，它只会根据需要产生异步流程，因而能够很好地兼容同步流程。
`IO` 函子的所有支持的同步事务，用 `Task` 可以等价兼容。这使得「一种结构解决所有问题」的函数式目标成为可能。

- 更灵活精确的流程控制

通过对 `Task` 的改良，可以实现请求缓存，截流，防抖等多种细致的流程控制，实现对复杂逻辑的精细拆分。

## 错误处理：Observable

上面的 `Task` 函子是一个简陋版本，没有对异步请求中的异常进行抓取。

通过 `Task` 函子进行异步处理的方式多种多样，可以基于我们介绍 `Monad` 中例举的 `Maybe` 或者 `Either` 函子来实现，也可以像我们下面介绍的这样，通过一个类似 rx 中的 `Observable` 的方式来实现：

``` js
const request = url => Observable(({ next, error }) => http.get(url).then(next, error));

request('first/url')
  .map(x => x.urlToDetail)
  .chain(request)
  .map(x => x.detail)
  .fork({
    next: detail => console.log(detail),
    error: err => console.log('error', err);
  });
```

上面的 `next` 方法声明了正常的处理流程，`error` 方法声明了异常的处理流程。这段代码除了方法名有所不同，已经基本与 rx 中的 `Observable` 完全一致了。

事实上，rx 的 `Observable` 仅仅是对它作了一系列的功能性和性能性的扩充。

## 题外话：函子的实现

FP 中除了容器（Container），也可以用上下文（Context）来称呼包裹了一个值的结构，通过下面的函子实现，你就能明白上下文是如何用来直接包裹数据的：

``` js
const Functor = x => ({
  map: f => Functor(f(x)),
});
Functor.of = x => Functor(x);
```

这个 `Functor` 没有把 `x` 保存在任何属性中，而是直接通过函数的上下文作用域把它暂存了起来。同样的思路被用来实现我们简陋版的 `Task` 函子：

``` js
const Task = fork => ({
  map: f => Task(resolve => fork(x => resolve(f(x)))),
  chain: f => Task(resolve => fork(x => f(x).fork(resolve))),
  fork,
});
Task.of = x => Task(resolve => resolve(x))
```

通过上面的例子是想说明，函子的实现不一定需要通过类，甚至不需要专门找个字段来存放我们包裹的值。

类或者上面的工厂函数的方式都可以用来实现函子，然而这些实现并不影响函子的实质。函子的实质以及解决问题的思路，才是我们真正应该关心的。

点击下方原文可以看到 TS 实现的 `Task` 和 `Observable`。

## 扩展阅读

- [The Task Monad in Javascript: pure asynchronous effects you can compose](https://kwijibo.github.io/task-monad-in-javascript/)
