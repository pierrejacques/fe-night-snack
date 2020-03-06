interface Fork<T> {
  (reject: (e: any) => void, resolve: (x: T) => void): void;
}

interface TaskType<T> {
  map<U>(f: (x: T) => U): TaskType<U>;
  chain<U>(f: (x: T) => TaskType<U>): TaskType<U>;
  fork: Fork<T>;
}

export const Task = <T>(fork: Fork<T>): TaskType<T> => ({
  map: f => Task((reject, resolve) => fork(reject, (x: T) =>
    resolve(f(x)))),
  chain: f =>
    Task((reject, resolve) => fork(reject, (x: T) =>
      f(x).fork(reject, resolve))),
  fork,
});

Task.of = <T>(x: T): TaskType<T> => Task((_, resolve) => resolve(x))
