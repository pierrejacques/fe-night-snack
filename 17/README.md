# 测试夜点心：如何让工程更易测

今天的夜点心我们来聊聊 JS 项目中的单元测试。

近期会通过几篇夜点心来聊聊单元测试，这篇关于如何从工程层面让单测更易进行，之后会进一步讨论如何写测试脚本以及如何对组件进行单测。

所谓“单元”测试，就是为了验证一个模块（一个函数、一个类、一个组件）的功能是否符合预期所做的测试。它的一个重要的前置工作就是把要测试的模块同其他的模块隔离开来，以控制该模块的运行环境，开展测试。

说到模块隔离，笔者就想起了之前一个同事常说的一句话「拔出萝卜带出泥」：

「萝卜」指的就是我们要测试的这个模块，「泥」就是「萝卜」所依赖的模块。「拔出萝卜带出泥」说的就是当我们要把「萝卜」拿出来做单元测试时，大量的「泥」也被一并带了出来，让我们没有办法只针对「萝卜」开展测试。

这句话点出了一个模块的易测与否在很大程度上取决于该模块的依赖有多少（多少泥）？有多耦合（泥有多粘）？所以项目的工程实现的合理与否会直接影响到一个项目的易测程度。下面通过一些例子来谈谈哪些做法会有利于模块的依赖控制，从而使单测更易开展，其中有些是老生常谈的原则了，只不过这回我们从可测性的角度来理解它们。

## 单一职能

> 一个模块只做一件事

一个模块越单纯，它的依赖关系也相对会越单纯，越容易在测试阶段被替换。

这方面的一个例子是 Redux。redux 是一个非常清晰的模块，本身只做数据状态管理，不与任何的组件渲染框架挂钩，其产出只有一个状态管理对象 store。

他借由 react-redux / angular-redux / vue-redux 这样的桥梁模块来完成与特定组件框架的连接，借由 redux-thunk / redux-persist / redux-saga 等中间件来实现能力的增强。

上面列出的这些模块每个都只做一件事情，易于通过简单的 mock 被替换掉。

这些特性都让基于 redux 的项目测试变得相当容易，能根据场景需要回到任意的数据状态。

同时 Redux 在内部也实现了单一职能的写法：reducer、action、state 都只关心一件事情。

放到业务开发层面，单一职能要求我们把组件拆分成更细的粒度，让每个组件只做一件事。

## 纯对象的数据流

> 让数据与方法解藕

基于纯对象（plain object）的数据流是指项目内所有的模块都通过纯对象进行数据交换、调用等，对单元测试而言它有如下好处：

- 易于比较并断言
- 易于 mock
- 易于打印
- 相关模块不需要依赖用来构造数据的模块，例如一个类
- 相关模块间高度解藕

典型的采用可序列化的数据流的库有 redux、redux-saga

前者通过由 type 和 payload 构成的 action 结构来触发状态变更，使在测试阶段 mock 一个 action 变得非常容易：

``` js
// mock 一个 action
const action = { type: 'INCREMENT', payload: 30 };
store.dispatch(action)

// jest 风格的断言
expect(
  store.getState()
).toEqual({ /* 期望的 state */ })
```

后者的 generator 执行器基于纯对象的数据进行运作，它提供的 put、call 工具方法的返回值都是纯对象：

``` js
put({ type: 'SET_NIGHT_SNACK', payload: '小笼包' });
// { PUT: { type: 'SET_NIGHT_SNACK', payload: '小笼包' }}

call(fetchNightSnack, { limit: 2 });
// { CALL: { fn: fetchNightSnack, args: [{ limit: 2 }] } }
```

这样我们在测试一段异步流程（例如下面的 `initialize` ）时就变得很轻松：不用发起真实的请求而且完全不其他模块：

``` js
import { put, call } from 'redux-saga';
import initialize from 'path/to/initialize';

const gen = initialize();

// 会发起一个 fetchNightSnack 的请求
expect(
  gen.next().value
).toEqual(
  call(fetchNightSnack, { limit: 2 })
);

// 会触发一个 SET_NIGHT_SNACK 的 action
expect(
  gen.next('小笼包').value
).toEqual(
  put({ type: 'SET_NIGHT_SNACK', payload: '小笼包' })
)


// 应当结束流程
expect(
  gen.next()
).toEqual(
  { done: true, value: undefined }
)
```

## 依赖解藕

> 减少写死的依赖

在前端项目中，「写死」依赖一般有两种：

- 通过 import 语句引入别的模块作为依赖
- 直接通过上下文使用其他模块，比如 `localStorage` 等全局变量

这样的依赖在测试阶段往往需要专门花功夫去替换，费时费力。而如果这些依赖关系没有被写死，就可以轻松 mock 并替换依赖模块，做到「拔出萝卜不带出泥」。

一个很好的例子就是 Angular 中采用依赖注入的方式来声明依赖关系：

``` ts
/**
 * service
 */
@Injectable({
  providedIn: 'root',
})
class Service {
  getNightSnack() {
    // 请求逻辑
  }
}

/**
 * 组件
 */
class App implements Component {
  data: string;

  constructor(private service: Service) {
    const { data } = this.service.getNightSnack();
    this.data = data;
  }
}
```

上面的 App 组件对 Service 的依赖是通过构造函数实现的，这使测试阶段对 Service 作替换变得非常容易：

``` ts
// mock service
const mockService = { getNightSnack: () => ({ data: '串串香' }) };

// 注入 mock service
const app = new App(mockService);

// 断言
expect(app.data).toBe('串串香');
```

其他的一些避免死依赖的例子包括：

- 避免指定具体的 Storage 比如 `localStorage` 来构造缓存器
- 组件中，避免直接引用布局组件到自身的渲染函数中

## 使用测试友好的特性

JS 中的某些特性比另一些更测试友好。一个典型的例子就是上面已经提到过的 generator。

redux-saga 选择基于 generator 而不是接受度更广的 async-await 函数的原因之一就是因为 generator 函数的测试友好程度远远高于与执行器绑定了的 async-await 函数。

## 利用测试框架的模块替换能力

利用测试框架的模块替换能力来帮助我们进行测试，其实已经超出本文的依赖控制的话题范畴了，可以说是一种「作弊」，但这确实也是非常主流且常用的「拔出萝卜」的手段。

一般来说所有的测试框架都提供了模块 mock 的解决方案。比如 `jest.mock` 和 `jest.genMockFromModule` 函数可以对一个模块作完整的 mock 替换，让他变成一个具有原模块接口形态的假模块。

比如我们需要测试一个读取文件的模块 `fileReader`，这个模块引入的文件系统模块 `fs`。通过上述函数，我们可以实现对 fs 模块的替换：

``` js
const fileReader = require('path/to/fileReader');

jest.mock('fs');

beforeEach(() => {
  // 每次测试前执行对 fs 执行 mock 替换
  // 构造虚假的文件目录
  require('fs').__setMockFiles({
    '/path/to/file1.js': 'file1 contents',
  });
});

test('测试文件读写', () => {
  // 测试 fileReader
  // 此时 fileReader 所引用的 fs 模块就是 mock 的了
})
```

以上列举了一些可以让项目模块变得更易于测试的点，很多点跟现有的编程范式的理念是高度吻合的。

一般来说只要严格遵循一些好的编程实践，代码的可测性就不会太差。

## 扩展阅读

- [Testing Sagas](https://redux-saga.js.org/docs/advanced/Testing.html)
- [Jest - Mock Modules](https://jestjs.io/docs/en/jest-object#mock-modules)
