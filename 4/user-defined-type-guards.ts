/**
 * 不通过字面量声明声明条件判断时，类型守卫便失效了
 */

export function isString (input: any) {
  return typeof input === 'string';
}

export function betterIsString (input: any): input is string {
  return typeof input === 'string';
}

function test (input: string | number) {
  if (isString(input)) {
    // 这里 input 的类型没有「收紧」，仍为 string | number
  } else {
    // 这里也一样
  }

  if (betterIsString(input)) {
    // 这里 input 的类型「收紧」为 string
  } else {
    // 这里 input 的类型「收紧」为 number
  }
}

class SuperHero { // 超级英雄
  readonly name: string;
}
class Batman extends SuperHero { // 蝙蝠侠继承自超级英雄
  private muchMoney: true;
}

// 判断任意对象是不是蝙蝠侠的函数
export function isBatman (man: any): man is Batman {
  return man && man.helmet && man.underwear && man.belt && man.cloak;
}

function foo (hero: SuperHero) {
  if (isBatman(hero)) {
    // hero 是蝙蝠侠
  } else {
    // hero 是别的超级英雄
  }
}
