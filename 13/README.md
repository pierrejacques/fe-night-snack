# Typescript 夜点心：修饰器

今天的夜点心我们来聊聊 Typescript 中的修饰器

修饰器在基于 Typescript 开发的库中并不少见（也有一部分 JS 库使用 @babel/plugin-proposal-decorators 来支持修饰器的语法）。比如 Angular 中大量利用修饰器的语法来标记组件的生命周期、属性的性质，Mobx 利用修饰器来为组件挂载外部状态等。

但笔者发现在实际的业务中，修饰器的应用相当有限。我认为可能的原因有如下：

- 姿势水平：笔者和同事们的姿势水平太低，用不来这种高级玩意儿
- 技术选型：在以 vue 或 react 为主框架的项目中，用得到修饰器的地方有限。前者跟 TS 就合不来，后者的 Hooks 风格组件用不上修饰器
- 业务场景：修饰器主要提供跨类的通用逻辑的复用，对一般业务场景而言，这样的逻辑较少或往往被其他技术所替代（如 Hooks）

后面的两条我们作为个人的影响力往往有限，但第一点姿势水平总归是可以通过学习一个来提高一下的。

使用修饰器首先需要将 tsconfig.json 中的 `compileOptions.experimentalDecorators` 字段设为 `true`。Typescript 中的修饰器可以用在以下 5 种场景中：

- 类
- 属性
- 方法
- 存取器：即 getter / setter
- 参数

下面介绍一下相对最常用的属性和方法修饰器

## 属性修饰器

修饰器的本质是一个函数，属性修饰器的函数签名如下：

``` ts
type PropDecorator = (
  target: object, // 被修饰的类实例或对象
  propertName: string, // 被修饰的属性，方法，存取器的名称
) => void;
```

在属性修饰器中我们可以通过 `Object.defineProperty` 来修改一个属性的 descriptor，从而实现一些通用的逻辑。

例如下面的 `state` 修饰器通过修改属性的 getter/setter 实现了根据属性变更自动执行重渲染的逻辑：

``` ts
// 修饰器定义，范型约束保证了该修饰器只能用于具有 render 方法的类上
function state<T extends { render(): void }>(
  target: T,
  propertyName: string
) {
  let realValue = target[propertyName];
  Object.defineProperty(target, propertyName, {
    set(value: T) {
      if (value !== realValue) {
        realValue = value;
        target.render();
      }
    },
    get() {
      return realValue;
    }
  })
}

// 用法
class Sprite {
  @state value = 1;

  render() {
    console.log('render');
  }
}

const sprite = new Sprite();
sprite.value = 2; // "render"
```

上面的精灵会在 `value` 属性被赋值时自动执行 `render` 方法，实现了简易的重渲染逻辑。

### 方法修饰器

方法修饰器相对属性修饰器多了第三个入参 descriptor，这使得它的签名与我们熟悉的 `Object.defineProperty` 或 `Reflect.defineProperty` 完全一致：

``` ts
type MethodDecorator = (
  target: object,
  key: string,
  descriptor: PropertyDescriptor,
) => void;
```


## 工厂 vs 单例

## 修饰顺序

## 不当用法

## 与 React Hooks 的相似之处

（解释业务中用得少的原因）
