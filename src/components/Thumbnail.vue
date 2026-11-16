<template>
  <div
    v-visible.once="drawPage"
    class="pdf-thumbnail"
    :class="{ focused: isPageFocused }"
    @click="focusPage"
  >
    <img v-if="src" :src="src" />
    <div v-else class="placeholder">Loading</div>
    <div class="pdf-thumbnail__page-label">
      <span>{{ pageNumber }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { PDFPageProxy, RenderTask } from 'pdfjs-dist'
import vVisible from '../directives/visible'

const props = defineProps<{
  /** pdf.getPage 返回的 PDFPageProxy */
  page: PDFPageProxy
  scale: number
  isPageFocused?: boolean
}>()

const emit = defineEmits<{
  'page-focus': [pageNumber: number]
  'thumbnail-rendered': [payload: { page: PDFPageProxy; text: string }]
  'thumbnail-errored': [payload: { response: unknown; page: PDFPageProxy; text: string }]
}>()

const src = ref<string | undefined>(undefined)

let renderTask: RenderTask | null = null

const viewport = computed(() => props.page.getViewport({ scale: 0.4 }))

const pageNumber = computed(() => props.page.pageNumber)

const focusPage = () => {
  emit('page-focus', pageNumber.value)
}

const destroyRenderTask = () => {
  if (!renderTask) return

  renderTask.cancel()
  renderTask = null
}

const drawPage = () => {
  if (renderTask) return

  const pageViewport = viewport.value
  const canvas = document.createElement('canvas')
  canvas.height = pageViewport.height
  canvas.width = pageViewport.width

  renderTask = props.page.render({ canvas, viewport: pageViewport })

  renderTask.promise
    .then(() => {
      src.value = canvas.toDataURL()

      // 宽高置零可促使 Firefox 立即释放图形资源，显著降低内存占用
      canvas.width = 0
      canvas.height = 0
    })
    .then(() => {
      emit('thumbnail-rendered', {
        page: props.page,
        text: `Rendered thumbnail ${pageNumber.value}`
      })
    })
    .catch((response: unknown) => {
      destroyRenderTask()
      emit('thumbnail-errored', {
        response,
        page: props.page,
        text: `Failed to render thumbnail ${pageNumber.value}`
      })
    })
}

onBeforeUnmount(() => {
  destroyRenderTask()
})
</script>

<style scoped lang="scss">
.pdf-thumbnail {
  cursor: pointer;
  position: relative;
  margin: 24px auto;

  &.focused {

    img {
      border-color: rgb(0, 98, 250);
      outline-color: rgb(0, 98, 250);
    }

    .pdf-thumbnail__page-label {
      span {
        color: #fff;
        background-color: rgb(0, 98, 250);
      }
    }
  }

  img,
  .placeholder {
    outline: 3px solid transparent;
    display: block;
    border-radius: 8px;
    border: 1px solid #e3e3e3;
    margin: auto;
  }

  .placeholder {
    height: 168px;
    width: 134px;
    color: #bbb;
    background: white;
    position: relative;
    padding-top: 30%;
    text-align: center;
    box-sizing: border-box;
  }

  img {
    max-height: 168px;
    max-width: 168px;
  }

  .pdf-thumbnail__page-label {
    position: absolute;
    bottom: 6px;
    left: 0;
    right: 0;
    text-align: center;

    span {
      font-size: 12px;
      color: #000;
      display: inline-block;
      border: 8px;
      background: #f5f6f7;
      border-radius: 12px;
      min-width: 36px;
      text-align: center;
    }
  }
}
</style>
