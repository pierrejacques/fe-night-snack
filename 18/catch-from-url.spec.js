import { catchFromURL } from './catch-from-url';

describe('测试 catchFromURL', () => {
  test('通过URL获取指定的参数值并抹去之', () => {
    const testHref = `${document.location.origin}/list/2/detail?a=123b&b=true#section2`;
    history.replaceState(null, '', testHref);
    expect(catchFromURL('a')).toBe('123b');
    expect(document.location.href).toBe(`${document.location.origin}/list/2/detail?b=true#section2`);
  })
})
