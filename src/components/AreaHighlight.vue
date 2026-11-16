<template>
  <DragResize
    :x="rect.left"
    :y="rect.top"
    :w="rect.width"
    :h="rect.height"
    :disabled="!editable"
    class="area-highlight"
    :class="{ 'highlight--scrolled-to': isScrolledTo, 'is-ghost': isGhost }"
    @dragstop="handleChange"
    @resizestop="handleChange"
    @click.stop.prevent
  >
    <div class="area-highlight__inner"></div>
  </DragResize>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DragResize from './DragResize.vue'
import type { ViewportHighlight, ViewportRect } from '../types'

const props = withDefaults(
  defineProps<{
    isGhost?: boolean
    isScrolledTo?: boolean
    highlight: ViewportHighlight
    editable?: boolean
  }>(),
  {
    editable: true
  }
)

const emit = defineEmits<{
  change: [rect: ViewportRect]
}>()

const rect = computed<ViewportRect>(() =>
  props.highlight.position.boundingRect
)

const handleChange = (newRect: ViewportRect) => {
  emit('change', newRect)
}
</script>

<style scoped lang="scss">
@use "../assets/vars" as *;
.area-highlight {
  cursor: pointer;
  border: $highlight-selection-outer-border;

  .area-highlight__inner {
    @include mix-fullscreen;
    background: rgba($highlight-color, $highlight-selection-background-opacity);
    border: $highlight-selection-border-width solid $highlight-color;
    mix-blend-mode: multiply;
  }

  &.highlight--scrolled-to {
    .area-highlight__inner {
      border-color: $highlight-active-color;
      background: rgba($highlight-active-color, $highlight-selection-background-opacity);
    }
  }
}
</style>
