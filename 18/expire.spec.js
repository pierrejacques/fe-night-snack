import { expire } from './expire';

describe('测试 expire 函数', () => {
  test('到点就调用回调', () => {
    const callback = jest.fn();
    expire(callback);

    jest.advanceTimersByTime(59999);
    expect(callback).not.toBeCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toBeCalledTimes(1);
  })
})
