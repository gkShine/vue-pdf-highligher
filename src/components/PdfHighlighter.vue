<template>
  <div ref="rootRef" :class="{ 'sidebar-open': visibleSlide }" @mousedown="onMouseDown">
    <transition name="slide">
      <Preview
        v-if="pdfDocument"
        v-show="visibleSlide"
        :pdf-document="pdfDocument"
        :is-preview-enabled="visibleSlide"
        :current-page="currentPage"
        :page-count="pdfDocument.numPages"
        @page-focus="handlePageFocus"
      />
    </transition>

    <div ref="containerRef" class="pdf-highlighter" @contextmenu.prevent>
      <div class="pdfViewer" />
      <MouseSelection
        v-if="!readOnly && enableAreaSelection"
        ref="selectionRef"
        :should-start="shouldStart"
        @dragstart="toggleTextSelection(true)"
        @dragend="toggleTextSelection(false)"
        @change="onAreaSelectionVisibilityChange"
        @selection="handleSelection"
      />
    </div>

    <div class="hint" :style="{ opacity: hintOpacity }">
      <div class="hint-container">{{ i18n.t('hint-message') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, onBeforeUnmount, onMounted, ref, render, shallowRef, watch } from 'vue'
import type { VNode } from 'vue'
import { debounce } from 'lodash'
import device from 'current-device'
import Hammer from 'hammerjs'
import type { PDFDocumentProxy } from 'pdfjs-dist'

import pdfjs, { PDFLinkService, PDFViewer, EventBus } from '../lib/pdfjs'
import i18n from '../lib/i18n'
import getBoundingRect from '../lib/get-bounding-rect'
import getClientRects from '../lib/get-client-rects'
import getAreaAsPng from '../lib/get-area-as-png'
import { renderInLayer } from '../lib/layer'
import { getPageFromElement, getPageFromRange } from '../lib/pdfjs-dom'
import { scaledToViewport, viewportToScaled } from '../lib/coordinates'
import type { ViewportLike } from '../lib/coordinates'

import MouseSelection from './MouseSelection.vue'
import TipContainer from './TipContainer.vue'
import Popup from './Popup.vue'
import Tip from './Tip.vue'
import Preview from './Preview.vue'

import type {
  Highlight,
  HighlightComment,
  HighlightContent,
  ScaledRect,
  ScaledPosition,
  TipPosition,
  ViewportHighlight,
  ViewportPosition,
  ViewportRect
} from '../types'

const EMPTY_ID = 'empty-id'
const HIGHLIGHT_LAYER_CLASS = 'pdf-highlighter__highlight-layer'
const TIP_LAYER_CLASS = 'pdf-highlighter__tip-layer'

const props = withDefaults(
  defineProps<{
    url?: string
    password?: string
    /** 如何启用框选批注（返回 true 时按下鼠标开始框选） */
    enableAreaSelection?: (event: MouseEvent) => boolean
    highlights?: Highlight[]
    /** 是否激活 */
    isActive?: boolean
    /** 允许更新高亮 */
    editable?: boolean
    /** 只读模式: 只初始化 pdf 预览，不提供批注交互 */
    readOnly?: boolean
    /**
     * 渲染方式。pdf.js v6 已移除 SVG 渲染器，仅支持 canvas，
     * 保留该属性仅为向后兼容。
     */
    renderer?: 'canvas' | 'svg'
    lang?: Record<string, string>
    cMapUrl?: string
    scrollMargin?: number
    withCredentials?: boolean
  }>(),
  {
    highlights: () => [],
    isActive: true,
    editable: true,
    readOnly: false,
    renderer: 'canvas',
    withCredentials: false
  }
)

const emit = defineEmits<{
  loaded: [payload: { viewer: PDFViewer; page: { current: number; total: number } }]
  change: [payload: { viewer: PDFViewer; page: { current: number; total: number } }]
  scroll: []
  'add-highlight': [payload: { content: HighlightContent; position: ScaledPosition; comment: HighlightComment }]
  'update-highlight': [
    id: string | number,
    position: { boundingRect: ScaledRect },
    content: { image: string }
  ]
  'remove-highlight': [highlight: Highlight]
  'select-highlight': [highlight: Highlight]
  error: [error: unknown, retry: (password?: string) => void]
}>()

const rootRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const selectionRef = ref<InstanceType<typeof MouseSelection> | null>(null)

const pdfDocument = shallowRef<PDFDocumentProxy | null>(null)
const hintOpacity = ref(0)
const visibleSlide = ref(false)
const currentPage = ref(1)

let viewer: PDFViewer | null = null
const linkService = new PDFLinkService()
const eventBus = new EventBus()
const touchEnable = device.tablet() || device.mobile()

const ghostHighlight = shallowRef<Highlight | null>(null)
const isCollapsed = ref(true)
const isAreaSelectionInProgress = ref(false)

let range: Range | null = null
let scrolledToHighlightId: string | number = EMPTY_ID
let isPresentationMode = false
let tip: { highlight: ViewportHighlight; callback: (highlight: ViewportHighlight) => VNode } | null = null
let hammer: HammerManager | null = null
let hintTimer: ReturnType<typeof setTimeout> | null = null

const debouncedAfterSelection = debounce(() => afterSelection(), 500)

i18n.set(props.lang)

const viewerElement = (): HTMLElement | null => {
  const el = viewer?.viewer
  return el instanceof HTMLElement ? el : null
}

const handlePageFocus = (pageNumber: number) => {
  if (!viewer) return

  viewer.container.removeEventListener('scroll', onScroll)
  currentPage.value = pageNumber
  viewer.scrollPageIntoView({ pageNumber })
  setTimeout(() => {
    viewer?.container.addEventListener('scroll', onScroll)
  }, 100)
}

const handleCommand = (command: string, factor = 1.1) => {
  if (!viewer) return

  let newScale: number | string

  switch (command) {
    case 'toggleSlide':
      visibleSlide.value = !visibleSlide.value
      break
    case 'zoomOut':
      newScale = viewer.currentScale
      newScale = (Number(newScale) / factor).toFixed(2)
      newScale = Math.floor(Number(newScale) * 10) / 10
      newScale = Math.max(0.1, Number(newScale))
      viewer.currentScaleValue = String(newScale)
      break
    case 'zoomIn':
      newScale = viewer.currentScale
      newScale = (Number(newScale) * factor).toFixed(2)
      newScale = Math.ceil(Number(newScale) * 10) / 10
      newScale = Math.min(10.0, Number(newScale))
      viewer.currentScaleValue = String(newScale)
      break
    case 'presentationMode':
      if (isPresentationMode) {
        document.exitFullscreen()
        isPresentationMode = false
      } else if (rootRef.value && 'requestFullscreen' in rootRef.value) {
        rootRef.value.requestFullscreen()
        isPresentationMode = true
      }
      break
  }
}

const shouldStart = (event: MouseEvent): boolean => {
  return (
    props.isActive &&
    !!props.enableAreaSelection?.(event) &&
    event.target instanceof HTMLElement &&
    Boolean(event.target.closest('.page'))
  )
}

const scaledPositionToViewport = (position: ScaledPosition): ViewportPosition => {
  const viewport = viewer!.getPageView(position.pageNumber - 1).viewport as ViewportLike

  return {
    boundingRect: scaledToViewport(position.boundingRect, viewport, position.usePdfCoordinates),
    rects: (position.rects || []).map(rect =>
      scaledToViewport(rect, viewport, position.usePdfCoordinates)
    ),
    pageNumber: position.pageNumber
  }
}

const viewportPositionToScaled = (position: ViewportPosition): ScaledPosition => {
  const viewport = viewer!.getPageView(position.pageNumber - 1).viewport as ViewportLike

  return {
    boundingRect: viewportToScaled(position.boundingRect, viewport),
    rects: (position.rects || []).map(rect => viewportToScaled(rect, viewport)),
    pageNumber: position.pageNumber
  }
}

const screenshot = (position: ViewportRect, pageNumber: number): string => {
  const canvas = viewer!.getPageView(pageNumber - 1).canvas as HTMLCanvasElement | null
  return getAreaAsPng(canvas, position)
}

const findOrCreateHighlightLayer = (pageNumber: number): HTMLElement | null => {
  const textLayer = viewer?.getPageView(pageNumber - 1)?.textLayer
  return textLayer?.div ?? null
}

const groupHighlightsByPage = (highlights: Highlight[]): Record<string, Highlight[]> => {
  return [...highlights, ghostHighlight.value]
    .filter((h): h is Highlight => Boolean(h))
    .reduce<Record<string, Highlight[]>>((result, highlight) => {
      const { pageNumber } = highlight.position
      const key = String(pageNumber)
      result[key] = result[key] || []
      result[key].push(highlight)
      return result
    }, {})
}

const showTip = (highlight: ViewportHighlight, content: VNode) => {
  const highlightInProgress = !isCollapsed.value || ghostHighlight.value

  if (highlightInProgress || isAreaSelectionInProgress.value) {
    return
  }

  renderTipAtPosition(highlight.position, content)
}

const handleSelection = (
  startTarget: HTMLElement,
  boundingRect: ViewportRect,
  resetSelection: () => void
) => {
  const page = getPageFromElement(startTarget)

  if (!page) {
    return
  }

  const pageBoundingRect: ViewportRect = {
    ...boundingRect,
    top: boundingRect.top - page.node.offsetTop,
    left: boundingRect.left - page.node.offsetLeft
  }

  const viewportPosition: ViewportPosition = {
    boundingRect: pageBoundingRect,
    rects: [],
    pageNumber: page.number
  }

  const scaledPosition = viewportPositionToScaled(viewportPosition)
  const image = screenshot(pageBoundingRect, page.number)

  renderTipAtPosition(
    viewportPosition,
    onSelectionFinished(
      scaledPosition,
      { image },
      () => hideTipAndSelection(),
      () => {
        ghostHighlight.value = {
          isGhost: true,
          position: scaledPosition,
          content: { image }
        }
        resetSelection()
        renderHighlights()
      }
    )
  )
}

const hideTipAndSelection = () => {
  const viewerEl = viewerElement()
  if (viewerEl) {
    renderInLayer(viewerEl, TIP_LAYER_CLASS, null)
  }

  ghostHighlight.value = null
  tip = null
  renderHighlights()
}

const onTextLayerRendered = () => {
  renderHighlights()
}

const scrollTo = (highlight: Highlight) => {
  const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position

  const pageViewport = viewer!.getPageView(pageNumber - 1).viewport as ViewportLike

  const scrollMargin =
    props.scrollMargin || Math.round(window.innerHeight / 4)

  viewer!.scrollPageIntoView({
    pageNumber,
    destArray: [
      null,
      { name: 'XYZ' },
      ...pageViewport.convertToPdfPoint(
        0,
        scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
          scrollMargin
      ),
      0
    ]
  })

  selectHighlight(highlight)
}

const selectHighlight = (highlight: Highlight) => {
  if (!viewer) return

  viewer.container.removeEventListener('scroll', onScroll)
  scrolledToHighlightId = highlight.id ?? EMPTY_ID
  renderHighlights()

  // 等待滚动结束
  setTimeout(() => {
    viewer?.container.addEventListener('scroll', onScroll)
  }, 100)
}

const afterSelection = () => {
  if (!props.isActive) {
    return
  }

  if (!range || isCollapsed.value) {
    return
  }

  const page = getPageFromRange(range)

  if (!page) {
    return
  }

  const rects = getClientRects(range, page.node)

  if (rects.length === 0) {
    return
  }

  const boundingRect = getBoundingRect(rects)

  const viewportPosition: ViewportPosition = { boundingRect, rects, pageNumber: page.number }

  const content: HighlightContent = {
    text: range.toString()
  }
  const scaledPosition = viewportPositionToScaled(viewportPosition)

  renderTipAtPosition(
    viewportPosition,
    onSelectionFinished(
      scaledPosition,
      content,
      () => hideTipAndSelection(),
      () => {
        ghostHighlight.value = { isGhost: true, position: scaledPosition }
        renderHighlights()
      }
    )
  )
}

const onSelectionChange = () => {
  const selection = window.getSelection()

  if (!selection || selection.isCollapsed) {
    isCollapsed.value = true
    return
  }

  const currentRange = selection.getRangeAt(0)

  if (!currentRange) {
    return
  }

  isCollapsed.value = false
  range = currentRange

  debouncedAfterSelection()
}

const onScroll = () => {
  emit('scroll')
  scrolledToHighlightId = EMPTY_ID
  renderHighlights()
  viewer?.container.removeEventListener('scroll', onScroll)
}

const onMouseDown = (event: MouseEvent) => {
  if (!(event.target instanceof HTMLElement)) {
    return
  }

  if (event.target.closest('.pdf-highlighter__tip-container')) {
    return
  }

  hideTipAndSelection()
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.code === 'Escape') {
    hideTipAndSelection()
  }
}

