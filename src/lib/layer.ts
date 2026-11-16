import { render, type VNode } from 'vue'

/**
 * 在 PDF.js 渲染出的 DOM 容器中查找（或创建）一个挂载层。
 * Vue 3 中直接使用 render(vnode, el) 向原生 DOM 节点渲染内容，
 * 替代 Vue 2 中手动 new Vue().$mount() + $slots/$forceUpdate 的写法。
 */
export const findOrCreateLayer = (
  container: HTMLElement,
  className: string
): HTMLElement => {
  const existing = container.querySelector<HTMLElement>(`.${className}`)

  if (existing) {
    return existing
  }

  const layer = document.createElement('div')
  layer.className = className
  container.appendChild(layer)

  return layer
}

/**
 * 将 vnode 渲染到容器内指定 class 的挂载层；传入 null 可清空并卸载组件。
 */
export const renderInLayer = (
  container: HTMLElement,
  className: string,
  vnode: VNode | null
): HTMLElement => {
  const layer = findOrCreateLayer(container, className)
  render(vnode, layer)
  return layer
}
