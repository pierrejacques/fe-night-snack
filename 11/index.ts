import { IOType, ObservableType, Subscriber } from "./interface";

export const compose = <I, O, M>(f: (x: M) => O, g: (x?: I) => M) => (x?: I) => f(g(x));

/**
 * 异步函子（无错误处理）
 */
type ResolveType<T> = (x: T) => void;
export const Task = <T>(fork: IOType<T>['fork']): IOType<T> => ({
  map: <U>(f: (x: T) => U) =>
    Task((resolve: ResolveType<U>) => fork(compose(resolve, f))),
  chain: <U>(f: (x: T) => IOType<U>) =>
    Task((resolve: ResolveType<U>) => fork((x: T) => f(x).fork(resolve))),
  fork,
});
Task.of = <T>(x: T) => Task(resolve => resolve(x))

/**
 * 类似订阅模式的异步函子
 */
export const Observable = <T>(subscribe: ObservableType<T>['subscribe']): ObservableType<T> => ({
  map: <U>(f: (x: T) => U) =>
    Observable(({ next, error }: Subscriber<U>) => subscribe({
      next: compose(next, f),
      error
    })),
  chain: <U>(f: (x: T) => ObservableType<U>) =>
    Observable((subscriber: Subscriber<U>) => subscribe({
      next: (x: T) => f(x).subscribe(subscriber),
      error: subscriber.error
    })),
  subscribe,
});
Observable.of = <T>(x: T) => Observable(subscriber => subscriber.next(x));
