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

export function log(
  target: Object,
  propertyName: string,
  propertyDesciptor: PropertyDescriptor
) {
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

export class Sprite {
  @state value = 1;

  @log
  render() {
    // 重渲染逻辑
  }
}

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
