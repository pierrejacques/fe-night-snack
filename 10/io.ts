function compose<T, U> (f: (x: T) => U, g: () => T) {
  return () => f(g());
}

export class IO<T> {
  private value: () => T;

  of<T>(x: T) {
    return new IO(() => x);
  }

  constructor(value: () => T) {
    this.value = value;
  }

  map<U>(f: (x: T) => U) {
    return new IO(compose(f, this.value));
  }

  join() {
    return this.value; // FIXME:
  }

  chain<U>(f: (x: T) => IO<U>) {
    return this.map(f).join();
  }

  fork(callback: (x: T) => void) {
    callback(this.value());
  }
}
