import { put, call } from 'redux-saga';
import { fetchNightSnack, initialize } from './index';

describe('测试 initialize 流程', () => {
  const gen = initialize();

  it('会发起一个 fetchNightSnack 的请求', () => {
    expect(
      gen.next().value
    ).toEqual(
      call(fetchNightSnack, { limit: 2 })
    );
  })

  it('会触发一个 SET_NIGHT_SNACK 的 action', () => {
    expect(
      gen.next({ data: '小笼包' }).value
    ).toEqual(
      put({ type: 'SET_NIGHT_SNACK', payload: '小笼包' })
    )
  })

  it('应当结束流程', () => {
    expect(
      gen.next()
    ).toEqual(
      { done: true, value: undefined }
    )
  })
})

