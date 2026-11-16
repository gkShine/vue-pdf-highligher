<template>
  <div class="pdf-highlighter__highlight-layer">
    <Popup
      v-for="(item, index) in pxHighlights"
      :key="item.highlight.id ?? `ghost-${index}`"
      :highlight="item.viewportHighlight"
      :is-scrolled-to="item.highlight.id != null && item.highlight.id === scrolledToId"
      :editable="editable"
      @mouse-over="content => emit('mouse-over', item.highlight, content)"
      @mouse-out="emit('mouse-out')"
      @change="rect => emit('change', item.highlight, fromPixels(rect))"
      @delete="emit('delete', item.highlight)"
      @select="emit('select', item.highlight)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { VNode } from 'vue'
import type { PageContextValue } from '@embedpdf/vue/runtime'
import Popup from './Popup.vue'
import { scaledToViewport } from '../lib/coordinates'
import type { ViewportLike } from '../lib/coordinates'
import type { Highlight, ViewportHighlight, ViewportPosition, ViewportRect } from '../types'

const props = withDefaults(
  defineProps<{
    page: PageContextValue
    /** 该页的高亮（ScaledPosition，含 ghost） */
    highlights: Highlight[]
    /** 页面 point 尺寸 */
    pageSize: ViewportLike
    editable?: boolean
    scrolledToId?: string | number
  }>(),
  {
    editable: true
  }
)

const emit = defineEmits<{
  'mouse-over': [highlight: Highlight, content: VNode]
  'mouse-out': []
  /** rect 为页面 point 坐标 */
  change: [highlight: Highlight, rect: ViewportRect]
  delete: [highlight: Highlight]
  select: [highlight: Highlight]
}>()

const toPixels = (rect: ViewportRect): ViewportRect => {
  const { transform } = props.page
  const topLeft = transform.toPixels({ x: rect.left, y: rect.top })
  const bottomRight = transform.toPixels({
    x: rect.left + rect.width,
    y: rect.top + rect.height
  })

  return {
    left: topLeft.x,
    top: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y
  }
}

const fromPixels = (rect: ViewportRect): ViewportRect => {
  const { transform } = props.page
  const topLeft = transform.fromPixels({ x: rect.left, y: rect.top })
  const bottomRight = transform.fromPixels({
    x: rect.left + rect.width,
    y: rect.top + rect.height
  })

  return {
    left: topLeft.x,
    top: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y
  }
}

const pxHighlights = computed(() =>
  props.highlights.map(highlight => {
    const { position } = highlight
    const pagePosition: ViewportPosition = {
      pageNumber: position.pageNumber,
      boundingRect: scaledToViewport(position.boundingRect, props.pageSize, position.usePdfCoordinates),
      rects: (position.rects || []).map(rect =>
        scaledToViewport(rect, props.pageSize, position.usePdfCoordinates)
      )
    }

    const viewportHighlight: ViewportHighlight = {
      ...highlight,
      position: {
        pageNumber: pagePosition.pageNumber,
        boundingRect: toPixels(pagePosition.boundingRect),
        rects: pagePosition.rects.map(toPixels)
      }
    }

    return { highlight, viewportHighlight }
  })
)
</script>

<style scoped lang="scss">
.pdf-highlighter__highlight-layer {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
}
</style>