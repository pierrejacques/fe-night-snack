import { Component, Service, Injectable } from '@angular/core';
import { call, put } from 'redux-saga';

// redux 的例子

export const fetchNightSnack = () => new Promise(
  resolve =>
  setTimeout(() => {
    resolve({ data: '小笼包' })
  }, 10000)
)

const setNightSnack = (payload: string) => ({
  type: 'SET_NIGHT_SNACK',
  payload,
});

export function *initialize() {
  const { data } = yield call(fetchNightSnack);
  yield put(setNightSnack(data))
}

// angular 依赖注入的例子

@Injectable({
  providedIn: 'root',
})
export class NightSnackService {
  getNightSnack() {
    return Promise.resolve('串串香');
  }
}

export class App implements Component {
  nightSnack: string;

  constructor(private nightSnackService: NightSnackService) {
    this.load();
  }

  async load() {
    this.nightSnack = await this.nightSnackService.getNightSnack();
  }
}
