/**
 * 字面量相等判断 `==`, `===`, `!=`, `!==`
 */

type Foo = 'foo' | 'bar' | 'unknown';

export function test (input: Foo) {
  if (input != 'unknown') {
    // 这里 input 的类型「收紧」为 'foo' | 'bar'
  } else {
    // 这里 input 的类型「收紧」为 'unknwon
  }
}