const toggleTextSelection = (flag: boolean) => {
  viewerElement()?.classList.toggle('pdf-highlighter--disable-selection', flag)
}

const onSelectionFinished = (
  position: ScaledPosition,
  content: HighlightContent,
  hideTip: () => void,
  transformSelection: () => void
): VNode => {
  return h(Tip, {
    onOpen: transformSelection,
    onCancel: () => hideTip(),
    onConfirm: (comment: HighlightComment) => {
      emit('add-highlight', { content, position, comment })
      hideTip()
    }
  })
}

const renderHighlights = () => {
  if (!pdfDocument.value || !viewer) return

  const highlightsByPage = groupHighlightsByPage(props.highlights)

  for (let pageNumber = 1; pageNumber <= pdfDocument.value.numPages; pageNumber++) {
    const textLayerDiv = findOrCreateHighlightLayer(pageNumber)

    if (!textLayerDiv) {
      continue
    }

    const pageView = viewer.getPageView(pageNumber - 1)
    const pageViewport = pageView.viewport as ViewportLike

    const children = (highlightsByPage[String(pageNumber)] || []).map(
      (highlight, index) => {
        const { className, position, ...rest } = highlight

        const viewportHighlight: ViewportHighlight = {
          ...rest,
          className,
          position: scaledPositionToViewport(position)
        }

        if (tip && tip.highlight.id === String(highlight.id)) {
          showTip(tip.highlight, tip.callback(viewportHighlight))
        }

        const isScrolledTo = Boolean(scrolledToHighlightId === highlight.id)

        return h(Popup, {
          key: index,
          highlight: viewportHighlight,
          isScrolledTo,
          editable: props.editable,
          onMouseOut: hideTipAndSelection,
          onMouseOver: (popupContent: VNode) => {
            const callback = () => popupContent
            tip = { highlight: viewportHighlight, callback }
            showTip(viewportHighlight, popupContent)
          },
          onChange: (boundingRect: ViewportRect) => {
            emit(
              'update-highlight',
              viewportHighlight.id!,
              { boundingRect: viewportToScaled(boundingRect, pageViewport) },
              { image: screenshot(boundingRect, pageNumber) }
            )
          },
          onDelete: () => emit('remove-highlight', highlight),
          onSelect: () => {
            selectHighlight(highlight)
            emit('select-highlight', highlight)
          }
        })
      }
    )

    renderInLayer(textLayerDiv, HIGHLIGHT_LAYER_CLASS, h('div', null, children))
  }
}

