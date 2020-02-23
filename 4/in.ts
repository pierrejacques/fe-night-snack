/**
 * 属性判断：`in`
 */

interface Foo {
  foo: string;
}

interface Bar {
  bar: string;
}

export function test (input: Foo | Bar) {
  if ('foo' in input) {
    // 这里 input 的类型「收紧」为 Foo
  } else {
    // 这里 input 的类型「收紧」为 Bar
  }
}
