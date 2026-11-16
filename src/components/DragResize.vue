<template>
  <div
    class="drag-resize"
    :class="{ 'drag-resize--disabled': disabled }"
    :style="rootStyle"
    @pointerdown="startDrag"
  >
    <div class="drag-resize__content">
      <slot />
    </div>
    <template v-if="!disabled">
      <div
        v-for="dir in directions"
        :key="dir"
        class="drag-resize__handle"
        :class="`drag-resize__handle--${dir}`"
        @pointerdown.stop.prevent="startResize($event, dir)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { CSSProperties } from 'vue'
import type { ViewportRect } from '../types'

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const props = withDefaults(
  defineProps<{
    x: number
    y: number
    w: number
    h: number
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const emit = defineEmits<{
  dragstop: [rect: ViewportRect]
  resizestop: [rect: ViewportRect]
}>()

const directions: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']

const MIN_SIZE = 1

const rect = reactive<ViewportRect>({
  left: props.x,
  top: props.y,
  width: props.w,
  height: props.h
})

watch(
  () => [props.x, props.y, props.w, props.h],
  ([x, y, w, h]) => {
    rect.left = x
    rect.top = y
    rect.width = w
    rect.height = h
  }
)

const rootStyle = computed<CSSProperties>(() => ({
  left: `${rect.left}px`,
  top: `${rect.top}px`,
  width: `${rect.width}px`,
  height: `${rect.height}px`
}))

const bindPointerSession = (
  target: HTMLElement,
  event: PointerEvent,
  onMove: (event: PointerEvent) => void,
  onEnd: () => void
) => {
  target.setPointerCapture(event.pointerId)

  const handleMove = (moveEvent: PointerEvent) => onMove(moveEvent)
  const handleUp = () => {
    target.releasePointerCapture(event.pointerId)
    target.removeEventListener('pointermove', handleMove)
    target.removeEventListener('pointerup', handleUp)
    target.removeEventListener('pointercancel', handleUp)
    onEnd()
  }

  target.addEventListener('pointermove', handleMove)
  target.addEventListener('pointerup', handleUp)
  target.addEventListener('pointercancel', handleUp)
}

const startDrag = (event: PointerEvent) => {
  if (props.disabled || event.button !== 0) return
  if ((event.target as HTMLElement).closest('.drag-resize__handle')) return

  event.preventDefault()

  const target = event.currentTarget as HTMLElement
  const startX = event.clientX
  const startY = event.clientY
  const startRect = { ...rect }

  bindPointerSession(
    target,
    event,
    moveEvent => {
      rect.left = startRect.left + (moveEvent.clientX - startX)
      rect.top = startRect.top + (moveEvent.clientY - startY)
    },
    () => {
      emit('dragstop', { ...rect })
    }
  )
}

const startResize = (event: PointerEvent, direction: ResizeDirection) => {
  if (props.disabled || event.button !== 0) return

  const target = event.currentTarget as HTMLElement
  const startX = event.clientX
  const startY = event.clientY
  const startRect = { ...rect }

  bindPointerSession(
    target,
    event,
    moveEvent => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      let { left, top, width, height } = startRect

      if (direction.includes('e')) {
        width = startRect.width + dx
      }
      if (direction.includes('s')) {
        height = startRect.height + dy
      }
      if (direction.includes('w')) {
        left = startRect.left + dx
        width = startRect.width - dx
      }
      if (direction.includes('n')) {
        top = startRect.top + dy
        height = startRect.height - dy
      }

      if (width < MIN_SIZE) {
        width = MIN_SIZE
        if (direction.includes('w')) {
          left = startRect.left + startRect.width - MIN_SIZE
        }
      }
      if (height < MIN_SIZE) {
        height = MIN_SIZE
        if (direction.includes('n')) {
          top = startRect.top + startRect.height - MIN_SIZE
        }
      }

      rect.left = left
      rect.top = top
      rect.width = width
      rect.height = height
    },
    () => {
      emit('resizestop', { ...rect })
    }
  )
}
</script>

<style scoped lang="scss">
.drag-resize {
  position: absolute;
  box-sizing: border-box;

  &:not(&--disabled) {
    touch-action: none;
  }

  &__content {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
  }

  &__handle {
    position: absolute;
    box-sizing: border-box;
    touch-action: none;
    z-index: 1;

    &--n {
      top: -4px;
      left: 6px;
      right: 6px;
      height: 8px;
      cursor: ns-resize;
    }

    &--s {
      bottom: -4px;
      left: 6px;
      right: 6px;
      height: 8px;
      cursor: ns-resize;
    }

    &--e {
      right: -4px;
      top: 6px;
      bottom: 6px;
      width: 8px;
      cursor: ew-resize;
    }

    &--w {
      left: -4px;
      top: 6px;
      bottom: 6px;
      width: 8px;
      cursor: ew-resize;
    }

    &--nw {
      top: -4px;
      left: -4px;
      width: 10px;
      height: 10px;
      cursor: nwse-resize;
    }

    &--se {
      bottom: -4px;
      right: -4px;
      width: 10px;
      height: 10px;
      cursor: nwse-resize;
    }

    &--ne {
      top: -4px;
      right: -4px;
      width: 10px;
      height: 10px;
      cursor: nesw-resize;
    }

    &--sw {
      bottom: -4px;
      left: -4px;
      width: 10px;
      height: 10px;
      cursor: nesw-resize;
    }
  }
}
</style>
