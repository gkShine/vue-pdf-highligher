import type { ViewportRect } from '../types'

interface Bounds {
  X0: number
  X1: number
  Y0: number
  Y1: number
}

const getBoundingRect = (clientRects: Array<DOMRect | ViewportRect>): ViewportRect => {
  const rects = Array.from(clientRects).map(rect => {
    const { left, top, width, height } = rect

    return {
      X0: left,
      X1: left + width,
      Y0: top,
      Y1: top + height
    }
  })

  const optimal = rects.reduce<Bounds>((res, rect) => {
    return {
      X0: Math.min(res.X0, rect.X0),
      X1: Math.max(res.X1, rect.X1),
      Y0: Math.min(res.Y0, rect.Y0),
      Y1: Math.max(res.Y1, rect.Y1)
    }
  }, rects[0])

  const { X0, X1, Y0, Y1 } = optimal

  return {
    left: X0,
    top: Y0,
    width: X1 - X0,
    height: Y1 - Y0
  }
}

export default getBoundingRect
