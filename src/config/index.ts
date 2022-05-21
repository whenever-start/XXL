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

// music
export const musicClick: string = require('../assets/music/click.mp3')

export const musicDrop: string = require('../assets/music/drop.mp3')

export const musicSwap: string = require('../assets/music/swap.mp3')

export const musicEliminate: { [count: number]: string } = {
  1: require('../assets/music/eliminate1.mp3'),
  2: require('../assets/music/eliminate2.mp3'),
  3: require('../assets/music/eliminate3.mp3'),
  4: require('../assets/music/eliminate4.mp3'),
  5: require('../assets/music/eliminate5.mp3'),
  6: require('../assets/music/eliminate6.mp3'),
  7: require('../assets/music/eliminate7.mp3'),
  8: require('../assets/music/eliminate8.mp3')
}

export const musicMatch: { [count: number]: string } = {
  3: require('../assets/music/match3.mp3'),
  5: require('../assets/music/match5.mp3'),
  7: require('../assets/music/match7.mp3'),
  9: require('../assets/music/match9.mp3'),
  11: require('../assets/music/match11.mp3')
}
