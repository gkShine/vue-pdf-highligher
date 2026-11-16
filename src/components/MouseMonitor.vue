<template>
  <div ref="rootRef">
    <div v-if="comment && comment.text" class="highlight__popup" :class="{ 'with-ops': editable }">
      <div class="content">{{ comment.emoji }} {{ comment.text }}</div>
      <div v-if="editable" class="ops">
        <a @click="emit('delete')">{{ i18n.t('delete') }}</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import i18n from '../lib/i18n'
import type { HighlightComment } from '../types'

const props = defineProps<{
  paddingX?: number
  paddingY?: number
  comment?: HighlightComment
  editable?: boolean
}>()

const emit = defineEmits<{
  mouseAway: []
  delete: []
}>()

const rootRef = ref<HTMLElement | null>(null)

const handleMouseMove = (event: MouseEvent) => {
  const el = rootRef.value
  if (!el) return

  const paddingX = props.paddingX ?? 0
  const paddingY = props.paddingY ?? 0

  const { clientX, clientY } = event
  const { left, top, width, height } = el.getBoundingClientRect()

  const inBoundsX =
    clientX > left - paddingX && clientX < left + width + paddingX
  const inBoundsY =
    clientY > top - paddingY && clientY < top + height + paddingY

  const isNear = inBoundsX && inBoundsY

  if (!isNear) {
    emit('mouseAway')
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped lang="scss">
@use "../assets/vars" as *;
.highlight__popup {
  background-color: $highlight-content-background-color;
  color: #ffffff;
  opacity: 0.9;
  font-size: 14px;
  padding: 10px 10px;
  border-radius: 4px;
  max-width: 300px;

  .content {
    max-height: 100px;
    overflow: auto;
  }

  &.with-ops {
    padding-bottom: 0;
  }

  .ops {
    text-align: center;

    a {
      color: rgba($highlight-active-color, .9);
      cursor: pointer;
      padding: 8px 0;
      width: 100%;
      display: block;

      &:hover {
        color: $highlight-active-color;
      }
    }
  }
}
</style>
