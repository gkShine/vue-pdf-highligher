// @flow

import optimizeClientRects from './optimize-client-rects'

const getClientRects = (
  range,
  containerEl,
  shouldOptimize = true
) => {
  const clientRects = Array.from(range.getClientRects())

  const offset = containerEl.getBoundingClientRect()

  const borderWidth = parseInt(window.getComputedStyle(containerEl).borderWidth)

  const rects = clientRects.map(rect => {
    return {
      top: rect.top + containerEl.scrollTop - offset.top - borderWidth,
      left: rect.left + containerEl.scrollLeft - offset.left - borderWidth,
      width: rect.width,
      height: rect.height
    }
  })

  return shouldOptimize ? optimizeClientRects(rects) : rects
}

export default getClientRects
