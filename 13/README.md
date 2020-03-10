# Typescript 夜点心：修饰器

今天的夜点心我们来聊聊 Typescript 中的修饰器

开发中我们会遇到一类逻辑，他们与特定的类没有耦合关系，甚至与特定的接口（interface）也没有耦合关系。我们可以把他们抽离出来，并通过某种语法再添回到特定的属性和方法上去，实现逻辑的解耦和复用，这便是修饰器。

在基于 Typescript 开发的库中时常能见到修饰器的身影（也有一部分 JS 库使用 @babel/plugin-proposal-decorators 来支持修饰器）：比如 Angular 中大量利用修饰器的语法来标记组件的生命周期、属性的性质，Mobx 利用修饰器来为组件挂载外部状态等。

要使用修饰器首先需要将 tsconfig.json 中的 `compileOptions.experimentalDecorators` 字段设为 `true`。Typescript 中的修饰器可以用在以下 5 种场景中：

- 类
- 属性
- 方法
- 存取器：即 getter / setter
- 参数

下面介绍相对最常用的属性和方法修饰器

## 属性修饰器

所有修饰器的本质都是函数，且都没有返回值。属性修饰器的函数签名如下：

``` ts
type PropertyDecorator = (
  target: Object, // 被修饰的类实例或对象
  propertName: string | symbol, // 被修饰的属性，方法，存取器的名称
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

上面的精灵 `sprite` 会在 `value` 属性被赋值时自动执行 `render` 方法，实现了简易的重渲染逻辑。

## 方法修饰器

方法修饰器相对属性修饰器多了第三个入参 descriptor 和可选返回值，这使得它的签名与我们熟悉的 `Object.defineProperty` 的签名非常相似：

``` ts
type MethodDecorator = <T>(
  target: Object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<T>, // 方法的描述对象
) => TypedPropertyDescriptor<T> | void; // 可选的返回描述对象
```

通过 `descriptor.value` 我们可以取到修饰前的方法，然后对它进行包装，添加逻辑。

例如下面的 `log` 修饰器为方法添加了日志功能，让方法在调用前后都会向控台输出入参和结果：

``` ts
// 修饰器声明
function log(
  target: Object,
  propertyName: string,
  propertyDesciptor: PropertyDescriptor
) {
  // 获取被修饰前的方法
  const original = propertyDesciptor.value;

  propertyDesciptor.value = function (...params: any[]) {
    // 执行前日志
    console.log(`${propertyName} params`, params);
    // 执行真正的方法
    const result = original.apply(this, params);
    // 执行后日志
    console.log(`${propertyName} result`, result);
    // 返回结果
    return result;
  }

  // 返回描述对象
  return propertyDesciptor;
};

// 用法
class Sprite {
  value = 1

  @log
  render() {
    // 重渲染逻辑
  }
}
```

## 工厂 vs 单例

上面我们的修饰器都是写作「单例」形式的，也就是对所有被修饰的方法和属性，我们都用同一个修饰器来实现修饰。

实际生产中建议将修饰器设计成工厂函数的形式以便扩展更多的功能，像下面的 `format` 修饰器能根据传入的模板来修饰对象属性：

``` ts
const format = (template: string) => (target: any, name: string) => {
  let real = target[name];
  Object.defineProperty(target, name, {
    set(value) {
      real = value;
    },
    get() {
      return template.replace('$', real);
    }
  })
}

class Foo {
  @format('text的值为$') text = '';
}
```

以上就是修饰器相关的内容。如果你在项目中还没有使用过修饰器，可以尝试一下，也许会取得不错的效果。

不过千万不要刻意为了使用修饰器而使用它们，不同的编程范式和框架会通过不同的方式来解决类似的问题。修饰器的思想源于面向对象编程的修饰模式，相似的逻辑复用在 React 中可以通过 Hooks 来实现。就像在实际开发中你不会经常写自定义 Hooks，修饰器解决的逻辑问题一般来说对库开发更为常见。

## 扩展阅读

- [Decorate your code with TypeScript decorators](https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4)
