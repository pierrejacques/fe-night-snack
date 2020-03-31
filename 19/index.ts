import { useRef } from 'react';

// 回顾 TS 的类型推断策略

const immutableString = 'Acid Mother Template';
let mutableString = 'Robert Fripp';

// 在 Hooks 使用 as const

const useRenderlessState = <S>(initialState: S) => {
  const stateRef = useRef(initialState);

  return [
    stateRef.current,
    (nextState: S) => stateRef.current = nextState
  ] as const;
}

export const [value, setValue] = useRenderlessState(1);

// as const 会推到最深层

export const albumsByStyle = {
  psychodelic: {
    'magical-mystery-tour': 1967,
    'the-piper-at-the-gates-of-dawn': 1967,
  },
  glam: {
    'a-night-at-the-opera': 1975,
    'diamond-dogs': 1974,
  }
} as const;

// 作为枚举使用

export const EnvEnum = {
  Development: 'dev',
  Production: 'prod',
  Testing: 'test',
} as const

type ValueOf<T> = T[keyof T]

type EnvEnumType = ValueOf<typeof EnvEnum>;

export const env: EnvEnumType = EnvEnum.Development;
