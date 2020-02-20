# React 夜点心：Hooks 风格的 DOM 监听

今天的夜点心关于怎么合理地通过 React 的 hooks 特性来实现对 DOM 的监听

如下我们有一个通过 React Hooks 实现的 **微微微型组件**：

``` js
import React, { useState } from 'react';

const TinyComponent = () => {
  const [count, setCount] = useState(0);

  const increaseCount = () => {
    console.log(count);
    setCount(count + 1);
  };

  return <div>我是一份前端夜点心</div>
}
```

里面声明的 `count` 状态和 `increaseCount` 方法我们暂时都没有用到。现在假设有一个奇葩需求：每当用户缩放浏览器窗口的时候，就打印这个 count 并且给他加一。我们应该如何实现这个监听的过程呢？

容易想到，为了监听视口大小，需要在组件挂载的时候给 `window` 对象添加一个 `resize` 事件的回调函数，并在组件销毁的时候移除它。这很自然地让我们想到了跟组件生命周期最相关的一个 Hook: `useEffect`

``` js
useEffect(() => {
  window.addEventListener('resize', increaseCount);
  return () => {
    window.removeEventListener('resize', increaseCount);
  }
}, []);
```

好了，试着运行一下，缩放一下窗口。嗯，控台打印出第一个 0 来了，但接着又打出了一连串 0，难道 `count` 没有增加吗？

相信熟悉 Hooks 工作原理的同学已经发现，通过 `useEffect` 绑定到 `window` 上的回调函数 `increaseCount` 是该函数式组件第一次执行时构建的，而此刻 `count` 的值为 `0`，因而此时的构建的 `increaseCount` 函数其实与下面的函数等价：

``` js
const increateCount = () => {
  console.log(0);
  setCount(1);
};
```

这样的一个函数，当然只会不停朝控台输出 `0` 了，即使于此同时组件的 `count` 状态也确实在不断增加。

那我们是否可以把 `increaseCount` 添加到 `useEffect` 钩子的依赖中呢？像下面这样：

``` js
useEffect(() => {
  window.addEventListener('resize', increaseCount);
  return () => {
    window.removeEventListener('resize', increaseCount);
  }
}, [increaseCount]);
```

这样确实能解决问题，控台听话地依次打印出了 "0 1 2 3 ..." 。

但这种写法首先并不性能友善————在每次 `count` 改变时 `window` 都重新进行了监听回调的重新绑定。

其次非常的不「Hooks」：无论是 `useEffect`, `useMemo`, `useCallback` 都主张通过值的变化来触发回调，而上述的代码片段则试图通过值的变化来触发回调的重新绑定。

## 怎么来实现 Hooks 式的 DOM 监听呢

需要**三步走**！

- 首先，我们需要选定能够体现 DOM 变化的**值**。以 `resize` 为例，最容易想到的能体现窗口大小变化的值就是窗口的宽和高。
- 其次，通过在 DOM 上绑定监听事件的方式，把 DOM 的变化反应到上面**值**上去。即绑定 `resize` 事件监听的过程
- 最后，通过上述的**值**作为依赖，通过它的变化来触发我们要执行的逻辑

通过这三步我们就得到了如下的自定义 Hook: `useWindowSize`

``` js
import { useState, useEffect } from 'react';

export const useWindowSize = () => {
  // 第一步：声明能够体现视口大小变化的状态
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 第二步：通过生命周期 Hook 声明回调的绑定和解绑逻辑
  useEffect(() => {
    const updateSize = () => setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return windowSize;
}
```

最后通过这个自定义 Hook 来重写一下我们的微微微型组件吧！

``` js
import React, { useState, useEffect } from 'react';
import { useWindowSize } from 'path/to/use-window-size';

const TinyComponent = () => {
  const [count, setCount] = useState(0);

  const windowSize = useWindowSize();

  const increaseCount = () => {
    console.log(count);
    setCount(count + 1);
  };

  // 第三步：通过值来触发回调逻辑
  useEffect(increaseCount, [windowSize]);

  return <div>我是一份前端夜点心</div>
}
```

是不是语义清晰很多？

这样的写法还能让 DOM 监听相关的 Hooks 得到复用和集中化管理，优化项目的逻辑分层。

同样的方法还能得到如 `useScrollTop`, `useOffsetHeight` 等一系列 DOM 监听 Hook，甚至 `XHR` 对象也可以被做成 Hook，来实现不一样的异步流程管理。

## 最后补充一个题外话

上述问题出现的一个原因是使用 Hooks 的组件中的依赖管理问题。如下重构的 `increaseCount` 不再依赖 `count` 以后，也自然没有了之后的一系列依赖问题：

``` js
import { useCallback } from 'react';

const increateCount = useCallback(() => {
  setCount(prevCount => { // 通过纯函数进行状态更新
    console.log(prevCount);
    return prevCount + 1;
  })
}, []);
```

「依赖」，是 Hooks 风格的组件相对传统的类组件更需要关注问题，也是许多编程范式尤其是函数式编程所关心的核心问题。

## 扩展阅读

- [useHooks，提供了大量基于 Hooks 技术的解决思路](https://usehooks.com/)
- [Creating a Reusable Window Event Listener Hook with useEffect and useCallback](https://codedaily.io/tutorials/72/Creating-a-Reusable-Window-Event-Listener-with-useEffect-and-useCallback)
