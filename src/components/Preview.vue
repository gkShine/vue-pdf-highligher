<template>
  <div class="pdf-preview">
    <div class="pdf-preview__wrapper">
      <!-- Tab Bar -->
      <div class="pdf-preview__tabs">
        <button
          class="pdf-preview__tab"
          :class="{ 'pdf-preview__tab--active': activeView === 'thumbnails' }"
          @click="switchView('thumbnails')"
        >{{ i18n.t('thumbnail-tab') }}</button>
        <button
          class="pdf-preview__tab"
          :class="{ 'pdf-preview__tab--active': activeView === 'outline' }"
          @click="switchView('outline')"
        >{{ i18n.t('bookmark-tab') }}</button>
      </div>

      <!-- Content Area -->
      <div class="pdf-preview__content">
        <!-- Thumbnails View -->
        <div v-show="activeView === 'thumbnails'" class="pdf-preview__thumbnails-view">
          <ScrollingDocument
            :pages="pages"
            :current-page="currentPage"
            :is-parent-visible="isPreviewEnabled"
            @pages-fetch="onPagesFetch"
            v-slot="{ page, isPageFocused }"
          >
            <Thumbnail
              v-bind="{ scale, page, isPageFocused }"
              @thumbnail-rendered="onThumbnailRendered"
              @thumbnail-errored="onThumbnailErrored"
              @page-focus="onPageFocused"
            />
          </ScrollingDocument>
        </div>

        <!-- Outline View -->
        <div v-show="activeView === 'outline'" class="pdf-preview__outline-view">
          <Outline
            v-if="activeView === 'outline'"
            :current-page="currentPage"
            @page-focus="onPageFocused"
          />
        </div>
      </div>

      <!-- Page Navigation Bar -->
      <div class="pdf-preview__page-nav">
        <button class="pdf-preview__nav-btn" :disabled="currentPage <= 1" @click="goPrevPage">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M11 2L5 8l6 6V2z"/>
          </svg>
        </button>
        <input
          v-model="jumpPageInput"
          class="pdf-preview__page-input"
          type="text"
          @keyup.enter="onPageJumpSubmit"
          @blur="onPageJumpSubmit"
        />
        <span class="pdf-preview__page-total">/ {{ resolvedPageCount }}</span>
        <button class="pdf-preview__nav-btn" :disabled="currentPage >= resolvedPageCount" @click="goNextPage">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M5 2l6 6-6 6V2z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePageList } from '@embedpdf/vue/runtime'
import type { PageInfo } from '@embedpdf/vue/runtime'
import i18n from '../lib/i18n'
import ScrollingDocument from './ScrollingDocument.vue'
import Thumbnail from './Thumbnail.vue'
import Outline from './Outline.vue'

const props = withDefaults(
  defineProps<{
    scale?: number
    currentPage?: number
    pageCount?: number
    isPreviewEnabled?: boolean
  }>(),
  {
    scale: 1.0,
    currentPage: 1,
    pageCount: 0,
    isPreviewEnabled: false
  }
)

const emit = defineEmits<{
  'page-focus': [pageNumber: number]
  'pages-fetch': [currentPage?: number]
  'thumbnail-rendered': [payload: { page: PageInfo; text: string }]
  'thumbnail-errored': [payload: { response: unknown; page: PageInfo; text: string }]
}>()

const pageList = usePageList()
const pages = computed(() => pageList.value)

const activeView = ref<'thumbnails' | 'outline'>('thumbnails')
const jumpPageInput = ref<number | string>(props.currentPage || 1)

const resolvedPageCount = computed(() => props.pageCount || pageList.value.length)

watch(
  () => props.currentPage,
  val => {
    jumpPageInput.value = val
  }
)

const switchView = (view: 'thumbnails' | 'outline') => {
  activeView.value = view
}

const onPagesFetch = (currentPage?: number) => {
  emit('pages-fetch', currentPage)
}

const onPageFocused = (pageNumber: number) => {
  emit('page-focus', pageNumber)
}

const onThumbnailRendered = (payload: { page: PageInfo; text: string }) => {
  emit('thumbnail-rendered', payload)
}

const onThumbnailErrored = (payload: { response: unknown; page: PageInfo; text: string }) => {
  emit('thumbnail-errored', payload)
}

const onPageJumpSubmit = () => {
  const page = parseInt(String(jumpPageInput.value), 10)
  if (isNaN(page) || page < 1 || page > resolvedPageCount.value) {
    jumpPageInput.value = props.currentPage
    return
  }
  emit('page-focus', page)
  jumpPageInput.value = page
}

const goPrevPage = () => {
  if (props.currentPage > 1) {
    emit('page-focus', props.currentPage - 1)
  }
}

const goNextPage = () => {
  if (props.currentPage < resolvedPageCount.value) {
    emit('page-focus', props.currentPage + 1)
  }
}
</script>

<style scoped lang="scss">
@use "../assets/vars" as *;

.pdf-preview {
  position: absolute;
  overflow: hidden;
  z-index: 1;
  top: 0;
  left: 0;
  bottom: 0;
  width: $highlight-sidebar-width;
  background: #F5F6F7;
  padding: 8px 8px 8px 2px;
}

.pdf-preview__wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 0 4px 6px rgba(0, 0, 0, 0.0125);
}

.pdf-preview__tabs {
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 6px 6px 0 0;
}

.pdf-preview__tab {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: none;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;

  &--active {
    color: #4A90D9;
    border-bottom-color: #4A90D9;
    font-weight: 500;
  }

  &:hover:not(.pdf-preview__tab--active) {
    color: rgba(0, 0, 0, 0.75);
  }
}

.pdf-preview__content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  background-color: #fafafa;
}

.pdf-preview__page-nav {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  gap: 4px;
  background: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 0 0 6px 6px;
}

.pdf-preview__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.8);
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  padding: 0;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}

.pdf-preview__page-input {
  width: 36px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  font-size: 12px;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.9);
  color: rgba(0, 0, 0, 0.85);
}

.pdf-preview__page-total {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  margin-left: 2px;
}

@media print {
  .pdf-preview {
    display: none;
  }
}
</style>