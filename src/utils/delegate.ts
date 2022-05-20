export default function delegate(
  parent: HTMLElement,
  selector: string,
  type: string,
  callback: (event: Event) => void
) {
  // 适合处理的代理的事件类型
  if (
    ['click', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress'].indexOf(
      type
    ) === -1
  ) {
    return console.error(`不建议 ${type} 事件使用事件委托`)
  }

  parent.addEventListener(type, handle)

  function handle(event: Event) {
    let target: HTMLElement = event.target as HTMLElement

    while (target !== parent) {
      // if (target.matches(selector)) {
      if ([...document.querySelectorAll(selector)].indexOf(target) !== -1) {
        callback.call(target, event)
        break
      }
      target = target.parentNode as HTMLElement
    }
  }
}
