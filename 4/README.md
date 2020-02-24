# Typescript 夜点心：自定义类型守卫

今天的夜点心关于 Typescript 中的自定义类型守卫

## 什么是类型守卫

TS 在遇到下面这些的条件语句时，会在语句的块级作用域内「收紧」变量的类型，这种类型推断的行为称作类型守卫 (Type Guard)。

- 类型判断：`typeof`
- 实例判断：`instanceof`
- 属性判断：`in`
- 字面量相等判断：`==`, `===`, `!=`, `!==`

（这里列举的是比较常用的 4 种）

类型守卫可以帮助我们在块级作用域中获得更为精确的变量类型，从而减少不必要的类型断言。下面通过一些具体的例子来帮助大家理解这个看起来有点抽象的概念：

### 类型判断：`typeof`

``` ts
function test(input: string | number) {
  if (typeof input == 'string') {
    // 这里 input 的类型「收紧」为 string
  } else {
    // 这里 input 的类型「收紧」为 number
  }
}
```

### 实例判断：`instanceof`

``` ts
class Foo {}
class Bar {}

function test(input: Foo | Bar) {
  if (input instanceof Foo) {
    // 这里 input 的类型「收紧」为 Foo
  } else {
    // 这里 input 的类型「收紧」为 Bar
  }
}
```

### 属性判断：`in`

``` ts
interface Foo {
  foo: string;
}

interface Bar {
  bar: string;
}

function test(input: Foo | Bar) {
  if ('foo' in input) {
    // 这里 input 的类型「收紧」为 Foo
  } else {
    // 这里 input 的类型「收紧」为 Bar
  }
}
```

### 字面量相等判断 `==`, `!=`, `===`, `!==`

``` ts
type Foo = 'foo' | 'bar' | 'unknown';

function test(input: Foo) {
  if (input != 'unknown') {
    // 这里 input 的类型「收紧」为 'foo' | 'bar'
  } else {
    // 这里 input 的类型「收紧」为 'unknwon
  }
}
```

上述的「紧缩」作用所带来的便利性，你很可能已经在开发中受惠过很多次了，只是不知道该怎么称呼它。不过值得注意的是，一旦上述条件不是直接通过字面量书写，而是通过一个条件函数来替代时，类型守卫便失效了，如下面的 `isString` 函数：

``` ts
function isString (input: any) {
  return typeof input === 'string';
}

function foo (input: string | number) {
  if (isString(input)) {
    // 这里 input 的类型没有「收紧」，仍为 string | number
  } else {
    // 这里也一样
  }
}
```

这是因为 TS 只能推断出 `isString` 是一个返回布尔值的函数，而并不知道这个布尔值的具体含义。然而在日常的开发中，出于优化代码结构等目的，上述的「替换」情形是非常常见的，这时为了继续获得类型守卫的推断能力，就要用到自定义守卫。

## 自定义守卫

自定义守卫通过 `{形参} is {类型}` 的语法结构，来给上述返回布尔值的条件函数赋予类型守卫的能力。例如上面的 `isString` 函数可以被重写为：

``` ts
function betterIsString (input: any): input is string { // 返回类型改为了 `input is string`
  return typeof input === 'string';
}
```

这样 `betterIsString` 便获得了与 `typeof input == 'string'` 一样的守卫效果，并具有更好的代码复用性。

由于自定义守卫的本质是一种「类型断言」，因而在自定义守卫函数中，你可以通过任何逻辑来实现对类型的判断，不需要受限于前面的 4 种条件语句。比如如下的“鸭子”类型守卫函数认为只要一个对象满足有头盔有斗篷有内裤有皮带，它就一定是“蝙蝠侠”的实例：

``` ts
class Batman {}

export function isBatman (man: any): man is Batman {
  return man && man.helmet && man.underwear && man.belt && man.cloak;
}
```

在项目中合理地使用类型守卫和自定义守卫，可以帮助我们减少很多不必要的类型断言，同时改善代码的可读性。

最后一个问题，除了蝙蝠侠，你还能想到别的满足有头盔有斗篷有内裤有皮带超级英雄吗？

## 扩展阅读

[Type Guard - Typescript Deep Dive](https://basarat.gitbook.io/typescript/type-system/typeguard)
