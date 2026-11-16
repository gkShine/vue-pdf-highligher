<template>
  <div ref="rootRef" class="scrolling-document" v-scroll.immediate="updateScrollBounds">
    <ScrollingPage
      v-for="page in pages"
      :key="page.ref.objectNumber"
      :page="page"
      :client-height="clientHeight"
      :scroll-top="scrollTop"
      :focused-page="focusedPage"
      :enable-page-jump="enablePageJump"
      v-slot="{ isPageFocused, isElementFocused }"
      @page-jump="onPageJump"
    >
      <slot :page="page" :is-page-focused="isPageFocused" :is-element-focused="isElementFocused" />
    </ScrollingPage>

    <div v-visible="fetchPages" class="observer"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { PageInfo } from '@embedpdf/vue/runtime'
import vScroll from '../directives/scroll'
import vVisible from '../directives/visible'
import ScrollingPage from './ScrollingPage.vue'

const props = withDefaults(
  defineProps<{
    pages: readonly PageInfo[]
    enablePageJump?: boolean
    currentPage?: number
    isParentVisible?: boolean
  }>(),
  {
    enablePageJump: false,
    currentPage: 1,
    isParentVisible: true
  }
)

const emit = defineEmits<{
  'pages-fetch': [currentPage?: number]
  'pages-reset': []
  'page-jump': [scrollTop: number]
}>()

const rootRef = ref<HTMLElement | null>(null)

const focusedPage = ref<number | undefined>(undefined)
const scrollTop = ref(0)
const clientHeight = ref(0)

const pagesLength = computed(() => props.pages.length)

const fetchPages = (currentPage?: number) => {
  emit('pages-fetch', currentPage)
}

const onPageJump = (top: number) => {
  emit('page-jump', top)
}

const updateScrollBounds = () => {
  const el = rootRef.value
  if (!el) return
  scrollTop.value = el.scrollTop
  clientHeight.value = el.clientHeight
}

watch(
  () => props.isParentVisible,
  () => updateScrollBounds()
)

watch(pagesLength, (_count, oldCount) => {
  if (oldCount === 0) {
    emit('pages-reset')
  }

  // 新页面挂载后再设置聚焦页
  nextTick(() => {
    focusedPage.value = props.currentPage
  })
})

watch(
  () => props.currentPage,
  currentPage => {
    if (currentPage > props.pages.length) {
      fetchPages(currentPage)
    } else {
      focusedPage.value = currentPage
    }
  }
)

onMounted(() => {
  updateScrollBounds()
})
</script>
