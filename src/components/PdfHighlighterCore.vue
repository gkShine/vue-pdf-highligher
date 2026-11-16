<template>
  <Preview
    v-show="visibleSlide"
    :is-preview-enabled="visibleSlide"
    :current-page="currentPage"
    :page-count="pageCount"
    @page-focus="handlePageFocus"
  />

  <div ref="containerRef" class="pdf-highlighter" @contextmenu.prevent>
    <Stage class="pdf-highlighter__stage">
      <template #page="{ page }">
        <RenderLayer />
        <LinkLayer />
        <SelectionLayer v-if="!readOnly" />
        <HighlightLayer
          :page="page"
          :highlights="highlightsForPage(page.pageIndex)"
          :page-size="pageSizeOf(page.pageIndex)"
          :editable="editable"
          :scrolled-to-id="scrolledToHighlightId"
          @mouse-over="showHighlightTip"
          @mouse-out="hideTipAndSelection"
          @change="onHighlightChange"
          @delete="highlight => emit('remove-highlight', highlight)"
          @select="onHighlightSelect"
        />
      </template>

      <template #overlay>
        <SelectionClipboard v-if="!readOnly" />
        <SelectionHandles v-if="!readOnly" />
        <SelectionMenu v-if="selectionTipVisible && !readOnly" :gap="8" placement="top">
          <div class="pdf-highlighter__tip-container">
            <Tip
              @open="onSelectionTipOpen"
              @cancel="cancelTextSelection"
              @confirm="confirmTextSelection"
            />
          </div>
        </SelectionMenu>
        <div v-if="tipState" class="pdf-highlighter__tip-layer">
          <TipContainer v-if="tipPosition" :position="tipPosition" :scroll-top="0">
            <TipContent />
          </TipContainer>
        </div>
      </template>
    </Stage>

    <MouseSelection
      v-if="!readOnly && enableAreaSelection"
      ref="selectionRef"
      :should-start="shouldStart"
      @change="onAreaSelectionVisibilityChange"
      @selection="handleAreaSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { VNode } from 'vue'
import { throttle } from 'lodash'
import { pageRefsEqual } from '@embedpdf/engine'
import { usePageList } from '@embedpdf/vue/runtime'
import { Stage, useStage, useStageEvent, useStageState } from '@embedpdf/vue/stage'
import { RenderLayer, useRender } from '@embedpdf/vue/render'
import {
  SelectionClipboard,
  SelectionHandles,
  SelectionLayer,
  SelectionMenu,
  useSelection,
  useSelectionEvent
} from '@embedpdf/vue/selection'
import { LinkLayer } from '@embedpdf/vue/link'

import HighlightLayer from './HighlightLayer.vue'
import MouseSelection from './MouseSelection.vue'
import Preview from './Preview.vue'
import Tip from './Tip.vue'
import TipContainer from './TipContainer.vue'

import getBoundingRect from '../lib/get-bounding-rect'
import { scaledToViewport, viewportToScaled } from '../lib/coordinates'
import type { ViewportLike } from '../lib/coordinates'
import { createViewerHandle } from '../lib/viewer-handle'
import type { PdfViewerHandle } from '../lib/viewer-handle'

import type {
  Highlight,
  HighlightComment,
  HighlightContent,
  ScaledPosition,
  ScaledRect,
  TipPosition,
  ViewportRect
} from '../types'

const EMPTY_ID = 'empty-id'

const props = withDefaults(
  defineProps<{
    highlights?: Highlight[]
    isActive?: boolean
    editable?: boolean
    readOnly?: boolean
    enableAreaSelection?: (event: MouseEvent) => boolean
    scrollMargin?: number
    visibleSlide?: boolean
  }>(),
  {
    highlights: () => [],
    isActive: true,
    editable: true,
    readOnly: false,
    visibleSlide: false
  }
)

const emit = defineEmits<{
  loaded: [payload: { viewer: PdfViewerHandle; page: { current: number; total: number } }]
  change: [payload: { viewer: PdfViewerHandle; page: { current: number; total: number } }]
  scroll: []
  'add-highlight': [payload: { content: HighlightContent; position: ScaledPosition; comment: HighlightComment }]
  'update-highlight': [
    id: string | number,
    position: { boundingRect: ScaledRect },
    content: { image: string }
  ]
  'remove-highlight': [highlight: Highlight]
  'select-highlight': [highlight: Highlight]
}>()

const stage = useStage()
const render = useRender()
const selection = useSelection()
const stageState = useStageState()
const pageList = usePageList()

const viewerHandle = createViewerHandle(stage, render, selection)

