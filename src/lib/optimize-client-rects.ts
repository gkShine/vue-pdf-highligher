import type { ViewportRect } from '../types'

const sort = (rects: ViewportRect[]) =>
  rects.sort((a, b) => {
    const top = a.top - b.top

    if (top === 0) {
      return a.left - b.left
    }

    return top
  })

const overlaps = (a: ViewportRect, b: ViewportRect) =>
  a.left <= b.left && b.left <= a.left + a.width

// yMargin: from 5 to 10
const sameLine = (a: ViewportRect, b: ViewportRect, yMargin = 10) =>
  Math.abs(a.top - b.top) < yMargin && Math.abs(a.height - b.height) < yMargin

const inside = (a: ViewportRect, b: ViewportRect) =>
  a.top > b.top &&
  a.left > b.left &&
  a.top + a.height < b.top + b.height &&
  a.left + a.width < b.left + b.width

const nextTo = (a: ViewportRect, b: ViewportRect, xMargin = 10) => {
  const aRight = a.left + a.width
  const bRight = b.left + b.width

  return a.left <= b.left && aRight <= bRight && b.left - aRight <= xMargin
}

const extendWidth = (a: ViewportRect, b: ViewportRect) => {
  // extend width of A to cover B
  a.width = Math.max(b.width - a.left + b.left, a.width)
}

const optimizeClientRects = (clientRects: ViewportRect[]): ViewportRect[] => {
  const rects = sort(clientRects)

  const toRemove = new Set<ViewportRect>()

  const firstPass = rects.filter(rect => {
    return rects.every(otherRect => {
      return !inside(rect, otherRect)
    })
  })

  let passCount = 0

  while (passCount <= 2) {
    firstPass.forEach(a => {
      firstPass.forEach(b => {
        if (a === b || toRemove.has(a) || toRemove.has(b)) {
          return
        }

        if (!sameLine(a, b)) {
          return
        }

        if (overlaps(a, b)) {
          extendWidth(a, b)
          a.height = Math.max(a.height, b.height)

          toRemove.add(b)
        }

        if (nextTo(a, b)) {
          extendWidth(a, b)

          toRemove.add(b)
        }
      })
    })
    passCount += 1
  }

  return firstPass.filter(rect => !toRemove.has(rect))
}

export default optimizeClientRects
