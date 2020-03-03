import { Maybe } from '../6';

const compose = <I, O>(f: (x: I) => O, g: () => I) => () => f(g());

const map = <T, U>(f: (x: T) => U) => (context: Maybe<T>) => context.map(f);

const chain = <T, U>(f: (x: T) => Maybe<U>) => (context: Maybe<T>) => context.chain(f);

const tryCatch = <I, O>(f: (x: I) => O) => (x: I): Maybe<O> => {
  try {
    return Maybe.of(f(x));
  } catch {
    return Maybe.of(null);
  }
}

export class Task<T> {
  static of<T>(x: T) {
    return new Task(() => x);
  }

  private value: () => T;

  constructor(value: () => T) {
    this.value = value;
  }

  map<U>(f: (x: T) => U) {
    return new Task(compose(f, this.value))
  }

  call() {
    this.value();
  }
}

export class TaskMaybe<T> {
  static of<T>(x: T) {
    return new TaskMaybe(() => Maybe.of(x));
  }

  private value: () => Maybe<T>;

  constructor(value: () => Maybe<T>) {
    this.value = value;
  }

  map<U>(f: (x: T) => U) {
    return new TaskMaybe(compose(map(f), this.value));
  }

  chain<U>(f: (x: T) => Maybe<U>) {
    return new TaskMaybe(compose(chain(f), this.value));
  }

  call() {
    this.value();
  }
}

const parse = tryCatch(JSON.parse);
const prop = (name: string) => tryCatch((x: any) => x[name]);

TaskMaybe.of(localStorage).chain(prop('studentId')).chain(parse).chain(prop('a'))
