<template>
  <div id="app">
    <PdfHighlighter
      ref="pdfRef"
      url="/demo3.pdf"
      c-map-url="/cmaps/"
      renderer="canvas"
      :highlights="highlights"
      :enable-area-selection="event => event.altKey"
      @add-highlight="onAddHighlight"
      @remove-highlight="onRemoveHighlight"
      @update-highlight="onUpdateHighlight"
      @loaded="onLoaded"
      @error="onError"
    />
    <div class="toolbar">
      <button @click="toggleSlide">侧边栏</button>
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PdfHighlighter from '../src/index'
import type { Highlight, ScaledPosition, ScaledRect } from '../src/types'

const pdfRef = ref<InstanceType<typeof PdfHighlighter> | null>(null)

const highlights = ref<Highlight[]>([])
let nextId = 1

const onAddHighlight = ({
  content,
  position,
  comment
}: {
  content: Highlight['content']
  position: ScaledPosition
  comment: Highlight['comment']
}) => {
  highlights.value = [
    ...highlights.value,
    {
      id: nextId++,
      content,
      position,
      comment
    }
  ]
}

const onRemoveHighlight = (highlight: Highlight) => {
  highlights.value = highlights.value.filter(item => item.id !== highlight.id)
}

const onUpdateHighlight = (
  id: string | number,
  position: { boundingRect: ScaledRect }
) => {
  highlights.value = highlights.value.map(item =>
    item.id === id
      ? {
          ...item,
          position: { ...item.position, boundingRect: position.boundingRect }
        }
      : item
  )
}

const toggleSlide = () => pdfRef.value?.handleCommand('toggleSlide')
const zoomIn = () => pdfRef.value?.handleCommand('zoomIn')
const zoomOut = () => pdfRef.value?.handleCommand('zoomOut')

const onLoaded = (payload: { page: { total: number } }) => {
  console.log('[demo] pdf loaded, total pages:', payload.page.total)
}

const onError = (error: unknown) => {
  console.error('[demo] pdf error:', error)
}
</script>

<style lang="scss">
html,
body,
#app {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.toolbar {
  position: absolute;
  z-index: 100;
  left: 300px;
  top: 12px;
  display: flex;
  gap: 8px;
}
</style>
