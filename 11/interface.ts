export interface ContextType<T> {
  inspect?(): any;
}

export interface FunctorType<T> extends ContextType<T> {
  map<U>(f: (x: T) => U): FunctorType<U>;
}

export interface MonadType<T> extends FunctorType<T> {
  map<U>(f: (x: T) => U): MonadType<U>;
  chain<U>(f: (x: T) => MonadType<U>): MonadType<U>;
}

export interface IOType<T> extends MonadType<T> {
  map<U>(f: (x: T) => U): IOType<U>;
  chain<U>(f: (x: T) => IOType<U>): IOType<U>;
  fork(callback: (x: T) => any): any;
}

export interface Subscriber<T> {
  next(x: T): void;
  error(err: any): void;
}

export interface ObservableType<T> extends MonadType<T> {
  map<U>(f: (x: T) => U): ObservableType<U>;
  chain<U>(f: (x: T) => ObservableType<U>): ObservableType<U>;
  subscribe(subscriber: Subscriber<T>): void;
}
