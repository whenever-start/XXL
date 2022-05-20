// type
export enum GirdType {
  chicken = 0,
  sheep,
  pig,
  cat
}

// type 与 src 的映射
export const typeMap = {
  [GirdType.chicken]: require('../assets/img/0.png'),
  [GirdType.sheep]: require('../assets/img/1.png'),
  [GirdType.pig]: require('../assets/img/2.png'),
  [GirdType.cat]: require('../assets/img/3.png')
}

// 面板配置
export const config = {
  size: 48,
  space: 2,
  x: 15,
  y: 15
}

// 匹配 grid 以 { x:[y1, y2...], ... } 格式存储
export type GridMatch = {
  [x: number]: number[]
}

// count 与 score 映射
export const scoreMap: { [count: number]: number } = {
  3: 3,
  4: 6,
  5: 10,
  6: 12,
  7: 15
}