const containerRef = ref<HTMLElement | null>(null)
const selectionRef = ref<InstanceType<typeof MouseSelection> | null>(null)

const currentPage = computed(() => stageState.currentPageIndex.value + 1)
const pageCount = computed(() => stageState.pageCount.value)

const ghosts = shallowRef<Highlight[]>([])
const scrolledToHighlightId = ref<string | number>(EMPTY_ID)
const isAreaSelectionInProgress = ref(false)

const tipState = shallowRef<{
  pageNumber: number
  /** 页面 point 坐标 */
  rect: ViewportRect
  content: VNode
} | null>(null)
const cameraTick = ref(0)

const selectionTipVisible = ref(false)
const pendingTextSelection = shallowRef<{ position: ScaledPosition; content: HighlightContent }[]>([])

let loadedEmitted = false
let programmaticScroll = false
let programmaticScrollTimer: ReturnType<typeof setTimeout> | null = null

const pageSizeOf = (pageIndex: number): ViewportLike => {
  const page = pageList.value[pageIndex]
  if (!page) {
    return { width: 0, height: 0 }
  }
  return {
    width: page.size.width,
    height: page.size.height,
    pdfCropBox: page.pdfCropBox
  }
}

const highlightsByPage = computed(() => {
  const result: Record<number, Highlight[]> = {}
  for (const highlight of [...props.highlights, ...ghosts.value]) {
    const key = highlight.position.pageNumber - 1
    result[key] = result[key] || []
    result[key].push(highlight)
  }
  return result
})

const highlightsForPage = (pageIndex: number): Highlight[] =>
  highlightsByPage.value[pageIndex] ?? []

const emitScroll = throttle(() => emit('scroll'), 100)

const beginProgrammaticScroll = () => {
  programmaticScroll = true
  if (programmaticScrollTimer) clearTimeout(programmaticScrollTimer)
  programmaticScrollTimer = setTimeout(() => {
    programmaticScroll = false
  }, 1200)
}

useStageEvent(
  s => s.onCameraChanged,
  () => {
    cameraTick.value++
    if (!programmaticScroll) {
      scrolledToHighlightId.value = EMPTY_ID
    }
    emitScroll()
  }
)

useStageEvent(
  s => s.onMotionEnded,
  () => {
    programmaticScroll = false
    if (programmaticScrollTimer) {
      clearTimeout(programmaticScrollTimer)
      programmaticScrollTimer = null
    }
  }
)

// DocumentGate 就绪后才挂载 Core，pageCount 初值即非 0，必须 immediate
watch(
  pageCount,
  count => {
    if (count <= 0 || loadedEmitted) return
    loadedEmitted = true
    void nextTick(() => {
      stage.fitAutomatic()
      emit('loaded', {
        viewer: viewerHandle,
        page: { current: currentPage.value, total: count }
      })
    })
  },
  { immediate: true }
)

watch(
  () => stageState.currentPageIndex.value,
  index => {
    emit('change', {
      viewer: viewerHandle,
      page: { current: index + 1, total: pageCount.value }
    })
  }
)

const tipPosition = computed<TipPosition | null>(() => {
  // 相机变化时重新投影 tip 锚点
  void cameraTick.value
  const tip = tipState.value
  if (!tip) return null

  const rect = stage.pageRectToViewport(tip.pageNumber - 1, {
    x: tip.rect.left,
    y: tip.rect.top,
    width: tip.rect.width,
    height: tip.rect.height
  })
  if (!rect) return null

  return {
    left: rect.x + rect.width / 2,
    top: rect.y,
    bottom: rect.y + rect.height
  }
})

const TipContent = () => tipState.value?.content ?? null

const showHighlightTip = (highlight: Highlight, content: VNode) => {
  if (selectionTipVisible.value || ghosts.value.length > 0 || isAreaSelectionInProgress.value) {
    return
  }

  const { position } = highlight
  tipState.value = {
    pageNumber: position.pageNumber,
    rect: scaledToViewport(
      position.boundingRect,
      pageSizeOf(position.pageNumber - 1),
      position.usePdfCoordinates
    ),
    content
  }
}

const hideTipAndSelection = () => {
  tipState.value = null
  ghosts.value = []
  pendingTextSelection.value = []
  selectionTipVisible.value = false
  selection.clear()
  selectionRef.value?.reset()
}

const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

const captureArea = async (pageIndex: number, rect: ViewportRect): Promise<string> => {
  const image = await render.renderPage(pageIndex, {
    rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
    scale: 2,
    format: 'png'
  })
  return blobToDataURL(await image.blob())
}