const renderTipAtPosition = (position: ViewportPosition, inner: VNode) => {
  if (!viewer) return

  const pageNode = viewer.getPageView(position.pageNumber - 1).div as HTMLElement | undefined
  if (!pageNode) return

  const pageBoundingRect = pageNode.getBoundingClientRect()
  const tipPosition: TipPosition = {
    left: pageNode.offsetLeft + position.boundingRect.left + position.boundingRect.width / 2,
    top: position.boundingRect.top + pageNode.offsetTop,
    bottom: position.boundingRect.top + pageNode.offsetTop + position.boundingRect.height
  }

  const viewerEl = viewerElement()
  if (!viewerEl) return

  renderInLayer(
    viewerEl,
    TIP_LAYER_CLASS,
    h(
      TipContainer,
      {
        scrollTop: viewer.container.scrollTop,
        pageBoundingRect,
        position: tipPosition
      },
      { default: () => inner }
    )
  )
}

const loadPdf = async (password?: string) => {
  let pdfDoc: PDFDocumentProxy

  const params = {
    password: password || props.password,
    cMapUrl: props.cMapUrl,
    cMapPacked: Boolean(props.cMapUrl),
    withCredentials: props.withCredentials
  }

  try {
    pdfDoc = await pdfjs.getDocument({ url: props.url, ...params }).promise
  } catch (e) {
    if (String(e).includes('body.getReader')) {
      const pdfData = await fetch(new URL(props.url ?? '', window.location.href).href)
      const arrayBufferPdf = await pdfData.arrayBuffer()
      pdfDoc = await pdfjs.getDocument({ data: arrayBufferPdf, ...params }).promise
    } else {
      console.error(e)
      emit('error', e, (retryPassword?: string) => loadPdf(retryPassword))
      return
    }
  }

  try {
    pdfDocument.value = pdfDoc

    if (!containerRef.value) {
      return
    }

    viewer = new PDFViewer({
      container: containerRef.value,
      removePageBorders: true,
      textLayerMode: touchEnable ? 0 : 1,
      linkService,
      eventBus
    })

    viewer.setDocument(pdfDoc)
    linkService.setDocument(pdfDoc)
    linkService.setViewer(viewer)
  } catch (e) {
    console.error(e)
    emit('error', e, (retryPassword?: string) => loadPdf(retryPassword))
  }
}

