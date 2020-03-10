type PropDecorator<T> = (
  target: object, // 被修饰的类实例或对象
  key: string, // 被修饰的属性，方法，存取器的名称
) => void;

type MethodDecorator = (
  target: object,
  key: string,
  descriptor: PropertyDescriptor,
) => void;

export function state<T extends { render(): void }>(
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


class Sprite {
  @state value = 1;

  render() {
    // 重渲染逻辑
  }
}
