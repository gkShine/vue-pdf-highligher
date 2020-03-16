// @flow
import Vue from 'vue'
import Div from '../components/Div'
const Layer = Vue.extend(Div)

export const getPageFromElement = target => {
  const node = target.closest('.page')

  if (!(node instanceof HTMLElement)) {
    return null
  }

  const number = Number(node.dataset.pageNumber)

  return { node, number }
}

export const getPageFromRange = range => {
  const parentElement = range.startContainer.parentElement

  if (!(parentElement instanceof HTMLElement)) {
    return
  }

  return getPageFromElement(parentElement)
}

export const findOrCreateContainerLayer = (
  container,
  className
) => {
  let layer = container.querySelector(`.${className}`)

  if (!layer) {
    layer = new Layer({ data: { className } }).$mount()
    container.appendChild(layer.$el)
  } else {
    layer = layer.__vue__
  }

  return layer
}
