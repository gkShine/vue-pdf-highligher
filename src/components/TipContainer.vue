<template>
  <div
    ref="rootRef"
    class="pdf-highlighter__tip-container"
    :style="{
      visibility: isStyleCalculationInProgress ? 'hidden' : 'visible',
      top: top + 'px',
      left: left + 'px'
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TipPosition } from '../types'

const props = defineProps<{
  position: TipPosition
  scrollTop?: number
  pageBoundingRect?: DOMRect
}>()

const height = ref(0)
const width = ref(0)
const rootRef = ref<HTMLElement | null>(null)

let resizeObserver: ResizeObserver | null = null

const isStyleCalculationInProgress = computed(() => width.value === 0 && height.value === 0)

const top = computed(() => {
  const position = props.position
  const scrollTop = props.scrollTop ?? 0
  const shouldMove = position.top - height.value - 5 < scrollTop

  return shouldMove ? position.bottom + 5 : position.top - height.value - 5
})

const left = computed(() => {
  return props.position.left - width.value / 2
})

const updatePosition = () => {
  const el = rootRef.value
  if (!el) return
  height.value = el.offsetHeight
  width.value = el.offsetWidth
}

onMounted(() => {
  updatePosition()
  resizeObserver = new ResizeObserver(updatePosition)
  if (rootRef.value) {
    resizeObserver.observe(rootRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<style scoped>
.pdf-highlighter__tip-container {
  z-index: 6;
  position: absolute;
}
</style>
