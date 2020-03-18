enum NightSnackFlag {
  None = 0, // 没有属性
  isHot = 1 << 0, // 是热的
  hasMeat = 1 << 1, // 含有肉
  hasVeg = 1 << 2, // 含有蔬菜
  hasRice = 1 << 3, // 含有米饭
  hasDough = 1 << 4, // 含有面食
}

interface NightSnack {
  name: string; // 夜点心名
  property: NightSnackFlag; // 夜点心的特点
}

// provider

// 小笼包工厂
function Shiaolonpo(): NightSnack {
  const property: NightSnackFlag =
    NightSnackFlag.None |
    NightSnackFlag.None |
    NightSnackFlag.isHot |
    NightSnackFlag.hasDough |
    NightSnackFlag.hasMeat;
  return {
    name: '小笼包',
    property,
  }
}

// consumer

// 夜点心消费者
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

