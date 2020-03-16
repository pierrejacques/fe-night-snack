# Typescript 夜点心：基于位运算的枚举类型

今天的夜点心来介绍 Typescript 中枚举值的一种特别的用法——基于位运算的枚举型

首先要提出一个问题：「TS 中一个枚举类型的值只能取自声明的枚举值中的一个吗？」

看起来有点绕，但是看懂了以后你可能会觉得这是句屁话——枚举枚举，顾名思义，当然只能取枚举出来的值了

有意思的是，在 Typescript 中这还真不一定成立：通过基于位掩码（bitmask）的枚举定义，一个枚举类型的值可以取到远多余枚举声明的值

## 位掩码枚举值

位掩码枚举值的声明很简单，如下声明了一个关于夜点心属性的枚举类型，描述了一份夜点心具有哪些属性：

``` ts
enum NightSnackFlag {
  None = 0, // 没有属性
  isHot = 1 << 0, // 是热的
  hasMeat = 1 << 1, // 含有肉
  hasVeg = 1 << 2, // 含有蔬菜
  hasRice = 1 << 3, // 含有米饭
  hasDough = 1 << 4, // 含有面食
}
```

熟悉位运算的同学应该可以看出来，上面的每个枚举值都是一个二进制位掩码：

``` text
None:     00000
isHot:    00001
hasMeat:  00010
hasVeg:   00100
hasRice:  01000
hasDough: 10000
```

通过这些五位数的二进制掩码的组合，我们可以表示任何一种属性组合，比如：

- 小笼包，热乎、有肉、有面皮： 10011
- 烧卖，热乎、有肉、有香菇、有面皮、有米饭： 11111
- 肠粉，热乎、有肉、有菜、有米皮： 01111
- 卤煮，热乎、有肉：00011

这样的组合出来的值显然会比上面的 6 个枚举值要多，并且通过这一个值我们就可以承载至多 32 个布尔或二值属性的信息，是不是很神奇？

下面从生产端和消费端具体讲一下如何在业务中使用上面的这种位枚举

## 生产端

例如我们有如下定义的夜点心类型一个：

``` ts
interface NightSnack {
  // 夜点心名
  name: string;
   // 夜点心的特点
  property: NightSnackFlag;
}
```

我们那怎么根据属性判断来给它赋值正确的 `property` 枚举值呢？

这里就需要用到位逻辑符：位或 `|`

下面例举了一个可以生产小笼包对象的函数，对具有的属性进行位或运算就可以得到正确的属性值：

``` ts
function Shiaolonpo() {
  const property: NightSnackFlag =
    NightSnackFlag.None |
    NightSnackFlag.isHot |
    NightSnackFlag.hasDough |
    NightSnackFlag.hasMeat;
  return {
    name: '小笼包',
    property,
  }
}
```

用上面的工厂得到的小笼包对象的 `property` 的十进制值是 19，二进制值就是我们之前见到的掩码 10011

## 消费端

在消费端处理上述数据时，我们仍然需要通过位运算（位与 &）的方式来解析它，下面的函数能解析一个夜点心的信息，并向控台打印出它具有哪些特性：

``` ts
function consumeNightSnack({ property }: NightSnack) {
  if (property & NightSnackFlag.hasDough) {
    console.log('有面皮')
  }
  if (property & NightSnackFlag.hasMeat) {
    console.log('有肉');
  }
  if (property & NightSnackFlag.hasRice) {
    console.log('有米')
  }
  if (property & NightSnackFlag.hasVeg) {
    console.log('有蔬菜');
  }
  if (property & NightSnackFlag.isHot) {
    console.log('是热的');
  }
}
```

## 利弊

通过位运算来定义和使用枚举型，可以实现把很多「是否」的属性压缩在一个字段中存储的效果。并且无论在生产端还是消费端，使用起来都还比较直观。

在数据传输层面，基于掩码来传输属性会大大压缩数据体积，加快传输。

但同时掩码也会带来一些问题，其一就是需要生产端配合实现。例如对来自后端的数据，前端工程师就要想方设法说服后端来共同实现这样的一套生产消费方式。

另一方面，掩码属性的语义化较差，难以 debug。有时出问题了也看不懂掩码的十进制值，转成二进制后又看不懂每一位是什么意思，到底哪一位错了，比较蛋疼。

总的来说还是希望通过这样一个小小的用法，帮助大家打开思路，了解到位运算在前端中可以作出的一点维小的贡献

## 扩展阅读

- [Typescript Deep Dive - enums](https://basarat.gitbook.io/typescript/type-system/enums)
