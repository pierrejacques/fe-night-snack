# 测试夜点心：单元测试测什么

今天的前端夜点心我们来聊聊在项目中单元测试应该测些什么？

以国内互联网的开发节奏，在前端业务项目中全面覆盖单元测试有时显得不太可行，以下因素都是单测覆盖率的绊脚石：

- UI 交互复杂，路径难以覆盖全面
- 开发工期紧，开发对实践 TDD，BDD 所带来的长远效益没有信心
- 产品经理们时不时打着「敏捷开发」的旗号改需求，使得刚刚辛辛苦苦写完的测试脚本完全作废

在这样的处境下，一味强调单元测试的逻辑覆盖率是没有太大意义的，明确在哪里应用单测的能取得最大的边际效益是更有意义的事情。

以下笔者根据自己的一些在单测的实战经验，列出了三项关于「单元测试应该测什么」的观点并附以一些例子与大家交流：

## 单元测试并非测试的全部

> 拿来主义地对待单元测试

单测只是一种局部模块测试，是诸多测试方案中的一种，认识到这一点可以避免我们为了测试而测试，或者为了指标而测试。

同时也应该认识到单测本身的覆盖能力也是有限的，全部用例的 pass 和 100% 的覆盖率都不能保证被测试模块的所有逻辑路径都有正确的行为。

是否对一个模块使用单元测试往往取决于这个模块的逻辑稳定性和业务类型

例如对于一个底层 npm 包项目，单元测试几乎是他唯一的代码质量保障手段，这时就应该尽可能通过单元测试验证它在各种应用场景下的行为是否符合预期，来最低成本地保证它每次发包和更新的质量。对这类项目，彻底应用 BDD 开发模式也会获得越来越高的开发效率收益。

而对于一个功能复合的 UI 组件，除了单元测试，还有 E2E 测试，自动化回归测试，QA 的手动测试（😊）来保障它的代码质量。此时使用单元测试的边际效益可能不是最高的，就应该考虑通过别的手段来回归它的逻辑。

## 边界环境的模拟

> 时空穿梭

单测的一个很重要的意义是帮助我们在开发阶段模拟出手动测试甚至线上使用场景下都不易触达的边界场景，如：

- 模拟个别浏览器下的 JS 版本等
- 模拟某种 URL 状态
- 模拟不同时区下的情形
- 模拟时间过了一个小时（这几乎只有单元测试能够做到）

等等

使用这类模拟对模块进行单元测试的边际效益是极高的，往往比 QA 去作等价的模拟快得多。

比如下面这段脚本，通过 jest 的 timer mock 能力，实现了对 `expire` 函数的测试：

``` js
const expire = (callback) => setTimeout(callback, 60000); // 一小时以后过期

test('到点就调用回调', () => {
  const callback = jest.fn();
  expire(callback);

  jest.advanceTimersByTime(59999);
  expect(callback).not.toBeCalled();

  jest.advanceTimersByTime(1);
  expect(callback).toBeCalledOnce();
})
```

这段代码通过 `jest.advanceTimersByTime` 精确模拟了宏任务的运行过程，同步完成了原本需要一小时才能验证一次的异步流程的测试。

又比如下面的测试脚本用来测试一个名为 `catchFromURL` 的工具函数，该函数可以从当前的 URL 中获取制定的参数作为返回值返回，同时从 URL 中抹去该参数。这在通过 URL 携带 token 信息的业务场景中是非常常见的。

``` js
test('通过URL获取指定的参数值并抹去之', () => {
  const CURRENT_ORIGIN = document.location.origin;
  const testHref = `${CURRENT_ORIGIN}/list/2/detail?a=123b&b=true#section2`;
  history.replaceState(null, '', testHref);
  expect(catchFromURL('a')).toBe('123b');
  expect(document.location.href).toBe(`${CURRENT_ORIGIN}/list/2/detail?b=true#section2`);
})
```

这段测试代码通过 jsdom 来实现对需要测试的环境的模拟。环境的构造和模拟其实是单元测试中的一个难点，由于 jsdom 本身的一些缺陷（如没有实现 Navigator）使得在测试脚本运行的 node 环境中模拟正确的浏览器环境往往需要用到很多的 Hack 技术，这一点在未来的夜点心中会着重中展开讨论。

## 点到为止

> less is more

测试代码无需关心被测试模块的具体实现，点到为止地测试几种必要的流程场景即可。一方面可以减少写测试逻辑的时间，一方面可以使得业务逻辑具有更好可替换性。

对一个业务模块的测试应该控制住该模块所关联的所有外部依赖。

- 对于函数模块而言，控制它引用的模块、它的输入和它的副作用，验证它的输出和对副作用的影响
- 对于组件模块而言，控制它依赖的服务、它依赖的子组件、它的 props和它的事件，验证它的渲染结果和 props 中回调的调用情况，而不应该关心它的 state。

下面的脚本通过 `enzyme` 组件测试工具测试了一个名为 `ValidatableInput` 的 React 组件。这个组件在失焦时会触发 `onValidate` 回调，并传入 `inputValue` 参数。

``` jsx
  test('失焦时触发 onValidate', () => {
    const onValidate = jest.mock();
    const inputValue = '输入的内容';
    const wrapper = shallow(
      <ValidatableInput
        placeholder={''}
        value={inputValue}
        alert={''}
        onChange={onChange}
        onValidate={onValidate}
      />
    );

    wrapper.find('.c-input-with-alert__input').first().simulate('blur');
    expect(onValidate).toBeCalledWith(inputValue);
  });
```

在上述测试用例中我们的测试逻辑完全基于行为开展，只关心「动作」和「反馈」，没有去断言任何关于组件状态的内容。

这样组件可以根据它的需要自由地实现它的内部逻辑，例如添加通过外部的 `Provider` 来提供 `value` 和 `onChange` 成为受控组件的能力。这些实现的变化都不会影响当前这条测试用力的有效性。

上面就是一些对应该用单元测试测什么的看法，把单测用在它最擅长的地方，才能在紧张的开发节奏中取得事半功倍的效果。

下面的扩展阅读，贴了一篇关于「测试覆盖率是否是一个真正的工程质量指标」的文章，感兴趣的同学可以康康

## 扩展阅读

- [Is unit test coverage a real quality metric?](https://codeburst.io/is-unit-test-coverage-a-real-quality-metric-6dba004d0849)
