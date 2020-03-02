export function promisify<T>(input: T) {
  if (input instanceof Promise) {
    return input;
  }
  return Promise.resolve(input);
}
