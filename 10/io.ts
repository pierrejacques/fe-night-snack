function compose<T, U>(f: (x: T) => U, g: () => T) {
  return () => f(g());
}

function join<T>(io: IO<T>): () => T {
  return io.effect();
}

export class IO<T> {
  static of<T>(x: T) {
    return new IO(() => x);
  }

  effect: () => T;

  constructor(effect: () => T) {
    this.effect = effect;
  }

  map<U>(f: (x: T) => U) {
    return new IO(compose(f, this.effect));
  }

  chain<U>(f: (x: T) => IO<U>) {
    const g = compose(f, this.effect);
    return new IO(compose(join, g));
  }

  fork(callback: (x: T) => void) {
    callback(this.effect());
  }
}