const onTouchStart = (event: TouchEvent) => {
  if (event.touches.length > 1) {
    event.preventDefault()
  }
}

const lastTouchEnd = { time: 0 }
const onTouchEnd = (event: TouchEvent) => {
  const now = Date.now()
  if (now - lastTouchEnd.time <= 300) {
    event.preventDefault()
  }
  lastTouchEnd.time = now
}

const onGestureStart = (event: Event) => {
  event.preventDefault()
}

const initTouchDevice = () => {
  if (!touchEnable) {
    return
  }

  // 阻止双击放大
  document.addEventListener('touchstart', onTouchStart)
  document.addEventListener('touchend', onTouchEnd, false)
  // 阻止双指放大
  document.addEventListener('gesturestart', onGestureStart)

  hammer = new Hammer(document as unknown as HTMLElement, { enable: true })
  hammer.get('pinch').set({ enable: true })

  let begin = 1
  hammer.on('pinchstart', ({ scale }) => {
    begin = scale
  })
  hammer.on('pinchout', ({ scale }) => {
    if (!viewer) return
    const newScale = viewer.currentScale + (scale - begin)
    viewer.currentScaleValue = String(Math.min(10.0, newScale))
    begin = scale
  })
  hammer.on('pinchin', ({ scale }) => {
    if (!viewer) return
    const newScale = viewer.currentScale - (begin - scale)
    viewer.currentScaleValue = String(Math.max(0.1, newScale))
    begin = scale
  })
}

