import { scoreMap } from '../config/index'

class Panel {
  // score: number
  scoreElt: HTMLElement = document.querySelector('.panel-score')!

  constructor() {
    this.score = 0
  }

  set score(value: number) {
    this.scoreElt.innerHTML = value + ''
  }

  get score() {
    return Number(this.scoreElt.innerHTML)
  }

  increase(value: number) {
    this.score += value
  }

  convertToScore(count: number) {
    if (count < 3) {
      return 0
    }

    // ! 用于测试
    if (count > 7) {
      return scoreMap[5] + count - 5
    }
    return scoreMap[count]
  }

  // 清零
  zero() {
    this.score = 0
  }
}
export default Panel
