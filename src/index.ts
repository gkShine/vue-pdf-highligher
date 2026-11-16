import PdfHighlighter from './components/PdfHighlighter.vue'

export default PdfHighlighter
export { default as PdfHighlighter } from './components/PdfHighlighter.vue'
export { default as OutlineItem } from './components/OutlineItem.vue'
export type { OutlineNode } from './components/OutlineItem.vue'

export type { PdfViewerHandle } from './lib/viewer-handle'

export type {
  Highlight,
  HighlightComment,
  HighlightContent,
  ScaledPosition,
  ScaledRect,
  ViewportPosition,
  ViewportRect
} from './types'