const initEvent = (destroy = false) => {
  if (props.readOnly) {
    return
  }

  if (destroy) {
    document.removeEventListener('selectionchange', onSelectionChange)
    document.removeEventListener('keydown', handleKeyDown)
    eventBus.off('textlayerrendered', onTextLayerRendered)
  } else {
    document.addEventListener('selectionchange', onSelectionChange)
    document.addEventListener('keydown', handleKeyDown)
    eventBus.on('textlayerrendered', onTextLayerRendered)
  }
}

const unmountLayers = () => {
  const viewerEl = viewerElement()
  const tipLayer = viewerEl?.querySelector(`.${TIP_LAYER_CLASS}`)
  if (viewerEl && tipLayer) {
    render(null, tipLayer as HTMLElement)
  }

  if (!pdfDocument.value || !viewer) return

  for (let pageNumber = 1; pageNumber <= pdfDocument.value.numPages; pageNumber++) {
    const textLayerDiv = findOrCreateHighlightLayer(pageNumber)
    const layer = textLayerDiv?.querySelector(`.${HIGHLIGHT_LAYER_CLASS}`)
    if (layer) {
      render(null, layer as HTMLElement)
    }
  }
}

const onAreaSelectionVisibilityChange = (isVisible: boolean) => {
  isAreaSelectionInProgress.value = isVisible
}

watch(
  () => props.highlights,
  () => {
    renderHighlights()
  }
)

watch(
  () => props.isActive,
  (val, oldVal) => {
    if (!oldVal && val) {
      hintOpacity.value = 0.9
      if (hintTimer) clearTimeout(hintTimer)
      hintTimer = setTimeout(() => {
        hintOpacity.value = 0
      }, 2500)
    }
    if (!val) {
      selectionRef.value?.reset()
      hideTipAndSelection()
    }
  }
)

onMounted(() => {
  void loadPdf()

  eventBus.on('pagesinit', () => {
    if (!viewer) return
    viewer.currentScaleValue = 'auto'

    emit('loaded', {
      viewer,
      page: {
        current: currentPage.value,
        total: pdfDocument.value?.numPages ?? 0
      }
    })
  })

  eventBus.on('pagechanging', (detail: { pageNumber: number }) => {
    currentPage.value = detail.pageNumber

    emit('change', {
      viewer: viewer!,
      page: {
        current: detail.pageNumber,
        total: pdfDocument.value?.numPages ?? 0
      }
    })
  })

  initEvent()
  initTouchDevice()
})

onBeforeUnmount(() => {
  initEvent(true)

  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchend', onTouchEnd)
  document.removeEventListener('gesturestart', onGestureStart)
  hammer?.destroy()
  hammer = null

  if (hintTimer) {
    clearTimeout(hintTimer)
    hintTimer = null
  }

  debouncedAfterSelection.cancel()
  unmountLayers()
})

defineExpose({
  handleCommand,
  scrollTo
})
</script>

<style lang="scss" src="../assets/style.scss" />
<style scoped lang="scss">
.hint {
  transition-property: opacity;
  transition-duration: .5s;
  transition-delay: unset;
  white-space: nowrap;
  position: absolute;
  pointer-events: none;
  top: 80px;
  width: 100%;
  text-align: center;
  opacity: 0;

  .hint-container {
    width: 200px;
    margin: 0 auto;
    line-height: normal;
    font-size: 14px;
    color: #fff;
    background-color: #243247;
    padding: 5px 10px;
    border-radius: 5px;
  }
}
</style>
