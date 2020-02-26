/**
 * 首先需要提醒的是，以下的全部实现都不一定需要依赖类的概念，只是在 ES 中类更易于组织
 */

/**
 * Maybe 的类实现
 * 这里的实现参考了 mostly adequate guide 一书中的定义
 * 采用的是一种不定义 Just 和 Nothing 构造器的定义方法
 * 这种方式对 ES 而言更简单自然
 */
class Maybe<T> {
  private value: T;

  static of<T>(x: T) {
    return new Maybe(x);
  }

  constructor(x: T) {
    this.value = x;
  }

  get isNothing() {
    return this.value == null;
  }

  public map<U>(fn: (x: T) => U): Maybe<U> {
    return this.isNothing ? this as Maybe<null> : Maybe.of(fn(this.value));
  }

  public join(): T | Maybe<null> {
    return this.isNothing ? this as Maybe<null> : this.value;
  }

  public chain<U>(fn: (x: T) => Maybe<U>): Maybe<U> {
    return this.map(fn).join();
  }

  public toString() {
    return this.isNothing ? 'Nothing' : `Just ${this.value}`;
  }
}

/**
 * Either 的实现
 * 这里通过 Either 例举了具有两个构造器的 Maybe 的情况
 * 注意，这个 Either 不是一个 Monad，它只是一个 Functor
 */
class Either<T> {
  static of<T>(x: T) {
    return x == null ? new Left(x as null) : new Right(x);
  }

  protected value: T;

  constructor(x: T) {
    this.value = x;
  }
}

class Left extends Either<null> {
  map(f: any): Left {
    return this;
  }

  toString() {
    return 'Left';
  }
}

class Right<T> extends Either<T> {
  map<U>(f: (x: T) => U): Either<U> {
    return Either.of(f(this.value));
  }

  toString() {
    return `Right ${this.value}`;
  }
}
