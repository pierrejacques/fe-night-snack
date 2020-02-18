# Typescript夜点心：类型推断的策略

今天的夜点心关于 Typescript 的类型推断策略

熟悉 Typescript 的朋友都知道，TS 具有一套类型推断系统来帮助减少不必要的类型声明。即使是面对纯 JS 代码，TS 也能通过类型推断系统给每个变量自动套上一个默认类型。

那么你知道下面的 `a`, `b`, `c.prop`, `D.prop` 四个量的类型推断结果分别是什么吗？

``` ts
const a = 'a';

let b = 'a';

const c = {
  prop: 'a'
};

class D {
  static prop = 'a'
}
```

看起来都差不多？如果用他们给下面的变量赋值又会发生什么呢？

``` ts
type Abc = 'a' | 'b' | 'c';

const a1: Abc = a;

const b1: Abc = b; // error!

const c1: Abc = c.prop; // error!

const d1: Abc = D.prop; // error!
```

会发现除了 `a1` 这一句赋值语句外，其他的赋值语句都报错了！

原因就是除了变量 `a` 被推断成了单值类型 `'a'`，其余的 `b`, `c.prop` 和 `D.prop` 都被推断成了字符串类型 `string`

而从类型的范围来看 `string` > `Abc` > `'a'`

所以对 a1的赋值是成立的， 而其他的赋值就报错了。

为什么对于看似类似的情形，TS 的推断结果会有差别呢？

根本原因在于 TS 会根据一个值在后续的逻辑中是否可能被修改而给出不同的类型推断结果：

- 对于有 **可能被修改** 的值，TS 采用较为宽松的类型推断策略，即把上述 `b`, `c.prop`, `D.prop` 推断为较为宽泛的 `string` 类型，这使未来可能出现的赋值具有更大的灵活度
- 对于 **不可能被重新赋值** 的值，TS 采用较为严格的类型推断策略，即把上述 `a` 推断为单值类型 `'a'`，这样未来把 `a` 赋值给别的变量时，出现类型检查错误的可能性更小

不同的出发点和情形，造成了两种不同的类型推断策略。

最后在理解了上述策略后，让我们对 `D` 做一个修改，验证一下 TS 的推断逻辑：

``` ts
class D2 {
  static readonly prop = 'a';
}

const d2: Abc = D2.prop; // 这次不再报错了！
```

通过 `readonly` 关键字的添加，标定了 `prop` 字段是不可更改的，从而触发了更严格的推断策略，让 `D.prop` 被推断成了单值类型 `'a'`

## 扩展阅读

> [Improved Inference for Literal Types in TypeScript](https://mariusschulz.com/blog/improved-inference-for-literal-types-in-typescript)
