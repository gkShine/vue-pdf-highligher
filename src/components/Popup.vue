<template>
  <div
    class="popup"
    :class="highlight.className"
    @mouseover="handleMouseOver"
    @mouseout="mouseIn = false"
    @click="handleClick"
  >
    <AreaHighlight
      v-if="highlight.content && highlight.content.image"
      :is-scrolled-to="isScrolledTo"
      :highlight="highlight"
      :editable="editable"
      :is-ghost="highlight.isGhost"
      @change="handleChange"
    />
    <Highlight
      v-else
      :is-ghost="highlight.isGhost"
      :is-scrolled-to="isScrolledTo"
      :position="highlight.position"
      :comment="highlight.comment"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import type { VNode } from 'vue'
import AreaHighlight from './AreaHighlight.vue'
import Highlight from './Highlight.vue'
import MouseMonitor from './MouseMonitor.vue'
import type { ViewportHighlight, ViewportRect } from '../types'

const props = withDefaults(
  defineProps<{
    highlight: ViewportHighlight
    isScrolledTo?: boolean
    editable?: boolean
  }>(),
  {
    isScrolledTo: false,
    editable: false
  }
)

const emit = defineEmits<{
  mouseOut: []
  mouseOver: [content: VNode]
  change: [boundingRect: ViewportRect]
  delete: [highlight: ViewportHighlight]
  select: [highlight: ViewportHighlight]
}>()

const mouseIn = ref(false)

const comment = computed(() => props.highlight.comment ?? {})

const handleMouseAway = () => {
  if (!mouseIn.value) {
    emit('mouseOut')
  }
}

const handleDelete = () => {
  emit('delete', props.highlight)
}

const handleClick = () => {
  emit('select', props.highlight)
}

const handleMouseOver = () => {
  mouseIn.value = true
  emit(
    'mouseOver',
    h(MouseMonitor, {
      paddingX: 60,
      paddingY: 30,
      comment: comment.value,
      editable: props.highlight.editable,
      onMouseAway: handleMouseAway,
      onDelete: handleDelete
    })
  )
}

const handleChange = (boundingRect: ViewportRect) => {
  emit('change', boundingRect)
}
</script>