const onTextSelectionCommitted = async () => {
  if (!props.isActive || props.readOnly) return

  const refs = selection.listSelectedPages()
  if (refs.length === 0) return

  const pending: { position: ScaledPosition; content: HighlightContent }[] = []

  for (const ref of refs) {
    const pageIndex = pageList.value.findIndex(page => pageRefsEqual(page.ref, ref))
    if (pageIndex < 0) continue

    const rects = selection.listRects(ref).map(rect => ({
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height
    }))
    if (rects.length === 0) continue

    const size = pageSizeOf(pageIndex)
    const text = await selection
      .readTextInRange({ start: { page: ref, index: 0 }, end: { page: ref, index: 1e9 } })
      .catch(() => '')

    pending.push({
      position: {
        boundingRect: viewportToScaled(getBoundingRect(rects), size),
        rects: rects.map(rect => viewportToScaled(rect, size)),
        pageNumber: pageIndex + 1
      },
      content: { text }
    })
  }

  // 读取文本期间选区可能已被清除
  if (!selection.hasSelection() || pending.length === 0) return

  pendingTextSelection.value = pending
  selectionTipVisible.value = true
}

useSelectionEvent(s => s.onCommitted, () => void onTextSelectionCommitted())

useSelectionEvent(
  s => s.onCleared,
  () => {
    if (selectionTipVisible.value) {
      selectionTipVisible.value = false
      pendingTextSelection.value = []
      ghosts.value = []
    }
  }
)

const onSelectionTipOpen = () => {
  ghosts.value = pendingTextSelection.value.map(({ position }) => ({
    isGhost: true,
    position
  }))
}

const cancelTextSelection = () => {
  hideTipAndSelection()
}

const confirmTextSelection = (comment: HighlightComment) => {
  for (const { content, position } of pendingTextSelection.value) {
    emit('add-highlight', { content, position, comment })
  }
  hideTipAndSelection()
}

const containerPoint = (event: MouseEvent) => {
  const rect = containerRef.value?.getBoundingClientRect()
  return {
    x: event.clientX - (rect?.left ?? 0),
    y: event.clientY - (rect?.top ?? 0)
  }
}

const shouldStart = (event: MouseEvent): boolean => {
  return (
    props.isActive &&
    !props.readOnly &&
    Boolean(props.enableAreaSelection?.(event)) &&
    stage.getPageAt(containerPoint(event)) !== null
  )
}

const handleAreaSelection = async (
  startPoint: { x: number; y: number },
  boundingRect: ViewportRect,
  resetSelection: () => void
) => {
  const hit = stage.getPageAt(startPoint)
  if (!hit) return

  const pageIndex = pageList.value.findIndex(page => pageRefsEqual(page.ref, hit.ref))
  if (pageIndex < 0) return

  const size = pageSizeOf(pageIndex)
  const topLeft = stage.viewportToPage(hit.ref, { x: boundingRect.left, y: boundingRect.top })
  const bottomRight = stage.viewportToPage(hit.ref, {
    x: boundingRect.left + boundingRect.width,
    y: boundingRect.top + boundingRect.height
  })
  if (!topLeft || !bottomRight) return

  const left = Math.max(0, Math.min(topLeft.x, bottomRight.x))
  const top = Math.max(0, Math.min(topLeft.y, bottomRight.y))
  const right = Math.min(size.width, Math.max(topLeft.x, bottomRight.x))
  const bottom = Math.min(size.height, Math.max(topLeft.y, bottomRight.y))
  const pageRect: ViewportRect = { left, top, width: right - left, height: bottom - top }
  if (pageRect.width <= 0 || pageRect.height <= 0) return

  const position: ScaledPosition = {
    boundingRect: viewportToScaled(pageRect, size),
    rects: [],
    pageNumber: pageIndex + 1
  }

  const image = await captureArea(pageIndex, pageRect).catch(() => null)
  if (image === null || !props.isActive) return

  tipState.value = {
    pageNumber: position.pageNumber,
    rect: pageRect,
    content: h(Tip, {
      onOpen: () => {
        ghosts.value = [{ isGhost: true, position, content: { image } }]
        resetSelection()
      },
      onCancel: () => hideTipAndSelection(),
      onConfirm: (comment: HighlightComment) => {
        emit('add-highlight', { content: { image }, position, comment })
        hideTipAndSelection()
      }
    })
  }
}

const onAreaSelectionVisibilityChange = (isVisible: boolean) => {
  isAreaSelectionInProgress.value = isVisible
}

