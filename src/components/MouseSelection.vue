<template>
  <div ref="rootRef" class="mouse-selection-container">
    <div
      v-if="start && end"
      class="mouse-selection"
      :style="formatStyle(getBoundingRect(start, end))"
    >
      <div class="mouse-selection__inner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ViewportRect } from '../types'

interface Point {
  x: number
  y: number
}

const props = defineProps<{
  shouldStart?: (event: MouseEvent) => boolean
}>()

const emit = defineEmits<{
  dragstart: []
  dragend: []
  change: [isVisible: boolean]
  selection: [startPoint: Point, boundingRect: ViewportRect, reset: () => void]
}>()

const rootRef = ref<HTMLElement | null>(null)

const start = ref<Point | null>(null)
const end = ref<Point | null>(null)
const locked = ref(false)

let container: HTMLElement | null = null
let containerBoundingRect: DOMRect | null = null

const toContainerCoords = (clientX: number, clientY: number): Point => {
  if (!container) {
    return { x: 0, y: 0 }
  }

  // Stage 通过内部相机滚动而非原生 scrollTop，容器坐标即视口坐标
  containerBoundingRect = container.getBoundingClientRect()

  return {
    x: clientX - containerBoundingRect.left,
    y: clientY - containerBoundingRect.top
  }
}

const onPointerMove = (event: PointerEvent) => {
  if (!start.value || locked.value) {
    return
  }

  end.value = toContainerCoords(event.clientX, event.clientY)
}

const onPointerUp = (event: PointerEvent) => {
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
  document.removeEventListener('pointercancel', onPointerUp)

  if (!start.value) {
    return
  }

  const startPoint = start.value
  const endPoint = toContainerCoords(event.clientX, event.clientY)
  const boundingRect = getBoundingRect(startPoint, endPoint)

  if (!shouldRender(boundingRect)) {
    reset()
    return
  }

  end.value = endPoint
  locked.value = true

  emit('selection', startPoint, boundingRect, reset)
  emit('dragend')
}

const onContainerPointerDown = (event: PointerEvent) => {
  if (!props.shouldStart?.(event)) {
    reset()
    return
  }

  // 拦截指针事件，避免 Stage 的文本选择/工具手势与原生选区介入框选
  event.stopPropagation()
  event.preventDefault()

  emit('dragstart')

  start.value = toContainerCoords(event.clientX, event.clientY)
  end.value = null
  locked.value = false

  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
  document.addEventListener('pointercancel', onPointerUp)
}

const getBoundingRect = (startPoint: Point, endPoint: Point): ViewportRect => {
  return {
    left: Math.min(endPoint.x, startPoint.x),
    top: Math.min(endPoint.y, startPoint.y),
    width: Math.abs(endPoint.x - startPoint.x),
    height: Math.abs(endPoint.y - startPoint.y)
  }
}

const shouldRender = (boundingRect: ViewportRect) => {
  return boundingRect.width >= 1 && boundingRect.height >= 1
}

const formatStyle = (style: ViewportRect) => {
  const result: Record<string, string> = {}
  for (const key in style) {
    result[key] = `${style[key as keyof ViewportRect]}px`
  }
  return result
}

const reset = () => {
  emit('dragend')
  start.value = null
  end.value = null
  locked.value = false
}

watch([start, end], () => {
  emit('change', Boolean(start.value && end.value))
})

onMounted(() => {
  container = rootRef.value?.parentElement ?? null

  if (!(container instanceof HTMLElement)) {
    return
  }

  container.addEventListener('pointerdown', onContainerPointerDown, true)
})

onBeforeUnmount(() => {
  container?.removeEventListener('pointerdown', onContainerPointerDown, true)
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
  document.removeEventListener('pointercancel', onPointerUp)
})

defineExpose({ reset })
</script>

<style scoped lang="scss">
@use "../assets/vars" as *;
.mouse-selection-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
}

.mouse-selection {
  position: absolute;
  border: $highlight-selection-outer-border;

  .mouse-selection__inner {
    @include mix-fullscreen;
    border: $highlight-selection-border-width solid $highlight-color;
    background: rgba($highlight-color, $highlight-selection-background-opacity);
    mix-blend-mode: multiply;
  }
}
</style>