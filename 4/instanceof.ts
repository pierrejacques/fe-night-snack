/**
 * 实例判断：`instanceof`
 */

class Foo {}
class Bar {}

export function test (input: Foo | Bar) {
  if (input instanceof Foo) {
    // 这里 input 的类型「收紧」为 Foo
  } else {
    // 这里 input 的类型「收紧」为 Bar
  }
}