const onHighlightChange = (highlight: Highlight, rect: ViewportRect) => {
  const pageIndex = highlight.position.pageNumber - 1
  const size = pageSizeOf(pageIndex)

  void captureArea(pageIndex, rect)
    .then(image => {
      emit(
        'update-highlight',
        highlight.id!,
        { boundingRect: viewportToScaled(rect, size) },
        { image }
      )
    })
    .catch(() => {})
}

const selectHighlight = (highlight: Highlight) => {
  scrolledToHighlightId.value = highlight.id ?? EMPTY_ID
}

const onHighlightSelect = (highlight: Highlight) => {
  selectHighlight(highlight)
  emit('select-highlight', highlight)
}

const handlePageFocus = (pageNumber: number) => {
  beginProgrammaticScroll()
  stage.goToPage(pageNumber - 1)
}

const scrollTo = (highlight: Highlight) => {
  const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position
  const rect = scaledToViewport(boundingRect, pageSizeOf(pageNumber - 1), usePdfCoordinates)

  const scrollMargin = props.scrollMargin || Math.round(window.innerHeight / 4)
  const { height } = stage.getViewportSize()
  const alignY = height > 0 ? Math.min(0.95, Math.max(0, scrollMargin / height)) : 0.35

  beginProgrammaticScroll()
  stage.reveal(pageNumber - 1, {
    rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
    zoom: 'keep',
    align: { y: alignY },
    behavior: 'smooth'
  })

  selectHighlight(highlight)
}

const handleCommand = (command: string, factor = 1.1) => {
  switch (command) {
    case 'zoomIn':
      stage.zoomBy(factor)
      break
    case 'zoomOut':
      stage.zoomBy(1 / factor)
      break
  }
}

// headless Vue 包未接触屏长按（该手势只在 @embedpdf/web UI 层实现），
// 这里自行补长按选词，复用 onCommitted 的批注流程
const LONG_PRESS_MS = 450
let longPressTimer: number | null = null
let longPressPointerId: number | null = null
let longPressOrigin: { x: number; y: number } | null = null

const cancelLongPress = () => {
  if (longPressTimer !== null) clearTimeout(longPressTimer)
  longPressTimer = null
  longPressPointerId = null
  longPressOrigin = null
}

const fireLongPress = () => {
  const origin = longPressOrigin
  cancelLongPress()
  if (!origin || !props.isActive || props.readOnly) return
  const hit = stage.getPageAt(origin)
  if (!hit) return
  const point = stage.viewportToPage(hit.ref, origin)
  if (!point) return
  if (selection.selectWordAt(hit.ref, point)) void onTextSelectionCommitted()
}

const onTouchDown = (event: PointerEvent) => {
  if (event.pointerType !== 'touch') return
  if (longPressPointerId !== null) {
    cancelLongPress()
    return
  }
  if (!props.isActive || props.readOnly) return
  longPressPointerId = event.pointerId
  longPressOrigin = containerPoint(event)
  longPressTimer = window.setTimeout(fireLongPress, LONG_PRESS_MS)
}

const onTouchMove = (event: PointerEvent) => {
  if (event.pointerId !== longPressPointerId || !longPressOrigin) return
  const point = containerPoint(event)
  if (Math.hypot(point.x - longPressOrigin.x, point.y - longPressOrigin.y) > 10) {
    cancelLongPress()
  }
}

const onTouchEnd = (event: PointerEvent) => {
  if (event.pointerId === longPressPointerId) cancelLongPress()
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.code === 'Escape') {
    hideTipAndSelection()
  }
}

watch(
  () => props.isActive,
  value => {
    if (!value) {
      hideTipAndSelection()
    }
  }
)

watch(
  () => props.readOnly,
  value => {
    if (value) {
      hideTipAndSelection()
    }
  }
)

document.addEventListener('keydown', handleKeyDown)

onMounted(() => {
  const el = containerRef.value
  el?.addEventListener('pointerdown', onTouchDown)
  el?.addEventListener('pointermove', onTouchMove)
  el?.addEventListener('pointerup', onTouchEnd)
  el?.addEventListener('pointercancel', onTouchEnd)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  const el = containerRef.value
  el?.removeEventListener('pointerdown', onTouchDown)
  el?.removeEventListener('pointermove', onTouchMove)
  el?.removeEventListener('pointerup', onTouchEnd)
  el?.removeEventListener('pointercancel', onTouchEnd)
  cancelLongPress()
  emitScroll.cancel()
  if (programmaticScrollTimer) {
    clearTimeout(programmaticScrollTimer)
    programmaticScrollTimer = null
  }
})

defineExpose({
  handleCommand,
  scrollTo,
  hideTipAndSelection
})
</script>