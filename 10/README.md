# 函数式夜点心：IO Monad 与副作用处理

今天的夜点心来谈谈函数式编程中的副作用处理

副作用（Side-Effects）说得直白一点就是与程序外部的世界的交互作用。比如改变显示屏的界面展示，读写后端数据库中的内容，副作用让我们的应用得以与外部世界发生相互以实现功能。如果一段代码完全没有副作用，那执行完以后你只会发现电脑热了一点，而这也是一种副作用。所以可以说，应用的本质价值就在于它产生的副作用。

然而在开发阶段，由于外部世界的不可控性（例如没有办法控制后端返回的数据，没有办法控制用户浏览器的缓存数据等等），包含副作用的逻辑行为往往也跟着变得不可预测和不可测试性。

当一个应用充斥着副作用，我们将难以确定我们写完的逻辑哪些是可靠的哪些是有漏洞的，难以定位一个错误来自哪里，难以通过有限的 mock 工作，来完全模拟代码的外部世界。

函数式编程提倡把副作用分离出来，让“纯”逻辑们待在一起，远离包含副作用的逻辑，如何来实现这个目标呢？我们需要 IO Monad。（关于 Monad 的介绍请戳 [函数式夜点心：Monad](../6/README.md)。）

## 一个例子

先解释一下命名：IO 就是 Input/Output，所谓的副作用无非是对外部世界的 Input（读）和 Output（写），所以我们用 IO Monad 来形容一种包裹着对外部世界读写行为的 Monad 函子。

那如何把一段原本有副作用的逻辑变得没有副作用呢？其实没有什么神奇的，IO Monad 的核心思想就是：“无论遇到什么困难都不要怕，微笑着面对它，战胜..."，不好意思串台了，应该是

> 无论遇到什么副作用都不用怕，把它包在一个函数里晚点再管它

例如下面是一段典型的会产生副作用的函数 foo，它首先访问并读取了外部存储 localStorage，后对读到的数据做了一些整理并在控台打印出来，正好把 I/O 两项副作用占满了：

``` js
function showReview() {
  try {
    const dataStr = localStorage.getItem('前端夜点心的数据');
    const data = JSON.parse(dataStr);
    const reviewData = data.review;
    const reviewOutput = reviewData.map(
      (count, index) => `第${index}篇文章的阅读量是${count}`
    ).join(',');
    console.log(reviewOutput);
  } catch(e) {
    console.log('读取错误');
  }
}
```

因为包含副作用的 3、8 两行与纯逻辑的 4-7 行混杂在一起，一旦报错发生我们就无法排着胸脯担保 4-7 行的逻辑没有错误——他们与具有副作用的逻辑绑定在一起，难以自证清白。

所以首先我们要做的是把包含副作用的两行代码通过函数包装起来：

``` js
const readFromStorage = () => localStorage.getItem('前端夜点心的阅读量');
const writeToConsole = content => console.log(content);
```

然后把 `readFromStorage` 用一个 Monad 包裹起来，这个 Monad 名为 `IO`：

``` js
const storageIO = new IO(readFromStorage);
```

上面的 storageIO 包裹的 value 不是从 localStorage 读取的不可预测的值，而是仅仅是 `readFromStorage` 这个函数。
换句话说，我们包裹了一个确定的「动作」，比如“挥拳”，而不是它的不可预测的「结果」，比如打赢了别人，或者被对方暴击，或者进局子。
至此，“挥拳”这个动作并没有被执行，只是被我们暂存了起来。

接下来我们把后续的一系列操作都声明成函数，并通过 `storageIO` 的链式调用组织起来

``` js
// 解析 JSON
const parseJSON = string => JSON.parse(string);

// 读取 review 字段
const getReviewProp = data => data.review;

// 把 review 字段拼装成字符串
const mapReview = reviewData => reviewData.map(
  (count, index) => `第${index}篇文章的阅读量是${count}`
).join(',');

// 组合上面的这些函数，得到新的 Monad
const task = storageIO
  .map(parseJSON)
  .map(getReviewProp)
  .map(mapReview)
```

