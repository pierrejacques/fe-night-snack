# React 夜点心：Hook 风格的 DOM 监听

今天的夜点心关于怎么合理地通过 React 的 hook 特性来实现对 DOM 的监听

如下我们有一个通过 React Hook 实现的 **微微微型组件**：

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

里面声明的 `count` 状态和 `increaseCount` 方法我们暂时都没有用到。现在假设产品提了一个奇葩需求，要在每次用户缩放浏览器窗口的时候，print 这个 count 并且给他加一，我们应该如何实现这个监听的过程呢？

毫无疑问的是，为了监听视口大小，需要在组件挂载的时候给 `window` 添加一个针对 `resize` 事件的回调，并在组件销毁的时候移除这个回调。这很自然地让我们想到了跟组件生命周期最相关的一个 Hook: `useEffect`

``` js
useEffect(() => {
  window.addEventListener('resize', increaseCount);
  return () => {
    window.removeEventListener('resize', increaseCount);
  }
}, []);
```

好了，试着运行一下，缩放一下窗口。嗯，控台打印出第一个 0 来了。额？好像不太对，为什么打出来的一连串都是 0 呢？难道 `count` 没有增加吗？

相信熟悉 Hook 工作远离的同学已经发现，通过 `useEffect` 绑定到 `window` 上的回调函数 `increaseCount` 是该函数式组件第一次运行时生成的，此时 `count` 的值为 `0`，因而此时的 `increaseCount` 函数其实与下面的函数等价：

``` js
const increateCount = () => {
  console.log(0);
  setCount(1);
};
```

绑定这样一个函数，当然会不停朝控台输出 `0` 了，虽然于此同时组件的 `count` 状态也确实在不断增加。

那我们是否可以把 `increaseCount` 添加到 `useEffect` 钩子的依赖中呢？像下面这样：

``` js
useEffect(() => {
  window.addEventListener('resize', increaseCount);
  return () => {
    window.removeEventListener('resize', increaseCount);
  }
}, [increaseCount]);
```

老实说，这样确实能解决问题，控台听话地依次打印出了 "0 1 2 3 ..." 。

但这种写法首先并不性能友善————在每次 `count` 改变时 `window` 都重新进行了监听回调的重新绑定。

其次非常的不「Hook」。纵观 Hook 的设计思路，无论是 `useEffect`, `useMemo`, `useCallback` 都主张通过值的变化来触发回调。而上述的代码片段试图通过值的变化来触发回调的重新绑定，与 Hook 的初衷是相矛盾的。

## 那么我们应该怎么来实现 Hook 式的 DOM 监听呢

需要**三步走**！

- 首先，我们需要选定能够体现 DOM 变化的**值**。以 `resize` 为例，能体现窗口大小变化的值最容易想到的就是窗口的宽和高了。
- 其次，通过在 DOM 上绑定监听事件的方式，把 DOM 的变化反应到上面**值**上去。即绑定 `resize` 事件监听的过程
- 最后，通过上述的**值**作为依赖，去触发我们要执行的逻辑

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

这样的写法还能让 DOM 监听相关的 Hook 得到复用和集中化管理，优化项目的逻辑分层。

同样的方法还能得到如 `useScrollTop`, `useOffsetHeight` 等一系列 DOM 监听 Hook，甚至 `XHR` 对象也可以被做成 Hook，来实现不一样的异步流程管理。

最后补充一个题外话，上述问题出现的一个原因是使用 Hook 的组件中的依赖管理问题。如下重构的 `increaseCount` 不再依赖 `count` 以后，也自然没有了之后的更多的依赖问题。

``` js
import { useCallback } from 'react';

const increateCount = useCallback(() => {
  setCount(prevCount => {
    console.log(prevCount);
    return prevCount + 1;
  })
}, []);
```

「依赖」是 Hook 风格的组件中相对传统的类组件更需要关注的问题，往大了说也是一切编程范式尤其是函数式编程所关心的问题。
