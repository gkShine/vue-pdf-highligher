import type { AreaRect } from '../types'

const getAreaAsPng = (canvas: HTMLCanvasElement | null, position: AreaRect): string => {
  const { left, top, width, height } = position

  const newCanvas = document.createElement('canvas')

  newCanvas.width = width
  newCanvas.height = height

  const newCanvasContext = newCanvas.getContext('2d')

  if (!newCanvasContext || !canvas) {
    return ''
  }

  const dpr = window.devicePixelRatio || 1

  newCanvasContext.drawImage(
    canvas,
    left * dpr,
    top * dpr,
    width * dpr,
    height * dpr,
    0,
    0,
    width,
    height
  )

  return newCanvas.toDataURL('image/png')
}

export default getAreaAsPng
