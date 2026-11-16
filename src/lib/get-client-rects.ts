import type { ViewportRect } from '../types'
import optimizeClientRects from './optimize-client-rects'

const getClientRects = (
  range: Range,
  containerEl: HTMLElement,
  shouldOptimize = true
): ViewportRect[] => {
  const offset = containerEl.getBoundingClientRect()

  const borderWidth = parseInt(window.getComputedStyle(containerEl).borderWidth, 10) || 0

  // PDF.js 文字层在选区边界会返回零宽/零高的退化矩形（caret），
  // 它们的 left/top 可能落在页面原点，会污染包围盒计算，需过滤掉
  const clientRects = Array.from(range.getClientRects()).filter(
    rect => rect.width > 0 && rect.height > 0
  )

  const rects: ViewportRect[] = clientRects.map(rect => {
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
