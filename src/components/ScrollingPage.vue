<template>
  <div ref="rootRef" class="scrolling-page">
    <slot :is-page-focused="isPageFocused" :is-element-focused="isElementFocused" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PageInfo } from '@embedpdf/vue/runtime'

const props = defineProps<{
  /** EmbedPDF 页面布局信息（usePageList 返回项） */
  page: PageInfo
  focusedPage?: number
  scrollTop?: number
  clientHeight?: number
  enablePageJump?: boolean
}>()

const emit = defineEmits<{
  pageJump: [scrollTop: number]
}>()

const rootRef = ref<HTMLElement | null>(null)

const elementTop = ref(0)
const elementHeight = ref(0)

let resizeObserver: ResizeObserver | null = null

const isPageFocused = computed(() => props.page.index + 1 === props.focusedPage)

const bottom = computed(() => elementTop.value + elementHeight.value)

const isElementFocused = computed(() => {
  const { clientHeight = 0, scrollTop = 0 } = props
  const height = elementHeight.value
  const top = elementTop.value
  const elementBottom = bottom.value

  if (!height) return false

  const halfHeight = height / 2
  const halfScreen = clientHeight / 2
  const delta = height >= halfScreen ? halfScreen : halfHeight
  const threshold = scrollTop + delta

  return top < threshold && elementBottom >= threshold
})

const jumpToPage = () => {
  if (!props.enablePageJump || isElementFocused.value || !isPageFocused.value) return

  emit('pageJump', elementTop.value)
}

const updateElementBounds = () => {
  const el = rootRef.value
  if (!el) return

  elementTop.value = el.offsetTop
  elementHeight.value = el.offsetHeight
}

watch(() => props.scrollTop, updateElementBounds)
watch(() => props.clientHeight, updateElementBounds)
watch(isPageFocused, jumpToPage)

onMounted(() => {
  updateElementBounds()
  resizeObserver = new ResizeObserver(updateElementBounds)
  if (rootRef.value) {
    resizeObserver.observe(rootRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>
