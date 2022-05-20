# 消消乐

## modules

- `Game`：游戏总控制
- `Board`：游戏面板、游戏区域
- `Grid`：游戏格子
- `Panel`：分数面板

## config

- `GridType`

## 解决的问题

### 浏览器切换标签导致 `setTimeout` 异常

用 `visibilitychange` 来处理

[页面可见性改变事件 : visibilitychange 详解](https://www.jianshu.com/p/e905584f8ed2?tdsourcetag=s_pcqq_aiomsg)

```js
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
```