上面我们得到的 `task` 同样是一个包含了「动作」而不是「结果」的 Monad，它把一系列动作组合起来：parse 之后 getReviewProps 之后 mapReview。
就好比想好了“挥拳”然后“观察”然后“逃跑”然后“躲起来”，但并没有执行任何一个上述动作。这些动作仍然停留在「动机」阶段，没有对对手产生任何实质影响。

最后终于到了执行的时刻了！我们通过 IO Monad 特有的 `fork` 方法订阅了 `writeToStorage` 函数，同时执行了包裹在 Monad 中的组装好的函数：从 localStorage 读取了值，一通操作以后把它输出到了控台：

``` js
task.fork(writeToConsole);
```

`fork` 操作就好比扣动了板机，把我们早已在脑海里想好的一系列动作一股脑打了出去。与最初的 `showReview` 函数不同的是，在这之前我们已经推敲了每一个动作（中间步骤的纯函数），保证它们准确无误。如果出现问题，就可以断定是在 `readFromStorage` 或者 `writeToConsole` 中出现的了。

这就是 IO Monad 用法的一个简单的例子。当然之所以被称为 Monad，肯定少不了 `chain` 方法：

## chain

首先，作为一个 Monad，IO 肯定是支持 `chain` 操作的。
还是以从 localStorage 读取数据为例，先定义一个可以根据输入的 key 返回包裹了读取这个 key 的存储值的 IO 的函数：

``` js
const readByKey = key => new IO(() => localStorage.getItem(key));
```

然后就可以以此为基础，通过第一个 key 读取数据，根据读到的数据获得第二个 key，读取第二个值并返回：

``` js
const task = readByKey('firstKey') // 通过第一个 key 读取存储
  .map(parseJSON)
  .map(v => v.key) // 获取第二个 key
  .chain(readByKey) // 通过第二个 key 读取存储
  .map(parseJSON)
```

一切的副作用都被控制在 `readByKey` 这个函数中，使得错误易于定位。

chain 操作赋予了 IO 函子更多的可能性，这样的分布读取的动作很容易让我们联想到异步请求中的串行请求，说到这里就不得不提到 IO 与异步数据流的关系了：

## IO Monad 与异步数据流

在下一篇“函数式夜点心：Task Monad 与异步数据流”中我们会专门介绍用于处理异步流程的函子。你将发现，`Task` 的用法与 `IO` 几乎没有任何区别：

``` js
const request = url => new Task(
  (resolve, reject) => http.request(url).then(resolve, reject)
)

request('/path/to/data')
  .map(res => res.id)
  .map(id => `path/to/detail/${id}`)
  .chain(request)
  .map(res => res.data)
  .fork(data => console.log(data))
```

异步函子 `Task` 与更高级的通过 `Either` 来进行错误处理的 `TaskEither` 函子都是基于 `IO` 函子进行扩充得到的。

## 具体实现

具体的实现细节不是并非本文所关心的，不过 `IO` 函子的具体实现并不复杂，通过 `compose` 来实现 `map`，通过进一步 `compose` 一个 `join` 方法来实现 `chain`。点击下方阅读原文，你可以在 github 上看到 IO 的实现源码。

-----

上面就是 IO 函子相关的内容，它是为了「处理副作用」而产生的。同时，在 IO 中我们看到了 chain 方法被应用在了比 Maybe 中的「错误处理」更广泛的领域上，这正是 Monad 的精妙之处。

FP 中的函子一层层地扩充它们的特性以解决更广泛的问题，这一次，我们从 Monad 扩充到了 IO，下一次我们将从 IO 扩充到 Task，并最终迈向函子的终极形态 Stream。

## 扩展阅读

- [The IO monad in Javascript — How does it compare to other techniques](https://medium.com/@magnusjt/the-io-monad-in-javascript-how-does-it-compare-to-other-techniques-124ef8a35b63)
