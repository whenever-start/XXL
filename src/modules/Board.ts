import { config, GirdType, GridMatch } from '../config/index'
import delegate from '../utils/delegate'
import flatten from '../utils/flatten'
import isInRange from '../utils/isInRange'
import Grid from './Grid'
import Panel from './Panel'
import Sound from './Sound'

// 参照 .grid 中设置的 transition time
const delay = 400

class Board {
  element: HTMLElement = document.querySelector('.game .board')!
  private panel: Panel = new Panel()
  private sound: Sound = new Sound()
  private grids: Grid[][] = []
  private gridsElt: HTMLElement[] = []

  // 浏览器切换标签才开启
  private isHidden: boolean = false

  // 被激活的 grid（第一次点击）
  private active: Grid | null = null
  private eliminateTime: number = 0

  constructor() {
    this.initDom()

    // 监听点击事件
    delegate(this.element, '.game .grid', 'click', this.clickHandle.bind(this))

    // 设置 board 宽高
    this.element.style.width =
      (config.size + config.space * 2) * config.x - config.space + 'px'
    this.element.style.height =
      (config.size + config.space * 2) * config.y - config.space + 'px'

    // hack: 浏览器切换标签导致 setTimeout 异常
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isHidden) {
        // 切回页面是 grid 掉落阶段，所以需要设置延迟
        setTimeout(() => {
          const matches = this.checkAllMatch()
          if (matches.length) {
            this.eliminate(matches)
          }
        }, delay)
      }
    })
  }

  // 初始化 grid 元素
  initDom() {
    // 用字符串存储优化渲染
    let innerHTML = ''
    for (let x = 0; x < config.x; x++) {
      for (let y = 0; y < config.y; y++) {
        const domStr = `<div class="grid" data-x="${x}" data-y="${y}"></div>`
        innerHTML += domStr
      }
    }
    this.element.innerHTML = innerHTML
    this.gridsElt = [
      ...(document.querySelectorAll('.game .grid') as NodeListOf<HTMLElement>)
    ]
    this.initGrids()
  }

  // 初始化 type 和 grids
  private initGrids() {
    for (let x = 0; x < config.x; x++) {
      this.grids[x] = []
      for (let y = 0; y < config.y; y++) {
        const gridElt = this.gridsElt[x * config.y + y]
        const grid = new Grid(gridElt)
        const unMatchTypes: GirdType[] = []
        grid.x = Number(gridElt.dataset.x)
        grid.y = Number(gridElt.dataset.y)
        this.grids[x].push(grid)
        grid.setRandomType()

        // 初始化所有 type 的时候，不会出现匹配
        while (Object.keys(this.match(grid)).length > 0) {
          unMatchTypes.push(grid.type)
          grid.setOtherType(unMatchTypes)
        }
      }
    }
  }

  // 点击事件处理函数
  private clickHandle(event: Event) {
    // 1. 点击切换样式
    //  a：不相邻：切换样式
    //  b：相邻：都激活 - 交换 - 都不激活
    //  c：同一个
    // 2. 交换 - 两个点检查匹配
    //  a：无匹配：换回来
    // b：有匹配：消除 - 更新+掉落 - 再检查匹配
    const gridElt: HTMLElement = event.target as HTMLElement

    let x = Number(gridElt.dataset.x)
    let y = Number(gridElt.dataset.y)
    const grid = this.grids[x][y]

    this.sound.click()
    // 还未激活任何 grid
    if (!this.active) {
      this.active = grid
      gridElt.classList.add('active')
      return
    }

    // 点击的是已激活的 grid
    if (this.active === grid) {
      this.active = null
      gridElt.classList.remove('active')
      return
    }

    let activePos: [number, number] = [this.active.x, this.active.y]
    let gridPos: [number, number] = [grid.x, grid.y]

    // 判断两个 grid 是否相邻
    if (this.isNextTo(activePos, gridPos)) {
      // 相邻
      let temp = this.active
      gridElt.classList.add('active')
      this.swap(activePos, gridPos)

      // 开始交换时关闭点击事件
      // 开启时机1：匹配失败交换回来
      // 开启时机2：最终匹配结束
      this.nonClick()

      // 交换后判断是否匹配
      const allMatch: GridMatch[] = []
      let activeMatch = this.match(temp)
      let gridMatch = this.match(grid)

      if (Object.keys(activeMatch).length) {
        allMatch.push(activeMatch)
      }
      if (Object.keys(gridMatch).length) {
        allMatch.push(gridMatch)
      }

      // 若交换后有匹配则消除，否则换回来
      if (allMatch.length) {
        this.eliminate(this.mergeMatch(allMatch))
      } else {
        // 交换后无匹配，延时换回来
        setTimeout(() => {
          this.swap(activePos, gridPos)
          this.reClick()
        }, delay)
      }
    } else {
      // 不相邻
      this.active.element.classList.remove('active')
      gridElt.classList.add('active')
      this.active = grid
    }
  }

  // 是否相邻
  private isNextTo(a: [number, number], b: [number, number]): boolean {
    let isX = a[0] === b[0] && Math.abs(a[1] - b[1]) === 1
    let isY = a[1] === b[1] && Math.abs(a[0] - b[0]) === 1
    return isX || isY
  }

  // 交换两个 grid 位置，包括 grids 数组中的位置
  private swap(a: [number, number], b: [number, number]) {
    this.sound.swap()

    let [ax, ay] = a
    let [bx, by] = b

    // x y
    this.grids[ax][ay].x = bx
    this.grids[ax][ay].y = by
    this.grids[bx][by].x = ax
    this.grids[bx][by].y = ay

    this.grids[ax][ay].element.classList.remove('active')
    this.grids[bx][by].element.classList.remove('active')
    this.active = null

    // grids
    let temp = this.grids[ax][ay]
    this.grids[ax][ay] = this.grids[bx][by]
    this.grids[bx][by] = temp
  }

  // 检查元素是否匹配，并返回所有匹配元素的坐标集合
  private match(grid: Grid): GridMatch {
    const m: GridMatch = {}
    const xRange: [number, number] = [0, config.x - 1]
    const yRange: [number, number] = [0, config.y - 1]
    let x = grid.x
    let y = grid.y

    let upY = y - 1
    let downY = y + 1
    let leftX = x - 1
    let rightX = x + 1

    // up
    while (
      isInRange(upY, yRange) &&
      this.isTheSameType(this.grids[x][upY], grid)
    ) {
      upY--
    }
    // down
    while (
      isInRange(downY, yRange) &&
      downY < this.grids[x].length &&
      this.isTheSameType(this.grids[x][downY], grid)
    ) {
      downY++
    }
    // left
    while (
      isInRange(leftX, xRange) &&
      this.isTheSameType(this.grids[leftX][y], grid)
    ) {
      leftX--
    }
    // right
    while (
      isInRange(rightX, xRange) &&
      rightX < this.grids.length &&
      this.isTheSameType(this.grids[rightX][y], grid)
    ) {
      rightX++
    }

    // x轴
    if (rightX - leftX >= 4) {
      for (let i = leftX + 1; i < rightX; i++) {
        m[i] = [y]
      }
    }

    // y轴
    if (downY - upY >= 4) {
      m[x] = []
      for (let i = upY + 1; i < downY; i++) {
        m[x].push(i)
      }
    }

    return m
  }

  // 检查所有 grid 是否匹配
  private checkAllMatch() {
    const allGridMatch: GridMatch = {}
    const matches: GridMatch[] = []

    // allGridMatch: 所有 grid 都要检查
    for (let x = 0; x < config.x; x++) {
      allGridMatch[x] = []
      for (let y = 0; y < config.y; y++) {
        allGridMatch[x].push(y)
      }
    }

    // 所有匹配的 grid
    flatten(this.grids).forEach((grid) => {
      const m = this.match(grid)
      if (Object.keys(m).length) {
        matches.push(m)
      }
    })

    return matches
  }

  // 检查两个 grid 的 type 是否匹配
  private isTheSameType(a: Grid, b: Grid) {
    return a.type === b.type
  }

  // 上移 - 下移 - 维护 grids
  private eliminate(matches: GridMatch[]) {
    // 所有掉落的 grid 集合
    const allDrops: Grid[] = []
    const allMatch: GridMatch[] = []
    const match = this.parseMerge(matches)

    this.eliminateActive(match)

    this.eliminateTime++
    this.sound.eliminate(this.eliminateTime)

    // 单次消除步骤
    setTimeout(() => {
      for (let x in match) {
        let maxY = match[x][match[x].length - 1]
        const clearGrids: Grid[] = []
        const dropGrids: Grid[] = []

        // 计算 clearGrids
        match[x].forEach((y) => {
          clearGrids.push(this.grids[Number(x)][y])
        })

        // 计算 dropGrids
        dropGrids.push(...clearGrids)
        for (let y = 0; y < maxY; y++) {
          const grid: Grid = this.grids[x][y]
          if (!dropGrids.includes(grid)) {
            dropGrids.push(grid)
          }
        }

        // 暂停 transition
        this.swapTransition(clearGrids)

        // 上移
        clearGrids.forEach((grid) => {
          grid.y = grid.y - maxY - 1
          // grid.type = -1
          grid.setRandomType()
        })

        // 下移
        setTimeout(() => {
          dropGrids.forEach((grid, index) => {
            window.requestAnimationFrame(() => {
              grid.y = index
            })
          })
        }, 200)

        // 维护 grids
        dropGrids.forEach((grid, index) => {
          this.grids[x][index] = grid
        })

        // allDrops
        allDrops.push(...dropGrids)
      }

      this.sound.drop()

      // 计分
      this.setScore(matches)
    }, delay)

    // 递归检查 allDrops 中的所有 grid
    setTimeout(() => {
      allDrops.forEach((grid) => {
        try {
          let gridMatch = this.match(grid)
          if (Object.keys(gridMatch).length) {
            allMatch.push(gridMatch)
          }
        } catch (error) {
          this.isHidden = true
        }
      })
      if (allMatch.length) {
        this.eliminate(this.mergeMatch(allMatch))
      } else {
        // 最终匹配结束，恢复可点击
        this.reClick()
        this.eliminateTime = 0
      }
    }, delay + 500)
  }

  // 将多个 GridMatch 整合成一个 GridMatch
  private parseMerge(matches: GridMatch[]) {
    // 合并多个 GridMatch
    const merge: GridMatch = {}

    matches.forEach((match) => {
      for (let x in match) {
        if (!merge.hasOwnProperty(x)) {
          merge[x] = [...match[x]]
        } else {
          merge[x].push(...match[x])
          merge[x] = [...new Set(merge[x])]
          merge[x].sort((a, b) => a - b)
        }
      }
    })

    return merge
  }

  // 合并：去除重复项、包含项
  private mergeMatch(matches: GridMatch[]) {
    // match === mergeItem: 忽略
    // match > mergeItem: match 替换 mergeItem
    // match < mergeItem: 忽略
    // match 和 mergeItem 不相等也互不包含：push
    const merge: GridMatch[] = []
    // reg: {"11":[2],"12":[2],"13":[2],"14":[2]} => 112122132142
    let reg = /([^\d])/g

    matches.forEach((match) => {
      const matchStr = JSON.stringify(match).replace(reg, '')
      let notContain = true
      for (let i = 0, len = merge.length; i < len; i++) {
        let mergeItemStr = JSON.stringify(merge[i]).replace(reg, '')

        if (matchStr === mergeItemStr) {
          // 相等
          notContain = false
          break
        } else if (matchStr.indexOf(mergeItemStr) !== -1) {
          // match > mergeItem
          notContain = false
          merge[i] = match
          break
        } else if (mergeItemStr.indexOf(matchStr) !== -1) {
          // match < mergeItem
          notContain = false
          break
        }
      }
      // 不是包含和相等关系
      if (notContain) {
        merge.push(match)
      }
    })

    let matchCount = merge.reduce((acc, gridMatch) => {
      return acc + this.getMatchLength(gridMatch)
    }, 0)
    this.sound.match(matchCount)

    return merge
  }

  // 计分
  private setScore(matches: GridMatch[]) {
    let score = 0

    matches.forEach((match) => {
      score += Object.values(match).reduce(
        (acc, value) => acc + this.panel.convertToScore(value.length),
        0
      )
    })

    this.panel.increase(score)
  }

  // 获取 match len
  getMatchLength(match: GridMatch) {
    return Object.values(match).reduce((acc, yArray) => acc + yArray.length, 0)
  }

  // 暂停 grid 的 transition
  private swapTransition(grids: Grid[]) {
    grids.forEach((grid) => {
      grid.element.classList.add('non-transition')
      setTimeout(() => {
        grid.element.classList.remove('non-transition')
      }, 20)
    })
  }

  // 暂时给 match grid 添加 match 样式
  private eliminateActive(match: GridMatch) {
    for (let x in match) {
      match[x].forEach((y) => {
        const grid = this.grids[x][y]
        grid.element.classList.add('match')
        setTimeout(() => {
          grid.element.classList.remove('match')
        }, delay - 100)
      })
    }
  }

  private nonClick() {
    this.element.classList.add('non-click')
  }

  private reClick() {
    this.element.classList.remove('non-click')
  }
}
export default Board
