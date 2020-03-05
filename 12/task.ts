const Task = fork => ({
  map: f => Task((reject, resolve) => fork(reject, a =>
        resolve(f(a)))),
  chain: f =>
    Task((reject, resolve) => fork(reject, a =>
        f(a).fork(reject, resolve))),
  fork,
})
Task.of = a => Task((_, resolve) => resolve(a))
