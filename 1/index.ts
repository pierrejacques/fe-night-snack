/**
 * 类型推断的策略
 */

// 声明一些变量

const a = 'a';

let b = 'a';

const c = {
  prop: 'a'
};

class D {
  static prop = 'a';

  prop = 1;
}

class D2 {
  static readonly prop = 'a';

  readonly prop = 1;
}

// 考察他们分别被 TS 推断成了什么类型

type testA = typeof a; // 'a'

type testB = typeof b; // string

type testC = (typeof c)['prop']; // string

type testD = (typeof D)['prop']; // string

type testDInstance = D['prop']; // number

type testD2 = (typeof D2)['prop']; // 'a'

type testD2Instance = D2['prop']; // 1
