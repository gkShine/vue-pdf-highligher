<template>
  <div class="highlight" :class="{ 'highlight--scrolled-to': isScrolledTo }">
    <div
      v-if="comment"
      class="highlight__emoji"
      :style="formatStyle({ left: 20, top: position.boundingRect.top })"
    >
      {{ comment.emoji }}
    </div>
    <div class="highlight__parts">
      <div
        v-for="(rect, index) in position.rects"
        :key="index"
        class="highlight__part"
        :class="{ 'is-ghost': isGhost }"
        :style="formatStyle(rect)"
        @mouseover="emit('mouseover', $event)"
        @mouseout="emit('mouseout', $event)"
        @click="emit('click', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HighlightComment, ViewportPosition, ViewportRect } from '../types'

defineProps<{
  isGhost?: boolean
  isScrolledTo?: boolean
  position: ViewportPosition
  comment?: HighlightComment
}>()

const emit = defineEmits<{
  mouseover: [event: MouseEvent]
  mouseout: [event: MouseEvent]
  click: [event: MouseEvent]
}>()

const formatStyle = (style: Partial<ViewportRect>) => {
  const result: Record<string, string> = {}
  for (const key in style) {
    result[key] = `${style[key as keyof ViewportRect]}px`
  }
  return result
}
</script>

<style scoped lang="scss">
@use "../assets/vars" as *;
.highlight {
  position: absolute;

  .highlight__emoji {
    position: absolute;
    color: black;
    opacity: 1;
    font-size: 28px;
  }

  .highlight__parts {
    opacity: 1;

    .highlight__part {
      cursor: pointer;
      position: absolute;
      border-bottom: 2px solid $highlight-color;
      transition: background 0.3s;

      &.is-ghost {
        background: $highlight-selection-color;
        border-bottom: 0;
      }
    }
  }

  &.highlight--scrolled-to .highlight__part {
    background: $highlight-active-color;
    border-bottom-color: $highlight-active-color;
  }

  &:hover {
    .highlight__parts {
      .highlight__part {
        background: $highlight-color;
      }
    }

    &.highlight--scrolled-to .highlight__part {
      background: $highlight-active-color;
    }
  }
}
</style>
