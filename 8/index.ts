export function promisify<T>(input: T) {
  if (input instanceof Promise) {
    return input;
  }
  return Promise.resolve(input);
}

type Condition<T> = T extends { name: string } ? string : number;

type ConditionTest1 = Condition<{ name: string; value: number }>; // string
type ConditionTest2 = Condition<{ value: number }>; // number;

type Unpromise<T> = T extends Promise<infer U> ? U : T;

type UnpromiseTest1 = Unpromise<number>; // number
type UnpromiseTest2 = Unpromise<Promise<string>>; // strin

type Container<T> = Promise<{ value: T }>;
export function promisify2<T>(input: T): Container<Unpromise<T>> {
  if (input instanceof Promise) {
    return input.then(value => ({ value }));
  }
  return Promise.resolve({ value: input }) as Container<Unpromise<T>>;
}
