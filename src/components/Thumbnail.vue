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
import { useRender } from '@embedpdf/vue/render'
import type { PageInfo } from '@embedpdf/vue/runtime'
import vVisible from '../directives/visible'

const props = defineProps<{
  /** EmbedPDF 页面布局信息（usePageList 返回项） */
  page: PageInfo
  scale: number
  isPageFocused?: boolean
}>()

const emit = defineEmits<{
  'page-focus': [pageNumber: number]
  'thumbnail-rendered': [payload: { page: PageInfo; text: string }]
  'thumbnail-errored': [payload: { response: unknown; page: PageInfo; text: string }]
}>()

const render = useRender()

const src = ref<string | undefined>(undefined)

let rendering = false
let disposed = false
let revokeUrl: (() => void) | null = null

const pageNumber = computed(() => props.page.index + 1)

const focusPage = () => {
  emit('page-focus', pageNumber.value)
}

const drawPage = async () => {
  if (rendering || disposed) return
  rendering = true

  try {
    const image = await render.renderPage(props.page.index, { scale: 0.4 })
    const objectUrl = await image.objectUrl()

    if (disposed) {
      objectUrl.revoke()
      return
    }

    revokeUrl?.()
    revokeUrl = objectUrl.revoke
    src.value = objectUrl.url

    emit('thumbnail-rendered', {
      page: props.page,
      text: `Rendered thumbnail ${pageNumber.value}`
    })
  } catch (response: unknown) {
    if (!disposed) {
      emit('thumbnail-errored', {
        response,
        page: props.page,
        text: `Failed to render thumbnail ${pageNumber.value}`
      })
    }
  } finally {
    rendering = false
  }
}

onBeforeUnmount(() => {
  disposed = true
  revokeUrl?.()
  revokeUrl = null
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