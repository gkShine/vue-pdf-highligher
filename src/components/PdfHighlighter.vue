<template>
  <div ref="rootRef" class="pdf-highlighter-root" :class="{ 'sidebar-open': visibleSlide }" @mousedown="onMouseDown">
    <Viewer
      :engine="engine"
      :plugins="plugins"
      :initial-documents="initialDocuments"
      :fetch="hostFetch"
      :page="{ background: '#ffffff', shadow: 'none' }"
    >
      <DocumentStatus
        :url="url"
        :password="password"
        @error="onDocumentError"
      />

      <DocumentGate>
        <template #fallback>
          <div class="pdf-highlighter__status">Loading…</div>
        </template>
        <template #locked="{ document }">
          <div class="pdf-highlighter__status">
            {{ document.passwordProvided || passwordAttempted || password ? '密码错误，请重试' : '该文档需要密码才能打开' }}
          </div>
        </template>
        <template #error="{ document }">
          <div class="pdf-highlighter__status">
            文档加载失败{{ document.error?.message ? `：${document.error.message}` : '' }}
          </div>
        </template>

        <PdfHighlighterCore
          ref="coreRef"
          :highlights="highlights"
          :is-active="isActive"
          :editable="editable"
          :read-only="readOnly"
          :enable-area-selection="enableAreaSelection"
          :scroll-margin="scrollMargin"
          :visible-slide="visibleSlide"
          @loaded="payload => emit('loaded', payload)"
          @change="payload => emit('change', payload)"
          @scroll="emit('scroll')"
          @add-highlight="payload => emit('add-highlight', payload)"
          @update-highlight="(id, position, content) => emit('update-highlight', id, position, content)"
          @remove-highlight="highlight => emit('remove-highlight', highlight)"
          @select-highlight="highlight => emit('select-highlight', highlight)"
        />
      </DocumentGate>
    </Viewer>

    <div class="hint" :style="{ opacity: hintOpacity }">
      <div class="hint-container">{{ i18n.t('hint-message') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { DocumentGate, Viewer } from '@embedpdf/vue/runtime'
import type { HostFetch, InitialDocument } from '@embedpdf/vue/runtime'

import { engine, plugins } from '../lib/embedpdf'
import i18n from '../lib/i18n'
import type { PdfViewerHandle } from '../lib/viewer-handle'

import DocumentStatus from './DocumentStatus.vue'
import PdfHighlighterCore from './PdfHighlighterCore.vue'

import type {
  Highlight,
  HighlightComment,
  HighlightContent,
  ScaledPosition,
  ScaledRect
} from '../types'

const props = withDefaults(
  defineProps<{
    url?: string
    password?: string
    /** 如何启用框选批注（返回 true 时按下鼠标开始框选） */
    enableAreaSelection?: (event: MouseEvent) => boolean
    highlights?: Highlight[]
    /** 是否激活 */
    isActive?: boolean
    /** 允许更新高亮 */
    editable?: boolean
    /** 只读模式: 只初始化 pdf 预览，不提供批注交互 */
    readOnly?: boolean
    /**
     * 渲染方式。EmbedPDF 统一使用 PDFium 光栅渲染，
     * 保留该属性仅为向后兼容。
     */
    renderer?: 'canvas' | 'svg'
    lang?: Record<string, string>
    scrollMargin?: number
    withCredentials?: boolean
  }>(),
  {
    highlights: () => [],
    isActive: true,
    editable: true,
    readOnly: false,
    renderer: 'canvas',
    withCredentials: false
  }
)

const emit = defineEmits<{
  loaded: [payload: { viewer: PdfViewerHandle; page: { current: number; total: number } }]
  change: [payload: { viewer: PdfViewerHandle; page: { current: number; total: number } }]
  scroll: []
  'add-highlight': [payload: { content: HighlightContent; position: ScaledPosition; comment: HighlightComment }]
  'update-highlight': [
    id: string | number,
    position: { boundingRect: ScaledRect },
    content: { image: string }
  ]
  'remove-highlight': [highlight: Highlight]
  'select-highlight': [highlight: Highlight]
  error: [error: unknown, retry: (password?: string) => void]
}>()

const rootRef = ref<HTMLElement | null>(null)
const coreRef = ref<InstanceType<typeof PdfHighlighterCore> | null>(null)

const hintOpacity = ref(0)
const visibleSlide = ref(false)

let isPresentationMode = false
let hintTimer: ReturnType<typeof setTimeout> | null = null

i18n.set(props.lang)

const initialDocuments = computed<InitialDocument[]>(() =>
  props.url
    ? [{ source: { kind: 'url', url: props.url }, password: props.password }]
    : []
)

const hostFetch: HostFetch = (url, init) =>
  fetch(url, {
    signal: init.signal,
    credentials: props.withCredentials ? 'include' : 'same-origin'
  })

// localEngine 不上报 passwordProvided，自行记录是否尝试过密码以区分提示文案
const passwordAttempted = ref(false)

watch(
  () => props.url,
  () => {
    passwordAttempted.value = false
  }
)

const onDocumentError = (error: unknown, retry: (password?: string) => void) => {
  if ((error as Error)?.name === 'PasswordException') {
    emit('error', error, (pwd?: string) => {
      if (pwd !== undefined || props.password) passwordAttempted.value = true
      retry(pwd)
    })
  } else {
    emit('error', error, retry)
  }
}

const handleCommand = (command: string, factor = 1.1) => {
  switch (command) {
    case 'toggleSlide':
      visibleSlide.value = !visibleSlide.value
      break
    case 'zoomIn':
    case 'zoomOut':
      coreRef.value?.handleCommand(command, factor)
      break
    case 'presentationMode':
      if (isPresentationMode) {
        void document.exitFullscreen()
        isPresentationMode = false
      } else if (rootRef.value && 'requestFullscreen' in rootRef.value) {
        void rootRef.value.requestFullscreen()
        isPresentationMode = true
      }
      break
  }
}

const scrollTo = (highlight: Highlight) => {
  coreRef.value?.scrollTo(highlight)
}

const onMouseDown = (event: MouseEvent) => {
  if (!(event.target instanceof HTMLElement)) {
    return
  }

  if (event.target.closest('.pdf-highlighter__tip-container')) {
    return
  }

  coreRef.value?.hideTipAndSelection()
}

watch(
  () => props.isActive,
  (val, oldVal) => {
    if (!oldVal && val) {
      hintOpacity.value = 0.9
      if (hintTimer) clearTimeout(hintTimer)
      hintTimer = setTimeout(() => {
        hintOpacity.value = 0
      }, 2500)
    }
  }
)

onBeforeUnmount(() => {
  if (hintTimer) {
    clearTimeout(hintTimer)
    hintTimer = null
  }
})

defineExpose({
  handleCommand,
  scrollTo
})
</script>

<style lang="scss" src="../assets/style.scss" />
<style scoped lang="scss">
.hint {
  transition-property: opacity;
  transition-duration: .5s;
  transition-delay: unset;
  white-space: nowrap;
  position: absolute;
  pointer-events: none;
  top: 80px;
  width: 100%;
  text-align: center;
  opacity: 0;
  z-index: 7;

  .hint-container {
    width: 200px;
    margin: 0 auto;
    line-height: normal;
    font-size: 14px;
    color: #fff;
    background-color: #243247;
    padding: 5px 10px;
    border-radius: 5px;
  }
}
</style>