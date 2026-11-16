import { pageBoxOf } from '@embedpdf/engine'
import type { PdfRect } from '@embedpdf/engine'
import type { ScaledRect, ViewportRect } from '../types'

/**
 * 坐标转换所需的页面尺寸（PDF point，未旋转的 crop 尺寸）。
 * usePdfCoordinates 数据还需要页面的 PDF 原生 cropBox。
 */
export interface ViewportLike {
  width: number
  height: number
  pdfCropBox?: PdfRect
}

// "viewport" rectangle is { top, left, width, height }

// "scaled" means that data structure stores (0, 1) coordinates.
// for clarity reasons it was decided not to store actual (0, 1) coordinates,
// but provide width and height, so the user can compute the ratio if needed

export const viewportToScaled = (
  rect: ViewportRect,
  { width, height }: { width: number; height: number }
): ScaledRect => {
  return {
    x1: rect.left,
    y1: rect.top,

    x2: rect.left + rect.width,
    y2: rect.top + rect.height,

    width,
    height
  }
}

const pdfToViewport = (pdf: ScaledRect, viewport: ViewportLike): ViewportRect => {
  const cropBox: PdfRect = viewport.pdfCropBox ?? {
    left: 0,
    bottom: 0,
    right: viewport.width,
    top: viewport.height
  }

  const box = pageBoxOf(
    { left: pdf.x1, bottom: pdf.y1, right: pdf.x2, top: pdf.y2 },
    cropBox
  )

  // 与旧 pdfjs convertToViewportRectangle 的数值语义保持一致：
  // top 取 PDF y1 映射后的视口 y，height 为 y1 - y2 的视口差值
  return {
    left: box.x,
    top: box.y + box.height,
    width: box.width,
    height: box.height
  }
}

export const scaledToViewport = (
  scaled: ScaledRect,
  viewport: ViewportLike,
  usePdfCoordinates = false
): ViewportRect => {
  const { width, height } = viewport

  if (usePdfCoordinates) {
    return pdfToViewport(scaled, viewport)
  }

  if (scaled.x1 === undefined) {
    throw new Error('You are using old position format, please update')
  }

  const x1 = (width * scaled.x1) / scaled.width
  const y1 = (height * scaled.y1) / scaled.height

  const x2 = (width * scaled.x2) / scaled.width
  const y2 = (height * scaled.y2) / scaled.height

  return {
    left: x1,
    top: y1,
    width: x2 - x1,
    height: y2 - y1
  }
}