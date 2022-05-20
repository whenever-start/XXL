import { GirdType, typeMap, config } from '../config/index'

class Grid {
  element: HTMLElement
  private _type: GirdType = -1
  constructor(element: HTMLElement) {
    this.element = element
    element.style.width = config.size + 'px'
    element.style.height = config.size + 'px'
  }

  get x(): number {
    return Number(this.element.dataset.x)
  }

  set x(value: number) {
    this.element.style.left = value * (config.size + config.space * 2) + 'px'
    this.element.dataset.x = value + ''
  }

  get y(): number {
    return Number(this.element.dataset.y)
  }

  set y(value: number) {
    this.element.style.top = value * (config.size + config.space * 2) + 'px'
    this.element.dataset.y = value + ''
  }

  get type(): GirdType {
    return this._type
  }

  set type(value: GirdType) {
    this._type = value
    if (this._type === -1!) {
      this.element.style.backgroundImage = ''
      return
    }
    window.requestAnimationFrame(() => {
      this.element.style.backgroundImage = `url(${typeMap[value]})`
    })
  }

  setRandomType() {
    let randomType: GirdType = Math.floor(
      (Math.random() * Object.keys(GirdType).length) / 2
    )
    this.type = randomType
  }

  // 设置与 types 中 type 不同的 type
  setOtherType(types: GirdType[]) {
    let len = Object.keys(GirdType).length / 2
    let values = Object.keys(GirdType).slice(0, len)
    let restTypes: GirdType[] = []

    values.forEach((value) => {
      if (!types.includes(Number(value))) {
        restTypes.push(Number(value))
      }
    })

    let randomType = restTypes[Math.floor(restTypes.length * Math.random())]
    this.type = randomType
  }
}
export default Grid
