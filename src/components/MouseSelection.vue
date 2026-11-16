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
  selection: [startTarget: HTMLElement, boundingRect: ViewportRect, reset: () => void]
}>()

const rootRef = ref<HTMLElement | null>(null)

const start = ref<Point | null>(null)
const end = ref<Point | null>(null)
const locked = ref(false)

let container: HTMLElement | null = null
let containerBoundingRect: DOMRect | null = null

const onContainerMouseMove = (event: MouseEvent) => {
  if (!start.value || locked.value) {
    return
  }

  end.value = toContainerCoords(event.pageX, event.pageY)
}

const onContainerMouseDown = (event: MouseEvent) => {
  if (!props.shouldStart?.(event)) {
    reset()
    return
  }

  const startTarget = event.target

  if (!(startTarget instanceof HTMLElement)) {
    return
  }

  emit('dragstart')

  start.value = toContainerCoords(event.pageX, event.pageY)
  end.value = null
  locked.value = false

  const onMouseUp = (upEvent: MouseEvent) => {
    document.body?.removeEventListener('mouseup', onMouseUp)

    if (!start.value) {
      return
    }

    const endPoint = toContainerCoords(upEvent.pageX, upEvent.pageY)
    const boundingRect = getBoundingRect(start.value, endPoint)

    if (
      !(upEvent.target instanceof HTMLElement) ||
      !container?.contains(upEvent.target) ||
      !shouldRender(boundingRect)
    ) {
      reset()
      return
    }

    end.value = endPoint
    locked.value = true

    if (start.value && end.value && upEvent.target instanceof HTMLElement) {
      emit('selection', startTarget, boundingRect, reset)
      emit('dragend')
    }
  }

  document.body?.addEventListener('mouseup', onMouseUp)
}

const toContainerCoords = (pageX: number, pageY: number): Point => {
  if (!containerBoundingRect) {
    containerBoundingRect = container?.getBoundingClientRect() ?? null
  }

  if (!container || !containerBoundingRect) {
    return { x: 0, y: 0 }
  }

  return {
    x: pageX - containerBoundingRect.left + container.scrollLeft,
    y: pageY - containerBoundingRect.top + container.scrollTop
  }
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

  container.addEventListener('mousemove', onContainerMouseMove)
  container.addEventListener('mousedown', onContainerMouseDown)
})

onBeforeUnmount(() => {
  container?.removeEventListener('mousemove', onContainerMouseMove)
  container?.removeEventListener('mousedown', onContainerMouseDown)
})

defineExpose({ reset })
</script>

<style scoped lang="scss">
@use "../assets/vars" as *;
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
